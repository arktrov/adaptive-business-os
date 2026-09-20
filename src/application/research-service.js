import {validateScopeBinding} from '../domain/content-scope.js';
import {providerFailure} from '../providers/failure.js';
import {assertSafe,hash,validateResearch,validateFactGuard,metadata} from '../domain/research.js';
import {requireProvider} from '../providers/ports.js';
export class ResearchService {
 constructor({repository,researchProvider,factGuardProvider,prompts,policy}){Object.assign(this,{repository,researchProvider:requireProvider(researchProvider),factGuardProvider:requireProvider(factGuardProvider),prompts,policy})}
 researchRevisionRequest(job,input){
  assertSafe(input);if(typeof input?.topic!=='string'||!input.topic.trim())throw Error('RESEARCH_INPUT_REQUIRED');
  const request={business_id:job.business_id,content_job_id:job.id,operation:'research',input:{...input,topic:input.topic.normalize('NFC').trim()},workflow_version:job.workflow_version,prompt:this.prompts.research,policy:this.policy,provider:this.researchProvider.describe()};assertSafe(request);return request;
 }
 async prepareResearchRunRevision({business_id,content_job_id,input,previous_run_id,reason,explicit_retry=false}){
  const job=await this.repository.job(business_id,content_job_id);
  const request=this.researchRevisionRequest(job,input);
  return {...await this.repository.prepareRevision(business_id,content_job_id,request,{previous_run_id,reason,explicit_retry}),request};
 }
 async retryResearchRunWithRevision({business_id,content_job_id,input,previous_run_id,reason,explicit_retry=false}){
  if(explicit_retry!==true)throw Error('EXPLICIT_REVISION_REQUIRED');
  return this.run({business_id,content_job_id,operation:'research',idempotency_key:'derived-by-revision-path',input,retry:true,revision:{previous_run_id,reason,explicit_retry}});
 }
 async runPipeline(command){
  const research=await this.run({...command,operation:'research',idempotency_key:command.idempotency_key+':research'});
  if(research.status!=='SUCCEEDED'||research.output.research_status!=='COMPLETE')return {research,factGuard:null};
  const factGuard=await this.run({...command,operation:'fact_guard',idempotency_key:command.idempotency_key+':fact-guard',input:{research_run_id:research.run_id}});
  return {research,factGuard};
 }
 async run({business_id,content_job_id,operation,idempotency_key,input,retry=false,revision=null}){
  if(!['research','fact_guard'].includes(operation)||typeof idempotency_key!=='string'||!idempotency_key.trim())throw Error('INVALID_OPERATION');
  assertSafe(input);
  return this.repository.withJobLock(business_id,content_job_id,async()=>{
   const job=await this.repository.job(business_id,content_job_id);
   let canonicalInput;
   if(operation==='research'){
    if(typeof input.topic!=='string'||!input.topic.trim())throw Error('RESEARCH_INPUT_REQUIRED');
    canonicalInput={...input,topic:input.topic.normalize('NFC').trim()};
   }else{
    const r=input.research_processing_revision_id?await this.repository.getRecoveredFactGuardInput(business_id,content_job_id,input.research_run_id,input.research_processing_revision_id,input.human_approval_evidence_id):await this.repository.getResearch(business_id,content_job_id,input.research_run_id);
    if(r.policy&&hash(r.policy)!==hash(this.policy))throw Error('RESEARCH_POLICY_MISMATCH');
    if(r.output.research_status!=='COMPLETE')throw Error('RESEARCH_NOT_COMPLETE');
    canonicalInput={research_run_id:r.run_id,research_output_hash:r.output_hash,research:r.output,guardrails:this.policy.guardrails,...(r.processing_revision_id?{research_processing_revision_id:r.processing_revision_id,human_review:r.human_review,policy_context:r.policy_context}:{})};
   }
   if(operation==='fact_guard'&&input.human_decision_id){const bound=await this.repository.getHumanReviewInput(business_id,content_job_id,input.human_decision_id,{run_id:canonicalInput.research_run_id,processing_revision_id:canonicalInput.research_processing_revision_id??null,output_hash:canonicalInput.research_output_hash});canonicalInput={...canonicalInput,...bound};}
   const provider=operation==='research'?this.researchProvider:this.factGuardProvider;
   const request={business_id,content_job_id,operation,input:canonicalInput,workflow_version:job.workflow_version,prompt:this.prompts[operation],policy:this.policy,provider:provider.describe()};
   assertSafe(request);
   const run=await this.repository.begin(business_id,content_job_id,operation,idempotency_key,request,retry,revision);
   if(run.reuse)return this.repository.result(business_id,content_job_id,run.run_id);
   const start=Date.now();let output=null,meta={synthetic:null},error,response;
   try{response=await provider.execute(structuredClone(request),{attempt:run.attempt,run_id:run.run_id,persistProviderResponse:artifact=>this.repository.captureProviderResponse(business_id,content_job_id,run.run_id,hash(request),artifact)})}
   catch(e){const failure=providerFailure(e);error=failure?.category??'PROVIDER_FAILURE';if(failure)meta=metadata(failure.metadata);else meta={synthetic:null,diagnostics:{parser_stage:'UNKNOWN_PROVIDER_EXCEPTION',exception_class:'Error',exception_message:'PROVIDER_FAILURE',attempt_number:run.attempt}}}
   if(!error)try{
    meta=metadata(response?.metadata);
    output=operation==='research'?validateResearch(response?.output):validateFactGuard(response?.output,canonicalInput.research);
    if(operation==='fact_guard'){if(output.downstream_scope)validateScopeBinding(output.downstream_scope,request,run.run_id);else if(meta.synthetic===false&&output.decision==='PASS')throw Error('SCOPE_REQUIRED');}
   }catch(e){error=e.message==='UNSAFE_PAYLOAD'?'UNSAFE_PAYLOAD':'PARSING_FAILURE';output=null;meta={...meta,diagnostics:{...meta.diagnostics,parser_stage:'CANONICAL_VALIDATION',validation_stage:'domain',exception_class:'ValidationError',exception_message:error,attempt_number:run.attempt}}}
   meta={...meta,duration_ms:Date.now()-start,retry_count:run.attempt-1};
   try{await this.repository.finish(business_id,content_job_id,operation,run,request,output,meta,error)}
   catch(e){
    // Evidence and state rolled back together. Persist only a sanitized failure.
    if(!error)await this.repository.finish(business_id,content_job_id,operation,run,request,null,{...meta,duration_ms:Date.now()-start,diagnostics:{...meta.diagnostics,parser_stage:['STALE_STATE_VERSION','INVALID_TRANSITION','PERSISTED_EVIDENCE_REQUIRED'].includes(e.message)?'J_STATE_TRANSITION':'I_PERSISTENCE',exception_class:'PersistenceError',exception_message:'PERSISTENCE_FAILURE',attempt_number:run.attempt}},'PERSISTENCE_FAILURE');
    else throw Error('PERSISTENCE_FAILURE');
   }
   return this.repository.result(business_id,content_job_id,run.run_id);
  });
 }
}
