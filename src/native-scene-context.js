import {hash} from './domain/research.js';
import {verify,need} from './domain/assets.js';
export async function loadNativeContext(c,plan,packageId){
 const p=(await c.query('SELECT data,content_hash FROM production_packages WHERE id=$1 AND business_id=$2 AND content_job_id=$3',[packageId,plan.business_id,plan.content_job_id])).rows[0];
 const s=(await c.query('SELECT data,content_hash FROM script_drafts WHERE id=$1 AND business_id=$2 AND content_job_id=$3',[plan.script_id,plan.business_id,plan.content_job_id])).rows[0];
 const e=(await c.query('SELECT input FROM script_executions WHERE business_id=$1 AND content_job_id=$2 ORDER BY revision DESC LIMIT 1',[plan.business_id,plan.content_job_id])).rows[0];
 need(p&&s&&e&&p.content_hash===p.data.content_hash&&s.content_hash===s.data.output_hash,'NATIVE_PERSISTED_CONTEXT');verify(p.data);
 for(const ref of Object.values(p.data.policy_snapshot_refs)){const r=(await c.query("SELECT payload,content_hash FROM evidence_records WHERE id=$1 AND business_id=$2 AND job_id=$3 AND type='policy_snapshot'",[ref.evidence_id,plan.business_id,plan.content_job_id])).rows[0];need(r&&r.content_hash===ref.evidence_hash&&hash(r.payload)===r.content_hash&&r.payload.content_hash===ref.content_hash,'NATIVE_POLICY_SNAPSHOT')}
 return {plan,pkg:p.data,script:s.data,scope:e.input.scope};
}
