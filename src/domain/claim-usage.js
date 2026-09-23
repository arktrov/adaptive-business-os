import {approvedRealizationFor,realizationReference} from './claim-realization.js';
import {hash,assertSafe} from './research.js';
export const claimUsageResolverVersion='claim-usage/1.0';
// Typography/whitespace normalization only; no lexical inference of scientific equivalence.
export const equivalentText=s=>s.normalize('NFC').trim().replace(/\s+/gu,' ');
export function resolveClaimUsage(input,segment){
 const id=segment.claim_id;if(id===null){if(!input.production_policy.neutral_phrases.includes(segment.text))throw Error('UNSUPPORTED_FACTUAL_ASSERTION');return 'NONE'}
 if(input.scope.blocked_claim_ids.includes(id))throw Error('BLOCKED_CLAIM_USE');
 const context=input.scope.context_only_claim_ids.includes(id),approved=input.scope.approved_claim_ids.includes(id);
 if(!context&&!approved)throw Error('UNAPPROVED_FACTUAL_USE');
 const c=(context?input.context_claims:input.approved_claims).find(c=>c.claim_id===id);if(!c)throw Error('UNAPPROVED_FACTUAL_USE');
 const q=input.scope.mandatory_qualifiers[id]??'',required=context?'CONTEXT_ONLY':q?'QUALIFIED':'DIRECT';
 const exact=(context?input.production_policy.context_label+' ':'')+c.statement+(q?' '+q:'');
 if(equivalentText(segment.text)!==equivalentText(exact)){if(input.version==='script-production-input/2.2'){approvedRealizationFor(input,segment);return required}throw Error(context?'CONTEXT_RESTRICTION_FAILED':q?'QUALIFIER_OR_CLAIM_NOT_PRESERVED':'UNSUPPORTED_FACTUAL_ASSERTION')}
 return required;
}
export function resolveScriptProposal(input,proposal){
 assertSafe(proposal);if(!Array.isArray(proposal?.scripts))throw Error('SCRIPT_SCHEMA_INVALID');const canonical=structuredClone(proposal),audit=[];
 for(const s of canonical.scripts){if(!Array.isArray(s.segments))throw Error('SCRIPT_SCHEMA_INVALID');for(const seg of s.segments){const declared=seg.usage_type,usage=resolveClaimUsage(input,seg);audit.push({segment_id:seg.segment_id,claim_id:seg.claim_id,provider_declared_usage:declared,canonical_usage:usage,text_hash:hash(seg.text),qualifier_match:realizationReference(input,seg)?'HUMAN_APPROVED_REALIZATION':'EXACT_WITH_TYPOGRAPHIC_NORMALIZATION',resolver_version:claimUsageResolverVersion,...(input.version==='script-production-input/2.2'?{approved_realization_reference:realizationReference(input,seg)}:{})});seg.usage_type=usage}}
 return {proposal:canonical,audit};
}
// Preparation only. Never automatically insert text or retime narration/visuals.
export function prepareQualifierRepair(input,segment){
 if(input.scope.blocked_claim_ids.includes(segment.claim_id)||!input.scope.approved_claim_ids.includes(segment.claim_id))throw Error('UNAPPROVED_FACTUAL_USE');
 const c=input.approved_claims.find(c=>c.claim_id===segment.claim_id),q=input.scope.mandatory_qualifiers[segment.claim_id];
 if(!q||equivalentText(segment.text)!==equivalentText(c.statement))throw Error('UNSAFE_QUALIFIER_REPAIR');
 return {status:'HUMAN_REVIEW_REQUIRED',original_text_hash:hash(segment.text),proposed_text:c.statement+' '+q,inserted_qualifier:q,claim_id:segment.claim_id,external_calls:0,auto_apply:false};
}
