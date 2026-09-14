# ADR 0007: PostgreSQL production persistence

Status: Accepted for Phase 1 hardening. PostgreSQL is canonical production persistence; the domain depends on ports, while JSON remains development/test adapter. Schema is versioned under db/migrations. REVIEW_REQUIRED: select and validate the concrete TypeScript PostgreSQL driver before production deployment.

## PostgreSQL final acceptance pass — 2026-09-14
Docker Compose PostgreSQL is running healthy on localhost:55432. Migration 001 executed successfully; five tables, foreign keys and unique constraints verified. src/persistence-postgres.js provides transactional create/transition/getJob operations with optimistic state versioning and tenant-scoped reads. Integration script verified DB idempotency, audit coupling, concurrency rejection and tenant isolation. The app server still defaults to JSON unless DATABASE_URL wiring is enabled; REVIEW_REQUIRED before production use.
