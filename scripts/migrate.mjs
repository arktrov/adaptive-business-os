import pg from 'pg';
import {readdir,readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
export async function migrate(pool) {
 const c=await pool.connect();
 try {
  await c.query('BEGIN');
  await c.query("SELECT pg_advisory_xact_lock(170091)");
  await c.query('CREATE TABLE IF NOT EXISTS schema_migrations(name text PRIMARY KEY)');
  for(const name of (await readdir(new URL('../db/migrations/',import.meta.url))).filter(n=>n.endsWith('.sql')).sort()){
   if((await c.query('SELECT name FROM schema_migrations WHERE name=$1',[name])).rowCount)continue;
   // Existing development databases used manual 001; adopt only the known baseline.
   if(name==='001_control_plane.sql' && (await c.query("SELECT to_regclass('public.content_jobs') AS t")).rows[0].t){
    await c.query('INSERT INTO schema_migrations VALUES($1)',[name]);continue;
   }
   await c.query(await readFile(new URL('../db/migrations/'+name,import.meta.url),'utf8'));
   await c.query('INSERT INTO schema_migrations VALUES($1)',[name]);
  }
  await c.query('COMMIT');
 }catch(e){await c.query('ROLLBACK');throw e}finally{c.release()}
}
if(process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href){
 if(!process.env.DATABASE_URL)throw Error('DATABASE_URL_REQUIRED');
 const pool=new pg.Pool({connectionString:process.env.DATABASE_URL});
 try{await migrate(pool);console.log('Migrations applied')}finally{await pool.end()}
}
