import {hash,assertSafe} from './research.js';
const need=(ok,code)=>{if(!ok)throw Error(code)};
const fields=['voice_profile_id','business_id','display_name','provider','model','provider_voice_reference','language','supported_languages','style_profile','use_cases','channels','formats','content_types','generation_settings','output_settings','source_reference','voice_kind','consent','version','status','approved_by','approved_at','approval_reference','created_at','updated_at','lifecycle_decision'];
const lists=['supported_languages','use_cases','channels','formats','content_types'];
export function safeProfile(value){
 assertSafe(value);
 const visit=x=>{if(!x||typeof x!=='object')return;for(const [k,v] of Object.entries(x)){need(k==='provider_authorization_reference'||!/credential|authorization|api.?key|secret|password|token|headers/i.test(k),'VOICE_PROFILE_SECRET_FORBIDDEN');visit(v)}};visit(value);
}
export function voiceProfile(input){
 safeProfile(input);need(Object.keys(input).every(k=>fields.includes(k)),'VOICE_PROFILE_FIELD_INVALID');
 const p={display_name:null,provider:null,model:null,provider_voice_reference:null,language:null,supported_languages:[],style_profile:null,use_cases:[],channels:[],formats:[],content_types:[],generation_settings:{},output_settings:{},source_reference:null,voice_kind:'UNKNOWN',consent:null,approved_by:null,approved_at:null,approval_reference:null,lifecycle_decision:null,...input};
 need(p.business_id&&p.voice_profile_id&&Number.isInteger(p.version)&&p.version>0,'VOICE_PROFILE_IDENTITY_INVALID');
 need(['CANDIDATE','APPROVED','RETIRED'].includes(p.status)&&['UNKNOWN','CATALOGUE','CUSTOM','IMPORTED','CLONED'].includes(p.voice_kind),'VOICE_PROFILE_STATUS_INVALID');
 need(lists.every(k=>Array.isArray(p[k])&&p[k].every(v=>typeof v==='string'&&v.trim())),'VOICE_PROFILE_COMPATIBILITY_INVALID');
 need(p.created_at&&p.updated_at&&Number.isFinite(Date.parse(p.created_at))&&Number.isFinite(Date.parse(p.updated_at)),'VOICE_PROFILE_TIMESTAMP_REQUIRED');
 if(p.status==='APPROVED'){
  need(p.voice_kind!=='UNKNOWN','VOICE_ORIGIN_REQUIRED');
  need(p.provider&&p.model&&p.provider_voice_reference&&(p.language||p.supported_languages.length),'VOICE_PROFILE_INCOMPLETE');
  need(p.approved_by&&p.approved_at&&p.approval_reference,'VOICE_PROFILE_APPROVAL_REQUIRED');
  if(p.voice_kind!=='CATALOGUE')need(p.consent?.provider_authorization_reference&&p.consent?.human_consent_reference,'VOICE_CONSENT_REQUIRED');
 }else if(p.status==='CANDIDATE')need(!p.approved_by&&!p.approved_at&&!p.approval_reference,'CANDIDATE_NOT_APPROVED');
 return {...p,content_hash:hash(p)};
}
export function verifyVoiceProfile(p){need(p,'VOICE_PROFILE_MISSING');const {content_hash,...body}=p;const expected=voiceProfile(body);need(content_hash===expected.content_hash,'VOICE_PROFILE_HASH_MISMATCH');return p}
export function compatibleVoiceProfile(p,c){
 verifyVoiceProfile(p);if(p.status!=='APPROVED'||p.business_id!==c.business_id||(c.voice_profile_id&&c.voice_profile_id!==p.voice_profile_id)||!p.provider_voice_reference)return false;
 if(c.language&&p.language!==c.language&&!p.supported_languages.includes(c.language))return false;
 if(c.style&&p.style_profile!==c.style)return false;
 for(const [key,list] of [['use_case','use_cases'],['channel','channels'],['format','formats'],['content_type','content_types']])if(p[list].length&&(!c[key]||!p[list].includes(c[key])))return false;
 if(c.available_providers&&!c.available_providers.includes(p.provider))return false;
 return true;
}
export function selectVoiceProfile(profiles,context){
 if(context.voice_required===false)return null;
 // Only the latest immutable revision of each business profile is eligible.
 const latest=new Map();for(const p of profiles){verifyVoiceProfile(p);if(p.business_id!==context.business_id)continue;const old=latest.get(p.voice_profile_id);if(!old||p.version>old.version)latest.set(p.voice_profile_id,p)}
 const found=[...latest.values()].filter(p=>(!context.voice_profile_id||p.voice_profile_id===context.voice_profile_id)&&compatibleVoiceProfile(p,context));
 need(found.length,'VOICE_PROFILE_MISSING');need(found.length===1,'VOICE_PROFILE_SELECTION_REQUIRED');return found[0];
}
// Legacy plans retain their original hashes; their persisted narration is the evidence of a voice requirement.
export function voiceRequirements(plan){if(plan.voice_required===false)return [];if(Array.isArray(plan.voice_requirements))return plan.voice_requirements;return plan.voice?.text?[{...plan.voice,requirement_id:'VOICE'}]:[]}
export function voiceRequirement(plan,id='VOICE'){const requirements=voiceRequirements(plan);if(id==='VOICE'&&requirements.length===1)return requirements[0];return requirements.find(r=>r.requirement_id===id)??null}
export function voiceContext(plan,requirement){return {business_id:plan.business_id,voice_required:voiceRequirements(plan).length>0,language:requirement?.language,style:requirement?.style??null,use_case:requirement?.use_case??null,channel:requirement?.channel??null,format:requirement?.format??null,content_type:requirement?.content_type??null,voice_profile_id:requirement?.voice_profile_id??null}}
export function compositionVoices(pkg,script,id){
 const config=pkg.voice_configuration??{};const required=config.voice_required??pkg.audio_plan?.voice_required??Boolean(script.voiceover_text?.trim());
 need(typeof required==='boolean','VOICE_REQUIREMENT_INVALID');
 if(!required){need(!config.voices?.length,'VOICE_REQUIREMENT_CONFLICT');return {voice_required:false,voice_requirements:[],voice:null}}
 const slots=config.voices??[{requirement_id:'VOICE',text:script.voiceover_text,language:script.language,expected_duration:script.estimated_duration}];
 need(Array.isArray(slots)&&slots.length>0,'VOICE_REQUIREMENT_INVALID');
 const voices=slots.map((v,i)=>{need(typeof v.text==='string'&&v.text.trim()&&v.language&&Number.isFinite(v.expected_duration)&&v.expected_duration>0,'VOICE_REQUIREMENT_INVALID');return {...v,requirement_id:v.requirement_id??id+':voice:'+i,text_hash:hash(v.text),audio_plan:pkg.audio_plan??{}}});
 need(new Set(voices.map(v=>v.requirement_id)).size===voices.length,'VOICE_REQUIREMENT_DUPLICATE');return {voice_required:true,voice_requirements:voices,voice:voices.length===1?voices[0]:null};
}
