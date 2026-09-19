import {hash,jobIdentity} from './domain/research.js';
import {readResearch} from './research-postgres.js';
import pg from 'pg';
import {randomUUID} from 'node:crypto';
import {canTransition} from './domain/core.js';
export class PostgresStore {
 constructor(connectionString){this.pool=new pg.Pool({connectionString});}
 async close(){await this.pool.end()}
 async transaction(fn){
  const c=await this.pool.connect();
  try{await c.query('BEGIN');const result=await fn(c);await c.query('COMMIT');return result}
  catch(e){await c.query('ROLLBACK');throw e}finally{c.release()}
 }
 async businesses(businessId){return (await this.pool.query('SELECT * FROM businesses WHERE id=$1',[businessId])).rows}
 async jobs(businessId){return (await this.pool.query('SELECT * FROM content_jobs WHERE business_id=$1 ORDER BY created_at,id',[businessId])).rows}
 async seed(b){await this.pool.query('INSERT INTO businesses(id,tenant_id,name,brand) VALUES($1,$2,$3,$4) ON CONFLICT DO NOTHING',[b.id,b.tenant_id,b.name,b.brand])}
 async requireJob(c,id,businessId,lock=false){
  if(!businessId)throw Error('BUSINESS_REQUIRED');
  const r=await c.query('SELECT * FROM content_jobs WHERE id=$1 AND business_id=$2'+(lock?' FOR UPDATE':''),[id,businessId]);
  if(!r.rowCount)throw Error('JOB_NOT_FOUND');return r.rows[0];
 }
 async createJob(i){
  return this.transaction(async c=>{
   if(!(await c.query('SELECT id FROM businesses WHERE id=$1',[i.business_id])).rowCount)throw Error('BUSINESS_NOT_FOUND');
   if(!i.idempotency_key)throw Error('IDEMPOTENCY_KEY_REQUIRED');
   const r=await c.query(`INSERT INTO content_jobs(id,business_id,content_item_id,format,current_state,state_version,idempotency_key,workflow_version,brand_rule_version,quality_policy_version,working_title,created_at,updated_at)
    VALUES($1,$2,$3,$4,'IDEA_CREATED',1,$5,$6,$7,$8,$9,now(),now()) ON CONFLICT(business_id,idempotency_key) DO NOTHING RETURNING *`,
    [randomUUID(),i.business_id,i.content_item_id??null,i.format,i.idempotency_key,i.workflow_version??'phase-1.0',i.brand_rule_version??'unconfigured',i.quality_policy_version??'quality-1.0',i.working_title??null]);
   if(!r.rowCount){const old=(await c.query('SELECT * FROM content_jobs WHERE business_id=$1 AND idempotency_key=$2',[i.business_id,i.idempotency_key])).rows[0];if(hash(jobIdentity(old))!==hash(jobIdentity(i)))throw Error('IDEMPOTENCY_CONFLICT');return old;}
   const job=r.rows[0];
   await c.query("INSERT INTO job_state_transitions(id,job_id,to_state,actor_type,reason,occurred_at,metadata) VALUES($1,$2,'IDEA_CREATED','system','job_created',now(),$3)",[randomUUID(),job.id,{workflow_version:job.workflow_version,brand_rule_version:job.brand_rule_version,quality_policy_version:job.quality_policy_version}]);
   return job;
  });
 }
 async transition(jobId,expectedVersion,to,meta={}){
  return this.transaction(c=>this.transitionInTransaction(c,jobId,expectedVersion,to,meta));
 }
 async transitionInTransaction(c,jobId,expectedVersion,to,meta={}){
   const j=await this.requireJob(c,jobId,meta.business_id,true);
   if(!Number.isInteger(expectedVersion)||j.state_version!==expectedVersion)throw Error('STALE_STATE_VERSION');
   if(!canTransition(j.current_state,to))throw Error('INVALID_TRANSITION');
   const guarded=['RESEARCH_RUNNING','FACT_GUARD_RUNNING','RESEARCH_COMPLETE','FACT_GUARD_PASSED','REVIEW_REQUIRED','REJECTED'];
   if(guarded.includes(to)){
    const proof=meta.run_id?(await c.query(`SELECT p.operation,a.run_id,o.status,o.output FROM research_attempts a JOIN research_operations p ON p.id=a.operation_id LEFT JOIN research_outcomes o ON o.run_id=a.run_id WHERE a.run_id=$1 AND a.business_id=$2 AND a.content_job_id=$3`,[meta.run_id,meta.business_id,jobId])).rows[0]:null;
    if(!proof)throw Error('PERSISTED_EVIDENCE_REQUIRED');
    const isResearch=proof.operation==='research';
    if(to.endsWith('_RUNNING')){
     if(proof.status||to!==(isResearch?'RESEARCH_RUNNING':'FACT_GUARD_RUNNING'))throw Error('PERSISTED_EVIDENCE_REQUIRED');
    }else{
     const last=(await c.query('SELECT run_id FROM job_state_transitions WHERE job_id=$1 ORDER BY sequence DESC LIMIT 1',[jobId])).rows[0];
     const target=isResearch?{COMPLETE:'RESEARCH_COMPLETE',REVIEW_REQUIRED:'REVIEW_REQUIRED',REJECTED:'REJECTED'}[proof.output?.research_status]:{PASS:'FACT_GUARD_PASSED',REVIEW_REQUIRED:'REVIEW_REQUIRED',REJECT:'REJECTED'}[proof.output?.decision];
     if(proof.status!=='SUCCEEDED'||to!==target||last?.run_id!==meta.run_id||j.current_state!==(isResearch?'RESEARCH_RUNNING':'FACT_GUARD_RUNNING'))throw Error('PERSISTED_EVIDENCE_REQUIRED');
    }
   }
   const r=await c.query('UPDATE content_jobs SET current_state=$1,state_version=state_version+1,updated_at=clock_timestamp() WHERE id=$2 RETURNING *',[to,jobId]);
   await c.query(`INSERT INTO job_state_transitions(id,job_id,from_state,to_state,actor_type,actor_id,reason,run_id,occurred_at,metadata)
    VALUES($1,$2,$3,$4,$5,$6,$7,$8,clock_timestamp(),$9)`,[randomUUID(),jobId,j.current_state,to,meta.actor_type??'service',meta.actor_id??null,meta.reason??null,meta.run_id??null,{...meta,workflow_version:j.workflow_version,brand_rule_version:j.brand_rule_version,quality_policy_version:j.quality_policy_version}]);
   return r.rows[0];
 }
 async addArtifact(i){
  return this.transaction(async c=>{
   await this.requireJob(c,i.content_job_id,i.business_id);
   if(!i.logical_name||!i.content_hash||!i.storage_reference)throw Error('ARTIFACT_FIELDS_REQUIRED');
   await c.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',[i.business_id+':'+i.logical_name]);
   const version=i.version??Number((await c.query('SELECT COALESCE(MAX(version),0)+1 AS v FROM artifacts WHERE business_id=$1 AND logical_name=$2',[i.business_id,i.logical_name])).rows[0].v);
   return (await c.query(`INSERT INTO artifacts(artifact_id,business_id,content_job_id,logical_name,version,content_hash,storage_reference,source,created_at)
    VALUES($1,$2,$3,$4,$5,$6,$7,$8,clock_timestamp()) RETURNING *`,[randomUUID(),i.business_id,i.content_job_id,i.logical_name,version,i.content_hash,i.storage_reference,i.source??null])).rows[0];
  });
 }
 async addEvidence(i){
  return this.transaction(async c=>{
   await this.requireJob(c,i.content_job_id,i.business_id);
   if(!i.evidence_type||!i.reference)throw Error('EVIDENCE_FIELDS_REQUIRED');
   const r=await c.query(`INSERT INTO evidence_records(id,business_id,job_id,type,source,reference,payload,content_hash,created_at)
    VALUES($1,$2,$3,$4,$5,$6,$7,$8,clock_timestamp()) RETURNING *`,[randomUUID(),i.business_id,i.content_job_id,i.evidence_type,i.source??null,i.reference,i.payload??i.metadata??{},i.content_hash??null]);
   return this.evidenceView(r.rows[0]);
  });
 }
 evidenceView(e){return {...e,evidence_id:e.id,content_job_id:e.job_id,evidence_type:e.type}}
 async getJob(id,businessId){
  return this.transaction(async c=>{
   await c.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ');
   const r=await c.query('SELECT * FROM content_jobs WHERE id=$1 AND business_id=$2',[id,businessId]);
   if(!r.rowCount)return null;
   const h=await c.query('SELECT * FROM job_state_transitions WHERE job_id=$1 ORDER BY sequence',[id]);
   const e=await c.query('SELECT * FROM evidence_records WHERE job_id=$1 AND business_id=$2 ORDER BY created_at,id',[id,businessId]);
   const a=await c.query('SELECT * FROM artifacts WHERE content_job_id=$1 AND business_id=$2 ORDER BY logical_name,version',[id,businessId]);
   return {...await readResearch(c,businessId,id),job:r.rows[0],stateHistory:h.rows,transitions:h.rows,evidence:e.rows.map(x=>this.evidenceView(x)),artifacts:a.rows,quality:{technical:null,multimodal:null,finalJudge:null,releaseGate:null},publish:{target:null,status:null,result:null}};
  });
 }
}
