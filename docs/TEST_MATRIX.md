# Phase 1 executable test matrix

The acceptance command compares this mapping to actual successful TAP test names.
Every run creates a unique empty local PostgreSQL database, applies 001 + 002 + 003, runs the complete suite, stops app processes and drops only that test database. Development data is not reset.

| Requirement | Test File | Test Name | Persistence Adapter | Real PostgreSQL Required | Result |
| --- | --- | --- | --- | --- | --- |
| 1 | test/postgres.test.js | R01 Business tenant isolation | PostgreSQL | Yes | PASS — both clean DB runs |
| 2 | test/postgres.test.js | R02 ContentJob creation | PostgreSQL | Yes | PASS — both clean DB runs |
| 3 | test/postgres.test.js | R03 Valid state transition | PostgreSQL | Yes | PASS — both clean DB runs |
| 4 | test/postgres.test.js | R04 Invalid transition rejected | PostgreSQL | Yes | PASS — both clean DB runs |
| 5 | test/postgres.test.js | R05 Stale version rejected | PostgreSQL | Yes | PASS — both clean DB runs |
| 6 | test/postgres.test.js | R06 Concurrent transition protection | PostgreSQL | Yes | PASS — both clean DB runs |
| 7 | test/postgres.test.js | R07 Idempotent duplicate requests | PostgreSQL | Yes | PASS — both clean DB runs |
| 8 | test/postgres.test.js | R08 DB unique idempotency enforcement | PostgreSQL | Yes | PASS — both clean DB runs |
| 9 | test/postgres.test.js | R09 Immutable artifact versions | PostgreSQL | Yes | PASS — both clean DB runs |
| 10 | test/postgres.test.js | R10 Duplicate artifact version rejected | PostgreSQL | Yes | PASS — both clean DB runs |
| 11 | test/postgres.test.js | R11 Artifact historical hash and storage retained | PostgreSQL | Yes | PASS — both clean DB runs |
| 12 | test/postgres.test.js | R12 Audit rollback is atomic | PostgreSQL | Yes | PASS — both clean DB runs |
| 13 | test/postgres.test.js | R13 workflow_version persisted | PostgreSQL | Yes | PASS — both clean DB runs |
| 14 | test/postgres.test.js | R14 brand_rule_version persisted | PostgreSQL | Yes | PASS — both clean DB runs |
| 15 | test/postgres.test.js | R15 quality_policy_version persisted | PostgreSQL | Yes | PASS — both clean DB runs |
| 16 | test/postgres.test.js | R16 Historical job versions unchanged | PostgreSQL | Yes | PASS — both clean DB runs |
| 17 | test/postgres.test.js | R17 Cross tenant read rejected | PostgreSQL | Yes | PASS — both clean DB runs |
| 18 | test/postgres.test.js | R18 Cross tenant mutation rejected | PostgreSQL | Yes | PASS — both clean DB runs |
| 19 | test/postgres.test.js | R19 Real app process restart retains all records | PostgreSQL | Yes | PASS — both clean DB runs |
| 20 | test/postgres.test.js | R20 Clean migration and repeat execution | PostgreSQL | Yes | PASS — both clean DB runs |
| 21 | test/postgres.test.js | R21 Ordered job history | PostgreSQL | Yes | PASS — both clean DB runs |
| 22 | test/postgres.test.js | R22 Job Detail API tenant scoped | PostgreSQL | Yes | PASS — both clean DB runs |
| 23 | test/postgres.test.js | R23 Evidence references tenant scoped and immutable | PostgreSQL | Yes | PASS — both clean DB runs |
| 24 | test/postgres.test.js | R24 Artifact references tenant scoped | PostgreSQL | Yes | PASS — both clean DB runs |

Additional executable browser case: `UI displays persisted evidence and artifacts via real app` uses installed Edge through Playwright and PostgreSQL-backed HTTP APIs. The four original domain cases remain in `test/core.test.js`.

Raw TAP output is saved locally in `.local/acceptance-run-1.tap` and `.local/acceptance-run-2.tap`. No credentials or business payloads are printed.

PR review adds two security regressions (release fail-closed and cross-origin/Host rejection). Frozen Phase-1 suite: 31 cases in two files; both review runs PASS; 24/24 mapping unchanged. Phase 2A extends the total as recorded below.

## Phase 2A executable matrix

All cases below use a unique real PostgreSQL database. Final result: PASS in both complete 76-case acceptance runs. The original 31 tests are retained; R20 now expects three additive migrations.

