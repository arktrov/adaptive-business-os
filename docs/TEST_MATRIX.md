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

## Human script revision preparation tests

| REV01 multiple ordered visual beats persist through normal service and central guard | Offline Node runner; isolated real PostgreSQL for persistence |
| REV02 beat order must follow narration order | Offline Node runner; isolated real PostgreSQL for persistence |
| REV03 each narration duration must be fully covered | Offline Node runner; isolated real PostgreSQL for persistence |
| REV04 concrete brief cannot be missing or generic type only | Offline Node runner; isolated real PostgreSQL for persistence |
| REV05 beat claim links cannot introduce blocked facts | Offline Node runner; isolated real PostgreSQL for persistence |
| REV06 classification required and generated imagery cannot be observation | Offline Node runner; isolated real PostgreSQL for persistence |
| REV07 generation eligibility cannot authorize execution | Offline Node runner; isolated real PostgreSQL for persistence |
| REV08 rights requirement cannot be empty | Offline Node runner; isolated real PostgreSQL for persistence |
| REV09 disclosure requirement cannot be empty | Offline Node runner; isolated real PostgreSQL for persistence |
| REV10 human directive is immutable and idempotent with bound artifacts policies scope | Offline Node runner; isolated real PostgreSQL for persistence |
| REV11 v2 input requires tenant scoped matching directive | Offline Node runner; isolated real PostgreSQL for persistence |
| REV12 claim qualifiers and context-only protection retained | Offline Node runner; isolated real PostgreSQL for persistence |
| REV13 profile controls beat count without business hardcoding | Offline Node runner; isolated real PostgreSQL for persistence |
| REV14 v2 provider schema carries all required beat fields | Offline Node runner; isolated real PostgreSQL for persistence |
| REV15 duplicate beat ids rejected | Offline Node runner; isolated real PostgreSQL for persistence |
| REV16 script and package v1 database immutability remains enforced | Offline Node runner; isolated real PostgreSQL for persistence |

Revision preparation acceptance: 301/301 PASS twice (285 existing + 16 new), zero failures/skips; real isolated PostgreSQL, no external calls. Run 1: 233.072 seconds; Run 2: 257.137 seconds. Native syntax/build 61 modules PASS; Secret Check PASS; renderer reference hashes and all 12 Make blueprints unchanged. Immutable human directive and unchanged V005 v1 Script/Package/state verified by PostgreSQL readback. READY_FOR_SINGLE_V005_SCRIPT_V2_CALL = YES (technical readiness only; no live authorization or execution).

## Offline Script processing recovery

| USAGE01 provider DIRECT is not authoritative when exact qualifier is present | Offline Node runner; real isolated PostgreSQL |
| USAGE02 required mode derives from scope even when provider says context | Offline Node runner; real isolated PostgreSQL |
| USAGE03 missing qualifier fails despite provider QUALIFIED | Offline Node runner; real isolated PostgreSQL |
| USAGE04 materially weakened qualifier fails | Offline Node runner; real isolated PostgreSQL |
| USAGE05 blocked claim cannot be relabeled | Offline Node runner; real isolated PostgreSQL |
| USAGE06 context only requires full limitation wording regardless of label | Offline Node runner; real isolated PostgreSQL |
| USAGE07 exact fallback only normalizes harmless whitespace not arbitrary paraphrases | Offline Node runner; real isolated PostgreSQL |
| USAGE08 optional repair is exact auditable zero call preparation requiring human review | Offline Node runner; real isolated PostgreSQL |
| USAGE09 offline recovery persists new revision and package without changing paid attempt | Offline Node runner; real isolated PostgreSQL |
| USAGE10 processing revision and original artifact are immutable | Offline Node runner; real isolated PostgreSQL |
| USAGE11 recovery is idempotent under concurrency with no new execution | Offline Node runner; real isolated PostgreSQL |
| USAGE12 recovery is tenant scoped | Offline Node runner; real isolated PostgreSQL |
| USAGE13 central state cannot bypass processing evidence | Offline Node runner; real isolated PostgreSQL |
| USAGE14 changed source response hash cannot be recovered | Offline Node runner; real isolated PostgreSQL |
| USAGE15 new processing contract normal service derives canonical usage | Offline Node runner; real isolated PostgreSQL |

