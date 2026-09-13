# Make migration

Status: **awaiting all blueprints; no scenario fully audited and no replacement validated**.

Make blueprints are legacy source of truth for scenario behavior, not the target design. READ -> UNDERSTAND -> EXTRACT BUSINESS LOGIC -> PRESERVE VALID CONTRACTS -> REDESIGN -> TEST AGAINST OLD BEHAVIOR.

## Intake

Use [import directory](../legacy/make-blueprints/README.md). Preserve original files locally, compute checksums, record scenario name/export time/version and relationships. Raw files stay ignored. Remove secrets, webhook tokens, account-specific credentials and operational personal data from any reviewed copy before committing. Sanitization must preserve filters, mappings, routing and error semantics; record substitutions.

Do not migrate on the first uploaded blueprint. Read every supplied blueprint, then require a declared complete set before finalizing the cross-scenario plan.

For each scenario document purpose, trigger/schedule, inputs/outputs, schemas, API endpoints/methods, providers, credentials references only, error routes, retries/backoff, status transitions, Sheets ranges/column mappings, Drive paths/IDs, idempotency, special cases, downstream dependencies, reusable logic and replacement. Unknown fields remain explicitly unverified.

## Initial migration matrix

| OLD FUNCTION | NEW FUNCTION | STATUS | TEST | NOTES |
| --- | --- | --- | --- | --- |
| Discovery submit/results | capability + durable async jobs | INVENTORIED_ONLY | Blueprint-derived parity fixtures pending | System Map names 00A/00B |
| Story evaluation/research/Fact Guard | content/research gates | INVENTORIED_ONLY | Claims, qualifiers and rejection fixtures pending | Never skip required qualifiers |
| Script/voice/assets | modular production stages | INVENTORIED_ONLY | Provider and payload fixtures pending | Actual provider configuration awaits exports |
| Make manifest -> RenderJob | compatibility adapter | SOURCE_VERIFIED_NOT_MIGRATED | Existing handoff suite passes | Preserve embedded JSON and character timings |
| Production V2 -> Project v1 | renderer adapter | SOURCE_VERIFIED_NOT_MIGRATED | Schema/compiler fixture expansion pending | Vertical and duration limits preserved |
| Drive queue claim/resume/result | durable orchestration | SOURCE_VERIFIED_NOT_MIGRATED | Concurrency/crash/duplicate scenarios pending | Local rename is not distributed safety |
| Millisecond timeline/subtitles | shared renderer contracts | SOURCE_VERIFIED_NOT_MIGRATED | Existing conversion tests pass | No new replacement built |
| QA + approval | artifact-bound mandatory gates | PLANNED | Negative release tests pending | Render success is insufficient |
| Platform publishing | channel adapters | INVENTORIED_ONLY | Duplicate and ambiguous-submit reconciliation pending | No verified live scenario blueprint |
| Analytics | normalized observations | INVENTORIED_ONLY | Definitions/checkpoints/unsupported metrics pending | 10 and 10B named in System Map |
| Learning | versioned policy experiments | PLANNED | Isolation/promotion/rollback tests pending | No autonomous code modification |

Status REPLACED requires a linked implementation revision, passing test evidence, observed parity and rollback plan. Existing tests prove only the checked legacy cases, not new-system equivalence.

## Cutover

Freeze baseline fixtures and map every function, including errors and exceptions. Shadow execution must suppress publishing and other duplicate side effects. Compare business outcomes, state, payloads and cost. Switch one approved capability with an explicit single-writer boundary. Retain Make until replacement passes. Rollback restores routing, reconciles in-flight external calls and keeps completed publication IDs; it must not replay publishing blindly.

No scenario count is inferred from the workbook. Full matrix and migration sequence remain pending exports.
