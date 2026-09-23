# Data model

## Phase 2A implemented model — 2026-09-20

Migration 003 adds research_definitions, research_operations, research_attempts, research_outcomes, research_claims, research_sources and research_claim_evidence. Operation contains canonical input hash and full request snapshot; attempts append starts; outcomes append immutable result/hash/metadata/error/timestamps. Unique business/job/operation/key and one successful outcome per operation enforce idempotency. Every relation uses business/job/run scope; Fact Guard input references a persisted same-job outcome. Definition ID/version hashes reject unversioned changes.

All new tables reject updates and deletes. Structured canonical results retain qualifiers, source dates/rights, uncertainties, contradictions, evidence excerpts, corrections, guardrails and claim decisions. See [Research](RESEARCH_CONTRACT.md) and [Fact Guard](FACT_GUARD_CONTRACT.md). Business tenant ownership follows the verified Phase-1 businesses relation; no tenant model redesign is introduced.


## Current Phase 1 acceptance — 2026-09-19

**PHASE 1 ACCEPTANCE = PASS. Phase 1 is complete within the authorized local control-plane scope.**
This section supersedes earlier Phase-0/FAIL and incomplete implementation notes below; those remain dated history.
Evidence/Artifact PostgreSQL writes, tenant-scoped detail API, real UI display and append-only DB protection are implemented.
Both clean-database acceptance runs passed 29/29 tests, covering 24/24 requirements; the real app restart retains all evidence and artifact fields.
PostgreSQL remains canonical, with the existing pg adapter; JSON remains development fallback.
See [test matrix](TEST_MATRIX.md) and [local commands and acceptance scope](PHASE1_RUNBOOK.md).
No Phase 2 is authorized or started.



**Legacy audit first; target logical design below remains unimplemented.** Source: complete 12-blueprint set and prior workbook/renderer evidence. The [column dictionary](make/COLUMN_DICTIONARY.md) retains all meaningful exported field labels, and [scenario appendices](make/README.md) retain exact read predicates/write expressions. No live schema was altered.

## Shared legacy entities

| Entity | Key / relationship | Writers and readers | Stored semantics |
| --- | --- | --- | --- |
| DiscoveryJobs | Data Store key=response_id | 00A writes; 00B polls/updates | agent, status, attempts, created_at, response_id, last_checked_at, error_message |
| Story Pipeline | A Story ID | 00B→01→02→02B→03→04 | H workflow; R evidence status; AD factual gate; narrative and source fields |
| Sources | Story ID B + Claim ID L + URL F | 02 appends; 02B reads | Claim/source association, qualifier Notes, preliminary rights |
| Production Pipeline | A Production ID; B Story ID | 03 creates; 04/05/06 update | Scripts/shorts, plans, timings, independent production state |
| Asset Library | A Asset ID; B Story ID; C Scene | 04/05 create; 05B updates; 06 reads | File link, rights, AI flag, QA metadata; version encoded in ID |
| Platform Analytics | Content ID B + Platform C + Date A + Retrieved At W where mapped | 10/10B append | Mixed channel/media grain; no enforced unique checkpoint |

All sheet modules reference the same spreadsheet after normalizing picker paths to the final spreadsheet ID. No tenant/business discriminator is stored in these legacy records; owner/account constants imply ARKTROV operational scope, not isolation guarantees.

## Key, column and serialization contracts

| Contract | Exact observed mapping / interpretation |
| --- | --- |
| Story ID | 00B: ARK- followed by a literal space, timestamp YYYYMMDD-HHmmss, hyphen, iterator index. Preserve original string; canonical IDs belong outside the legacy adapter |
| Production ID | 03: PROD- followed by a literal space then original Story ID |
| Audio / image / official IDs | AUD-/IMG-/SRCVIS- plus Production ID, SHORT1, optional SHOTn, V1; deterministic labels but no enforced uniqueness |
| Render ID | Render- plus Production ID; worker may normalize separately |
| Claims / sources | CLAIM-001… and SRC-001… restart in a research package; use Story ID scope, never treat sequence alone as globally unique |
| Story A:T | Identity, topic/category/hook, source strength, scores, status, owner/format/date, URLs/notes and research recommendations |
| Story U:AC | Story Driver, Anomaly Hook, Open Loop, Retention Driver, Suspense Score, Story Mode, Ending Question, Conversation Trigger, Pinned Comment |
| Story AD:AK | Fact Guard Result/Notes, Visual Gate Result, V004 Eligible, Automation Job ID/Error, Required Corrections, Script Guardrails |
| Production A:Z | Identity/status; longform script/package; two short hook/script pairs; source guardrails/disclaimer; duration; timestamps |
| Production AA:AF | Beat Sheet, Claim Map, Visual Bible, Proof Assets, AI Shot Plan, Voice Timing JSON. Only AE/AF are produced by the audited visual/voice modules |
| Production AG:AZ | Compile/project/QA/approval/video URL; channel copy/disclosure/publish status; idempotency/job/error fields. Most are merely copied by 06, not generated |
| Asset A:V | Identity/story/scene/type/prompt/tool/file/rights/status/cost/notes/provider job/idempotency/hash/duration/dimensions/AI/public URL/source/QA/error |
| JSON-in-cell | 03 scene_plan_json is a string containing an array. 05 AE stores raw_result JSON; 04 AF stores alignment JSON; 06 reparses AF but forwards AE as a string |
| Array-in-cell | 02B AJ/AK map arrays directly. VERIFIED V004 AJ/AK are comma/NBSP text, not canonical JSON arrays; exact downstream interpretation remains UNVERIFIED |
| Additional URLs | 00B joins with capital I; 02 uses a different quoted join expression, preserved in its exact mapping appendix. Normalize only through an explicit versioned adapter |
| Times | Voice alignment seconds; asset duration rounded integer ms; shot plan integer seconds; target Project/subtitle timelines integer ms |
| Read/write behavior | Sheet reads use formatted text and varied header spans; most writes USER_ENTERED, AE shot JSON RAW. Numeric/date/formula coercion and unmapped-column preservation require validation |

