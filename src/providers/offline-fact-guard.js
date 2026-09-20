import {makeContentScope} from '../domain/content-scope.js';
import {verifyPolicySnapshot} from '../config/content-policies.js';
// Deterministic evidence/qualification review, not a test fixture or independent source verification.
// No network, filesystem, provider or credential capability.
import {validateResearch,validateFactGuard} from '../domain/research.js';
export const offlineFactGuardPrompt=Object.freeze({id:'fact-guard-offline',version:'2.0',content:'Review only persisted ResearchResult and evidence. Context is not support. Preserve qualifications, uncertainties, contradictions, open questions, overclaim risks and rights limitations. Human approval permits review only. Never perform external research or generate a script.'});
export class OfflineFactGuardProvider {
 describe(){return {provider:'offline-rules',model:'persisted-evidence-review',adapter_version:'2.0',configuration:{rules_version:'fact-guard-evidence/2.0',external_calls:0}}}
 async execute(request,{run_id}){
  const human=request.input.human_fact_guard_decision?.payload;
  const contextOnly=[];
  const r=validateResearch(request.input.research),approved=[],blocked=[],corrections=[],guards=[...(request.input.guardrails??[])],warnings=['Offline evidence-contract review only; no independent verification, no new web research and no publication approval.'];
  for(const c of r.claims){
   const es=r.evidence.filter(e=>e.claim_id===c.claim_id),supports=es.some(e=>e.support_type==='supports'),context=es.some(e=>e.support_type==='context'),contradicted=es.some(e=>e.support_type==='contradicts');let reason=null;
   if(!supports)reason=context?'CONTEXT_ONLY: no direct supporting relation. Retain only as a limitation, uncertainty, absence-of-evidence note or contextual guardrail; do not use as an independently supported factual assertion.':'UNSUPPORTED: no direct supporting evidence.';
   else if(contradicted)reason='CONTRADICTORY_EVIDENCE: supporting and contradicting evidence require review.';
   else if(!['verified','mostly_verified'].includes(c.verification_status))reason='INSUFFICIENT_VERIFICATION: '+c.verification_status+'; withhold factual claim pending review of qualification and evidence.';
   else if((c.needs_qualification||c.verification_status==='mostly_verified')&&!c.qualifier.trim())reason='MISSING_QUALIFICATION: qualified wording must be established before use.';
   const disposition=human?.decisions[c.claim_id];
   if(disposition==='BLOCKED'){blocked.push(c.claim_id);guards.push(c.claim_id+': HUMAN BLOCKED FOR SCRIPT. Do not use as factual script content.');}
   else if(disposition==='CONTEXT_ONLY'&&context&&!supports){contextOnly.push(c.claim_id);guards.push(c.claim_id+': CONTEXT_ONLY. Use solely as context, uncertainty, limitation or absence-of-evidence; never as an independently supported factual assertion.');}
   else if(reason){blocked.push(c.claim_id);corrections.push(c.claim_id+': '+reason);guards.push(c.claim_id+': '+reason)}else approved.push(c.claim_id);
   if(c.qualifier)guards.push(c.claim_id+' — mandatory qualification: '+c.qualifier);
  }
  guards.push(...r.overclaim_risks.map(x=>'Do not overclaim: '+x));
  guards.push('Approved claim IDs remain subject to every attached qualifier and global guardrail. Approval is not permission to script or publish.');
  if(human?.publication_hold===true)guards.push('Publication HOLD remains in force. Human Fact Guard review is not publication approval.');
  if((r.publish_recommendation==='hold'&&!human?.publication_hold)||r.publish_recommendation==='reject')corrections.push('Preserve publish_recommendation='+r.publish_recommendation+'; human research approval does not clear the publication hold.');
  warnings.push(...r.uncertainties.map(x=>'PERSISTED UNCERTAINTY: '+x),...r.contradictions.map(x=>'PERSISTED CONTRADICTION: '+x),...r.open_questions.map(x=>'PERSISTED OPEN QUESTION: '+x));
  warnings.push(...r.sources.map(s=>s.source_id+' — rights/media reuse: '+s.rights_status));
  if(request.input.human_review)warnings.push(...(request.input.human_review.payload.known_limitations??[]).map(x=>'HUMAN REVIEW LIMITATION: '+x));
  if(!request.input.policy_context?.quality_policy_snapshot||!Object.keys(request.input.policy_context?.brand_snapshot??{}).length){warnings.push('Detailed brand/quality policy content is not persisted in this input; version identifiers alone are not substantive rules.');corrections.push('Review missing detailed brand/quality policy before downstream approval; do not invent policy content.')}
  if(!human)corrections.push('Missing persisted human scope decision.');
  for(const [kind,key] of [['brand','brand_snapshot'],['quality','quality_policy_snapshot']]){try{verifyPolicySnapshot(request.input.policy_context?.[key],request.business_id,kind)}catch{corrections.push('Missing or invalid authoritative '+kind+' policy snapshot.')}}
  if(human){warnings.push('Human scope decision applied; excluded claims remain historically blocked and context-only claims are not factual approvals.');for(const kind of ['brand_snapshot','quality_policy_snapshot']){const p=request.input.policy_context?.[kind];if(p)guards.push('Bound '+p.kind+' policy '+p.version+'; preserve all requirements in the immutable policy snapshot.');}}
  const decision=r.research_status==='REJECTED'||r.publish_recommendation==='reject'?'REJECT':corrections.length?'REVIEW_REQUIRED':!approved.length?'REVIEW_REQUIRED':'PASS';
  const output={decision,...(human?{context_only_claims:contextOnly}:{}),required_corrections:corrections,script_guardrails:guards,approved_claims:approved,blocked_claims:blocked,warnings,reasoning_summary:'Deterministic review of persisted evidence: '+approved.length+' claims have direct support and sufficient stored verification, subject to qualifications; '+blocked.length+' are blocked; '+contextOnly.length+' are context-only. PASS approves only the restricted downstream factual scope. Context is not direct support; publication HOLD and all release gates remain independent.',approved_hook:''};
  output.downstream_scope=makeContentScope(request,output,run_id);
  validateFactGuard(output,r);
  return {output,metadata:{synthetic:false,provider_request_id:'offline:'+run_id,usage:{external_calls:0},cost:{actual:0,currency:'USD'},diagnostics:{processing_version:'fact-guard-evidence/2.0',review_mode:'OFFLINE_PERSISTED_EVIDENCE_ONLY',external_calls:0,independent_source_verification:false}}};
 }
}