Offline V005 recovery verified: processing revision 2c9acdcf-d0cc-45bd-a200-a4d2369b2cb1 references paid execution b39bc24d-1b3c-40e1-a230-464d1846a4bc, whose REVIEW_REQUIRED outcome remains unchanged. Script v2 6f0e9db1-ad8b-4b39-a4b6-c9b5839885bc and Package v2 8ca06398-576e-4ffb-b7a6-5100f2b6fba2 persist 149 words, 54.184 seconds and nine visual beats. C2/C7/C10 qualifiers VERBATIM; no textual repair. Processing 2.1 validation PASS; Publication HOLD TRUE. Voiceover, visual briefs, v1 artifacts, source response/execution, Research, Fact Guard and prior Evidence verified unchanged. Zero new provider calls. State PRODUCTION_PACKAGE_READY is technical readiness only; creative approval remains HUMAN_REVIEW_REQUIRED.

316/316 tests PASS twice: 301 existing + 15 new, no failures/skips. Run 1 281.005s; Run 2 283.773s. Real isolated PostgreSQL and blocked external transports; 24/24 Phase 1, 25/25 Phase 2A, 36/36 Phase 2B requirements mapped. Build 65 modules PASS. Secret Check PASS. Renderer and Make unchanged. No Phase 2C.

## Approved claim realization catalog

| REAL01 canonical text remains accepted without a catalog | Offline Node runner; isolated PostgreSQL where applicable |
| REAL02 exact human-approved variant accepted and traced in draft | Offline Node runner; isolated PostgreSQL where applicable |
| REAL03 proposed realization rejected | Offline Node runner; isolated PostgreSQL where applicable |
| REAL04 retired realization rejected | Offline Node runner; isolated PostgreSQL where applicable |
| REAL05 approval requires explicit qualifier semantics attestation | Offline Node runner; isolated PostgreSQL where applicable |
| REAL06 missing qualifier references rejected despite approval flag | Offline Node runner; isolated PostgreSQL where applicable |
| REAL07 blocked claim cannot be approved into factual use | Offline Node runner; isolated PostgreSQL where applicable |
| REAL08 context restrictions and allowed mode survive alternative wording | Offline Node runner; isolated PostgreSQL where applicable |
| REAL09 changed text invalidates content hash | Offline Node runner; isolated PostgreSQL where applicable |
| REAL10 cross-tenant catalog entry rejected | Offline Node runner; isolated PostgreSQL where applicable |
| REAL11 altered source claim or scope cannot reuse approval | Offline Node runner; isolated PostgreSQL where applicable |
| REAL12 arbitrary similar paraphrase still rejected | Offline Node runner; isolated PostgreSQL where applicable |
| REAL13 PostgreSQL versions append immutably and retirement replaces eligibility | Offline Node runner; isolated PostgreSQL where applicable |
| REAL14 old processing ignores catalogs and historical scripts stay unchanged | Offline Node runner; isolated PostgreSQL where applicable |
| REAL15 retirement after input preparation blocks state admission before provider | Offline Node runner; isolated PostgreSQL where applicable |


Claim realization closeout: full offline acceptance suite passed twice, 331/331 each (REAL01–REAL15 included). Native JavaScript build: 68 modules PASS. Secret scan PASS. Read-only V005 baseline comparison: complete job snapshot, Script v1/v2 and ProductionPackage v1/v2 unchanged; state PRODUCTION_PACKAGE_READY. No provider call.


| REAL16 selected four approvals preserve eight proposals and canonical source in PostgreSQL | Real isolated PostgreSQL; exact acceptance/rejection and qualifier checks |
| REAL17 realization profile supplies explicit exact approved language without changing old prompt | Offline configuration contract test |

Human realization approval closeout: 333/333 full-suite tests PASS twice, including REAL01–REAL17. Live V005 read-back confirms four APPROVED v2 and eight PROPOSED v1 records, exact validator acceptance/rejection, intact qualifier references and canonical claims, tenant isolation, unchanged Script v1/v2 and Package v1/v2. No provider calls or state transitions.


Final human approval tests: HPA01 immutable selection and unchanged artifacts/state; HPA02 idempotency; HPA03 tenant isolation; HPA04 publication/release bypass denial; HPA05 mismatched package rejection. All use real isolated PostgreSQL.

Phase-2B human freeze: 338/338 tests PASS twice, no failed/skipped tests. Real PostgreSQL suite, HPA01–HPA05, renderer reference hashes and Make originals PASS. Build: 70 JavaScript modules PASS; Secret Check PASS. Final V005 human-selected v4 readback verified; release denied and publication HOLD maintained.


## Phase 2C tests

