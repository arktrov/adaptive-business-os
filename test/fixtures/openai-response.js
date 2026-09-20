import {LocalResearchProvider} from '../../src/providers/local.js';
import {OpenAIResearchProvider} from '../../src/providers/openai-research.js';
import {researchPrompt,genericPolicy} from '../../src/config/research.js';
import {hash} from '../../src/domain/research.js';
export const sentinel='offline-diagnostic-fixture-credential';
// Fabricated contract data only. Never a reconstruction of V005's lost response.
export async function responseFixture(){
 const output=(await new LocalResearchProvider().execute({input:{topic:'Offline diagnostics fixture'}},{attempt:1,run_id:'fixture'})).output;
 return {output,envelope:{id:'resp_diagnostic_fixture',object:'response',model:'gpt-5.6-sol',status:'completed',error:null,incomplete_details:null,usage:{input_tokens:1234,output_tokens:567,total_tokens:1801,input_tokens_details:{cached_tokens:100},output_tokens_details:{reasoning_tokens:200}},output:[
  {id:'rs_fixture',type:'reasoning',summary:[{text:'PRIVATE_REASONING_FIXTURE'}]},
  {id:'msg_comment',type:'message',role:'assistant',phase:'commentary',status:'completed',content:[{type:'output_text',text:'I will examine the sources.',annotations:[]}]},
  {id:'ws_fixture',type:'web_search_call',status:'completed',action:{type:'search',queries:['offline fixture'],sources:output.sources.map(s=>({type:'url',url:s.url}))}},
  {id:'msg_final',type:'message',role:'assistant',phase:'final_answer',status:'completed',content:[{type:'output_text',text:JSON.stringify(output),annotations:output.sources.map(s=>({type:'url_citation',url:s.url,title:s.title,start_index:0,end_index:1}))}]}
 ]}};
}
export async function adapterFixture(mutate=()=>{},options={}){
 const {output,envelope}=await responseFixture();mutate(envelope,output);let calls=0;
 const provider=new OpenAIResearchProvider({credential:()=>sentinel,transport:async()=>{calls++;return new Response(JSON.stringify(envelope),{headers:{'x-request-id':'req_diagnostic_fixture'}})},authorizeDispatch:async(request,context)=>({run_id:context.run_id,business_id:request.business_id,content_job_id:request.content_job_id,idempotency_key:'offline-diagnostic',canonical_input_hash:hash(request),prompt_version:request.prompt.version,workflow_version:request.workflow_version,policy_version:request.policy.version,provider_config_hash:hash(request.provider)}),...options});
 const request={business_id:'offline',content_job_id:'offline-job',operation:'research',input:{topic:'Offline fixture'},workflow_version:'phase-2a.1',prompt:researchPrompt,policy:genericPolicy,provider:provider.describe()};
 return {provider,request,output,envelope,context:{persistProviderResponse:async a=>({evidence_id:'offline-artifact',content_hash:a.content_hash}),attempt:1,run_id:'offline-diagnostic'},calls:()=>calls};
}
