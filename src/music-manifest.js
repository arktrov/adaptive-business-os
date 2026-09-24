import {voiceRequirements} from './domain/voice-profiles.js';
import {BusinessMusicRepository,inspectMusicAudio} from './music-postgres.js';
import {latestMusic,musicCompatibility,applyMusicSelection} from './domain/music.js';
import {verify,seal,need} from './domain/assets.js';
// Revalidate current approval/license revisions and expiration on every readiness check.
export async function resolveManifestMusic(c,plan,d,manifest,asOf=new Date().toISOString()){
 if(!plan.music.required)return manifest;
 const selection=d.musicSelections.filter(s=>s.plan_hash===plan.content_hash).at(-1);if(!selection)return manifest;verify(selection);
 await c.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',[plan.business_id+':music']);
 const library=new BusinessMusicRepository({pool:c}),asset=latestMusic(await library.list(plan.business_id,c)).find(a=>a.music_asset_id===selection.music_asset_id),mix=d.audioMixPlans.find(m=>m.mix_plan_id===selection.mix_plan_id);
 const context={...selection.context,business_id:plan.business_id,as_of:asOf,duration:manifest.production_timing?.effective_narration_duration??selection.context.duration,narration_presence:voiceRequirements(plan).length>0};
 const reasons=asset?musicCompatibility(asset,context).reasons:['TRACK_NOT_FOUND'];
 if(asset&&asset.content_hash!==selection.music_asset_hash)reasons.push('TRACK_REVISION_CHANGED');
 if(selection.package_hash!==(manifest.effective_production_package_hash??manifest.production_package_hash))reasons.push('TIMING_REVISION_CHANGED');
 if(mix&&mix.voice_asset_id!==manifest.voice_asset_id)reasons.push('VOICE_BINDING_CHANGED');
 if(reasons.length){const {content_hash,...body}=manifest;return seal({...body,music:{...manifest.music,status:'UNRESOLVED',selection_id:selection.selection_id,blocking_reasons:reasons},unresolved:[...new Set([...manifest.unresolved,'MUSIC'])],status:'ASSETS_PARTIAL',renderer_ready:false})}
 need(mix,'AUDIO_MIX_PLAN_MISSING');const qa=inspectMusicAudio(asset.data,asset.audio.duration);need(qa.file_sha256===asset.audio.content_hash,'MUSIC_AUDIO_HASH_MISMATCH');
 return applyMusicSelection(manifest,selection,asset,context,mix);
}
