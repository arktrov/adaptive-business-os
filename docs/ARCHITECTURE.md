# Target architecture

## Implemented Phase 2A boundary — 2026-09-20

The existing Node modular app is retained. ResearchService consumes injected repository/provider ports; domain validation imports neither pg nor test adapters. ResearchRepository implements the persistence port over PostgresStore and delegates every state write to the central transaction helper. LocalResearchProvider and LocalFactGuardProvider are selected only in the composition root. Replacing them does not change canonical requests, persistence, state or idempotency.

Immutable operation/attempt/outcome tables retain full evidence with composite scope constraints. Advisory ownership is held across invocation, without holding a database transaction; state versions fence late completions. No new worker platform, ORM, paid provider, renderer or service deployment is introduced. JSON cannot execute Phase 2A. Existing loopback operator security remains unchanged; multi-user authentication, database roles/RLS and backups require separate deployment review. See [contract](RESEARCH_CONTRACT.md).


## Current Phase 1 acceptance — 2026-09-19

**PHASE 1 ACCEPTANCE = PASS. Phase 1 is complete within the authorized local control-plane scope.**
This section supersedes earlier Phase-0/FAIL and incomplete implementation notes below; those remain dated history.
Evidence/Artifact PostgreSQL writes, tenant-scoped detail API, real UI display and append-only DB protection are implemented.
Both clean-database acceptance runs passed 29/29 tests, covering 24/24 requirements; the real app restart retains all evidence and artifact fields.
PostgreSQL remains canonical, with the existing pg adapter; JSON remains development fallback.
See [test matrix](TEST_MATRIX.md) and [local commands and acceptance scope](PHASE1_RUNBOOK.md).
No Phase 2 is authorized or started.



Status: proposed foundation design, based on [existing system](EXISTING_SYSTEM.md). No runtime stack is installed.

## Shape

Use a TypeScript modular backend with a separate render worker, rather than deploying one service for every business capability immediately. This preserves the existing TypeScript/Remotion boundary and keeps transactional state in one place. Modules can become services only when measured scaling or security needs justify it.

Proposed runtime: web/API, durable orchestration worker, isolated rendering worker, PostgreSQL-style transactional store, object storage, secret manager. Database and workflow products remain unselected until blueprint inventory and operational constraints are known. Required semantics: persisted timers, retries, leases, cancellation, transactional outbox/inbox and recovery after process failure.

```mermaid
flowchart LR
  U[Business onboarding] --> B[Versioned Business Core]
  B --> P[Execution planner]
  P --> O[Durable orchestration]
  O --> C[Content and research modules]
  C --> R[Renderer adapter]
  R --> Q[Technical and full-video QA]
  Q --> J[Independent final judge]
  J --> G[Release gate]
  G --> PUB[Platform publishing]
  PUB --> A[Analytics]
  A --> L[Versioned learning proposals]
  L --> P
  Q --> REP[Targeted repair]
  REP --> R
```

## Proposed monorepo

```text
apps/web/                     onboarding, business plan and review UI
apps/api/                     authenticated commands and business views
workers/orchestration/        durable execution, timers and provider calls
workers/rendering/            process isolation and legacy renderer adapter
packages/business-core/       profiles, onboarding definitions and validation
packages/contracts/           versioned commands, events and artifact contracts
packages/planning/            capability registry and plan validation
packages/content/             discovery through research, script and assets
packages/quality/             issues, repair routing and release evaluator
packages/publishing/          platform payloads and reconciliation
packages/analytics/           metric ingestion and normalization
packages/learning/            experiments, policy versions and rollback
packages/providers/           ports and provider-specific adapters
packages/persistence/         tenant-scoped repositories and outbox
packages/config/              validated configuration, no credentials
docs/                         decisions and evidence
legacy/make-blueprints/        controlled legacy intake
```

Only documentation directories are bootstrapped now. Do not create empty executable packages or copy the renderer into the core. There is no dependency on Make in the desired normal production path.

## Boundaries

Business Core owns business facts and versioned rules; modules consume immutable profile snapshots. Provider adapters cannot write policy directly. The planner chooses from registered, tested capabilities and validates prerequisites, budgets and hard constraints. Model output is an untrusted plan proposal, never arbitrary executable code.

Content stores one research revision with separate SHORT/LONG production variants. BOTH shares research but has distinct hooks, scripts, scenes, render contracts, packaging and per-platform releases. A horizontal composition alone does not establish a longform production capability.

