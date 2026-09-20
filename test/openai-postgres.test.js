import test,{before,after} from 'node:test';
import assert from 'node:assert/strict';
import pg from 'pg';
import {randomUUID} from 'node:crypto';
import {PostgresStore} from '../src/persistence-postgres.js';
import {ResearchRepository} from '../src/research-postgres.js';
import {ResearchService} from '../src/application/research-service.js';
import {OpenAIResearchProvider} from '../src/providers/openai-research.js';
import {LocalResearchProvider,LocalFactGuardProvider} from '../src/providers/local.js';
import {prepareSingleOpenAIResearch} from '../src/application/openai-research-connection.js';
import {researchPrompt,genericPolicy} from '../src/config/research.js';
import {hash,canonical} from '../src/domain/research.js';
import {migrate} from '../scripts/migrate.mjs';
const base=process.env.TEST_DATABASE_URL;if(!base)throw Error('TEST_DATABASE_URL_REQUIRED');const url=new URL(base);if(!['127.0.0.1','localhost'].includes(url.hostname))throw Error('LOCAL_TEST_DB_REQUIRED');
const name='abo_test_'+randomUUID().replaceAll('-','');let admin,db;
before(async()=>{admin=new pg.Pool({connectionString:base});await admin.query('CREATE DATABASE '+name);url.pathname='/'+name;db=new PostgresStore(url.href);await migrate(db.pool)});
after(async()=>{await db?.close();if(admin){await admin.query('DROP DATABASE IF EXISTS '+name+' WITH (FORCE)');await admin.end()}});
async function fixture(){
 const business_id='adapter-test-'+randomUUID();await db.seed({id:business_id,tenant_id:business_id,name:'Offline adapter integration fixture',brand:{}});
 let job=await db.createJob({business_id,format:'SHORT',content_item_id:'offline-adapter-contract',idempotency_key:randomUUID(),workflow_version:'phase-2a.1'});
 const input={topic:'Offline synthetic integration fixture',business_id,content_job_id:job.id,content_format:'SHORT',workflow_version:job.workflow_version,research_policy_snapshot:genericPolicy,research_policy_content_hash:hash(genericPolicy),research_policy_reference:genericPolicy.id,research_policy_version:genericPolicy.version};
 await db.addEvidence({business_id,content_job_id:job.id,evidence_type:'confirmed_research_input',reference:'offline:'+job.id,content_hash:hash(input),payload:{input,canonical_input_hash:hash(input),canonical_input_representation:canonical(input)}});
 for(const to of ['DISCOVERY_COMPLETE','RESEARCH_PENDING'])job=await db.transition(job.id,job.state_version,to,{business_id});
 return {business_id,job,input};
}
test('OAI DB preparation reads persisted input without creating a run',async()=>{const f=await fixture(),before=await db.getJob(f.job.id,f.business_id);const p=await prepareSingleOpenAIResearch({store:db,business_id:f.business_id,content_job_id:f.job.id});assert.equal(p.confirmed_input_hash,hash(f.input));assert.equal(p.canonical_input_hash,hash(p.request));assert.deepEqual(await db.getJob(f.job.id,f.business_id),before)});
test('OAI DB canonical adapter output persists safely and changed input conflicts',async()=>{
 const f=await fixture(),sentinel='offline-integration-credential-sentinel';let calls=0;
 const output=(await new LocalResearchProvider().execute({input:{topic:'Offline fixture'}},{attempt:1,run_id:'fixture'})).output;
 const provider=new OpenAIResearchProvider({credential:()=>sentinel,transport:async()=>{calls++;return new Response(JSON.stringify({id:'resp_fixture',status:'completed',model:'gpt-5.6-sol',output:[{type:'web_search_call',status:'completed',action:{sources:output.sources.map(s=>({url:s.url}))}},{type:'message',role:'assistant',content:[{type:'output_text',text:JSON.stringify(output)}]}]}),{headers:{'x-request-id':'req_fixture'}})},authorizeDispatch:async(request,context)=>{const d=await db.getJob(f.job.id,f.business_id),r=d.research.find(x=>x.run_id===context.run_id);assert.equal(r.status,'RUNNING');return {run_id:r.run_id,idempotency_key:r.idempotency_key,canonical_input_hash:r.canonical_input_hash,business_id:f.business_id,content_job_id:f.job.id,prompt_version:r.prompt_version,policy_version:r.policy_version,workflow_version:r.workflow_version,provider_config_hash:hash(r.request.provider)}}});
 const service=new ResearchService({repository:new ResearchRepository(db),researchProvider:provider,factGuardProvider:new LocalFactGuardProvider(),prompts:{research:researchPrompt},policy:genericPolicy});
 const command={business_id:f.business_id,content_job_id:f.job.id,operation:'research',idempotency_key:'offline-single',input:f.input};
 const r=await service.run(command);assert.equal(r.status,'SUCCEEDED');assert.equal(r.provider,'openai');assert.equal(r.metadata.provider_request_id,'req_fixture');assert.equal(r.metadata.usage.tool_usage.web_search_calls,1);const d=await db.getJob(f.job.id,f.business_id);assert.equal(d.factGuard.length,0);assert(!JSON.stringify(d).includes(sentinel));assert.equal((await service.run(command)).run_id,r.run_id);await assert.rejects(service.run({...command,input:{...f.input,topic:'Changed'}}),/IDEMPOTENCY_CONFLICT/);assert.equal(calls,1);
});
