# State machines

## Phase 2A implemented progression — 2026-09-20

RESEARCH_PENDING -> RESEARCH_RUNNING -> RESEARCH_COMPLETE -> FACT_GUARD_PENDING -> FACT_GUARD_RUNNING -> FACT_GUARD_PASSED.

Research REVIEW_REQUIRED/REJECTED and Fact Guard REVIEW_REQUIRED/REJECT map to REVIEW_REQUIRED/REJECTED. Provider/parsing/persistence failure maps FAILED. An explicit retry can re-admit the failed operation to its own pending state; no implicit retries or review overrides occur. A durable interrupted start is first failed with an INTERRUPTED audit during explicit recovery.

Only PostgresStore.transitionInTransaction writes state. RUNNING requires a persisted uncompleted attempt; successful completion requires matching run identity, expected state version and persisted successful output in the same transaction. Claims/sources/links and audit roll back on persistence failure. Phase-2 states are refused by JSON. Research complete admits only Fact Guard; factual pass still grants no release or publication. Existing release protections remain intact.


## Current Phase 1 acceptance — 2026-09-19

**PHASE 1 ACCEPTANCE = PASS. Phase 1 is complete within the authorized local control-plane scope.**
This section supersedes earlier Phase-0/FAIL and incomplete implementation notes below; those remain dated history.
Evidence/Artifact PostgreSQL writes, tenant-scoped detail API, real UI display and append-only DB protection are implemented.
Both clean-database acceptance runs passed 29/29 tests, covering 24/24 requirements; the real app restart retains all evidence and artifact fields.
PostgreSQL remains canonical, with the existing pg adapter; JSON remains development fallback.
See [test matrix](TEST_MATRIX.md) and [local commands and acceptance scope](PHASE1_RUNBOOK.md).
No Phase 2 is authorized or started.



The **CURRENT LEGACY STATE MACHINE** below separates VERIFIED artifact snapshots from VERIFIED current configuration. Historical execution attribution remains INFERRED/UNVERIFIED. The **TARGET APP STATE MACHINE** is a proposal, not implemented. Exact spelling/case matters; Story, evidence, Production, Asset QA and release remain separate. See [runtime validation](LEGACY_RUNTIME_VALIDATION.md).

## CURRENT LEGACY STATE MACHINE

### VERIFIED V004 runtime snapshots

These are retained observations, not proof of direct transitions or their writer:

| Date / revision | Story H / factual AD | Production C / AG | Asset evidence |
| --- | --- | --- | --- |
| Aug10 rev444; Aug13 rev460 | Idea / blank, row20 | No target row | No target rows |
| Aug21 rev568/570 | Needs Review / blank, row20 | No target row | No target rows |
| Aug29 rev591 | Voice Ready / pass, row8 | Voice Ready / blank | Earlier voice file, AE/AF empty |
| Aug29 rev600 | Voice Ready / pass | Visual Assets Pending QA | Eight visuals including Shot1; official2/3/7 need source; QA Pending |
| Sep2 rev605 | Voice Ready / pass | Assets Ready | All visual files present, QA still Pending; AE/AF empty |
| Sep5 rev630 | Voice Ready / pass | Assets Ready | New voice link under same ID; AE/AF populated |
| Sep13 current | Voice Ready / pass | Render Queued / Queued | Eight visual QA Pending, voice QA unset |
| Sep13 result artifacts | No returned Story update | No returned Production update | Four external completed/SUCCEEDED renders |

VERIFIED: actual state diverges from render results; Needs Review existed historically. UNVERIFIED: actors of external promotions, exact intervening statuses and original scenario versions. No current exporter writes Needs Review under its declared output enum. Snapshot gaps must not be filled with invented successful transitions.

### VERIFIED current configured transitions; historical runs not implied

