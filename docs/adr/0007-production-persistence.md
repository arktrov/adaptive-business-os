# ADR 0007: PostgreSQL production persistence

Status: Accepted and verified, 2026-09-19.

PostgreSQL 16 with the existing node-postgres (pg) driver is canonical. Domain state validation remains in src/domain/core.js; SQL remains in PostgresStore. Native JavaScript is retained. DATABASE_URL selects this adapter; absence selects the existing local JSON fallback.

Migrations 001 and additive 002 run through scripts/migrate.mjs in one transaction, guarded by an advisory lock and recorded in schema_migrations. Historical manually applied 001 databases are adopted; 002 upgrades both historical schema variants without resetting development data.

Transitions lock the scoped job, compare expected version, validate centrally, update and append audit in the same transaction. Evidence and Artifact inserts first require the scoped job, then persist with composite business/job foreign keys. Database triggers reject UPDATE/DELETE of evidence and artifacts. Explicit artifact versions are unique per business/logical name; automatic versions serialize allocation.

Phase 1 uses a server-configured local business context and loopback binding. Browser-supplied business values cannot switch authorization context. Public multi-user authentication is not part of this closeout; no public deployment is authorized.

Two isolated clean-database runs, 29 cases each, include rollback injection, concurrency, immutable revisions, browser display and app-process restart. See [test matrix](../TEST_MATRIX.md) and [runbook](../PHASE1_RUNBOOK.md).