| P2C01 approved ProductionPackage becomes immutable AssetPlan | Offline domain/QA or isolated real PostgreSQL; no paid calls |
| P2C02 every beat has a unique resolved requirement | Offline domain/QA or isolated real PostgreSQL; no paid calls |
| P2C03 router is business agnostic and capability based | Offline domain/QA or isolated real PostgreSQL; no paid calls |
| P2C04 native visual route produces validated scene layers | Offline domain/QA or isolated real PostgreSQL; no paid calls |
| P2C05 observed media routes to source rights verification | Offline domain/QA or isolated real PostgreSQL; no paid calls |
| P2C06 illustrative still routes to image boundary | Offline domain/QA or isolated real PostgreSQL; no paid calls |
| P2C07 illustrative video and image to video route explicitly | Offline domain/QA or isolated real PostgreSQL; no paid calls |
| P2C08 replaceable video interface accepts a Runway compatible adapter | Offline domain/QA or isolated real PostgreSQL; no paid calls |
| P2C09 no forced video provider for native content | Offline domain/QA or isolated real PostgreSQL; no paid calls |
| P2C10 factual classification overrides generative visual choice | Offline domain/QA or isolated real PostgreSQL; no paid calls |
| P2C11 blocked claims cannot enter an asset plan | Offline domain/QA or isolated real PostgreSQL; no paid calls |
| P2C12 classification cannot change on an artifact | Offline domain/QA or isolated real PostgreSQL; no paid calls |
| P2C13 disclosure must survive asset normalization | Offline domain/QA or isolated real PostgreSQL; no paid calls |
| P2C14 rights statuses preserve explicit evidence gates | Offline domain/QA or isolated real PostgreSQL; no paid calls |
| P2C15 public URL alone is not a rights clearance | Offline domain/QA or isolated real PostgreSQL; no paid calls |
| P2C16 voice abstraction has no fixed vendor | Offline domain/QA or isolated real PostgreSQL; no paid calls |
| P2C17 missing voice profile fails before call | Offline domain/QA or isolated real PostgreSQL; no paid calls |
| P2C18 missing voice credential fails before call | Offline domain/QA or isolated real PostgreSQL; no paid calls |
| P2C19 TTS request uses exact approved script text and hash | Offline domain/QA or isolated real PostgreSQL; no paid calls |
| P2C20 voice artifact persists in PostgreSQL after response capture | Offline domain/QA or isolated real PostgreSQL; no paid calls |
| P2C21 WAV QA rejects corrupt silent clipped and implausible audio | Offline domain/QA or isolated real PostgreSQL; no paid calls |
| P2C22 failed validation retains recoverable paid response without raw secrets | Offline domain/QA or isolated real PostgreSQL; no paid calls |
| P2C23 immutable attempts prevent automatic or repeated paid calls | Offline domain/QA or isolated real PostgreSQL; no paid calls |
| P2C24 offline reprocessing changes neither attempts nor provider count | Offline domain/QA or isolated real PostgreSQL; no paid calls |
| P2C25 image boundary rejects mismatched provider capabilities | Offline domain/QA or isolated real PostgreSQL; no paid calls |
| P2C26 unknown provider cost remains unknown with attempt dimensions | Offline domain/QA or isolated real PostgreSQL; no paid calls |
| P2C27 native repeated production reuses immutable artifact identity | Offline domain/QA or isolated real PostgreSQL; no paid calls |
| P2C28 visual asset validation rejects wrong dimensions and nonexistent beat | Offline domain/QA or isolated real PostgreSQL; no paid calls |
| P2C29 content hash detects artifact or version tampering | Offline domain/QA or isolated real PostgreSQL; no paid calls |
| P2C30 manifest preserves all immutable input identities | Offline domain/QA or isolated real PostgreSQL; no paid calls |
| P2C31 missing voice music and timing keep manifest partial | Offline domain/QA or isolated real PostgreSQL; no paid calls |
| P2C32 ready requires cleared visuals and validated voice with no other required inputs | Offline domain/QA or isolated real PostgreSQL; no paid calls |
| P2C33 assets survive store restart | Offline domain/QA or isolated real PostgreSQL; no paid calls |
| P2C34 PostgreSQL plan is idempotent and centrally enters assets pending | Offline domain/QA or isolated real PostgreSQL; no paid calls |
| P2C35 asset reads and writes enforce tenant scope | Offline domain/QA or isolated real PostgreSQL; no paid calls |
| P2C36 Job Detail contains persisted asset fields and UI uses textContent | Offline domain/QA or isolated real PostgreSQL; no paid calls |
| P2C37 publication HOLD survives manifest construction | Offline domain/QA or isolated real PostgreSQL; no paid calls |
| P2C38 no release or assets ready bypass | Offline domain/QA or isolated real PostgreSQL; no paid calls |
| P2C39 renderer reference hashes unchanged | Offline domain/QA or isolated real PostgreSQL; no paid calls |
| P2C40 Make remains untouched by asset production | Offline domain/QA or isolated real PostgreSQL; no paid calls |
| P2CX01 real PNG decode validates dimensions and rejects corrupt bytes | Offline domain/QA or isolated real PostgreSQL; no paid calls |
| P2CX02 source and generated adapters recover actual PNG output offline | Offline domain/QA or isolated real PostgreSQL; no paid calls |
| P2CX03 unsupported video decoder cannot produce accepted asset | Offline domain/QA or isolated real PostgreSQL; no paid calls |
| P2CX04 provided transcript mismatch fails voice QA without rewriting history | Offline domain/QA or isolated real PostgreSQL; no paid calls |
| P2CX05 actual Assets API UI and reserved evidence gate | Offline domain/QA or isolated real PostgreSQL; no paid calls |
| P2CX06 observed classification cannot be routed to invented native imagery | Offline domain/QA or isolated real PostgreSQL; no paid calls |
| P2CX07 forged successful voice QA cannot admit corrupted audio | Offline domain/QA or isolated real PostgreSQL; no paid calls |
| P2CX08 cost ceiling does not treat unknown cost as zero | Offline domain/QA or isolated real PostgreSQL; no paid calls |

