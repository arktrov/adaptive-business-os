import {randomUUID} from 'node:crypto';
import {ResearchRepository} from '../../src/research-postgres.js';
import {ResearchService} from '../../src/application/research-service.js';
import {HumanFactGuardReview} from '../../src/application/human-fact-guard-review.js';
import {LocalResearchProvider} from '../../src/providers/local.js';
import {OfflineFactGuardProvider,offlineFactGuardPrompt} from '../../src/providers/offline-fact-guard.js';
import {researchPrompt,genericPolicy} from '../../src/config/research.js';
import {productionConfiguration,defaultProfiles} from '../../src/config/script-production.js';
import {ScriptRepository} from '../../src/script-postgres.js';
import {ScriptService} from '../../src/application/script-service.js';
import {LocalScriptProvider} from '../../src/providers/local-script.js';
import {hash} from '../../src/domain/research.js';
export async function scriptFixture(db,format='SHORT'){
 const b='script-test-'+randomUUID();await db.seed({id:b,tenant_id:b,name:'Synthetic business',brand:{}});
 let j=await db.createJob({business_id:b,format,idempotency_key:'job',content_item_id:'synthetic:script'});for(const to of ['DISCOVERY_COMPLETE','RESEARCH_PENDING'])j=await db.transition(j.id,j.state_version,to,{business_id:b});
 const provider=new LocalResearchProvider(),execute=provider.execute.bind(provider);
 provider.execute=async(...args)=>{const r=await execute(...args);for(const id of ['CONTEXT','BLOCKED']){r.output.claims.push({...r.output.claims[0],claim_id:id,statement:'Synthetic limitation only.',verification_status:'partially_verified'});r.output.evidence.push({...r.output.evidence[0],claim_id:id,support_type:'context'})}return r};
 const repository=new ResearchRepository(db),service=new ResearchService({repository,researchProvider:provider,factGuardProvider:new OfflineFactGuardProvider(),prompts:{research:researchPrompt,fact_guard:offlineFactGuardPrompt},policy:genericPolicy});
 const research=await service.run({business_id:b,content_job_id:j.id,operation:'research',idempotency_key:'research',input:{topic:'Synthetic phase2b fixture'}});
 const cmd={business_id:b,content_job_id:j.id,operation:'fact_guard',idempotency_key:'guard',input:{research_run_id:research.run_id}},first=await service.run(cmd);
 if(first.output?.decision!=='REVIEW_REQUIRED')throw Error('INVALID_FIXTURE_GUARD');
 const snapshot=kind=>{const x={business_id:b,kind,sources:[{path:'synthetic-policy',sha256:hash('synthetic'),content:'Synthetic fixture. Preserve qualifications, provenance, HOLD and rights review.'}]};return {...x,content_hash:hash(x),version:'source-sha256:'+hash(x)}};
 const policies={brand:snapshot('brand'),quality:snapshot('quality'),research:{policy:genericPolicy,source:{path:'synthetic',content_hash:hash(genericPolicy)}}};
 const human=await new HumanFactGuardReview(repository,async()=>policies).record({business_id:b,content_job_id:j.id,fact_guard_run_id:first.run_id,decisions:{CONTEXT:'CONTEXT_ONLY',BLOCKED:'BLOCKED'},publication_hold:true});
 const fg=await service.run({...cmd,idempotency_key:'reviewed',input:{...cmd.input,human_decision_id:human.id}});if(fg.output?.decision!=='PASS')throw Error('INVALID_FIXTURE_SCOPE');
 const profiles=structuredClone(defaultProfiles);for(const p of Object.values(profiles)){p.min_seconds=1;p.max_seconds=600;p.target_seconds=60}
 const configuration=productionConfiguration({objective:'Explain the synthetic observation with appropriate limitations',audience_profile:{audience:'Test'},profiles});
 const command={business_id:b,content_job_id:j.id,fact_guard_run_id:fg.run_id,idempotency_key:'script-1'},scriptRepository=new ScriptRepository(db),scriptProvider=new LocalScriptProvider(),s=new ScriptService({repository:scriptRepository,provider:scriptProvider,configuration});
 return {b,j,command,configuration,repository:scriptRepository,provider:scriptProvider,service:s,fg,policies};
}
export async function proposalFor(f){const input=await f.service.prepare(f.command);let artifact;const r=await new LocalScriptProvider().execute(input,{run_id:'fixture',input_hash:hash(input),persistResponse:async a=>artifact=a});return {input,proposal:r.output,artifact}}
