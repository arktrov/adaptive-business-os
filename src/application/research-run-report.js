import {assertSafe} from '../domain/research.js';
// A report uses persisted outcome metadata, never the raw provider response.
// Normalize driver Date/undefined values before the JSON-only safety validator.
export function researchRunReport(run){
 const report=JSON.parse(JSON.stringify({research_run_id:run.run_id,attempt:run.attempt,status:run.status,error:run.error_category??null,request_id:run.provider_request_id??run.metadata?.provider_request_id??null,http_result:run.metadata?.diagnostics?.http_status??null,diagnostics:run.metadata?.diagnostics??null,usage:run.metadata?.usage??null,cost:run.metadata?.cost??null}));
 assertSafe(report);return report;
}
