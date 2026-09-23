# Decisions

## Phase 2A decisions — 2026-09-20

- P2A-01 ACCEPTED: owner explicitly selects zero-credential, zero-external-call deterministic adapters for this acceptance. Synthetic results are labelled and prohibited on real-content API jobs. Live provider verification remains separate.
- P2A-02 ACCEPTED: retain existing JavaScript/pg modular architecture. Add provider-neutral service/validation and repository ports, not a framework rewrite. ARKTROV source priorities live only in versioned configuration.
- P2A-03 ACCEPTED: immutable starts and terminal outcomes, full canonical snapshots/hashes and normalized claim/source links. A single state helper couples evidence and audit in one transaction. Composite foreign keys preserve the Phase-1 business security boundary.
- P2A-04 ACCEPTED: canonical request hash includes content, business/job, operation, prompt/policy/workflow and adapter configuration. Same key with changed input is a conflict. Explicit retry creates a new audited attempt; per-job DB ownership plus state-version fencing prevents duplicate success and late commits. Interrupted external requests must be reconciled by any later real adapter before retry; never assume external exactly-once behavior.
- P2A-05 ACCEPTED: latest complete research revision feeds Fact Guard; canonical PASS/REVIEW_REQUIRED/REJECT map centrally. REVIEW_REQUIRED/REJECTED remain blocked pending future explicit revision admission. No downstream production is implemented.
- P2A-07 VERIFIED: full local acceptance passes twice (76/76), TD-03 RESOLVED. Live adapter is not connected and is not a requirement of this gate. V005 remains initial without invented topic/evidence.
- P2A-06 ACCEPTED: no V005 topic invention, no Make replay or reconstructed historical bundles. Source/claim qualifiers, evidence, blockers, safe hook and corrections survive in complete canonical results. Renderer contracts remain unchanged.


## Current Phase 1 acceptance — 2026-09-19

**PHASE 1 ACCEPTANCE = PASS. Phase 1 is complete within the authorized local control-plane scope.**
This section supersedes earlier Phase-0/FAIL and incomplete implementation notes below; those remain dated history.
Evidence/Artifact PostgreSQL writes, tenant-scoped detail API, real UI display and append-only DB protection are implemented.
Both clean-database acceptance runs passed 29/29 tests, covering 24/24 requirements; the real app restart retains all evidence and artifact fields.
PostgreSQL remains canonical, with the existing pg adapter; JSON remains development fallback.
See [test matrix](TEST_MATRIX.md) and [local commands and acceptance scope](PHASE1_RUNBOOK.md).
No Phase 2 is authorized or started.



| ID | Decision | Status |
| --- | --- | --- |
| ADR-0001 | Preserve renderer through a compatibility boundary | Accepted foundation direction |
| ADR-0002 | Release binds to latest immutable artifact and all gates | Binding owner requirement |
| ADR-0003 | Tenant-scoped core and versioned business rules | Binding owner requirement |
| ADR-0004 | Modular backend plus separate render worker | Proposed, review with complete static audit and runtime evidence |
| ADR-0005 | Controlled Make migration with parity matrix | Binding owner requirement |
| ADR-0006 | Learning through tested policy promotion | Binding owner requirement |

See [ADRs](adr/README.md).

Additional decisions: reuse the existing empty public ARKTROV repository; keep Git identity local; no provider credentials or operational raw exports in Git; no implementation beyond Phase 0. Source quality document lists final judge among PASS gates but explicitly defines APPROVED/REJECTED. Canonical target requires final_video_judge=APPROVED and six other gates=PASS.

Unresolved: workflow/database products; provider models and limits; production numeric QA thresholds; migration order after runtime boundary validation; handling the workbook's human-approval default for future V005 autonomy.

## Blueprint audit decisions — 2026-09-13

