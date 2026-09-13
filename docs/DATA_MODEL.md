# Data model

Logical design only; no migrations have been installed.

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

Keep original external IDs and sheet column mappings in the adapter. Status strings are heterogeneous and must be mapped explicitly after blueprint audit. Never rename/move existing columns to fit the target.
