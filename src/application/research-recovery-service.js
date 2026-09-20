import {assertSafe,validateResearch,hash} from '../domain/research.js';
export class ResearchRecoveryService {
 constructor({repository,processArtifact,versions}){Object.assign(this,{repository,processArtifact,versions})}
 async recover(command){
  assertSafe(command);if(command.explicit_recovery!==true||!command.reason?.trim())throw Error('EXPLICIT_RECOVERY_REQUIRED');
  return this.repository.withJobLock(command.business_id,command.content_job_id,async()=>{
   const artifact=await this.repository.loadProviderResponse(command.business_id,command.content_job_id,command.original_run_id);
   if(artifact.id!==command.artifact_id||artifact.content_hash!==command.artifact_hash)throw Error('RECOVERY_ARTIFACT_MISMATCH');
   const processed=await this.processArtifact(artifact);
   if(!processed.success)throw Error('RECOVERY_VALIDATION_FAILED');
   validateResearch(processed.output);if(hash(processed.output)!==processed.output_hash)throw Error('RECOVERY_OUTPUT_HASH_MISMATCH');
   return this.repository.persistRecovery(command,artifact,processed.output,this.versions);
  });
 }
}