| Entity / field | Required current value / event | Writer → next value | Notes |
| --- | --- | --- | --- |
| DiscoveryJobs.status | Successful async submit | 00A → pending; attempts=0 | Not a Story status |
| DiscoveryJobs.status | pending + provider completed | 00B → completed | Separate route from idea appends |
| DiscoveryJobs.status | pending + provider failed | 00B → failed; attempts=1 | Provider message stored |
| DiscoveryJobs.status | pending + fallback provider state | 00B → pending | Attempts unchanged; no timeout/backoff |
| Story H | New discovery idea | 00B → Idea | Fact Status independently Pending verification |
| Story H | Idea | No supplied writer → Selected for Check | External selection required for 01 |
| Story H | Selected for Check | 01 → Evaluated | No score-based rejection branch |
| Story H | Evaluated | No supplied writer → Research Ready | External promotion required for 02 |
| Story H | Research Ready | 02 → Research Complete / On Hold / Rejected | Status enum/instructions; older input prompt conflicts |
| Story AD + H | Research Complete + evidence | 02B → pass+Approved / hold+On Hold / reject+Rejected | Pairing prompt-only; schema permits inconsistent pairs |
| Story H | Approved AND AD=pass | 03 → Script | New production append precedes Story update |
| Production C | Created by 03 | Script Drafted | Independent aggregate from Story |
| Production C | Script Drafted, Short 1 script, no AF timing | 04 → Voice Ready | Audio/timing recorded |
| Production C | Assets Ready, Short 1 script, no AF timing | 04 → Assets Ready | Deliberate preservation for late voice |
| Story H | Matching production voice generated | 04 → Voice Ready | No later Story status writer in set |
| Production C | Voice Ready + fixed V004; processed final shot | 05 → Visual Assets Pending QA | Equality end_second=total, not all-assets QA |
| Asset I / U | AI/voice generated | 04/05 → Generated – Needs Review / Pending or unset | 04 does not explicitly map QA U |
| Asset I / U | official_source shot >1 | 05 → Source Required / Pending | File Link absent |
| Asset I / U | Source Required + verified candidate/direct URL | 05B → Retrieved – Needs Review / Pending | Download/upload must succeed |
| Asset I / U | Source Required + fallback outcome | 05B → Source Retrieval Failed / Blocked | No automatic retry selection |
| Production C | Visual Assets Pending QA or other state | No supplied writer → Assets Ready | Actor/evidence unknown |
| Production C / AG / AY | Assets Ready | 06 → Render Queued / Queued / Render-{ProductionID} | No asset QA predicate |
| Queue / worker result | Incoming manifest/assets | External worker → processing → completed/SUCCEEDED or failed/FAILED | Separate renderer contract; no Make writeback |
| Platform Analytics | Successful 10/10B query | Append observation | No production/release transition |

[Per-scenario predicates and mappings](make/README.md) are authoritative for this audit. Status values reported here are case-sensitive source literals, not suggested replacements.

## Distinct state dimensions and gaps

Story R Fact Status describes evidence (research verified/mostly_verified/partially_verified/disputed/unverified/false/outdated); T Publish Recommendation describes a stage-specific recommendation. Neither constitutes release. E Source Strength changes representation between discovery and research. Story AF Visual Gate Result and AG V004 Eligible exist in metadata but are not admission predicates in the audited visual/handoff flow.

Production AI/AJ/AK (technical QA, story QA, human approval), Asset U QA Status and final-video release are separate concepts. Copying existing fields during an update does not establish a QA implementation. 06 reads only Production Assets Ready and Asset File Link, not those QA fields.

The complete set has no return transition from On Hold/Rejected, Source Retrieval Failed or Render Queued, no producer of Shot 1 in the current exported visual routes, and no publish lifecycle. Actual V004 Shot 1 exists in Assets, handoffs and all four compiled projects; its historical producer and exclusion intent remain UNVERIFIED. External actions must be discovered from execution evidence. No undocumented implicit transition is assumed.

Polling/appends and provider side effects are not atomic with state writes. There is no in-progress row claim or enforced asset/production idempotency, and no explicit onerror handler in any of the 81 modules. Scenario maxErrors=3 and sequential=false do not supply a durable retry state machine.

## TARGET APP STATE MACHINE — proposal, not implemented

## Content and variant progression

DISCOVERY -> IDEA_SCORING -> RESEARCH -> FACT_GUARD -> BRAND_GUARD -> HOOK_PACKAGING -> SCRIPT -> VISUAL_PLAN -> ASSETS -> VOICE -> AUDIO -> RENDER_PENDING -> RENDERING -> RENDERED.

Asset and voice tasks may overlap only when the plan declares valid dependencies; the final timeline is compiled against voice timing. Hard-rule failure blocks downstream stages. Unsupported prerequisites pause; provider retries never skip a gate.

| From | Event / guard | To |
| --- | --- | --- |
| RENDERED | new immutable video candidate exists | TECHNICAL_QA |
| TECHNICAL_QA | all deterministic checks pass | MULTIMODAL_QA |
| Any QA / FINAL_JUDGE | repairable failure and run repair count < 3 | REPAIR_PENDING |
| REPAIR_PENDING | scoped repair actions applied | RENDER_PENDING (new candidate) |
| MULTIMODAL_QA | complete video+audio reviewed, all six gates PASS, no blocking issues | FINAL_JUDGE |
| FINAL_JUDGE | fresh latest-video decision APPROVED | RELEASE_CHECK |
| RELEASE_CHECK | full gate evidence valid; approval required but missing | AWAITING_APPROVAL |
| AWAITING_APPROVAL | authorized human approves same hash; recheck all gates | RELEASE_CHECK |
| RELEASE_CHECK | all predicates true | RELEASE_ALLOWED |
| RELEASE_ALLOWED | channel/payload/disclosure valid, current release checked atomically | PUBLISH_PENDING |
| PUBLISH_PENDING | external request dispatched | PUBLISHING |
| PUBLISHING | confirmed external post id | PUBLISHED |
| PUBLISHING | response ambiguous | PUBLISH_UNKNOWN |
| PUBLISH_UNKNOWN | reconciliation finds post / proves no post | PUBLISHED / PUBLISH_PENDING |
| PUBLISHED | scheduled provider observation available | analytics observation appended |
| Any stage | unrecoverable fault or exhausted ordinary retries | FAILED / NEEDS_REVIEW |
| Any stage | cancellation or budget hold | CANCELLED / PAUSED |