Rendering accepts an immutable artifact request and returns an artifact result. It cannot call publishing. The publisher must independently check the current release record and content hash immediately before each external side effect.

## Isolation and execution

Every command is authorized against tenant membership; business_id comes from authorized server context, not merely request JSON. Composite tenant foreign keys, row access policies and tenant-prefixed object paths prevent accidental joins across businesses. Credentials are resolved inside tenant-scoped adapters. Worker claims carry tenant and business context; caches and idempotency are equally scoped.

Each run pins profile, plan, policy, compiler, renderer and input-asset revisions. Costs use reservation before dispatch and settlement after completion. Exhausted budget produces a pause, never a cheaper unapproved provider or skipped QA.

Job/run/content/business IDs, provider call IDs, input/output hashes, costs, timestamps, errors, retries and gate evidence are recorded as events. Logs redact payload secrets; object data has retention and deletion policy. Global learning receives only explicitly eligible aggregated observations.

## Provider ports

LLM, research, image, video, voice, full-video QA, publishing and analytics ports expose capability metadata, version, submit/poll/cancel where supported, timeout/error classification, cost usage and credential reference. The adapter must report unsupported features rather than silently downgrade. Gemini is the named initial full-video QA candidate from the source specification; full-video/audio support and limits must be verified before implementation. No live provider was called in Phase 0.
## Phase 1 implementation

Control Plane Core is implemented on `codex/phase-1-control-plane`. It uses a tenant-scoped durable JSON persistence adapter for the local bootstrap (replaceable by a database adapter later), a centralized audited state machine, idempotent job creation, immutable artifact/evidence reference slots, and provider-independent boundaries. The UI exposes Businesses, Content Jobs, creation with SHORT/LONG/BOTH, and job history. No Make or external provider calls are made.

Phase 1 boundaries: Provider capabilities are interfaces only. Local JSON persistence is bootstrap-only and requires REVIEW_REQUIRED database replacement for concurrent multi-user production.

## Phase 1 hardening checkpoint — 2026-09-14
PostgreSQL is the canonical production persistence target with versioned migration db/migrations/001_control_plane.sql; JSON remains development/test adapter. State transitions enforce expected state version and immutable artifact constraints. Job detail/history is exposed by the local API/UI. REVIEW_REQUIRED: run PostgreSQL integration tests against a provisioned database and select the concrete TypeScript driver before production deployment.

## PostgreSQL final acceptance pass — 2026-09-14
Docker Compose PostgreSQL is running healthy on localhost:55432. Migration 001 executed successfully; five tables, foreign keys and unique constraints verified. src/persistence-postgres.js provides transactional create/transition/getJob operations with optimistic state versioning and tenant-scoped reads. Integration script verified DB idempotency, audit coupling, concurrency rejection and tenant isolation. The app server still defaults to JSON unless DATABASE_URL wiring is enabled; REVIEW_REQUIRED before production use.

## Phase 1 final closeout — 2026-09-14
DATABASE_URL selects the PostgreSQL adapter; absent value selects JSON development fallback. Docker Compose command: docker compose up -d postgres. Migration: Get-Content db/migrations/001_control_plane.sql -Raw | docker exec -i adaptive-business-os-postgres psql -U abo_dev -d adaptive_business_os. App: $env:DATABASE_URL='postgres://abo_dev:abo_dev_password@localhost:55432/adaptive_business_os'; npm start. PostgreSQL clean-schema migration, adapter transaction/concurrency/idempotency/tenant checks and real app Business/Job/Detail flow passed. REVIEW_REQUIRED remains for full 24-case DB matrix and evidence/artifact API persistence before claiming final acceptance.

## Phase 2B — script and production planning

Domain: script-production.js; application: ScriptService; persistence boundary: ScriptRepository backed by PostgreSQL; providers: interchangeable describe/execute ports. Domain does not import persistence or test adapters. Business configuration composes SHORT/LONG/BOTH without customer-wired modules. V005 configuration is isolated in src/config/script-production.js, English 45–60 seconds per owner choice.

Paid response capture precedes parsing; central state proof verifies immutable outputs. GET Script/Production endpoints and Job Detail show persisted data only. No HTTP endpoint can spend provider budget. Live execution is a separate hash-pinned one-call local runner after technical acceptance. No asset generation, rendering or release.

See [Script contract](SCRIPT_CONTRACT.md), [Production Package](PRODUCTION_PACKAGE_CONTRACT.md) and [Visual intent](VISUAL_INTENT_CONTRACT.md).