## Evidence and data-loss ledger

| Source output | Explicitly retained | Not explicitly persisted / uncertain |
| --- | --- | --- |
| 00A discovery | 00B identity/topic/hook/category/reason, some scores, source links/strength, summary and priority | Run summary/scope, emotional/visual/audience/failure/evergreen details, several scores, source date and duplicate terms |
| 01 evaluation | Scores and narrative fields U:AC | Read A:Z differs from write through AC; no immutable evaluation history |
| 02 research | Claim text/ID and source URLs; publisher/type/rights; qualifier Notes; story summary/notes/status | source_id/title, confidence, needs_qualification boolean, uncertainties and overclaim_risks arrays not directly stored |
| 02B review | Safer hook, result/status/notes and correction/guardrail arrays | blocking_claim_ids discarded; no immutable decision/evidence revision |
| 03 package | All 21 package fields and two shorts | Structured inner scene schema only prompt-validated; no production revision key |
| 04 audio | File link, timing JSON, timing-derived duration, review-needed status | Actual cost/usage, content hash, audio decode/timing quality, explicit Asset QA U |
| 05 assets | Shot plan JSON, prompt, motion/timing/text/caution Notes, AI flag/idempotency label | Real hash/dimensions/usage and enforced uniqueness; no initial-shot generation in current routes; historical Shot1 exists |
| 05B retrieval | File/public/source links, rights text and Source ID | Publisher and attribution_required not separate columns; rights/license/attribution concatenated without separators; source page only in Notes on success |
| 06 handoff | Asset metadata plus script/plan/timing/output | No full asset hash/version predicate; only first 20 matching Story assets; no result-to-row update |

Fact Guard claims to review the complete evidence package, but upstream persistence is a projection. Notes may contain some lost information; completeness cannot be assumed. 03 explicitly receives AJ/AK and makes them authoritative, which is a real existing safeguard to preserve.

Source Strength is Strong/Medium/Weak in discovery and an integer scored 0–100 in research; evaluation scores are prompt 0–10, discovery scores 1–10. Fact Status initially Pending verification and later research enum. Publish Recommendation changes from discovery priority to research recommendation. Preserve raw values with producing stage and explicit type/scale; do not silently coerce all to one enum.

## Analytics semantics requiring validation

YouTube Content ID is a channel ID, Format=Channel, Views=lifetime channel count, Followers Gained=total subscriber count. Watch time/average/likes reference only the first daily report row for a two-date window, while Date is now. The expressions reference 9.Data although module interface exposes data; validate before treating zeros as measurements.

Instagram Content ID is media.id and separate Instagram ID is ig_id. Date is media timestamp; Retrieved At is collection time. Total watch divides by 60000 and average watch by 1000; these are configured conversions, not fresh provider-unit verification. Both 10 and 10B append the same metric mapping without publication checkpoint or deduplication. Missing metrics, unavailable insights and genuine zero must remain distinguishable in the target.

## Stable rendering boundaries

1. **Make handoff schemaVersion string 1.0:** jobId/storyId/productionId, format=short, compositionId=ArktrovVideo, shortScript, visualPlanJson string, voiceTiming arrays, assets[] and output 1080×1920/30fps. Exact fields are in [06](make/06.md). Do not reinterpret this as Production V2.
2. **RenderJob/Result contractVersion 1.0:** preserve existing identifiers, idempotency, paths/timestamps/errors and SUCCEEDED/FAILED semantics.
3. **Project schemaVersion 1 / subtitle schemaVersion 1:** integer ms, ordered subtitles, source/AI labels, scene/media identity and voice/audio timeline.
4. **Production contractVersion 2.0-final / schemaVersion 2:** separate existing adapter with its documented constraints.
5. **Queue incoming/processing/completed/failed:** keep legacy claim/retry/result semantics while planning a durable outer boundary. Render success only maps to RENDERED.

