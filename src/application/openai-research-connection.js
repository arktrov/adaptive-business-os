import {assertSafe,canonical,hash} from '../domain/research.js';
import {ResearchRepository} from '../research-postgres.js';
import {ResearchService} from './research-service.js';
import {researchPrompt} from '../config/research.js';
import {openAIResearchConfig} from '../config/openai-research.js';
import {OpenAIResearchProvider} from '../providers/openai-research.js';

// Read-only preparation: never inserts attempts, changes state or contacts OpenAI.
export async function prepareSingleOpenAIResearch({store,business_id,content_job_id,config=openAIResearchConfig()}){
 const detail=await store.getJob(content_job_id,business_id);
 if(!detail)throw Error('JOB_NOT_FOUND');
 if(detail.job.current_state!=='RESEARCH_PENDING')throw Error('RESEARCH_PENDING_REQUIRED');
 if(detail.job.content_item_id?.startsWith('synthetic:'))throw Error('REAL_CONTENT_JOB_REQUIRED');
 const inputs=detail.evidence.filter(e=>e.evidence_type==='confirmed_research_input');
 if(inputs.length!==1)throw Error('UNAMBIGUOUS_CONFIRMED_INPUT_REQUIRED');
 const evidence=inputs[0],input=evidence.payload?.input;
 assertSafe(input);
 if(evidence.content_hash!==hash(input)||evidence.payload.canonical_input_hash!==hash(input)||evidence.payload.canonical_input_representation!==canonical(input))throw Error('CONFIRMED_INPUT_HASH_MISMATCH');
 if(input.business_id!==business_id||input.content_job_id!==content_job_id||input.workflow_version!==detail.job.workflow_version||input.content_format!==detail.job.format)throw Error('CONFIRMED_INPUT_SCOPE_MISMATCH');
 if(input.research_policy_content_hash!==hash(input.research_policy_snapshot)||input.research_policy_version!==input.research_policy_snapshot.version||input.research_policy_reference!==input.research_policy_snapshot.id)throw Error('CONFIRMED_POLICY_MISMATCH');
 if(detail.research.some(r=>r.provider==='openai'))throw Error('SINGLE_LIVE_ATTEMPT_ALREADY_EXISTS');
 const provider=new OpenAIResearchProvider({config});
 const request={business_id,content_job_id,operation:'research',input:{...input,topic:input.topic.normalize('NFC').trim()},workflow_version:detail.job.workflow_version,prompt:researchPrompt,policy:input.research_policy_snapshot,provider:provider.describe()};
 assertSafe(request);
 return {business_id,content_job_id,idempotency_key:'openai-research:'+evidence.evidence_id+':single-v1',confirmed_input_hash:hash(input),canonical_input_hash:hash(request),prompt_version:request.prompt.version,workflow_version:request.workflow_version,policy_version:request.policy.version,provider:request.provider,credential_present:provider.credentialPresent(),request};
}

// Deliberately not wired to HTTP/UI or a startup hook. A future owner-authorized
// invocation must confirm the exact freshly prepared hash. There is no Fact Guard.
export async function runSinglePreparedResearch({store,business_id,content_job_id,approved_request_hash,config=openAIResearchConfig()}){
 const prepared=await prepareSingleOpenAIResearch({store,business_id,content_job_id,config});
 if(!prepared.credential_present)throw Error('OPENAI_API_KEY_MISSING');
 if(!approved_request_hash||approved_request_hash!==prepared.canonical_input_hash)throw Error('EXPLICIT_LIVE_APPROVAL_REQUIRED');
 const provider=new OpenAIResearchProvider({config,authorizeDispatch:async(request,context)=>{
  if(hash(request)!==approved_request_hash)throw Error('INPUT_CHANGED_AFTER_APPROVAL');
  const d=await store.getJob(content_job_id,business_id);
  const attempts=d?.research.filter(r=>r.provider==='openai')??[];
  const run=attempts[0];
  if(attempts.length!==1||run.run_id!==context.run_id||run.attempt!==1||run.status!=='RUNNING'||d.job.current_state!=='RESEARCH_RUNNING'||run.idempotency_key!==prepared.idempotency_key||run.canonical_input_hash!==approved_request_hash)throw Error('SINGLE_LIVE_ATTEMPT_GUARD');
  return {run_id:run.run_id,idempotency_key:run.idempotency_key,canonical_input_hash:run.canonical_input_hash,business_id,content_job_id,prompt_version:run.prompt_version,policy_version:run.policy_version,workflow_version:run.workflow_version,provider_config_hash:hash(run.request.provider)};
 }});
 const disabledFactGuard={describe:()=>({provider:'disabled',model:'none',adapter_version:'1',configuration:{}}),execute:async()=>{throw Error('FACT_GUARD_NOT_AUTHORIZED')}};
 const service=new ResearchService({repository:new ResearchRepository(store),researchProvider:provider,factGuardProvider:disabledFactGuard,prompts:{research:prepared.request.prompt},policy:prepared.request.policy});
 return service.run({business_id,content_job_id,operation:'research',idempotency_key:prepared.idempotency_key,input:prepared.request.input,retry:false});
}
