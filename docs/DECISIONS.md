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
