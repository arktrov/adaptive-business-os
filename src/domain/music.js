import {createHash} from 'node:crypto';
import {seal,verify,need} from './assets.js';
export const musicStatuses=['CANDIDATE','APPROVED','RESTRICTED','RETIRED'];
export const musicRights=['UNKNOWN','REVIEW_REQUIRED','CLEARED','RESTRICTED','NOT_ALLOWED'];
export const suitabilityFields=['brand','language','format','channel','use_case','content_type','emotional_tone','audience','platform','narration_presence','pacing','audio_intent'];
const text=v=>typeof v==='string'&&v.trim().length>0;
const list=v=>Array.isArray(v)&&v.every(text);
export function musicAsset(input){
 const a=structuredClone(input);need(text(a.music_asset_id)&&text(a.business_id)&&Number.isInteger(a.version)&&a.version>0&&text(a.title)&&text(a.creator)&&text(a.provider)&&text(a.provider_asset_reference),'MUSIC_IDENTITY_REQUIRED');
 need(musicStatuses.includes(a.status)&&musicRights.includes(a.rights_status),'MUSIC_STATUS_INVALID');
 need(['UPLOAD','CATALOG','PROVIDER','GENERATED'].includes(a.provenance?.origin),'MUSIC_PROVENANCE_REQUIRED');
 if(a.provenance.origin==='GENERATED')need(text(a.provenance.model)&&text(a.provenance.generation_reference),'MUSIC_GENERATION_PROVENANCE_REQUIRED');
 need(['wav','mp3'].includes(a.audio?.format)&&Number.isFinite(a.audio.duration)&&a.audio.duration>0&&a.audio.qa?.status==='PASS','MUSIC_AUDIO_REQUIRED');
 need(a.audio.qa.file_sha256===a.audio.content_hash&&a.audio.qa.duration===a.audio.duration,'MUSIC_QA_HASH_MISMATCH');
 const bytes=Buffer.from(a.data?.bytes_base64??'','base64');need(bytes.length>0&&bytes.length<=32*1024*1024&&a.data.format===a.audio.format&&createHash('sha256').update(bytes).digest('hex')===a.audio.content_hash,'MUSIC_AUDIO_HASH_MISMATCH');
 const l=a.license;need(l&&text(l.license_type)&&list(l.platforms)&&list(l.territories)&&[null,true,false].includes(l.commercial_use_allowed)&&[null,true,false].includes(l.social_media_use_allowed)&&[null,true,false].includes(l.credit_required)&&[null,true,false].includes(l.loop_allowed),'MUSIC_LICENSE_CONTRACT_REQUIRED');
 need(l.expires_at===null||(typeof l.expires_at==='string'&&Number.isFinite(Date.parse(l.expires_at))),'MUSIC_LICENSE_EXPIRY_INVALID');
 if(a.rights_status==='CLEARED')need(text(l.license_reference)&&l.license_evidence?.authority&&l.license_evidence?.reference&&l.license_evidence?.basis&&text(l.license_evidence.terms_hash)&&a.rights_decision?.actor==='human'&&text(a.rights_decision.reference)&&l.credit_required!==null&&(!l.credit_required||text(l.credit_text)),'MUSIC_LICENSE_EVIDENCE_REQUIRED');
 if(a.status==='APPROVED'){need(a.approval?.actor==='human'&&text(a.approval.reference),'HUMAN_MUSIC_APPROVAL_REQUIRED');if(a.provenance.origin==='UPLOAD')need(a.provenance.usage_confirmation?.actor==='human'&&text(a.provenance.usage_confirmation.reference),'UPLOAD_USAGE_CONFIRMATION_REQUIRED')}
 for(const [key,value] of Object.entries(a.suitability??{}))need(suitabilityFields.includes(key)&&list(value),'MUSIC_SUITABILITY_INVALID');
 return seal(a);
}
export function verifyMusicAsset(a){verify(a);const {content_hash,...input}=a;need(musicAsset(input).content_hash===content_hash,'MUSIC_CONTRACT_INVALID');return a}
export function latestMusic(assets){const map=new Map();for(const a of assets){verifyMusicAsset(a);const key=a.business_id+':'+a.music_asset_id;if(!map.has(key)||map.get(key).version<a.version)map.set(key,a)}return [...map.values()]}
export function musicCompatibility(a,c){
 verifyMusicAsset(a);const reasons=[],l=a.license;
 if(a.business_id!==c.business_id)reasons.push('TENANT_MISMATCH');
 if(a.status!=='APPROVED')reasons.push('TRACK_NOT_APPROVED');if(a.rights_status!=='CLEARED')reasons.push('RIGHTS_NOT_CLEARED');
 if(!Number.isFinite(Date.parse(c.as_of??'')))reasons.push('PUBLICATION_TIME_REQUIRED');
 if(l.expires_at&&(!c.as_of||Date.parse(l.expires_at)<=Date.parse(c.as_of)))reasons.push('LICENSE_EXPIRED');
 if(typeof c.commercial!=='boolean'||(c.commercial&&l.commercial_use_allowed!==true))reasons.push('COMMERCIAL_USE_NOT_CLEARED');
 if(typeof c.social_media!=='boolean'||(c.social_media&&l.social_media_use_allowed!==true))reasons.push('SOCIAL_USE_NOT_CLEARED');
 const platforms=c.platforms??(c.platform?[c.platform]:[]);if(!list(platforms)||!platforms.length||platforms.some(p=>!l.platforms.includes('*')&&!l.platforms.includes(p)))reasons.push('PLATFORM_NOT_CLEARED');
 if(!text(c.territory)||(!l.territories.includes('*')&&!l.territories.includes(c.territory)))reasons.push('TERRITORY_NOT_CLEARED');
 if(!Number.isFinite(c.duration)||c.duration<=0)reasons.push('DURATION_REQUIRED');else if(c.duration>a.audio.duration&&l.loop_allowed!==true)reasons.push('LOOP_NOT_CLEARED');
 for(const [key,values] of Object.entries(a.suitability??{})){const requested=key==='narration_presence'?String(c.narration_presence):c[key];if(values.length&&(!text(requested)||!values.includes(requested)))reasons.push('CONTEXT_MISMATCH:'+key)}
 return {compatible:reasons.length===0,reasons};
}
export function musicPreferences({business_id,version=1,music_enabled=false,automatic_recommendation_enabled=false,favorites=[],defaults=[],playlists=[],created_at}){
 need(text(business_id)&&typeof music_enabled==='boolean'&&typeof automatic_recommendation_enabled==='boolean'&&list(favorites)&&Array.isArray(defaults)&&Array.isArray(playlists),'MUSIC_PREFERENCES_INVALID');
 for(const d of defaults){need(text(d.music_asset_id)&&d.when&&Object.keys(d.when).every(k=>suitabilityFields.includes(k)&&text(d.when[k])),'MUSIC_DEFAULT_INVALID')}
 for(const p of playlists)need(text(p.name)&&list(p.music_asset_ids),'MUSIC_PLAYLIST_INVALID');
 return seal({business_id,version,music_enabled,automatic_recommendation_enabled,favorites,defaults,playlists,created_at});
}
export function recommendMusic(assets,context,preferences,{selected_id=null}={}){
 verify(preferences);need(preferences.business_id===context.business_id,'MUSIC_TENANT_MISMATCH');
 const candidates=latestMusic(assets).filter(a=>musicCompatibility(a,context).compatible);
 if(selected_id){const selected=candidates.find(a=>a.music_asset_id===selected_id);need(selected,'MUSIC_SELECTION_NOT_COMPATIBLE');return {status:'SELECTED',asset:selected,reason:'USER_SELECTION',recommendations:[]}}
 if(!preferences.automatic_recommendation_enabled)return {status:'HUMAN_SELECTION_REQUIRED',asset:null,recommendations:[]};
 const defaults=[...new Set(preferences.defaults.filter(d=>Object.entries(d.when).every(([k,v])=>String(context[k])===v)).map(d=>d.music_asset_id))],preferred=candidates.filter(a=>defaults.includes(a.music_asset_id));
 if(preferred.length===1)return {status:'SELECTED',asset:preferred[0],reason:'BUSINESS_DEFAULT',recommendations:[]};
 const favorites=candidates.filter(a=>preferences.favorites.includes(a.music_asset_id));
 if(!preferred.length&&favorites.length===1)return {status:'SELECTED',asset:favorites[0],reason:'BUSINESS_FAVORITE',recommendations:[]};
 if(candidates.length===1)return {status:'SELECTED',asset:candidates[0],reason:'ONLY_COMPATIBLE_TRACK',recommendations:[]};
 return {status:candidates.length?'RECOMMENDATIONS':'NO_COMPATIBLE_MUSIC',asset:null,recommendations:candidates.map(a=>({music_asset_id:a.music_asset_id,title:a.title,matched_context_fields:Object.keys(a.suitability??{})})).sort((a,b)=>a.music_asset_id.localeCompare(b.music_asset_id))};
}
export function audioMixPlan({id,business_id,content_job_id,voice_asset_id=null,music_asset=null,duration,audio_intent=null,hook_music_intent=null,section_intensity_changes=[],sfx_interaction=null}){
 need(Number.isFinite(duration)&&duration>0,'MIX_DURATION_REQUIRED');if(music_asset){verifyMusicAsset(music_asset);need(music_asset.business_id===business_id,'MUSIC_TENANT_MISMATCH');need(duration<=music_asset.audio.duration||music_asset.license.loop_allowed===true,'LOOP_NOT_CLEARED')}
 return seal({mix_plan_id:id,business_id,content_job_id,voice_asset_id,music_asset_id:music_asset?.music_asset_id??null,music_asset_hash:music_asset?.content_hash??null,music_start:music_asset?0:null,music_end:music_asset?duration:null,duration,loop_strategy:music_asset&&duration>music_asset.audio.duration?'LICENSED_LOOP_WITH_TRANSITION_REVIEW':'NO_LOOP',fade_in:{intent:'Smooth entrance; verify during mix QA',seconds:null},fade_out:{intent:'Smooth ending; verify during mix QA',seconds:null},ducking_intent:voice_asset_id&&music_asset?'Voice primary; reduce music beneath narration without making it inaudible':'NOT_REQUIRED',hook_music_intent,section_intensity_changes,sfx_interaction,audio_intent,perceptual_audibility_requirement:music_asset?'Music must be actually audible while preserving voice intelligibility and dominance when narration exists':'NO_MUSIC_REQUESTED',loudness_targets:null,credit_text:music_asset?.license.credit_required?music_asset.license.credit_text:null,qa_required:['MUSIC_AUDIBILITY_IF_PRESENT','VOICE_INTELLIGIBILITY_IF_PRESENT','NO_CLIPPING','NO_ACCIDENTAL_SILENCE','FADES_AND_TRANSITIONS','DURATION_MATCH'],qa_status:'NOT_RUN',publication_hold:true,release_allowed:false});
}
export function applyMusicSelection(manifest,selection,asset,context,mix){
 verify(manifest);if(!manifest.music.required)return manifest;
 verify(selection);verifyMusicAsset(asset);verify(mix);
 need(asset.business_id===manifest.business_id&&context.business_id===manifest.business_id&&mix.business_id===manifest.business_id&&mix.content_job_id===manifest.content_job_id&&selection.business_id===manifest.business_id&&selection.content_job_id===manifest.content_job_id&&selection.plan_hash===manifest.plan_hash&&selection.package_id===(manifest.effective_production_package_id??manifest.production_package_id)&&selection.package_hash===(manifest.effective_production_package_hash??manifest.production_package_hash)&&selection.music_asset_hash===asset.content_hash&&selection.music_asset_id===asset.music_asset_id&&selection.mix_plan_hash===mix.content_hash&&mix.music_asset_hash===asset.content_hash&&mix.voice_asset_id===manifest.voice_asset_id&&mix.duration===context.duration&&mix.music_start===0&&mix.music_end===context.duration,'MUSIC_SELECTION_IDENTITY_MISMATCH');
 need(musicCompatibility(asset,context).compatible,'MUSIC_SELECTION_NOT_COMPATIBLE');
 const unresolved=manifest.unresolved.filter(x=>x!=='MUSIC'),{content_hash,...base}=manifest;
 return seal({...base,music:{...manifest.music,status:'RESOLVED',music_asset_id:asset.music_asset_id,music_asset_hash:asset.content_hash,selection_id:selection.selection_id,rights_status:asset.rights_status},audio_mix_plan:mix,unresolved,status:unresolved.length?'ASSETS_PARTIAL':'ASSETS_READY',renderer_ready:unresolved.length===0,publication_hold:true,release_allowed:false});
}