| ID | Decision | Status / basis |
| --- | --- | --- |
| MAKE-01 | The explicitly named 12 exports are the complete set; keep exact bytes locally, hashes in Git, and operational references out of public docs | Accepted owner confirmation; all 81 modules audited |
| MAKE-02 | Observed Make flow supersedes speculative workbook scenario arrows; activation/schedule remains unknown | Evidence-based; [Scenario map](SCENARIO_MAP.md) |
| MAKE-03 | Preserve separate Story, factual, Production, Asset QA and release states; record external transitions instead of inventing automation | Binding preservation direction |
| MAKE-04 | Preserve Fact Guard corrections/guardrails into every package output; validate dropped uncertainty/blocker fields before replacement | Existing safeguard + unresolved loss risk |
| MAKE-05 | Keep Make handoff, RenderJob/Result, Project/subtitle and Production V2 contracts separate; retain external renderer | Accepted foundation direction, no code change |
| MAKE-06 | V004 fixed filters, skipped Shot 1 and content-specific prompt rules require explicit ownership/configuration decisions before V005 | Unresolved; no filter/prompt changed |
| MAKE-07 | 10 and 10B share identical Instagram logic; do not disable either without schedule/run evidence and an explicit single-owner decision | Unresolved; no scenario changed |
| MAKE-08 | No function marked REPLACED; logical service names are plans, not deployment choices | Binding owner scope: READ → VERIFY → PLAN → DOCUMENT |
| MAKE-09 | Runtime evidence validation precedes migration design finalization; no V005 E2E, providers or new workflows in this block | Binding owner scope |

Open decisions include research prompt status reconciliation, retained evidence structure, empty-bundle/row-update semantics, source rights/URL representation, actual ai_video capability, asset readiness ownership and analytics definitions. They must be resolved visibly, with parity tests; this audit does not silently fix or discard current functions.

## Runtime validation decisions — 2026-09-13

These are documentation/target decisions; no legacy behavior changed. Evidence: [runtime validation](LEGACY_RUNTIME_VALIDATION.md).

| ID | Decision | Evidence / status |
| --- | --- | --- |
| RUNTIME-01 | Current code/export describes configuration; retained revision/result describes observed state; never claim historic execution from code alone | Binding audit convention; VERIFIED/INFERRED/UNVERIFIED applied |
| RUNTIME-02 | Withdraw actual missing-Shot1 hypothesis; retain current filter/producer ownership problem | VERIFIED Shot1 in all four compiled projects; intent UNVERIFIED |
| RUNTIME-03 | Preserve raw Needs Review; target RESEARCH_READY→RESEARCHING→RESEARCH_COMPLETE/ON_HOLD/REJECTED requires explicit writer and evidence | VERIFIED old value/current conflict; target proposal, not retroactive rewrite |
| RUNTIME-04 | One state coordinator per workflow aggregate; capability results cannot directly compete on workflow status | Proposed target ownership in STATE_MACHINE; no service built |
| RUNTIME-05 | Treat Fact Guard pass as an existing decision with incomplete replay evidence, not a reproducible review package | VERIFIED absent target Sources and partial notes; require full immutable research/review provenance later |
| RUNTIME-06 | Preserve all four renders as distinct attempts; do not label deliberate V2–V4 keys accidental duplicates | VERIFIED same inputs/different keys; caller intent inferred from scripts |
| RUNTIME-07 | Successful renderer result establishes only RENDERED; pending Asset QA and no final review cannot authorize release | VERIFIED scope gaps, binding owner release invariant retained |
| RUNTIME-08 | Same Asset ID is not a content revision; old/new voice links require immutable version/hash policy | VERIFIED historical link replacement; duplicate provider billing UNVERIFIED |
| RUNTIME-09 | Keep10/10B unchanged; later consolidate IG under one owner only after activation/account/window evidence | VERIFIED duplicated code; overlap/runtime observations UNVERIFIED |
| RUNTIME-10 | Classify every inspected hardcoding before changing it; scope V004 treatments and preserve test fixtures/contracts | VERIFIED catalogue, target disposition only |
| RUNTIME-11 | Request L1–L4 plus one activation overview; do not demand all logs or execute scenarios to manufacture evidence | Accepted work-mode constraint; residual evidence limited |

Remaining unresolved: exact historical02/02B/05 versions and actors, Assets Ready approval criteria/author, any actual unintended duplicate incident, YouTube Data/data result and authenticated account identity, all active schedules, and release policy choices already listed. None is silently resolved by a successful render.

## Final read-only evidence pass — 2026-09-13

FINAL-READ-01: Keep R13–R18 UNVERIFIED; an inaccessible authenticated UI is not evidence of absent executions. FINAL-READ-02: Do not infer Needs Review cause, Shot1 intent, metric values or activation. FINAL-READ-03: Reconfirmed code causes (missing completion writeback, constant voice revision label, no QA PASS writer) are prior VERIFIED findings, not new closures. FINAL-READ-04: LEGACY UNDERSTANDING NOT YET SUFFICIENT for faithful end-to-end implementation; L1/L2 are the only designated blocking evidence. L3/L4/activation and historic duplicate uncertainty stay nonblocking for generic design only with explicit isolation; no parity/switch-over claim. No implementation authorization granted.

