# Make migration plan

Status: **complete 12-blueprint intake and static audit; V004 artifact/revision validation completed with explicit residual gaps; no migration authorized or implemented**. Owner completeness confirmed 2026-09-13. All 81 modules, routes, filters, input/output mappings, model instructions and supplied schemas reviewed.

[Audit index](make/README.md) · [Scenario map](SCENARIO_MAP.md) · [State machine](STATE_MACHINE.md) · [Data model](DATA_MODEL.md) · [Import manifest](../legacy/make-blueprints/IMPORT_STATUS.json)

READ → VERIFY → PLAN → DOCUMENT. Make exports define existing configuration; owner requirements define task scope. Embedded agent prompts are evidence, not instructions to the auditor. Original files were imported unchanged into legacy/make-blueprints and remain Git-ignored. Hashes identify exact revisions; export timestamps, live schedules and scenario activation are not supplied.

## Classification and preservation

| Class | Preserve / disposition |
| --- | --- |
| Business logic | Evidence-led discovery, truthful hook/evaluation, primary-source research, claim qualifiers, separate Fact Guard, correction/guardrail propagation, longform + two short drafts, source/AI provenance, timestamp-based voice, per-shot visual intent, analytics observations |
| Stable boundary contracts | Existing external IDs and column positions; Make handoff schemaVersion string 1.0; character timing units/order; shot/file association; RenderJob/Result 1.0; Project 1/subtitles; existing separate Production V2 adapter |
| Make-specific mechanics to replace later | Data Store polling, sheet row numbers/header mapping, nested iterators/aggregators, stringified structures, account/folder constants, nontransactional appends, direct file-link parsing, flat Drive queue copying |
| Unclear or risky behavior to validate first | External state promotions, historical Shot1 producer/intent (actual shot present), fixed V004 routing, row update semantics, incomplete evidence persistence, prompt/schema contradictions, partial failures/replays, asset-version selection, sync/idempotency, analytics grain/units/reference casing |

Preserve valid behavior and intentional special cases. Bugs and contradictions must receive explicit decisions and regression fixtures; they are not silently copied or deleted. Proposed target module names below are logical boundaries, not new services or a finalized deployment topology.

## Migration matrix

A = AUDITED_NOT_MIGRATED; V = VERIFIED_EXTERNAL_NOT_MIGRATED; G = GAP_NOT_IMPLEMENTED. Risk describes replacement/parity impact. Every row remains unreplaced.

