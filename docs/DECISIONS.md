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
