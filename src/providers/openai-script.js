import {hash,assertSafe} from '../domain/research.js';
import {captureScriptResponse,parseScriptResponse} from './script-response.js';
import {visualTypes,visualClasses} from '../domain/script-production.js';
const string={type:'string'};
const object=properties=>({type:'object',properties,required:Object.keys(properties),additionalProperties:false});
export const scriptSchema=object({scripts:{type:'array',items:object({format:{type:'string',enum:['SHORT','LONG']},segments:{type:'array',items:object({segment_id:string,role:{type:'string',enum:['HOOK','BODY','ENDING','CTA']},claim_id:{type:['string','null']},usage_type:{type:'string',enum:['DIRECT','QUALIFIED','CONTEXT_ONLY','NONE']},text:string,visual_type:{type:'string',enum:visualTypes},visual_classification:{type:'string',enum:visualClasses}})}})}});
export class OpenAIScriptProvider {
 #credential;#used=false;#meta={synthetic:false,external_calls:0,provider_request_id:null,usage:null,cost:null};
 constructor({config,permit,credential=process.env.OPENAI_API_KEY,transport=fetch}){this.config=structuredClone(config);this.permit=structuredClone(permit);this.#credential=credential;this.transport=transport;assertSafe(this.config);if(!this.config.model||this.config.tools?.length||!Number.isInteger(this.config.max_output_tokens)||this.config.max_output_tokens<1)throw Error('INVALID_SCRIPT_PROVIDER_CONFIG')}
 describe(){return {...this.config,synthetic:false}}
 preflight(input){if(!this.#credential)throw Error('OPENAI_CREDENTIAL_MISSING');if(this.#used||this.permit?.max_calls!==1||this.permit.input_hash!==hash(input)||this.permit.business_id!==input.business_id||this.permit.content_job_id!==input.content_job_id)throw Error('SINGLE_CALL_NOT_AUTHORIZED')}
 diagnostics(){return structuredClone(this.#meta)}
 async execute(input,context){
  this.preflight(input);if(context.input_hash!==hash(input))throw Error('REQUEST_HASH_MISMATCH');this.#used=true;
  const start=Date.now();this.#meta.external_calls=1;
  let response;try{response=await this.transport('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:'Bearer '+this.#credential,'Content-Type':'application/json'},signal:AbortSignal.timeout(240000),body:JSON.stringify({model:this.config.model,store:false,max_output_tokens:this.config.max_output_tokens,reasoning:{effort:this.config.reasoning_effort},tools:[],input:[{role:'system',content:input.prompt},{role:'user',content:JSON.stringify(input)}],text:{format:{type:'json_schema',name:'scoped_script',strict:true,schema:scriptSchema}}})})}catch{this.#meta.duration_ms=Date.now()-start;throw Error('SCRIPT_PROVIDER_TRANSPORT_FAILURE')}
  this.#meta.http_status=response.status;this.#meta.duration_ms=Date.now()-start;
  const requestId=response.headers.get('x-request-id');this.#meta.provider_request_id=requestId&&!requestId.includes(this.#credential)&&/^[a-zA-Z0-9_-]{1,150}$/.test(requestId)?requestId:null;
  if(!response.ok)throw Error('SCRIPT_PROVIDER_HTTP_FAILURE');
  let data;try{data=await response.json()}catch{throw Error('SCRIPT_PROVIDER_ENVELOPE_INVALID')}
  const artifact=captureScriptResponse(data,{request_id:this.#meta.provider_request_id,config:this.describe(),request_hash:context.input_hash,run_id:context.run_id,credential:this.#credential});
  this.#meta.response_status=artifact.payload.response?.status??null;this.#meta.usage=artifact.payload.response?.usage??null;this.#meta.processing=artifact.payload.processing;
  await context.persistResponse(artifact);
  return {output:parseScriptResponse(artifact),metadata:this.diagnostics()};
 }
}
