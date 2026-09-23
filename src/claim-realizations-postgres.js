import {randomUUID} from 'node:crypto';import {hash} from './domain/research.js';import {validateRealization,checkRealizationBinding} from './domain/claim-realization.js';import {scriptStageInput} from './domain/content-scope.js';
export async function loadRealizations(c,b,j){
 const rows=(await c.query("SELECT payload,content_hash FROM evidence_records WHERE business_id=$1 AND job_id=$2 AND type='claim_realization' ORDER BY created_at,id",[b,j])).rows,latest=new Map();
 for(const e of rows){const r=validateRealization(e.payload);if(r.business_id!==b||hash(r)!==e.content_hash)throw Error('REALIZATION_HASH_MISMATCH');const prior=latest.get(r.realization_id);if(!prior||prior.version<r.version)latest.set(r.realization_id,r)}return [...latest.values()].sort((a,b)=>a.realization_id.localeCompare(b.realization_id));
}
export async function appendRealization(repository,j,record){
 validateRealization(record);const b=record.business_id;
 return repository.withJobLock(b,j,()=>repository.store.transaction(async c=>{
  await repository.store.requireJob(c,j,b,true);
  const rows=(await c.query("SELECT payload,content_hash FROM evidence_records WHERE business_id=$1 AND job_id=$2 AND type='claim_realization'",[b,j])).rows.filter(e=>e.payload.realization_id===record.realization_id);
  for(const e of rows){validateRealization(e.payload);if(hash(e.payload)!==e.content_hash)throw Error('REALIZATION_HASH_MISMATCH')}
  const same=rows.find(e=>e.payload.version===record.version);if(same){if(same.payload.content_hash!==record.content_hash)throw Error('IMMUTABLE_REALIZATION_VERSION');return same.payload}
  const prior=rows.sort((a,b)=>b.payload.version-a.payload.version)[0]?.payload;
  if(prior){if(record.version!==prior.version+1||record.previous_content_hash!==prior.content_hash||!((prior.status==='PROPOSED'&&record.status==='APPROVED')||(prior.status==='APPROVED'&&record.status==='RETIRED')))throw Error('REALIZATION_HISTORY_INVALID');
   const strip=r=>{const {content_hash,previous_content_hash,version,status,created_at,approved_at,approved_by,qualifier_semantics_preserved,...base}=r;return base};if(hash(strip(record))!==hash(strip(prior)))throw Error('IMMUTABLE_REALIZATION_TEXT');
  }else if(record.version!==1||record.status!=='PROPOSED')throw Error('REALIZATION_HISTORY_INVALID');
  const fg=(await c.query("SELECT p.request,p.canonical_input_hash,o.* FROM research_outcomes o JOIN research_operations p ON p.id=o.operation_id WHERE o.business_id=$1 AND o.content_job_id=$2 AND p.operation='fact_guard' ORDER BY o.completed_at DESC LIMIT 1",[b,j])).rows[0];
  if(!fg)throw Error('FACT_GUARD_REQUIRED');const scoped=scriptStageInput(fg,b,j);
  checkRealizationBinding(record,{...scoped,business_id:b,language:record.language,realization_style_profile:record.style_profile,production_policy:{context_label:'Limitation:'}});
  await c.query("INSERT INTO evidence_records(id,business_id,job_id,type,source,reference,payload,content_hash,created_at) VALUES($1,$2,$3,'claim_realization','human-realization-review',$4,$5,$6,clock_timestamp())",[randomUUID(),b,j,'claim-realization:'+record.realization_id+':'+record.version,record,hash(record)]);return record;
 }));
}
