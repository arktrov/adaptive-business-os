# Promote policies through evidence

Date: 2026-09-13. Status: Binding.

## Context

QA and performance should improve the system without uncontrolled code changes or cross-brand leakage.

## Decision

Observation -> hypothesis -> proposed rule -> multi-production test -> versioned promotion. Protect hard rules and retain rollback.

## Consequences

Learning is slower than changing on one result, but traceable; structural code fixes use normal testing and review.
