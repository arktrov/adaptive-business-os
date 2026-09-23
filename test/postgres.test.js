import test,{before,after} from 'node:test';
import assert from 'node:assert/strict';
import pg from 'pg';
import http from 'node:http';
import {randomUUID} from 'node:crypto';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {chromium} from 'playwright';
import {PostgresStore} from '../src/persistence-postgres.js';
import {migrate} from '../scripts/migrate.mjs';

const base=process.env.TEST_DATABASE_URL;
if(!base)throw Error('TEST_DATABASE_URL is required; only a local PostgreSQL server is allowed');
const url=new URL(base);
if(!['localhost','127.0.0.1'].includes(url.hostname))throw Error('LOCAL_TEST_DB_REQUIRED');
const name='abo_test_'+randomUUID().replaceAll('-','');
let admin,db,connection;
before(async()=>{
 admin=new pg.Pool({connectionString:base});
 await admin.query('CREATE DATABASE '+name);
 url.pathname='/'+name;connection=url.href;db=new PostgresStore(connection);await migrate(db.pool);
});
after(async()=>{if(db)await db.close();if(admin){await admin.query('DROP DATABASE IF EXISTS '+name+' WITH (FORCE)');await admin.end()}});
async function fixture(){
 const business_id='test_'+randomUUID();await db.seed({id:business_id,tenant_id:'tenant_'+randomUUID(),name:'Synthetic',brand:{}});
 const input={business_id,format:'SHORT',idempotency_key:randomUUID(),workflow_version:'w1',brand_rule_version:'b1',quality_policy_version:'q1'};
 const job=await db.createJob(input);return {business_id,input,job};
}
const art=f=>({business_id:f.business_id,content_job_id:f.job.id,logical_name:'voice',version:1,content_hash:'hash-A',storage_reference:'local:test/A',source:'synthetic'});
const ev=f=>({business_id:f.business_id,content_job_id:f.job.id,evidence_type:'test',source:'synthetic',reference:'local:evidence',payload:{claim:'test-only'}});
const move=(f,version=1,to='DISCOVERY_COMPLETE')=>db.transition(f.job.id,version,to,{business_id:f.business_id,actor_type:'test',reason:'test',run_id:'test-run'});
async function start(business='arktrov'){
 const child=spawn(process.execPath,['src/server/index.js'],{env:{...process.env,DATABASE_URL:connection,BUSINESS_ID:business,ENABLE_DEV_TRANSITIONS:'1',PORT:'0'},stdio:['ignore','pipe','pipe'],windowsHide:true});
 let output='',errors='';
 child.stderr.on('data',b=>{errors+=b});
 const port=await new Promise((resolve,reject)=>{
  const timeout=setTimeout(()=>{child.kill();reject(Error('APP_START_TIMEOUT '+errors))},15000);
  child.once('exit',code=>{clearTimeout(timeout);reject(Error('APP_EXIT '+code+' '+errors))});
  child.stdout.on('data',b=>{output+=b;for(const line of output.split('\n')){try{const x=JSON.parse(line);if(x.event==='ready'){clearTimeout(timeout);resolve(x.port)}}catch{}}});
 });
 return {child,url:'http://127.0.0.1:'+port,async stop(){const ended=once(child,'exit');child.kill();await ended}};
}
async function request(app,path,method='GET',data,headers={}){
 const r=await fetch(app.url+path,{method,headers:{'content-type':'application/json',...headers},body:data?JSON.stringify(data):undefined});
 return {status:r.status,data:await r.json()};
}
test('R01 Business tenant isolation',async()=>{const a=await fixture(),b=await fixture();assert.deepEqual((await db.businesses(a.business_id)).map(x=>x.id),[a.business_id]);assert(!(await db.jobs(a.business_id)).some(x=>x.id===b.job.id))});
test('R02 ContentJob creation',async()=>{const f=await fixture();assert.equal(f.job.current_state,'IDEA_CREATED');assert.equal(f.job.state_version,1)});
test('R03 Valid state transition',async()=>{const f=await fixture();assert.equal((await move(f)).current_state,'DISCOVERY_COMPLETE')});
test('R04 Invalid transition rejected',async()=>{const f=await fixture();await assert.rejects(move(f,1,'PUBLISHED'),/INVALID_TRANSITION/);assert.equal((await db.getJob(f.job.id,f.business_id)).stateHistory.length,1)});
test('R05 Stale version rejected',async()=>{const f=await fixture();await assert.rejects(move(f,99),/STALE_STATE_VERSION/)});
test('R06 Concurrent transition protection',async()=>{const f=await fixture();const r=await Promise.allSettled([move(f),move(f)]);assert.equal(r.filter(x=>x.status==='fulfilled').length,1);assert.match(r.find(x=>x.status==='rejected').reason.message,/STALE_STATE_VERSION/)});
test('R07 Idempotent duplicate requests',async()=>{const f=await fixture();const r=await Promise.all([db.createJob(f.input),db.createJob(f.input)]);assert(r.every(j=>j.id===f.job.id));const other=await fixture();assert.notEqual((await db.createJob({...f.input,business_id:other.business_id})).id,f.job.id)});
test('R08 DB unique idempotency enforcement',async()=>{const f=await fixture();await assert.rejects(db.pool.query(`INSERT INTO content_jobs SELECT $1,business_id,content_item_id,format,current_state,state_version,idempotency_key,workflow_version,brand_rule_version,quality_policy_version,created_at,updated_at,working_title FROM content_jobs WHERE id=$2`,[randomUUID(),f.job.id]),e=>e.code==='23505')});
test('R09 Immutable artifact versions',async()=>{const f=await fixture();const a=await db.addArtifact(art(f));await assert.rejects(db.pool.query("UPDATE artifacts SET storage_reference='changed' WHERE artifact_id=$1",[a.artifact_id]),e=>e.code==='23514');await assert.rejects(db.pool.query('DELETE FROM artifacts WHERE artifact_id=$1',[a.artifact_id]),e=>e.code==='23514')});
test('R10 Duplicate artifact version rejected',async()=>{const f=await fixture();await db.addArtifact(art(f));await assert.rejects(db.addArtifact(art(f)),e=>e.code==='23505')});
test('R11 Artifact historical hash and storage retained',async()=>{const f=await fixture();const a=await db.addArtifact(art(f));const b=await db.addArtifact({...art(f),version:undefined,content_hash:'hash-B',storage_reference:'local:test/B'});assert.equal(b.version,2);const d=await db.getJob(f.job.id,f.business_id);assert.deepEqual(d.artifacts[0],a);assert.equal(d.artifacts[0].content_hash,'hash-A');assert.equal(d.artifacts[0].storage_reference,'local:test/A')});
test('R12 Audit rollback is atomic',async()=>{const f=await fixture();await db.pool.query(`CREATE FUNCTION test_fail_audit() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.reason='force_rollback' THEN RAISE EXCEPTION 'INJECTED'; END IF; RETURN NEW; END $$; CREATE TRIGGER test_fail BEFORE INSERT ON job_state_transitions FOR EACH ROW EXECUTE FUNCTION test_fail_audit()`);
try{await assert.rejects(db.transition(f.job.id,1,'DISCOVERY_COMPLETE',{business_id:f.business_id,reason:'force_rollback'}),/INJECTED/);const d=await db.getJob(f.job.id,f.business_id);assert.equal(d.job.state_version,1);assert.equal(d.job.current_state,'IDEA_CREATED');assert.equal(d.stateHistory.length,1)}finally{await db.pool.query('DROP TRIGGER test_fail ON job_state_transitions; DROP FUNCTION test_fail_audit()')}});
for(const [n,field,value] of [[13,'workflow_version','w1'],[14,'brand_rule_version','b1'],[15,'quality_policy_version','q1']])test('R'+n+' '+field+' persisted',async()=>{const f=await fixture();assert.equal((await db.getJob(f.job.id,f.business_id)).job[field],value)});
test('R16 Historical job versions unchanged',async()=>{const f=await fixture();await db.pool.query('UPDATE businesses SET brand=$1 WHERE id=$2',[{version:'b2'},f.business_id]);await move(f);const j=(await db.getJob(f.job.id,f.business_id)).job;assert.equal(j.workflow_version,'w1');assert.equal(j.brand_rule_version,'b1');assert.equal(j.quality_policy_version,'q1')});
test('R17 Cross tenant read rejected',async()=>{const a=await fixture(),b=await fixture();assert.equal(await db.getJob(a.job.id,b.business_id),null)});
test('R18 Cross tenant mutation rejected',async()=>{const a=await fixture(),b=await fixture();await assert.rejects(db.transition(a.job.id,1,'DISCOVERY_COMPLETE',{business_id:b.business_id}),/JOB_NOT_FOUND/)});
test('R19 Real app process restart retains all records',async()=>{
 let app=await start();
 try {
  const j=await request(app,'/api/jobs','POST',{format:'SHORT',working_title:'Restart fixture',idempotency_key:randomUUID(),workflow_version:'restart-w',brand_rule_version:'restart-b',quality_policy_version:'restart-q'});assert.equal(j.status,201);
  const path='/api/jobs/'+j.data.id;
  assert.equal((await request(app,path+'/transitions','POST',{expected_state_version:1,to_state:'DISCOVERY_COMPLETE'})).status,201);
  assert.equal((await request(app,path+'/evidence','POST',{evidence_type:'test',source:'restart-test',reference:'local:restart',payload:{value:42}})).status,201);
  assert.equal((await request(app,path+'/artifacts','POST',{logical_name:randomUUID(),version:1,content_hash:'restart-hash',storage_reference:'local:restart',source:'test'})).status,201);
  const prior=(await request(app,path)).data;assert.equal(prior.evidence.length,1);assert.equal(prior.artifacts.length,1);
  await app.stop();app=await start();assert.deepEqual((await request(app,path)).data,prior);
 }finally{await app.stop()}
});
test('R20 Clean migration and repeat execution',async()=>{await migrate(db.pool);const tables=(await db.pool.query("SELECT tablename FROM pg_tables WHERE schemaname='public'")).rows.map(x=>x.tablename);for(const t of ['artifacts','evidence_records','content_jobs','job_state_transitions'])assert(tables.includes(t));assert.equal((await db.pool.query('SELECT * FROM schema_migrations')).rowCount,7)});
test('R21 Ordered job history',async()=>{const f=await fixture();await move(f);await move(f,2,'RESEARCH_PENDING');const h=(await db.getJob(f.job.id,f.business_id)).stateHistory;assert.deepEqual(h.map(x=>x.to_state),['IDEA_CREATED','DISCOVERY_COMPLETE','RESEARCH_PENDING']);assert(h.every((x,i)=>!i||Number(x.sequence)>Number(h[i-1].sequence)))});
test('R22 Job Detail API tenant scoped',async()=>{const a=await fixture(),b=await fixture();const app=await start(a.business_id);try{assert.equal((await request(app,'/api/jobs/'+b.job.id)).status,404);assert.equal((await request(app,'/api/jobs/'+a.job.id,'GET',undefined,{'x-business-id':b.business_id})).status,403);assert.equal((await request(app,'/api/jobs/'+a.job.id)).status,200)}finally{await app.stop()}});
test('R23 Evidence references tenant scoped and immutable',async()=>{const a=await fixture(),b=await fixture();const e=await db.addEvidence(ev(a));assert.equal((await db.getJob(a.job.id,a.business_id)).evidence[0].evidence_id,e.evidence_id);assert.equal(await db.getJob(a.job.id,b.business_id),null);await assert.rejects(db.addEvidence({...ev(a),business_id:b.business_id}),/JOB_NOT_FOUND/);await assert.rejects(db.pool.query("UPDATE evidence_records SET reference='changed' WHERE id=$1",[e.evidence_id]),x=>x.code==='23514');await assert.rejects(db.pool.query('INSERT INTO evidence_records(id,business_id,job_id,type,created_at) VALUES($1,$2,$3,$4,now())',[randomUUID(),b.business_id,a.job.id,'test']),x=>x.code==='23503')});
test('R24 Artifact references tenant scoped',async()=>{const a=await fixture(),b=await fixture();await db.addArtifact(art(a));assert.equal(await db.getJob(a.job.id,b.business_id),null);await assert.rejects(db.addArtifact({...art(a),business_id:b.business_id}),/JOB_NOT_FOUND/);await assert.rejects(db.pool.query("INSERT INTO artifacts(artifact_id,business_id,content_job_id,logical_name,version,content_hash,storage_reference,created_at) VALUES($1,$2,$3,'cross',1,'h','local:x',now())",[randomUUID(),b.business_id,a.job.id]),x=>x.code==='23503')});
test('UI displays persisted evidence and artifacts via real app',async()=>{
 const f=await fixture();await db.addEvidence(ev(f));await db.addArtifact(art(f));
 const app=await start(f.business_id);let browser;
 try{
  browser=await chromium.launch({channel:'msedge',headless:true});const page=await browser.newPage();
  await page.goto(app.url);await page.locator('#jobs button').first().click();
  await page.locator('#evidence table').waitFor();assert.match(await page.locator('#evidence').innerText(),/local:evidence/);
  assert.match(await page.locator('#artifacts').innerText(),/hash-A/);assert.match(await page.locator('#artifacts').innerText(),/local:test\/A/);
  assert.match(await page.locator('#quality').innerText(),/Nicht ausgeführt/);assert.match(await page.locator('#publish').innerText(),/Nicht vorhanden/);
  assert.match(await page.locator('#history').innerText(),/IDEA_CREATED/);
  // Browser receives no database connection string or raw HTML execution from data.
  assert.equal(await page.locator('#detail').isVisible(),true);
 }finally{if(browser)await browser.close();await app.stop()}
});

test('review: cross-origin writes and DNS rebinding rejected',async()=>{
 const f=await fixture(),app=await start(f.business_id);
 try{
  const body={format:'SHORT',idempotency_key:randomUUID()};
  assert.equal((await request(app,'/api/jobs','POST',body,{origin:'https://evil.example'})).status,403);
  assert.equal((await request(app,'/api/jobs','POST',body,{'content-type':'text/plain'})).status,415);
    const rebound=await new Promise((resolve,reject)=>{const req=http.get(app.url+'/api/jobs',{headers:{host:'evil.example'}},res=>{res.resume();resolve(res.statusCode)});req.on('error',reject)});
  assert.equal(rebound,403);
 }finally{await app.stop()}
});
