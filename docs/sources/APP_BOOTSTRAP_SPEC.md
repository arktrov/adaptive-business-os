# Adaptive Business OS — Bootstrap Specification

## Purpose
Build a reusable autonomous business-content system that can first run ARKTROV, then ZHEM, and later other businesses without customers wiring workflows manually.

## Core Product Rule
The user configures goals and constraints through guided questions. The system converts those answers into a business profile, selects or assembles the necessary workflow modules automatically, and executes them end-to-end.

## User Choice
For each content workflow, the user must be able to choose Short, Long, or both. The system may recommend a format, but the user retains control.

## End-to-End Content Loop
Discover/ingest ideas -> research -> fact/brand guard -> hook & packaging gate -> script -> asset plan -> asset generation/retrieval -> voice/audio -> render -> deterministic technical QA -> multimodal video QA -> repair loop -> independent final judge -> publish only after release gate -> collect platform analytics -> analyze performance -> learn -> improve future planning/rendering/packaging.

## Release Gate
A render is NEVER equivalent to publish approval. Publishing is allowed only when all mandatory gates pass. At minimum: technical, factual, visual, audio, mobile-readability, branding, and independent final-video judge. Failed checks produce structured issues with severity, timestamps, affected component, and required fix. Repairs are targeted, re-rendered, and re-checked. Repeated unresolved critical failures stop at NEEDS_REVIEW rather than publishing.

## Learning System
The system must learn from both pre-publish evaluators and post-publish analytics.

### Inputs
- deterministic QA failures
- multimodal QA findings
- human approvals/rejections and corrections
- platform metrics after publishing
- hook/retention curves
- viewed-vs-swiped / impressions-to-view signals
- average view duration / completion
- engagement, comments, saves, shares, follows/conversions
- title/caption/thumbnail/cover variants
- channel, audience, format, topic, length, posting time

### Learning Outputs
Maintain a versioned rules/policy layer per brand and a global reusable layer. Examples:
- hook patterns that retain viewers
- visual pacing rules
- subtitle placement/size
- source-figure treatment
- BGM/SFX mix targets
- preferred duration by topic/platform
- packaging patterns
- platform-specific posting/caption rules

### Safety Rule: no uncontrolled self-modification
The system must not directly rewrite production code or permanently change core policy because one analyzer disliked one video. Learning changes follow:
1. Observe evidence across runs.
2. Propose a versioned policy/rule change with evidence.
3. Test against benchmarks/historical jobs or a shadow run.
4. Promote only after validation thresholds pass.
5. Keep full audit trail, version, rationale, and rollback.
6. Critical factual/safety/brand constraints can never be weakened automatically.

The system may autonomously tune bounded parameters (for example music bed level, motion intensity, subtitle density, hook duration, posting-time preferences) inside pre-approved safe ranges. Structural code changes require tests and staged promotion.

## Post-Publish Analytics Loop
Publishing creates an observation job. Metrics are collected at platform-appropriate checkpoints (for example early, 24h, 72h, 7d where available). The analysis layer compares actual results with predicted quality scores and prior content. It identifies likely causes, not just correlations, and writes structured lessons into the brand policy store.

## Brand Isolation + Transfer Learning
- ARKTROV has its own brand profile, audience, tone, evidence rules and renderer policy.
- ZHEM has its own brand profile, products, local audience, conversion goals and creative policy.
- Useful generic lessons may graduate to a global rule only after evidence across brands/use cases.
- Brand-specific learnings must never leak automatically into another brand when inappropriate.

## Customer Experience
Customers never see or connect workflow modules manually. The onboarding interview gathers company, industry, audience, goals, brand, channels, compliance, content formats, budget, cadence, approval preference, and available assets/accounts. The system assembles the workflow and explains only the relevant high-level plan.

## Architecture Direction
- GitHub: authoritative technical source of truth
- versioned docs: MASTER_STATE.md, ARCHITECTURE.md, DECISIONS.md, ROADMAP.md, QUALITY_GATES.md, LEARNING_SYSTEM.md
- durable backend/workflow engine, database, object storage, queue/retries/idempotency, Remotion rendering, provider integrations, publishing connectors, analytics ingestion
- Make is transitional only and must not be required in the final normal production path

## Initial Build Order
1. Repository + canonical docs + schemas
2. Business Core / onboarding questionnaire / brand profile
3. Content-job state machine supporting Short / Long / Both
4. ARKTROV pipeline migrated behind this core
5. Render QA + repair + final gate
6. Publisher abstraction
7. Analytics ingestion + learning store + policy versioning
8. ARKTROV production test with Video 005
9. ZHEM onboarding and second-brand test

## Non-negotiable Principle
READ -> VERIFY -> PLAN -> BUILD -> TEST. Current code, schemas and live contracts are source of truth. Prefer minimal changes, version decisions, and prevent repeated rebuilds from stale assumptions.
