import {randomUUID} from 'node:crypto';
import {hash,assertSafe} from '../domain/research.js';
export class HumanScriptReview {
 constructor(repository){this.repository=repository}
 async record({business_id:b,content_job_id:j,script_id,package_id,feedback}){
  assertSafe(feedback);if(typeof feedback!=='string'||!feedback.trim())throw Error('REVISION_FEEDBACK_REQUIRED');
  return this.repository.withJobLock(b,j,()=>this.repository.store.transaction(async c=>{
   await this.repository.store.requireJob(c,j,b,true);
   const row=(await c.query('SELECT s.data AS script,s.content_hash AS script_hash,p.data AS package,p.content_hash AS package_hash,e.input,e.id AS execution_id FROM script_drafts s JOIN production_packages p ON p.script_id=s.id AND p.business_id=s.business_id AND p.content_job_id=s.content_job_id JOIN script_executions e ON e.id=s.execution_id WHERE s.id=$1 AND p.id=$2 AND s.business_id=$3 AND s.content_job_id=$4',[script_id,package_id,b,j])).rows[0];
   if(!row)throw Error('REVIEW_ARTIFACT_NOT_FOUND');
   const {output_hash,...s}=row.script,{content_hash,...p}=row.package;
   if(hash(s)!==output_hash||output_hash!==row.script_hash||hash(p)!==content_hash||content_hash!==row.package_hash||row.input.publication_hold!==true)throw Error('REVIEW_HASH_MISMATCH');
   const identity={business_id:b,content_job_id:j,script_id,script_hash:output_hash,package_id,package_hash:content_hash,previous_execution_id:row.execution_id,scope_hash:row.input.scope.content_scope_hash,fact_guard_run_id:row.input.fact_guard_run_id,policy_snapshot_refs:row.input.scope.policy_snapshot_refs,feedback,decisions:{factual_safety:'APPROVED',creative_script:'REVIEW_REQUIRED',production_package:'REVIEW_REQUIRED'},publication_hold:true,publication_approved:false,live_call_authorized:false};
   const reference='human-script-revision:'+script_id,old=(await c.query("SELECT * FROM evidence_records WHERE business_id=$1 AND job_id=$2 AND type='human_script_revision_directive' AND reference=$3",[b,j,reference])).rows[0];
   if(old){if(old.payload.identity_hash!==hash(identity)||hash(old.payload)!==old.content_hash)throw Error('IDEMPOTENCY_CONFLICT');return old}
   const latest=(await c.query('SELECT id FROM script_executions WHERE business_id=$1 AND content_job_id=$2 ORDER BY revision DESC LIMIT 1',[b,j])).rows[0];if(latest?.id!==row.execution_id)throw Error('STALE_SCRIPT_REVIEW');
   const id=randomUUID(),payload={...identity,identity_hash:hash(identity),directive_id:id,version:'human-script-revision/1.0',actor:'human',created_at:new Date().toISOString()};assertSafe(payload);
   return (await c.query("INSERT INTO evidence_records(id,business_id,job_id,type,source,reference,payload,content_hash,created_at) VALUES($1,$2,$3,'human_script_revision_directive','human-script-review',$4,$5,$6,clock_timestamp()) RETURNING *",[id,b,j,reference,payload,hash(payload)])).rows[0];
  }));
 }
}
