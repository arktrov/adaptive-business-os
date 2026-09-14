# ADR 0007: PostgreSQL production persistence

Status: Accepted for Phase 1 hardening. PostgreSQL is canonical production persistence; the domain depends on ports, while JSON remains development/test adapter. Schema is versioned under db/migrations. REVIEW_REQUIRED: select and validate the concrete TypeScript PostgreSQL driver before production deployment.
