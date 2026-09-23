import {randomUUID} from 'node:crypto';
import {hash} from '../domain/research.js';
import {guardScriptTransition} from '../script-transition.js';
export class HumanProductionApproval {
 constructor(repository){this.repository=repository}
 async record({business_id:b,content_job_id:j,script_id,package_id,decisions}){
  const required={script_creative_quality:'APPROVED',script_factual_safety:'APPROVED',production_package:'APPROVED_FOR_NEXT_PRODUCTION_STAGE'};
  if(hash(decisions)!==hash(required))throw Error('EXPLICIT_HUMAN_APPROVAL_REQUIRED');
  return this.repository.withJobLock(b,j,()=>this.repository.store.transaction(async c=>{
   const job=await this.repository.store.requireJob(c,j,b,true);
   if(job.current_state!=='PRODUCTION_PACKAGE_READY')throw Error('PRODUCTION_NOT_READY');
   const row=(await c.query('SELECT s.data AS script,p.data AS package,e.id AS execution_id,e.input FROM script_drafts s JOIN production_packages p ON p.script_id=s.id AND p.business_id=s.business_id AND p.content_job_id=s.content_job_id JOIN script_executions e ON e.id=s.execution_id WHERE s.id=$1 AND p.id=$2 AND s.business_id=$3 AND s.content_job_id=$4',[script_id,package_id,b,j])).rows[0];
   if(!row)throw Error('APPROVAL_ARTIFACT_NOT_FOUND');
   await guardScriptTransition(c,job,'PRODUCTION_PACKAGE_READY',{script_execution_id:row.execution_id});
   const s=row.script,p=row.package;
   if(s.validation.status!=='PASS'||!s.publication_hold||!p.publication_hold||p.release_allowed!==false)throw Error('UNSAFE_PRODUCTION_APPROVAL');
   const identity={business_id:b,content_job_id:j,selected_script_id:script_id,script_hash:s.output_hash,selected_package_id:package_id,package_hash:p.content_hash,execution_id:row.execution_id,fact_guard_run_id:row.input.fact_guard_run_id,fact_guard_scope_hash:row.input.scope.content_scope_hash,approved_realizations:s.claim_usage.map(x=>x.approved_realization_reference).filter(Boolean),policy_snapshot_refs:row.input.scope.policy_snapshot_refs,decisions:required,publication_hold:true,release_allowed:false,canonical_state:'PRODUCTION_PACKAGE_READY',phase_2c_started:false};
   const reference='human-production-approval:'+script_id+':'+package_id;
   const old=(await c.query("SELECT * FROM evidence_records WHERE business_id=$1 AND job_id=$2 AND type='human_production_approval' AND reference=$3",[b,j,reference])).rows[0];
   if(old){if(hash(old.payload)!==old.content_hash||old.payload.identity_hash!==hash(identity))throw Error('APPROVAL_IDENTITY_CONFLICT');return old}
   const id=randomUUID(),payload={...identity,approval_id:id,actor:'human',approved_at:new Date().toISOString(),version:'human-production-approval/1.0',identity_hash:hash(identity)};
   return (await c.query("INSERT INTO evidence_records(id,business_id,job_id,type,source,reference,payload,content_hash,created_at) VALUES($1,$2,$3,'human_production_approval','human',$4,$5,$6,clock_timestamp()) RETURNING *",[id,b,j,reference,payload,hash(payload)])).rows[0];
  }));
 }
}
