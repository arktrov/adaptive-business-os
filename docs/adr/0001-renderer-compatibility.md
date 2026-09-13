# Preserve the renderer boundary

Date: 2026-09-13. Status: Accepted foundation direction.

## Context

The existing renderer has tested handoff parsing and timeline logic, but fixed brand and shot-specific content.

## Decision

Wrap existing RenderJob/Project v1 behavior; preserve names and strict formats at the adapter. Add tenant and artifact context outside the old payload. Extract brand configuration only after parity fixtures exist.

## Consequences

Avoids a rewrite; carries a temporary legacy adapter and explicit format limits.
