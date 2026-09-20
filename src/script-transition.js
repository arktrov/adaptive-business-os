import {hash} from './domain/research.js';
import {formats,buildDrafts,buildProductionPackage} from './domain/script-production.js';
export async function guardScriptTransition(c,job,to,meta){
 if(!['SCRIPT_PENDING','SCRIPT_RUNNING','SCRIPT_APPROVED','SCRIPT_REVIEW_REQUIRED','PRODUCTION_PACKAGE_READY'].includes(to))return;
 const e=(await c.query('SELECT e.*,o.status,o.metadata,o.validation FROM script_executions e LEFT JOIN script_outcomes o ON o.execution_id=e.id WHERE e.id=$1 AND e.business_id=$2 AND e.content_job_id=$3',[meta.script_execution_id??null,job.business_id,job.id])).rows[0];
 if(!e||hash(e.input)!==e.input_hash)throw Error('PERSISTED_SCRIPT_REQUIRED');
 const latest=(await c.query('SELECT id FROM script_executions WHERE business_id=$1 AND content_job_id=$2 ORDER BY revision DESC LIMIT 1',[job.business_id,job.id])).rows[0];if(latest.id!==e.id)throw Error('STALE_SCRIPT_EXECUTION');
 if(['SCRIPT_PENDING','SCRIPT_RUNNING'].includes(to)){if(e.status)throw Error('PERSISTED_SCRIPT_REQUIRED');return}
 const last=(await c.query('SELECT metadata FROM job_state_transitions WHERE job_id=$1 ORDER BY sequence DESC LIMIT 1',[job.id])).rows[0];if(last?.metadata.script_execution_id!==e.id)throw Error('STALE_SCRIPT_EXECUTION');
 if(to==='SCRIPT_REVIEW_REQUIRED'){if(!['FAILED','REVIEW_REQUIRED'].includes(e.status))throw Error('PERSISTED_SCRIPT_REQUIRED');return}
 if(e.status!=='SUCCEEDED'||e.validation?.status!=='PASS')throw Error('PERSISTED_SCRIPT_REQUIRED');
 const rows=(await c.query('SELECT * FROM script_drafts WHERE execution_id=$1 AND business_id=$2 AND content_job_id=$3 ORDER BY format',[e.id,job.business_id,job.id])).rows;
 if(rows.length!==formats(e.input).length)throw Error('PERSISTED_SCRIPT_REQUIRED');
 for(const r of rows){const {output_hash,...body}=r.data;if(hash(body)!==output_hash||r.content_hash!==output_hash||r.data.publication_hold!==true)throw Error('PERSISTED_SCRIPT_REQUIRED')}
 const proposal={scripts:rows.map(r=>({format:r.data.format,segments:r.data.segments.map(({duration_target,...s})=>s)}))};
 const expected=buildDrafts(e.input,proposal,{script_ids:rows.map(r=>r.id),version:e.revision,lineage_id:e.lineage_id,created_at:rows[0].data.created_at},e.metadata);
 if(hash(expected)!==hash(rows.map(r=>r.data)))throw Error('PERSISTED_SCRIPT_REQUIRED');
 for(const r of rows){const p=(await c.query('SELECT * FROM production_packages WHERE business_id=$1 AND content_job_id=$2 AND script_id=$3',[job.business_id,job.id,r.id])).rows;
  if(p.length!==1||hash(buildProductionPackage(e.input,r.data,p[0].id))!==hash(p[0].data)||p[0].content_hash!==p[0].data.content_hash)throw Error('PERSISTED_PACKAGE_REQUIRED');
  const assets=(await c.query('SELECT data FROM planned_asset_requirements WHERE business_id=$1 AND content_job_id=$2 AND package_id=$3 ORDER BY id',[job.business_id,job.id,p[0].id])).rows.map(r=>r.data);
  if(hash(assets)!==hash(p[0].data.timeline_segments.map(s=>s.asset_requirement).sort((a,b)=>a.requirement_id.localeCompare(b.requirement_id))))throw Error('PERSISTED_ASSETS_REQUIRED');
 }
}
