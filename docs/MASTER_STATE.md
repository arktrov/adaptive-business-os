# Master state

## OpenAI connection preparation — 2026-09-20

OpenAI Responses/web-search adapter prepared behind the existing provider port; no OpenAI-specific domain, state, persistence or Fact Guard change. V005 now has an owner-confirmed structured input stored separately as confirmed_research_input and remains RESEARCH_PENDING. No ResearchRun or provider operation was created for V005. Existing Phase-2A PASS is a historical technical gate, not live-provider authorization. Process credential absent at preparation; no secret created or configured. Live execution is disabled pending secure credential setup and a separate exact-input approval. See [connection preparation](OPENAI_RESEARCH_CONNECTION.md).

Verification: 101/101 tests PASS twice (76 existing + 25 OpenAI preparation cases), lint/build and secret check PASS; Make 12/12 and renderer 31/31 unchanged. Actual V005 read-only preflight PASS with no state/evidence mutation and zero provider operations. OPENAI_API_KEY absent; READY_FOR_SINGLE_V005_LIVE_RESEARCH_RUN = NO.


## Historical Phase 2A checkpoint — 2026-09-20

Owner authorized only Research -> Persistent Evidence -> Fact Guard with deterministic local adapters. This supersedes dated NOT STARTED entries below. Phase 1 remains COMPLETE at v0.1.0-control-plane. PHASE 2A ACCEPTANCE = PASS. LIVE PROVIDER = NOT YET CONNECTED. READY_FOR_PROVIDER_INTEGRATION = YES. Two clean PostgreSQL acceptance runs each passed 76/76 tests: 31 Phase-1 regressions plus 45 Phase-2A cases; 24/24 + 25/25 requirements mapped. Lint/build, secret scan, 12 Make originals and 31 renderer hashes pass. Migration 003 is applied to the local development DB; ARKTROV Video 005 is SHORT / IDEA_CREATED with zero research and Fact Guard runs. No credentials or external calls are involved. V005 has no confirmed topic; keep it initial and separate from synthetic fixtures. See [Research contract](RESEARCH_CONTRACT.md), [Fact Guard contract](FACT_GUARD_CONTRACT.md) and [runbook](PHASE2A_RUNBOOK.md).


## Phase 1 freeze — 2026-09-20

**PHASE 1 = COMPLETE. PHASE 2 = NOT STARTED.**
Baseline tag: `v0.1.0-control-plane`, to reference the verified merge commit of PR #1.
Completed: Control Plane Core, PostgreSQL Persistence, central State Machine, Audit Trail, Tenant Isolation, Idempotency, Evidence Persistence, Immutable Artifacts, Job Detail UI, Restart Persistence, Release Bypass Protection and Network Exposure Protection.
Acceptance: 24/24 requirements and 31/31 post-review tests. Renderer unchanged (31 reference hashes).
Four nonblocking review findings are tracked as TD-01 through TD-04 in ROADMAP.md; no fixes are authorized by this freeze.
No Research, Fact Guard, provider integration, V005 execution, Make/renderer changes or publishing is started.
## Current Phase 1 acceptance — 2026-09-19

**PHASE 1 ACCEPTANCE = PASS. Phase 1 is complete within the authorized local control-plane scope.**
This section supersedes earlier Phase-0/FAIL and incomplete implementation notes below; those remain dated history.
Evidence/Artifact PostgreSQL writes, tenant-scoped detail API, real UI display and append-only DB protection are implemented.
Both post-review clean-database acceptance runs passed 31/31 tests, covering 24/24 requirements; the real app restart retains all evidence and artifact fields.
PostgreSQL remains canonical, with the existing pg adapter; JSON remains development fallback.
See [test matrix](TEST_MATRIX.md) and [local commands and acceptance scope](PHASE1_RUNBOOK.md).
No Phase 2 is authorized or started.



Date: 2026-09-13. Phase: **0 — foundation; implementation not authorized**.

## Verified baseline

- GitHub account `arktrov` (numeric ID 328814414) explicitly confirmed by owner. Repository `arktrov/adaptive-business-os` already existed, public and empty. Reuse it; no duplicate creation or visibility change.
- Intended checkout: `C:\Users\zelih\Documents\Codex\adaptive-business-os`.
- External renderer: `C:\Users\zelih\Documents\Codex\arktrov-remotion`; not a Git checkout. Its files were inspected without modifying production sources.
- ARKTROV Drive connection verified. Bootstrap specification and quality-gate specification read in full.
- Master Database: 14 sheet tabs inventoried; headers, Settings, System Map and selected production/asset records inspected. V004-focused validation additionally read bounded current tables with full ID sentinels and eight retained workbook revisions; this is not a claim of complete historical event coverage.
- Drive Render Queue has incoming, processing, completed, failed. V004 V4 job, result and handoff inspected: SUCCEEDED render result, eight visual shots, nine assets, 53.92s voice timing, 55s initial visual plan. Asset QA is Pending/null. No publish approval follows from that success.
- Existing tests: 14/14 pass; TypeScript check passes; V002 and V003 project runtime validation passes.
- GitHub account: `arktrov`; repository: `arktrov/adaptive-business-os`. Foundation complete. Make blueprints received: **12**, original bytes imported locally and SHA-256 recorded. Owner explicitly confirmed the set complete on 2026-09-13. All **81 modules**, routes, filters, mappings, prompts and exported schemas statically audited. **34 hardcodings** catalogued. Stable boundaries are RenderJob/Result 1.0, Project JSON v1, Production 2.0-final and SubtitleTiming v1; Make remains the legacy/reference system. No scenario executed or modified. V004 runtime artifacts and retained revisions were subsequently validated; live schedule/activation and exact historical Make-run attribution remain UNVERIFIED.