See [existing renderer audit](EXISTING_SYSTEM.md) for known source differences, hash omissions, voice-clock trimming and V004 scene-specific rendering. No contract or renderer was changed.

## Target logical model — not installed

## Keys and persistence rules

tenant_id identifies the security boundary; business_id identifies a business within that tenant. All business tables have both and use composite foreign keys, including asset, credential, job and metric references. Global definitions live in separate read-only namespaces. Server authorization and database isolation are both required.

Immutable revision records; UTC timestamps plus explicit business/channel time zone for schedules; integer milliseconds; monetary amounts in integer minor units plus currency; costs at provider precision with normalized accounting amount. Missing metrics are null with a reason, never zero.

| Aggregate | Key fields and relationships |
| --- | --- |
| Business / ProfileRevision | business_id, industry, profile_version, effective_at, answer provenance |
| Brand / RuleRevision | brand_id, rule_id, version, scope selectors, hard flag, origin, status |
| Product / Service / Location | business_id, item_id, price/currency/validity, location time zone/hours |
| Channel / CredentialRef | channel_id, platform, external account id, secret reference, scopes, owner business |
| AssetRevision | asset_id, version, object key, SHA-256, provenance, rights/attribution, AI flag, dimensions/duration |
| Content / ResearchRevision | content_id, topic, research_version; Claim -> SourceEvidence links and qualifiers |
| ProductionVariant | variant_id, content_id, SHORT/LONG, language, script/visual/packaging revision |
| ExecutionPlan / Run | plan_id/version, run_id, business snapshot, policies, compiler/renderer/provider versions |
| Job / Event | job_id, run_id, stage, state/version, lease, attempt, idempotency key, outbox event |
| ProviderCall / CostEntry | provider call id, job/business/content/workflow, usage, estimated/reserved/actual cost, currency |
| RenderCandidate | candidate_id, variant_id, parent candidate, input hash, video hash, renderer version |
| QAResult / Issue | candidate/hash, evaluator/version, gate/status, severity, start_ms/end_ms, evidence, required_fix, component |
| RepairAttempt | run_id, cycle 1..3, from/to candidate, issue links, action and costs |
| ReleaseDecision | candidate/hash, policy version, gate evidence, judge, optional human approval, revoked_at |
| PublishAttempt / Publication | channel, variant, release id, payload hash, idempotency, external post id, reconciliation state |
| MetricObservation | publication, checkpoint, metric, value/unit/denominator, provider definition, observed_at, availability |
| LearningObservation / Experiment | scope, baseline/candidate rule, cohorts, assignment, evidence and evaluation |
| RulePromotion / AuditEvent | old/new rule version, test, rationale, actor, rollback target |

## Uniqueness and concurrency

Unique (tenant_id, business_id, stage, idempotency_key); key derives from full input/asset hashes plus contract, compiler, renderer and policy versions. Job id identifies an attempt, not content identity. Publish uniqueness includes channel/external account + variant + release/payload revision. A timeout after submit enters reconciliation before retrying.

Append-only event log with aggregate version for optimistic concurrency. State mutation and outbox insert in one transaction; consumer inbox deduplicates events. Worker lease and fencing token prevent stale workers committing success. External exactly-once behavior is not assumed.

Gate results reference the candidate's full video hash and input revision. New candidate invalidates release and approvals. Release check and publication claim must be atomic locally; reconcile external uncertainty.

## Legacy mapping

Story Pipeline -> Content/Research; Production Pipeline -> ProductionVariant/Run; Sources -> SourceEvidence/Claim; Asset Library -> AssetRevision; Content Calendar -> Publication; Platform Analytics -> MetricObservation; Automation Control -> Job/ProviderCall; Costs -> CostEntry; Settings -> ProfileRevision; Visual Gate -> scoped policy and evidence.

Keep original external IDs and sheet column mappings in the adapter. Status strings are heterogeneous; the observed transitions above and in STATE_MACHINE.md must be mapped explicitly. Never rename/move existing columns to fit the target.

## VERIFIED runtime data contracts and gaps — 2026-09-13

Evidence and exact coordinates/revision dates: [runtime validation](LEGACY_RUNTIME_VALIDATION.md). No schema was changed.