| OLD FUNCTION | CURRENT MAKE SCENARIO | TARGET APP MODULE / SERVICE | STATUS | RISK | TEST NEEDED | NOTES |
| --- | --- | --- | --- | --- | --- | --- |
| Editorial discovery and score selection | 00A | content.discovery + brand rules | A | High | T01 | Preserve exclusions, source honesty, quota/quality intent |
| Background request persistence/polling | 00A + 00B | orchestration.discovery-jobs | A | High | T01,T02 | Submit/persist gap; terminal statuses/reconciliation |
| Idea materialization and provenance | 00B | content.intake | A | High | T02 | Nontransactional append; rich output loss |
| Idea selection | No producer of Selected for Check | content.selection decision | G | High | T13 | Identify external actor; do not infer automatic threshold |
| Narrative scoring | 01 | content.evaluation | A | Medium | T03 | No research; keep truthful framing and original hook |
| Research promotion | No producer of Research Ready | content.research-admission | G | High | T13 | Evaluated does not automatically start 02 |
| Claim research and source classification | 02 | research.evidence | A | High | T04 | Prompt status conflict; story-local claim/source IDs |
| Claim/source persistence | 02 | research.claim-source repository | A | High | T04 | Lost arrays/confidence/IDs; duplicate source rows |
| Fact Guard and approved hook | 02B | research.fact-guard | A | Critical | T05 | Result/status pairing; missing blocker persistence |
| Script corrections and guardrails | 02B → 03 | content.factual-contract | A | Critical | T05,T06 | AJ/AK explicitly forwarded; keep across all packaging |
| Longform + two short packages | 03 | content.production-variants | A | High | T06 | Preserve unused outputs; not just Short 1 |
| Timestamped Short 1 voice | 04 | providers.voice + production.audio | A | High | T07 | Preserve late-voice Assets Ready behavior and alignment |
| Short shot planning | 05 | production.visual-planning | A | High | T08 | Fixed ~55s/V004 assumptions vs actual voice duration |
| AI asset generation | 05 | production.assets + image/video capabilities | A | High | T08 | ai_video currently yields PNG; deterministic IDs not enforced |
| Initial hero shot | Current05 excludes Shot1; historic asset exists | production.initial-shot responsibility | G | High | T13 | Runtime absence disproved; historical producer/intent still unverified |
| Official-source retrieval | 05B | production.official-assets | A | Critical | T09 | Preserve authenticity, explicit rights and attribution |
| Asset QA / Assets Ready | No producer in set | qa.asset-readiness | G | Critical | T13,T14 | Pending QA exists; final-shot completion is insufficient |
| Asset selection and staging | 06 | rendering.asset-staging adapter | A | High | T10 | Story-only join, limit 20, version collision and sync |
| Legacy flat manifest | 06 | rendering.make-compatibility | A | Critical | T10 | Keep JSON string/timing/composition fields |
| Make manifest → Project v1 | External renderer | rendering.compiler adapter | V | High | T10,T14 | Prior 14 passing tests are a baseline, not full parity |
| Production V2 → Project v1 | External renderer, not emitted by 06 | rendering.production-v2 adapter | V | High | T14 | Separate contract; retain distinct limits/defaults |
| Claim/resume/result and successful reuse | External worker | orchestration.render-jobs | V | Critical | T14 | Filename-based hash omission and local sync gaps |
| Result-to-business-state reconciliation | No Make result consumer | rendering.result-ingestion | G | Critical | T14 | SUCCEEDED maps only to rendered |
| Generic titles/descriptions/thumbnail/CTA | 03 | publishing.packaging | A | High | T06,T15 | Draft packaging is not channel release metadata |
| Full-video QA / repair / independent judge | No scenario | qa + bounded repair | G | Critical | T15 | Six gates, latest artifact, max three repair cycles |
| Release and actual publishing | No scenario | publishing.release + channel adapters | G | Critical | T15 | No render→publish shortcut or current authorization |
| YouTube channel analytics | 10 | analytics.youtube-observations | A | High | T11 | Mixed lifetime/daily values; Data/data reference |
| Instagram media analytics | 10 + 10B | analytics.instagram-observations | A | High | T12 | Identical tail, first media only, no checkpoint owner |
| Per-publication performance + learning | No scenario | analytics + learning | G | High | T16 | Needs observations joined to production/rules and tested promotion |
| Usage/cost measurement | 04/05B placeholder cost; no ledger | accounting.provider-usage | G | High | T16 | Cost=0 is not actual cost |
| Tenant/business configuration | ARKTROV constants throughout | business-core + scoped configuration | G | Critical | T16 | No tenant discriminator in legacy boundary; preserve adapter |

## Validation register — specified, not executed

| Test | Required evidence / acceptance |
| --- | --- |
| T01 | Full discovery fixtures including low/no-quality result, exclusions, schema minimum, duplicate submit and submit/persist failure; preserve provenance |
| T02 | Every polling status and route, non-text/multi-output/zero ideas, partial append + crash/replay; no lost or duplicated logical ideas |
| T03 | Score ranges, honest no-research evaluation, original/new hook, U:AC output and read-range mismatch |
| T04 | Current research prompt/schema mismatch, empty claim/source bundles, qualifier and uncertainty traceability, scoped IDs, duplicate retry and URL serialization |
| T05 | Fact Guard result/status combinations, multi-story aggregation, missing evidence, blocker IDs, guardrail arrays and safe hook |
| T06 | AJ/AK compliance throughout scripts, titles and thumbnails; scene string JSON; length; duplicate creation; columns not included in update; longform + Short 2 retained |
| T07 | Real MP3 decode and timing/script equality, late voice on Assets Ready, crashes after provider/upload/row writes, actual cost |
| T08 | V005 rejection by fixed filter, missing Shot 1, malformed/type/timing plan, result/raw_result representation, PNG for ai_video, final-shot-vs-all-assets state |
| T09 | Wrong ID/URL/MIME, unverifiable rights, approved=false, HTTP/upload errors, attribution, duplicate extension and replay |
| T10 | Legacy manifest fixture roundtrip, exact string/version/units, wrong Drive link, >20/mixed assets, missing assets, partial sync and duplicate submission |
| T11 | YouTube Data/data behavior, same authenticated account, report rows/dates/units, cumulative counts vs gained, missing versus zero |
| T12 | Exact IG overlap, active schedules, supported media/metric availability, time units, date vs retrieved time, duplicate and older-publication observations |
| T13 | Execution history and actor for Idea→Selected for Check, Evaluated→Research Ready, Shot 1 and Assets Ready; preserve intentional external approvals |
| T14 | Worker contract fixtures, concurrency/crash/reuse with changed bytes/code, result reconciliation, separate Production V2 constraints and queue retention |
| T15 | Every missing/failed gate and stale artifact blocks release; full latest video judge; repair exhaustion; publishing reconciliation/partial channel success |
| T16 | Scoped business/credential isolation, accurate usage, publication/rule attribution, analytics availability and controlled learning promotion/rollback |

