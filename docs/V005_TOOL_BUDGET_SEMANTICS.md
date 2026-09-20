# V005 completed tool-call semantics correction

## Historical diagnosis

Attempt 5 remains FAILED, run 020a33e0-4044-4b2a-8f4b-d91cf8393c2a, execution revision 3. HTTP 200 and provider status completed did not constitute application success. Persisted diagnostics show nine web_search_call items, eight completed, configured budget eight.

Exact faulty condition in responses-parser/2.1: if(searches.length>config.max_tool_calls)fail('TOOL_BUDGET_EXCEEDED'), where searches=data.output.filter(x=>x.type==='web_search_call'). The subsequent searches.some(x=>x.status!=='completed') guard would also incorrectly reject an extra unfinished item. Both raw-count budget enforcement and blanket extra-status rejection are corrected.

The [official Responses reference](https://developers.openai.com/api/reference/cli/resources/responses/methods/create) describes max_tool_calls in terms of processed built-in calls. Our observable proxy is status completed, not the total number of emitted output items. Unknown/noncompleted item statuses are not claimed to be successfully processed calls.

## Corrected behavior

Keep ARKTROV profile 1.1, model gpt-5.6-sol, max_output_tokens 16000, medium reasoning, max_tool_calls 8. No request body, provider descriptor, logical input, policy, prompt, workflow, execution hash or idempotency identity change is necessary for this local processing correction.

Budget failure now occurs only if searches.filter(x=>x.status==='completed').length exceeds config.max_tool_calls. At least one completed search remains required for this web-research adapter. An extra incomplete, failed, in_progress, searching, cancelled, unknown or other-status item is diagnostic and does not itself invalidate a completed response. Total counts and usage retain their original item-count meaning; completed counts are separately named.

Response completion, final message extraction, JSON parsing, strict schema, domain validation, source provenance and transactional persistence remain mandatory. Only completed searches contribute action URLs/sources to provenance; final message citations retain their existing handling. Unfinished items cannot independently provide evidence provenance. No partial output is admitted and no automatic retry occurs.

## Durable safe diagnostics and processing versions

Response facts are harvested before completion and parsing checks: total items, completed count, incomplete count, per-status counts and each sanitized tool-call ID/status. Known statuses are allowlisted; missing status is unknown and unrecognized text becomes other rather than being copied into metadata. Invalid IDs become null; credential-aware scrubbing still applies. No raw tool payload, request headers, private reasoning or response text is stored in diagnostics. Existing response byte limits bound collection size.

Record configured tool budget, response status, final_text_present and structured_output_present (the latter means JSON was extracted/parsed, not full schema acceptance). Processing metadata records adapter_processing_version=responses-research-processing/1.1, parser_revision=responses-parser/2.2, validator_version=completed-tool-budget/1.0 on success and adapter-generated failures. The wire-contract descriptor remains responses-research/1.0; it is distinct from processing versions. PostgreSQL restart tests verify the new metadata persists.

## Attempt 5 recoverability

Read-only PostgreSQL inspection confirms output=null. Local operational artifact search under .local and available data/tmp/log locations found only .local/v005-attempt-5-result.json for this response/request ID. The adapter held raw response text only in memory and neither adapter nor launcher saved it. No retained final structured response or per-item status list was found. Therefore ninth-item status recoverable: NO; final structured response recoverable: NO.

Attempt 5 would pass corrected tool-budget validation: YES, using persisted completed count 8 and budget 8. This is a count-based conclusion, not a replay of the missing response. Overall parser/schema/domain success is UNKNOWN. No reconstruction, rewriting of Attempt 5, recovery execution or live request occurred.

## Regression coverage

SEM A fixtures cover eight completed plus incomplete, in_progress, searching, failed, cancelled, missing and unrecognized status items. TOOL04 continues to reject nine completed calls. SEM C rejects response-level incompleteness before budget validation and preserves tool diagnostics. SEM D covers missing final, malformed JSON and schema failure. SEM E accepts large noncompleted item counts with eight completed calls. Additional tests preserve provenance and sanitize IDs/statuses. SEM DB verifies persisted processing versions, statuses, canonical output, state and zero Fact Guard after PostgreSQL restart. These are synthetic fixtures, not historical V005 outputs.

A separately authorized next attempt may use the existing exact-request retry path for revision 3 with monotone attempt 6. Same request hash after a local processing fix is intentional; previous FAILED outcome is never a successful cache hit. No new run or live launcher is created by this task.

## Final verification

176/176 tests PASS twice; 24/24 Phase-1 and 25/25 Phase-2A mappings verified. Native build 34 modules PASS; Secret Check PASS including untracked files; Make 12/12 originals unchanged; renderer 31/31 reference hashes unchanged. V005 full historical snapshot unchanged, five attempts, zero Fact Guard. No live provider call.

READY_FOR_SINGLE_NEXT_ATTEMPT = YES as technical readiness only; a new live call requires separate authorization.
