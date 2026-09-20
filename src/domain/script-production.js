import {hash,assertSafe} from './research.js';
import {validateScriptClaimUses} from './content-scope.js';
export const scriptProcessingVersion='script-contract/1.0';
export const visualTypes=Object.freeze(['OFFICIAL_SOURCE_MEDIA','ORIGINAL_DATA_VISUALIZATION','CONTROLLED_DIAGRAM','GENERATED_STILL','IMAGE_TO_VIDEO','TEXT_TO_VIDEO','STOCK_OR_LICENSED_MEDIA','MOTION_GRAPHICS','REMOTION_NATIVE']);
export const visualClasses=Object.freeze(['OBSERVED','DATA_DERIVED','SCIENTIFIC_VISUALIZATION','ILLUSTRATIVE']);
const need=(ok,code)=>{if(!ok)throw Error(code)};
const text=x=>typeof x==='string'&&x.trim().length>0;
export function formats(input){return input.format==='BOTH'?['SHORT','LONG']:[input.format]}
export function validateProductionInput(i){
 assertSafe(i);need(i.version==='script-production-input/1.0'&&['SHORT','LONG','BOTH'].includes(i.format),'INVALID_SCRIPT_INPUT');
 for(const k of ['business_id','content_job_id','objective','language','workflow_version','prompt_version'])need(text(i[k]),'INVALID_SCRIPT_INPUT');
 need(i.scope.business_id===i.business_id&&i.scope.content_job_id===i.content_job_id&&i.publication_hold===true&&i.scope.publication_hold===true,'SCOPE_REFERENCE_MISMATCH');
 const {content_scope_hash,...s}=i.scope;need(hash(s)===content_scope_hash,'INVALID_CONTENT_SCOPE');
 need(hash(i.approved_claims.map(c=>c.claim_id))===hash(i.scope.approved_claim_ids),'UNAPPROVED_FACTUAL_USE');
 need(i.production_policy?.version&&Array.isArray(i.target_platforms)&&i.target_platforms.length&&i.audience_profile,'MISSING_PRODUCTION_POLICY');
 for(const k of ['brand','quality'])need(i.policy_snapshots?.[k]?.version===i.scope.policy_snapshot_refs[k]?.version,'MISSING_SCOPE_POLICY');
 for(const f of formats(i)){const p=i.profiles[f];need(p?.id&&p.version&&p.aspect_ratio&&p.caption_style&&p.safe_areas&&p.min_seconds>0&&p.max_seconds>=p.target_seconds&&p.target_seconds>=p.min_seconds&&p.words_per_minute>0&&p.words_per_minute<=240,'INVALID_FORMAT_PROFILE')}
 need(i.production_policy.publication_hold===true&&i.production_policy.rights_review_required===true&&i.production_policy.no_free_factual_prose===true,'UNSAFE_PRODUCTION_POLICY');
 need(Array.isArray(i.production_policy.forbidden_phrases)&&Array.isArray(i.production_policy.neutral_phrases),'INVALID_PRODUCTION_POLICY');
 return i;
}
// Factual prose is closed-world: copy an admitted statement plus its exact qualifier.
// Arbitrary paraphrases need a separately approved realization, never a lexical "fact check".
export function realization(input,id,use='DIRECT'){
 const c=[...input.approved_claims,...input.context_claims].find(c=>c.claim_id===id);need(c,'UNAPPROVED_FACTUAL_USE');
 const q=input.scope.mandatory_qualifiers[id]??'';
 validateScriptClaimUses(input,[{claim_id:id,use:use==='CONTEXT_ONLY'?'limitation':'factual_assertion',qualifier:q}]);
 return (use==='CONTEXT_ONLY'?input.production_policy.context_label+' ':'')+c.statement+(q?' '+q:'');
}
export function validateScriptProposal(input,proposal){
 validateProductionInput(input);assertSafe(proposal);
 need(proposal&&Object.keys(proposal).every(k=>k==='scripts')&&Array.isArray(proposal.scripts),'SCRIPT_SCHEMA_INVALID');
 need(hash(proposal.scripts.map(s=>s.format).sort())===hash(formats(input).sort()),'SCRIPT_FORMAT_MISMATCH');
 const ids=new Set();
 for(const script of proposal.scripts){
  need(Object.keys(script).every(k=>['format','segments'].includes(k))&&Array.isArray(script.segments)&&script.segments.length>=3,'SCRIPT_SCHEMA_INVALID');
  need(script.segments[0].role==='HOOK'&&script.segments.at(-1).role==='ENDING'&&script.segments.some(s=>s.role==='BODY'),'SCRIPT_STRUCTURE_INVALID');
  for(const seg of script.segments){
   need(Object.keys(seg).every(k=>['segment_id','role','claim_id','usage_type','text','visual_type','visual_classification'].includes(k))&&text(seg.segment_id)&&!ids.has(seg.segment_id)&&['HOOK','BODY','ENDING','CTA'].includes(seg.role)&&text(seg.text),'SCRIPT_SCHEMA_INVALID');ids.add(seg.segment_id);
   need(visualTypes.includes(seg.visual_type)&&visualClasses.includes(seg.visual_classification),'INVALID_VISUAL_CLASSIFICATION');
   if(seg.visual_classification==='OBSERVED')need(seg.visual_type==='OFFICIAL_SOURCE_MEDIA','ILLUSTRATION_NOT_OBSERVATION');
   if(['GENERATED_STILL','TEXT_TO_VIDEO','IMAGE_TO_VIDEO','STOCK_OR_LICENSED_MEDIA'].includes(seg.visual_type))need(seg.visual_classification==='ILLUSTRATIVE','ILLUSTRATION_NOT_OBSERVATION');
   if(seg.claim_id===null){need(seg.usage_type==='NONE'&&input.production_policy.neutral_phrases.includes(seg.text),'UNSUPPORTED_FACTUAL_ASSERTION')}
   else {
    need(!input.scope.blocked_claim_ids.includes(seg.claim_id),'BLOCKED_CLAIM_USE');
    const context=input.scope.context_only_claim_ids.includes(seg.claim_id),q=input.scope.mandatory_qualifiers[seg.claim_id];
    need(seg.usage_type===(context?'CONTEXT_ONLY':q?'QUALIFIED':'DIRECT'),'INVALID_CLAIM_USAGE');
    need(seg.text===realization(input,seg.claim_id,seg.usage_type),'UNSUPPORTED_OR_UNQUALIFIED_PROSE');
    const refs=input.evidence_references[seg.claim_id];need(refs?.length&&refs.every(r=>r.relation_id&&r.source_id&&r.research_output_hash===input.scope.research_output_hash),'EVIDENCE_REFERENCE_REQUIRED');
    if(!context)need(refs.some(r=>r.support_type==='supports'),'DIRECT_SUPPORT_REQUIRED');
   }
   need(!input.production_policy.forbidden_phrases.some(p=>seg.text.toLowerCase().includes(p.toLowerCase())),'POLICY_VIOLATION');
  }
  need(script.segments.some(s=>input.scope.approved_claim_ids.includes(s.claim_id)),'NO_APPROVED_FACTS');
  const p=input.profiles[script.format],duration=script.segments.reduce((n,s)=>n+segmentDuration(s.text,p),0);
  need(duration>=p.min_seconds&&duration<=p.max_seconds,'SCRIPT_DURATION_INVALID');
 }
 return {status:'PASS',validator_version:scriptProcessingVersion,scope_hash:input.scope.content_scope_hash,publication_hold:true,policy_snapshot_refs:input.scope.policy_snapshot_refs,checks:['closed_world_text','qualifiers','evidence','policies','format','duration','visual_classification','hold'],human_creative_review_required:true};
}
export function segmentDuration(text,profile){return Math.ceil(text.trim().split(/\s+/u).length/profile.words_per_minute*60000)/1000}
export function buildDrafts(input,proposal,identity,metadata){
 const validation=validateScriptProposal(input,proposal);
 return proposal.scripts.map((s,index)=>{
  const p=input.profiles[s.format],segments=s.segments.map(x=>({...x,duration_target:segmentDuration(x.text,p)}));
  const data={script_id:identity.script_ids[index],business_id:input.business_id,content_job_id:input.content_job_id,script_version:identity.version,format:s.format,target_platform_profile:p,language:input.language,target_duration_seconds:p.target_seconds,hook:segments[0].text,body_segments:segments.filter(x=>x.role==='BODY'),ending:segments.at(-1).text,cta:segments.find(x=>x.role==='CTA')?.text??null,segments,voiceover_text:segments.map(x=>x.text).join('\n'),on_screen_text:[],caption_text:null,claim_usage:segments.filter(x=>x.claim_id).map(x=>({script_segment_id:x.segment_id,claim_id:x.claim_id,usage_type:x.usage_type,mandatory_qualifier_reference:input.scope.mandatory_qualifiers[x.claim_id]?{scope_hash:input.scope.content_scope_hash,claim_id:x.claim_id}:null,evidence_references:input.evidence_references[x.claim_id]})),guardrail_usage:input.scope.script_guardrails.map((rule,n)=>({guardrail_id:'guardrail-'+n,requirement:rule,scope_hash:input.scope.content_scope_hash,application:'Exact admitted text and qualifiers; propagated to every production segment and later QA.'})),estimated_duration:segments.reduce((n,s)=>n+s.duration_target,0),provider:input.provider.provider,model:input.provider.model,provider_request_id:metadata.provider_request_id??null,prompt_version:input.prompt_version,workflow_version:input.workflow_version,brand_policy_version:input.policy_snapshots.brand.version,quality_policy_version:input.policy_snapshots.quality.version,production_policy_version:input.production_policy.version,input_hash:hash(input),lineage_id:identity.lineage_id,execution_revision:identity.version,created_at:identity.created_at,status:'SCRIPT_APPROVED_FOR_PRODUCTION',publication_hold:true,validation};
  return {...data,output_hash:hash(data)};
 });
}
export function buildProductionPackage(input,draft,id){
 need(draft.validation.status==='PASS'&&draft.publication_hold===true,'SCRIPT_NOT_APPROVED');
 const {output_hash,...body}=draft;need(hash(body)===output_hash,'SCRIPT_HASH_MISMATCH');
 let start=0;const policy=input.production_policy;
 const timeline=draft.segments.map(s=>{const external=['OFFICIAL_SOURCE_MEDIA','STOCK_OR_LICENSED_MEDIA'].includes(s.visual_type);const refs=s.claim_id?input.evidence_references[s.claim_id]:[];
  const segment={segment_id:s.segment_id,start_target:Math.round(start*1000)/1000,duration_target:s.duration_target,voiceover_text:s.text,on_screen_text:[],claim_refs:s.claim_id?[s.claim_id]:[],visual_intent:{type:s.visual_type,classification:s.visual_classification,claim_refs:s.claim_id?[s.claim_id]:[],instruction:policy.visual_instruction,disclosure_required:s.visual_classification!=='OBSERVED',observation_verification_required:s.visual_classification==='OBSERVED'},visual_type:s.visual_type,asset_requirement:{requirement_id:id+':'+s.segment_id,kind:s.visual_type,source_requirement:external?'Verified source matching the scoped claim; no download authorized':'Create a controlled visual from the approved claim; no generation authorized',evidence_references:refs,rights_requirement:'Rights review before reuse or generation; public access is not permission',credit_requirement:external?'Verify and retain source-specific attribution/license':'Retain provenance and required disclosure',reuse_status:'NOT_CLEARED',actual_asset_id:null},motion_requirement:policy.motion_requirement,transition_intent:policy.transition_intent,audio_intent:policy.audio.music_intent,sfx_intent:policy.audio.sfx_requirements,branding_requirement:policy.brand_application};start+=s.duration_target;return segment});
 const p={production_package_id:id,business_id:input.business_id,content_job_id:input.content_job_id,package_version:draft.script_version,script_id:draft.script_id,script_version:draft.script_version,script_output_hash:draft.output_hash,format:draft.format,target_duration:start,target_platform_profile:draft.target_platform_profile,timeline_segments:timeline,global_visual_direction:policy.visual_direction,audio_plan:{...policy.audio,language:draft.language,pace:draft.target_platform_profile.words_per_minute,estimated_vo_duration:start},subtitle_strategy:draft.target_platform_profile.caption_style,brand_application:policy.brand_application,safe_areas:draft.target_platform_profile.safe_areas,asset_sourcing_rules:policy.asset_sourcing_rules,rights_requirements:'All requirements NOT_CLEARED pending per-asset review',scope_hash:input.scope.content_scope_hash,policy_snapshot_refs:input.scope.policy_snapshot_refs,script_guardrails:input.scope.script_guardrails,publication_hold:true,release_allowed:false,status:'PRODUCTION_PACKAGE_READY',created_at:draft.created_at};
 return {...p,content_hash:hash(p)};
}
export function videoGenerationRequest(packageData,segmentId,capabilities){
 const s=packageData.timeline_segments.find(s=>s.segment_id===segmentId);need(s,'SEGMENT_NOT_FOUND');
 return {visual_requirement:s.visual_intent,factual_sensitivity:s.visual_intent.classification,motion_requirement:s.motion_requirement,duration:s.duration_target,aspect_ratio:packageData.target_platform_profile.aspect_ratio,quality:capabilities.quality,cost_limit:capabilities.cost_limit,rights_constraints:s.asset_requirement.rights_requirement,provider_capabilities:capabilities.available,availability:capabilities.availability,execution_authorized:false};
}
