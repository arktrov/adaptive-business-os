import {randomUUID} from 'node:crypto';import {hash} from '../domain/research.js';import {planScriptRecovery} from '../domain/script-processing.js';
export async function recoverScript(repository,{business_id:b,content_job_id:j,execution_id}){
 return repository.withJobLock(b,j,()=>repository.store.transaction(async c=>{
  const store=repository.store;let job=await store.requireJob(c,j,b,true);
  const old=(await c.query("SELECT * FROM evidence_records WHERE business_id=$1 AND job_id=$2 AND type='script_processing_revision' AND reference=$3",[b,j,'script-recovery:'+execution_id])).rows[0];if(old){if(hash(old.payload)!==old.content_hash)throw Error('RECOVERY_HASH_MISMATCH');return old.payload}
  const e=(await c.query('SELECT e.*,o.status,o.metadata FROM script_executions e JOIN script_outcomes o ON o.execution_id=e.id WHERE e.id=$1 AND e.business_id=$2 AND e.content_job_id=$3',[execution_id,b,j])).rows[0];
  const latest=(await c.query('SELECT id FROM script_executions WHERE business_id=$1 AND content_job_id=$2 ORDER BY revision DESC LIMIT 1',[b,j])).rows[0];if(!e||latest?.id!==e.id||job.current_state!=='SCRIPT_REVIEW_REQUIRED')throw Error('STALE_SCRIPT_RECOVERY');
  const a=(await c.query('SELECT payload,content_hash FROM script_response_artifacts WHERE execution_id=$1 AND business_id=$2 AND content_job_id=$3',[execution_id,b,j])).rows[0];if(!a)throw Error('RESPONSE_ARTIFACT_NOT_VERIFIED');
  const count=e.input.format==='BOTH'?2:1,id=randomUUID(),plan=planScriptRecovery(e,a,{id,script_ids:Array.from({length:count},()=>randomUUID()),package_ids:Array.from({length:count},()=>randomUUID()),created_at:new Date().toISOString()});
  const fg=(await c.query("SELECT run_id FROM job_state_transitions WHERE job_id=$1 AND to_state='FACT_GUARD_PASSED' ORDER BY sequence DESC LIMIT 1",[j])).rows[0];if(fg?.run_id!==e.fact_guard_run_id)throw Error('STALE_FACT_GUARD');
  await c.query("INSERT INTO evidence_records(id,business_id,job_id,type,source,reference,payload,content_hash,created_at) VALUES($1,$2,$3,'script_processing_revision','offline-script-recovery',$4,$5,$6,clock_timestamp())",[id,b,j,'script-recovery:'+execution_id,plan.payload,hash(plan.payload)]);
  for(const d of plan.drafts)await c.query('INSERT INTO script_drafts(id,business_id,content_job_id,execution_id,version,format,data,content_hash) VALUES($1,$2,$3,$4,$5,$6,$7,$8)',[d.script_id,b,j,e.id,d.script_version,d.format,d,d.output_hash]);
  for(const p of plan.packages){await c.query('INSERT INTO production_packages(id,business_id,content_job_id,script_id,version,data,content_hash) VALUES($1,$2,$3,$4,$5,$6,$7)',[p.production_package_id,b,j,p.script_id,p.package_version,p,p.content_hash]);for(const s of p.timeline_segments)await c.query('INSERT INTO planned_asset_requirements VALUES($1,$2,$3,$4,$5)',[s.asset_requirement.requirement_id,b,j,p.production_package_id,s.asset_requirement])}
  for(const to of ['SCRIPT_APPROVED','PRODUCTION_PACKAGE_READY'])job=await store.transitionInTransaction(c,j,job.state_version,to,{business_id:b,script_execution_id:e.id,script_processing_revision_id:id,run_id:id,actor_id:'offline-script-recovery',reason:'stored_response_reprocessed',publication_hold:true,external_calls:0});
  return plan.payload;
 }));
}
