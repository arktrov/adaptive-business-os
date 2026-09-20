# Script contract 1.0

Adaptive Business OS remains business-agnostic. Businesses provide configuration, data, objectives, audience and immutable policies. The service automatically composes format-specific scripts and production plans. Customers do not wire modules.

## Authoritative input

ScriptRepository.input loads the latest persisted successful Fact Guard, verifies request/output/scope hashes, human scope binding and the exact tenant/job-scoped brand and quality evidence snapshots. Input includes admitted canonical claims, contextual limitations, immutable relation/source references, approved/blocked/context IDs, exact qualifiers, guardrails, publication HOLD, objective, audience, language, platform profiles, production policy, workflow/prompt versions and provider configuration. Unfiltered ResearchResult is never sent to the Script provider. Blocked statements are not passed as usable facts. Guardrails can name prohibited claims and qualifications as prohibitions.

## Deterministic factual boundary

The initial production-safe realization mode is closed-world/extractive. The provider selects and orders admitted claims; factual text must equal a whole canonical statement followed by its complete mandatory qualifier. Context-only text additionally requires the configured limitation label. Non-claim prose must equal an explicitly configured neutral phrase. This prevents invented numbers, names, dates, causal additions, dropped caveats and untraceable factual captions. It is deliberately conservative: arbitrary paraphrasing, translation and stylistic semantic judgments are not automatically certified. Such output fails closed to SCRIPT_REVIEW_REQUIRED. A future reviewed realization catalogue requires its own immutable approvals; no such approval is manufactured here.

Hook/body/ending are required, and every factual segment references the claim and all its immutable evidence/source identities. Captions/on-screen factual excerpts are not independently generated; narration-led subtitle planning carries the same text. Exact source wording can be lengthy; profile duration is enforced after selection, never by truncating qualifiers. Human creative review remains necessary for hook quality and natural language. SCRIPT_APPROVED_FOR_PRODUCTION means the deterministic planning contract passed, not publication or full-video QA.

## Versioned records

Immutable ScriptDraft contains identity/version/format/profile/language/target, hook/body/ending/optional CTA, complete voiceover, claim and guardrail usage, estimated duration, provider/model/request, workflow/prompt/policy versions, input/output hashes, lineage/revision, timestamp, validation and HOLD. Duration is a word-rate planning estimate, not synthesized voice timing.

One logical lineage per job/stage, monotone execution revision under a job advisory lock and unique DB constraints. Every new revision names the previous terminal execution. Same key and same input reuses a successful result; changed input conflicts; failed/running results never become success cache hits. A new key cannot silently start another paid attempt. Relevant scope, prompt, policy, profile and provider changes alter the complete input hash. No failed or successful historical row is updated.

## Paid response recovery

One Responses request, no tools and no automatic retry. Model/budget/effort are provider configuration. A hash-pinned single-call permit and session credential are required before admission. No key is serialized. Success envelope is sanitized, committed to script_response_artifacts and read/hash-verified before final content JSON parsing/validation. Reasoning items retain only safe identifiers, never private text; token counts remain. Parsing/schema/completion failures retain the sanitized artifact. Redacted content is intentionally not eligible for recovery. HTTP/envelope transport corruption may contain no recoverable final structured output and must never be represented as recovered.

reprocessScriptResponse(artifact,input) is pure offline validation with zero transport and no historical writes. scripts/reprocess-script.mjs loads only scoped persisted data and invokes it.

Responses Structured Outputs uses text.format/json_schema/strict. Official reference consulted: https://developers.openai.com/api/docs/guides/structured-outputs . Structured schema conformance is not factual correctness; local validation remains mandatory.
