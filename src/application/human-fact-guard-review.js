import {randomUUID} from 'node:crypto';
import {hash,assertSafe} from '../domain/research.js';
import {loadContentPolicies,verifyPolicySnapshot} from '../config/content-policies.js';
export class HumanFactGuardReview {
 constructor(repository,loadPolicies=loadContentPolicies){this.repository=repository;this.loadPolicies=loadPolicies}
 async record({business_id,content_job_id,fact_guard_run_id,decisions,publication_hold}){
  if(publication_hold!==true||!decisions||Object.values(decisions).some(v=>!['BLOCKED','CONTEXT_ONLY'].includes(v)))throw Error('INVALID_HUMAN_DECISION');
  const policies=await this.loadPolicies(business_id);for(const k of ['brand','quality'])verifyPolicySnapshot(policies[k],business_id,k);
  const store=this.repository.store;
  return this.repository.withJobLock(business_id,content_job_id,()=>store.transaction(async c=>{
   const job=await store.requireJob(c,content_job_id,business_id,true);
   const prior=(await c.query("SELECT p.request,o.output,o.output_hash,o.status FROM research_outcomes o JOIN research_operations p ON p.id=o.operation_id WHERE o.run_id=$1 AND o.business_id=$2 AND o.content_job_id=$3 AND p.operation='fact_guard'",[fact_guard_run_id,business_id,content_job_id])).rows[0];
   if(!prior||prior.status!=='SUCCEEDED'||hash(prior.output)!==prior.output_hash||prior.output.decision!=='REVIEW_REQUIRED')throw Error('FACT_GUARD_REVIEW_NOT_FOUND');
   if(hash(policies.research.policy)!==hash(prior.request.policy))throw Error('RESEARCH_POLICY_MISMATCH');
   const research=prior.request.input.research;
   if(Object.keys(decisions).some(id=>!prior.output.blocked_claims.includes(id))||prior.output.blocked_claims.some(id=>!Object.hasOwn(decisions,id)))throw Error('HUMAN_DECISION_SCOPE_MISMATCH');
   for(const [id,disposition] of Object.entries(decisions))if(disposition==='CONTEXT_ONLY'&&(!research.evidence.some(e=>e.claim_id===id&&e.support_type==='context')||research.evidence.some(e=>e.claim_id===id&&e.support_type==='supports')))throw Error('INVALID_CONTEXT_DECISION');
   const identity={fact_guard_run_id,decisions,publication_hold,brand_hash:policies.brand.content_hash,quality_hash:policies.quality.content_hash};const reference='human-fact-guard:'+fact_guard_run_id+':1';
   const old=(await c.query("SELECT * FROM evidence_records WHERE business_id=$1 AND job_id=$2 AND type='human_fact_guard_decision' AND reference=$3",[business_id,content_job_id,reference])).rows[0];
   if(old){if(old.payload.identity_hash!==hash(identity)||hash(old.payload)!==old.content_hash)throw Error('IDEMPOTENCY_CONFLICT');return old}
   if(job.current_state!=='REVIEW_REQUIRED')throw Error('INVALID_REVIEW_STATE');
   const latest=(await c.query('SELECT run_id FROM job_state_transitions WHERE job_id=$1 ORDER BY sequence DESC LIMIT 1',[content_job_id])).rows[0];if(latest?.run_id!==fact_guard_run_id)throw Error('STALE_FACT_GUARD_REVIEW');
   const insert=async(type,ref,payload,id=randomUUID())=>{assertSafe(payload);return (await c.query("INSERT INTO evidence_records(id,business_id,job_id,type,source,reference,payload,content_hash,created_at) VALUES($1,$2,$3,$4,'human-review-service',$5,$6,$7,clock_timestamp()) RETURNING *",[id,business_id,content_job_id,type,ref,payload,hash(payload)])).rows[0]};
   const bound={};for(const kind of ['brand','quality']){const p=policies[kind],e=await insert('policy_snapshot',kind+':'+p.version,p);bound[kind]={evidence_id:e.id,version:p.version,content_hash:p.content_hash,evidence_hash:e.content_hash}}
   const decision_id=randomUUID(),payload={decision_id,business_id,content_job_id,fact_guard_run_id,timestamp:new Date().toISOString(),actor:'human',decision_version:1,identity_hash:hash(identity),decisions,publication_hold,publication_approved:false,research:{run_id:prior.request.input.research_run_id,processing_revision_id:prior.request.input.research_processing_revision_id??null,output_hash:prior.request.input.research_output_hash},fact_guard:{run_id:fact_guard_run_id,output_hash:prior.output_hash,request_hash:hash(prior.request),processing_version:prior.request.provider.configuration.rules_version},policies:bound,research_policy:{version:policies.research.policy.version,content_hash:hash(policies.research.policy),source:policies.research.source}};
   const e=await insert('human_fact_guard_decision',reference,payload,decision_id);
   await insert('policy_binding_audit','policy-binding:'+decision_id,{actor:'human',decision_id,fact_guard_run_id,policies:bound,publication_hold:true});
   return e;
  }));
 }
}
