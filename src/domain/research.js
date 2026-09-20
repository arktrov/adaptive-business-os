import {validateContentScope} from './content-scope.js';
import {createHash} from 'node:crypto';
export function canonical(value) {
 if(value===null||typeof value==='boolean'||typeof value==='string')return JSON.stringify(value);
 if(typeof value==='number'&&Number.isFinite(value))return JSON.stringify(value);
 if(Array.isArray(value))return '['+value.map(canonical).join(',')+']';
 if(value&&Object.getPrototypeOf(value)===Object.prototype)return '{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+canonical(value[k])).join(',')+'}';
 throw Error('INVALID_JSON');
}
export const hash=value=>createHash('sha256').update(canonical(value)).digest('hex');
export function jobIdentity(i){return {business_id:i.business_id,content_item_id:i.content_item_id??null,working_title:i.working_title??null,format:i.format,workflow_version:i.workflow_version??'phase-1.0',brand_rule_version:i.brand_rule_version??'unconfigured',quality_policy_version:i.quality_policy_version??'quality-1.0'}}
export function assertSafe(value){
 const walk=(x)=>{if(typeof x==='string'&&(/(?:sk-(?:proj-)?|gh[pousr]_)[A-Za-z0-9_-]{16,}|-----BEGIN .*PRIVATE KEY|postgres(?:ql)?:\/\/[^\s]+|Bearer\s+\S+/i.test(x)))throw Error('UNSAFE_PAYLOAD');if(x&&typeof x==='object')for(const [k,v] of Object.entries(x)){if(/^(?:api[_-]?key|authorization|password|secret|access[_-]?token|chain_of_thought|reasoning_trace)$/i.test(k))throw Error('UNSAFE_PAYLOAD');walk(v)}};
 walk(value);canonical(value);
}
export const evidenceIdentity=e=>hash({claim_id:e.claim_id,source_id:e.source_id,support_type:e.support_type,evidence_reference:e.evidence_reference});
const fail=()=>{throw Error('PARSING_FAILURE')};
const text=x=>typeof x==='string'&&x.trim().length>0;
const strings=x=>Array.isArray(x)&&x.every(text);
const distinct=x=>new Set(x).size===x.length;
const keys=(x,allowed)=>{if(!x||Object.keys(x).some(k=>!allowed.includes(k)))fail()};
export function validateResearch(r){
 assertSafe(r);
 keys(r,['summary','research_status','fact_status','publish_recommendation','main_source','additional_sources','claims','sources','evidence','uncertainties','contradictions','open_questions','overclaim_risks']);
 if(!['verified','mostly_verified','partially_verified','disputed','unverified','false','outdated'].includes(r.fact_status)||!['proceed','proceed_with_caution','rewrite_and_recheck','hold','reject'].includes(r.publish_recommendation))fail();
 if(!r||!text(r.summary)||!['COMPLETE','REVIEW_REQUIRED','REJECTED'].includes(r.research_status))fail();
 for(const k of ['claims','sources','evidence'])if(!Array.isArray(r[k]))fail();
 for(const k of ['uncertainties','contradictions','open_questions','overclaim_risks'])if(!strings(r[k]))fail();
 if(!strings(r.additional_sources))fail();
 for(const c of r.claims){keys(c,['claim_id','statement','claim_type','importance','verification_status','needs_qualification','qualifier']);if(!['claim_id','statement','claim_type','importance','verification_status'].every(k=>text(c[k]))||typeof c.needs_qualification!=='boolean'||typeof c.qualifier!=='string')fail();}
 for(const s of r.sources){keys(s,['source_id','url','title','publisher','source_type','source_strength','retrieved_at','published_at','rights_status']);if(!['source_id','url','title','source_type','rights_status'].every(k=>text(s[k]))||!Number.isFinite(s.source_strength)||s.source_strength<0||s.source_strength>100||!Number.isFinite(Date.parse(s.retrieved_at))||(s.published_at!==null&&!Number.isFinite(Date.parse(s.published_at))))fail();try{const u=new URL(s.url);if(!['http:','https:'].includes(u.protocol)||u.username||u.password)fail()}catch{fail()}}
 const claims=r.claims.map(c=>c.claim_id),sources=r.sources.map(s=>s.source_id);
 if(!distinct(claims)||!distinct(sources)||!distinct(r.additional_sources)||!distinct(r.evidence.map(evidenceIdentity)))fail();
 if(r.main_source!==null&&!sources.includes(r.main_source))fail();
 if(r.additional_sources.some(s=>!sources.includes(s)))fail();
 for(const e of r.evidence){keys(e,['claim_id','source_id','support_type','evidence_reference','confidence']);if(!claims.includes(e.claim_id)||!sources.includes(e.source_id)||!['supports','contradicts','context'].includes(e.support_type)||!text(e.evidence_reference)||!Number.isFinite(e.confidence)||e.confidence<0||e.confidence>1)fail();}
 if(r.research_status==='COMPLETE'&&(!claims.length||!r.main_source||claims.some(id=>!r.evidence.some(e=>e.claim_id===id))))fail();
 return r;
}
export function validateFactGuard(r,research){
 assertSafe(r);
 keys(r,['decision','required_corrections','script_guardrails','blocked_claims','approved_claims','warnings','reasoning_summary','approved_hook','context_only_claims','downstream_scope']);
 if(!r||!['PASS','REVIEW_REQUIRED','REJECT'].includes(r.decision)||!text(r.reasoning_summary)||typeof r.approved_hook!=='string')fail();
 for(const k of ['required_corrections','script_guardrails','blocked_claims','approved_claims','warnings'])if(!strings(r[k]))fail();
 if(r.context_only_claims!==undefined&&!strings(r.context_only_claims))fail();
 const context=r.context_only_claims??[];
 const ids=research.claims.map(c=>c.claim_id);
 if([...r.blocked_claims,...r.approved_claims,...context].some(id=>!ids.includes(id))||!distinct([...r.blocked_claims,...r.approved_claims,...context]))fail();
 if(r.downstream_scope)validateContentScope(r.downstream_scope,r,research);
 if(!r.downstream_scope&&r.decision==='PASS'&&(r.blocked_claims.length||!r.approved_claims.length||r.approved_claims.length!==ids.length||research.research_status!=='COMPLETE'||r.approved_claims.some(id=>!research.evidence.some(e=>e.claim_id===id&&e.support_type==='supports'))))fail();
 return r;
}
export function metadata(m){
 assertSafe(m);if(!m||typeof m.synthetic!=='boolean')throw Error('PARSING_FAILURE');
 const result={synthetic:m.synthetic,provider_request_id:m.provider_request_id??null,usage:m.usage??null,cost:m.cost??null,...(m.diagnostics?{diagnostics:m.diagnostics}:{})};assertSafe(result);return result;
}