See [exact requested artifacts and sufficiency decision](LEGACY_RUNTIME_EVIDENCE.md). VERIFIED/INFERRED/UNVERIFIED remain scoped to code versus historical execution.

## Browser-read Make history (read-only, 2026-09-13)

The authenticated Make browser session exposed history tables without executing or editing anything. Selected run details opened with a persistent `loading...` diagram and embedded frames, so module bundles were not readable in this session. Visible history rows are direct runtime evidence:

| Scenario | Visible history evidence | Status |
| --- | --- | --- |
| 02 – Research Agent | Manual successful runs by Emre Saglam at 13.08.2026 22:21:50 (3 ops/44.3 KB), 15.08.2026 23:26:00 (3/66.6 KB), 16.08.2026 00:11:50 (4/88.8 KB), 16.08.2026 00:18:50 (1/0 B), 21.08.2026 18:10:28 (4/80.4 KB), 21.08.2026 18:25:49 (111/117.7 KB). | VERIFIED run existence/outcomes; Story-specific bundle and causal Needs Review link UNVERIFIED |
| 02B – Fact Guard | Manual successful runs 29.08.2026 22:04:55 (5/38.6 KB) and 22:19:00 (5/35.3 KB); errors 21:43:36 (5/15.4 KB) and 21:37:52 (4/161 B). | VERIFIED visible execution history; exact V004 selection and PASS bundle UNVERIFIED |
| 05 – Short Visual Production | Manual success 30.08.2026 01:32:03 (7/6.4 MB); warning 30.08.2026 01:43:29 (20/20.0 MB). Visible edit at 29.08.2026 23:43:00. | VERIFIED execution history; Shot-1 bundle/asset correlation UNVERIFIED |
| 10 – Platform Analytics | History page showed **No items found**. | VERIFIED no retained history visible in this account view; not proof no run ever existed |

All visible history rows identify activity as manual by Emre Saglam; this is not proof that the same person authored every Sheet mutation. Detail URLs are retained in the browser session but no bundle payload loaded. Do not infer provider outputs or data values from operation counts alone.

## Activation visibility

The editor visibly reported **Inactive** for 02B and 10. The organization dashboard reported **Active scenarios 0/2**. The twelve-scenario list showed the complete named set, but did not expose per-row schedule/activation fields. The twelve-row activation map therefore remains UNKNOWN except for these two directly observed inactive states; schedule type, interval, timezone and last execution remain UNVERIFIED.


## Closure decision — 2026-09-14 (HISTORICAL_EVIDENCE_UNAVAILABLE)

Make now reports **“Log detail doesn't exist”** for the historical Scenario 02 and 02B executions. The retained run metadata remains known, but the historical Research and Fact Guard module bundles are permanently unavailable because they are outside Make's execution-log retention. This is **HISTORICAL_EVIDENCE_UNAVAILABLE**, not an implementation blocker.

Available sources are the imported blueprints, current Google Sheets and Drive artifacts, and current contracts. Missing historical bundles must never be reconstructed, guessed, or invented. The new app must persist durable execution evidence itself: inputs, outputs, agent decisions, claims, sources, evidence, Fact Guard results, corrections, guardrails, QA/repair decisions, provider request/response metadata, state transitions, timestamps, versions, hashes, publish results, and analytics snapshots.

**LEGACY UNDERSTANDING SUFFICIENT FOR APP IMPLEMENTATION.** Known historical gaps exist but do not block implementation. No Phase-1 implementation is started by this documentation change.

## Phase 1 hardening checkpoint — 2026-09-14
PostgreSQL is the canonical production persistence target with versioned migration db/migrations/001_control_plane.sql; JSON remains development/test adapter. State transitions enforce expected state version and immutable artifact constraints. Job detail/history is exposed by the local API/UI. REVIEW_REQUIRED: run PostgreSQL integration tests against a provisioned database and select the concrete TypeScript driver before production deployment.

## PostgreSQL final acceptance pass — 2026-09-14
Docker Compose PostgreSQL is running healthy on localhost:55432. Migration 001 executed successfully; five tables, foreign keys and unique constraints verified. src/persistence-postgres.js provides transactional create/transition/getJob operations with optimistic state versioning and tenant-scoped reads. Integration script verified DB idempotency, audit coupling, concurrency rejection and tenant isolation. The app server still defaults to JSON unless DATABASE_URL wiring is enabled; REVIEW_REQUIRED before production use.

