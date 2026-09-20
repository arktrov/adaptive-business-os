// Explicit local operator entry point; no retry, no other pipeline stage.
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {PostgresStore} from '../src/persistence-postgres.js';
import {ScriptRepository} from '../src/script-postgres.js';
import {ScriptService} from '../src/application/script-service.js';
import {OpenAIScriptProvider} from '../src/providers/openai-script.js';
import {arktrovScriptConfiguration,openaiScriptConfig} from '../src/config/script-production.js';
import {hash,assertSafe} from '../src/domain/research.js';
import {scriptCodeHash} from './script-code-hash.mjs';
const permitFile=process.argv[2];if(!permitFile)throw Error('SCRIPT_PERMIT_REQUIRED');
let store;
try{
 if(!process.env.OPENAI_API_KEY)throw Error('OPENAI_CREDENTIAL_MISSING');if(!process.env.DATABASE_URL)throw Error('DATABASE_URL_REQUIRED');
 const permit=JSON.parse(await readFile(permitFile,'utf8'));assertSafe(permit);
 if(permit.max_calls!==1||permit.operation!=='script-production'||permit.profile!=='arktrov-script-v005/1'||permit.code_hash!==await scriptCodeHash())throw Error('SCRIPT_PERMIT_MISMATCH');
 for(const check of permit.acceptance){const bytes=await readFile(check.path);if(createHash('sha256').update(bytes).digest('hex')!==check.sha256)throw Error('ACCEPTANCE_EVIDENCE_CHANGED')}
 store=new PostgresStore(process.env.DATABASE_URL);const repository=new ScriptRepository(store);
 const provider=new OpenAIScriptProvider({config:openaiScriptConfig,permit});
 const service=new ScriptService({repository,provider,configuration:arktrovScriptConfiguration});
 const input=await service.prepare(permit.command);if(hash(input)!==permit.input_hash||input.scope.content_scope_hash!==permit.scope_hash||input.publication_hold!==true||input.language!=='en'||input.profiles.SHORT.min_seconds!==45||input.profiles.SHORT.max_seconds!==60)throw Error('SCRIPT_INPUT_CHANGED');
 const before=await store.getJob(permit.content_job_id,permit.business_id);
 if(before.job.current_state!=='FACT_GUARD_PASSED'||before.scriptExecutions.length)throw Error('SINGLE_SCRIPT_EXECUTION_ALREADY_ADMITTED');
 const history=hash(JSON.parse(JSON.stringify({research:before.research,factGuard:before.factGuard,recoveredResearch:before.recoveredResearch,evidence:before.evidence})));
 if(history!==permit.history_hash)throw Error('HISTORICAL_INPUT_CHANGED');
 const result=await service.run(permit.command),after=await store.getJob(permit.content_job_id,permit.business_id);
 if(history!==hash(JSON.parse(JSON.stringify({research:after.research,factGuard:after.factGuard,recoveredResearch:after.recoveredResearch,evidence:after.evidence}))))throw Error('HISTORICAL_INPUT_CHANGED');
 const receipt={execution_id:result.execution.id,execution_revision:result.execution.revision,provider_calls:provider.diagnostics().external_calls,metadata:provider.diagnostics(),state:result.state,validation:result.execution.validation,script_ids:result.scripts.map(s=>s.script_id),production_package_ids:result.packages.map(p=>p.production_package_id),publication_hold:true,history_unchanged:true,input_hash:hash(input),code_hash:permit.code_hash};assertSafe(receipt);
 await writeFile('.local/v005-script-result.json',JSON.stringify(receipt,null,2)+'\n');
 console.log(JSON.stringify(receipt,null,2));
 if(result.execution.status!=='SUCCEEDED')process.exitCode=1;
}catch(e){const code=/^[A-Z][A-Z0-9_]{2,80}$/.test(e.message)?e.message:'SCRIPT_RUN_FAILED';console.error(code);process.exitCode=1}
finally{await store?.close()}
