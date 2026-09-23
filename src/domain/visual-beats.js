import {hash} from './research.js';
const need=(ok,code)=>{if(!ok)throw Error(code)};
export const beatFields=['visual_beat_id','narration_segment_id','duration_target','claim_ids','visual_type','visual_classification','visual_intent','concrete_visual_brief','motion_intent','transition_intent','factual_sensitivity','source_requirement','rights_requirement','disclosure_requirement','generation_eligibility'];
const types=['OFFICIAL_SOURCE_MEDIA','ORIGINAL_DATA_VISUALIZATION','CONTROLLED_DIAGRAM','GENERATED_STILL','IMAGE_TO_VIDEO','TEXT_TO_VIDEO','STOCK_OR_LICENSED_MEDIA','MOTION_GRAPHICS','REMOTION_NATIVE'];
export function validateBeats(input,script,duration){
 const beats=script.visual_beats;need(Array.isArray(beats)&&beats.length>0,'VISUAL_BEATS_REQUIRED');
 const ids=new Set();let prior=-1;const coverage=new Map();
 for(const b of beats){
  need(Object.keys(b).length===beatFields.length&&beatFields.every(k=>Object.hasOwn(b,k)),'VISUAL_BEAT_SCHEMA_INVALID');
  need(typeof b.visual_beat_id==='string'&&b.visual_beat_id.trim()&&!ids.has(b.visual_beat_id),'VISUAL_BEAT_ID_INVALID');ids.add(b.visual_beat_id);
  const index=script.segments.findIndex(s=>s.segment_id===b.narration_segment_id);need(index>=0&&index>=prior,'VISUAL_BEAT_ORDER_INVALID');prior=index;const s=script.segments[index];
  need(Number.isFinite(b.duration_target)&&b.duration_target>0,'VISUAL_BEAT_DURATION_INVALID');coverage.set(index,(coverage.get(index)??0)+b.duration_target);
  need(Array.isArray(b.claim_ids)&&hash(b.claim_ids)===hash(s.claim_id?[s.claim_id]:[]),'VISUAL_CLAIM_LINK_INVALID');
  need(types.includes(b.visual_type)&&['OBSERVED','DATA_DERIVED','SCIENTIFIC_VISUALIZATION','ILLUSTRATIVE'].includes(b.visual_classification),'INVALID_VISUAL_CLASSIFICATION');
  if(b.visual_classification==='OBSERVED')need(b.visual_type==='OFFICIAL_SOURCE_MEDIA'&&b.generation_eligibility==='NOT_ELIGIBLE','ILLUSTRATION_NOT_OBSERVATION');
  if(['GENERATED_STILL','IMAGE_TO_VIDEO','TEXT_TO_VIDEO','STOCK_OR_LICENSED_MEDIA'].includes(b.visual_type))need(b.visual_classification==='ILLUSTRATIVE','ILLUSTRATION_NOT_OBSERVATION');
  need(['NOT_ELIGIBLE','ELIGIBLE_AFTER_REVIEW'].includes(b.generation_eligibility),'INVALID_GENERATION_ELIGIBILITY');
  for(const k of ['visual_intent','concrete_visual_brief','motion_intent','transition_intent','factual_sensitivity','source_requirement','rights_requirement','disclosure_requirement'])need(typeof b[k]==='string'&&b[k].trim().length>0,'VISUAL_BRIEF_REQUIRED');
  need(b.concrete_visual_brief.trim().split(/\s+/u).length>=8,'CONCRETE_VISUAL_BRIEF_REQUIRED');
  need(!input.production_policy.forbidden_phrases.some(p=>b.concrete_visual_brief.toLowerCase().includes(p.toLowerCase())),'POLICY_VIOLATION');
 }
 script.segments.forEach((s,n)=>need(Math.abs((coverage.get(n)??0)-duration(s.text,input.profiles[script.format]))<=0.001,'VISUAL_BEAT_COVERAGE_INVALID'));
 const p=input.profiles[script.format];if(p.min_visual_beats!=null)need(beats.length>=p.min_visual_beats&&beats.length<=p.max_visual_beats,'VISUAL_BEAT_COUNT_INVALID');
 return beats;
}
export function beatTimeline(input,draft,id){
 let start=0;
 return draft.visual_beats.map(b=>{const s=draft.segments.find(s=>s.segment_id===b.narration_segment_id),refs=b.claim_ids.flatMap(c=>input.evidence_references[c]);
 const row={...b,segment_id:b.visual_beat_id,start_target:Math.round(start*1000)/1000,voiceover_text:null,narration_reference:s.segment_id,claim_refs:b.claim_ids,on_screen_text:[],visual_intent:{instruction:b.visual_intent,type:b.visual_type,classification:b.visual_classification,disclosure_required:b.visual_classification!=='OBSERVED',observation_verification_required:b.visual_classification==='OBSERVED'},mandatory_qualifiers:Object.fromEntries(b.claim_ids.filter(c=>input.scope.mandatory_qualifiers[c]).map(c=>[c,input.scope.mandatory_qualifiers[c]])),claim_usage_type:s.usage_type,brief_review_required:true,asset_requirement:{requirement_id:id+':'+b.visual_beat_id,kind:b.visual_type,source_requirement:b.source_requirement,evidence_references:refs,rights_requirement:b.rights_requirement,disclosure_requirement:b.disclosure_requirement,generation_eligibility:b.generation_eligibility,credit_requirement:'Verify source-specific license and attribution; retain provenance',reuse_status:'NOT_CLEARED',actual_asset_id:null,execution_authorized:false},motion_requirement:b.motion_intent,transition_intent:b.transition_intent};start+=b.duration_target;return row});
}