| Requirement | Test name | File | Database |
| --- | --- | --- | --- |
| P2A01 | P2A01 ResearchRun tenant isolation | test/research.test.js | PostgreSQL |
| P2A02 | P2A02 Same key and hash reuses successful result | test/research.test.js | PostgreSQL |
| P2A03 | P2A03 Changed input rejects idempotency conflict | test/research.test.js | PostgreSQL |
| P2A04 | P2A04 Parallel duplicates create one logical success | test/research.test.js | PostgreSQL |
| P2A05 | P2A05 Failed research requires explicit audited retry | test/research.test.js | PostgreSQL |
| P2A06 | P2A06 Research persistence failure cannot complete state | test/research.test.js | PostgreSQL |
| P2A07 | P2A07 Claims persist structured fields | test/research.test.js | PostgreSQL |
| P2A08 | P2A08 Sources persist provenance and timestamps | test/research.test.js | PostgreSQL |
| P2A09 | P2A09 Claim evidence relations enforce scoped foreign keys | test/research.test.js | PostgreSQL |
| P2A10 | P2A10 Prompt version and content hash persist | test/research.test.js | PostgreSQL |
| P2A11 | P2A11 Policy snapshot remains immutable | test/research.test.js | PostgreSQL |
| P2A12 | P2A12 Provider model metadata hashes and duration persist | test/research.test.js | PostgreSQL |
| P2A13 | P2A13 Fact Guard PASS | test/research.test.js | PostgreSQL |
| P2A14 | P2A14 Fact Guard REVIEW_REQUIRED | test/research.test.js | PostgreSQL |
| P2A15 | P2A15 Fact Guard REJECT | test/research.test.js | PostgreSQL |
| P2A16 | P2A16 Fact Guard persistence failure cannot pass state | test/research.test.js | PostgreSQL |
| P2A17 | P2A17 Required corrections persist | test/research.test.js | PostgreSQL |
| P2A18 | P2A18 Script guardrails persist | test/research.test.js | PostgreSQL |
| P2A19 | P2A19 Approved and blocked claims persist distinctly | test/research.test.js | PostgreSQL |
| P2A20 | P2A20 Cross tenant research read rejected | test/research.test.js | PostgreSQL |
| P2A21 | P2A21 Cross tenant Fact Guard read rejected | test/research.test.js | PostgreSQL |
| P2A22 | P2A22 Job Detail Research API exposes persisted canonical result | test/research.test.js | PostgreSQL |
| P2A23 | P2A23 Job Detail Fact Guard API exposes persisted decision | test/research.test.js | PostgreSQL |
| P2A24 | P2A24 Real app restart retains Research and Fact Guard | test/research.test.js | PostgreSQL |
| P2A25 | P2A25 Upgrade real Phase 1 schema preserves existing data | test/research.test.js | PostgreSQL |

Additional regressions cover browser display, parsing/provider failure, explicit retry, interrupted starts, immutable evidence, scoped foreign keys, version/hash conflicts, synthetic-job separation and secret/private-reasoning rejection.

## Final Phase 2A acceptance — 2026-09-20

PASS: 76/76 in each of two clean-database runs; original 31/31 plus 45 new tests. 24/24 Phase-1 and 25/25 Phase-2A requirements are verified against actual successful runner names by scripts/acceptance.mjs. No skipped tests. PostgreSQL rollback, upgrade, scoped relations, idempotency, restart, browser UI, interrupted recovery, late-completion fencing and 24 parallel duplicate requests pass.

Lint/build: 18 native JavaScript modules PASS. Secret pattern check PASS (committed source scope; local public DB placeholders allowed). Foundation check: 12/12 unchanged blueprints, 81 modules. External renderer: 31/31 reference SHA-256 hashes unchanged. Dev PostgreSQL healthy; migration 003 applied. V005 SHORT remains IDEA_CREATED without synthetic evidence. No live-provider gate was run or required.

## OpenAI adapter preparation tests

New test/openai.test.js cases OAI01–OAI23 cover offline unit/contract behavior. New test/openai-postgres.test.js contains two isolated PostgreSQL cases: no-write preparation and canonical adapter output/idempotency/secret isolation. All transport responses are injected local fixtures, not live requests. The original 76 tests remain unchanged. Final aggregate result: 101/101 PASS in both acceptance runs, with no skipped cases. Lint/build (24 JavaScript modules), PowerShell helper syntax, Secret Check, 12 Make originals and 31 renderer reference hashes PASS. Real V005 preflight readback remained unchanged with zero Research/Fact Guard runs. No live OpenAI request.


