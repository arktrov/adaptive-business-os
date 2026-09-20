# OpenAI Research connection preparation

Scope: adapter preparation only. No live OpenAI request, V005 ResearchRun, Fact Guard or Phase 2B execution is authorized by this change. V005 remains RESEARCH_PENDING. The existing 76-case Phase-2A baseline remains the regression gate.

## Credential boundary

OPENAI_API_KEY is read only from the server process environment immediately before dispatch. It is held in private adapter scope and placed only in the HTTPS Authorization header to the fixed api.openai.com endpoint. No base-URL override is accepted. Redirects are rejected. Credentials never enter describe(), the canonical request/hash, provider metadata, evidence, UI, error messages or logs. No env-file auto-loading, credential creation, user/global environment mutation or secret file write occurs.

.gitignore already excludes .env and .env.* except the example, plus private key files. .env.example contains an empty OPENAI_API_KEY placeholder. scripts/set-openai-session.ps1 is an optional, unexecuted masked local prompt; dot-source it in the PowerShell process that will later launch the app. It sets only that process environment, never command history or Git. Closing the process removes that session value. Do not paste keys into chat, commands, application forms or evidence.

## Adapter and official API contract

OpenAIResearchProvider implements the existing describe()/execute() port. Domain, persistence, State Machine and Fact Guard remain unchanged. The HTTP server continues to use its existing local adapters; adding a credential does not activate OpenAI or expose a live HTTP/UI route.

The adapter uses a single POST to the [Responses API](https://developers.openai.com/api/reference/cli/resources/responses/methods/create), with store:false, background:false, strict text.format JSON schema, required live web_search and web_search_call.action.sources. Model defaults to the requested gpt-5.6-sol in configuration; no model name enters the domain. The [model documentation](https://developers.openai.com/api/docs/models/gpt-5.6-sol) lists Structured Outputs and Responses web search support. No account-specific availability claim is made without the later authorized request.

The [Web Search guide](https://developers.openai.com/api/docs/guides/tools-web-search) documents required search and consulted sources; [Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs) defines the strict response format. The adapter rejects incomplete, refused or malformed responses, missing completed search calls, invalid canonical research and source URLs not represented in the web-tool sources/citations. Source discovery proves provenance, not the truth of a claim. The prompt requires independent verification of the owner-supplied starting references and adherence to the pinned ARKTROV policy. Raw provider envelopes and reasoning items are discarded.

## Bounded dispatch and audit

Central configuration: OPENAI_RESEARCH_MODEL, OPENAI_RESEARCH_MAX_OUTPUT_TOKENS (default 6000, ceiling 8192), OPENAI_RESEARCH_MAX_TOOL_CALLS (default 4, ceiling 6), OPENAI_RESEARCH_TIMEOUT_MS (default 120000, ceiling 180000). Input is limited to 64 KiB and HTTP response to 2 MiB. One HTTP request may contain several bounded web-search tool calls; the allowance is one Research request, not one search query. There is no automatic retry, continuation, fallback model or follow-up Fact Guard call.

prepareSingleOpenAIResearch is read-only. It validates the persisted confirmed input representation/hash, tenant/job/format, workflow and policy snapshots, and computes the full execution hash including prompt plus adapter/schema/instruction/configuration hashes. The admission-input hash and full execution hash are deliberately different scopes. It requires exactly one unambiguous confirmed input and no prior OpenAI attempt for this job.

The separate runSinglePreparedResearch function is not wired to startup, HTTP or UI. A later authorized caller must supply the exact freshly prepared approved_request_hash and a usable process credential. It uses the existing ResearchService and fixed input-derived stage key with retry:false. Before HTTP, the adapter verifies a permit against the sole persisted RUNNING OpenAI attempt: business/job/run, key, canonical hash, workflow, prompt, policy and provider configuration. The instance allowance is consumed before transport; database attempt history blocks another prepared invocation after failures/restarts. Existing repository idempotency rejects changed inputs under the same key. A timeout or ambiguous response requires separate reconciliation and authorization, not a new key or blind retry.

Returned metadata contains sanitized request/response IDs, provider/model, duration, token counts, cached/reasoning token counts, web-tool count and consulted URLs, and retry count 0. It passes through the existing usage object so no persistence-contract change is needed. Estimated/actual cost remains null with an explicit availability reason: the response does not establish billed cost and no unverified price table is assumed. Output-token/tool caps bound the request, not a guaranteed dollar amount. Provider/parse failures fail closed through the current service; they do not manufacture usage or success evidence.

## Verification

Tests use injected local transports and non-credential sentinels only; never the real OpenAI endpoint. Unit/contract cases check request shape, port compatibility, credential omission/echo rejection, errors/refusals, timeouts, source provenance, schema closure, configuration changes and one-request behavior. Dedicated PostgreSQL cases exercise read-only preparation and adapter output through the actual persistence/idempotency path. Existing Phase-2A tests still cover tenancy, restart, migration, UI and state/evidence atomicity.

Final test results and secret/reference checks are recorded in TEST_MATRIX.md. Live compatibility, credentials and account limits are intentionally untested. Missing credentials keep READY_FOR_SINGLE_V005_LIVE_RESEARCH_RUN = NO until secure setup and separate user authorization.
