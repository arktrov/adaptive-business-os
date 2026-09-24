import {randomUUID} from 'node:crypto';
import {hash} from '../domain/research.js';
import {seal,need} from '../domain/assets.js';
import {createNativeSceneAsset,validateNativeSceneAsset} from '../domain/native-scenes.js';
import {loadNativeContext} from '../native-scene-context.js';
import {readAssets,currentAssetManifest,putAssetEvidence,appendAssetManifest} from '../assets-postgres.js';
// Offline authoring only. No provider registry, network transport or renderer is reachable here.
export class NativeSceneService{
 constructor(repository){this.repository=repository}
 async createBatch({plan,package_id,designs,source}){
  return this.repository.transact(plan,async c=>{
   const job=await this.repository.store.requireJob(c,plan.content_job_id,plan.business_id,true);need(job.current_state==='ASSETS_PENDING','NATIVE_STATE');
   const {assetProduction:d}=await readAssets(c,plan.business_id,plan.content_job_id);
   const pre=await currentAssetManifest(c,plan,d,{id:'native-preflight',version:1,attempts:d.attempts.map(a=>a.attempt_id),created_at:new Date().toISOString()});
   need(package_id===(pre.effective_production_package_id??plan.production_package_id),'STALE_NATIVE_PACKAGE');
   const context=await loadNativeContext(c,plan,package_id);
   need(designs.length===plan.requirements.length&&new Set(designs.map(x=>x.beat_id)).size===designs.length&&source?.reference&&source?.sha256,'NATIVE_BATCH_COVERAGE');
   const identity=hash({plan_hash:plan.content_hash,package_hash:context.pkg.content_hash,designs,source});
   const prior=(await c.query("SELECT payload FROM evidence_records WHERE business_id=$1 AND job_id=$2 AND type='asset_native_scene_batch' AND reference=$3",[plan.business_id,plan.content_job_id,identity])).rows[0]?.payload;
   if(prior){const assets=prior.asset_ids.map(id=>d.artifacts.find(a=>a.asset_id===id));for(const a of assets)validateNativeSceneAsset(context,a);const manifest=d.manifests.find(m=>m.manifest_id===prior.manifest_id);need(manifest,'NATIVE_BATCH_MANIFEST');return {assets,manifest,reused:true,external_calls:0}}
   const created_at=new Date().toISOString(),assets=designs.map(x=>createNativeSceneAsset(context,{id:randomUUID(),version:Math.max(0,...d.artifacts.filter(a=>a.beat_ids?.includes(x.beat_id)).map(a=>a.version))+1,beat_id:x.beat_id,design:x.design,created_at}));
   for(const a of assets)await putAssetEvidence(c,plan.business_id,plan.content_job_id,'asset_artifact',a.asset_id,a);
   const {assetProduction:readback}=await readAssets(c,plan.business_id,plan.content_job_id);for(const a of assets){const stored=readback.artifacts.find(x=>x.asset_id===a.asset_id);need(stored&&hash(stored)===hash(a),'NATIVE_PERSISTENCE');validateNativeSceneAsset(context,stored)}
   const manifest=await appendAssetManifest(c,plan);
   const batch=seal({batch_id:randomUUID(),identity_hash:identity,business_id:plan.business_id,content_job_id:plan.content_job_id,plan_hash:plan.content_hash,package_hash:context.pkg.content_hash,asset_ids:assets.map(a=>a.asset_id),manifest_id:manifest.manifest_id,source,external_calls:0,created_at});
   await putAssetEvidence(c,plan.business_id,plan.content_job_id,'asset_native_scene_batch',identity,batch);
   return {assets,manifest,reused:false,external_calls:0};
  });
 }
}