## Offline V005 diagnostic repair tests

- test/openai-diagnostics.test.js: DIAG01–DIAG16 cover mixed tool/commentary/final output, split final text, malformed JSON, schema paths/null/required fields, missing output, incomplete/refusal/error, evidence/provenance rejection, secret echoes, primitive envelopes, ambiguous final messages, forged metadata and safe result writing.
- test/openai-postgres.test.js: real isolated PostgreSQL verifies failed-attempt metadata/usage survive restart and tenant boundaries for malformed JSON, incomplete output and schema errors; persistence rollback retains received usage; unknown exception text cannot persist. Also covers explicit retry preserving the previous failed record and input hash.
- test/research.test.js: P2A Parallel pool shutdown drains socket ends before database drop, repeated three cycles; existing 24-way parallel-load and restart tests remain enabled.
- Existing Phase-1 R01–R24 and Phase-2A P2A01–P2A25 requirements remain mandatory. No live-provider calls are acceptance tests.

Offline repair final gate: full Run 1 = 126/126 PASS; full Run 2 = 126/126 PASS. See .local/offline-diagnosis-acceptance-final.log. No tests skipped; existing requirement mappings checked by scripts/acceptance.mjs.


## V005 token budget tests

BUDGET01–BUDGET06 in test/openai-budget.test.js verify the actual 16000/medium wire request, configurable overrides, unchanged generic domain/state boundaries, incomplete failure with usage retention and no repeat dispatch, successful canonical output, and invalid configuration rejection. Two BUDGET DB tests in test/openai-postgres.test.js verify persistent incomplete failure with zero partial research and changed-budget idempotency rejection with no provider call or history changes.


Verification: full Run 1 = 134/134 PASS; full Run 2 = 134/134 PASS, including 24/24 Phase-1 and 25/25 Phase-2A requirements. Secret check (tracked/new files), syntax/build and foundation PASS. Renderer 31/31 reference hashes and Make 12/12 originals unchanged. Real V005 job snapshot unchanged: three FAILED attempts and zero Fact Guard runs. No live call. Logs: .local/token-budget-acceptance.log.


## Versioned research retry lineage

LINEAGE01–LINEAGE17 in test/research-lineage.test.js exercise the real PostgreSQL-backed service, immutable history, explicit retry/revision admission, cross-revision numbering, key/hash protection, input and tenant isolation, concurrent retries, audit completeness, restart, direct DB constraints and upgrade/rollback from pre-lineage history. Full Run 1 = 151/151 PASS; full Run 2 = 151/151 PASS. Existing Phase-1 and Phase-2A requirement mappings remain checked. Evidence: .local/lineage-acceptance.log.

## Web-search budget offline coverage
Eight TOOL01–08 unit/contract cases in test/openai-tool-budget.test.js plus two TOOL DB integration cases in test/openai-postgres.test.js and test/research-lineage.test.js cover the twelve requested budget/revision protections. Real PostgreSQL; fabricated responses only; no external calls. See [semantics and evidence](V005_WEB_SEARCH_BUDGET.md).

Full regression: 161/161 PASS in run 1 and 161/161 PASS in run 2; 24/24 Phase-1 and 25/25 Phase-2A requirement mappings verified. Native build 34 modules PASS. Secret check PASS including untracked source/docs. Make 12/12 originals / 81 modules unchanged. Renderer 31/31 reference hashes unchanged. Zero new live calls; no Attempt 5, Fact Guard or Phase 2B execution.

## Completed tool-count semantics
SEM A/C/D/E and provenance/status-safety fixtures in test/openai-tool-budget.test.js plus SEM DB in test/openai-postgres.test.js cover the corrected processed-call budget and durable diagnostics. Prior TOOL04 validates nine completed calls still fail; all fixtures are synthetic. See [semantics](V005_TOOL_BUDGET_SEMANTICS.md).

Completed-call semantics regression: 176/176 tests PASS twice; 24/24 Phase-1 and 25/25 Phase-2A mappings verified. Native build 34 modules PASS; Secret Check PASS including untracked files; Make 12/12 originals unchanged; renderer 31/31 reference hashes unchanged. V005 full historical snapshot unchanged, five attempts, zero Fact Guard. No live provider call.

## Response recovery safeguard
REC fixtures in test/openai-recovery.test.js and REC DB cases in test/openai-postgres.test.js cover capture ordering, safe sanitization, usage, failures, restart durability, tenant scope, immutable history and pure offline validation. See [recovery contract](PROVIDER_RESPONSE_RECOVERY.md).

