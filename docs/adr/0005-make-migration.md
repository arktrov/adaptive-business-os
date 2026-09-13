# Preserve behavior before replacing scenarios

Date: 2026-09-13. Status: Binding.

## Context

Original foundation context: blueprints were not yet supplied. Update 2026-09-13: the owner confirmed the complete 12-export set; all 81 modules are statically audited. Workbook and handoff documentation remain supporting evidence; runtime boundary validation is still pending.

## Decision

Inventory complete export set first; preserve contracts, exceptions and error semantics; shadow and validate each replacement using a migration matrix.

## Consequences

No scenario is declared replaced in Phase 0. Raw exports remain outside tracked Git files.
