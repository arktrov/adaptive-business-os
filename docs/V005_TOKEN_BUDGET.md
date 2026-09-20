# V005 output budget preparation

No live request is authorized or executed by this change. Attempts 1–3 stay FAILED; attempt 3 failed at B_COMPLETION_STATUS with incomplete/max_output_tokens. No partial canonical output was persisted.

## Verified previous configuration

All three stored operation requests use max_output_tokens 6000. src/config/openai-research.js supplied a configurable environment override OPENAI_RESEARCH_MAX_OUTPUT_TOKENS with default 6000 and a hardcoded validation ceiling of 8192. The request builder read the configuration, not a Domain constant. .env.example also contained 6000. No reasoning effort appeared in the configuration or request builder, so no explicit effort was sent. Current official model documentation lists medium as the provider default; the exact historical server-selected effort was not retained and is not asserted here.

## Prepared profile

src/config/research-provider-profiles.js defines arktrov-deep-research version 1.0: OpenAI, gpt-5.6-sol, max_output_tokens 16000, reasoning_effort medium, response_style concise-evidence. Select it through OPENAI_RESEARCH_PROFILE=arktrov-deep-research or openAIResearchConfig({OPENAI_RESEARCH_PROFILE:'arktrov-deep-research'}). Explicit model/budget/effort environment overrides take precedence and enter the request descriptor/hash. Unknown profiles or efforts fail closed. Generic unprofiled configuration retains its previous 6000 default and omitted reasoning field; other businesses can select other profiles or explicit budgets. .env.example documents the intended deep-research profile; it contains no credentials and is not automatically loaded.

The provider config ceiling is now 128000, matching the documented gpt-5.6-sol maximum. That is a validation limit, not a selected spending budget or a guarantee for arbitrary other models. The prepared profile uses 16000. The adapter sends reasoning.effort medium explicitly. This is a bounded effort preference, not a guaranteed numeric cap on reasoning tokens. No model change, no domain/state-machine business special case. Tool count and timeout remain unchanged.

[Official model contract](https://developers.openai.com/api/docs/models/gpt-5.6-sol), reviewed 2026-09-20, supports the selected output budget and medium effort. No account/model probing request was made.

## Efficient output without reducing the contract

Profile-specific provider instructions request concise structured evidence: brief summary, atomic claims, short sufficient source excerpts, stable IDs instead of repeated narrative. They explicitly preserve significant findings, qualifiers, claims, sources, evidence relations, uncertainties, contradictions, open questions, verification status and source strength. Generic researchPrompt 1.0, policy snapshot and strict ResearchResult schema remain unchanged. The effective provider-instructions hash includes the new profile instructions. No trimming, repair or acceptance of partial output.

Incomplete/max_output_tokens remains FAILED. Existing safe diagnostics retain response status/reason, request ID, usage including reasoning tokens, model, duration and tool usage. Tests exercise both incomplete and completed fixture responses with the actual 16000/medium request. No automatic retry is introduced.

## Attempt 4 admission is not yet ready

Budget, explicit effort, profile and effective provider-instructions changes are part of the full canonical request hash. The confirmed business input can remain identical while the execution hash changes. Existing ResearchRepository.begin correctly refuses changed execution configuration under the original idempotency key, including retry:true. A real PostgreSQL regression proves no dispatch and no new attempt or history mutation on this conflict.

The current attempt number is scoped to research_operations. Simply using a new key would start attempt 1 in another operation, not the required audited continuation as attempt 4. Do not overwrite historical research_operations, weaken the hash check, forge a previous descriptor, or silently switch keys. REVIEW_REQUIRED: define and implement an explicit versioned-operation continuation that records the revised configuration/hash and preserves the job-level attempt sequence before generating an attempt-4 launcher. This exceeds a provider-budget-only change and has not been implemented here. READY_FOR_SINGLE_ATTEMPT_4 = NO until that admission path is resolved and tested.

The five web_search_call items reported by attempt 3 are retained as evidence. Existing tool validation and timeout are unchanged; this change does not claim a larger output budget guarantees a complete future result.


Verification: full Run 1 = 134/134 PASS; full Run 2 = 134/134 PASS, including 24/24 Phase-1 and 25/25 Phase-2A requirements. Secret check (tracked/new files), syntax/build and foundation PASS. Renderer 31/31 reference hashes and Make 12/12 originals unchanged. Real V005 job snapshot unchanged: three FAILED attempts and zero Fact Guard runs. No live call. Logs: .local/token-budget-acceptance.log.


## Superseding lineage implementation

The owner-authorized explicit versioned retry path is now implemented and verified. The former REVIEW_REQUIRED admission blocker above is resolved by [research lineage](RESEARCH_RETRY_LINEAGE.md), preserving same-key conflict checks. Read-only preparation yields attempt 4 / execution revision 2 with the deep-research profile. No live request is authorized or executed by this preparation.
