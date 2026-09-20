import {assertSafe} from '../domain/research.js';
import {researchProviderProfiles} from './research-provider-profiles.js';
const integer=(value,fallback,min,max)=>{const n=value===undefined?fallback:Number(value);if(!Number.isInteger(n)||n<min||n>max)throw Error('INVALID_OPENAI_CONFIGURATION');return n};
export function openAIResearchConfig(env=process.env){
 const profileId=env.OPENAI_RESEARCH_PROFILE;
 const profile=profileId?researchProviderProfiles[profileId]:null;
 if(profileId&&(!Object.hasOwn(researchProviderProfiles,profileId)||profile.provider!=='openai'))throw Error('INVALID_OPENAI_PROFILE');
 const model=env.OPENAI_RESEARCH_MODEL||profile?.model||'gpt-5.6-sol';
 if(!/^[a-z0-9][a-z0-9.-]{0,99}$/.test(model))throw Error('INVALID_OPENAI_MODEL');
 const effort=env.OPENAI_RESEARCH_REASONING_EFFORT??profile?.reasoning_effort;
 if(effort!==undefined&&!['none','low','medium','high','xhigh','max'].includes(effort))throw Error('INVALID_OPENAI_REASONING_EFFORT');
 const config={model,max_output_tokens:integer(env.OPENAI_RESEARCH_MAX_OUTPUT_TOKENS,profile?.max_output_tokens??6000,512,128000),max_tool_calls:integer(env.OPENAI_RESEARCH_MAX_TOOL_CALLS,profile?.max_tool_calls??4,1,16),timeout_ms:integer(env.OPENAI_RESEARCH_TIMEOUT_MS,120000,100,180000),max_input_bytes:65536,max_response_bytes:2097152,
  ...(effort!==undefined?{reasoning_effort:effort}:{}),
  ...(profile?{profile_id:profile.id,profile_version:profile.version,response_style:profile.response_style}:{})};
 assertSafe(config);return Object.freeze(config);
}
