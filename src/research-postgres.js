import {randomUUID} from 'node:crypto';
import {hash} from './domain/research.js';
export class ResearchRepository {
 constructor(store){this.store=store}
 // Session lock spans the provider invocation, but no transaction is held open.
 // A crashed connection releases its lock; durable unfinished attempts require explicit retry.
 async withJobLock(business,job,fn){
  const key='research:'+business+':'+job,deadline=Date.now()+10000;
  let c;
  while(!c){
   const candidate=await this.store.pool.connect();
   try{if((await candidate.query('SELECT pg_try_advisory_lock(hashtextextended($1,0)) acquired',[key])).rows[0].acquired)c=candidate;else candidate.release()}
   catch(e){candidate.release();throw e}
   if(!c){if(Date.now()>deadline)throw Error('OPERATION_IN_PROGRESS');await new Promise(resolve=>setTimeout(resolve,20))}
  }
  try{return await fn()}
  finally{try{await c.query('SELECT pg_advisory_unlock(hashtextextended($1,0))',[key])}finally{c.release()}}
 }
 async getResearch(business,job,run){
  const d=await this.store.getJob(job,business);if(!d)throw Error('JOB_NOT_FOUND');
  const found=d.research.find(r=>r.run_id===run&&r.status==='SUCCEEDED');if(!found)throw Error('RESEARCH_NOT_FOUND');return found;
 }
 async begin(business,job,operation,key,request,retry){
  return this.store.transaction(async c=>{
   let j=await this.store.requireJob(c,job,business,true);
   const inputHash=hash(request);
   let op=(await c.query('SELECT * FROM research_operations WHERE business_id=$1 AND content_job_id=$2 AND operation=$3 AND idempotency_key=$4',[business,job,operation,key])).rows[0];
   if(op&&op.canonical_input_hash!==inputHash)throw Error('IDEMPOTENCY_CONFLICT');
   if(op){
    const last=(await c.query('SELECT a.*,o.status,o.error_category FROM research_attempts a LEFT JOIN research_outcomes o USING(run_id) WHERE a.operation_id=$1 ORDER BY attempt DESC LIMIT 1',[op.id])).rows[0];
    if(last?.status==='SUCCEEDED')return {reuse:true,run_id:last.run_id};
    if(last){
     if(!retry)throw Error(last.status==='FAILED'?'EXPLICIT_RETRY_REQUIRED':'INTERRUPTED_RETRY_REQUIRED');
     if(!last.status){
      await c.query("INSERT INTO research_outcomes(run_id,business_id,content_job_id,operation_id,status,metadata,error_category) VALUES($1,$2,$3,$4,'FAILED',$5,'INTERRUPTED')",[last.run_id,business,job,op.id,{synthetic:null}]);
      j=await this.store.transitionInTransaction(c,job,j.state_version,'FAILED',{business_id:business,run_id:last.run_id,reason:operation+'_interrupted',...this.audit(request)});
     }
    }
   }
   if(operation==='fact_guard'){
    const latest=(await c.query("SELECT run_id FROM job_state_transitions WHERE job_id=$1 AND to_state='RESEARCH_COMPLETE' ORDER BY sequence DESC LIMIT 1",[job])).rows[0];
    if(latest?.run_id!==request.input.research_run_id)throw Error('STALE_RESEARCH_EVIDENCE');
   }
   const pending=operation==='research'?'RESEARCH_PENDING':'FACT_GUARD_PENDING';
   if(j.current_state==='FAILED'&&retry)j=await this.store.transitionInTransaction(c,job,j.state_version,pending,{business_id:business,reason:'explicit_retry',...this.audit(request)});
   if(operation==='fact_guard'&&j.current_state==='RESEARCH_COMPLETE')j=await this.store.transitionInTransaction(c,job,j.state_version,pending,{business_id:business,reason:'fact_guard_admitted',...this.audit(request)});
   if(j.current_state!==pending)throw Error('INVALID_OPERATION_STATE');
   for(const [kind,d] of [['prompt',request.prompt],['policy',request.policy]]){
    await c.query('INSERT INTO research_definitions(business_id,kind,definition_id,version,content_hash,snapshot) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT DO NOTHING',[business,kind,d.id,d.version,hash(d),d]);
    const old=(await c.query('SELECT content_hash FROM research_definitions WHERE business_id=$1 AND kind=$2 AND definition_id=$3 AND version=$4',[business,kind,d.id,d.version])).rows[0];
    if(old.content_hash!==hash(d))throw Error('VERSION_CONTENT_CONFLICT');
   }
   if(!op)op=(await c.query('INSERT INTO research_operations(id,business_id,content_job_id,operation,idempotency_key,canonical_input_hash,request,research_run_id) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',[randomUUID(),business,job,operation,key,inputHash,request,request.input.research_run_id??null])).rows[0];
   const attempt=Number((await c.query('SELECT COALESCE(MAX(attempt),0)+1 n FROM research_attempts WHERE operation_id=$1',[op.id])).rows[0].n);
   const run_id=randomUUID();
   await c.query('INSERT INTO research_attempts(run_id,business_id,content_job_id,operation_id,attempt) VALUES($1,$2,$3,$4,$5)',[run_id,business,job,op.id,attempt]);
   j=await this.store.transitionInTransaction(c,job,j.state_version,operation==='research'?'RESEARCH_RUNNING':'FACT_GUARD_RUNNING',{business_id:business,run_id,reason:operation+'_started',...this.audit(request)});
   return {run_id,operation_id:op.id,attempt,state_version:j.state_version};
  });
 }
 audit(r){return {actor_type:'service',actor_id:'research-coordinator',workflow_version:r.workflow_version,prompt_version:r.prompt.version,policy_version:r.policy.version,business_id:r.business_id,content_job_id:r.content_job_id}}
 async finish(business,job,operation,run,request,output,meta,error){
  return this.store.transaction(async c=>{
   const j=await this.store.requireJob(c,job,business,true);
   if(j.state_version!==run.state_version)throw Error('STALE_STATE_VERSION');
   await c.query('INSERT INTO research_outcomes(run_id,business_id,content_job_id,operation_id,status,output,output_hash,metadata,error_category) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)',[run.run_id,business,job,run.operation_id,error?'FAILED':'SUCCEEDED',output,output?hash(output):null,meta,error??null]);
   if(!error&&operation==='research'){
    for(const claim of output.claims)await c.query('INSERT INTO research_claims VALUES($1,$2,$3,$4,$5)',[business,job,run.run_id,claim.claim_id,claim]);
    for(const source of output.sources)await c.query('INSERT INTO research_sources VALUES($1,$2,$3,$4,$5)',[business,job,run.run_id,source.source_id,source]);
    for(const link of output.evidence)await c.query('INSERT INTO research_claim_evidence VALUES($1,$2,$3,$4,$5,$6)',[business,job,run.run_id,link.claim_id,link.source_id,link]);
   }
   const to=error?'FAILED':operation==='research'?{COMPLETE:'RESEARCH_COMPLETE',REVIEW_REQUIRED:'REVIEW_REQUIRED',REJECTED:'REJECTED'}[output.research_status]:{PASS:'FACT_GUARD_PASSED',REVIEW_REQUIRED:'REVIEW_REQUIRED',REJECT:'REJECTED'}[output.decision];
   await this.store.transitionInTransaction(c,job,j.state_version,to,{business_id:business,run_id:run.run_id,reason:operation+'_'+(error?'failed':to.toLowerCase()),...this.audit(request)});
  });
 }
 async result(business,job,run){const d=await this.store.getJob(job,business);if(!d)throw Error('JOB_NOT_FOUND');return [...d.research,...d.factGuard].find(x=>x.run_id===run)}
 async job(business,job){const d=await this.store.getJob(job,business);if(!d)throw Error('JOB_NOT_FOUND');return d.job}
}
export async function readResearch(c,business,job){
 const rows=(await c.query(`SELECT p.id operation_id,p.operation,p.idempotency_key,p.canonical_input_hash,p.request,a.run_id,a.attempt,a.started_at,o.completed_at,COALESCE(o.status,'RUNNING') status,o.output,o.output_hash,o.metadata,o.error_category
 FROM research_operations p JOIN research_attempts a ON a.operation_id=p.id LEFT JOIN research_outcomes o ON o.run_id=a.run_id
 WHERE p.business_id=$1 AND p.content_job_id=$2 ORDER BY a.started_at,a.run_id`,[business,job])).rows;
 const mapped=rows.map(r=>({...r,business_id:business,content_job_id:job,research_run_id:r.operation==='research'?r.run_id:undefined,fact_guard_run_id:r.operation==='fact_guard'?r.run_id:undefined,provider:r.request.provider.provider,model:r.request.provider.model,prompt_version:r.request.prompt.version,policy_version:r.request.policy.version,research_policy_version:r.request.policy.version,provider_request_id:r.metadata?.provider_request_id??null,workflow_version:r.request.workflow_version,input_reference:'postgres:research_operations:'+r.operation_id,output_reference:r.output?'postgres:research_outcomes:'+r.run_id:null}));
 return {research:mapped.filter(r=>r.operation==='research'),factGuard:mapped.filter(r=>r.operation==='fact_guard')};
}
