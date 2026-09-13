# Business Core and onboarding

Status: proposed model. Business facts are entered once and consumed through versioned snapshots.

## Entities

Business identity/industry; Brand; Audience; Products; Services; Locations; Channels; Assets; BrandRules; ComplianceRules; ContentRules; PublishingRules; Goals; Budgets; ProviderBindings; CredentialReferences; AnalyticsSources. All belong to a tenant and business, except explicitly curated global capability definitions.

Brand configuration owns logos, palette, typography, language, tone and treatment presets. Rule definitions include origin, scope, version, effective dates, hardness and precedence. Product price has currency and validity interval; location has time zone and opening-hour exceptions. Unknown data stays unknown, never invented.

## Onboarding interview

Start with business name, industry, offerings, audience, countries/languages, goals, competitors, differentiation, website, social accounts and existing assets. Gather logo/colors/design, tone, allowed and forbidden topics, compliance, budget/currency, platforms/cadence, SHORT/LONG/BOTH, duration, voice/avatar preference, real/stock/AI media, source requirements and approval/autopublishing preference.

Question definitions have stable questionId, schemaVersion, type, requiredWhen, visibleWhen, dependencies, validation and targetCoreField. Store answer provenance, confirmation state and timestamp. Follow-ups depend on industry + goal + prior answers. Revising an answer invalidates dependent assumptions and regenerates a plan proposal; it does not silently update a running job.

Example branches:
- Science media: evidence strength, claim verification, uncertainty language, faithful packaging, AI reconstruction/diagram disclosure.
- Gastronomy: products/prices/offers, locations/hours, food photos, local audience, orders and signage needs.
- Regulated or restricted content: require a reviewed domain policy before execution.

These are module examples. ZHEM is not provisioned or accessed in Phase 0.

## Execution plan

Plan contains business/profile revision, goals, selected capabilities, typed dependencies, required inputs, channels/formats, estimated costs, budget ceiling, gates, schedule and approval policy. The capability registry declares supported formats, provider needs, input/output contracts, mandatory gates and test status. Unsupported requested capabilities yield a visible blocked item, not an invented implementation.

Validate acyclic dependencies, complete prerequisites, tenant ownership, budget, provider availability and immutable hard rules. Explain to customers: find content -> check -> produce -> review quality -> publish -> learn. Keep transport/API/node details internal.

SHORT/LONG are independent variants of one content idea. BOTH reuses a research snapshot, not a shared render approval. Snapshot all versions at run start; future profile updates apply only to new/replanned runs.
