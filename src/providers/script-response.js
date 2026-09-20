import {recoverableResponse} from './openai-recovery.js';
import {hash,assertSafe} from '../domain/research.js';
import {validateScriptProposal,scriptProcessingVersion} from '../domain/script-production.js';
export function captureScriptResponse(data,context){const a=recoverableResponse(data,context);a.payload.format='script-provider-response/1';a.payload.processing={adapter_version:'script-responses/1.0',parser_version:'script-json/1.0',validator_version:scriptProcessingVersion,capture_version:'sanitized-response/1.0'};return {payload:a.payload,content_hash:hash(a.payload)}}
export function parseScriptResponse(artifact){
 if(!artifact?.payload||hash(artifact.payload)!==artifact.content_hash)throw Error('RESPONSE_ARTIFACT_HASH_MISMATCH');assertSafe(artifact.payload);
 const p=artifact.payload;if(p.format!=='script-provider-response/1'||p.redacted)throw Error('UNRECOVERABLE_RESPONSE');
 const response=p.response;if(response?.status!=='completed')throw Error('RESPONSE_NOT_COMPLETED');
 const messages=response.output?.filter(x=>x?.type==='message'&&x.role==='assistant'&&(x.phase==null||x.phase==='final_answer'))??[];
 if(messages.some(m=>m.content?.some(c=>c.type==='refusal')))throw Error('RESPONSE_REFUSED');
 const text=messages.at(-1)?.content?.filter(c=>c.type==='output_text').map(c=>c.text).join('');
 if(!text)throw Error('FINAL_OUTPUT_MISSING');
 try{return JSON.parse(text)}catch{throw Error('SCRIPT_PARSING_FAILURE')}
}
export function reprocessScriptResponse(artifact,input){
 try{if(artifact.payload.request_hash!==hash(input))throw Error('RESPONSE_INPUT_MISMATCH');const output=parseScriptResponse(artifact),validation=validateScriptProposal(input,output);return {success:true,output,validation,external_calls:0,history_mutated:false}}
 catch(e){return {success:false,error:/^[A-Z_]+$/.test(e.message)?e.message:'REPROCESS_FAILED',external_calls:0,history_mutated:false}}
}
