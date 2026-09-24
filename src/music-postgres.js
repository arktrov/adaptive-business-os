import {randomUUID,createHash} from 'node:crypto';
import {musicAsset,verifyMusicAsset,musicPreferences,latestMusic} from './domain/music.js';
import {verify,need} from './domain/assets.js';
import {hash} from './domain/research.js';
import {wavQA} from './domain/asset-qa.js';
import {mp3QA} from './media/audio-decoder.js';
export function inspectMusicAudio(data,duration){return data.format==='wav'?wavQA(Buffer.from(data.bytes_base64,'base64'),duration):mp3QA(data,duration)}
export class BusinessMusicRepository{
 constructor(store){this.store=store}
 async list(b,c=this.store.pool){const r=await c.query('SELECT data,content_hash FROM business_music_assets WHERE business_id=$1 ORDER BY music_asset_id,version',[b]);return r.rows.map(r=>{need(r.data.content_hash===r.content_hash,'MUSIC_HASH_MISMATCH');return verifyMusicAsset(r.data)})}
 async preferences(b,c=this.store.pool){const row=(await c.query('SELECT data,content_hash FROM business_music_preferences WHERE business_id=$1 ORDER BY version DESC LIMIT 1',[b])).rows[0];if(!row)return musicPreferences({business_id:b,created_at:null});verify(row.data);need(row.content_hash===row.data.content_hash,'MUSIC_HASH_MISMATCH');return row.data}
 async lock(b,fn){return this.store.transaction(async c=>{await c.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',[b+':music']);return fn(c)})}
 async importCandidate(b,input,{decoder=inspectMusicAudio}={}){
  need(!input.business_id||input.business_id===b,'MUSIC_TENANT_MISMATCH');
  const bytes=Buffer.from(input.data?.bytes_base64??'','base64');need(bytes.length>0&&bytes.length<=32*1024*1024,'MUSIC_AUDIO_REQUIRED');
  const qa=decoder(input.data,input.expected_duration);need(qa.status==='PASS','MUSIC_QA_FAILED');
  const license={license_type:'UNKNOWN',license_reference:null,license_evidence:null,commercial_use_allowed:null,social_media_use_allowed:null,platforms:[],territories:[],expires_at:null,credit_required:null,credit_text:null,loop_allowed:null,...input.license};
  return this.lock(b,async c=>{const a=musicAsset({music_asset_id:randomUUID(),business_id:b,version:1,title:input.title,creator:input.creator,provider:input.provider,provider_asset_reference:input.provider_asset_reference,source_reference:input.source_reference??null,provenance:input.provenance,suitability:input.suitability??{},license,status:'CANDIDATE',rights_status:'REVIEW_REQUIRED',approval:null,rights_decision:null,audio:{format:input.data.format,duration:qa.duration,content_hash:createHash('sha256').update(bytes).digest('hex'),qa},data:input.data,created_at:new Date().toISOString()});await this.save(c,a);return a});
 }
 async save(c,a){await c.query('INSERT INTO business_music_assets(business_id,music_asset_id,version,status,content_hash,data) VALUES($1,$2,$3,$4,$5,$6)',[a.business_id,a.music_asset_id,a.version,a.status,a.content_hash,a]);return a}
 async decision(b,id,{expected_hash,status,rights_status,license,usage_confirmation,actor,reference}){
  need(actor==='human'&&reference,'HUMAN_MUSIC_DECISION_REQUIRED');
  return this.lock(b,async c=>{const old=latestMusic(await this.list(b,c)).find(a=>a.music_asset_id===id);need(old&&old.content_hash===expected_hash,'MUSIC_VERSION_CONFLICT');const {content_hash,...body}=old;
   const changedLicense=license&&hash(license)!==hash(old.license);const nextRights=rights_status??(changedLicense?'REVIEW_REQUIRED':old.rights_status);
   const next=musicAsset({...body,version:old.version+1,status:status??old.status,rights_status:nextRights,license:license??old.license,provenance:{...old.provenance,...(usage_confirmation?{usage_confirmation}:{})},approval:status==='APPROVED'?{actor,reference}:old.approval,rights_decision:rights_status==='CLEARED'?{actor,reference}:changedLicense?null:old.rights_decision,lifecycle_decision:{actor,reference,occurred_at:new Date().toISOString()}});await this.save(c,next);return next});
 }
 async savePreferences(b,input){need(!input.business_id||input.business_id===b,'MUSIC_TENANT_MISMATCH');return this.lock(b,async c=>{const previous=(await c.query('SELECT version FROM business_music_preferences WHERE business_id=$1 ORDER BY version DESC LIMIT 1',[b])).rows[0];const p=musicPreferences({...input,business_id:b,version:(previous?.version??0)+1,created_at:new Date().toISOString()}),tracks=latestMusic(await this.list(b,c));for(const id of [...p.favorites,...p.defaults.map(d=>d.music_asset_id),...p.playlists.flatMap(p=>p.music_asset_ids)])need(tracks.some(t=>t.music_asset_id===id),'MUSIC_PREFERENCE_TRACK_NOT_FOUND');await c.query('INSERT INTO business_music_preferences(business_id,version,content_hash,data) VALUES($1,$2,$3,$4)',[b,p.version,p.content_hash,p]);return p})}
 async preview(b,id){const a=latestMusic(await this.list(b)).find(a=>a.music_asset_id===id);need(a&&a.status!=='RETIRED','MUSIC_NOT_FOUND');return {bytes:Buffer.from(a.data.bytes_base64,'base64'),format:a.audio.format}}
}