| P2CX09 automatic voice routing reports missing authoritative profile before registry selection | Offline negative gate; zero provider calls |


Phase 2C final verification: 387/387 PASS twice (338 existing + 49 new), zero failures/skips; 40/40 required Phase-2C names mapped to actual tests. Controlled V005 readback validated 11 native assets, manifest reconstruction, zero provider attempts, retained v1–v4 artifacts and ASSETS_PENDING. Voice deliberately blocked by VOICE_PROFILE_MISSING; native rights, music/SFX and subtitle timing remain unresolved.


## Optional voice/profile regression coverage

29 new tests; all use deterministic local fixtures, with real isolated PostgreSQL for persistence, immutable revisions, tenant scoping, restart and concurrent approval. No external calls.

| Test | Coverage |
|---|---|
| VP01 voiceless manifest proceeds without any VoiceAsset | test/voice-profiles.test.js |
| VP02 voiceless workflow requires neither profile credential nor provider | test/voice-profiles.test.js |
| VP03 required voice rejects candidate and absent profile before synthesis | test/voice-profiles.test.js |
| VP04 approved compatible business profile becomes usable | test/voice-profiles.test.js |
| VP05 multiple provider-independent profiles per business persist | test/voice-profiles.test.js |
| VP06 historical source creates only an inactive candidate | test/voice-profiles.test.js |
| VP07 retired or superseded profiles cannot fall back to old approval | test/voice-profiles.test.js |
| VP08 missing exact voice reference cannot be approved | test/voice-profiles.test.js |
| VP09 ambiguous approved matches require configuration no random default | test/voice-profiles.test.js |
| VP10 language style use case channel format and content type constrain selection | test/voice-profiles.test.js |
| VP11 unavailable providers excluded from automatic profile selection | test/voice-profiles.test.js |
| VP12 domain and PostgreSQL enforce business scoping | test/voice-profiles.test.js |
| VP13 credentials cannot be persisted in any profile field or nested settings | test/voice-profiles.test.js |
| VP14 profile reference changes create immutable candidate versions | test/voice-profiles.test.js |
| VP15 historical ARKTROV profile remains scoped and unapproved | test/voice-profiles.test.js |
| VP16 readiness never clears publication hold or enables release | test/voice-profiles.test.js |
| VP17 human approval records are versioned and require exact candidate hash | test/voice-profiles.test.js |
| VP18 imported custom and cloned approval require explicit provider authorization and consent | test/voice-profiles.test.js |
| VP19 multiple voice slots retain independent text language and requirements | test/voice-profiles.test.js |
| VP20 original legacy narration remains required without rewriting plan | test/voice-profiles.test.js |
| VP21 concurrent approvals append only one valid revision | test/voice-profiles.test.js |
| VP22 restart retains exact immutable business profiles | test/voice-profiles.test.js |
| VP23 tampering and cross-business profile selection fail | test/voice-profiles.test.js |
| VP24 composition configuration overrides narration presence without global brand defaults | test/voice-profiles.test.js |
| VP25 selected profile must be persisted and current before provider dispatch | test/voice-profiles.test.js |
| VP26 explicit workflow profile cannot be bypassed by a different approved profile | test/voice-profiles.test.js |
| VP27 retired profile preserves human retirement audit and prior approval | test/voice-profiles.test.js |
| VP28 profile foreign key and immutable delete protect business configuration | test/voice-profiles.test.js |
| VP29 unknown voice origin never defaults to catalogue approval | test/voice-profiles.test.js |

