# Modular backend with isolated rendering

Date: 2026-09-13. Status: Proposed.

## Context

Code is TypeScript and rendering is process-heavy; full Make dependency graph is still missing.

## Decision

Start with web/API, orchestration worker and rendering worker. Keep domain modules in packages. Select durable engine/database after full blueprint audit.

## Consequences

Fewer initial deployment units; durable state, leases, outbox and recovery remain mandatory.
