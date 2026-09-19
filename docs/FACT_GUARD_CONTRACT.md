# Fact Guard contract — Phase 2A, version 1.0

Fact Guard is an independent provider invocation after a fully persisted COMPLETE research package. It is not the Research provider, a script writer or a release gate. The local implementation is a deterministic contract fixture, explicitly labelled in persisted metadata and UI; no independent live web verification is claimed.

Input includes the exact persisted research_run_id, research_output_hash, entire ResearchResult (claims, sources, evidence, uncertainties and risks), pinned policy and known guardrails. The input research reference has a composite foreign key to a same-business/job outcome. The coordinator requires the latest RESEARCH_COMPLETE revision and forbids incomplete research. Caller-supplied substitute claims are not used.

Output contains decision PASS / REVIEW_REQUIRED / REJECT, required_corrections[], script_guardrails[], approved_claims[], blocked_claims[], warnings[], reasoning_summary, approved_hook. Unknown fields and private reasoning are rejected. Claims must exist in the input; approved and blocked IDs are disjoint. PASS requires every claim approved and zero blocked claims; incomplete research cannot pass. Corrections can remain enforceable instructions for later scripting; no script is built here.

Decision maps deterministically to FACT_GUARD_PASSED / REVIEW_REQUIRED / REJECTED. Output, hashes, versions, request/response metadata, timestamps, attempt identity and state audit commit atomically before the new state is observable. Provider, parsing and persistence failures become FAILED; explicit retries append attempts. Idempotency and immutability use the same generic repository protocol as Research, not duplicated provider-specific rules.

Audit carries business, job, run, service actor, workflow, prompt and policy versions. The detail API/UI exposes all outcomes and corrections/guardrails without fabricating missing values. Historical responses remain readable after process restart.

Future real adapters must independently spot-check high-risk claims according to policy. Synthetic PASS demonstrates the pipeline mechanics only. It never grants release or authorization to publish. Existing release bypass protection remains enabled.

Legacy mapping: pass/Approved -> PASS; hold/On Hold -> REVIEW_REQUIRED; reject/Rejected -> REJECT. Retain safe hook, required corrections, script guardrails and all blocker IDs. Do not reproduce Make's discarded blocker arrays, overwritten evidence or contradictory statuses.