| Observed data | Runtime conclusion / target protection |
| --- | --- |
| Raw V004 Story ID contains space after ARK-; Production contains another space after PROD- | VERIFIED identity contract; preserve raw ID and separate normalized worker path ID |
| Story moved row20→8; Production row5; Assets reordered | VERIFIED row numbers are mutable locators, not identity or fixed V004 selection |
| Story AD=pass; AJ/AK retained, M research fragment incomplete; no target Sources in inspected revisions | VERIFIED review result exists without replayable evidence package. Store immutable complete research/review bundles and claim-source provenance in target |
| Production AE/AF empty at Voice Ready/Pending QA/Assets Ready in August/Sep2, populated by Sep5 | VERIFIED current blueprint cannot by itself explain history; preserve versioned snapshots rather than infer identical historical code |
| Same AUD…SHORT1-V1 points to old August file and new Sep5 file | VERIFIED logical ID is not an immutable revision; current hash/usage absent. Future AssetRevision binds bytes and provider request |
| Official files end jpg.jpg/png.png; rights strings concatenated without separators | VERIFIED serialization defects; preserve old names in adapter and introduce typed rights/source records later |
| Handoff schemaVersion string1.0, visualPlanJson string, voiceTiming object, nine assets | VERIFIED all four handoff hashes and asset hashes match; eight shots, voice duration53,920ms, visual plan55s, compiled last shot ends53,920ms |
| Four results SUCCEEDED but Production C/AG Queued | VERIFIED result contract is not reconciled into business state; result ingestion must be idempotent and only establish RENDERED |
| Base submittedAt Unix epoch | VERIFIED helper default, not real submission timestamp; startedAt/finishedAt are actual retained execution timestamps |
| Platform Analytics empty; two different YouTube connection refs; S-MASTER timezone America/Los_Angeles | VERIFIED configuration/absence only; account equivalence, Make timezone and runtime metric availability UNVERIFIED |

Proposed mandatory evidence records: full research/review JSON, input/output hashes, schema/prompt/provider versions, attempt/response ID, immutable source snapshot and rights, claim links/confidence/qualifiers/blockers, exact script/plan/timing/audio revisions, asset SHA-256, decision actor, UTC observed/received times, raw legacy status plus producing version. Analytics additionally requires entity grain, period start/end, observation time, timezone, raw units and unavailable reason. These are requirements, not an installed database.

## Final read-only evidence pass — 2026-09-13

VERIFIED mechanism reconfirmed:04 uses fixed AUD-{ProductionID}-SHORT1-V1 without immutable revision, so a new upload may reuse the logical ID; historical cause/retry remains UNVERIFIED. VERIFIED05/05B write QA Pending,06 forwards it, renderer does not update Sheets. Mandatory immutable research/review evidence requirements remain; exact legacy input/output/persistence parity awaits L1/L2.

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

## Processing revisions and evidence identity
Migration 005 adds research_processing_revisions and recovered_research_claims/sources/evidence with composite tenant/job foreign keys and immutable triggers. No provider attempt is created. Normal research_claim_evidence adds relation_id to permit distinct excerpts/type for the same claim/source.
See [Attempt-6 recovery](V005_ATTEMPT_6_RECOVERY.md).

## Phase 2B additive migration 007

script_executions: scoped idempotency key, immutable full canonical input, input/logical hashes, lineage, revision, previous execution and scoped Fact Guard FK. script_response_artifacts: one sanitized recoverable envelope per execution plus hash. script_outcomes: terminal validation/metadata. script_drafts: per-format immutable versioned data/hash, scoped execution FK. production_packages: exact scoped script FK and versioned data/hash. planned_asset_requirements: separate scoped package children; never actual media assets.

Composite tenant/job FKs, positive versions, unique job revisions and format versions, lookup indexes and immutable UPDATE/DELETE triggers cover all six tables. Default restrictive deletes protect history. Successful result/package/asset insertion and state/audit writes share one transaction; response capture commits independently before parsing. Existing research/Fact Guard histories are untouched.


## Phase 2C asset foundation
Generic asset contracts, registry routing and immutable PostgreSQL evidence reuse the modular application. See [Asset contract](ASSET_CONTRACT.md), [Router](PROVIDER_ROUTER.md), [Rights](ASSET_RIGHTS_PROVENANCE.md) and [Manifest](PRODUCTION_ASSET_MANIFEST.md). Native/source/generated capability paths are separated; no business/provider switch exists in the domain. Asset state transitions require stored plan/manifest proof. Publication HOLD remains independent; no renderer/publishing implementation. PCM16 WAV and PNG are the implemented byte decoders; other vendor codecs require adapters. Voice profile missing is a live-production blocker, not a reason to invent a voice.


## Optional business voice profiles

See [Business voice profiles](BUSINESS_VOICE_PROFILES.md). Composition-driven zero/one/multiple voice requirements replace the mandatory-voice assumption for new plans. Business-scoped immutable profile revisions and explicit human approval are required for synthesis; historical values are candidates only. No provider defaults, credentials, live calls or historical artifact rewrites. V005 retains its narration requirement and VOICE_PROFILE_MISSING blocker.