## Phase 1 final closeout — 2026-09-14
DATABASE_URL selects the PostgreSQL adapter; absent value selects JSON development fallback. Docker Compose command: docker compose up -d postgres. Migration: Get-Content db/migrations/001_control_plane.sql -Raw | docker exec -i adaptive-business-os-postgres psql -U abo_dev -d adaptive_business_os. App: $env:DATABASE_URL='postgres://abo_dev:abo_dev_password@localhost:55432/adaptive_business_os'; npm start. PostgreSQL clean-schema migration, adapter transaction/concurrency/idempotency/tenant checks and real app Business/Job/Detail flow passed. REVIEW_REQUIRED remains for full 24-case DB matrix and evidence/artifact API persistence before claiming final acceptance.

## OpenAI adapter preparation decisions — 2026-09-20

- OPENAI-PREP-01: obey explicit owner scope to implement/test without creating or using a real credential. Process-only credential access; local fixture transports in every test.
- OPENAI-PREP-02: preserve provider-neutral contracts and existing local HTTP/UI composition. OpenAI is available only through an isolated prepared-connection boundary, with independent dispatch permission and an exact request hash.
- OPENAI-PREP-03: one Responses HTTP request, required live web search, strict canonical schema, no retries or automatic continuation. Validate consulted-source provenance and fail closed; do not equate model output with verified source truth.
- OPENAI-PREP-04: keep original intake evidence immutable. Execute only against the pinned workflow/policy/input snapshot; reject input/config changes and previous OpenAI attempts. A failed/ambiguous live attempt requires reconciliation before further authorization.
- OPENAI-PREP-05: token/tool usage is retained; unavailable cost stays null. No price or account-access assumption. Renderer/Make and Phase 2B remain untouched.


## 2026-09-20 — Offline diagnostics and shutdown repair

Keep V005 attempts 1 and 2 immutable FAILED records; lost response details are unavailable, not inferred. Persist safe typed adapter failure diagnostics and usage before parser validation; do not expose raw responses, headers, private reasoning or exception text. Keep the canonical ResearchResult and the request hash unchanged; record parser revision separately. Select final assistant output by type/phase. Close PostgreSQL client sockets before database cleanup; do not mask errors with a blanket handler. No live retry is authorized by this repair. See [diagnosis](V005_OFFLINE_FAILURE_DIAGNOSIS.md).


## 2026-09-20 — V005 research budget profile

Use the explicit arktrov-deep-research/1.0 provider profile: 16000 output tokens, medium reasoning, unchanged gpt-5.6-sol and concise complete evidence instructions. Do not change domain/policy/schema or accept incomplete output. Provider config changes must alter the execution hash; same-key conflict protection remains intact. REVIEW_REQUIRED before attempt 4: versioned execution-configuration continuation with a new immutable request revision and preserved attempt lineage. No silent key switch or historical rewrites. See [budget preparation](V005_TOKEN_BUDGET.md).


## 2026-09-20 — Explicit versioned research retry lineage

Owner authorized the previously REVIEW_REQUIRED continuation. Adopt one immutable logical Research lineage per tenant/ContentJob, with a separate immutable execution revision per request identity and attempts numbered monotonically across revisions. Keep canonical_input_hash meaning the complete request hash and all same-key conflict checks. Additive migration 004 maps historical rows without rewriting them. New revision requires the latest FAILED predecessor, unchanged canonical business input, explicit retry and audited reason; concurrent duplicates fail stale. No new public endpoint, provider call or Fact Guard. See [lineage design and verified V005 preparation](RESEARCH_RETRY_LINEAGE.md).

## V005 tool budget — 2026-09-20
Owner-approved offline profile revision 1.1 raises ARKTROV web-tool budget from 4 to 8. Preserve generic default 4 and request/local validation alignment; explicit TOOL_BUDGET_EXCEEDED diagnostics. Historical response emitted five items; provider-side cause remains UNKNOWN, not a reconstructed fact. Attempt 4 remains FAILED. Prepare attempt 5 / execution revision 3 only, with new hash/key and identical business input. See [evidence and decision](V005_WEB_SEARCH_BUDGET.md). No live authorization in this step.