Response recovery final regression: 192/192 tests PASS twice, including real isolated PostgreSQL tests; 24/24 Phase-1 and 25/25 Phase-2A requirements mapped. Native build 37 modules PASS. Secret Check PASS including untracked code/docs. Make 12/12 originals unchanged; renderer 31/31 reference hashes unchanged. Full V005 historical snapshot unchanged: five attempts, zero Fact Guard. No live provider calls and no Attempt 6.

## Offline processing recovery
PROC01–11 in test/research-processing-recovery.test.js exercise real PostgreSQL recovery transactions, immutable history and separate revision identity.
See [Attempt-6 recovery](V005_ATTEMPT_6_RECOVERY.md).

Processing recovery final verification: 203/203 tests PASS twice; 24/24 Phase-1 and 25/25 Phase-2A requirement mappings verified. Clean/repeat migration and real PostgreSQL integration PASS; native build 40 modules PASS; Secret Check PASS including untracked files; Make 12/12 originals and renderer 31/31 hashes unchanged.

## Offline Fact Guard integration

FG01–FG04 cover context-only blocking, partial verification, mandatory qualifications, HOLD and rights/uncertainty retention. FG05–FG07 use real isolated PostgreSQL: recovered input, approval evidence, restart persistence, immutable research history, idempotency, audit, tenant isolation and policy mismatch rejection before invocation. No external provider calls.

## Human decision and policy binding

HFG01–HFG10: immutable human decisions and policy hashes; BLOCKED and CONTEXT_ONLY dispositions; HOLD; separate immutable rerun with no external calls; read-after-restart; missing source STOP; tampered policy rejection; cross-tenant isolation; central state admission guard; persistence failure rollback/fail closed; prohibited promotion/HOLD clearing; exact authoritative source text. Real isolated PostgreSQL except source-loader-only HFG10.

## Scope semantics

SCOPE01–SCOPE14 cover all requested scope acceptance cases: PASS with blocked/context; forbidden factual use; enforceable context restrictions; corrections and missing human review; empty scope; HOLD; no release bypass; immutable hash/version; tenant scoping; historical runs; narrowed Script-stage input/qualifier validation; policy snapshot binding. All integration fixtures use isolated PostgreSQL and local provider responses.

Final review regressions REVIEW01–REVIEW03 cover mandatory contextual qualification, normal successful research human/policy binding, and denial of internal evidence types at the local HTTP boundary. Existing 234 tests plus 3 regression tests = 237.

# Phase 2B — real test mapping

All tests below are in test/script-production.test.js. PostgreSQL is real and isolated; HTTP provider transport is stubbed, with external fetch denied in acceptance. Original 237 cases are retained. Result counts are recorded only after runner completion.

