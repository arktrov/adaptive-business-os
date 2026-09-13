import {readFileSync, readdirSync, existsSync} from 'node:fs';
import {resolve, dirname, relative, isAbsolute} from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const required = ['MASTER_STATE','ARCHITECTURE','DECISIONS','ROADMAP','QUALITY_GATES','LEARNING_SYSTEM','BUSINESS_CORE','MAKE_MIGRATION','SCENARIO_MAP','DATA_MODEL','STATE_MACHINE','EXISTING_SYSTEM','SOURCE_INVENTORY','VALIDATION'];
for (const name of required) assert.ok(readFileSync(resolve(root,'docs',name+'.md'),'utf8').trim().length > 100, name);
const walk = dir => readdirSync(dir,{withFileTypes:true}).flatMap(e => ['.git','.local'].includes(e.name) ? [] : e.isDirectory() ? walk(resolve(dir,e.name)) : [resolve(dir,e.name)]);
const files=walk(root);
for (const file of files.filter(f => f.endsWith('.md'))) {
  const body=readFileSync(file,'utf8').replace(/\x60\x60\x60[\s\S]*?\x60\x60\x60/g,'');
  for (const match of body.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
    const link=match[1].split('#')[0];
    if (!link || /^[a-z]+:/i.test(link)) continue;
    const target=resolve(dirname(file),decodeURIComponent(link));
    const rel=relative(root,target);
    assert.ok(!rel.startsWith('..') && !isAbsolute(rel),'Link escapes repo: '+link);
    assert.ok(existsSync(target),file+': missing '+link);
  }
}
const intake=resolve(root,'legacy/make-blueprints');
const manifest=JSON.parse(readFileSync(resolve(intake,'IMPORT_STATUS.json'),'utf8'));
assert.equal(manifest.schemaVersion,1);
assert.equal(manifest.receivedCount,manifest.scenarios.length);
assert.equal(typeof manifest.completeSetConfirmed,'boolean');
assert.deepEqual(readdirSync(intake).sort(),['IMPORT_STATUS.json','README.md','reviewed'].sort(),'Review raw exports before using the foundation check');
assert.deepEqual(readdirSync(resolve(intake,'reviewed')),['README.md']);
console.log('Foundation check passed: '+required.length+' required docs, relative links and intake manifest; '+files.length+' files.');
