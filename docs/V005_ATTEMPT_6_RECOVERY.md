# V005 Attempt 6 offline recovery

## Exact diagnosis: category D (canonical domain contract limitation)

Source is only immutable provider_response evidence a4f0a8e1-afd4-4c00-aead-a18628525490, hash d27be87454a82b1feb3c5d33eaeb07cf9927ccfca530080321e4852fa6a2a317, original run 0f209825-0650-4bf2-b43b-8f717cf3fffe. No new source retrieval or provider call.

The old rule rejected duplicate claim/source pairs: distinct(r.evidence.map(e=>e.claim_id+'\0'+e.source_id)). Exact failing pair: evidence[16].claim_id=C14 / source_id=S8 / support_type=supports, versus evidence[17].claim_id=C14 / source_id=S8 / support_type=context. The former references the abstract proposing a circumbinary disk; the latter references limitations in the conclusion. They are distinct evidence excerpts with confidence 1 and 0.98, not duplicate evidence. No entry is dropped, merged, reclassified or rewritten.

The pair-only uniqueness restriction was unnecessarily restrictive: one source can contain distinct support and contextual limitations for the same claim. Domain contract 1.1 instead identifies a relation by claim_id, source_id, support_type, evidence_reference. SHA-256 of that tuple is the persistence identity. Exact repeated evidence (including a confidence-only change) remains rejected. Claim IDs and source IDs remain unique; all references, required fields, support enums, source URLs/date/strength ranges, confidence ranges and complete-claim coverage remain enforced. No business-specific exception or fabricated normalization.

Stored output audit: 20 unique claims; 8 unique sources; 25 distinct relations; no orphan references; all claims covered; main/additional references resolve; allowed enums and required schema fields pass. Source-strength values 3.5–5 are within the documented 0–100 domain range; no unsupported scale conversion is applied. Research review must assess quality and confidence independently. Full schema/domain/provenance validation succeeds with unchanged output content. This is contract validity, not an independent fact-check.

## Separate processing identity

Migration 005 adds immutable research_processing_revisions plus scoped recovered claims/sources/evidence tables. Each processing revision records its original FAILED provider run, lineage, immutable response artifact/hash, revision number, provider_call_executed=false, processing versions, previous failure diagnostics, reason, timestamp, output and output hash. Scoped FKs protect original run, artifact, lineage and relation references. Idempotency is artifact ID plus processing versions; changed output under the same versions is rejected. Concurrency uses the existing job advisory lock and row lock.

Existing normal research evidence rows gain a relation_id key with legacy default; their data JSON remains untouched. Normal future ResearchResult persistence also uses the richer relation identity. Historical research operations, attempts, outcomes and their processing metadata are not rewritten. No fake Attempt 7.

ResearchRecoveryService accepts an injected offline processor; it has no provider/transport dependency. Explicit recovery approval and reason are required. It loads and hashes the scoped artifact, runs current parser/schema/normalizer/domain validator, then the repository verifies latest FAILED source run and unchanged request hash. Only COMPLETE recovered results are admitted by this first recovery path. Invalid outputs create no successful revision.

Processing versions: parser responses-parser/2.3; normalizer evidence-preserving/1.1; domain validator research-contract/1.1; tool validator completed-tool-budget/1.0; adapter processing responses-research-processing/1.2. Provider profile/request remains unchanged.

## Atomic state and evidence

One PostgreSQL transaction inserts processing revision, canonical output, sources, claims and all relations, then uses the central State Machine for FAILED -> RESEARCH_PENDING -> RESEARCH_COMPLETE. Completion has a separate processing-proof guard: scoped persisted revision, original/latest run, matching audited pending transition, valid output/hash and complete recovered child-row counts. Missing data or any transition failure rolls the entire transaction back. Direct fabricated processing IDs cannot bypass it.

Attempt 6 stays FAILED while the lineage obtains a valid recovered result. Job detail exposes recoveredResearch separately from research attempts. Recovery never mutates the old outcome and does not pretend another external call occurred. No HTTP recovery endpoint, automatic pipeline or Fact Guard execution is added. The existing Fact Guard input contract still selects successful provider-run outcomes; selecting a recovered result needs explicit follow-up integration/review, so READY_FOR_FACT_GUARD remains NO.

## Verification

PROC01–11 cover the old failure shape and corrected preserved evidence, zero new provider calls, immutable FAILED history, separate revision identity, persisted child rows, invalid rejection, processing versions, audit, tenant isolation, restart, concurrent idempotency, transaction rollback, central completion proof/count checks and normal Research persistence for multiple same-pair evidence items. Fixtures are synthetic and contain no copied paid response content. Real Attempt 6 is reprocessed only from local PostgreSQL evidence.

## Actual recovery result

Actual V005 offline recovery persisted: processing revision 1 / ee572a77-fd39-4cb5-bd12-a03478229acd, output hash 8f94c77f2b8e1e3e03c1aa7185b824a0d648bb97aac119214a861bb433a9d6f6. Sources 8, claims 20, evidence relations 25, uncertainties 11, contradictions 5, open questions 12. PostgreSQL data and row hashes verified after reconnect. Original six attempts, outcomes, source artifact and prior audit entries unchanged; Attempt 6 remains FAILED. ContentJob RESEARCH_COMPLETE. Zero new provider calls; no Fact Guard. READY_FOR_RESEARCH_REVIEW = YES; READY_FOR_FACT_GUARD = NO.

203/203 tests PASS twice; 24/24 Phase-1 and 25/25 Phase-2A requirement mappings verified. Clean/repeat migration and real PostgreSQL integration PASS; native build 40 modules PASS; Secret Check PASS including untracked files; Make 12/12 originals and renderer 31/31 hashes unchanged.