## Deliverable boundary

Foundation documents, ADRs, source provenance, complete Make intake, twelve scenario audits, cross-scenario map and migration/test matrix. Architectural choices are proposals unless marked as binding invariants. No application, provider integration, new production run, migration, deployment or publishing has been started.

## Source precedence

Owner requirements define scope. Existing code and source artifacts establish observed behavior; Make blueprints, when supplied, establish legacy scenario behavior. New target behavior is governed by versioned decisions and mandatory gates, not assumed parity. Differences must be explicit.

## Open work

Complete only the residual read-only evidence reconciliation defined as L1–L4 plus activation overview in [LEGACY_RUNTIME_VALIDATION](LEGACY_RUNTIME_VALIDATION.md). Existing Sheets/Drive/queue/revision evidence has already been exhausted for the primary questions. Make intake and static cross-scenario audit are complete; migration and V005 implementation remain unauthorized. Resolve missing execution-engine choice, provider capability validation, production QA thresholds and account-specific publishing capabilities before production.

The workbook still says human approval is required. The requested V005 autopublishing path needs an explicit versioned business-policy choice during implementation; current foundation grants no publishing permission. Human approval can add a condition but never waive QA.

## Current Make conclusions

Configured flow: asynchronous discovery → externally selected evaluation → externally promoted research → Fact Guard → longform/two-short package → Short 1 voice → V004-restricted visuals/retrieval → external Assets Ready decision → flat Drive render handoff. Analytics independently reads YouTube/Instagram; 10 and 10B duplicate IG logic. The complete set contains no final-video QA/repair/release/publisher/learning or render-result writeback. These are coverage gaps, not missing-file claims.

Runtime findings: research prompt conflict and missing replayable evidence, fixed V004 behavior, nontransactional side effects, voice revision ambiguity, pending QA, stale queued business status and mixed/duplicated analytics configuration. Actual missing Shot1 is disproved: all four renders contain it. Proposed target behavior remains separate from observed Make behavior.

See [risks and baseline](EXISTING_SYSTEM.md), [migration](MAKE_MIGRATION.md) and [validation](VALIDATION.md). The root Git commit records the foundation revision; remote synchronization is verified at delivery, not assumed by this file.

## Current runtime validation result

VERIFIED scope: 12blueprints/81modules, eight retained workbook revisions, current bounded Sheets records, Drive asset metadata, four completed jobs with identical handoff bytes/nine input hashes, pure handoff/project parsing and read-only V4 ffprobe metadata. No new render or provider action. Research Needs Review existed historically; cause is UNVERIFIED. Story remains Voice Ready and Production Render Queued despite four SUCCEEDED results. Actual visual QA remains Pending, final-video release is unestablished.

Risk register: **11 VERIFIED risks / 1 VERIFIED refutation / 6 UNVERIFIED**, with code-vs-incident scope explicit. [Runtime report](LEGACY_RUNTIME_VALIDATION.md) and [all hardcodings](LEGACY_HARDCODINGS.md) are the current evidence authority over earlier static hypotheses. Exactly four representative existing Make runs plus one activation/schedule overview are requested, not all logs. No migration, service, database, V005, QA system or publishing implementation authorized or started.

## Final read-only evidence pass — 2026-09-13

Final read-only reconciliation: authenticated Make history tables were readable in-browser (VERIFIED); selected detail bundles remained blocked by a persistent loading view. No production data or code changed. 6→6 UNVERIFIED; 0 new verified/refuted hypotheses. Decision: LEGACY UNDERSTANDING NOT YET SUFFICIENT for faithful end-to-end app implementation. Only actual02 research status/output/persistence and02B factual admission evidence are designated blocking. Implementation remains unauthorized. The exact requested packet and all twelve UNKNOWN scheduling rows are documented in the evidence record.

See [exact requested artifacts and sufficiency decision](LEGACY_RUNTIME_EVIDENCE.md). VERIFIED/INFERRED/UNVERIFIED remain scoped to code versus historical execution.

## Browser-read Make history (read-only, 2026-09-13)

The authenticated Make browser session exposed history tables without executing or editing anything. Selected run details opened with a persistent `loading...` diagram and embedded frames, so module bundles were not readable in this session. Visible history rows are direct runtime evidence:

| Scenario | Visible history evidence | Status |
| --- | --- | --- |
| 02 – Research Agent | Manual successful runs by Emre Saglam at 13.08.2026 22:21:50 (3 ops/44.3 KB), 15.08.2026 23:26:00 (3/66.6 KB), 16.08.2026 00:11:50 (4/88.8 KB), 16.08.2026 00:18:50 (1/0 B), 21.08.2026 18:10:28 (4/80.4 KB), 21.08.2026 18:25:49 (111/117.7 KB). | VERIFIED run existence/outcomes; Story-specific bundle and causal Needs Review link UNVERIFIED |
| 02B – Fact Guard | Manual successful runs 29.08.2026 22:04:55 (5/38.6 KB) and 22:19:00 (5/35.3 KB); errors 21:43:36 (5/15.4 KB) and 21:37:52 (4/161 B). | VERIFIED visible execution history; exact V004 selection and PASS bundle UNVERIFIED |
| 05 – Short Visual Production | Manual success 30.08.2026 01:32:03 (7/6.4 MB); warning 30.08.2026 01:43:29 (20/20.0 MB). Visible edit at 29.08.2026 23:43:00. | VERIFIED execution history; Shot-1 bundle/asset correlation UNVERIFIED |
| 10 – Platform Analytics | History page showed **No items found**. | VERIFIED no retained history visible in this account view; not proof no run ever existed |

All visible history rows identify activity as manual by Emre Saglam; this is not proof that the same person authored every Sheet mutation. Detail URLs are retained in the browser session but no bundle payload loaded. Do not infer provider outputs or data values from operation counts alone.

## Activation visibility

The editor visibly reported **Inactive** for 02B and 10. The organization dashboard reported **Active scenarios 0/2**. The twelve-scenario list showed the complete named set, but did not expose per-row schedule/activation fields. The twelve-row activation map therefore remains UNKNOWN except for these two directly observed inactive states; schedule type, interval, timezone and last execution remain UNVERIFIED.


No migration or large app implementation has started; V005 remains unauthorized.

## Closure decision — 2026-09-14 (HISTORICAL_EVIDENCE_UNAVAILABLE)

Make now reports **“Log detail doesn't exist”** for the historical Scenario 02 and 02B executions. The retained run metadata remains known, but the historical Research and Fact Guard module bundles are permanently unavailable because they are outside Make's execution-log retention. This is **HISTORICAL_EVIDENCE_UNAVAILABLE**, not an implementation blocker.

Available sources are the imported blueprints, current Google Sheets and Drive artifacts, and current contracts. Missing historical bundles must never be reconstructed, guessed, or invented. The new app must persist durable execution evidence itself: inputs, outputs, agent decisions, claims, sources, evidence, Fact Guard results, corrections, guardrails, QA/repair decisions, provider request/response metadata, state transitions, timestamps, versions, hashes, publish results, and analytics snapshots.

**LEGACY UNDERSTANDING SUFFICIENT FOR APP IMPLEMENTATION.** Known historical gaps exist but do not block implementation. No Phase-1 implementation is started by this documentation change.

## Phase 1 implementation checkpoint
The control-plane bootstrap is implemented on codex/phase-1-control-plane with ARKTROV seed data, tenant-scoped jobs, centralized audited transitions, idempotency, durable local persistence, and a minimal browser UI. External renderer remains untouched.

Phase 1 continuation: immutable Artifact/Evidence registries and provider capability boundaries added; no renderer or Make changes. REVIEW_REQUIRED: replace JSON persistence with transactional database before concurrent production use.

## Phase 1 hardening checkpoint — 2026-09-14
PostgreSQL is the canonical production persistence target with versioned migration db/migrations/001_control_plane.sql; JSON remains development/test adapter. State transitions enforce expected state version and immutable artifact constraints. Job detail/history is exposed by the local API/UI. REVIEW_REQUIRED: run PostgreSQL integration tests against a provisioned database and select the concrete TypeScript driver before production deployment.

## PostgreSQL final acceptance pass — 2026-09-14
Docker Compose PostgreSQL is running healthy on localhost:55432. Migration 001 executed successfully; five tables, foreign keys and unique constraints verified. src/persistence-postgres.js provides transactional create/transition/getJob operations with optimistic state versioning and tenant-scoped reads. Integration script verified DB idempotency, audit coupling, concurrency rejection and tenant isolation. The app server still defaults to JSON unless DATABASE_URL wiring is enabled; REVIEW_REQUIRED before production use.

## Phase 1 final closeout — 2026-09-14
DATABASE_URL selects the PostgreSQL adapter; absent value selects JSON development fallback. Docker Compose command: docker compose up -d postgres. Migration: Get-Content db/migrations/001_control_plane.sql -Raw | docker exec -i adaptive-business-os-postgres psql -U abo_dev -d adaptive_business_os. App: $env:DATABASE_URL='postgres://abo_dev:abo_dev_password@localhost:55432/adaptive_business_os'; npm start. PostgreSQL clean-schema migration, adapter transaction/concurrency/idempotency/tenant checks and real app Business/Job/Detail flow passed. REVIEW_REQUIRED remains for full 24-case DB matrix and evidence/artifact API persistence before claiming final acceptance.
