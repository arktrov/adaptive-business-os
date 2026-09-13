# Validation

Foundation verification date: 2026-09-13.

## Existing renderer baseline

Node v24.18.1, existing local dependencies; no install or upgrade performed.

- `node --experimental-strip-types --test <renderer>/scripts/make-handoff.test.ts <renderer>/scripts/make-short-treatment.test.ts`: 14 passed, 0 failed.
- `node node_modules/typescript/bin/tsc --noEmit` in renderer: passed.
- `node --experimental-strip-types scripts/validate-project.ts data/project.video-002.json`: passed.
- Same runtime validator for project.video-003.json: passed.

Tests ran with a separate scratch current directory, so compiler test staging/cleanup did not modify the real renderer's public assets. Existing test fixture uses placeholder bytes; a passing compiler test does not prove playable media or visual quality.

## Foundation checks

`node scripts/check-foundation.mjs` validates required docs, relative Markdown links, blueprint manifest, declared local raw-file hashes/module identities and Git-ignore protection (raw exports may be absent on a clean clone). Git whitespace and staged-file review run before the foundation commit. The source inventory records SHA-256 values because the renderer has no Git history.

No full render, composition browser inspection, live queue execution, production provider call, publication, analytics ingestion or new application E2E was performed. These remain future acceptance gates, not implicit successes.

## Required future regression suites

- Business Core: validation, conditional questions, profile revision invalidation, business isolation.
- Planner: unsupported capability, missing credentials, budget, acyclic dependencies and hard-rule preservation.
- Renderer: both legacy contracts, schema/runtime mismatch, voice-clock trimming, real asset hashes, scene-ID routing and cross-format behavior.
- Durable jobs: concurrent claims, lease loss, process crash, partial sync, duplicate input and result reuse retention.
- Release: each failed/missing gate, stale hash, rejected judge, exhausted repairs, human policy and malformed QA response.
- Publishing: stale release, duplicate submit, timeout after accepted upload, provider reconciliation, partial channel success.
- Analytics: missing vs zero, metric units/denominators, observation age and checkpoint deduplication.
- Learning: multiple-production evidence, holdout comparison, hard rules, scope isolation and rollback.

## Complete Make static audit — 2026-09-13

- Exactly the 12 owner-named files were imported; each original parseable JSON file is byte-identical to its Downloads source by SHA-256 and byte count.
- Complete-set confirmation recorded explicitly; 81 modules and all nested router paths enumerated, no explicit onerror handlers found. All provided model prompts and output schemas reviewed, including the contradictory research input/instructions.
- Module mapping appendices preserve field expressions and filters; schema appendices preserve configured JSON constraints. Logical resource aliases replace private IDs; no credential values are published.
- Normalized spreadsheet identity is shared across all Sheets modules. 00A/00B share one Data Store; 05/05B share one visual destination; 06 assets/manifest share one incoming destination.
- Scenario 10 Instagram modules 10/11/13/14 exactly match 10B in module type, parameters, mapper and filter (excluding visual-editor layout).
- Static mismatch verified: scenario 10 references 9.Data while its HTTP output interface declares data. Runtime effect is unverified.
- Documentation/manifest/link/hash/module checks and Git diff/ignore review are delivery checks. No paid/live provider action, Make execution, migration or app workflow was performed.

Future test IDs T01–T16 in [MAKE_MIGRATION](MAKE_MIGRATION.md) are acceptance specifications, **not passing test claims**. Prior 14 renderer tests above were not rerun for a documentation-only audit and do not establish new-system parity.
