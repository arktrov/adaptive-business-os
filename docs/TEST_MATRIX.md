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
