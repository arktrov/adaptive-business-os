import {hash} from './research.js';
import {seal,verify,need,validateAsset} from './assets.js';
import {voiceRequirements} from './voice-profiles.js';

export const voiceDecisions=Object.freeze({quality:'APPROVED',pronunciation:'APPROVED',brand_fit:'APPROVED',pacing:'APPROVED',regeneration_required:false});
export function approveVoice({id,plan,script,pkg,voice,actor,decisions,source,created_at,voiceDecoder}){
 need(actor==='human'&&hash(decisions)===hash(voiceDecisions)&&source?.reference&&source?.sha256,'EXPLICIT_HUMAN_VOICE_APPROVAL_REQUIRED');
 validateAsset(plan,voice,{voiceDecoder});verify(pkg);
 const {output_hash,...body}=script;need(hash(body)===output_hash,'SCRIPT_HASH_MISMATCH');
 need(pkg.production_package_id===plan.production_package_id&&pkg.content_hash===plan.production_package_hash&&script.script_id===plan.script_id&&script.output_hash===plan.script_hash,'STALE_PRODUCTION_PACKAGE');
 need(voice.type==='VOICE'&&voice.provenance.profile?.status==='APPROVED','APPROVED_VOICE_REQUIRED');
 const identity={business_id:plan.business_id,content_job_id:plan.content_job_id,plan_id:plan.plan_id,plan_hash:plan.content_hash,script_id:script.script_id,script_hash:script.output_hash,production_package_id:pkg.production_package_id,production_package_hash:pkg.content_hash,voice_asset_id:voice.asset_id,voice_asset_hash:voice.content_hash,audio_hash:voice.qa.file_sha256,voice_profile_id:voice.provenance.profile.voice_profile_id,voice_profile_version:voice.provenance.profile.version,voice_profile_hash:voice.provenance.profile.content_hash,provider_request_id:voice.provenance.request_id??null,technical_qa:voice.qa,decision:'APPROVED_FOR_PRODUCTION',decisions,actor,source,publication_hold:true,release_allowed:false};
 return seal({...identity,approval_id:id,version:'human-voice-approval/1',identity_hash:hash(identity),approved_at:created_at});
}
function allocate(rows,frames,offset=0){
 need(rows.length>0&&rows.every(r=>Number.isFinite(r.duration_target)&&r.duration_target>0),'TIMING_WEIGHTS_INVALID');
 const total=rows.reduce((n,r)=>n+r.duration_target,0);let weight=0,previous=offset;
 return rows.map((r,i)=>{weight+=r.duration_target;const end=offset+(i===rows.length-1?frames:Math.round(weight/total*frames));need(end>previous,'TIMING_INTERVAL_INVALID');const result={row:r,start_frame:previous,end_frame:end};previous=end;return result});
}
export function retimeProduction({id,version,plan,script,pkg,voice,approval,created_at}){
 verify(plan);verify(pkg);verify(voice);verify(approval);const {output_hash,...scriptBody}=script;need(hash(scriptBody)===output_hash,'SCRIPT_HASH_MISMATCH');
 need(voiceRequirements(plan).length===1,'TIMING_SINGLE_NARRATION_REQUIRED');
 need(approval.voice_asset_id===voice.asset_id&&approval.voice_asset_hash===voice.content_hash&&approval.plan_hash===plan.content_hash&&approval.script_hash===script.output_hash&&approval.production_package_hash===pkg.content_hash&&approval.decision==='APPROVED_FOR_PRODUCTION'&&approval.actor==='human','VOICE_APPROVAL_MISMATCH');
 need(voice.qa.status==='PASS'&&pkg.publication_hold===true&&pkg.release_allowed===false,'UNSAFE_TIMING_INPUT');
 const rate=voice.qa.sample_rate,totalFrames=Math.round(voice.qa.duration*rate);
 need(Number.isSafeInteger(rate)&&rate>0&&Number.isSafeInteger(totalFrames)&&totalFrames>0,'TIMING_AUDIO_INVALID');
 const leading=voice.qa.leading_silence_seconds??0,trailing=voice.qa.trailing_silence_seconds??0;
 need(Number.isFinite(leading)&&leading>=0&&Number.isFinite(trailing)&&trailing>=0,'TIMING_TRIM_INVALID');
 const inFrame=Math.round(leading*rate),outFrame=totalFrames-Math.round(trailing*rate),frames=outFrame-inFrame;
 need(frames>0,'TIMING_TRIM_INVALID');const duration=frames/rate;
 const profile=pkg.target_platform_profile;
 const conflict=Number.isFinite(profile.max_seconds)&&duration>profile.max_seconds?{code:'PLATFORM_DURATION_LIMIT',actual_seconds:duration,max_seconds:profile.max_seconds,profile_id:profile.id}:null;
 need(Array.isArray(script.segments)&&script.segments.length&&script.segments.map(s=>s.text).join('\n')===script.voiceover_text,'TIMING_SCRIPT_BOUNDARIES_INVALID');
 const narration=allocate(script.segments,frames).map(({row,start_frame,end_frame})=>({...row,start_target:start_frame/rate,duration_target:(end_frame-start_frame)/rate,start_frame,end_frame,alignment_precision:'APPROXIMATE_PROPORTIONAL'}));
 const beats=[];let index=0;
 for(const s of narration){const group=[];while(index<pkg.timeline_segments.length){const b=pkg.timeline_segments[index],ref=b.narration_segment_id??b.narration_reference??b.segment_id;if(ref!==s.segment_id)break;group.push(b);index++}need(group.length,'TIMING_BEAT_COVERAGE_INVALID');
  for(const {row,start_frame,end_frame} of allocate(group,s.end_frame-s.start_frame,s.start_frame))beats.push({...row,start_target:start_frame/rate,duration_target:(end_frame-start_frame)/rate});
 }
 need(index===pkg.timeline_segments.length,'TIMING_BEAT_ORDER_INVALID');
 const trim={mode:'NON_DESTRUCTIVE',source_in_frame:inFrame,source_out_frame:outFrame,source_in_seconds:inFrame/rate,source_out_seconds:outFrame/rate,leading_seconds:inFrame/rate,trailing_seconds:(totalFrames-outFrame)/rate,sample_rate:rate,playback_rate:1,original_asset_unchanged:true,application_status:'METADATA_ONLY_NOT_RENDERED'};
 const timing={version:'production-timing/1',revision_kind:'VOICE_TIMING_ONLY',parent_package_id:pkg.production_package_id,parent_package_hash:pkg.content_hash,voice_approval_id:approval.approval_id,voice_approval_hash:approval.content_hash,voice_asset_id:voice.asset_id,voice_asset_hash:voice.content_hash,audio_hash:voice.qa.file_sha256,actual_audio_duration:voice.qa.duration,effective_narration_duration:duration,previous_estimated_duration:pkg.target_duration,trim,timeline_start:0,timeline_end:duration,alignment_precision:'APPROXIMATE_PROPORTIONAL',alignment_method:'Approved segment and beat duration weights scaled to decoded audio sample frames; no word or acoustic boundary detection',platform_conflict:conflict,motion_policy:'Preserve existing motion intent throughout each retimed beat; no new factual content or static-hold substitution',pause_cues:pkg.audio_plan.pause_cues??[],emphasis_cues:pkg.audio_plan.emphasis_cues??[]};
 const subtitle_timing={status:'UNRESOLVED',alignment_status:'APPROXIMATE_NOT_FINAL',expected_timing_source:'Future verified local forced alignment or human-aligned cue timings against this exact approved audio; no external call authorized',script_text:script.voiceover_text,text_hash:hash(script.voiceover_text),voice_asset_id:voice.asset_id,audio_hash:voice.qa.file_sha256,segments:narration.map(s=>({segment_id:s.segment_id,text:s.text,start:s.start_target,end:s.end_frame/rate,source_start:(inFrame+s.start_frame)/rate,source_end:(inFrame+s.end_frame)/rate})),finalized:false};
 const {content_hash,...base}=pkg;
 return seal({...base,production_package_id:id,package_version:version,created_at,target_duration:duration,narration_segments:narration,timeline_segments:beats,audio_plan:{...pkg.audio_plan,actual_vo_duration:voice.qa.duration,effective_vo_duration:duration,production_trim:trim},timing,subtitle_timing});
}
export function applyProductionTiming(manifest,revision,approval){
 verify(manifest);verify(revision);verify(approval);const t=revision.timing;
 need(t?.parent_package_id===manifest.production_package_id&&t.parent_package_hash===manifest.production_package_hash&&revision.business_id===manifest.business_id&&revision.content_job_id===manifest.content_job_id&&revision.script_id===manifest.script_id&&revision.script_output_hash===manifest.script_hash&&t.voice_approval_id===approval.approval_id&&t.voice_approval_hash===approval.content_hash&&manifest.voice_asset_id===t.voice_asset_id&&manifest.assets.some(a=>a.asset_id===t.voice_asset_id&&a.hash===t.voice_asset_hash),'TIMING_MANIFEST_MISMATCH');
 const mapping=manifest.mapping.map(m=>{const b=revision.timeline_segments.find(b=>(b.visual_beat_id??b.segment_id)===m.visual_beat_id);need(b,'TIMING_BEAT_COVERAGE_INVALID');return {...m,ready:false,start_target:b.start_target,duration_target:b.duration_target,timing_status:'RETIME_REVIEW_REQUIRED'}});
 const missing=new Set([...manifest.unresolved,...mapping.map(m=>m.visual_beat_id),'SUBTITLE_TIMING']);if(t.platform_conflict)missing.add('PLATFORM_DURATION_LIMIT');
 const {content_hash,...base}=manifest;
 return seal({...base,effective_production_package_id:revision.production_package_id,effective_production_package_hash:revision.content_hash,production_timing:t,voice_approval_id:approval.approval_id,voice_approval_hash:approval.content_hash,voice_asset_id:t.voice_asset_id,mapping,subtitles:{...manifest.subtitles,...revision.subtitle_timing},unresolved:[...missing],status:'ASSETS_PARTIAL',renderer_ready:false,publication_hold:true,release_allowed:false});
}