Final optional-voice acceptance: 416/416 PASS twice, 0 failures/skips. Includes clean migration/upgrade/repeat for all eight migrations. Build 79 modules, Secret Check and Foundation PASS. Renderer reference hashes and Make originals remain unchanged. Logs are retained locally in .local/voice-profile-final-acceptance.log.


## Controlled voice generation

| Test | Coverage |
|---|---|
| VG01 exactly one POST preserves approved text settings and output with no extra calls | test/voice-generation.test.js; synthetic audio / isolated PostgreSQL / injected transports |
| VG02 missing credential and changed input stop before any call | test/voice-generation.test.js; synthetic audio / isolated PostgreSQL / injected transports |
| VG03 HTTP and network failures never retry or expose response secrets | test/voice-generation.test.js; synthetic audio / isolated PostgreSQL / injected transports |
| VG04 MP3 is decoded and checked with actual format duration hash and silence metrics | test/voice-generation.test.js; synthetic audio / isolated PostgreSQL / injected transports |
| VG05 corrupt wrong-format silent and implausible MP3 fail QA | test/voice-generation.test.js; synthetic audio / isolated PostgreSQL / injected transports |
| VG06 recoverable response precedes decode and survives QA failure in PostgreSQL | test/voice-generation.test.js; synthetic audio / isolated PostgreSQL / injected transports |
| VG07 durable local response remains available when database response persistence fails | test/voice-generation.test.js; synthetic audio / isolated PostgreSQL / injected transports |
| VG08 incomplete transport is captured but cannot become a valid VoiceAsset | test/voice-generation.test.js; synthetic audio / isolated PostgreSQL / injected transports |
| VG09 real MP3 application path persists asset file and immutable partial manifest without release | test/voice-generation.test.js; synthetic audio / isolated PostgreSQL / injected transports |
| VG10 one-time local claim is exclusive and cannot be reused | test/voice-generation.test.js; synthetic audio / isolated PostgreSQL / injected transports |
| VG11 persisted approval and original input identity are checked before call | test/voice-generation.test.js; synthetic audio / isolated PostgreSQL / injected transports |
| VG12 recoverable offline MP3 processing performs no provider call | test/voice-generation.test.js; synthetic audio / isolated PostgreSQL / injected transports |
| VG13 credential echoes in unexpected successful bodies and IDs are never retained | test/voice-generation.test.js; synthetic audio / isolated PostgreSQL / injected transports |
| VG14 local disk failure still preserves the paid response in PostgreSQL before stopping | test/voice-generation.test.js; injected disk failure, real PostgreSQL |

Controlled voice final acceptance: 430/430 PASS twice; 0 failures/skips. Fourteen new cases include real MP3 QA, recovery on independent storage failures, immutable manifest append, one-call exclusion, exact input and secret redaction. Local evidence: .local/voice-generation-release-acceptance.log. Build (84 modules), Secret Check and unchanged renderer/Make regression checks PASS.

## Offline voice manifest consistency

| Test | Evidence |
|---|---|
| VM01 technically valid voice resolves synthesis while every uncleared rights status blocks readiness | test/assets.test.js; actual synthetic WAV byte QA |
| VM02 cleared voice readiness still requires explicit rights evidence and human review | test/assets.test.js; actual synthetic WAV byte QA |
| VM03 absent failed mismatched or corrupt voice cannot resolve synthesis | test/assets.test.js; actual synthetic WAV byte QA |
| VM04 multiple voice slots separate missing audio from pending rights | test/assets.test.js; actual synthetic WAV byte QA |
| VM05 cleared matching voice is selected consistently before a pending alternative | test/assets.test.js; actual synthetic WAV byte QA |
| VM06 legacy voice plan resolves audio without rewriting original plan or rights | test/assets.test.js; actual synthetic WAV byte QA |

VG09 also verifies that the real-codec/injected-transport PostgreSQL path attaches the VoiceAsset, removes VOICE, preserves explicit pending rights and retains the old manifest hash. VP01/VP19 cover optional and multiple voice slots.

Offline consistency acceptance: 436/436 PASS twice; 0 failures/skips. Six new VM regression cases plus strengthened VG09; 98/98 targeted tests PASS. Evidence: .local/voice-manifest-acceptance.log.

## Human voice approval and offline timing

