# Recoverable Research provider responses

## Storage and ordering

Every successfully received, bounded HTTP-success OpenAI Research response is envelope-decoded only as needed to sanitize it, then captured before canonical Research parsing, schema validation or normalization. Capture uses the existing immutable evidence_records persistence, evidence type provider_response, reference provider-response:<run_id>. No new database architecture or migration is needed.

ResearchService injects a generic persistProviderResponse callback into provider execution context. ResearchRepository verifies tenant/job/run ownership and the original request hash, serializes duplicate checks on the attempt row, commits the artifact separately, then reads it back and verifies its SHA-256 canonical content hash. Only a matching evidence ID/hash acknowledgment permits parsing. Missing capture capability blocks dispatch; a write/readback failure produces RESPONSE_ARTIFACT_PERSISTENCE_FAILED and cannot reach RESEARCH_COMPLETE. A later ResearchResult transaction failure does not roll back the already committed response artifact.

The callback is a generic persistence boundary; OpenAI sanitization and envelope handling remain in the provider adapter. Local/Fake providers need not call it. Unit fixtures use an explicit in-memory acknowledgment stand-in; integration tests exercise real PostgreSQL commits and readback. Existing immutable evidence triggers prohibit updates/deletes. Reads are scoped by business, content job and run reference.

## Sanitized artifact contract

Format openai-research-response/1 stores received_at, run_id, original request_hash, request_id, response ID/status/model, output item metadata, final assistant output_text (including canonical JSON text), source URLs/citations required for provenance, web-search IDs/statuses/actions, usage and reasoning-token counts, tool usage, effective provider configuration, processing versions and redaction flag. content_hash hashes the sanitized payload and is stored with the evidence row; the outcome diagnostics reference artifact ID/hash.

An allowlist excludes authorization headers, request credentials, arbitrary envelope fields, reasoning item contents/summaries/encrypted content, commentary and analysis text. Only explicit final assistant messages or the last unphased assistant message retain content. Split output_text fragments are joined before sanitization to prevent fragment boundaries hiding secrets. Known secret patterns and the exact process credential are scrubbed; forbidden secret/private-reasoning keys inside parsed final JSON are removed. Refusal text is not retained. Invalid identifiers are sanitized; no raw provider response is printed or committed.

Payloads requiring redaction are marked and cannot become an offline successful result. The live adapter still rejects credential echoes and retains its original strict parsing/validation behavior. Existing response-size/transport limits remain in force: an unreadable or oversized body cannot yield a complete recoverable payload and fails closed. Malformed outer HTTP JSON gets a safe null-response artifact and remains failed; unsafe raw bytes are never archived. A malformed canonical Research JSON string inside a valid envelope is retained safely and can be reevaluated offline. This safeguard does not retroactively recover the lost bodies of Attempts 1–5.

## Offline-only reprocessing

src/providers/openai-recovery.js exports reprocessResponseArtifact and reprocessStoredResponse. The latter loads scoped evidence and verifies its content hash. Both run current normalizeResponse, JSON schema, canonical domain validation and source-provenance checks; return success/output/hash or safe failure diagnostics. They never instantiate the OpenAI adapter, invoke fetch, execute transitions, store a new ResearchResult or overwrite prior runs.

CLI (with existing DATABASE_URL process configuration):

    node scripts/reprocess-research-response.mjs BUSINESS_ID CONTENT_JOB_ID RUN_ID

The CLI outputs only verdict, safe diagnostics and output hash, never full content or credentials. It does not read an OpenAI credential. Historical failed attempts remain failed regardless of offline verdict; promotion/recovery would need a separately designed authorized operation.

## Processing identity

Adapter processing version responses-research-processing/1.2; parser responses-parser/2.2; validator completed-tool-budget/1.0; capture sanitized-response/1.0. Profile arktrov-deep-research/1.1, request descriptor, model gpt-5.6-sol, max_output_tokens 16000, medium reasoning and max_tool_calls 8 remain unchanged. The next separately authorized attempt can use the existing exact-request retry path, attempt 6 within execution revision 3. No Attempt 6 or live launcher is created here.

## Tests

REC unit fixtures prove capture/acknowledgment before parser and schema failures, persistence/hash failure stops, missing sink prevents spending, secret and hidden reasoning removal, split-text sanitization, analysis-message exclusion, usage retention, hash tamper rejection and zero-dispatch offline reprocessing. REC DB tests prove durability after restart, same-tenant ownership, immutable artifacts/history, read-only reprocessing, capture failure fail-closed, and survival of a later ResearchResult persistence failure. All responses are synthetic.

## Verification

192/192 tests PASS twice, including real isolated PostgreSQL tests; 24/24 Phase-1 and 25/25 Phase-2A requirements mapped. Native build 37 modules PASS. Secret Check PASS including untracked code/docs. Make 12/12 originals unchanged; renderer 31/31 reference hashes unchanged. Full V005 historical snapshot unchanged: five attempts, zero Fact Guard. No live provider calls and no Attempt 6.

READY_FOR_SINGLE_ATTEMPT_6 = YES (technical readiness only; separate live authorization required).
