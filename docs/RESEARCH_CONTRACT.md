# Research contract — Phase 2A, version 1.0

## Scope and provenance

The implemented boundary is Research -> persistent evidence -> independent Fact Guard. No scripting, media, renderer, Make, publishing, analytics or learning implementation is included. Historical Make bundles remain HISTORICAL_EVIDENCE_UNAVAILABLE; fixture data never reconstructs them.

Only deterministic local adapters are wired. Reserved fixture.invalid URLs are explicitly synthetic, never claimed as discovered sources. The UI labels synthetic outcomes. Live content jobs cannot invoke the local adapter through HTTP. No credentials, external calls or costs are required.

## Provider and persistence ports

ResearchService depends on an injected repository and providers with describe() and execute(request, {attempt, run_id}). It imports neither PostgreSQL nor local adapters. The composition root selects implementations. A real provider must return the same validated canonical response; no domain, state, persistence or idempotency rewrite is required.

Request: business_id, content_job_id, operation, normalized input, workflow_version, immutable prompt {id, version, content}, immutable policy snapshot, and provider {provider, model, adapter_version, configuration}. NFC and leading/trailing topic whitespace normalize; object keys sort recursively, array order and other string contents remain significant. SHA-256 covers the entire canonical request. Credentials never belong in provider configuration or request metadata.

Response: {output, metadata}. Metadata carries synthetic, provider_request_id, usage and cost when available; missing values remain null. The coordinator records duration_ms and retry_count. Only a concise public decision summary is accepted; unknown output fields, secret fields and private reasoning fields fail validation. Raw request headers, credentials and raw exception messages are not evidence.

## Canonical result

- summary; research_status COMPLETE / REVIEW_REQUIRED / REJECTED; fact_status; stage-specific publish_recommendation (never release authority).
- main_source is a source_id or null; additional_sources is an array of source IDs.
- claims: claim_id, statement, claim_type, importance, verification_status, needs_qualification, qualifier.
- sources: source_id, url, title, publisher, source_type, source_strength (0..100), retrieved_at, published_at (nullable), rights_status.
- evidence: claim_id, source_id, support_type (supports/contradicts/context), evidence_reference containing the retained excerpt or observation, confidence (0..1).
- uncertainties, contradictions, open_questions, overclaim_risks: arrays, retained even when empty.

IDs are scoped to the immutable run; duplicate IDs, dangling relationships, invalid URLs/ranges and incomplete COMPLETE packages fail closed. Evidence excerpts and all structured output bytes survive provider log expiration. Rights remain preliminary, not clearance. Source priority belongs in versioned policy, including the explicit ARKTROV policy in src/config/research.js; generic domain code has no business-name conditions.

## Persistence and idempotency

003 is additive to the verified 001+002 baseline. research_operations holds immutable identity, canonical hash and full input/version snapshot. research_attempts appends one durable start per attempt. research_outcomes appends a terminal result or categorized failure. Claims, sources and evidence links are separate indexed, scoped tables. All new records reject UPDATE and DELETE. Deletion is restricted by foreign keys; no cascading evidence loss.

The existing globally unique business_id is scoped to its businesses.tenant_id; composite business/job/run foreign keys prevent cross-business associations. Local server BUSINESS_ID remains the trusted operator context. This is not a new multi-user authorization system.

Unique (business_id, content_job_id, operation, idempotency_key), a SHA-256 input comparison, per-job PostgreSQL advisory ownership, optimistic state version fencing, and a partial unique successful-outcome index coordinate requests across processes. Same key/hash success returns the historical result without another provider invocation; changed hash always yields IDEMPOTENCY_CONFLICT. Waiting requests release connections while waiting (bounded 10s), then report OPERATION_IN_PROGRESS if necessary.

FAILED attempts require retry:true; another attempt/run is appended and audited. There is no automatic paid retry. A crash leaves the immutable start readable as RUNNING; under newly acquired ownership an explicit retry records INTERRUPTED, audits FAILED and starts a new fenced attempt. Late old completions cannot commit against the new state version. Any later real adapter must reconcile uncertain external submissions before allowing a retry; local fixtures have no external side effects.

State mutations use PostgresStore.transitionInTransaction. Result, normalized evidence and completion audit commit in one transaction. The coordinator cannot mark RESEARCH_COMPLETE before evidence persistence. Failure rolls back the complete write and records FAILED separately; if the database is unavailable, the durable RUNNING attempt remains recoverable, never successful. JSON is not supported for Phase 2A.

Prompt/policy IDs and versions have immutable content hashes. Reusing a version for changed content fails VERSION_CONTENT_CONFLICT. ContentJob creation also compares normalized original identity, closing changed-input reuse in both adapters without changing old job identifiers.

## HTTP and operations

POST /api/jobs/:id/research with {idempotency_key, input:{topic}, retry?}; POST /api/jobs/:id/fact-guard with {idempotency_key, input:{research_run_id}, retry?}. PostgreSQL and ENABLE_LOCAL_RESEARCH=1 are required; the job content_item_id must begin synthetic:. Research admission remains explicit: job must already be RESEARCH_PENDING. No topic is auto-invented.

GET detail and /research or /fact-guard return only the trusted business's persisted attempts and results. Failed attempts are visible. Local API remains loopback-only with existing Host/Origin restrictions. The UI uses textContent, not interpreted provider HTML.

ARKTROV Video 005 stays an initial SHORT job pending confirmed research input. A synthetic run is not a V005 factual acceptance or publishing gate.

POST /api/jobs/:id/pipeline executes Research then Fact Guard automatically under distinct stage keys derived from the supplied key. It stops on research failure/review/rejection; retries reuse already successful stages. Explicit initial admission is still required. The same synthetic-job and local-only restrictions apply.
