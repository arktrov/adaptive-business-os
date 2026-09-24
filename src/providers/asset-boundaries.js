import {verifyVoiceProfile,compatibleVoiceProfile,voiceRequirements,voiceRequirement,voiceContext} from '../domain/voice-profiles.js';
import {need} from '../domain/assets.js';
export const providerCapabilities=['VoiceGenerationProvider','ImageGenerationProvider','VideoGenerationProvider','SourceMediaProvider','MusicSourceProvider'];
export function verifyProvider(p,capability){need(providerCapabilities.includes(capability)&&p?.describe&&p?.request,'INVALID_ASSET_PROVIDER');need(p.describe().capabilities.includes(capability),'PROVIDER_CAPABILITY_MISMATCH');return p}
export function voiceInput(plan,profile,credentialPresent,requirement='VOICE'){
 if(voiceRequirements(plan).length===0)return null;
 const v=voiceRequirement(plan,requirement);need(v,'VOICE_REQUIREMENT_SELECTION_REQUIRED');
 verifyVoiceProfile(profile);need(compatibleVoiceProfile(profile,voiceContext(plan,v)),'VOICE_PROFILE_MISSING');
 need(credentialPresent,'VOICE_PROVIDER_CREDENTIAL_NOT_AVAILABLE');
 return {text:v.text,text_hash:v.text_hash,script_id:plan.script_id,script_hash:plan.script_hash,language:v.language,profile,settings:profile.generation_settings,expected_duration:v.expected_duration};
}
export {wavQA,pngQA} from '../domain/asset-qa.js';
