# Decisions

| ID | Decision | Status |
| --- | --- | --- |
| ADR-0001 | Preserve renderer through a compatibility boundary | Accepted foundation direction |
| ADR-0002 | Release binds to latest immutable artifact and all gates | Binding owner requirement |
| ADR-0003 | Tenant-scoped core and versioned business rules | Binding owner requirement |
| ADR-0004 | Modular backend plus separate render worker | Proposed, review after blueprint intake |
| ADR-0005 | Controlled Make migration with parity matrix | Binding owner requirement |
| ADR-0006 | Learning through tested policy promotion | Binding owner requirement |

See [ADRs](adr/README.md).

Additional decisions: reuse the existing empty public ARKTROV repository; keep Git identity local; no provider credentials or operational raw exports in Git; no implementation beyond Phase 0. Source quality document lists final judge among PASS gates but explicitly defines APPROVED/REJECTED. Canonical target requires final_video_judge=APPROVED and six other gates=PASS.

Unresolved: workflow/database products; provider models and limits; production numeric QA thresholds; migration order after all blueprints; handling the workbook's human-approval default for future V005 autonomy.
