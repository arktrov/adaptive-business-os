# Target architecture

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
