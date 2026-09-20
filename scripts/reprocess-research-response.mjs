import {PostgresStore} from '../src/persistence-postgres.js';
import {ResearchRepository} from '../src/research-postgres.js';
import {reprocessStoredResponse} from '../src/providers/openai-recovery.js';
const [business_id,content_job_id,run_id]=process.argv.slice(2);
if(!business_id||!content_job_id||!run_id||!process.env.DATABASE_URL){console.error('Usage: DATABASE_URL configured; node scripts/reprocess-research-response.mjs BUSINESS JOB RUN');process.exit(1)}
const store=new PostgresStore(process.env.DATABASE_URL);
try{const r=await reprocessStoredResponse(new ResearchRepository(store),{business_id,content_job_id,run_id});console.log(JSON.stringify({success:r.success,error:r.error??null,output_hash:r.output_hash??null,diagnostics:r.diagnostics,external_calls:0,historical_writes:0}));process.exitCode=r.success?0:1}catch{console.error('OFFLINE_REPROCESSING_NOT_VERIFIED');process.exitCode=1}finally{await store.close()}
