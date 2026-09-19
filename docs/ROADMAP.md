# Roadmap

## Current Phase 1 acceptance — 2026-09-19

**PHASE 1 ACCEPTANCE = PASS. Phase 1 is complete within the authorized local control-plane scope.**
This section supersedes earlier Phase-0/FAIL and incomplete implementation notes below; those remain dated history.
Evidence/Artifact PostgreSQL writes, tenant-scoped detail API, real UI display and append-only DB protection are implemented.
Both clean-database acceptance runs passed 29/29 tests, covering 24/24 requirements; the real app restart retains all evidence and artifact fields.
PostgreSQL remains canonical, with the existing pg adapter; JSON remains development fallback.
See [test matrix](TEST_MATRIX.md) and [local commands and acceptance scope](PHASE1_RUNBOOK.md).
No Phase 2 is authorized or started.



All phases after 0 require owner authorization. Completion means evidence, not just code.

| Phase | Scope | Exit evidence |
| --- | --- | --- |
| 0 | Read, verify, document, architecture and foundation commit | Source audit, baseline checks, no product implementation |
| 0B | All Make blueprints and relationships | Complete import manifest, scenario map, function-by-function migration matrix |
| 1 | Business Core, conditional onboarding, capability planner | ARKTROV and synthetic second-industry profiles create distinct validated plans; tenant denial tests |
| 2 | Durable jobs, SHORT/LONG/BOTH and legacy renderer adapter | Crash/retry tests, unchanged legacy contract fixtures, isolated artifacts |
| 3 | Technical/full-video QA, repair, independent judge | Failure blocks publication; new render invalidates old approval; max 3 repair cycles |
| 4 | Publishing and analytics ports | Duplicate/timeout reconciliation, release recheck, scheduled metric collection and missing-metric handling |
| 5 | Versioned learning and experiments | Evidence threshold, hard-rule immunity, scope isolation and rollback tests |
| 6 | ARKTROV VIDEO 005 | Idea -> released publication -> analytics -> learning observation, trace and cost ledger |
| 7 | ZHEM through same onboarding | Other industry/products/locations and rules with no core rewrite or ARKTROV data leakage |

V005 acceptance requires explicit production setup, credentials, budget and approval policy; Phase 0 does not authorize a production run. Publishing checkpoints are per available platform metrics, with proposed 1h, 6h, 24h, 72h and 7d timers. Phase 7 is an actual onboarding later, not a guessed business profile now.

Testing progression: unit tests for core/planner/state/gates/rules; integration for tenant repositories and leases; contract tests for adapters; E2E with stub providers before a real authorized production test. Keep Make rollback until every replacement is validated.

## Phase 1 hardening checkpoint — 2026-09-14
PostgreSQL is the canonical production persistence target with versioned migration db/migrations/001_control_plane.sql; JSON remains development/test adapter. State transitions enforce expected state version and immutable artifact constraints. Job detail/history is exposed by the local API/UI. REVIEW_REQUIRED: run PostgreSQL integration tests against a provisioned database and select the concrete TypeScript driver before production deployment.

## PostgreSQL final acceptance pass — 2026-09-14
Docker Compose PostgreSQL is running healthy on localhost:55432. Migration 001 executed successfully; five tables, foreign keys and unique constraints verified. src/persistence-postgres.js provides transactional create/transition/getJob operations with optimistic state versioning and tenant-scoped reads. Integration script verified DB idempotency, audit coupling, concurrency rejection and tenant isolation. The app server still defaults to JSON unless DATABASE_URL wiring is enabled; REVIEW_REQUIRED before production use.

## Phase 1 final closeout — 2026-09-14
DATABASE_URL selects the PostgreSQL adapter; absent value selects JSON development fallback. Docker Compose command: docker compose up -d postgres. Migration: Get-Content db/migrations/001_control_plane.sql -Raw | docker exec -i adaptive-business-os-postgres psql -U abo_dev -d adaptive_business_os. App: $env:DATABASE_URL='postgres://abo_dev:abo_dev_password@localhost:55432/adaptive_business_os'; npm start. PostgreSQL clean-schema migration, adapter transaction/concurrency/idempotency/tenant checks and real app Business/Job/Detail flow passed. REVIEW_REQUIRED remains for full 24-case DB matrix and evidence/artifact API persistence before claiming final acceptance.
