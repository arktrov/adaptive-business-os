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

`node scripts/check-foundation.mjs` validates required docs, relative Markdown links, blueprint manifest and no raw intake in the foundation set. Git whitespace and staged-file review run before the foundation commit. The source inventory records SHA-256 values because the renderer has no Git history.

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
