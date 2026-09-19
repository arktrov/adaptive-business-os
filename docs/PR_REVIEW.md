# Phase 1 PR review — 2026-09-19

PR #1: codex/phase-1-control-plane -> main. Owner authorized creating main at the existing Foundation commit. No merge performed.

## Findings

| Severity | Finding | Disposition |
| --- | --- | --- |
| HIGH | Central transition graph allowed NEEDS_REVIEW / MULTIMODAL_QA_PENDING -> RELEASE_APPROVED and onward to publication without gate evidence. | Fixed: release/publication targets fail closed until their authorized gate implementation exists. No QA/provider feature added. Regression test in core.test.js. |
| HIGH | Local API accepted cross-origin simple POST requests; loopback binding alone does not prevent a malicious webpage mutating jobs. Host was unchecked for DNS rebinding. | Fixed: exact local Host and Origin checks, JSON-only POST; real HTTP regression tests. |
| HIGH | Compose exposed PostgreSQL on all interfaces with a documented development password and database-owner account. | Fixed: port bound only to 127.0.0.1. |
| MEDIUM | JSON fallback does not provide PostgreSQL transaction/concurrency semantics; fixed temporary filename may collide under concurrent writes, and state can remain in memory after failed save. | Open, development-only. Use PostgreSQL for all acceptance and durable/concurrent operation; do not claim adapter equivalence. Fixing persistence semantics would exceed a low-risk review patch. |
| MEDIUM | Migration runner adopts a manual 001 baseline by content_jobs existence, without full schema fingerprint/checksum validation. | Open. Clean migrations verified; adoption of arbitrary preexisting schemas is not approved. Harden the legacy-adoption path before other environments. |
| MEDIUM | A reused job idempotency key with changed input returns the original job without payload-conflict detection. Unique constraints prevent duplicate jobs, but callers can overlook changed intent. | Open. Do not reuse a key for different input. A future request hash/conflict rule needs explicit compatibility treatment. |
| LOW | Structured logs omit several planned correlation/error fields; API errors can return raw database error messages. | Open. Local operator tool only; sanitize/complete observability before external deployment. |
| INFO | No formal shared persistence interface; adapter orchestration branches on usePg. Generic domain remains free of pg imports. ARKTROV seed is explicit startup configuration; generic JSON job default brand version was corrected to unconfigured. | No new architecture introduced. |
| INFO | Business context is configured by the trusted local process; there is no public multi-user authentication. | Documented local-only scope; not approval for public hosting. |

Counts at final gate: CRITICAL 0; HIGH 0 open (3 fixed); MEDIUM 3 open; LOW 1 open.

## Complete diff assessment

Reviewed application/domain/adapter, both SQL migrations, Compose and env handling, UI, tests, acceptance/migration/check scripts, package lock and changed documentation relative to Foundation/main.
SQL data values are parameterized; dynamic SQL in tests uses generated UUID database names.
Business/job composite foreign keys prevent cross-business Evidence/Artifact linkage; reads and writes resolve scoped jobs.
Artifact allocation uses transaction advisory locking; job transitions use FOR UPDATE + expected version + audit insert in one transaction.
DB triggers reject artifact/evidence UPDATE/DELETE. Foreign keys use default NO ACTION; no silent cascade deletion of persisted evidence.
There are no provider, Make, renderer or publication calls. Domain remains database-independent.
The local application DB role currently owns its schema; least-privilege public deployment is outside this PR's localhost scope.
Only the adapter performs the application SQL state update; the JSON domain has its own development implementation.
UI uses textContent for persisted values and does not access PostgreSQL directly.
No arbitrary-input SQL interpolation or committed live secrets found. Scan covers known token/private-key patterns, not a proof that all conceivable secrets can be detected.

## Test quality and evidence

Baseline 29 cases existed in two files. Added two targeted security tests: now **31/31 PASS**, twice, with **24/24 requirements** matched to actual TAP names.
Each run creates and drops its own clean PostgreSQL database; no JSON mocks for DB assertions.
The audit rollback case injects an audit insert error and checks both job and audit remained unchanged.
Concurrency checks one success plus one stale rejection. DB idempotency tests exercise a real unique violation.
Immutable tests attempt UPDATE/DELETE and duplicate inserts. Cross-business tests exercise composite FK violations.
Real Node process stop/start compares the entire Job Detail response including evidence, artifacts and versions.
Real Edge UI case checks persisted content, not a static placeholder.
The original four domain tests are narrower than PostgreSQL acceptance; no always-pass case was found.
The clean migration is executed in the suite setup and repeat migration is checked in R20.
Lint/native-JS syntax/build, Foundation check and known-secret scan pass.
All 31 renderer source hashes match docs/SOURCE_HASHES.tsv.

**MERGE_READY = YES for the documented Phase 1 local-control-plane scope.** No automatic merge or Phase 2 authorization.
