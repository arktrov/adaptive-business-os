# Research lineage and explicit execution revisions

## Identities and invariants

A logical research request is tenant + ContentJob + the complete canonicalized research input. Topic normalization is unchanged (NFC/trim); other input fields, including core question, remain significant. The lineage retains the exact logical_input JSON and exposes logical_input_hash = SHA-256 of the existing canonical serialization. The root research operation UUID is the stable lineage_id. One research lineage per ContentJob is deliberately conservative: a changed logical input is rejected as a retry and needs separate explicit job/admission work. Nothing infers a new lineage from a new key.

canonical_input_hash is a historical name for the complete execution request hash. It continues to include business/job, operation, input, provider/model/configuration, prompt, policy and workflow snapshots. It is not renamed. Budget, reasoning, effective provider instructions and tool configuration change this hash. A token-budget-only change leaves logical_input_hash unchanged but creates a different execution request identity.

A research_operations row remains the immutable execution/idempotency identity. research_execution_revisions assigns it to a lineage and monotonically increasing execution_revision. research_attempt_lineage maps each immutable ResearchRun to that lineage/revision and its global attempt_number; existing research_attempts.attempt now continues across revisions in that same lineage. Repeating exactly the same request uses the ordinary explicit retry and keeps its revision; changed execution uses the separate revision path. Fact Guard numbering and APIs remain unchanged.

## Service paths

ResearchService.prepareResearchRunRevision({business_id, content_job_id, input, previous_run_id, reason, explicit_retry:true}) performs read-only planning. It returns lineage_id, logical_input_hash, previous_run_id, next attempt_number, next execution_revision, old/new request hashes, changed execution field paths, the new derived idempotency key and request. It allocates no Run ID and writes no data. A preview is not a reservation or permission to execute.

ResearchService.retryResearchRunWithRevision with the same parameters revalidates all conditions inside the existing per-job advisory lock and the job-row transaction. It accepts only the latest persisted FAILED research attempt of the same business and job, identical logical input, a changed complete execution hash, a bounded nonempty safe reason and explicit_retry:true. Provider incompleteness is already stored as FAILED. A running/unrecorded outcome is not silently recovered through this path. Ordinary interrupted recovery retains its existing explicit path.

The revision identity is research-revision:SHA256({lineage_id, previous_run_id, new_request_hash}). Callers do not choose an arbitrary replacement key. Repeated concurrent revision requests for the same predecessor cannot allocate two attempts; after one wins, the other fails STALE_RESEARCH_REVISION, even if the winning call failed. There is no automatic second dispatch. Ordinary same key + changed hash always remains IDEMPOTENCY_CONFLICT. Ordinary new keys on an existing research lineage fail EXPLICIT_REVISION_REQUIRED; keys from superseded revisions fail STALE_RESEARCH_REVISION. Retrying the latest revision unchanged continues global numbering with the same key/revision.

Definitions still require a new prompt/policy version for changed definition content; lineage does not bypass immutable version checks. All existing canonical output validation, transaction commit, state guards and failure handling remain active. There are no direct status writes outside PostgresStore.transitionInTransaction. The revision service is not added to public HTTP/UI routes or automatically to a pipeline. For future OpenAI execution, the caller must still supply the exact authorized attempt and dispatch permit, compare the approved request hash, enforce a one-call transport allowance, and stop before Fact Guard.

## PostgreSQL enforcement and migration

004_research_lineage.sql is additive. It creates research_lineages, research_execution_revisions and research_attempt_lineage, scoped composite foreign keys, unique lineage/revision and lineage/attempt constraints, and immutable UPDATE/DELETE triggers. Revision insertion locks its lineage, requires matching scoped research input, the next revision and the latest FAILED predecessor. Attempt insertion locks the lineage, requires the next global attempt number and a failed prior outcome, and atomically inserts the membership row. The membership's composite foreign key includes the original attempt number, preventing contradictory numbering.

The migration maps existing research_operations and attempts without UPDATE/DELETE of any original row. Existing request hashes, keys, Run IDs, attempt numbers, outcomes, timestamps and state events remain intact. It fails atomically on ambiguous historical logical inputs or conflicting old attempt numbering rather than guessing or rewriting history. Existing reads gain additive lineage fields; the stored historical rows do not change. Apply migration before running the updated server/repository; quiesce old writers during upgrade. The transaction/advisory migration lock and repeat-safe migration runner remain unchanged.

The LINEAGE16 upgrade fixture starts at migration 003 with three failed attempts, applies 004 twice through the runner, verifies every original row unchanged and prepares attempt 4. LINEAGE17 verifies rollback on conflicting legacy logical input.

## Audit

The centrally persisted RESEARCH_RUNNING event includes lineage_id, logical_input_hash, previous_run_id, new_run_id, attempt_number, execution_revision, old_request_hash, new_request_hash, revision_reason and changed_execution_fields. Existing occurred_at provides the timestamp. Only field paths, not old/new provider values, are copied into this delta list; request snapshots remain in the immutable operation. Failure or rollback cannot leave a partial revision/attempt/audit/state transition. Generic provider errors continue to use sanitized diagnostic metadata.

## Actual V005 preparation — no execution

The local migration was applied after the full regression passed twice. Before/after hashing of all original V005 job, audit, input/artifact, operation, attempt, outcome and evidence rows confirms unchanged history. Attempts 1, 2 and 3 remain FAILED; no new attempt or Fact Guard exists.

- lineage_id: 5a5c47cb-e5eb-4f5c-b720-b30238d3c3ec
- previous_run_id: 413f4263-cdb0-4db6-917b-b9b31dc85357
- prepared attempt_number: 4
- prepared execution_revision: 2
- logical_input_hash: 48aaf382595d6a5b98ea02733ac28bc19e6dc0963787bab020d723437c582460
- old request hash: 60ea53530cac97680dafd08e84508828b8eda673ac4222cae471cc81250123a4
- prepared new request hash: bc88e554536892041b31ba8c35e0c2d6c10ae7f4c653017175315d2ec5049e9c
- prepared idempotency identity: research-revision:373d3df1ed8ad5970553ecb8ba5b3470b527f046263cfe6906e876a8ca4a61b6
- profile: arktrov-deep-research/1.0, gpt-5.6-sol, 16000 output tokens, medium reasoning

The prepared identity is non-secret. The ignored local report .local/v005-attempt-4-preparation.json contains the verification. It does not contain a credential or a new ResearchRun. The offline preparation injected an empty credential and a transport that refuses execution. No actual key was accessed. No attempt-4 live launcher was created or executed by this work.

## Verification

151/151 tests PASS twice in .local/lineage-acceptance.log; 24/24 Phase-1 and 25/25 Phase-2A requirements retained. LINEAGE01–LINEAGE17 cover unchanged retries, revised retries, monotone numbering, forbidden key resets, hash conflicts, topic/core-question changes, concurrency, immutability, tenant/job rejection, complete audit, restart, admission guards, database numbering enforcement, offline profile preparation and additive/failed migrations. Tests use isolated PostgreSQL databases and synthetic providers only.
