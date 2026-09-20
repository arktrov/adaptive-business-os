import {assertSafe,hash} from '../domain/research.js';
import {normalizeResponse,responseFacts,safeId} from './openai-response.js';
export const processingVersions=Object.freeze({adapter_processing_version:'responses-research-processing/1.2',parser_revision:'responses-parser/2.3',normalizer_version:'evidence-preserving/1.1',domain_validator_version:'research-contract/1.1',validator_version:'completed-tool-budget/1.0',capture_version:'sanitized-response/1.0'});
// Allowlist the response envelope. Never retain reasoning content or headers.
export function recoverableResponse(data,{request_id,config,request_hash,run_id,credential,received_at=new Date().toISOString()}){
 let redacted=false;
 const clean=x=>{
  if(typeof x==='string'){if(credential&&x.includes(credential)){redacted=true;return '[REDACTED]'}try{assertSafe(x);return x}catch{redacted=true;return '[REDACTED]'}}
  if(Array.isArray(x))return x.map(clean);
  if(x&&typeof x==='object'){const result={};for(const [k,v] of Object.entries(x)){if(/^(?:api[_-]?key|authorization|password|secret|access[_-]?token|chain_of_thought|reasoning_trace|reasoning|encrypted_content|internal_reasoning|analysis)$/i.test(k)){redacted=true;continue}result[k]=clean(v)}return result}
  return x??null;
 };
 const text=t=>{try{return JSON.stringify(clean(JSON.parse(t)))}catch{if(typeof t==='string'&&/"(?:api[_-]?key|authorization|password|secret|access[_-]?token|chain_of_thought|reasoning_trace|encrypted_content|internal_reasoning)"\s*:/i.test(t)){redacted=true;return '[REDACTED]'}return clean(t)}};
 const items=Array.isArray(data?.output)?data.output:[];
 const finals=items.filter(x=>x?.type==='message'&&x.role==='assistant'&&x.phase==='final_answer');
 const retainedMessages=new Set(finals.length?finals:items.filter(x=>x?.type==='message'&&x.role==='assistant'&&x.phase==null).slice(-1));
 const output=items.map(x=>{
  if(!x||typeof x!=='object')return null;
  if(x.type==='reasoning')return {type:'reasoning',id:safeId(x.id)};
  if(x.type==='web_search_call')return {type:x.type,id:safeId(x.id),status:x.status??null,action:{type:x.action?.type??null,url:x.action?.url??null,sources:Array.isArray(x.action?.sources)?x.action.sources.map(s=>({url:s?.url??null})):[]}};
  if(x.type==='message'){let firstText=true;const joined=Array.isArray(x.content)?x.content.filter(c=>c?.type==='output_text').map(c=>typeof c.text==='string'?c.text:'').join(''):'';return {type:x.type,id:safeId(x.id),role:x.role??null,...(x.phase!==undefined?{phase:x.phase}:{}),...(x.status!==undefined?{status:x.status}:{}),content:Array.isArray(x.content)?x.content.map(c=>c?.type==='output_text'?{type:c.type,text:!retainedMessages.has(x)?'':firstText?(firstText=false,text(joined)):'',annotations:Array.isArray(c.annotations)?c.annotations.map(a=>({type:a?.type??null,url:a?.url??null})):[]}:c?.type==='refusal'?{type:'refusal'}:{type:'unsupported'}):null};}
  return {type:typeof x.type==='string'?x.type:'unknown',id:safeId(x.id)};
 });
 const facts=responseFacts(data,config.model);
 const response=data&&typeof data==='object'&&!Array.isArray(data)?{id:data.id??null,model:data.model??null,status:data.status??null,error:data.error?{code:facts.provider_error_code??'unknown'}:null,incomplete_details:data.incomplete_details?{reason:facts.incomplete_reason??'unknown'}:null,output,...(data.usage?{usage:{input_tokens:facts.usage.input_tokens,output_tokens:facts.usage.output_tokens,total_tokens:facts.usage.total_tokens,input_tokens_details:{cached_tokens:facts.usage.cached_input_tokens},output_tokens_details:{reasoning_tokens:facts.usage.reasoning_tokens}}}:{})}:null;
 const payload=clean({format:'openai-research-response/1',run_id,request_hash,request_id:safeId(request_id),received_at,config,processing:processingVersions,response,tool_usage:facts.usage.tool_usage,output_item_types:facts.output_item_types});
 payload.redacted=redacted;assertSafe(payload);return {payload,content_hash:hash(payload)};
}
// Pure offline evaluation: no transport, credentials, state writes or provider instance.
export function reprocessResponseArtifact(artifact){
 if(!artifact?.payload||hash(artifact.payload)!==artifact.content_hash)throw Error('RESPONSE_ARTIFACT_HASH_MISMATCH');
 assertSafe(artifact.payload);const p=artifact.payload;
 if(p.format!=='openai-research-response/1')throw Error('UNSUPPORTED_RESPONSE_ARTIFACT');
 const diag={...processingVersions};
 if(p.redacted)return {success:false,error:'SANITIZED_RESPONSE_REDACTED',diagnostics:diag};
 Object.assign(diag,responseFacts(p.response,p.config.model));delete diag.usage;
 try{const result=normalizeResponse(p.response,p.config,diag,code=>{throw Error(code)});return {success:true,output:result.output,output_hash:hash(result.output),diagnostics:diag}}
 catch(e){return {success:false,error:/^[A-Z_]+$/.test(e.message)?e.message:'REPROCESSING_FAILED',diagnostics:diag}}
}
export async function reprocessStoredResponse(repository,{business_id,content_job_id,run_id}){return reprocessResponseArtifact(await repository.loadProviderResponse(business_id,content_job_id,run_id))}