| Actual test name | Evidence |
| --- | --- |
| P2B01 input only contains admitted Fact Guard scope | Node runner; PostgreSQL where persistence is involved |
| P2B02 blocked claims rejected despite arbitrary prose | Node runner; PostgreSQL where persistence is involved |
| P2B03 context cannot become factual and keeps limitation label | Node runner; PostgreSQL where persistence is involved |
| P2B04 qualifier cannot be dropped or paraphrased | Node runner; PostgreSQL where persistence is involved |
| P2B05 unsupported factual prose rejected in hook and claim text | Node runner; PostgreSQL where persistence is involved |
| P2B06 every factual segment has persisted claim traceability | Node runner; PostgreSQL where persistence is involved |
| P2B07 evidence relation and source references resolve | Node runner; PostgreSQL where persistence is involved |
| P2B08 brand snapshot is bound and persisted | Node runner; PostgreSQL where persistence is involved |
| P2B09 quality snapshot is bound and persisted | Node runner; PostgreSQL where persistence is involved |
| P2B10 production policy version persists on draft and input | Node runner; PostgreSQL where persistence is involved |
| P2B11 script and package records reject updates and deletes | Node runner; PostgreSQL where persistence is involved |
| P2B12 explicit revision preserves prior script and increments version | Node runner; PostgreSQL where persistence is involved |
| P2B13 changed input with same key conflicts before provider | Node runner; PostgreSQL where persistence is involved |
| P2B14 changed execution requires explicit previous revision | Node runner; PostgreSQL where persistence is involved |
| P2B15 script service uses provider interface without domain dependency | Node runner; PostgreSQL where persistence is involved |
| P2B16 paid response committed and read back before downstream parse | Node runner; PostgreSQL where persistence is involved |
| P2B17 parser failure preserves recoverable body offline without retry | Node runner; PostgreSQL where persistence is involved |
| P2B18 recoverable artifact excludes secrets and private reasoning | Node runner; PostgreSQL where persistence is involved |
| P2B19 machine readable package links exact immutable script | Node runner; PostgreSQL where persistence is involved |
| P2B20 timeline ordered contiguous and uses actual text duration | Node runner; PostgreSQL where persistence is involved |
| P2B21 out of profile duration prevents package | Node runner; PostgreSQL where persistence is involved |
| P2B22 visual classifications persist for each segment | Node runner; PostgreSQL where persistence is involved |
| P2B23 generated imagery cannot masquerade as observed footage | Node runner; PostgreSQL where persistence is involved |
| P2B24 planned rights remain uncleared and separate from real assets | Node runner; PostgreSQL where persistence is involved |
| P2B25 audio plan preserves perceptual audibility requirement | Node runner; PostgreSQL where persistence is involved |
| P2B26 SHORT profile is configuration driven | Node runner; PostgreSQL where persistence is involved |
| P2B27 LONG profile is configuration driven | Node runner; PostgreSQL where persistence is involved |
| P2B28 BOTH creates independent scripts and packages atomically | Node runner; PostgreSQL where persistence is involved |
| P2B29 cross tenant reads writes and foreign keys are denied | Node runner; PostgreSQL where persistence is involved |
| P2B30 restart retains script package and idempotent cache | Node runner; PostgreSQL where persistence is involved |
| P2B31 Script API and UI show actual persisted draft | Node runner; PostgreSQL where persistence is involved |
| P2B32 Production API and UI show persisted timeline audio and rights | Node runner; PostgreSQL where persistence is involved |
| P2B33 publication HOLD remains true across draft package and audit | Node runner; PostgreSQL where persistence is involved |
| P2B34 script approval cannot bypass release or central persisted proof | Node runner; PostgreSQL where persistence is involved |
| P2B35 renderer reference hashes unchanged | Node runner; PostgreSQL where persistence is involved |
| P2B36 Make originals unchanged by production planning | Node runner; PostgreSQL where persistence is involved |
| P2B37 concurrent identical command makes one provider invocation | Node runner; PostgreSQL where persistence is involved |
| P2B38 artifact persistence failure prevents parsing and production completion | Node runner; PostgreSQL where persistence is involved |
| P2B39 successful offline reprocessing performs zero external calls | Node runner; PostgreSQL where persistence is involved |
| P2B40 schema-invalid response remains recoverable and cannot retry implicitly | Node runner; PostgreSQL where persistence is involved |
| P2B41 generic video planning port has no execution authorization | Node runner; PostgreSQL where persistence is involved |
| P2B42 missing credential stops before state or execution mutation | Node runner; PostgreSQL where persistence is involved |
| P2B43 output persistence failure rolls back outputs and persists failed gate | Node runner; PostgreSQL where persistence is involved |
| P2B44 incomplete provider response never completes script | Node runner; PostgreSQL where persistence is involved |
| P2B45 production policy forbidden phrase stops deterministic gate | Node runner; PostgreSQL where persistence is involved |
| P2B46 tampered evidence references cannot pass validation | Node runner; PostgreSQL where persistence is involved |
| P2B47 changed policies profiles and provider conflict through service input | Node runner; PostgreSQL where persistence is involved |
| P2B48 echoed credential is excluded from response and request metadata | Node runner; stub provider response and real PostgreSQL |

Final Phase-2B technical verification: 285/285 PASS in both full runs; 237 existing + 48 new cases; 24/24 Phase-1, 25/25 Phase-2A and 36/36 Phase-2B mapped requirements. Zero skips/failures. Real isolated PostgreSQL, actual local HTTP/UI, stubbed paid transports. V005 live execution remains pending; these are technical acceptance results only.

## Controlled V005 runtime verification — 2026-09-21

Execution 68818bfb-5a58-4029-81ab-5ddcd5cfc364 completed through the normal ScriptService in one authorized live call. HTTP 200/completed; validated immutable Script and Production Package persisted; state PRODUCTION_PACKAGE_READY. Independent readback and offline reprocessing PASS. Input/output/package/response hashes and five planned-asset rows verified. Research/Fact Guard history unchanged. Publication HOLD TRUE. Human creative review remains required; literal factual validation does not certify creative quality. No further provider or production-stage call. Existing two full 285-test runs remain valid: implementation hash unchanged.
