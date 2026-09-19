# Phase 1 executable test matrix

The acceptance command compares this mapping to actual successful TAP test names.
Every run creates a unique empty local PostgreSQL database, applies 001 + 002, runs the complete suite, stops app processes and drops only that test database. Development data is not reset.

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
