import {spawnSync} from 'node:child_process';
import {mkdir,writeFile,readdir,readFile} from 'node:fs/promises';
if(!process.env.TEST_DATABASE_URL)throw Error('TEST_DATABASE_URL_REQUIRED');
await mkdir('.local',{recursive:true});
const files=(await readdir('test')).filter(x=>x.endsWith('.test.js')).map(x=>'test/'+x).sort();
console.log('Actual test files: '+files.join(', '));
for(let run=1;run<=2;run++){
 const r=spawnSync(process.execPath,['--test','--test-concurrency=1','--test-reporter=tap',...files],{encoding:'utf8',env:process.env});
 await writeFile('.local/acceptance-run-'+run+'.tap',r.stdout+r.stderr);
 process.stdout.write(r.stdout);process.stderr.write(r.stderr);
 if(r.status!==0)process.exit(r.status??1);
 const names=[...r.stdout.matchAll(/^ok \d+ - (.+)$/gm)].map(m=>m[1]);
 const required=[...Array.from({length:24},(_,i)=>'R'+String(i+1).padStart(2,'0')+' '),...Array.from({length:25},(_,i)=>'P2A'+String(i+1).padStart(2,'0')+' '),...Array.from({length:36},(_,i)=>'P2B'+String(i+1).padStart(2,'0')+' '),...Array.from({length:40},(_,i)=>'P2C'+String(i+1).padStart(2,'0')+' ')];
 for(const id of required)if(!names.some(n=>n.startsWith(id)))throw Error('MISSING_REQUIREMENT '+id);
 const matrix=await readFile('docs/TEST_MATRIX.md','utf8');
 for(const id of required){const name=names.find(n=>n.startsWith(id));if(!matrix.includes(name))throw Error('MAPPING_MISSING '+name)}
 console.log('RUN '+run+': '+names.length+' test cases PASS; 24/24 Phase 1 + 25/25 Phase 2A + 36/36 Phase 2B + 40/40 Phase 2C requirements mapped to actual runner names.');
}