Each successful publication starts its own analytics timers. Partial multi-platform publication remains explicit; never retry already confirmed channels automatically. Learning progresses independently and never rewinds publication state.

## Invariants

Six gates are technical, fact, visual, audio, mobile_readability and branding. Missing/error/pending is not PASS. APPROVED is the only acceptable final judge value. Hard rules, zero unresolved critical/high issues, exact candidate hash, current policy and optional human approval are additional release requirements.

Default ceiling: three repairs per variant run, persisted across re-renders and process retries. New candidate IDs do not reset the counter. Exhaustion with any blocking failure => NEEDS_REVIEW. Human review cannot bypass hard gates; it can provide corrections and authorize a new traced run.

Any asset, script, timeline, video, relevant packaging or policy change revokes affected release authority and requires corresponding revalidation; a new render always runs all gates again. Final judge receives the complete latest video as fresh evidence.

## External queue mapping

incoming -> queued; processing -> running; completed/SUCCEEDED -> RENDERED; failed/FAILED -> failed attempt. Legacy QA_PASS or APPROVED strings are not sufficient target release evidence. Keep legacy result contract unchanged and add target state outside it.

## Target ownership and canonical research — proposed, not runtime evidence

Exactly one orchestration state coordinator writes workflow status for each aggregate using aggregate version + event deduplication. Capability components emit results/events with input revision and attempt ID; they never directly write competing Story/Production states. A single logical writer may have multiple fenced instances, but never uncontrolled writers.

| Aggregate / field | Sole authorized target writer | Accepted event/command; guard |
| --- | --- | --- |
| Content selection/research state | Orchestration state coordinator | Owner selection command, evaluation/research results; expected state and current input revision |
| Factual decision record | Fact Guard decision recorder (append-only) | Immutable review result with evidence revision; cannot mutate workflow or release |
| Production/variant workflow state | Orchestration state coordinator | Script/asset/voice/render/QA completion events, guarded dependency plan |
| Asset revision and QA records | Asset registry / corresponding QA evaluator respectively | Append immutable artifact or gate result; no direct Production=Assets Ready |
| Render attempt state | Orchestration state coordinator | Legacy result ingestion event; dedup result/job ID, verify candidate identity; SUCCEEDED only maps RENDERED |
| Release authority | Release policy coordinator | Latest candidate hash, six PASS gates, fresh independent judge APPROVED, policy and optional approval; no provider may grant release |
| Publication lifecycle | Publication coordinator | Authorized release + channel claim; post ID or reconciliation outcome; no other component writes PUBLISHED |
| Analytics observation | Analytics observation owner per account/metric/checkpoint | Immutable measured value with grain/window/unit; cannot change production/release states |

Canonical research proposal: EVALUATED → RESEARCH_READY (explicit admission) → RESEARCHING (claimed attempt) → RESEARCH_COMPLETE / ON_HOLD / REJECTED. A retry remains an attempt under RESEARCHING, not a return value Research Ready. RESEARCH_COMPLETE permits FACT_GUARD_PENDING; factual pass with complete evidence permits scripting. Hold/reject exits require an explicit traced revision/admission command. Legacy Needs Review maps to an unresolved review reason pending reconciliation, not automatically to Research Complete or Rejected.

Legacy direct multi-scenario sheet writes remain unchanged. These ownership rules are target design constraints; no coordinator, database or workflow was built.

## Final read-only evidence pass — 2026-09-13

VERIFIED current configuration is unchanged: Research Ready → Research Complete/On Hold/Rejected; Fact Guard → pass/Approved, hold/On Hold, reject/Rejected. UNVERIFIED actual historical Needs Review writer and pass input/output remain unresolved. No historical flow is promoted to final truth and no target state is installed. VERIFIED missing result consumer leaves Production Queued; neither renderer completion nor06 grants Asset QA PASS.

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


