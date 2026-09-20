import {assertSafe,canonical,hash} from './domain/research.js';
export function changedExecutionFields(oldRequest,newRequest){
 const fields=[];
 function walk(a,b,path){
  if(canonical(a??null)===canonical(b??null))return;
  if(a&&b&&typeof a==='object'&&typeof b==='object'&&!Array.isArray(a)&&!Array.isArray(b)){
   for(const key of new Set([...Object.keys(a),...Object.keys(b)])){
    if(!/^[a-zA-Z_][a-zA-Z0-9_]{0,80}$/.test(key)){fields.push(path);continue;}walk(a[key],b[key],path+'.'+key);
   }
  }else fields.push(path);
 }
 for(const k of ['provider','prompt','policy','workflow_version'])walk(oldRequest[k],newRequest[k],k);
 return [...new Set(fields)].sort();
}
export async function planResearchRevision(c,store,business,job,request,revision){
 assertSafe(request);assertSafe(revision);
 if(revision?.explicit_retry!==true||!revision.previous_run_id||typeof revision.reason!=='string'||!revision.reason.trim()||revision.reason.length>500)throw Error('EXPLICIT_REVISION_REQUIRED');
 const j=await store.requireJob(c,job,business);
 const previous=(await c.query(`SELECT a.run_id,a.attempt,p.id operation_id,p.request,p.canonical_input_hash,o.status,m.lineage_id,m.execution_revision,l.logical_input FROM research_attempts a JOIN research_operations p ON p.id=a.operation_id JOIN research_outcomes o USING(run_id) JOIN research_attempt_lineage m USING(run_id) JOIN research_lineages l ON l.lineage_id=m.lineage_id WHERE a.run_id=$1 AND a.business_id=$2 AND a.content_job_id=$3 AND p.operation='research'`,[revision.previous_run_id,business,job])).rows[0];
 if(!previous)throw Error('PREVIOUS_RESEARCH_NOT_FOUND');
 if(previous.status!=='FAILED')throw Error('PREVIOUS_RESEARCH_NOT_FAILED');
 const latest=(await c.query('SELECT run_id,attempt_number FROM research_attempt_lineage WHERE lineage_id=$1 ORDER BY attempt_number DESC LIMIT 1',[previous.lineage_id])).rows[0];
 if(latest?.run_id!==previous.run_id)throw Error('STALE_RESEARCH_REVISION');
 if(j.current_state!=='FAILED')throw Error('FAILED_STATE_REQUIRED');
 if(hash(request.input)!==hash(previous.logical_input))throw Error('LOGICAL_RESEARCH_INPUT_CHANGED');
 const newHash=hash(request);if(newHash===previous.canonical_input_hash)throw Error('EXECUTION_REVISION_UNCHANGED');
 const revisionNumber=Number((await c.query('SELECT MAX(execution_revision)+1 n FROM research_execution_revisions WHERE lineage_id=$1',[previous.lineage_id])).rows[0].n);
 const plan={lineage_id:previous.lineage_id,logical_input_hash:hash(previous.logical_input),previous_run_id:previous.run_id,attempt_number:latest.attempt_number+1,execution_revision:revisionNumber,old_request_hash:previous.canonical_input_hash,new_request_hash:newHash,changed_execution_fields:changedExecutionFields(previous.request,request),reason:revision.reason.trim()};
 plan.idempotency_key='research-revision:'+hash({lineage_id:plan.lineage_id,previous_run_id:plan.previous_run_id,new_request_hash:newHash});
 return plan;
}
