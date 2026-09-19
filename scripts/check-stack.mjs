import {readdir,readFile} from 'node:fs/promises';
import {spawnSync,execFileSync} from 'node:child_process';
async function walk(dir){const out=[];for(const e of await readdir(dir,{withFileTypes:true})){const p=dir+'/'+e.name;if(e.isDirectory())out.push(...await walk(p));else if(/\.(mjs|js)$/.test(p))out.push(p)}return out}
const files=(await Promise.all(['src','public','test','scripts'].map(walk))).flat();
for(const file of files){const r=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});if(r.status){console.error(r.stderr);process.exit(1)}}
console.log('Syntax/build (native JavaScript): '+files.length+' modules PASS');
const tracked=execFileSync('git',['ls-files','-z'],{encoding:'utf8'}).split('\0').filter(Boolean);
const candidates=[...new Set([...tracked,...files])];
const patterns=[/gh[pousr]_[A-Za-z0-9]{30,}/,/github_pat_[A-Za-z0-9_]{30,}/,/sk-(?:proj-)?[A-Za-z0-9_-]{30,}/,/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/];
let issues=0;
for(const file of candidates){if(file.startsWith('legacy/')||file.includes('node_modules'))continue;const s=await readFile(file,'utf8');if(patterns.some(p=>p.test(s))){issues++;console.error('Secret pattern detected in '+file)}}
if(issues)process.exit(1);
console.log('Secret scan PASS: known token/private-key patterns; no payloads printed. Local development DB placeholders allowed.');
