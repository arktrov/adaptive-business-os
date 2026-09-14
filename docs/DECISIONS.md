# Decisions

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
