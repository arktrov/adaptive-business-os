import {hash,assertSafe} from './research.js';
export const scopeVersion='factual-scope/1.0';
export function makeContentScope(request,output,runId){
 const human=request.input.human_fact_guard_decision;
 const scope={version:scopeVersion,business_id:request.business_id,content_job_id:request.content_job_id,fact_guard_run_id:runId,human_decision_id:human?.evidence_id??null,research_output_hash:request.input.research_output_hash,approved_claim_ids:output.approved_claims,blocked_claim_ids:output.blocked_claims,context_only_claim_ids:output.context_only_claims??[],mandatory_qualifiers:Object.fromEntries(request.input.research.claims.filter(c=>c.qualifier).map(c=>[c.claim_id,c.qualifier])),context_restrictions:Object.fromEntries((output.context_only_claims??[]).map(id=>[id,{allowed_uses:['context','uncertainty','limitation','absence_of_evidence'],factual_assertion_allowed:false}])),script_guardrails:output.script_guardrails,policy_snapshot_refs:human?.payload.policies??{},publication_hold:true};
 return {...scope,content_scope_hash:hash(scope)};
}
export function validateContentScope(scope,output,research){
 assertSafe(scope);const {content_scope_hash,...body}=scope;
 if(scope.version!==scopeVersion||hash(body)!==content_scope_hash||!scope.business_id||!scope.content_job_id||!scope.fact_guard_run_id||scope.publication_hold!==true)throw Error('INVALID_CONTENT_SCOPE');
 const groups=[scope.approved_claim_ids,scope.blocked_claim_ids,scope.context_only_claim_ids];
 if(groups.some(g=>!Array.isArray(g))||new Set(groups.flat()).size!==groups.flat().length||groups.flat().some(id=>!research.claims.some(c=>c.claim_id===id)))throw Error('INVALID_CONTENT_SCOPE');
 if(hash(groups)!==hash([output.approved_claims,output.blocked_claims,output.context_only_claims??[]])||hash(scope.script_guardrails)!==hash(output.script_guardrails))throw Error('SCOPE_OUTPUT_MISMATCH');
 for(const c of research.claims)if(c.qualifier&&scope.mandatory_qualifiers[c.claim_id]!==c.qualifier)throw Error('MISSING_SCOPE_QUALIFIER');
 for(const id of scope.context_only_claim_ids){const r=scope.context_restrictions[id];if(!r||r.factual_assertion_allowed!==false||hash(r.allowed_uses)!==hash(['context','uncertainty','limitation','absence_of_evidence']))throw Error('INVALID_CONTEXT_RESTRICTION')}
 if(output.decision==='PASS'){
  if(output.required_corrections.length||!scope.approved_claim_ids.length||groups.flat().length!==research.claims.length||!scope.human_decision_id||!scope.script_guardrails.length)throw Error('UNSAFE_PASS_SCOPE');
  for(const kind of ['brand','quality']){const ref=scope.policy_snapshot_refs[kind];if(!ref?.evidence_id||!ref.version||!ref.content_hash||!ref.evidence_hash)throw Error('MISSING_SCOPE_POLICY')}
  for(const id of scope.approved_claim_ids){const c=research.claims.find(c=>c.claim_id===id);if(!['verified','mostly_verified'].includes(c.verification_status)||((c.needs_qualification||c.verification_status==='mostly_verified')&&!c.qualifier)||!research.evidence.some(e=>e.claim_id===id&&e.support_type==='supports')||research.evidence.some(e=>e.claim_id===id&&e.support_type==='contradicts'))throw Error('UNSAFE_APPROVED_CLAIM')}
 }
 return scope;
}
// Input contract only: no Script Agent or generation is started here.
export function scriptStageInput(run,business,job){
 if(run.business_id!==business||run.content_job_id!==job||run.status!=='SUCCEEDED'||run.output?.decision!=='PASS')throw Error('SCOPE_NOT_APPROVED');
 if(hash(run.output)!==run.output_hash||hash(run.request)!==run.canonical_input_hash)throw Error('SCOPE_RECORD_HASH_MISMATCH');
 const scope=validateContentScope(run.output.downstream_scope,run.output,run.request.input.research);
 if(scope.business_id!==business||scope.content_job_id!==job||scope.fact_guard_run_id!==run.run_id||scope.research_output_hash!==run.request.input.research_output_hash)throw Error('SCOPE_REFERENCE_MISMATCH');
 validateScopeBinding(scope,run.request,run.run_id);
 return {scope,approved_claims:run.request.input.research.claims.filter(c=>scope.approved_claim_ids.includes(c.claim_id)),context_claims:run.request.input.research.claims.filter(c=>scope.context_only_claim_ids.includes(c.claim_id)).map(c=>({claim_id:c.claim_id,statement:c.statement,restriction:scope.context_restrictions[c.claim_id]}))};
}
export function validateScriptClaimUses(input,uses){
 for(const u of uses){if(input.scope.blocked_claim_ids.includes(u.claim_id))throw Error('BLOCKED_CLAIM_USE');if(u.use==='factual_assertion'){if(!input.scope.approved_claim_ids.includes(u.claim_id))throw Error('UNAPPROVED_FACTUAL_USE');const q=input.scope.mandatory_qualifiers[u.claim_id];if(q&&u.qualifier!==q)throw Error('MISSING_MANDATORY_QUALIFIER')}else if(!input.scope.context_restrictions[u.claim_id]?.allowed_uses.includes(u.use))throw Error('INVALID_CONTEXT_USE');const required=input.scope.mandatory_qualifiers[u.claim_id];if(required&&u.qualifier!==required)throw Error('MISSING_MANDATORY_QUALIFIER')}
 return true;
}

export function validateScopeBinding(scope,request,runId){
 if(scope.business_id!==request.business_id||scope.content_job_id!==request.content_job_id||scope.fact_guard_run_id!==runId||scope.research_output_hash!==request.input.research_output_hash)throw Error('SCOPE_REFERENCE_MISMATCH');
 const h=request.input.human_fact_guard_decision;
 if(scope.human_decision_id!==(h?.evidence_id??null)||hash(scope.policy_snapshot_refs)!==hash(h?.payload.policies??{}))throw Error('SCOPE_BINDING_MISMATCH');
 for(const [id,d] of Object.entries(h?.payload.decisions??{}))if(d==='BLOCKED'&&!scope.blocked_claim_ids.includes(id)||d==='CONTEXT_ONLY'&&!scope.context_only_claim_ids.includes(id))throw Error('HUMAN_SCOPE_MISMATCH');
 return scope;
}
