# Preserve behavior before replacing scenarios

Date: 2026-09-13. Status: Binding.

## Context

Blueprints are not supplied. Workbook and handoff documentation are partial evidence.

## Decision

Inventory complete export set first; preserve contracts, exceptions and error semantics; shadow and validate each replacement using a migration matrix.

## Consequences

No scenario is declared replaced in Phase 0. Raw exports remain outside tracked Git files.
