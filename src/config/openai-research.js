import {assertSafe} from '../domain/research.js';
const integer=(value,fallback,min,max)=>{const n=value===undefined?fallback:Number(value);if(!Number.isInteger(n)||n<min||n>max)throw Error('INVALID_OPENAI_CONFIGURATION');return n};
export function openAIResearchConfig(env=process.env){
 const model=env.OPENAI_RESEARCH_MODEL||'gpt-5.6-sol';
 if(!/^[a-z0-9][a-z0-9.-]{0,99}$/.test(model))throw Error('INVALID_OPENAI_MODEL');
 const config={model,max_output_tokens:integer(env.OPENAI_RESEARCH_MAX_OUTPUT_TOKENS,6000,512,8192),max_tool_calls:integer(env.OPENAI_RESEARCH_MAX_TOOL_CALLS,4,1,6),timeout_ms:integer(env.OPENAI_RESEARCH_TIMEOUT_MS,120000,100,180000),max_input_bytes:65536,max_response_bytes:2097152};
 assertSafe(config);return Object.freeze(config);
}
