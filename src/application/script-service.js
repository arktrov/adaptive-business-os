import {randomUUID} from 'node:crypto';
import {buildDrafts,buildProductionPackage} from '../domain/script-production.js';
export class ScriptService {
 constructor({repository,provider,configuration}){if(typeof provider?.describe!=='function'||typeof provider.execute!=='function')throw Error('INVALID_SCRIPT_PROVIDER');this.repository=repository;this.provider=provider;this.configuration=configuration}
 async prepare(command){return this.repository.input(command,this.configuration,this.provider.describe())}
 async run(command){return this.repository.withJobLock(command.business_id,command.content_job_id,async()=>{
  const input=await this.prepare(command);
  if(this.provider.preflight)this.provider.preflight(input);
  const execution=await this.repository.begin(command,input);
  if(execution.reuse)return this.repository.result(input.business_id,input.content_job_id,execution.id);
  let metadata={provider_request_id:null,external_calls:0},persisted=false;
  try{
   const response=await this.provider.execute(input,{run_id:execution.id,input_hash:execution.input_hash,persistResponse:async artifact=>{const r=await this.repository.capture(execution,artifact);persisted=true;return r}});
   metadata=response.metadata;
   if(!persisted)throw Error('RESPONSE_ARTIFACT_NOT_VERIFIED');
   const drafts=buildDrafts(input,response.output,{script_ids:response.output.scripts.map(()=>randomUUID()),version:execution.revision,lineage_id:execution.lineage_id,created_at:new Date().toISOString()},metadata);
   const packages=drafts.map(d=>buildProductionPackage(input,d,randomUUID()));
   await this.repository.finish(execution,drafts,packages,metadata);
  }catch(e){
   // Exceptions may contain credentials. Only registered diagnostic codes cross this boundary.
   const code=/^[A-Z][A-Z0-9_]{2,80}$/.test(e.message)?e.message:'SCRIPT_EXECUTION_FAILED';
   if(typeof this.provider.diagnostics==='function')metadata=this.provider.diagnostics();
   await this.repository.finish(execution,[],[],metadata,code);
  }
  return this.repository.result(input.business_id,input.content_job_id,execution.id);
 })}
}
