# V005 offline web-search budget correction

## Attempt 4 evidence and limits

VERIFIED: PostgreSQL records attempt 4, run 889efbaa-c063-4b4d-a1ec-456145307ec5, execution revision 2, FAILED. HTTP 200, response status completed, five top-level web_search_call output items, request configuration max_tool_calls=4. The normalizer stopped at C_WEB_SEARCH with OPENAI_WEB_SEARCH_NOT_VERIFIED. Canonical research validation was never completed; completed provider status does not prove the research result was valid. No canonical sources, claims or evidence relations were saved.

The actual executed adapter serializes max_tool_calls:this.#config.max_tool_calls in the POST JSON body. Its injected launcher transport forwards that body unchanged to fetch. The persisted request configuration is 4; the offline legacy request capture test also confirms serialized value 4. Therefore this was request wiring AND local enforcement, not only a post-response local limit. No sanitized historical HTTP body capture or provider echo of max_tool_calls was retained: transport bytes cannot be independently replay-verified from the receipt. No raw response, per-tool IDs or statuses were retained either. Five emitted items versus four processed calls cannot be further reconciled from the available historical evidence.

UNKNOWN: the exact provider-side reason five items were emitted. Do not label it a proven OpenAI bug, invent an ignored setting, or assume every emitted item was processed successfully. A second failing branch (non-completed item) may also have applied historically because the old guard combined conditions. Five items exceeding four is a independently proven rejection condition.

Official [Responses API reference](https://developers.openai.com/api/reference/cli/resources/responses/methods/create) defines max_tool_calls as the total processed built-in tool calls across tools; further model attempts are ignored. It does not explain this historical response. No external provider requests were made to investigate.

## Counting and correction

Count only top-level output items with type web_search_call. Do not count nested sources, citations, queries, action open/find metadata, reasoning, or assistant messages. Only web_search is enabled by this adapter, so this is the count for its enabled built-in tool. Counting output items remains a conservative local safety ceiling; metadata cannot prove server execution of every item.

ARKTROV profile arktrov-deep-research version 1.1 explicitly sets max_tool_calls=8 in src/config/research-provider-profiles.js. src/config/openai-research.js selects the profile or an explicit environment override. Generic default remains 4. The local configuration safety range is 1..16, expanded from 1..6 to permit the authorized eight; 16 is a local admission ceiling, not a claimed OpenAI limit. .env.example mirrors 8 without credentials. Model gpt-5.6-sol, output budget 16000 and medium reasoning are unchanged. Domain, state machine and Business Core contain no tool budget.

Request and validator use the same validated config object. No request-wiring fix was necessary. Five calls under eight pass tool-budget validation; nine reject with TOOL_BUDGET_EXCEEDED. Missing/non-completed searches still reject separately. Source provenance, schema and domain validation remain mandatory.

New safe diagnostics include request_max_tool_calls, tool_budget_limit, observed_web_search_calls and completed_web_search_calls; parser revision responses-parser/2.1 distinguishes the new guard. Failure diagnostics/usage persist through PostgreSQL and restart. No automatic retry.

## Read-only preparation

- Lineage: 5a5c47cb-e5eb-4f5c-b720-b30238d3c3ec
- Logical input hash: 48aaf382595d6a5b98ea02733ac28bc19e6dc0963787bab020d723437c582460
- Previous run: 889efbaa-c063-4b4d-a1ec-456145307ec5
- Prepared attempt: 5; prepared execution revision: 3
- Old execution hash: bc88e554536892041b31ba8c35e0c2d6c10ae7f4c653017175315d2ec5049e9c
- New execution hash: 86bb6fc69e9deacc1cc8bd19633fab3d538ab098c4e6c04d20617fc2f649550f
- New revision-scoped identity: research-revision:fef44dfaa400f7dfbc6e67c83f53ff882a18ca085f603aac3b5ddba8e10d2362
- Changed configuration fields: provider.configuration.max_tool_calls, provider.configuration.profile_version
- Full historical-row snapshot hash before/after: 932b357e7007888748bf2437002dfa49da9be91d53819ba880e89d0293862f3d

Preparation used the normal read-only service planner, an empty credential callback and a transport that always refuses execution. Attempts 1–4 and all historical job/evidence rows remained identical. No attempt 5 or revision 3 row was created; allocation remains atomic at a separately authorized execution. No Fact Guard, Make, renderer or Phase 2B work.

## Offline coverage

TOOL01–08 cover serialized request alignment, profile/default/override separation, domain neutrality, nested metadata counting, five/eight/nine call boundaries, missing/failed searches, execution hash change, legacy-four wiring and single-dispatch guard. TOOL DB tests verify failure persistence after restart and attempt 5 / revision 3 with immutable prior history and same-key changed-input conflict. Existing lineage concurrency, tenant, state, incomplete-response and canonical validation suites remain required.

## Verification result

Full regression: 161/161 PASS in run 1 and 161/161 PASS in run 2; 24/24 Phase-1 and 25/25 Phase-2A requirement mappings verified. Native build 34 modules PASS. Secret check PASS including untracked source/docs. Make 12/12 originals / 81 modules unchanged. Renderer 31/31 reference hashes unchanged. Zero new live calls; no Attempt 5, Fact Guard or Phase 2B execution.

READY_FOR_SINGLE_ATTEMPT_5 = YES (technical readiness only; requires separate live authorization).

## Superseded raw-count rule
Attempt 5 established 9 total items but 8 completed. The raw-count ceiling and blanket unfinished-status rejection described above are superseded by the [completed-call semantics correction](V005_TOOL_BUDGET_SEMANTICS.md). Budget remains 8 and profile remains 1.1.
