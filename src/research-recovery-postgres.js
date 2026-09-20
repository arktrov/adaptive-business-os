import {randomUUID} from 'node:crypto';
import {ResearchRepository} from './research-postgres.js';
import {assertSafe,hash,validateResearch,evidenceIdentity} from './domain/research.js';
export class ResearchRecoveryRepository extends ResearchRepository {
 async persistRecovery(command,artifact,output,versions){
  const {business_id:b,content_job_id:j,original_run_id:run,reason}=command;
  assertSafe(versions);validateResearch(output);if(output.research_status!=='COMPLETE')throw Error('RECOVERY_NOT_COMPLETE');
  return this.store.transaction(async c=>{
   let job=await this.store.requireJob(c,j,b,true);
   const source=(await c.query('SELECT a.*,o.status,o.error_category,o.metadata,m.lineage_id,p.canonical_input_hash FROM research_attempts a JOIN research_outcomes o USING(run_id) JOIN research_operations p ON p.id=a.operation_id JOIN research_attempt_lineage m USING(run_id) WHERE a.business_id=$1 AND a.content_job_id=$2 AND a.run_id=$3',[b,j,run])).rows[0];
   if(!source||source.status!=='FAILED'||artifact.payload.run_id!==run||artifact.payload.request_hash!==source.canonical_input_hash)throw Error('RECOVERY_SOURCE_INVALID');
   const latest=(await c.query('SELECT run_id FROM research_attempt_lineage WHERE business_id=$1 AND content_job_id=$2 ORDER BY attempt_number DESC LIMIT 1',[b,j])).rows[0];
   if(latest?.run_id!==run)throw Error('STALE_RECOVERY_SOURCE');
   const prior=(await c.query('SELECT * FROM research_processing_revisions WHERE artifact_id=$1 AND versions=$2 AND business_id=$3 AND content_job_id=$4',[artifact.id,versions,b,j])).rows[0];
   if(prior){if(prior.output_hash!==hash(output))throw Error('PROCESSING_VERSION_CONFLICT');return prior}
   if(job.current_state!=='FAILED')throw Error('INVALID_RECOVERY_STATE');
   const id=randomUUID(),revision=Number((await c.query('SELECT COALESCE(MAX(revision),0)+1 n FROM research_processing_revisions WHERE original_run_id=$1',[run])).rows[0].n);
   const row=(await c.query('INSERT INTO research_processing_revisions(id,business_id,content_job_id,lineage_id,original_run_id,artifact_id,artifact_hash,revision,versions,previous_failure,reason,output,output_hash) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *',[id,b,j,source.lineage_id,run,artifact.id,artifact.content_hash,revision,versions,{status:source.status,error_category:source.error_category,diagnostics:source.metadata.diagnostics??null},reason,output,hash(output)])).rows[0];
   for(const x of output.claims)await c.query('INSERT INTO recovered_research_claims VALUES($1,$2,$3,$4,$5)',[b,j,id,x.claim_id,x]);
   for(const x of output.sources)await c.query('INSERT INTO recovered_research_sources VALUES($1,$2,$3,$4,$5)',[b,j,id,x.source_id,x]);
   for(const x of output.evidence)await c.query('INSERT INTO recovered_research_evidence VALUES($1,$2,$3,$4,$5,$6,$7)',[b,j,id,evidenceIdentity(x),x.claim_id,x.source_id,x]);
   const meta={business_id:b,run_id:run,processing_revision_id:id,processing_revision:revision,provider_call_executed:false,artifact_id:artifact.id,artifact_hash:artifact.content_hash,lineage_id:source.lineage_id,output_hash:row.output_hash,processing_versions:versions,actor_type:'service',actor_id:'research-recovery',reason};
   job=await this.store.transitionInTransaction(c,j,job.state_version,'RESEARCH_PENDING',meta);
   await this.store.transitionInTransaction(c,j,job.state_version,'RESEARCH_COMPLETE',meta);
   return row;
  });
 }
}
