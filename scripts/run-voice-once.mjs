import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {PostgresStore} from '../src/persistence-postgres.js';
import {ScriptRepository} from '../src/script-postgres.js';
import {AssetRepository} from '../src/assets-postgres.js';
import {ElevenLabsVoiceProvider} from '../src/providers/elevenlabs-voice.js';
import {prepareVoiceOnce,executeVoiceOnce} from '../src/application/voice-once.js';
import {scriptCodeHash} from './script-code-hash.mjs';
import {assertSafe} from '../src/domain/research.js';
let store,provider;const permitFile=process.argv[2];
try {
 if(!process.env.ELEVENLABS_API_KEY)throw Error('ELEVENLABS_CREDENTIAL_NOT_AVAILABLE');
 if(!permitFile||!process.env.DATABASE_URL)throw Error('VOICE_LOCAL_CONFIGURATION_MISSING');
 const permit=JSON.parse(await readFile(permitFile,'utf8'));assertSafe(permit);
 if(permit.code_hash!==await scriptCodeHash())throw Error('VOICE_TESTED_CODE_CHANGED');
 for(const evidence of permit.acceptance){if(createHash('sha256').update(await readFile(evidence.path)).digest('hex')!==evidence.sha256)throw Error('VOICE_ACCEPTANCE_CHANGED')}
 store=new PostgresStore(process.env.DATABASE_URL);const repository=new AssetRepository(new ScriptRepository(store));const {profile}=await prepareVoiceOnce(repository,permit);
 provider=new ElevenLabsVoiceProvider({profile,requestHash:permit.request_hash});
 const result=await executeVoiceOnce(repository,permit,{provider,directory:path.join(path.dirname(permitFile),'voice-recovery')});
 await writeFile(path.join(path.dirname(permitFile),'v005-voice-result.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
} catch(e){const code=/^[A-Z][A-Z0-9_]{2,100}$/.test(e.message)?e.message:(e.code==='EEXIST'?'VOICE_ONCE_ALREADY_CONSUMED':'VOICE_RUN_FAILED');const result={error:code,provider_calls:provider?.diagnostics().external_calls??0,request_id:provider?.diagnostics().request_id??null,no_retry:true,publication_hold:true,release_allowed:false};
 if(permitFile){try{await writeFile(path.join(path.dirname(permitFile),'v005-voice-error-'+Date.now()+'.json'),JSON.stringify(result,null,2))}catch{}}console.error(JSON.stringify(result));process.exitCode=1;
} finally {await store?.close()}