| Test | Evidence |
|---|---|
| VT01 decoded duration replaces estimate with non-destructive sample-accurate trim | test/voice-timing.test.js; synthetic audio, isolated PostgreSQL where applicable |
| VT02 source voice script and creative package remain byte-identical | test/voice-timing.test.js; synthetic audio, isolated PostgreSQL where applicable |
| VT03 all eleven beats and seven narration segments cover the exact effective timeline | test/voice-timing.test.js; synthetic audio, isolated PostgreSQL where applicable |
| VT04 factual links classifications briefs rights disclosures routing and motion remain identical | test/voice-timing.test.js; synthetic audio, isolated PostgreSQL where applicable |
| VT05 subtitles keep exact text but approximate boundaries cannot be final | test/voice-timing.test.js; synthetic audio, isolated PostgreSQL where applicable |
| VT06 hard profile conflict stays explicit and never speeds up audio | test/voice-timing.test.js; synthetic audio, isolated PostgreSQL where applicable |
| VT07 manifest resolves voice independently from rights and invalidates old visual timing readiness | test/voice-timing.test.js; synthetic audio, isolated PostgreSQL where applicable |
| VT08 approval binds exact asset bytes profile script package request and human decision | test/voice-timing.test.js; synthetic audio, isolated PostgreSQL where applicable |
| VT09 invalid trim altered script foreign voice and mismatched approval fail closed | test/voice-timing.test.js; synthetic audio, isolated PostgreSQL where applicable |
| VT10 PostgreSQL atomically persists approval package timing and new manifest with zero provider attempts | test/voice-timing.test.js; synthetic audio, isolated PostgreSQL where applicable |
| VT11 duplicate and concurrent human commands reuse the same immutable result | test/voice-timing.test.js; synthetic audio, isolated PostgreSQL where applicable |
| VT12 restart and future manifest snapshots retain the authoritative timing revision | test/voice-timing.test.js; synthetic audio, isolated PostgreSQL where applicable |
| VT13 immutable database history rejects overwrites and deletion of voice approval and timing package | test/voice-timing.test.js; synthetic audio, isolated PostgreSQL where applicable |
| VT14 foreign asset and failed transaction never leave a partial approval | test/voice-timing.test.js; synthetic audio, isolated PostgreSQL where applicable |

Voice timing acceptance: 450/450 PASS twice, 0 failures/skips. Fourteen new VT cases cover actual-duration timing, trims, eleven-beat preservation, approximate subtitles, hard profile conflicts, immutable approvals, transactional rollback, concurrent idempotency and restart. Local evidence: .local/voice-timing-acceptance.log.

## Optional business music

