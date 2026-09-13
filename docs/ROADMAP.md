# Roadmap

All phases after 0 require owner authorization. Completion means evidence, not just code.

| Phase | Scope | Exit evidence |
| --- | --- | --- |
| 0 | Read, verify, document, architecture and foundation commit | Source audit, baseline checks, no product implementation |
| 0B | All Make blueprints and relationships | Complete import manifest, scenario map, function-by-function migration matrix |
| 1 | Business Core, conditional onboarding, capability planner | ARKTROV and synthetic second-industry profiles create distinct validated plans; tenant denial tests |
| 2 | Durable jobs, SHORT/LONG/BOTH and legacy renderer adapter | Crash/retry tests, unchanged legacy contract fixtures, isolated artifacts |
| 3 | Technical/full-video QA, repair, independent judge | Failure blocks publication; new render invalidates old approval; max 3 repair cycles |
| 4 | Publishing and analytics ports | Duplicate/timeout reconciliation, release recheck, scheduled metric collection and missing-metric handling |
| 5 | Versioned learning and experiments | Evidence threshold, hard-rule immunity, scope isolation and rollback tests |
| 6 | ARKTROV VIDEO 005 | Idea -> released publication -> analytics -> learning observation, trace and cost ledger |
| 7 | ZHEM through same onboarding | Other industry/products/locations and rules with no core rewrite or ARKTROV data leakage |

V005 acceptance requires explicit production setup, credentials, budget and approval policy; Phase 0 does not authorize a production run. Publishing checkpoints are per available platform metrics, with proposed 1h, 6h, 24h, 72h and 7d timers. Phase 7 is an actual onboarding later, not a guessed business profile now.

Testing progression: unit tests for core/planner/state/gates/rules; integration for tenant repositories and leases; contract tests for adapters; E2E with stub providers before a real authorized production test. Keep Make rollback until every replacement is validated.
