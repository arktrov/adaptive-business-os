# Adaptive Business OS

Phase 0 foundation. Reusable business automation, first validated with ARKTROV, then with a separately onboarded ZHEM business.

**No production application is implemented in this repository yet.** Existing rendering remains in the external `arktrov-remotion` project. No Make scenario has been replaced.

The complete 12-blueprint Make set is imported locally and statically audited (81 modules); [scenario audits](docs/make/README.md) and the migration matrix document the current behavior and remaining runtime questions.

Start with [Master state](docs/MASTER_STATE.md), [architecture](docs/ARCHITECTURE.md), [renderer audit](docs/EXISTING_SYSTEM.md) and [roadmap](docs/ROADMAP.md).

## Foundation documents

- [Decisions](docs/DECISIONS.md)
- [Business Core](docs/BUSINESS_CORE.md)
- [Data model](docs/DATA_MODEL.md)
- [State machine](docs/STATE_MACHINE.md)
- [Quality gates](docs/QUALITY_GATES.md)
- [Learning](docs/LEARNING_SYSTEM.md)
- [Make migration](docs/MAKE_MIGRATION.md)
- [Scenario map](docs/SCENARIO_MAP.md)
- [Evidence and source inventory](docs/SOURCE_INVENTORY.md)
- [Validation](docs/VALIDATION.md)
- [Blueprint intake](legacy/make-blueprints/README.md)

Run the documentation check with `node scripts/check-foundation.mjs`. It needs no installed packages and performs no provider calls.
