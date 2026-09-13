# Learning system

Proposed policy workflow. Production code is never rewritten autonomously.

OBSERVATION -> HYPOTHESIS -> PROPOSED_RULE -> TEST -> PROMOTION, with REJECTED, DISABLED and ROLLED_BACK alternatives. Each step retains evidence, actor, timestamp, version and scope.

## Evidence

Pre-publish: technical/video QA, repair history, independent judge, human correction/approval/rejection.
Post-publish: views/impressions, viewed-vs-swiped, retention at 1/3/10s, average watch time, completion, rewatches, likes/comments/shares/saves, follows/profile visits, CTR and conversions.
Context: topic/story, hook and first visual, title/caption/cover/thumbnail, platform, format/length, time, music, voice/style, CTA and policy versions.

Observe at supported checkpoints (proposed 1h, 6h, 24h, 72h, 7d). Keep raw provider definition and normalized units, denominator, window and availability. An unavailable metric stays null. Do not compare incompatible metrics or infer causal explanations from one video.

## Controlled experiments

Hypothesis states mechanism, scope, baseline rule, proposed change, primary outcome, minimum useful effect, guardrails, sampling and evaluation horizon before assignment. Compare multiple productions in matched/randomized cohorts where feasible; account for topic, age and platform differences. Minimum sample and statistical/practical thresholds require calibration and must be approved/versioned before autonomous promotion. Never promote from one video.

A performance analyst records likely causes with confidence and alternatives, e.g. a retention drop aligned with a scene transition. Correlation remains explicitly a hypothesis until tested. QA feedback can propose renderer improvements, but structural code changes require a normal reviewed, tested change.

## Rule scopes

GLOBAL, INDUSTRY, BRAND, PLATFORM and FORMAT are selectors, not a license to overwrite each other. Applicable hard constraints are combined conservatively; conflicting hard constraints block planning. Soft rules follow explicit priority/version and scoped experiment assignment; ambiguous conflicts require review.

A ZHEM result does not mutate ARKTROV rules. Promotion to global requires evidence across eligible businesses/use cases, reviewed applicability and aggregated privacy-safe inputs. Never share raw tenant data or credentials.

## Promotion and rollback

Store rule_id/version, experiment, content_id, business/brand, platform, format, performance and baseline. Pin rule versions in runs. Promotion creates a new active version with reason and effective date. Rollback changes the active pointer for future runs; historical evidence is immutable and prior artifacts retain lineage. Rules can be disabled without deleting observations.

Hard rules for facts, safety, copyright, sources, platforms, compliance, brand safety, disclosure and privacy are non-tunable. Bounded parameter tuning is allowed only inside pre-approved ranges with costs and audit. No evidence => no automatic change.