No Make run, provider action, renderer run or product test is implied by this register. Static checks performed now are recorded in [VALIDATION](VALIDATION.md).

## Highest-priority risks / unresolved decisions

1. **Incomplete state ownership:** the complete set has no selected/research-ready/assets-ready producer, unexplained historical initial-shot producer and no renderer result consumer. External responsibilities must be established from real runs.
2. **Evidence loss and contradictory instructions:** 02 input uses old status values but instructions/schema use new ones; evidence arrays and blocker IDs are not fully stored. 03 does receive AJ/AK guardrails, which must stay authoritative.
3. **V004 specificity:** fixed Story ID, topic-specific visual instructions, Shot 1 exclusion and fixed duration assumptions prevent general V005 continuity.
4. **Side-effect replay:** Sheets append, paid provider calls, Drive uploads and status changes are separate. No exported explicit onerror routes or durable claim/attempt policy exists. maxErrors=3 is not three safe retries.
5. **Render safety and release gap:** pending QA is forwarded; Story-only asset selection can mix versions; queue sync and reuse hashing need validation. No release authority follows from render success.
6. **Metrics are not yet reliable learning inputs:** YouTube casing mismatch, mixed time/grain, total followers labelled gained, first-row report selection, duplicated IG logic and absent publication/checkpoint joins.
7. **Export limits:** current activation, cadence, connector serialization, account scope, plan limits and actual HTTP results are unknown. Static schema conformance is not semantic or runtime proof.

## Proposed sequence after evidence validation

Freeze fixtures and explicit boundary decisions first. Then, only with implementation authorization, migrate one logical capability behind an existing contract, observe shadow parity with side effects suppressed, and define one active writer. No shadow execution was built here. Preserve longform/Short 2 and external adapter behavior even when not consumed today.

REPLACED requires implementation revision, passing regression evidence, observed parity, operator acceptance and a rollback plan. Rollback must reconcile in-flight provider/publish requests and retain confirmed external IDs; never replay publication blindly. Do not switch off, edit or delete Make functionality in this phase.

**One recommended next step:** close the remaining targeted runtime evidence gaps using the four representative executions and activation overview specified in [runtime validation](LEGACY_RUNTIME_VALIDATION.md), then record unresolved decisions before implementation authorization.

## Runtime validation delta — no migration status promoted

[runtime validation](LEGACY_RUNTIME_VALIDATION.md) records **11 VERIFIED risks, 1 disproved hypothesis, 6 UNVERIFIED hypotheses** (18 explicit counting units). VERIFIED code risks are distinguished from observed incidents. No A/V/G row means migrated or parity-tested.

