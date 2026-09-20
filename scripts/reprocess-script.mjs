import {PostgresStore} from '../src/persistence-postgres.js';
import {ScriptRepository} from '../src/script-postgres.js';
import {reprocessScriptResponse} from '../src/providers/script-response.js';
const [business,job,execution]=process.argv.slice(2);if(!business||!job||!execution||!process.env.DATABASE_URL)throw Error('REPROCESS_ARGUMENTS_REQUIRED');
const store=new PostgresStore(process.env.DATABASE_URL);
try{const row=(await store.pool.query('SELECT input FROM script_executions WHERE business_id=$1 AND content_job_id=$2 AND id=$3',[business,job,execution])).rows[0];if(!row)throw Error('SCRIPT_NOT_FOUND');const artifact=await new ScriptRepository(store).loadResponse(business,job,execution);console.log(JSON.stringify(reprocessScriptResponse(artifact,row.input),null,2))}finally{await store.close()}
