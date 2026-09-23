# Roadmap

## Phase 2A scope — 2026-09-20

Research, persistent evidence and Fact Guard are implemented with local deterministic adapters; final repeated acceptance is PASS (76/76 twice). Live provider integration, V005 topic selection and one controlled external Research run remain a separate next block. Script/media/render/publishing/analytics/learning remain out of scope. See [runbook](PHASE2A_RUNBOOK.md).

TD-03 implementation: canonical input conflict checks now cover both job adapters and the PostgreSQL operation repository; RESOLVED after both complete 76/76 acceptance runs. TD-01, TD-02 and TD-04 remain open; no broad refactor was undertaken. A future live adapter must reconcile ambiguous external submission outcomes before retries.


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

## Frozen Phase 1 technical debt — 2026-09-20

These are accepted nonblocking review findings, not work authorized by the freeze:

| ID | Severity | Debt | Required follow-up |
| --- | --- | --- | --- |
| TD-01 | MEDIUM | JSON adapter concurrency and failed-save memory consistency | Keep JSON development-only; review before concurrent use. PostgreSQL remains canonical. |
| TD-02 | MEDIUM | Migration recognition adopts a manual baseline without a full fingerprint | Validate schema/checksum recognition before adopting another existing environment. |
| TD-03 | MEDIUM — RESOLVED in Phase 2A | Changed-input job and operation key reuse is rejected; canonical hashes include relevant versions/configuration | Verified by P2A03, job conflict, prompt/policy/model conflict and concurrent duplicate tests. Preserve these checks when adding a live adapter. |
| TD-04 | LOW | Incomplete diagnostic correlation and raw error output | Improve sanitized diagnostics before external deployment. |

No debt implementation is part of merge/freeze. See PR_REVIEW.md for the original findings.

## Phase 2A freeze: accepted nonblocking debt

| ID | Severity | Finding / affected area | Why nonblocking for safe Phase 2B | Future resolution |
| --- | --- | --- | --- | --- |
| TD-01 | MEDIUM | JSON adapter concurrency and failed-save consistency; development persistence | Canonical runtime and integration tests use transactional PostgreSQL; JSON is not approved for concurrent production | Keep development-only; implement locking/atomic rollback or retire fallback before concurrent use |
| TD-02 | MEDIUM | Migration recognition uses filenames and adopts 001 from a table check; migrations | Current PostgreSQL schema and clean/repeat migration tests are verified; no unverified environment adoption is required for Phase 2B | Add migration checksums and full baseline fingerprint before adopting another existing environment |
| TD-05 | MEDIUM | Job Detail omits recoveredResearch revisions; UI | Recovery and immutable failed attempts remain correctly stored and exposed through the repository/API; scoped downstream input uses verified recovery, not UI labels | Show recovered processing revisions alongside original failed attempts with clear provenance |
| TD-04 | LOW | Broad HTTP error messages and limited correlation; local API diagnostics | Operator-only loopback deployment; no remote deployment authorized; provider diagnostics remain sanitized | Use allowlisted public error codes and sanitized correlation before wider deployment |

No debt implementation during this freeze. These findings do not relax scope, tenant, evidence or publication gates.

## Phase 2B scope and follow-up

Current implementation scope: generic constrained Script generation, deterministic factual gate, immutable Production Package/visual/audio/rights planning and read-only Job Detail. No media generation, rendering, publishing or Phase 2C is authorized.

Nonblocking limitation: closed-world literal realization can be verbose. A future approved phrase/translation catalogue must retain immutable claim/qualifier/policy bindings before allowing automatic paraphrase approval. Do not weaken the current validator to improve copy. Human creative review remains required. Existing TD-01/02/04/05 remain tracked; this phase does not refactor the JSON adapter or migration framework.


## Phase 2C asset foundation
Generic asset contracts, registry routing and immutable PostgreSQL evidence reuse the modular application. See [Asset contract](ASSET_CONTRACT.md), [Router](PROVIDER_ROUTER.md), [Rights](ASSET_RIGHTS_PROVENANCE.md) and [Manifest](PRODUCTION_ASSET_MANIFEST.md). Native/source/generated capability paths are separated; no business/provider switch exists in the domain. Asset state transitions require stored plan/manifest proof. Publication HOLD remains independent; no renderer/publishing implementation. PCM16 WAV and PNG are the implemented byte decoders; other vendor codecs require adapters. Voice profile missing is a live-production blocker, not a reason to invent a voice.


Phase 2C technical foundation accepted; V005 runtime remains ASSETS_PARTIAL. Human review of 11 native scene specs, authoritative voice-profile approval, rights and downstream audio/timing resolution remain required before renderer readiness. No live voice provider selection is authorized by historical Make settings.


Business voice profiles: optional/multiple voice requirements, tenant-scoped versioned configuration and deterministic selection implemented. Future catalogue/custom/clone/preview UX must use provider-authorized consent and separate call approvals; no live adapter or cloning action in this task. Historical ARKTROV candidate requires human-supplied language compatibility and explicit approval.