| Test | Evidence |
|---|---|
| MU01 explicit optional music overrides descriptive intent without changing legacy plans | test/music.test.js; synthetic WAV, isolated PostgreSQL and local browser as applicable |
| MU02 neither music nor voice is a valid ready configuration | test/music.test.js; synthetic WAV, isolated PostgreSQL and local browser as applicable |
| MU03 voice-only workflow does not require music | test/music.test.js; synthetic WAV, isolated PostgreSQL and local browser as applicable |
| MU04 required music stays unresolved without an actual selected track | test/music.test.js; synthetic WAV, isolated PostgreSQL and local browser as applicable |
| MU05 music-only and voice-plus-music selections resolve only the music requirement | test/music.test.js; synthetic WAV, isolated PostgreSQL and local browser as applicable |
| MU06 royalty-free label never substitutes for license evidence or approval | test/music.test.js; synthetic WAV, isolated PostgreSQL and local browser as applicable |
| MU07 commercial social platform territory and expiry restrictions are enforced | test/music.test.js; synthetic WAV, isolated PostgreSQL and local browser as applicable |
| MU08 user selection is explicit and cannot select an incompatible or foreign track | test/music.test.js; synthetic WAV, isolated PostgreSQL and local browser as applicable |
| MU09 ambiguous recommendations never select a random fallback | test/music.test.js; synthetic WAV, isolated PostgreSQL and local browser as applicable |
| MU10 business default and unique favorite resolve compatible choices without bypassing rights | test/music.test.js; synthetic WAV, isolated PostgreSQL and local browser as applicable |
| MU11 all suitability dimensions and narration presence constrain recommendation | test/music.test.js; synthetic WAV, isolated PostgreSQL and local browser as applicable |
| MU12 owned upload requires usage authorization and never gains automatic clearance | test/music.test.js; synthetic WAV, isolated PostgreSQL and local browser as applicable |
| MU13 generic and generated provider provenance stays independent of provider name | test/music.test.js; synthetic WAV, isolated PostgreSQL and local browser as applicable |
| MU14 mix plan retains audibility ducking fade hook SFX and pending final QA without invented loudness | test/music.test.js; synthetic WAV, isolated PostgreSQL and local browser as applicable |
| MU15 latest retired/restricted track versions cannot fall back to historical approvals | test/music.test.js; synthetic WAV, isolated PostgreSQL and local browser as applicable |
| MU16 manifest rejects forged foreign stale or missing music selection bindings | test/music.test.js; synthetic WAV, isolated PostgreSQL and local browser as applicable |
| MU17 automatic recommendation can be disabled independently of required music | test/music.test.js; synthetic WAV, isolated PostgreSQL and local browser as applicable |
| MU18 PostgreSQL upload persists bytes provenance and license evidence as immutable revisions | test/music.test.js; synthetic WAV, isolated PostgreSQL and local browser as applicable |
| MU19 multiple business tracks playlists defaults favorites persist across restart without tenant leaks | test/music.test.js; synthetic WAV, isolated PostgreSQL and local browser as applicable |
| MU20 uploaded audio validation secret handling and fake clearance fail closed | test/music.test.js; synthetic WAV, isolated PostgreSQL and local browser as applicable |
| MU21 actual selected music and mix persist and resolve MUSIC while other blockers remain | test/music.test.js; synthetic WAV, isolated PostgreSQL and local browser as applicable |
| MU22 retirement after attachment makes future manifests unresolved without changing history | test/music.test.js; synthetic WAV, isolated PostgreSQL and local browser as applicable |
| MU23 business foreign keys and tenant restrictions reject forged library operations | test/music.test.js; synthetic WAV, isolated PostgreSQL and local browser as applicable |
| MU24 real HTTP music UI preview preferences and cross-tenant protection work offline | test/music.test.js; synthetic WAV, isolated PostgreSQL and local browser as applicable |
| MU25 business music settings apply to new plans without mutating an existing plan | test/music.test.js; synthetic WAV, isolated PostgreSQL and local browser as applicable |
| MU26 voice-only and silent AudioMixPlans require no fabricated music or loudness | test/music.test.js; synthetic WAV, isolated PostgreSQL and local browser as applicable |
| MU27 changed license terms invalidate previous clearance until renewed explicit human approval | test/music.test.js; synthetic WAV, isolated PostgreSQL and local browser as applicable |

Music acceptance: 477/477 PASS twice on the final unchanged source, 0 failures/skips; 27 music cases plus 450 prior regressions. The recorded final-source passes are music-final-acceptance RUN 2 and the subsequent music-release-acceptance RUN 2, with identical code hash verification. Coverage includes real isolated PostgreSQL upgrade/immutability/restart/tenant constraints, actual synthetic audio decoding, local HTTP/browser controls, changed license clearance invalidation and later voice-binding mix review. Build: 94 modules PASS; Secret Check, renderer reference hashes and Make checks PASS. Migration 009 applied to development; V005 before/after getJob hashes match, no music tracks/selections/mix plans added, MUSIC remains unresolved. Local evidence: .local/music-release-acceptance.log, .local/music-release-run-2.tap, .local/music-final-acceptance.log and .local/v005-music-status.json. No live providers or renderer were executed.


## Native scene specifications

