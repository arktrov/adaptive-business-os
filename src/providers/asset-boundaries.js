import {need} from '../domain/assets.js';
export const providerCapabilities=['VoiceGenerationProvider','ImageGenerationProvider','VideoGenerationProvider','SourceMediaProvider'];
export function verifyProvider(p,capability){need(providerCapabilities.includes(capability)&&p?.describe&&p?.request,'INVALID_ASSET_PROVIDER');need(p.describe().capabilities.includes(capability),'PROVIDER_CAPABILITY_MISMATCH');return p}
export function voiceInput(plan,profile,credentialPresent){need(profile?.provider&&profile?.model&&profile?.voice_id&&profile?.version&&profile?.language===plan.voice.language,'VOICE_PROFILE_MISSING');need(credentialPresent,'VOICE_PROVIDER_CREDENTIAL_NOT_AVAILABLE');return {text:plan.voice.text,text_hash:plan.voice.text_hash,script_id:plan.script_id,script_hash:plan.script_hash,language:plan.voice.language,profile,settings:profile.settings??{},expected_duration:plan.voice.expected_duration}}
export {wavQA,pngQA} from '../domain/asset-qa.js';
