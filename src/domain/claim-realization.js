import {hash,assertSafe} from './research.js';
const need=(v,c)=>{if(!v)throw Error(c)},nonempty=v=>typeof v==='string'&&v.trim().length>0;
const keys=['realization_id','business_id','claim_id','language','style_profile','realization_text','required_qualifier_refs','qualifier_semantics_preserved','allowed_usage_mode','source_claim_hash','fact_guard_scope_hash','version','status','content_hash','created_at','approved_at','approved_by','previous_content_hash'];
export function validateRealization(r){
 assertSafe(r);need(r&&Object.keys(r).length===keys.length&&keys.every(k=>Object.hasOwn(r,k)),'REALIZATION_SCHEMA_INVALID');
 for(const k of ['realization_id','business_id','claim_id','language','style_profile','realization_text','source_claim_hash','fact_guard_scope_hash'])need(nonempty(r[k]),'REALIZATION_SCHEMA_INVALID');
 need(Number.isInteger(r.version)&&r.version>0&&['PROPOSED','APPROVED','RETIRED'].includes(r.status)&&['DIRECT','QUALIFIED','CONTEXT_ONLY'].includes(r.allowed_usage_mode)&&Array.isArray(r.required_qualifier_refs)&&Number.isFinite(Date.parse(r.created_at)),'REALIZATION_SCHEMA_INVALID');
 need([true,false,null].includes(r.qualifier_semantics_preserved),'REALIZATION_SCHEMA_INVALID');
 if(r.status==='PROPOSED')need(r.approved_at===null&&r.approved_by===null,'UNAPPROVED_REALIZATION');
 if(r.status==='APPROVED')need(r.qualifier_semantics_preserved===true&&nonempty(r.approved_by)&&Number.isFinite(Date.parse(r.approved_at)),'REALIZATION_APPROVAL_REQUIRED');
 need(r.version===1?r.previous_content_hash===null:nonempty(r.previous_content_hash),'REALIZATION_HISTORY_INVALID');
 const {content_hash,...body}=r;need(hash(body)===content_hash,'REALIZATION_HASH_MISMATCH');return r;
}
export function qualifierRefs(input,id){const q=input.scope.mandatory_qualifiers[id];return q?[{claim_id:id,scope_hash:input.scope.content_scope_hash,qualifier_hash:hash(q)}]:[]}
export function checkRealizationBinding(r,input){
 validateRealization(r);need(r.business_id===input.business_id&&r.fact_guard_scope_hash===input.scope.content_scope_hash&&r.language===input.language&&r.style_profile===input.realization_style_profile,'REALIZATION_SCOPE_MISMATCH');
 need(!input.scope.blocked_claim_ids.includes(r.claim_id),'BLOCKED_CLAIM_USE');
 const context=input.scope.context_only_claim_ids.includes(r.claim_id),c=(context?input.context_claims:input.approved_claims).find(c=>c.claim_id===r.claim_id);need(c&&hash(c)===r.source_claim_hash,'REALIZATION_CLAIM_MISMATCH');
 need(hash(r.required_qualifier_refs)===hash(qualifierRefs(input,r.claim_id)),'REALIZATION_QUALIFIER_MISMATCH');
 need(r.allowed_usage_mode===(context?'CONTEXT_ONLY':input.scope.mandatory_qualifiers[r.claim_id]?'QUALIFIED':'DIRECT'),'REALIZATION_USAGE_MISMATCH');
 if(context)need(r.realization_text.startsWith(input.production_policy.context_label+' '),'CONTEXT_RESTRICTION_FAILED');return r;
}
export function proposeRealization(input,{realization_id,claim_id,realization_text,created_at}){
 const context=input.scope.context_only_claim_ids.includes(claim_id),claim=(context?input.context_claims:input.approved_claims).find(c=>c.claim_id===claim_id);need(claim,'UNAPPROVED_FACTUAL_USE');
 const body={realization_id,business_id:input.business_id,claim_id,language:input.language,style_profile:input.realization_style_profile,realization_text,required_qualifier_refs:qualifierRefs(input,claim_id),qualifier_semantics_preserved:null,allowed_usage_mode:context?'CONTEXT_ONLY':input.scope.mandatory_qualifiers[claim_id]?'QUALIFIED':'DIRECT',source_claim_hash:hash(claim),fact_guard_scope_hash:input.scope.content_scope_hash,version:1,status:'PROPOSED',created_at,approved_at:null,approved_by:null,previous_content_hash:null};return checkRealizationBinding({...body,content_hash:hash(body)},input);
}
// Trusted human-review application boundary only; no HTTP approval endpoint.
export function reviseRealization(previous,{status,approved_by=null,approved_at=null,qualifier_semantics_preserved=null,created_at}){
 validateRealization(previous);need((previous.status==='PROPOSED'&&status==='APPROVED')||(previous.status==='APPROVED'&&status==='RETIRED'),'INVALID_REALIZATION_TRANSITION');
 const {content_hash,...old}=previous,body={...old,status,version:previous.version+1,previous_content_hash:content_hash,created_at,...(status==='APPROVED'?{approved_by,approved_at,qualifier_semantics_preserved}:{})};return validateRealization({...body,content_hash:hash(body)});
}
export function approvedRealizationFor(input,segment){
 need(input.version==='script-production-input/2.2','UNSUPPORTED_FACTUAL_ASSERTION');
 const candidates=(input.claim_realizations??[]).filter(r=>r.claim_id===segment.claim_id&&r.realization_text===segment.text);need(candidates.length===1,'APPROVED_REALIZATION_REQUIRED');
 const r=checkRealizationBinding(candidates[0],input);need(r.status==='APPROVED','APPROVED_REALIZATION_REQUIRED');return r;
}

export function realizationReference(input,segment){
 if(input.version!=='script-production-input/2.2'||!segment.claim_id)return null;
 const rows=(input.claim_realizations??[]).filter(r=>r.claim_id===segment.claim_id&&r.realization_text===segment.text&&r.status==='APPROVED');if(!rows.length)return null;
 const r=approvedRealizationFor(input,segment);return {realization_id:r.realization_id,version:r.version,content_hash:r.content_hash,source_claim_hash:r.source_claim_hash,fact_guard_scope_hash:r.fact_guard_scope_hash};
}
