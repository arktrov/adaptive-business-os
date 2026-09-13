import {readFileSync, readdirSync, existsSync} from 'node:fs';
import {resolve, dirname, relative, isAbsolute, basename} from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
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
// Original exports are intentionally ignored and optional on a clean clone.
const declared = new Set(['IMPORT_STATUS.json','README.md','reviewed']);
const ids = new Set();
let present = 0;
let moduleTotal = 0;
const flatten = flow => (flow || []).flatMap(m => [m, ...(m.routes || []).flatMap(r => flatten(r.flow)), ...flatten(m.onerror)]);
for (const scenario of manifest.scenarios) {
  assert.ok(!ids.has(scenario.id), 'Duplicate scenario ID');
  ids.add(scenario.id);
  assert.equal(basename(scenario.file), scenario.file, 'Raw filename must not contain a path');
  assert.ok(scenario.file.endsWith('.json') && !declared.has(scenario.file), 'Invalid or duplicate raw filename');
  declared.add(scenario.file);
  assert.match(scenario.sha256, /^[a-f0-9]{64}$/);
  assert.ok(Number.isSafeInteger(scenario.bytes) && scenario.bytes > 0, 'Invalid byte count');
  assert.equal(scenario.moduleCount, scenario.moduleIds.length);
  assert.equal(new Set(scenario.moduleIds).size, scenario.moduleCount, 'Duplicate module ID');
  moduleTotal += scenario.moduleCount;
  const audit = resolve(root, scenario.auditDocument);
  assert.ok(!relative(root,audit).startsWith('..') && existsSync(audit), 'Missing scenario audit');
  const raw = resolve(intake, scenario.file);
  if (!existsSync(raw)) continue;
  const bytes = readFileSync(raw);
  assert.equal(bytes.length, scenario.bytes, scenario.file + ': changed size');
  assert.equal(createHash('sha256').update(bytes).digest('hex'), scenario.sha256, scenario.file + ': changed hash');
  const blueprint = JSON.parse(bytes.toString('utf8'));
  assert.equal(blueprint.name, scenario.name);
  assert.deepEqual(flatten(blueprint.flow).map(m => m.id), scenario.moduleIds, scenario.file + ': changed modules');
  if (existsSync(resolve(root,'.git'))) {
    execFileSync('git',['check-ignore','--quiet','--',relative(root,raw)],{cwd:root,stdio:'pipe'});
    assert.equal(execFileSync('git',['ls-files','--',relative(root,raw)],{cwd:root,encoding:'utf8'}).trim(),'', 'Raw blueprint is tracked');
  }
  present++;
}
assert.ok(readdirSync(intake).every(name => declared.has(name)), 'Undeclared intake file');
if (manifest.totalModules !== undefined) assert.equal(manifest.totalModules,moduleTotal);
if (manifest.completeSetConfirmed) {
  assert.ok(manifest.receivedCount > 0 && manifest.completeSetConfirmation?.statement, 'Missing completeness evidence');
}
assert.equal(manifest.migrationAuthorized, false, 'This checker belongs to the documentation-only foundation');
console.log('Blueprint verification: ' + present + '/' + manifest.receivedCount + ' local originals present; ' + moduleTotal + ' declared modules.');
assert.deepEqual(readdirSync(resolve(intake,'reviewed')),['README.md']);
console.log('Foundation check passed: '+required.length+' required docs, relative links and intake manifest; '+files.length+' files.');
