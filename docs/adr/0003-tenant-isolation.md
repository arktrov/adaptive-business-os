# Business facts and rules remain scoped

Date: 2026-09-13. Status: Binding.

## Context

ARKTROV and later ZHEM have incompatible content needs and separate credentials.

## Decision

Use tenant/business keys through storage, jobs, assets, credentials, caches and rules; version snapshots. Global learning is reviewed aggregated transfer.

## Consequences

Requires composite constraints and authorization tests, not just a business_id field.