| Test | Evidence |
|---|---|
| NS01 detailed immutable native scene creation | test/native-scenes.test.js; synthetic fixtures, real isolated PostgreSQL where applicable |
| NS02 all eleven beats resolve against their exact current package | test/native-scenes.test.js; synthetic fixtures, real isolated PostgreSQL where applicable |
| NS03 stale production package cannot be admitted | test/native-scenes.test.js; synthetic fixtures, real isolated PostgreSQL where applicable |
| NS04 voice timed bounds and audio identity are preserved | test/native-scenes.test.js; synthetic fixtures, real isolated PostgreSQL where applicable |
| NS05 exact claims evidence and full narration are retained | test/native-scenes.test.js; synthetic fixtures, real isolated PostgreSQL where applicable |
| NS06 blocked and context-only claims cannot enter native scenes | test/native-scenes.test.js; synthetic fixtures, real isolated PostgreSQL where applicable |
| NS07 factual classification cannot be relabeled | test/native-scenes.test.js; synthetic fixtures, real isolated PostgreSQL where applicable |
| NS08 disclosure cannot be dropped or rewritten | test/native-scenes.test.js; synthetic fixtures, real isolated PostgreSQL where applicable |
| NS09 native provenance excludes acquired media | test/native-scenes.test.js; synthetic fixtures, real isolated PostgreSQL where applicable |
| NS10 original scene rights are scoped to specification only | test/native-scenes.test.js; synthetic fixtures, real isolated PostgreSQL where applicable |
| NS11 third party dependencies remain rights review required | test/native-scenes.test.js; synthetic fixtures, real isolated PostgreSQL where applicable |
| NS12 scene composition is mandatory | test/native-scenes.test.js; synthetic fixtures, real isolated PostgreSQL where applicable |
| NS13 concrete motion and animation are mandatory | test/native-scenes.test.js; synthetic fixtures, real isolated PostgreSQL where applicable |
| NS14 exact supported text persists and new factual text is rejected | test/native-scenes.test.js; synthetic fixtures, real isolated PostgreSQL where applicable |
| NS15 mobile safe areas and subtitle exclusion enforced | test/native-scenes.test.js; synthetic fixtures, real isolated PostgreSQL where applicable |
| NS16 diagram semantics are required | test/native-scenes.test.js; synthetic fixtures, real isolated PostgreSQL where applicable |
| NS17 schematic positions cannot become measured coordinates | test/native-scenes.test.js; synthetic fixtures, real isolated PostgreSQL where applicable |
| NS18 candidate count cannot imply complete census | test/native-scenes.test.js; synthetic fixtures, real isolated PostgreSQL where applicable |
| NS19 minimum count cannot silently become exact six | test/native-scenes.test.js; synthetic fixtures, real isolated PostgreSQL where applicable |
| NS20 physical explanation never generalizes to all sources | test/native-scenes.test.js; synthetic fixtures, real isolated PostgreSQL where applicable |
| NS21 conceptual scenes cannot claim to be real observations | test/native-scenes.test.js; synthetic fixtures, real isolated PostgreSQL where applicable |
| NS22 native authoring leaves provider routing unchanged | test/native-scenes.test.js; synthetic fixtures, real isolated PostgreSQL where applicable |
| NS23 native authoring uses zero provider calls | test/native-scenes.test.js; synthetic fixtures, real isolated PostgreSQL where applicable |
| NS24 manifest maps every beat to its new immutable asset | test/native-scenes.test.js; synthetic fixtures, real isolated PostgreSQL where applicable |
| NS25 MUSIC remains unresolved after visual specs | test/native-scenes.test.js; synthetic fixtures, real isolated PostgreSQL where applicable |
| NS26 SFX remains unresolved after visual specs | test/native-scenes.test.js; synthetic fixtures, real isolated PostgreSQL where applicable |
| NS27 SUBTITLE_TIMING remains unresolved after visual specs | test/native-scenes.test.js; synthetic fixtures, real isolated PostgreSQL where applicable |
| NS28 publication HOLD remains true | test/native-scenes.test.js; synthetic fixtures, real isolated PostgreSQL where applicable |
| NS29 renderer and release readiness remain blocked | test/native-scenes.test.js; synthetic fixtures, real isolated PostgreSQL where applicable |
| NS30 foreign business asset cannot be admitted | test/native-scenes.test.js; synthetic fixtures, real isolated PostgreSQL where applicable |
| NS31 PostgreSQL native assets survive restart with complete immutable bindings | test/native-scenes.test.js; synthetic fixtures, real isolated PostgreSQL where applicable |
| NS32 renderer reference hashes remain unchanged | test/native-scenes.test.js; synthetic fixtures, real isolated PostgreSQL where applicable |
| NS33 Make originals remain unchanged | test/native-scenes.test.js; synthetic fixtures, real isolated PostgreSQL where applicable |
| NS34 duplicate concurrent batch reuses artifacts and one manifest | test/native-scenes.test.js; synthetic fixtures, real isolated PostgreSQL where applicable |
| NS35 failed batch rolls back and prior history cannot be overwritten | test/native-scenes.test.js; synthetic fixtures, real isolated PostgreSQL where applicable |
| NS36 PostgreSQL scenes bind to the voice timing revision and reject the old package | test/native-scenes.test.js; synthetic fixtures, real isolated PostgreSQL where applicable |

Native scene acceptance: 513/513 PASS twice (477 existing regressions + NS01–NS36); 0 failures/skips. Real PostgreSQL and synthetic offline fixtures; runtime V005 persisted 11/11 and reconstructed the exact new manifest in a fresh process. Historical evidence/core/voice unchanged. Build 100 modules, Secret Check, renderer hashes and Make checks PASS. Evidence: .local/native-acceptance.log, .local/v005-native-verification.json. Human visual approval remains pending.