## Correct completed-call budget semantics — 2026-09-20
Replace raw web-search item count with completed item count for budget enforcement; extra unfinished items are diagnostic only. Keep profile 1.1 / limit 8 and wire request identity unchanged. Persist adapter processing/parser/validator versions separately. Attempt 5 remains immutable FAILED; missing final output and ninth status cannot be reconstructed. See [semantics correction](V005_TOOL_BUDGET_SEMANTICS.md). No live call authorized in this task.

## Durable paid-response recovery — 2026-09-20
Capture sanitized OpenAI response as immutable tenant/job/run-scoped provider_response evidence before canonical parsing. Separate committed write plus hash-verified readback gates processing. Keep provider-private sanitization behind the adapter and expose generic persistence callback; offline reprocessing is verdict-only and never rewrites history or calls a provider. Preserve profile/request identity. See [recovery contract](PROVIDER_RESPONSE_RECOVERY.md). No live call authorized in this task.

## Evidence identity and paid-response recovery — 2026-09-20
Canonical relation identity becomes (claim, source, support type, evidence reference); pair-only uniqueness incorrectly rejected distinct supporting/contextual evidence in Attempt 6. Preserve all source statements, no lossy merge. Add immutable offline processing revisions, separate from provider attempts; central completion requires fully persisted recovery proof. Existing Fact Guard selection of recovered results remains a separate explicit follow-up.
See [Attempt-6 recovery](V005_ATTEMPT_6_RECOVERY.md).

## Offline Fact Guard for recovered V005 research

Use a real deterministic evidence-rules adapter, never the preset LocalFactGuardProvider fixture, for human-approved persisted research. No network or external provider is involved. Keep original failed attempts immutable and link Fact Guard separately to the recovered processing revision. Human approval permits this review only; scientific uncertainty and publication HOLD persist. Detailed quality/brand policy content absent from the input is a review issue, not guessed rules. Processing version: fact-guard-evidence/1.0.

V005 execution result: 8bb5cdec-5d1d-48ed-a3a7-9ddbc1f87f16 / REVIEW_REQUIRED. Rules-only evidence review, not independent source verification. Publication HOLD retained. Local report serialization rejected a view object containing non-JSON values after the committed run; read-only verification of the persisted request/output/metadata succeeded. No repeat invocation was made.

## Human Fact Guard review and source policy binding

Authoritative sources exist: docs/QUALITY_GATES.md (binding canonical target policy), docs/sources/ARKTROV_APP_QUALITY_GATES.md section 9 and canonical ARKTROV overlay (brand), docs/adr/0002-artifact-release.md (exact-artifact release), src/config/research.js (arktrov-research/1.0). Copy exact source content through src/config/content-policies.js; never infer rules from empty business.brand or placeholder version identifiers. Markdown sources have no semantic policy version; pin content-addressed source-sha256 versions, exact source references, whole-file SHA256 and selected text. Existing job arktrov-1.0 / quality-1.0 labels remain historical and are not falsely asserted to identify these newly bound contents.

HumanFactGuardReview records immutable policy snapshots, HumanFactGuardDecision and binding audit atomically in the existing evidence registry. Decisions reference previous run/request/output hashes, recovered research hash, policy hashes and versions. Only BLOCKED / CONTEXT_ONLY are admitted; publication HOLD cannot be cleared. REVIEW_REQUIRED -> FACT_GUARD_PENDING requires matching current-run human evidence through the central state machine. New run uses the normal ResearchService. No historical run is overwritten.

Processing fact-guard-evidence/1.1 supports separate context_only_claims. Accepted exclusions resolve their requested corrections but do not widen factual approvals. The existing conservative PASS contract requires the full research claim set; exclusions/context and persisted uncertainties can therefore retain REVIEW_REQUIRED even with zero unresolved correction entries. No automatic weakening of that contract or assumption that snapshot binding proves final video/brand QA. Publication release stays independently gated. No Phase 2B.

Executed V005 human review: 5fb58779-b3b6-4187-ac74-d233726b1426; new Fact Guard 849a00e1-532c-4472-9f59-b3a607578151 / REVIEW_REQUIRED. Brand content hash d3514bca13766a10bb376b9a044ac616bb92b7405b1c1cb1fbe7ee08bed64aab; quality content hash 705ddfb4182becef43a15a091cf5ac43716ad81bd7e2ac13590e46d88801581c. R1–R9 instructions are reflected in the restricted scope/HOLD/snapshots, leaving zero correction entries. Existing conservative PASS semantics remain a separate restriction. No new research is required or started to rehabilitate excluded claims.

