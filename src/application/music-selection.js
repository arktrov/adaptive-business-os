import {voiceRequirements} from '../domain/voice-profiles.js';
import {randomUUID} from 'node:crypto';
import {BusinessMusicRepository,inspectMusicAudio} from '../music-postgres.js';
import {recommendMusic,audioMixPlan,latestMusic,musicCompatibility,applyMusicSelection} from '../domain/music.js';
import {seal,verify,need} from '../domain/assets.js';
import {readAssets,putAssetEvidence,appendAssetManifest,currentAssetManifest} from '../assets-postgres.js';
export class MusicSelectionService{
 constructor(repository){this.repository=repository;this.library=new BusinessMusicRepository(repository.store)}
 async select({plan,context,selected_id=null,actor='human'}){
  return this.repository.transact(plan,async c=>{
   need(plan.music.required===true,'MUSIC_NOT_REQUIRED');
   const {assetProduction:d}=await readAssets(c,plan.business_id,plan.content_job_id);
   const m=await currentAssetManifest(c,plan,d,{id:'music-selection-preflight',version:1,attempts:d.attempts.map(a=>a.attempt_id),created_at:new Date().toISOString()});
   const duration=m.production_timing?.effective_narration_duration??(await c.query('SELECT data FROM production_packages WHERE id=$1 AND business_id=$2',[plan.production_package_id,plan.business_id])).rows[0].data.target_duration;
   need(!context.business_id||context.business_id===plan.business_id,'MUSIC_TENANT_MISMATCH');
   const scope={...context,business_id:plan.business_id,duration,narration_presence:voiceRequirements(plan).length>0,as_of:new Date().toISOString()};
   await c.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',[plan.business_id+':music']);
   const choice=recommendMusic(await this.library.list(plan.business_id,c),scope,await this.library.preferences(plan.business_id,c),{selected_id});if(choice.status!=='SELECTED')return choice;
   need(['human','automatic'].includes(actor)&&(!selected_id||actor==='human'),'MUSIC_SELECTION_ACTOR_INVALID');
   const a=choice.asset,qa=inspectMusicAudio(a.data,a.audio.duration);need(qa.file_sha256===a.audio.content_hash,'MUSIC_AUDIO_HASH_MISMATCH');
   const ref={plan_id:plan.plan_id,plan_hash:plan.content_hash,business_id:plan.business_id,content_job_id:plan.content_job_id,package_id:m.effective_production_package_id??m.production_package_id,package_hash:m.effective_production_package_hash??m.production_package_hash,music_asset_id:a.music_asset_id,music_asset_hash:a.content_hash,music_asset_version:a.version,context:scope,actor,reason:choice.reason};
   const pkg=(await c.query('SELECT data FROM production_packages WHERE id=$1 AND business_id=$2',[ref.package_id,plan.business_id])).rows[0].data;
   const mix=audioMixPlan({id:randomUUID(),business_id:plan.business_id,content_job_id:plan.content_job_id,voice_asset_id:m.voice_asset_id,music_asset:a,duration,audio_intent:plan.music.intent,hook_music_intent:pkg.audio_plan.hook_audio_intent??null,section_intensity_changes:pkg.audio_plan.section_intensity_changes??[],sfx_interaction:pkg.audio_plan.sfx_requirements??null});
   const selection=seal({...ref,selection_id:randomUUID(),mix_plan_id:mix.mix_plan_id,mix_plan_hash:mix.content_hash,created_at:scope.as_of});
   await putAssetEvidence(c,plan.business_id,plan.content_job_id,'asset_audio_mix_plan',mix.mix_plan_id,mix);
   await putAssetEvidence(c,plan.business_id,plan.content_job_id,'asset_music_selection',selection.selection_id,selection);
   return {status:'SELECTED',selection,mix,manifest:await appendAssetManifest(c,plan)};
  });
 }
}
