import {ResearchRepository} from '../research-postgres.js';
import {ResearchService} from '../application/research-service.js';
import {LocalResearchProvider,LocalFactGuardProvider} from '../providers/local.js';
import {researchPrompt,factGuardPrompt,genericPolicy,arktrovPolicy} from '../config/research.js';
import http from 'node:http';
import {fileURLToPath} from 'node:url';
import {readFile,writeFile,mkdir,rename} from 'node:fs/promises';
import {Store} from '../domain/core.js';
import {PostgresStore} from '../persistence-postgres.js';

const businessId=process.env.BUSINESS_ID||'arktrov'; // local operator context; never trust a browser-supplied tenant.
const usePg=Boolean(process.env.DATABASE_URL);
const file=new URL('../../data/control-plane.json',import.meta.url);
let store;
if(usePg)store=new PostgresStore(process.env.DATABASE_URL);
else {
 let seed={};try{seed=JSON.parse(await readFile(file,'utf8'))}catch(e){if(e.code!=='ENOENT')throw e}
 store=new Store(seed);
}
const seed={id:'arktrov',tenant_id:'arktrov',name:'ARKTROV',brand:{allowed_formats:['SHORT','LONG','BOTH']}};
if(usePg)await store.seed(seed);
else if(!store.business(seed.id))store.createBusiness(seed);
const researchService=usePg?new ResearchService({repository:new ResearchRepository(store),researchProvider:new LocalResearchProvider(process.env.LOCAL_RESEARCH_MODE||'success'),factGuardProvider:new LocalFactGuardProvider(process.env.LOCAL_FACT_GUARD_MODE||'PASS'),prompts:{research:researchPrompt,fact_guard:factGuardPrompt},policy:businessId==='arktrov'?arktrovPolicy:genericPolicy}):null;
async function save(){if(!usePg){await mkdir(new URL('../../data/',import.meta.url),{recursive:true});await writeFile(fileURLToPath(file)+'.tmp',JSON.stringify(store.data));await rename(fileURLToPath(file)+'.tmp',file)}}
async function detail(id){
 if(usePg)return store.getJob(id,businessId);
 const j=store.data.jobs.find(x=>x.id===id&&x.business_id===businessId);if(!j)return null;
 const h=store.data.transitions.filter(x=>x.job_id===id);
 return {job:j,stateHistory:h,transitions:h,evidence:store.data.evidence.filter(x=>x.content_job_id===id&&x.business_id===businessId),artifacts:store.data.artifacts.filter(x=>x.content_job_id===id&&x.business_id===businessId),quality:{technical:null,multimodal:null,finalJudge:null,releaseGate:null},publish:{target:null,status:null,result:null}};
}
async function body(req){let b='';for await(const c of req){b+=c;if(b.length>1048576)throw Error('BODY_TOO_LARGE')}return JSON.parse(b||'{}')}
const send=(res,x,status=200)=>{res.writeHead(status,{'content-type':'application/json'});res.end(JSON.stringify(x))};
const server=http.createServer(async(req,res)=>{
 const started=Date.now();let operation='read';
 try {
 const url=new URL(req.url,'http://localhost');
 if(req.headers.host!==('127.0.0.1:'+server.address().port) && req.headers.host!==('localhost:'+server.address().port))return send(res,{error:'HOST_FORBIDDEN'},403);
 if(req.method==='POST'){
  if(req.headers.origin && !['http://127.0.0.1:'+server.address().port,'http://localhost:'+server.address().port].includes(req.headers.origin))return send(res,{error:'ORIGIN_FORBIDDEN'},403);
  if(!req.headers['content-type']?.startsWith('application/json'))return send(res,{error:'JSON_REQUIRED'},415);
 }
 if(url.pathname.startsWith('/api/')&&req.headers['x-business-id']&&req.headers['x-business-id']!==businessId)return send(res,{error:'TENANT_FORBIDDEN'},403);
 if(req.method==='GET'&&url.pathname==='/api/businesses')return send(res,usePg?await store.businesses(businessId):store.data.businesses.filter(b=>b.id===businessId));
 if(req.method==='GET'&&url.pathname==='/api/jobs')return send(res,usePg?await store.jobs(businessId):store.data.jobs.filter(j=>j.business_id===businessId));
 if(req.method==='POST'&&url.pathname==='/api/jobs'){
  operation='createJob';const i=await body(req);
  if(i.business_id&&i.business_id!==businessId)return send(res,{error:'TENANT_FORBIDDEN'},403);
  if(!['SHORT','LONG','BOTH'].includes(i.format)||!i.idempotency_key)throw Error('INVALID_JOB');
  const j=await store.createJob({...i,business_id:businessId});await save();return send(res,j,201);
 }
 const match=url.pathname.match(/^\/api\/jobs\/([a-f0-9-]+)(?:\/(evidence|artifacts|transitions|research|fact-guard|pipeline))?$/);
 if(match){
  const [,id,kind]=match;const d=await detail(id);if(!d)return send(res,{error:'NOT_FOUND'},404);
  if(req.method==='GET'&&!kind)return send(res,d);
  if(req.method==='GET'&&['research','fact-guard'].includes(kind))return send(res,kind==='research'?(d.research??[]):(d.factGuard??[]));
  if(req.method==='POST'&&kind){
   operation=kind;const i=await body(req);
   if(i.business_id&&i.business_id!==businessId)return send(res,{error:'TENANT_FORBIDDEN'},403);
   if(kind==='evidence'&&['provider_response','confirmed_research_input','human_research_approval','human_fact_guard_decision','policy_snapshot','policy_binding_audit'].includes(i.evidence_type))return send(res,{error:'RESERVED_EVIDENCE_TYPE'},403);
   const input={...i,business_id:businessId,content_job_id:id};
   let result;
   if(['research','fact-guard','pipeline'].includes(kind)){
    if(!researchService)return send(res,{error:'POSTGRES_REQUIRED'},409);
    if(process.env.ENABLE_LOCAL_RESEARCH!=='1')return send(res,{error:'LOCAL_RESEARCH_DISABLED'},403);
    if(!d.job.content_item_id?.startsWith('synthetic:'))return send(res,{error:'SYNTHETIC_JOB_REQUIRED'},409);
    const command={business_id:businessId,content_job_id:id,operation:kind==='research'?'research':'fact_guard',idempotency_key:i.idempotency_key,input:i.input,retry:i.retry===true};
    if(typeof i.idempotency_key!=='string'||!i.idempotency_key.trim())throw Error('INVALID_OPERATION');
    result=kind==='pipeline'?await researchService.runPipeline(command):await researchService.run(command);
   }else if(kind==='transitions'){
    if(process.env.ENABLE_DEV_TRANSITIONS!=='1')return send(res,{error:'TRANSITIONS_DISABLED'},403);
    result=usePg?await store.transition(id,i.expected_state_version,i.to_state,{...i,business_id:businessId}):store.transition(id,d.job.current_state,i.to_state,{...i,business_id:businessId});
   }else if(usePg)result=kind==='evidence'?await store.addEvidence(input):await store.addArtifact(input);
   else {
    result=kind==='evidence'?store.addEvidence({...input,job_id:id,type:i.evidence_type,payload_ref:i.reference}):store.addArtifact({...input,storage_ref:i.storage_reference});
    Object.assign(result,input);
   }
   await save();return send(res,result,201);
  }
  return send(res,{error:'METHOD_NOT_ALLOWED'},405);
 }
 if(req.method==='GET'&&['/','/app.js'].includes(url.pathname)){
  res.writeHead(200,{'content-type':url.pathname==='/app.js'?'text/javascript':'text/html','X-Content-Type-Options':'nosniff'});
  return res.end(await readFile(new URL('../../public/'+(url.pathname==='/'?'index.html':'app.js'),import.meta.url)));
 }
 send(res,{error:'NOT_FOUND'},404);
 }catch(e){send(res,{error:e.code==='23505'?'DUPLICATE_VERSION':e.message},['23505','23514'].includes(e.code)||['STALE_STATE_VERSION','IDEMPOTENCY_CONFLICT','VERSION_CONTENT_CONFLICT','EXPLICIT_RETRY_REQUIRED','INTERRUPTED_RETRY_REQUIRED','OPERATION_IN_PROGRESS'].includes(e.message)?409:400)}
 finally{console.log(JSON.stringify({business_id:businessId,operation,duration:Date.now()-started,status:res.statusCode}))}
});
server.listen(Number(process.env.PORT||3000),'127.0.0.1',()=>console.log(JSON.stringify({event:'ready',adapter:usePg?'postgres':'json',port:server.address().port})));
async function stop(){server.close(async()=>{if(usePg)await store.close();process.exit(0)})}
process.on('SIGTERM',stop);process.on('SIGINT',stop);