## Explicit owner-approved Fact Guard scope semantics 2.0

Previous REVIEW_REQUIRED predicate was blocked.length || contextOnly.length || corrections.length || research.contradictions.length || research.uncertainties.length. The domain also required approved count equal total research claims and zero blocked. This conflated research universe with production scope. Owner explicitly authorizes replacing that condition with a complete, constrained approved subset. Historical outputs remain immutable. Prior human decisions may bind a subsequent reviewed descendant only if its immutable request references the same decision and remains REVIEW_REQUIRED; same research/policy hashes are verified. No special V005 claim IDs in domain/provider code. Empty factual scope remains REVIEW_REQUIRED, not an invented safe scope; severe rejection retains REJECT. No release-gate changes.

V005 contract-2.0 evaluation: 6957ce6f-8298-4547-81d6-353f519694d1 / PASS. Same 13 approved / 4 blocked / 3 context-only dispositions, scope hash 1c3547db0a3390e2669a817862077c14cbde7c1c3ded6dcea381fbeae1f7e6f4. Persisted outcome, policy/human references and central transition verified on reconnect; both historical Fact Guard runs unchanged. Publication HOLD remains TRUE. No downstream generation or new provider call.

## ADR — Phase 2B conservative factual realization and planning boundary

Decision: retain the existing native JavaScript/PostgreSQL/advisory-lock architecture and append-only persistence. Factual script text is restricted to intact admitted statements plus exact qualifiers; selected context is explicitly a limitation. Arbitrary paraphrases are REVIEW_REQUIRED, never certified by word overlap, a provider's claim ID manifest or an LLM self-check. This is a safe initial capability limit, not a claim that deterministic code can prove general prose semantics. Human creative review remains required.

Provider input is reconstructed only from the latest verified Fact Guard scope and policy evidence. Business/profile configuration controls style, duration and format; no ARKTROV claim IDs or science branches in generic code. V005 uses English 45–60 seconds, the owner's explicit choice. Complete qualifiers can limit how many claims fit; do not truncate them.

Script/package success is atomic; capture of paid response is independently durable before parsing. Failed executions require an explicit subsequent revision, no automatic provider retry. No new release authority and no renderer/Make contract changes. Controlled live call remains contingent on technical acceptance and a hash-pinned one-call permit. Do not commit/push before the owner-requested controlled result.

## Controlled V005 runtime verification — 2026-09-21

Execution 68818bfb-5a58-4029-81ab-5ddcd5cfc364 completed through the normal ScriptService in one authorized live call. HTTP 200/completed; validated immutable Script and Production Package persisted; state PRODUCTION_PACKAGE_READY. Independent readback and offline reprocessing PASS. Input/output/package/response hashes and five planned-asset rows verified. Research/Fact Guard history unchanged. Publication HOLD TRUE. Human creative review remains required; literal factual validation does not certify creative quality. No further provider or production-stage call. Existing two full 285-test runs remain valid: implementation hash unchanged.

## ADR — Versioned narration/visual-beat separation and human revision (2026-09-21)

V1 contracts and reconstruction remain unchanged. Script input 2.0 explicitly requires a tenant-scoped immutable human revision directive, prior execution reference, identical Fact Guard scope and policy hashes. The directive is reserved from generic HTTP evidence creation. Existing append-only evidence storage and advisory job locking are retained; no new persistence architecture or direct state write.

Narration segments and visual beats have separate identities. Beats are ordered by narration, cover each segment duration exactly to millisecond precision, and carry exactly that segment's admitted claim IDs. Packages carry one narration track and multiple planned visual beats; narration is not duplicated per shot. Each beat has a concrete composition brief, classification, motion, transition, source, rights, disclosure and generation eligibility. Planned assets remain NOT_CLEARED; execution_authorized remains false. Actual visual fidelity, licensing and free-text brief semantics require later human/asset QA: a claim ID or eight-word brief is not scientific verification. Mandatory qualifiers and context-only usage propagate independently into the package. No provider is selected for visual generation.

The 7–10 beat target and preferred 135–150 spoken words belong to the ARKTROV profile, not the generic domain. Exact canonical text/qualifier protection is intentionally preserved. The requested simpler paraphrases are creative direction, not automatically approved factual realizations. If that constraint prevents the desired narration, a separately approved realization is needed; do not silently weaken validation. Technical preparation is not creative approval or permission for a live call.

