import {randomUUID} from 'node:crypto';
import {voiceProfile,verifyVoiceProfile,selectVoiceProfile} from './domain/voice-profiles.js';
const need=(ok,code)=>{if(!ok)throw Error(code)};
export class BusinessVoiceProfiles {
 constructor(store){this.store=store}
 async list(b,c=this.store.pool){const rows=(await c.query('SELECT data FROM business_voice_profiles WHERE business_id=$1 ORDER BY voice_profile_id,version',[b])).rows;return rows.map(r=>verifyVoiceProfile(r.data))}
 async select(context,c=this.store.pool){return selectVoiceProfile(await this.list(context.business_id,c),context)}
 async append(b,id,build){return this.store.transaction(async c=>{
  await c.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',[b+':voice:'+id]);
  const old=(await c.query('SELECT data FROM business_voice_profiles WHERE business_id=$1 AND voice_profile_id=$2 ORDER BY version DESC LIMIT 1',[b,id])).rows[0]?.data;
  if(old)verifyVoiceProfile(old);const p=voiceProfile(build(old));
  need(p.business_id===b&&p.voice_profile_id===id&&p.version===(old?.version??0)+1,'VOICE_PROFILE_VERSION_CONFLICT');
  await c.query('INSERT INTO business_voice_profiles(business_id,voice_profile_id,version,status,content_hash,data) VALUES($1,$2,$3,$4,$5,$6)',[b,id,p.version,p.status,p.content_hash,p]);return p;
 })}
 async candidate(b,input){const id=input.voice_profile_id??randomUUID();return this.append(b,id,old=>{
  const time=new Date().toISOString();return {...input,business_id:b,voice_profile_id:id,version:(old?.version??0)+1,status:'CANDIDATE',approved_by:null,approved_at:null,approval_reference:null,created_at:old?.created_at??time,updated_at:time};
 })}
 async decision(b,id,{expected_hash,decision,actor,reference}){
  need(actor?.type==='human'&&actor.id&&reference,'HUMAN_VOICE_DECISION_REQUIRED');
  need(['APPROVED','RETIRED'].includes(decision),'VOICE_DECISION_INVALID');
  return this.append(b,id,old=>{need(old&&old.content_hash===expected_hash,'VOICE_PROFILE_VERSION_CONFLICT');need(decision==='RETIRED'||old.status==='CANDIDATE','VOICE_PROFILE_APPROVAL_TRANSITION_INVALID');const {content_hash,...body}=old,time=new Date().toISOString();return {...body,version:old.version+1,status:decision,updated_at:time,lifecycle_decision:{decision,actor,reference,occurred_at:time},...(decision==='APPROVED'?{approved_by:actor.id,approved_at:time,approval_reference:reference}:{})}});
 }
 async assertSelected(b,p,context,c=this.store.pool){verifyVoiceProfile(p);const current=await this.select({...context,business_id:b,voice_profile_id:p.voice_profile_id},c);need(current.content_hash===p.content_hash,'VOICE_PROFILE_VERSION_CONFLICT');return current}
}
