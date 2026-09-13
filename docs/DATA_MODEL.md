# Data model

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
| Array-in-cell | 02B AJ/AK map arrays directly. Runtime serialization and 03 interpretation need fixtures; do not assume canonical JSON |
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
| 05 assets | Shot plan JSON, prompt, motion/timing/text/caution Notes, AI flag/idempotency label | Real hash/dimensions/usage and enforced uniqueness; no initial-shot generation |
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