Human directive f9008e47-d516-4681-99ca-9482cdd833c5 binds V005 script v1 d30d428c-df95-447d-8c7f-53eb90c1a5c7 and package v1 658e30df-3898-43e9-8216-228d02fbcf3c. FACTUAL SAFETY APPROVED; CREATIVE SCRIPT REVIEW_REQUIRED; PRODUCTION PACKAGE REVIEW_REQUIRED. The exact owner feedback is persisted. Job state remains PRODUCTION_PACKAGE_READY as historical technical status; this is not human creative approval. Publication HOLD TRUE. No v2 execution, live permit, research or Phase 2C work.

## ADR — Claim usage authority and offline Script processing (2026-09-21)

The v2 live failure INVALID_CLAIM_USAGE was a false negative: canonical qualifiers were present, but the provider labeled three qualified claims DIRECT. The old 2.0 validator compared that declaration before validating prose. It never permitted a downgrade, but incorrectly rejected safe text on metadata mismatch.

New explicit processing contract script-production-input/2.1 derives usage from Fact Guard scope and actual text. Provider usage labels are retained only in immutable resolution audit. Blocked claims always fail; context requires the configured limitation label plus authoritative statement/qualifier. No arbitrary semantic equivalence heuristic is introduced. Only Unicode NFC and whitespace normalization are permitted; otherwise exact persisted statement and qualifier are required. Optional qualifier insertion is a preparation-only helper requiring human review, never automatic narration rewriting or an LLM call. This execution needs no text repair.

Historical inputs and processing contracts 1.0/2.0 are preserved for reproducible old decisions. Recovery reads the same hash-verified paid response, applies 2.1 locally, then revalidates all contracts. An append-only script_processing_revision Evidence record binds source execution/input/response hashes, processing version, exact usage changes and new Script/Package IDs. Script/Package rows retain the original execution FK and explicitly identify the new processing revision; no additional provider execution or rewritten outcome. Existing append-only evidence, tenant scope and transaction/advisory locks are reused; no new migration.

A guarded SCRIPT_REVIEW_REQUIRED -> SCRIPT_APPROVED transition is available only with independently reconstructed, persisted recovery evidence and output hashes. Normal failed executions still cannot pass the gate. Recovery evidence, drafts, packages, asset requirements and both central transitions commit atomically. The generic evidence HTTP route reserves the recovery type. Publication HOLD TRUE and creative human review remain mandatory.

Creative inspection of the actual stored response: 149 words / 54.184 seconds / nine visual beats. No C4 photon-ratio definition or Type Ia ending. M31 subset restrictions and heterogeneous physical interpretations retained. The curiosity-first hook and mystery-before-methodology direction are not fully met: the hook is still academic, C7 remains technical, and the observational-label explanation arrives at the end. Do not claim creative approval; recovery makes the factual draft available for human review without rewriting its story.

Offline V005 recovery verified: processing revision 2c9acdcf-d0cc-45bd-a200-a4d2369b2cb1 references paid execution b39bc24d-1b3c-40e1-a230-464d1846a4bc, whose REVIEW_REQUIRED outcome remains unchanged. Script v2 6f0e9db1-ad8b-4b39-a4b6-c9b5839885bc and Package v2 8ca06398-576e-4ffb-b7a6-5100f2b6fba2 persist 149 words, 54.184 seconds and nine visual beats. C2/C7/C10 qualifiers VERBATIM; no textual repair. Processing 2.1 validation PASS; Publication HOLD TRUE. Voiceover, visual briefs, v1 artifacts, source response/execution, Research, Fact Guard and prior Evidence verified unchanged. Zero new provider calls. State PRODUCTION_PACKAGE_READY is technical readiness only; creative approval remains HUMAN_REVIEW_REQUIRED.

316/316 tests PASS twice: 301 existing + 15 new, no failures/skips. Run 1 281.005s; Run 2 283.773s. Real isolated PostgreSQL and blocked external transports; 24/24 Phase 1, 25/25 Phase 2A, 36/36 Phase 2B requirements mapped. Build 65 modules PASS. Secret Check PASS. Renderer and Make unchanged. No Phase 2C.

## ADR — ApprovedClaimRealization catalog preparation

