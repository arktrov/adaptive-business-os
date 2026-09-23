import {readFile,mkdir,open} from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {hash,assertSafe} from '../domain/research.js';
import {verify,need} from '../domain/assets.js';
import {voiceInput} from '../providers/asset-boundaries.js';
import {AssetService} from './asset-service.js';
import {mp3QA,checkAudioTools} from '../media/audio-decoder.js';
export async function durableJSON(file,value){assertSafe(value);await mkdir(path.dirname(file),{recursive:true});const handle=await open(file,'wx');try{await handle.writeFile(JSON.stringify(value));await handle.sync()}finally{await handle.close()}const restored=JSON.parse(await readFile(file,'utf8'));need(hash(restored)===hash(value),'LOCAL_RECOVERY_VERIFY_FAILED');return file}
export async function prepareVoiceOnce(repository,permit){
 need(permit.max_calls===1&&permit.operation==='voice-production','VOICE_PERMIT_INVALID');
 const job=await repository.store.getJob(permit.content_job_id,permit.business_id);need(job.job.current_state==='ASSETS_PENDING','VOICE_JOB_STATE_CHANGED');
 const records=job.assetProduction,plan=records.plans.find(p=>p.plan_id===permit.plan_id);need(plan,'VOICE_PLAN_MISSING');verify(plan);
 need(plan.content_hash===permit.plan_hash&&plan.script_id===permit.script_id&&plan.production_package_id===permit.package_id,'VOICE_INPUT_CHANGED');
 const script=job.scripts.find(s=>s.script_id===permit.script_id),pkg=job.productionPackages.find(p=>p.production_package_id===permit.package_id);
 need(script&&pkg&&script.output_hash===plan.script_hash&&pkg.content_hash===plan.production_package_hash&&script.voiceover_text===plan.voice.text,'VOICE_INPUT_CHANGED');
 need(pkg.publication_hold===true&&pkg.release_allowed===false,'VOICE_RELEASE_GUARD');
 const profile=await repository.voiceProfiles.select({business_id:permit.business_id,voice_required:true,voice_profile_id:permit.voice_profile_id,language:plan.voice.language});need(profile.content_hash===permit.profile_hash,'VOICE_PROFILE_CHANGED');
 const request=voiceInput(plan,profile,true);need(hash(request)===permit.request_hash,'VOICE_REQUEST_CHANGED');
 need(!records.attempts.some(a=>a.plan_hash===plan.content_hash&&a.requirement_id==='VOICE'),'ASSET_ATTEMPT_ALREADY_EXISTS');
 const authorization=(await repository.store.pool.query("SELECT payload FROM evidence_records WHERE business_id=$1 AND job_id=$2 AND type='asset_voice_authorization' AND reference=$3",[permit.business_id,permit.content_job_id,permit.permit_id])).rows[0]?.payload;
 need(authorization&&authorization.permit_hash===hash(permit),'PERSISTED_VOICE_AUTHORIZATION_REQUIRED');
 return {plan,profile,request,records};
}
export async function executeVoiceOnce(repository,permit,{provider,directory}){
 checkAudioTools();const {plan,profile}=await prepareVoiceOnce(repository,permit);
 await durableJSON(path.join(directory,permit.permit_id+'.consumed.json'),{permit_id:permit.permit_id,permit_hash:hash(permit),consumed_at:new Date().toISOString()});
 const service=new AssetService(repository,{responseRecovery:response=>durableJSON(path.join(directory,response.attempt_id+'.response.json'),response)});
 const asset=await service.produce({plan,requirement:'VOICE',profile,credentialPresent:true,provider,decoder:mp3QA,authorization:{max_calls:1,plan_hash:plan.content_hash,requirement_id:'VOICE',permit_id:permit.permit_id}});
 const bytes=Buffer.from(asset.data.bytes_base64,'base64'),file=path.join(directory,asset.asset_id+'.mp3'),handle=await open(file,'wx');try{await handle.writeFile(bytes);await handle.sync()}finally{await handle.close()}
 const saved=await readFile(file);need(saved.length>0&&createHash('sha256').update(saved).digest('hex')===asset.qa.file_sha256,'VOICE_FILE_VERIFY_FAILED');
 const manifest=await repository.manifest(plan);
 return {provider_calls:provider.diagnostics().external_calls,request_id:asset.provenance.request_id,voice_asset_id:asset.asset_id,output_format:'mp3_44100_128',duration:asset.qa.duration,file_sha256:asset.qa.file_sha256,file,technical_qa:asset.qa,usage:asset.provenance.usage,cost:asset.provenance.cost,recoverable_artifact:true,manifest_id:manifest.manifest_id,manifest_version:manifest.version,manifest_status:manifest.status,unresolved:manifest.unresolved,publication_hold:manifest.publication_hold,release_allowed:manifest.release_allowed};
}
