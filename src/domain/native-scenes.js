import {hash} from './research.js';
import {seal,verify,need,rights} from './assets.js';
const text=v=>typeof v==='string'&&v.trim().length>0;
const equal=(a,b)=>hash(a)===hash(b);
const norm=s=>s.normalize('NFKC').replace(/[‘’]/g,"'").replace(/[“”]/g,'"').toLowerCase();
export const nativeSchema='native-scene/2';
export function nativeBinding({plan,pkg,script,scope},beatId){
 verify(plan);verify(pkg);const {content_scope_hash,...scopeBody}=scope;need(hash(scopeBody)===content_scope_hash,'NATIVE_SCOPE_HASH');const {output_hash,...body}=script;need(hash(body)===output_hash,'NATIVE_SCRIPT_HASH');
 need(pkg.business_id===plan.business_id&&pkg.content_job_id===plan.content_job_id&&scope.business_id===plan.business_id&&scope.content_job_id===plan.content_job_id,'NATIVE_TENANT');
 need(pkg.script_id===plan.script_id&&pkg.script_output_hash===plan.script_hash&&script.output_hash===plan.script_hash&&equal(pkg.policy_snapshot_refs,scope.policy_snapshot_refs)&&pkg.scope_hash===scope.content_scope_hash,'NATIVE_SCOPE_BINDING');
 need(pkg.production_package_id===plan.production_package_id||pkg.timing?.parent_package_hash===plan.production_package_hash,'NATIVE_PACKAGE_PARENT');
 const b=pkg.timeline_segments.find(b=>(b.visual_beat_id??b.segment_id)===beatId),r=plan.requirements.find(r=>r.visual_beat_id===beatId);
 need(b&&r&&r.resolution_type==='NATIVE_SCENE','NATIVE_BEAT_ROUTE');
 need(equal(b.claim_refs,r.claim_refs)&&(b.visual_classification??b.visual_intent?.classification)===r.classification&&(b.asset_requirement.disclosure_requirement??'Preserve classification disclosure')===r.disclosure,'NATIVE_FACTUAL_SCOPE');
 need(b.claim_refs.every(c=>scope.approved_claim_ids.includes(c)&&!scope.blocked_claim_ids.includes(c)&&!scope.context_only_claim_ids.includes(c)),'NATIVE_BLOCKED_CLAIM');
 const segmentId=b.narration_segment_id??b.narration_reference??b.segment_id,segment=script.segments.find(s=>s.segment_id===segmentId);
 need(segment,'NATIVE_NARRATION');
 need(Number.isFinite(b.start_target)&&b.start_target>=0&&b.duration_target>0&&b.start_target+b.duration_target<=pkg.target_duration+1e-8,'NATIVE_TIMING');
 return {b,r,segment};
}
export function validateNativeDesign(context,beatId,d){
 const {b,r,segment}=nativeBinding(context,beatId),{pkg}=context;
 for(const key of ['scene_objective','visual_treatment_type','background_description','motion_treatment','camera_or_view_motion','transition_in','transition_out','renderer_notes','factual_sensitivity','source_provenance_notes'])need(text(d[key]),'NATIVE_REQUIRED:'+key);
 need(d.scene_composition&&text(d.scene_composition.hierarchy)&&text(d.scene_composition.layout)&&text(d.scene_composition.coordinate_system),'NATIVE_COMPOSITION');
 need(Array.isArray(d.foreground_elements)&&d.foreground_elements.length>0&&Array.isArray(d.element_animation)&&d.element_animation.length>0,'NATIVE_MOTION_ELEMENTS');
 need(equal(d.safe_zone_notes?.safe_areas,pkg.safe_areas??pkg.target_platform_profile.safe_areas)&&d.aspect_ratio===pkg.target_platform_profile.aspect_ratio,'NATIVE_SAFE_AREAS');
 const safe=d.safe_zone_notes.safe_areas,sub=d.safe_zone_notes.subtitle_area;
 need(sub&&sub.y>=safe.top&&sub.y+sub.h<=1-safe.bottom+1e-8&&sub.h>0&&text(d.safe_zone_notes.notes),'NATIVE_SUBTITLE_AREA');
 need(d.mobile_readability?.min_label_px>=28&&d.mobile_readability?.reference_width===1080&&text(d.mobile_readability?.overflow_rule)&&d.mobile_readability.subtitles_primary===true,'NATIVE_READABILITY');
 const elements=d.foreground_elements,ids=new Set(elements.map(e=>e.id));need(ids.size===elements.length,'NATIVE_DUPLICATE_ELEMENT');
 function bounds(e){need([e.x,e.y,e.w,e.h].every(Number.isFinite)&&e.w>0&&e.h>0&&e.x>=safe.left&&e.x+e.w<=1-safe.right+1e-8&&e.y>=safe.top&&e.y+e.h<=sub.y+1e-8,'NATIVE_ELEMENT_BOUNDS')}
 for(const e of elements){need(text(e.id)&&['ellipse','rect','path','line','polygon','group'].includes(e.kind)&&text(e.geometry)&&text(e.meaning)&&text(e.style),'NATIVE_ELEMENT');bounds(e)}
 for(const a of d.element_animation)need(ids.has(a.element_id)&&text(a.property)&&text(a.from)&&text(a.to)&&text(a.easing)&&a.start>=0&&a.end>a.start&&a.end<=b.duration_target+1e-8,'NATIVE_ANIMATION');
 need(Array.isArray(d.text_overlays)&&Array.isArray(d.labels)&&Array.isArray(d.emphasis_points),'NATIVE_TEXT');
 const anchors={brief:b.concrete_visual_brief??r.brief,narration:segment.text,disclosure:r.disclosure};
 for(const t of [...d.text_overlays,...d.labels]){need(text(t.text)&&text(t.category)&&text(t.anchor?.text)&&anchors[t.anchor.kind]&&norm(anchors[t.anchor.kind]).includes(norm(t.anchor.text))&&norm(t.anchor.text).includes(norm(t.text)),'NATIVE_UNSUPPORTED_TEXT');bounds(t);need(t.start>=0&&t.end>t.start&&t.end<=b.duration_target+1e-8,'NATIVE_TEXT_TIMING')}
 need(d.disclosure_requirement?.requirement===r.disclosure&&typeof d.disclosure_requirement.visible==='boolean','NATIVE_DISCLOSURE');
 if(!d.disclosure_requirement.visible)need(r.classification==='ILLUSTRATIVE'&&/no.*label needed/i.test(r.disclosure),'NATIVE_DISCLOSURE');
 if(d.disclosure_requirement.visible)need([...d.text_overlays,...d.labels].some(t=>t.category==='DISCLOSURE'),'NATIVE_DISCLOSURE');
 need(Array.isArray(d.data_or_diagram_primitives)&&d.data_or_diagram_primitives.length>0,'NATIVE_DIAGRAM_SEMANTICS');
 for(const p of d.data_or_diagram_primitives){
  need(text(p.node_meaning)&&text(p.marker_meaning)&&text(p.relation_meaning)&&p.positions==='SCHEMATIC_NON_SPATIAL'&&p.scale==='NOT_TO_SCALE'&&p.axes==='CONCEPTUAL_NO_NUMERIC_METRICS','NATIVE_SCHEMATIC');
  need(p.physical_identity==='UNRESOLVED'&&p.population_generalization===false&&p.real_observation===false,'NATIVE_IDENTITY_OVERCLAIM');
  need(Array.isArray(p.counts),'NATIVE_COUNT');
  for(const n of p.counts){need(['SELECTED_SAMPLE','MINIMUM','SCOPE_ONLY'].includes(n.mode)&&text(n.display)&&text(n.source_anchor)&&norm(segment.text).includes(norm(n.source_anchor))&&norm((b.concrete_visual_brief??r.brief??'')+' '+segment.text).includes(norm(n.display))&&n.complete_census===false&&n.spatial_positions===false&&n.per_group_distribution===false,'NATIVE_COUNT_SCOPE');if(n.mode==='SELECTED_SAMPLE')need(/candidate/i.test(n.display)&&/candidate/i.test(n.source_anchor),'NATIVE_CANDIDATE_LABEL');if(n.mode==='MINIMUM')need(/at least|≥/i.test(n.display)&&/at least/i.test(n.source_anchor),'NATIVE_MINIMUM_COUNT');}
 }
 need(d.brand_application?.policy_snapshot_refs&&equal(d.brand_application.policy_snapshot_refs,pkg.policy_snapshot_refs)&&text(d.brand_application.palette)&&text(d.brand_application.typography)&&text(d.brand_application.motion_rule),'NATIVE_BRAND');
 need(Array.isArray(d.third_party_dependencies)&&d.third_party_dependencies.every(x=>text(x.reference)&&text(x.kind)),'NATIVE_DEPENDENCIES');
 need(d.provenance_origin==='ORIGINAL_NATIVE_SCENE_SPEC'&&d.external_media===false,'NATIVE_PROVENANCE');
 need(d.factual_classification===r.classification&&r.classification!=='OBSERVED','NATIVE_NOT_OBSERVED');
 need(equal(d.factual_guardrails,pkg.script_guardrails)&&equal(d.mandatory_qualifiers,Object.fromEntries(r.claim_refs.filter(c=>context.scope.mandatory_qualifiers[c]).map(c=>[c,context.scope.mandatory_qualifiers[c]]))),'NATIVE_QUALIFIERS');
 return {b,r,segment};
}
export function createNativeSceneAsset(context,{id,version,beat_id,design,created_at}){
 need(text(id)&&Number.isInteger(version)&&version>0&&Number.isFinite(Date.parse(created_at)),'NATIVE_VERSION_ID');const {b,r,segment}=validateNativeDesign(context,beat_id,design),{plan,pkg,script}=context;
 const data={schema:nativeSchema,visual_beat_id:beat_id,timeline_start:b.start_target,timeline_end:b.start_target+b.duration_target,duration:b.duration_target,narration:{segment_id:segment.segment_id,text:segment.text,script_hash:script.output_hash,alignment_precision:pkg.timing?.alignment_precision??'PLANNED'},voice_binding:pkg.timing?{voice_asset_id:pkg.timing.voice_asset_id,audio_hash:pkg.timing.audio_hash,timing_hash:hash(pkg.timing)}:null,evidence_references:r.evidence_references,design,renderer_adaptation_required:true};
 const originalOnly=design.third_party_dependencies.length===0;
 return seal({asset_id:id,version,type:'NATIVE_SCENE_SPEC',business_id:plan.business_id,content_job_id:plan.content_job_id,plan_hash:plan.content_hash,script_id:script.script_id,script_version:script.script_version??plan.script_version,script_hash:script.output_hash,production_package_id:pkg.production_package_id,production_package_version:pkg.package_version,production_package_hash:pkg.content_hash,beat_ids:[beat_id],claim_refs:r.claim_refs,classification:r.classification,disclosure:r.disclosure,aspect_ratio:r.aspect_ratio,data,data_hash:hash(data),rights:rights(originalOnly?'CLEARED':'REVIEW_REQUIRED',originalOnly?{authority:'application-original-native-authorship',reference:hash(design),basis:'Original geometry and textual specification only; no embedded or acquired third-party media, fonts, textures or logos. Rendered output requires separate dependency and final QA review.'}:null),provenance:{origin:'ORIGINAL_NATIVE_SCENE_SPEC',created_at,generated:false,provider:null,model:null,external_calls:0,policy_snapshot_refs:pkg.policy_snapshot_refs,dependencies:design.third_party_dependencies,rights_scope:'SPECIFICATION_ONLY'},qa:{status:'PASS',renderer_spec_ready:true,human_visual_review_required:true,processing_version:'native-scene-validator/2'},status:'TECHNICALLY_VALIDATED',publication_hold:true,release_allowed:false,created_at});
}
export function validateNativeSceneAsset(context,a){
 verify(a);need(a.type==='NATIVE_SCENE_SPEC'&&a.data?.schema===nativeSchema&&a.beat_ids?.length===1,'NATIVE_SCHEMA');
 need(a.business_id===context.plan.business_id&&a.content_job_id===context.plan.content_job_id,'NATIVE_TENANT');
 need(a.production_package_hash===context.pkg.content_hash&&a.production_package_id===context.pkg.production_package_id,'STALE_NATIVE_PACKAGE');
 const expected=createNativeSceneAsset(context,{id:a.asset_id,version:a.version,beat_id:a.beat_ids[0],design:a.data.design,created_at:a.created_at});need(equal(a,expected),'NATIVE_ASSET_MISMATCH');return a;
}
export function applyNativeScenes(context,manifest,assets){
 verify(manifest);need(manifest.business_id===context.plan.business_id&&manifest.content_job_id===context.plan.content_job_id&&manifest.plan_hash===context.plan.content_hash,'NATIVE_TENANT');need((manifest.effective_production_package_hash??manifest.production_package_hash)===context.pkg.content_hash,'STALE_NATIVE_PACKAGE');
 const current=assets.filter(a=>a.data?.schema===nativeSchema&&a.plan_hash===context.plan.content_hash&&a.production_package_hash===context.pkg.content_hash);for(const a of current)validateNativeSceneAsset(context,a);
 const selected=manifest.mapping.map(m=>{const a=current.filter(a=>a.beat_ids.includes(m.visual_beat_id)).sort((a,b)=>b.version-a.version)[0];return {m,a}});
 const mapping=selected.map(({m,a})=>a?{...m,asset_id:a.asset_id,ready:a.rights.status==='CLEARED',rights_status:a.rights.status,provenance:a.provenance.origin,renderer_spec_ready:true,timing_status:'BOUND_TO_CURRENT_PACKAGE',start_target:a.data.timeline_start,duration_target:a.data.duration}:m);
 const resolved=new Set(mapping.filter(m=>m.ready).map(m=>m.visual_beat_id)),unresolved=[...new Set([...manifest.unresolved.filter(id=>!resolved.has(id)),...mapping.filter(m=>!m.ready).map(m=>m.visual_beat_id)])],{content_hash,...body}=manifest;
 return seal({...body,mapping,assets:[...manifest.assets,...current.map(a=>({asset_id:a.asset_id,hash:a.content_hash,rights:a.rights,disclosure:a.disclosure}))],unresolved,status:unresolved.length?'ASSETS_PARTIAL':'ASSETS_READY',renderer_ready:unresolved.length===0,human_review_required:true,publication_hold:true,release_allowed:false});
}