## Phase 1 hardening checkpoint — 2026-09-14
PostgreSQL is the canonical production persistence target with versioned migration db/migrations/001_control_plane.sql; JSON remains development/test adapter. State transitions enforce expected state version and immutable artifact constraints. Job detail/history is exposed by the local API/UI. REVIEW_REQUIRED: run PostgreSQL integration tests against a provisioned database and select the concrete TypeScript driver before production deployment.

## PostgreSQL final acceptance pass — 2026-09-14
Docker Compose PostgreSQL is running healthy on localhost:55432. Migration 001 executed successfully; five tables, foreign keys and unique constraints verified. src/persistence-postgres.js provides transactional create/transition/getJob operations with optimistic state versioning and tenant-scoped reads. Integration script verified DB idempotency, audit coupling, concurrency rejection and tenant isolation. The app server still defaults to JSON unless DATABASE_URL wiring is enabled; REVIEW_REQUIRED before production use.

## Phase 1 final closeout — 2026-09-14
DATABASE_URL selects the PostgreSQL adapter; absent value selects JSON development fallback. Docker Compose command: docker compose up -d postgres. Migration: Get-Content db/migrations/001_control_plane.sql -Raw | docker exec -i adaptive-business-os-postgres psql -U abo_dev -d adaptive_business_os. App: $env:DATABASE_URL='postgres://abo_dev:abo_dev_password@localhost:55432/adaptive_business_os'; npm start. PostgreSQL clean-schema migration, adapter transaction/concurrency/idempotency/tenant checks and real app Business/Job/Detail flow passed. REVIEW_REQUIRED remains for full 24-case DB matrix and evidence/artifact API persistence before claiming final acceptance.

PR review correction: Phase 1 rejects RELEASE_APPROVED, PUBLISH_PENDING and PUBLISHED targets centrally until their required gate implementation is authorized. Legacy graph entries do not grant release authority.

## Offline recovered Research completion
Explicit recovery from the latest FAILED run may atomically persist a separate processing result and use FAILED -> RESEARCH_PENDING -> RESEARCH_COMPLETE. Central guard requires processing_revision_id with valid hash, complete child rows, latest scoped original run and matching pending audit. Historical provider outcome remains FAILED. No transition to Fact Guard is performed.
See [Attempt-6 recovery](V005_ATTEMPT_6_RECOVERY.md).

Human Fact Guard review: REVIEW_REQUIRED -> FACT_GUARD_PENDING is allowed only with immutable, tenant/job-scoped HumanFactGuardDecision matching the latest reviewed run and preserving publication HOLD. Normal FACT_GUARD_RUNNING completion remains dependent on committed outcome within the same transaction. Rerun creates a new outcome; REVIEW_REQUIRED is retained if the result is REVIEW_REQUIRED. No publication or Script transition is admitted by this change.

Fact Guard scope contract 2.0: FACT_GUARD_PASSED means only factual scope admitted to the next production stage. Publication HOLD stays in immutable scope; publishing/release bypass remains disabled. Historical REVIEW_REQUIRED evaluations can be re-evaluated through the same human-decision lineage without mutating the original decision or runs. A successful scoped outcome and its scope are committed in the normal state transition transaction.

## Phase 2B central planning states

FACT_GUARD_PASSED -> SCRIPT_PENDING -> SCRIPT_RUNNING -> SCRIPT_APPROVED -> PRODUCTION_PACKAGE_READY.

On failure: SCRIPT_RUNNING -> SCRIPT_REVIEW_REQUIRED. Explicit new revision: SCRIPT_REVIEW_REQUIRED or PRODUCTION_PACKAGE_READY -> SCRIPT_PENDING. Existing legacy packaging-first path remains documented; the new application derives its production package after a validated script. No redundant release state is introduced. SCRIPT_APPROVED is the canonical job counterpart of draft SCRIPT_APPROVED_FOR_PRODUCTION.

Every Phase-2B state requires an exact latest scoped immutable execution proof; successful transitions recompute expected drafts/packages and compare persisted hashes and asset children. Generic JSON adapter cannot enter these guarded states. Publication remains HOLD; RELEASE_APPROVED/PUBLISH_PENDING/PUBLISHED bypasses stay disabled. No direct status writes outside the central state machine.


## Phase 2C asset foundation
Generic asset contracts, registry routing and immutable PostgreSQL evidence reuse the modular application. See [Asset contract](ASSET_CONTRACT.md), [Router](PROVIDER_ROUTER.md), [Rights](ASSET_RIGHTS_PROVENANCE.md) and [Manifest](PRODUCTION_ASSET_MANIFEST.md). Native/source/generated capability paths are separated; no business/provider switch exists in the domain. Asset state transitions require stored plan/manifest proof. Publication HOLD remains independent; no renderer/publishing implementation. PCM16 WAV and PNG are the implemented byte decoders; other vendor codecs require adapters. Voice profile missing is a live-production blocker, not a reason to invent a voice.
