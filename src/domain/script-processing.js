import {hash,assertSafe} from './research.js';import {resolveScriptProposal,claimUsageResolverVersion} from './claim-usage.js';import {buildDrafts,buildProductionPackage} from './script-production.js';import {parseScriptResponse} from '../providers/script-response.js';
export function planScriptRecovery(execution,artifact,identity){
 if(!['FAILED','REVIEW_REQUIRED'].includes(execution.status)||execution.input.version!=='script-production-input/2.0'||hash(execution.input)!==execution.input_hash||hash(artifact.payload)!==artifact.content_hash||artifact.payload.request_hash!==execution.input_hash||artifact.payload.run_id!==execution.id)throw Error('RECOVERY_SOURCE_MISMATCH');
 const input={...execution.input,version:'script-production-input/2.1'},original=parseScriptResponse(artifact),resolved=resolveScriptProposal(input,original);
 const ref={processing_revision_id:identity.id,source_execution_id:execution.id,source_input_hash:execution.input_hash,response_artifact_hash:artifact.content_hash,resolver_version:claimUsageResolverVersion};
 const drafts=buildDrafts(input,resolved.proposal,{script_ids:identity.script_ids,version:execution.revision,lineage_id:execution.lineage_id,created_at:identity.created_at,processing_revision:ref},execution.metadata);
 const packages=drafts.map((d,n)=>buildProductionPackage(input,d,identity.package_ids[n]));
 const payload={version:'script-processing-revision/1.0',...ref,business_id:execution.business_id,content_job_id:execution.content_job_id,processing_input_hash:hash(input),normalized_proposal_hash:hash(resolved.proposal),resolution_audit:resolved.audit,script_ids:identity.script_ids,package_ids:identity.package_ids,created_at:identity.created_at,external_calls:0,repairs:[],publication_hold:true,creative_review:'HUMAN_REVIEW_REQUIRED'};assertSafe(payload);
 return {payload,drafts,packages};
}