Input contract 2.2 adds a generic, exact-match realization catalog. Canonical statements remain accepted; noncanonical prose requires one matching APPROVED record bound to business, claim hash, scope hash, language, style and the complete authoritative qualifier references. qualifier_semantics_preserved=true is an explicit human approval attestation, not a claim of automated semantic reasoning. Provider self-labels are not authority. Blocked and context-only restrictions remain intact; context still requires the configured limitation framing.

Records contain realization_id, business_id, claim_id, language, style_profile, realization_text, required_qualifier_refs, qualifier_semantics_preserved, allowed_usage_mode, source_claim_hash, fact_guard_scope_hash, version, status, content_hash, created_at, approved_at, approved_by and previous_content_hash. PROPOSED -> APPROVED -> RETIRED creates immutable versions with previous-hash linkage. Changed wording requires a new realization identity. Generic append-only Evidence storage is reused behind the trusted human-review application boundary; no public approval endpoint. The HTTP evidence route reserves claim_realization. Source/scope bindings are verified against persisted Fact Guard PASS. Current catalog is checked again by central state guards so retirement invalidates stale prepared inputs before provider execution.

Historical contracts 1.0/2.0/2.1 are unchanged. New contract 2.2 is opt-in and is not activated for a live V005 run in this step. Draft claim usage carries realization ID/version/hash references when an approved variant is used. No arbitrary paraphrase similarity rule, LLM judge, provider call or production-state mutation is added.

V005 has only twelve local PROPOSED review entries for C2/C6/C7/C10. Approval fields are null; qualifier_semantics_preserved is null pending human review. No catalog entries were inserted into the development/runtime database. Proposal text and operational source identifiers remain in ignored local review exports. No Script v3 or Package v3 is created. The user must approve exact variants before they can be admitted.


### Human realization approval — V005
Explicit human authorization 91daf689-d8f5-49c1-aecd-44370991caf0 approves only v005-c2-spoken-c, v005-c6-spoken-b, v005-c7-spoken-b and v005-c10-spoken-b. PostgreSQL stores immutable PROPOSED v1 and APPROVED v2 records, approved_by=human, timestamps, source/scope/qualifier bindings and hashes. Decision evidence cdf2f5c6-e704-4de2-a372-0234cd38f228 preserves the authorization and links the four complete approval records. Eight other variants remain PROPOSED. C2 population-census simplification is accepted for this exact text only. Original C6 apostrophe typography remains unchanged. No general paraphrase permission, publication approval or provider execution is implied. A separate opt-in scoped-script/2.2 prompt permits canonical text or exact APPROVED realizations; historical prompts are unchanged.


### Phase 2B final human selection and state semantics
Use immutable human_production_approval evidence to bind the selected Script/Package hashes, Fact Guard scope, realization versions, Brand/Quality snapshots, human actor and timestamp. The authoritative selection is exposed only for the latest successful script execution. Generic evidence HTTP writes cannot forge this reserved type. Approval is idempotent for the same identity and does not mutate artifacts. PRODUCTION_PACKAGE_READY already represents the completed planning stage; approval adds the human gate without inventing a state or entering ASSET_PLANNING. Publication HOLD and release denial remain independent.


## Phase 2C asset foundation
Generic asset contracts, registry routing and immutable PostgreSQL evidence reuse the modular application. See [Asset contract](ASSET_CONTRACT.md), [Router](PROVIDER_ROUTER.md), [Rights](ASSET_RIGHTS_PROVENANCE.md) and [Manifest](PRODUCTION_ASSET_MANIFEST.md). Native/source/generated capability paths are separated; no business/provider switch exists in the domain. Asset state transitions require stored plan/manifest proof. Publication HOLD remains independent; no renderer/publishing implementation. PCM16 WAV and PNG are the implemented byte decoders; other vendor codecs require adapters. Voice profile missing is a live-production blocker, not a reason to invent a voice.

Human confirmation: no authoritative ARKTROV voice profile currently exists. Historical ElevenLabs v3 is not approved for this system; voice ID undocumented. VOICE_PROFILE_MISSING is mandatory. No voice key is requested or used, and no live voice is generated in this run.


## Optional business voice profiles

See [Business voice profiles](BUSINESS_VOICE_PROFILES.md). Composition-driven zero/one/multiple voice requirements replace the mandatory-voice assumption for new plans. Business-scoped immutable profile revisions and explicit human approval are required for synthesis; historical values are candidates only. No provider defaults, credentials, live calls or historical artifact rewrites. V005 retains its narration requirement and VOICE_PROFILE_MISSING blocker.
