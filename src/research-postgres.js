import {scriptStageInput} from './domain/content-scope.js';
import {verifyPolicySnapshot} from './config/content-policies.js';
import {planResearchRevision} from './research-lineage.js';
import {randomUUID} from 'node:crypto';
import {assertSafe,hash,evidenceIdentity} from './domain/research.js';
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
 async loadProviderResponse(business,job,run){
  const rows=(await this.store.pool.query("SELECT id,payload,content_hash FROM evidence_records WHERE business_id=$1 AND job_id=$2 AND type='provider_response' AND reference=$3",[business,job,'provider-response:'+run])).rows;
  if(rows.length!==1||hash(rows[0].payload)!==rows[0].content_hash)throw Error('RESPONSE_ARTIFACT_NOT_VERIFIED');return rows[0];
 }
 async captureProviderResponse(business,job,run,requestHash,artifact){
  assertSafe(artifact);if(hash(artifact.payload)!==artifact.content_hash||artifact.payload.run_id!==run||artifact.payload.request_hash!==requestHash)throw Error('RESPONSE_ARTIFACT_MISMATCH');
  await this.store.transaction(async c=>{
   const a=(await c.query('SELECT a.run_id,p.canonical_input_hash FROM research_attempts a JOIN research_operations p ON p.id=a.operation_id LEFT JOIN research_outcomes o ON o.run_id=a.run_id WHERE a.business_id=$1 AND a.content_job_id=$2 AND a.run_id=$3 AND o.run_id IS NULL FOR UPDATE OF a',[business,job,run])).rows[0];
   if(!a||a.canonical_input_hash!==requestHash)throw Error('RESPONSE_RUN_MISMATCH');
   const prior=(await c.query("SELECT id FROM evidence_records WHERE business_id=$1 AND job_id=$2 AND type='provider_response' AND reference=$3",[business,job,'provider-response:'+run])).rows;
   if(prior.length)throw Error('RESPONSE_ALREADY_CAPTURED');
   await c.query("INSERT INTO evidence_records(id,business_id,job_id,type,source,reference,payload,content_hash,created_at) VALUES($1,$2,$3,'provider_response','research-provider',$4,$5,$6,clock_timestamp())",[randomUUID(),business,job,'provider-response:'+run,artifact.payload,artifact.content_hash]);
  });
  const saved=await this.loadProviderResponse(business,job,run);
  if(saved.content_hash!==artifact.content_hash)throw Error('RESPONSE_ARTIFACT_MISMATCH');return {evidence_id:saved.id,content_hash:saved.content_hash};
 }
 async getRecoveredFactGuardInput(business,job,run,processingId,approvalId){
  return this.store.transaction(async c=>{
   const j=await this.store.requireJob(c,job,business);
   const r=(await c.query('SELECT r.*,p.request FROM research_processing_revisions r JOIN research_attempts a ON a.run_id=r.original_run_id JOIN research_operations p ON p.id=a.operation_id WHERE r.business_id=$1 AND r.content_job_id=$2 AND r.id=$3 AND r.original_run_id=$4',[business,job,processingId,run])).rows[0];
   if(!r||hash(r.output)!==r.output_hash||r.output.research_status!=='COMPLETE')throw Error('RECOVERED_RESEARCH_NOT_FOUND');
   const e=(await c.query("SELECT * FROM evidence_records WHERE id=$1 AND business_id=$2 AND job_id=$3 AND type='human_research_approval'",[approvalId,business,job])).rows[0];
   if(!e||hash(e.payload)!==e.content_hash||e.payload.decision!=='APPROVED_FOR_FACT_GUARD'||e.payload.processing_revision_id!==processingId||e.payload.research_output_hash!==r.output_hash)throw Error('HUMAN_RESEARCH_APPROVAL_REQUIRED');
   const b=(await c.query('SELECT brand FROM businesses WHERE id=$1',[business])).rows[0];
   return {run_id:run,processing_revision_id:processingId,output:r.output,output_hash:r.output_hash,policy:r.request.policy,human_review:{evidence_id:e.id,content_hash:e.content_hash,payload:e.payload},policy_context:{brand_rule_version:j.brand_rule_version,quality_policy_version:j.quality_policy_version,brand_snapshot:b.brand??{},quality_policy_snapshot:null}};
  });
 }
 async getHumanReviewInput(business,job,decisionId,research){
  return this.store.transaction(async c=>{
   const e=(await c.query("SELECT * FROM evidence_records WHERE id=$1 AND business_id=$2 AND job_id=$3 AND type='human_fact_guard_decision'",[decisionId,business,job])).rows[0];
   if(!e||hash(e.payload)!==e.content_hash||(e.payload.research.processing_revision_id??null)!==(research.processing_revision_id??null)||(e.payload.research.run_id&&e.payload.research.run_id!==research.run_id)||e.payload.research.output_hash!==research.output_hash||e.payload.publication_hold!==true)throw Error('HUMAN_DECISION_NOT_VERIFIED');
   const p=e.payload,original=(await c.query('SELECT output_hash FROM research_outcomes WHERE run_id=$1 AND business_id=$2 AND content_job_id=$3',[p.fact_guard_run_id,business,job])).rows[0];if(original?.output_hash!==p.fact_guard.output_hash)throw Error('FACT_GUARD_REVIEW_NOT_FOUND');
   const snapshots={};for(const kind of ['brand','quality']){const ref=p.policies[kind],snapshot=(await c.query("SELECT * FROM evidence_records WHERE id=$1 AND business_id=$2 AND job_id=$3 AND type='policy_snapshot'",[ref.evidence_id,business,job])).rows[0];if(!snapshot||hash(snapshot.payload)!==snapshot.content_hash||snapshot.content_hash!==ref.evidence_hash)throw Error('POLICY_HASH_MISMATCH');verifyPolicySnapshot(snapshot.payload,business,kind);if(snapshot.payload.version!==ref.version||snapshot.payload.content_hash!==ref.content_hash)throw Error('POLICY_HASH_MISMATCH');snapshots[kind]=snapshot.payload}
   return {human_fact_guard_decision:{evidence_id:e.id,content_hash:e.content_hash,payload:p},policy_context:{brand_rule_version:snapshots.brand.version,quality_policy_version:snapshots.quality.version,brand_snapshot:snapshots.brand,quality_policy_snapshot:snapshots.quality}};
  });
 }
 async prepareRevision(business,job,request,revision){
  return this.store.transaction(async c=>{await c.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY');return planResearchRevision(c,this.store,business,job,request,revision)});
 }
 async begin(business,job,operation,key,request,retry,revision=null){
  return this.store.transaction(async c=>{
   let j=await this.store.requireJob(c,job,business,true);
   let plan=null;
   if(revision){if(operation!=='research'||retry!==true)throw Error('EXPLICIT_REVISION_REQUIRED');plan=await planResearchRevision(c,this.store,business,job,request,revision);key=plan.idempotency_key;}
   const inputHash=hash(request);
   let op=(await c.query('SELECT * FROM research_operations WHERE business_id=$1 AND content_job_id=$2 AND operation=$3 AND idempotency_key=$4',[business,job,operation,key])).rows[0];
   if(op&&op.canonical_input_hash!==inputHash)throw Error('IDEMPOTENCY_CONFLICT');
   let lineage=operation==='research'?(await c.query('SELECT * FROM research_lineages WHERE business_id=$1 AND content_job_id=$2',[business,job])).rows[0]:null;
   let head=lineage?(await c.query('SELECT * FROM research_attempt_lineage WHERE lineage_id=$1 ORDER BY attempt_number DESC LIMIT 1',[lineage.lineage_id])).rows[0]:null;
   if(op&&head&&head.operation_id!==op.id)throw Error('STALE_RESEARCH_REVISION');
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
    const latest=(await c.query("SELECT run_id,metadata FROM job_state_transitions WHERE job_id=$1 AND to_state='RESEARCH_COMPLETE' ORDER BY sequence DESC LIMIT 1",[job])).rows[0];
    if(latest?.run_id!==request.input.research_run_id||(latest?.metadata?.processing_revision_id??null)!==(request.input.research_processing_revision_id??null))throw Error('STALE_RESEARCH_EVIDENCE');
   }
   const pending=operation==='research'?'RESEARCH_PENDING':'FACT_GUARD_PENDING';
   if(j.current_state==='FAILED'&&retry)j=await this.store.transitionInTransaction(c,job,j.state_version,pending,{business_id:business,reason:'explicit_retry',...this.audit(request)});
   if(operation==='fact_guard'&&j.current_state==='REVIEW_REQUIRED'&&request.input.human_fact_guard_decision)j=await this.store.transitionInTransaction(c,job,j.state_version,pending,{business_id:business,reason:'human_fact_guard_review',human_decision_id:request.input.human_fact_guard_decision.evidence_id,...this.audit(request)});
   if(operation==='fact_guard'&&j.current_state==='RESEARCH_COMPLETE')j=await this.store.transitionInTransaction(c,job,j.state_version,pending,{business_id:business,reason:'fact_guard_admitted',...this.audit(request)});
   if(j.current_state!==pending)throw Error('INVALID_OPERATION_STATE');
   for(const [kind,d] of [['prompt',request.prompt],['policy',request.policy]]){
    await c.query('INSERT INTO research_definitions(business_id,kind,definition_id,version,content_hash,snapshot) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT DO NOTHING',[business,kind,d.id,d.version,hash(d),d]);
    const old=(await c.query('SELECT content_hash FROM research_definitions WHERE business_id=$1 AND kind=$2 AND definition_id=$3 AND version=$4',[business,kind,d.id,d.version])).rows[0];
    if(old.content_hash!==hash(d))throw Error('VERSION_CONTENT_CONFLICT');
   }
   if(!op&&lineage&&!plan)throw Error('EXPLICIT_REVISION_REQUIRED');
   const newOperation=!op;
   if(!op)op=(await c.query('INSERT INTO research_operations(id,business_id,content_job_id,operation,idempotency_key,canonical_input_hash,request,research_run_id,research_processing_revision_id) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *',[randomUUID(),business,job,operation,key,inputHash,request,request.input.research_run_id??null,request.input.research_processing_revision_id??null])).rows[0];
   if(operation==='research'&&newOperation){
    if(!lineage)lineage=(await c.query('INSERT INTO research_lineages(lineage_id,business_id,content_job_id,logical_input) VALUES($1,$2,$3,$4) RETURNING *',[op.id,business,job,request.input])).rows[0];
    await c.query('INSERT INTO research_execution_revisions(operation_id,business_id,content_job_id,lineage_id,execution_revision,previous_run_id) VALUES($1,$2,$3,$4,$5,$6)',[op.id,business,job,lineage.lineage_id,plan?.execution_revision??1,plan?.previous_run_id??null]);
   }
   const revisionRow=lineage?(await c.query('SELECT * FROM research_execution_revisions WHERE operation_id=$1',[op.id])).rows[0]:null;
   const attempt=lineage?Number((await c.query('SELECT COALESCE(MAX(attempt_number),0)+1 n FROM research_attempt_lineage WHERE lineage_id=$1',[lineage.lineage_id])).rows[0].n):Number((await c.query('SELECT COALESCE(MAX(attempt),0)+1 n FROM research_attempts WHERE operation_id=$1',[op.id])).rows[0].n);
   const run_id=randomUUID();
   await c.query('INSERT INTO research_attempts(run_id,business_id,content_job_id,operation_id,attempt) VALUES($1,$2,$3,$4,$5)',[run_id,business,job,op.id,attempt]);
   j=await this.store.transitionInTransaction(c,job,j.state_version,operation==='research'?'RESEARCH_RUNNING':'FACT_GUARD_RUNNING',{business_id:business,run_id,reason:operation+'_started',...this.audit(request),...(lineage?{lineage_id:lineage.lineage_id,logical_input_hash:hash(lineage.logical_input),previous_run_id:head?.run_id??null,new_run_id:run_id,attempt_number:attempt,execution_revision:revisionRow.execution_revision,old_request_hash:plan?.old_request_hash??(head?inputHash:null),new_request_hash:inputHash,changed_execution_fields:plan?.changed_execution_fields??[],revision_reason:plan?.reason??(retry?'explicit_retry':'initial_research')}:{} )});
   return {run_id,operation_id:op.id,attempt,state_version:j.state_version,...(lineage?{lineage_id:lineage.lineage_id,execution_revision:revisionRow.execution_revision}:{})};
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
    for(const link of output.evidence)await c.query('INSERT INTO research_claim_evidence(business_id,content_job_id,run_id,claim_id,source_id,data,relation_id) VALUES($1,$2,$3,$4,$5,$6,$7)',[business,job,run.run_id,link.claim_id,link.source_id,link,evidenceIdentity(link)]);
   }
   const to=error?'FAILED':operation==='research'?{COMPLETE:'RESEARCH_COMPLETE',REVIEW_REQUIRED:'REVIEW_REQUIRED',REJECTED:'REJECTED'}[output.research_status]:{PASS:'FACT_GUARD_PASSED',REVIEW_REQUIRED:'REVIEW_REQUIRED',REJECT:'REJECTED'}[output.decision];
   await this.store.transitionInTransaction(c,job,j.state_version,to,{business_id:business,run_id:run.run_id,reason:operation+'_'+(error?'failed':to.toLowerCase()),...this.audit(request)});
  });
 }
 async result(business,job,run){const d=await this.store.getJob(job,business);if(!d)throw Error('JOB_NOT_FOUND');return [...d.research,...d.factGuard].find(x=>x.run_id===run)}
 async downstreamInput(business,job,runId){const r=await this.result(business,job,runId);if(!r)throw Error('SCOPE_NOT_FOUND');return scriptStageInput(r,business,job)}
 async job(business,job){const d=await this.store.getJob(job,business);if(!d)throw Error('JOB_NOT_FOUND');return d.job}
}
export async function readResearch(c,business,job){
 const rows=(await c.query(`SELECT p.id operation_id,p.operation,p.idempotency_key,p.canonical_input_hash,p.request,a.run_id,a.attempt,a.started_at,o.completed_at,COALESCE(o.status,'RUNNING') status,o.output,o.output_hash,o.metadata,o.error_category,m.lineage_id,m.execution_revision,m.attempt_number
 FROM research_operations p JOIN research_attempts a ON a.operation_id=p.id LEFT JOIN research_outcomes o ON o.run_id=a.run_id LEFT JOIN research_attempt_lineage m ON m.run_id=a.run_id
 WHERE p.business_id=$1 AND p.content_job_id=$2 ORDER BY a.started_at,a.run_id`,[business,job])).rows;
 const mapped=rows.map(r=>({...r,business_id:business,content_job_id:job,research_run_id:r.operation==='research'?r.run_id:undefined,fact_guard_run_id:r.operation==='fact_guard'?r.run_id:undefined,provider:r.request.provider.provider,model:r.request.provider.model,prompt_version:r.request.prompt.version,policy_version:r.request.policy.version,research_policy_version:r.request.policy.version,provider_request_id:r.metadata?.provider_request_id??null,workflow_version:r.request.workflow_version,input_reference:'postgres:research_operations:'+r.operation_id,output_reference:r.output?'postgres:research_outcomes:'+r.run_id:null}));
 return {research:mapped.filter(r=>r.operation==='research'),factGuard:mapped.filter(r=>r.operation==='fact_guard')};
}
