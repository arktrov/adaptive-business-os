import {assertSafe,validateResearch,validateFactGuard,metadata} from '../domain/research.js';
import {requireProvider} from '../providers/ports.js';
export class ResearchService {
 constructor({repository,researchProvider,factGuardProvider,prompts,policy}){Object.assign(this,{repository,researchProvider:requireProvider(researchProvider),factGuardProvider:requireProvider(factGuardProvider),prompts,policy})}
 async runPipeline(command){
  const research=await this.run({...command,operation:'research',idempotency_key:command.idempotency_key+':research'});
  if(research.status!=='SUCCEEDED'||research.output.research_status!=='COMPLETE')return {research,factGuard:null};
  const factGuard=await this.run({...command,operation:'fact_guard',idempotency_key:command.idempotency_key+':fact-guard',input:{research_run_id:research.run_id}});
  return {research,factGuard};
 }
 async run({business_id,content_job_id,operation,idempotency_key,input,retry=false}){
  if(!['research','fact_guard'].includes(operation)||typeof idempotency_key!=='string'||!idempotency_key.trim())throw Error('INVALID_OPERATION');
  assertSafe(input);
  return this.repository.withJobLock(business_id,content_job_id,async()=>{
   const job=await this.repository.job(business_id,content_job_id);
   let canonicalInput;
   if(operation==='research'){
    if(typeof input.topic!=='string'||!input.topic.trim())throw Error('RESEARCH_INPUT_REQUIRED');
    canonicalInput={...input,topic:input.topic.normalize('NFC').trim()};
   }else{
    const r=await this.repository.getResearch(business_id,content_job_id,input.research_run_id);
    if(r.output.research_status!=='COMPLETE')throw Error('RESEARCH_NOT_COMPLETE');
    canonicalInput={research_run_id:r.run_id,research_output_hash:r.output_hash,research:r.output,guardrails:this.policy.guardrails};
   }
   const provider=operation==='research'?this.researchProvider:this.factGuardProvider;
   const request={business_id,content_job_id,operation,input:canonicalInput,workflow_version:job.workflow_version,prompt:this.prompts[operation],policy:this.policy,provider:provider.describe()};
   assertSafe(request);
   const run=await this.repository.begin(business_id,content_job_id,operation,idempotency_key,request,retry);
   if(run.reuse)return this.repository.result(business_id,content_job_id,run.run_id);
   const start=Date.now();let output=null,meta={synthetic:null},error,response;
   try{response=await provider.execute(structuredClone(request),{attempt:run.attempt,run_id:run.run_id})}
   catch{error='PROVIDER_FAILURE'}
   if(!error)try{
    meta=metadata(response?.metadata);
    output=operation==='research'?validateResearch(response?.output):validateFactGuard(response?.output,canonicalInput.research);
   }catch(e){error=e.message==='UNSAFE_PAYLOAD'?'UNSAFE_PAYLOAD':'PARSING_FAILURE';output=null}
   meta={...meta,duration_ms:Date.now()-start,retry_count:run.attempt-1};
   try{await this.repository.finish(business_id,content_job_id,operation,run,request,output,meta,error)}
   catch(e){
    // Evidence and state rolled back together. Persist only a sanitized failure.
    if(!error)await this.repository.finish(business_id,content_job_id,operation,run,request,null,{duration_ms:Date.now()-start,retry_count:run.attempt-1,synthetic:null},'PERSISTENCE_FAILURE');
    else throw Error('PERSISTENCE_FAILURE');
   }
   return this.repository.result(business_id,content_job_id,run.run_id);
  });
 }
}
