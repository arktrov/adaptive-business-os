# Phase 2A final PR review

Review target main; source codex/phase-2a-research-factguard. Initial HEAD 4552b48449682cc5ca6ea0ddae3d4a5657fda0ba; later authorized work was uncommitted and is included in this freeze. Review includes migration 003–006, domain/state, repositories, service, adapters/recovery, policy/decision binding, scope, local HTTP/UI, tests, configuration and docs. No new external Research or Fact Guard execution.

## Findings

- HIGH, FIXED: Human policy review accepted only recovered research and rejected an empty decision map even when all claims were approved. Normal successful research can now bind the same immutable human/policy review; original run identity and nullable processing reference remain explicit. REVIEW02 covers real PostgreSQL.
- HIGH, FIXED: Generic HTTP evidence POST accepted internal approval/policy/provider evidence types, allowing caller-written records to impersonate trusted service evidence. Reserve those types to service paths. REVIEW03 denies all six types without writes.
- MEDIUM, FIXED: Context-only claim use could omit an existing mandatory qualifier. The claim-use boundary now enforces it for contextual use too; REVIEW01 verifies rejection. No V005 outcome is rewritten or rerun.
- MEDIUM, OPEN (inherited TD-01): JSON adapter is development fallback, not safe concurrent production persistence. Production uses PostgreSQL.
- MEDIUM, OPEN (inherited TD-02): Migration runner adopts an existing 001 table as baseline and tracks filenames without checksums. Clean/repeated migrations tested; drift detection remains debt.
- MEDIUM, OPEN: Job UI renders historical ResearchRun outcomes but not recoveredResearch processing revisions. V005 may display failed original attempts despite valid recovered research; API/DB contain the separate recovery. Future UI must show both honestly, never rewrite failed attempts.
- LOW, OPEN (inherited TD-04): HTTP error diagnostics still use broad exception messages. Bound to local loopback/operator context; narrow allowlisted error mapping before wider deployment.
- INFO: V005 has six immutable FAILED provider attempts, and successful recovered processing revision ee572a77-fd39-4cb5-bd12-a03478229acd. There is no fabricated SUCCEEDED original ResearchRun. Fact Guard consumes the verified recovered canonical output.
- INFO: Claim-use manifest enforcement is not a semantic verifier of arbitrary prose. Future Script implementation must use the scoped input/claim validator and retain final QA/release gates.

## Security and architecture

Parameterized business/job queries and composite FKs isolate tenants. Job advisory ownership plus transactional state versions fence concurrent operations; immutable triggers protect outcomes, lineages, evidence and recovery. Research logical input is stable across explicit execution revisions, and request hash protects changed-input idempotency. OpenAI transport, capture and parser are confined to provider/configuration boundaries. No Make execution dependency or renderer mutation. Brand-specific source lookup remains configuration only.

Credentials are process-only; response capture allowlists metadata, drops reasoning items except safe IDs and retains token counts. Diagnostic exceptions do not persist raw response/error messages. Secret scan covers working tree plus commit history. Normal tests use injected transport fixtures and isolated local PostgreSQL; review runs add an outbound-fetch denial guard and unset live credentials.

PASS means constrained factual scope only; blocked/context claims remain restricted and publication HOLD stays true. Runtime consistency is read-only. No merge, tag, Phase 2B or new provider call is authorized by this review.

## Final verification

237 actual test cases PASS in both runs (234 prior + 3 focused review regressions), zero skipped/todo; 24/24 Phase-1 and 25/25 Phase-2A requirements mapped to actual runner names. PostgreSQL suites create isolated real databases and run migrations. External fetch disabled during review tests; transport fixtures used. Native syntax/build 45 modules PASS. Secret scan working tree and all 21 pre-freeze reachable commits PASS. Renderer 31/31 reference hashes unchanged; Make 12/12 imported originals / 81 modules unchanged.

Read-only V005 verification: six original FAILED attempts retained; canonical recovered result 8 sources / 20 claims / 25 relations validated. Fact Guard 6957ce6f-8298-4547-81d6-353f519694d1 is PASS, job FACT_GUARD_PASSED, immutable scope 13 approved / 4 blocked / 3 context-only, publication HOLD true. No provider or Fact Guard invocation.

Open findings: CRITICAL 0, HIGH 0, MEDIUM 3, LOW 1. MERGE_READY = YES within the authorized local Phase-2A scope. Merge requires owner instruction; no Phase 2B started.
