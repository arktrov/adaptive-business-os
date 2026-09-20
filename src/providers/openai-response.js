import {assertSafe,validateResearch} from '../domain/research.js';
import {researchOutputSchema} from './openai-research-schema.js';
export const safeId=x=>typeof x==='string'&&/^[A-Za-z0-9_-]{1,160}$/.test(x)?x:null;
const count=x=>Number.isSafeInteger(x)&&x>=0?x:null;
const object=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const choice=(x,list)=>list.includes(x)?x:null;
export const sourceUrl=x=>{try{const u=new URL(x);return ['http:','https:'].includes(u.protocol)&&!u.username&&!u.password?u.href:null}catch{return null}};
export function webSearchFacts(items){
 const searches=items.filter(x=>x?.type==='web_search_call');
 const byStatus={completed:0,incomplete:0,in_progress:0,searching:0,failed:0,cancelled:0,unknown:0,other:0};
 const toolCalls=searches.map(x=>{const status=x.status==null?'unknown':Object.hasOwn(byStatus,x.status)?x.status:'other';byStatus[status]++;return {id:safeId(x.id),status};});
 return {observed_web_search_calls:searches.length,completed_web_search_calls:byStatus.completed,incomplete_web_search_calls:byStatus.incomplete,web_search_count_by_status:byStatus,web_search_items:toolCalls};
}
export function responseFacts(data,model){
 const responseModel=typeof data?.model==='string'&&/^[A-Za-z0-9_.-]{1,100}$/.test(data.model)?data.model:null;
 const items=Array.isArray(data?.output)?data.output:[];
 const searches=items.filter(x=>x?.type==='web_search_call');
 const messages=items.filter(x=>x?.type==='message'&&x.role==='assistant');
 const content=messages.flatMap(x=>Array.isArray(x.content)?x.content:[]);
 const explicitFinal=messages.filter(x=>x.phase==='final_answer');
 const selected=explicitFinal.length===1?explicitFinal[0]:explicitFinal.length===0?messages.filter(x=>x.phase==null).at(-1):null;
 const finalContent=Array.isArray(selected?.content)?selected.content:[];
 return {...webSearchFacts(items),response_model:responseModel,response_id:safeId(data?.id),response_status:choice(data?.status,['completed','incomplete','failed','in_progress','queued','cancelled']),
  output_item_types:items.slice(0,128).map(x=>choice(x?.type,['message','web_search_call','reasoning','function_call','file_search_call','code_interpreter_call','image_generation_call'])??'other'),
  final_text_present:finalContent.some(x=>x?.type==='output_text'&&typeof x.text==='string'&&x.text.length>0),
  refusal:content.some(x=>x?.type==='refusal'),error_present:!!data?.error,
  provider_error_code:choice(data?.error?.code,['server_error','rate_limit_exceeded','insufficient_quota','invalid_api_key','model_not_found','invalid_request_error']),
  incomplete_reason:choice(data?.incomplete_details?.reason,['max_output_tokens','content_filter']),
  usage:{provider:'openai',model:responseModel??model,response_id:safeId(data?.id),input_tokens:count(data?.usage?.input_tokens),output_tokens:count(data?.usage?.output_tokens),total_tokens:count(data?.usage?.total_tokens),cached_input_tokens:count(data?.usage?.input_tokens_details?.cached_tokens),reasoning_tokens:count(data?.usage?.output_tokens_details?.reasoning_tokens),tool_usage:{web_search_calls:searches.length}}
 };
}
// Validate precisely the bounded JSON-schema subset used by our request, not a
// permissive replacement for the canonical domain validator. Paths never copy values.
export function schemaIssue(value,schema=researchOutputSchema,path='$'){
 const types=Array.isArray(schema.type)?schema.type:[schema.type];
 const actual=value===null?'null':Array.isArray(value)?'array':typeof value;
 if(!types.includes(actual))return {path,rule:'type'};
 if(schema.enum&&!schema.enum.includes(value))return {path,rule:'enum'};
 if(actual==='number'&&(!Number.isFinite(value)||(schema.minimum!==undefined&&value<schema.minimum)||(schema.maximum!==undefined&&value>schema.maximum)))return {path,rule:'range'};
 if(actual==='object'){
  for(const key of schema.required??[])if(!Object.hasOwn(value,key))return {path:path+'.'+key,rule:'required'};
  if(schema.additionalProperties===false&&Object.keys(value).some(key=>!Object.hasOwn(schema.properties,key)))return {path,rule:'additionalProperties'};
  for(const [key,sub] of Object.entries(schema.properties??{})){const issue=schemaIssue(value[key],sub,path+'.'+key);if(issue)return issue;}
 }
 if(actual==='array')for(let i=0;i<value.length;i++){const issue=schemaIssue(value[i],schema.items,path+'['+i+']');if(issue)return issue;}
 return null;
}
export function normalizeResponse(data,config,diag,fail){
 diag.parser_stage='B_COMPLETION_STATUS';
 if(!object(data))fail('OPENAI_INVALID_RESPONSE');
 if(data.status!=='completed'||data.error||data.incomplete_details)fail('OPENAI_INCOMPLETE_RESPONSE');
 if(typeof data.model!=='string'||(data.model!==config.model&&!data.model.startsWith(config.model+'-')))fail('OPENAI_MODEL_MISMATCH');
 if(!safeId(data.id)||!Array.isArray(data.output)||data.output.some(x=>!object(x)))fail('OPENAI_INVALID_RESPONSE');
 diag.parser_stage='C_WEB_SEARCH';
 const searches=data.output.filter(x=>x.type==='web_search_call');
 // Completed items are the observable processed-call count. Extra unfinished
 // items are diagnostic only; neither nested metadata nor raw item count is a budget.
 Object.assign(diag,webSearchFacts(data.output));diag.tool_budget_limit=config.max_tool_calls;
 const completed=searches.filter(x=>x.status==='completed');
 if(completed.length>config.max_tool_calls)fail('TOOL_BUDGET_EXCEEDED');
 if(!completed.length)fail('OPENAI_WEB_SEARCH_NOT_VERIFIED');
 diag.parser_stage='D_RESPONSE_EXTRACTION';
 const messages=data.output.filter(x=>x.type==='message'&&x.role==='assistant');
 const final=messages.filter(x=>x.phase==='final_answer');
 if(final.length>1)fail('OPENAI_AMBIGUOUS_FINAL_OUTPUT');
 // Explicit final phase wins; for models omitting phase use the last unphased
 // assistant message. Tool and commentary text never joins the JSON payload.
 const message=final[0]??messages.filter(x=>x.phase==null).at(-1);
 if(!message||!Array.isArray(message.content)||(message.status!==undefined&&message.status!=='completed'))fail('OPENAI_INVALID_OUTPUT');
 if(message.content.some(x=>x?.type==='refusal'))fail('OPENAI_REFUSAL');
 const texts=message.content.filter(x=>x?.type==='output_text');
 if(!texts.length||texts.some(x=>typeof x.text!=='string')||message.content.some(x=>x?.type!=='output_text'))fail('OPENAI_INVALID_OUTPUT');
 const text=texts.map(x=>x.text).join('');diag.final_text_present=text.length>0;
 if(!text.trim())fail('OPENAI_INVALID_OUTPUT');
 diag.parser_stage='E_STRUCTURED_JSON';
 let output;try{output=JSON.parse(text)}catch{fail('OPENAI_INVALID_RESEARCH_RESULT','SyntaxError')}
 diag.structured_output_present=true;
 diag.parser_stage='F_SCHEMA_VALIDATION';diag.validation_stage='json_schema';
 const issue=schemaIssue(output);if(issue){diag.validation_path=issue.path;diag.validation_rule=issue.rule;fail('OPENAI_INVALID_RESEARCH_RESULT');}
 diag.parser_stage='G_CANONICAL_NORMALIZATION';diag.validation_stage='safe_canonical_data';
 try{assertSafe(output)}catch{fail('UNSAFE_PROVIDER_RESPONSE');}
 diag.parser_stage='H_CLAIM_EVIDENCE_VALIDATION';diag.validation_stage='domain';
 const claimIds=output.claims.map(x=>x.claim_id),sourceIds=output.sources.map(x=>x.source_id);
 for(let i=0;i<output.evidence.length;i++)for(const [field,ids] of [['claim_id',claimIds],['source_id',sourceIds]])if(!ids.includes(output.evidence[i][field])){diag.validation_path='$.evidence['+i+'].'+field;diag.validation_rule='reference';fail('OPENAI_INVALID_RESEARCH_RESULT');}
 try{validateResearch(output)}catch{diag.validation_path='$';diag.validation_rule='domain_contract';fail('OPENAI_INVALID_RESEARCH_RESULT');}
 diag.validation_stage='source_provenance';
 const consulted=new Set();
 for(const s of completed){if(Array.isArray(s.action?.sources))for(const v of s.action.sources){const u=sourceUrl(v?.url);if(u)consulted.add(u);}const u=sourceUrl(s.action?.url);if(u)consulted.add(u);}
 for(const t of texts)if(Array.isArray(t.annotations))for(const a of t.annotations)if(a?.type==='url_citation'&&sourceUrl(a.url))consulted.add(sourceUrl(a.url));
 for(let i=0;i<output.sources.length;i++)if(!consulted.has(sourceUrl(output.sources[i].url))){diag.validation_path='$.sources['+i+'].url';diag.validation_rule='consulted_source';fail('OPENAI_UNTRACED_SOURCE');}
 diag.parser_stage='COMPLETE';diag.validation_stage='complete';
 return {output,consulted:[...consulted]};
}
