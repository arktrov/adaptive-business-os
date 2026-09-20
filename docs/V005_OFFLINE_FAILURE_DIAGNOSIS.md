# V005 offline failure diagnosis — 2026-09-20

## Evidence and historical limit

VERIFIED: local .local/v005-retry-2-result.json records one HTTP call, HTTP 200, request req_b7a45323a34640aaa591c7bffabb1030. PostgreSQL records attempt 2 / 4a33903a-b5d2-4ddb-91ce-eb92e2cf1266 as FAILED, PROVIDER_FAILURE, duration 92080 ms, retry_count 1, no output/hash, no sources/claims/evidence relations. Attempt 1 / 1939627f-afd0-40cc-b4c6-0f5465e396e9 remains FAILED. No Fact Guard runs exist.

Inspected the two local result receipts, consumed markers, launchers and available local test/acceptance logs. No saved live response envelope, structured output, response status, tool item list or underlying exception survives. The local retry launcher records HTTP status as soon as fetch returns headers, not after response body parsing.

Exact failure stage identified: NO. Response headers were received; a body-read failure (A) or any completion/tool/extraction/JSON/schema/domain/provenance failure (B–H) remains possible. HTTP 200 is not evidence of completed research, complete body delivery, correct JSON or valid evidence. Token exhaustion, malformed output and commentary are hypotheses, not recovered facts. Do not reconstruct lost response content or invent usage/cost.

VERIFIED conversion path at time of incident: OpenAIResearchProvider.execute (src/providers/openai-research.js) threw; ResearchService.run (src/application/research-service.js) caught it with catch { error='PROVIDER_FAILURE' }. No exception object or adapter metadata survived. ResearchRepository.finish (src/research-postgres.js) persisted a FAILED outcome and centrally transitioned RESEARCH_RUNNING → FAILED. The failure outcome and audit committed successfully; a PostgreSQL/state-transition failure (I/J) is not the recorded initiating cause. The local result writer copied only that generic category.

## Offline repairs

The new provider-specific parser selects the explicit final_answer assistant message, excluding commentary, tools and reasoning. When phase is absent it selects the last unphased assistant message. Multiple explicit final answers fail closed. Text blocks within the selected message are combined, then parsed as JSON. No hardcoded output index and no SDK-only output_parsed assumption. A realistic synthetic commentary + tool + final-message fixture reproduces the previous multi-text rejection; this is a verified parser defect, not proof of the historical V005 cause.

The request remains Responses text.format with type json_schema, strict true, name canonical_research_result. All object properties are required and additionalProperties false, including Claim/Source/ClaimEvidence objects. main_source and published_at explicitly permit null; arrays remain arrays. Bounds use supported minimum/maximum. The schema has no unsupported allOf/not/conditional constructs. Schema hash and prompt/policy/workflow pins remain unchanged. The request descriptor is unchanged so the explicit retry can retain the original operation hash; parser diagnostics carry responses-parser/2 separately. No domain contract was weakened.

Local validation first checks the exact schema subset and reports safe field paths, then applies the unchanged canonical validator and evidence/source provenance checks. Unknown object keys are reported only at their parent path; their potentially sensitive names or values are never copied to diagnostics. No raw response is persisted as domain state.

The generic ProviderFailure port carries trusted structured metadata to ResearchService. Provider-specific processing stays outside the domain. Stored diagnostics include bounded HTTP/request/response IDs, requested/reported model, response status, known item types, final text/structured-output existence, parser/validation stage, safe schema/reference path, static exception class/code, refusal/error/incomplete flags, attempt and duration. Unknown exception messages/stacks/causes, raw headers, upstream error/refusal text and private reasoning are discarded. Credential echoes and known secret patterns are scrubbed from permitted metadata.

Usage is extracted before response-status/parsing/domain validation; post-response failures retain available token counts and tool counts. Costs remain null when unknown, never invented zero. Persistence-failure fallback preserves received usage and safe diagnostics as well. PostgreSQL stores these in existing immutable outcome metadata; no schema migration or historical row rewrite. researchRunReport and the ignored local retry launcher use persisted safe metadata for reports. Attempt-2 receipt remains unchanged.

## PostgreSQL cleanup root cause

VERIFIED independently with the installed pg-pool implementation: pool.end resolves after clients are removed from the pool array but before their sockets emit end. A ten-client reproduction observed 0/10 end events at pool.end resolution and 10/10 after draining. The test then immediately DROP DATABASE WITH (FORCE), terminating connections still closing and producing late unhandled connection errors attributed to the parallel test.

PostgresStore.close now tracks connected clients and waits for end events as well as pool.end. It does not suppress errors or weaken parallel assertions. The research-suite teardown uses ordinary DROP DATABASE (no FORCE). A dedicated regression opens ten clients and verifies all ten ends before normal drop, repeated three times. Provider concurrency/advisory locks/state transactions are unchanged.

## Current official API contract references

Reviewed 2026-09-20: [Responses create](https://developers.openai.com/api/reference/cli/resources/responses/methods/create), [web search output items and sources](https://developers.openai.com/api/docs/guides/tools-web-search), [structured outputs and supported schema subset](https://developers.openai.com/api/docs/guides/structured-outputs), [assistant message phases](https://developers.openai.com/api/docs/guides/reasoning), [configured model](https://developers.openai.com/api/docs/models/gpt-5.6-sol). These references establish parser expectations, not what the missing V005 response contained.

## Execution boundary

No new live call; no actual OPENAI_API_KEY read or used for diagnosis. Tests inject synthetic credentials and transports and use isolated PostgreSQL test databases. No Fact Guard for V005, no Phase 2B, Make or renderer work. Historical live receipts and job/attempt/outcome/audit records remain unchanged. Any future live request must receive separate authorization, use the same confirmed input/key/hash, create attempt 3 through ResearchService retry:true, and enforce one HTTP dispatch with no automatic retry. This offline repair does not authorize that execution.


Final verification: 126/126 tests PASS in each of two full sequential runs on the final code, with 24/24 Phase-1 and 25/25 Phase-2A mapped requirements. Syntax/build (29 application modules), secret scan including new files, Make 12/12 (81 modules), renderer 31/31 hashes and diff whitespace checks PASS. Read-only before/after hashing confirms the entire real V005 job detail and historical attempt-2 receipt unchanged; exactly two FAILED live attempts and zero Fact Guard runs remain. READY_FOR_SINGLE_ATTEMPT_3 = YES as technical readiness only; no execution authorized or performed. Logs: .local/offline-diagnosis-acceptance-final.log.