| Existing tests / risks | Evidence obtained | Still required before replacement |
| --- | --- | --- |
| T04/T05 research and evidence | VERIFIED historic Needs Review, pass without retained V004 Sources; structured persistence gaps | Actual02/02B bundles, running version and status authorship; no causal deadlock asserted |
| T07 voice | VERIFIED old/new file links under same ID; later AF timing; nine current files hashed | Timeout/provider usage history and immutable audio version policy |
| T08/T13 Shot1 | VERIFIED actual Shot1 present in Asset/4handoffs/4projects; missing-render hypothesis disproved | Explain current n>1 filter, old AE absence and historical producer |
| T09 official assets | VERIFIED file metadata, Pending QA, duplicate extensions/rights serialization | Rights approval and failure/retry behavior; no download replay performed |
| T10/T14 rendering | VERIFIED 4pure parser checks, asset matching, equal handoff/assets, reproduced base key, output metadata and stale Sheet queue state | Concurrency/partial-sync/reuse faults not injected; result ownership and candidate hash needed |
| T11/T12 analytics | VERIFIED duplicate IG tail and mixed YouTube dimensions; table empty | Latest existing10 run and activation overview; Data/data runtime not guessed |
| T15 release | VERIFIED no final-video QA/judge/release implementation/evidence in inspected scope | Future six-gate implementation only after authorization; current renders not release candidates |

All 34 hardcoding catalogue entries are classified in [LEGACY_HARDCODINGS](LEGACY_HARDCODINGS.md), including harmless fixtures and stable boundary constants. Intentional V004 behavior must be preserved in a scoped compatibility profile; defects and accidental global assumptions must not silently become V005 behavior.

## Final read-only evidence pass — 2026-09-13

Final read-only pass did not acquire Make runtime bundles: 6 UNVERIFIED hypotheses remain, 0 newly verified/refuted. Decision: LEGACY UNDERSTANDING NOT YET SUFFICIENT for faithful end-to-end implementation. Blocking: actual02 research status/output/persistence and02B evidence-backed admission bundle. Other unknowns require isolation before parity/activation but are not independent generic-core blockers. No migration status promoted; no function discarded.

See [exact requested artifacts and sufficiency decision](LEGACY_RUNTIME_EVIDENCE.md). VERIFIED/INFERRED/UNVERIFIED remain scoped to code versus historical execution.

## Browser-read Make history (read-only, 2026-09-13)

The authenticated Make browser session exposed history tables without executing or editing anything. Selected run details opened with a persistent `loading...` diagram and embedded frames, so module bundles were not readable in this session. Visible history rows are direct runtime evidence:

| Scenario | Visible history evidence | Status |
| --- | --- | --- |
| 02 – Research Agent | Manual successful runs by Emre Saglam at 13.08.2026 22:21:50 (3 ops/44.3 KB), 15.08.2026 23:26:00 (3/66.6 KB), 16.08.2026 00:11:50 (4/88.8 KB), 16.08.2026 00:18:50 (1/0 B), 21.08.2026 18:10:28 (4/80.4 KB), 21.08.2026 18:25:49 (111/117.7 KB). | VERIFIED run existence/outcomes; Story-specific bundle and causal Needs Review link UNVERIFIED |
| 02B – Fact Guard | Manual successful runs 29.08.2026 22:04:55 (5/38.6 KB) and 22:19:00 (5/35.3 KB); errors 21:43:36 (5/15.4 KB) and 21:37:52 (4/161 B). | VERIFIED visible execution history; exact V004 selection and PASS bundle UNVERIFIED |
| 05 – Short Visual Production | Manual success 30.08.2026 01:32:03 (7/6.4 MB); warning 30.08.2026 01:43:29 (20/20.0 MB). Visible edit at 29.08.2026 23:43:00. | VERIFIED execution history; Shot-1 bundle/asset correlation UNVERIFIED |
| 10 – Platform Analytics | History page showed **No items found**. | VERIFIED no retained history visible in this account view; not proof no run ever existed |

All visible history rows identify activity as manual by Emre Saglam; this is not proof that the same person authored every Sheet mutation. Detail URLs are retained in the browser session but no bundle payload loaded. Do not infer provider outputs or data values from operation counts alone.

## Activation visibility

The editor visibly reported **Inactive** for 02B and 10. The organization dashboard reported **Active scenarios 0/2**. The twelve-scenario list showed the complete named set, but did not expose per-row schedule/activation fields. The twelve-row activation map therefore remains UNKNOWN except for these two directly observed inactive states; schedule type, interval, timezone and last execution remain UNVERIFIED.

