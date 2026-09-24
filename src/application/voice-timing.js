import {randomUUID} from 'node:crypto';
import {hash} from '../domain/research.js';
import {need,verify} from '../domain/assets.js';
import {approveVoice,retimeProduction} from '../domain/production-timing.js';
import {readAssets,putAssetEvidence,appendAssetManifest} from '../assets-postgres.js';

// No provider dependency: approval, timing revision and manifest append form one local transaction.
export class VoiceTimingService {
 constructor(repository){this.repository=repository}
 async record({plan,voice_asset_id,actor,decisions,source}){
  return this.repository.transact(plan,async c=>{
   const store=this.repository.store,job=await store.requireJob(c,plan.content_job_id,plan.business_id,true);
   need(job.current_state==='ASSETS_PENDING','VOICE_TIMING_STATE_INVALID');
   const {assetProduction:d}=await readAssets(c,plan.business_id,plan.content_job_id);
   const voice=d.artifacts.find(a=>a.asset_id===voice_asset_id);need(voice,'VOICE_ASSET_NOT_FOUND');
   const s=(await c.query('SELECT data,content_hash FROM script_drafts WHERE id=$1 AND business_id=$2 AND content_job_id=$3',[plan.script_id,plan.business_id,plan.content_job_id])).rows[0];
   const p=(await c.query('SELECT data,content_hash FROM production_packages WHERE id=$1 AND business_id=$2 AND content_job_id=$3',[plan.production_package_id,plan.business_id,plan.content_job_id])).rows[0];
   need(s&&p&&s.data.output_hash===s.content_hash&&p.data.content_hash===p.content_hash,'TIMING_INPUT_HASH_MISMATCH');
   const profile=voice.provenance.profile;
   const persisted=(await this.repository.voiceProfiles.list(plan.business_id,c)).find(x=>x.content_hash===profile?.content_hash);
   need(persisted&&persisted.status==='APPROVED','APPROVED_VOICE_PROFILE_REQUIRED');
   const {mp3QA}=await import('../media/audio-decoder.js');
   const proposed=approveVoice({id:randomUUID(),plan,script:s.data,pkg:p.data,voice,actor,decisions,source,created_at:new Date().toISOString(),voiceDecoder:mp3QA});
   const previous=d.voiceApprovals.find(a=>a.voice_asset_id===voice_asset_id&&a.plan_hash===plan.content_hash);
   if(previous){verify(previous);need(previous.identity_hash===proposed.identity_hash,'VOICE_APPROVAL_IDENTITY_CONFLICT');
    const ref=d.timingRevisions.find(t=>t.approval_id===previous.approval_id);need(ref,'TIMING_REVISION_MISSING');
    const pkg=(await c.query('SELECT data FROM production_packages WHERE id=$1 AND business_id=$2 AND content_job_id=$3',[ref.package_id,plan.business_id,plan.content_job_id])).rows[0]?.data;verify(pkg);need(pkg.content_hash===ref.package_hash,'TIMING_PACKAGE_HASH_MISMATCH');
    const manifest=d.manifests.find(m=>m.effective_production_package_id===pkg.production_package_id);need(manifest,'TIMING_MANIFEST_MISSING');return {approval:previous,package:pkg,manifest,reused:true};
   }
   const max=(await c.query('SELECT COALESCE(MAX(version),0)::int AS version FROM production_packages WHERE business_id=$1 AND content_job_id=$2',[plan.business_id,plan.content_job_id])).rows[0].version;
   const pkg=retimeProduction({id:randomUUID(),version:max+1,plan,script:s.data,pkg:p.data,voice,approval:proposed,created_at:new Date().toISOString()});
   await putAssetEvidence(c,plan.business_id,plan.content_job_id,'asset_human_voice_approval',voice_asset_id,proposed);
   await c.query('INSERT INTO production_packages(id,business_id,content_job_id,script_id,version,data,content_hash) VALUES($1,$2,$3,$4,$5,$6,$7)',[pkg.production_package_id,plan.business_id,plan.content_job_id,plan.script_id,pkg.package_version,pkg,pkg.content_hash]);
   // Existing requirement IDs deliberately remain references to the approved creative package.
   const ref={plan_id:plan.plan_id,plan_hash:plan.content_hash,package_id:pkg.production_package_id,package_hash:pkg.content_hash,package_version:pkg.package_version,approval_id:proposed.approval_id,approval_hash:proposed.content_hash,created_at:pkg.created_at};
   const {seal}=await import('../domain/assets.js');await putAssetEvidence(c,plan.business_id,plan.content_job_id,'asset_package_timing',pkg.production_package_id,seal(ref));
   const readback=(await c.query('SELECT data FROM production_packages WHERE id=$1 AND business_id=$2',[pkg.production_package_id,plan.business_id])).rows[0].data;need(hash(readback)===hash(pkg),'TIMING_PERSISTENCE_FAILED');
   const manifest=await appendAssetManifest(c,plan);
   return {approval:proposed,package:pkg,manifest,reused:false};
  });
 }
}
