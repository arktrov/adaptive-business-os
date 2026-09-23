import {loadRealizations} from './claim-realizations-postgres.js';
import {randomUUID} from 'node:crypto';
import {ResearchRepository} from './research-postgres.js';
import {scriptStageInput} from './domain/content-scope.js';
import {hash,assertSafe,evidenceIdentity} from './domain/research.js';
import {validateProductionInput,formats} from './domain/script-production.js';
import {verifyPolicySnapshot} from './config/content-policies.js';
export class ScriptRepository {
 constructor(store){this.store=store;this.research=new ResearchRepository(store)}
 withJobLock(b,j,fn){return this.research.withJobLock(b,j,fn)}
 async input(command,configuration,provider){
  const {business_id:b,content_job_id:j}=command,d=await this.store.getJob(j,b);if(!d)throw Error('JOB_NOT_FOUND');
  const fg=d.factGuard.at(-1);if(!fg||fg.run_id!==command.fact_guard_run_id)throw Error('STALE_FACT_GUARD');
  const scoped=scriptStageInput(fg,b,j),policies={};
  for(const kind of ['brand','quality']){const ref=scoped.scope.policy_snapshot_refs[kind],e=d.evidence.find(e=>e.id===ref.evidence_id&&e.type==='policy_snapshot');if(!e||hash(e.payload)!==e.content_hash||e.content_hash!==ref.evidence_hash)throw Error('POLICY_HASH_MISMATCH');verifyPolicySnapshot(e.payload,b,kind);if(e.payload.version!==ref.version||e.payload.content_hash!==ref.content_hash)throw Error('POLICY_HASH_MISMATCH');policies[kind]=e.payload}
  const research=fg.request.input.research,admitted=[...scoped.scope.approved_claim_ids,...scoped.scope.context_only_claim_ids];
  const evidence_references=Object.fromEntries(admitted.map(id=>[id,research.evidence.filter(e=>e.claim_id===id).map(e=>{if(!research.sources.some(s=>s.source_id===e.source_id))throw Error('BROKEN_EVIDENCE_REFERENCE');return {fact_guard_run_id:fg.run_id,research_output_hash:scoped.scope.research_output_hash,relation_id:evidenceIdentity(e),source_id:e.source_id,support_type:e.support_type}})]));
  const i={version:configuration.contract_version??'script-production-input/1.0',business_id:b,content_job_id:j,format:d.job.format,...scoped,evidence_references,policy_snapshots:policies,research_reference:{run_id:fg.request.input.research_run_id,processing_revision_id:fg.request.input.research_processing_revision_id??null,output_hash:scoped.scope.research_output_hash},fact_guard_run_id:fg.run_id,publication_hold:true,objective:configuration.objective,audience_profile:configuration.audience_profile,language:configuration.language,target_platforms:configuration.target_platforms,profiles:configuration.profiles,production_policy:configuration.production_policy,workflow_version:configuration.workflow_version,prompt_version:configuration.prompt_version,prompt:configuration.prompt,provider};
  if(['script-production-input/2.0','script-production-input/2.1','script-production-input/2.2'].includes(i.version)){
   const e=d.evidence.find(e=>e.id===command.revision_directive_id&&e.type==='human_script_revision_directive');
   if(!e||hash(e.payload)!==e.content_hash||e.payload.scope_hash!==i.scope.content_scope_hash||hash(e.payload.policy_snapshot_refs)!==hash(i.scope.policy_snapshot_refs)||e.payload.previous_execution_id!==command.previous_execution_id)throw Error('REVISION_DIRECTIVE_REQUIRED');
   i.revision_directive={evidence_id:e.id,content_hash:e.content_hash,payload:e.payload};
  }
  if(i.version==='script-production-input/2.2'){i.realization_style_profile=configuration.realization_style_profile;i.claim_realizations=await loadRealizations(this.store.pool,b,j)}
  return validateProductionInput(i);
 }
 async begin(command,input){return this.store.transaction(async c=>{
  const b=input.business_id,j=input.content_job_id;let job=await this.store.requireJob(c,j,b,true);
  if(!command.idempotency_key?.trim())throw Error('IDEMPOTENCY_KEY_REQUIRED');
  const prior=(await c.query('SELECT e.*,o.status FROM script_executions e LEFT JOIN script_outcomes o ON o.execution_id=e.id WHERE e.business_id=$1 AND e.content_job_id=$2 ORDER BY revision DESC',[b,j])).rows;
  const old=prior.find(e=>e.idempotency_key===command.idempotency_key),latest=prior[0];
  if(old){if(old.input_hash!==hash(input))throw Error('IDEMPOTENCY_CONFLICT');if(old.id!==latest.id)throw Error('STALE_SCRIPT_REVISION');if(old.status==='SUCCEEDED')return {...old,reuse:true};throw Error(old.status?'EXPLICIT_NEW_REVISION_REQUIRED':'SCRIPT_OPERATION_IN_PROGRESS')}
  if(latest&&command.previous_execution_id!==latest.id)throw Error('EXPLICIT_NEW_REVISION_REQUIRED');
  if(latest&&!latest.status)throw Error('SCRIPT_OPERATION_IN_PROGRESS');
  if(!['FACT_GUARD_PASSED','PRODUCTION_PACKAGE_READY','SCRIPT_REVIEW_REQUIRED'].includes(job.current_state))throw Error('INVALID_SCRIPT_STATE');
  const latestGuard=(await c.query("SELECT run_id FROM job_state_transitions WHERE job_id=$1 AND to_state='FACT_GUARD_PASSED' ORDER BY sequence DESC LIMIT 1",[j])).rows[0];if(latestGuard?.run_id!==input.fact_guard_run_id)throw Error('STALE_FACT_GUARD');
  const id=randomUUID(),lineage_id=latest?.lineage_id??id,revision=(latest?.revision??0)+1;
  const row=(await c.query('INSERT INTO script_executions(id,business_id,content_job_id,lineage_id,revision,previous_execution_id,fact_guard_run_id,idempotency_key,logical_input_hash,input_hash,input) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *',[id,b,j,lineage_id,revision,latest?.id??null,input.fact_guard_run_id,command.idempotency_key,hash({business_id:b,content_job_id:j,stage:'script-production'}),hash(input),input])).rows[0];
  for(const to of ['SCRIPT_PENDING','SCRIPT_RUNNING'])job=await this.store.transitionInTransaction(c,j,job.state_version,to,{business_id:b,script_execution_id:id,run_id:id,actor_id:'script-production',reason:'script_started',execution_revision:revision,input_hash:hash(input)});
  return row;
 })}
 async capture(execution,artifact){
  assertSafe(artifact);if(hash(artifact.payload)!==artifact.content_hash||artifact.payload.run_id!==execution.id||artifact.payload.request_hash!==execution.input_hash)throw Error('RESPONSE_ARTIFACT_MISMATCH');
  await this.store.pool.query('INSERT INTO script_response_artifacts(execution_id,business_id,content_job_id,payload,content_hash) VALUES($1,$2,$3,$4,$5)',[execution.id,execution.business_id,execution.content_job_id,artifact.payload,artifact.content_hash]);
  const saved=await this.loadResponse(execution.business_id,execution.content_job_id,execution.id);if(saved.content_hash!==artifact.content_hash)throw Error('RESPONSE_ARTIFACT_MISMATCH');return saved;
 }
 async loadResponse(b,j,id){const row=(await this.store.pool.query('SELECT payload,content_hash FROM script_response_artifacts WHERE execution_id=$1 AND business_id=$2 AND content_job_id=$3',[id,b,j])).rows[0];if(!row||hash(row.payload)!==row.content_hash)throw Error('RESPONSE_ARTIFACT_NOT_VERIFIED');return row}
 async finish(e,drafts,packages,metadata,error=null){
  assertSafe(metadata);return this.store.transaction(async c=>{
   let job=await this.store.requireJob(c,e.content_job_id,e.business_id,true);
   const last=(await c.query('SELECT metadata FROM job_state_transitions WHERE job_id=$1 ORDER BY sequence DESC LIMIT 1',[job.id])).rows[0];if(job.current_state!=='SCRIPT_RUNNING'||last?.metadata.script_execution_id!==e.id)throw Error('STALE_SCRIPT_EXECUTION');
   if(!error){const a=await this.loadResponse(e.business_id,e.content_job_id,e.id);if(a.payload.request_hash!==e.input_hash)throw Error('RESPONSE_ARTIFACT_MISMATCH');if(drafts.length!==formats(e.input).length||packages.length!==drafts.length)throw Error('MISSING_PRODUCTION_OUTPUT')}
   await c.query('INSERT INTO script_outcomes(execution_id,business_id,content_job_id,status,validation,metadata) VALUES($1,$2,$3,$4,$5,$6)',[e.id,e.business_id,job.id,error?'REVIEW_REQUIRED':'SUCCEEDED',error?{status:'FAIL',error}:drafts[0].validation,metadata]);
   for(const d of drafts)await c.query('INSERT INTO script_drafts(id,business_id,content_job_id,execution_id,version,format,data,content_hash) VALUES($1,$2,$3,$4,$5,$6,$7,$8)',[d.script_id,e.business_id,job.id,e.id,d.script_version,d.format,d,d.output_hash]);
   for(const p of packages){await c.query('INSERT INTO production_packages(id,business_id,content_job_id,script_id,version,data,content_hash) VALUES($1,$2,$3,$4,$5,$6,$7)',[p.production_package_id,e.business_id,job.id,p.script_id,p.package_version,p,p.content_hash]);for(const s of p.timeline_segments)await c.query('INSERT INTO planned_asset_requirements VALUES($1,$2,$3,$4,$5)',[s.asset_requirement.requirement_id,e.business_id,job.id,p.production_package_id,s.asset_requirement])}
   for(const to of error?['SCRIPT_REVIEW_REQUIRED']:['SCRIPT_APPROVED','PRODUCTION_PACKAGE_READY'])job=await this.store.transitionInTransaction(c,job.id,job.state_version,to,{business_id:e.business_id,script_execution_id:e.id,run_id:e.id,actor_id:'script-production',reason:error?'script_failed':'production_plan_persisted',publication_hold:true});
  });
 }
 async result(b,j,id){const d=await this.store.getJob(j,b);if(!d)throw Error('JOB_NOT_FOUND');const e=d.scriptExecutions.find(e=>e.id===id);if(!e)throw Error('SCRIPT_NOT_FOUND');return {execution:e,scripts:d.scripts.filter(s=>s.lineage_id===e.lineage_id&&s.execution_revision===e.revision),packages:d.productionPackages.filter(p=>d.scripts.some(s=>s.script_id===p.script_id&&s.execution_revision===e.revision)),state:d.job.current_state}}
}
export async function readScripts(c,b,j){
 const scriptExecutions=(await c.query('SELECT e.id,e.lineage_id,e.revision,e.input_hash,e.logical_input_hash,e.fact_guard_run_id,e.created_at,o.status,o.validation,o.metadata FROM script_executions e LEFT JOIN script_outcomes o ON o.execution_id=e.id WHERE e.business_id=$1 AND e.content_job_id=$2 ORDER BY e.revision',[b,j])).rows;
 const scripts=(await c.query('SELECT data FROM script_drafts WHERE business_id=$1 AND content_job_id=$2 ORDER BY version,format',[b,j])).rows.map(r=>r.data);
 const productionPackages=(await c.query('SELECT data FROM production_packages WHERE business_id=$1 AND content_job_id=$2 ORDER BY version,id',[b,j])).rows.map(r=>r.data);
 const scriptProcessingRevisions=(await c.query("SELECT id,payload,content_hash FROM evidence_records WHERE business_id=$1 AND job_id=$2 AND type='script_processing_revision' ORDER BY created_at",[b,j])).rows;
 const approval=(await c.query("SELECT id,payload,content_hash FROM evidence_records WHERE business_id=$1 AND job_id=$2 AND type='human_production_approval' ORDER BY created_at DESC,id DESC LIMIT 1",[b,j])).rows[0];
 let selectedProduction=null;if(approval){if(hash(approval.payload)!==approval.content_hash)throw Error('APPROVAL_HASH_MISMATCH');const a=approval.payload,latest=scriptExecutions.at(-1);if(a.execution_id===latest?.id&&latest.status==='SUCCEEDED'&&scripts.some(s=>s.script_id===a.selected_script_id&&s.output_hash===a.script_hash)&&productionPackages.some(p=>p.production_package_id===a.selected_package_id&&p.content_hash===a.package_hash))selectedProduction={approval_id:approval.id,...a}}
 return {scriptExecutions,scripts,productionPackages,scriptProcessingRevisions,selectedProduction};
}
