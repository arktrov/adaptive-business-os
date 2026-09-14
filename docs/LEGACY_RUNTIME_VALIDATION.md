# Legacy runtime validation — V004

Date: 2026-09-13. Mode: **READ → VERIFY → TRACE → COMPARE → DOCUMENT**. No migration, services, database, new render, V005, Make edits, publishing or QA implementation.

## Evidence rules and scope

**VERIFIED** means directly supported by the named artifact, captured record or inspected code. A code finding verifies configured behavior, not that a historical execution took that path. **INFERRED** means supported reconstruction without an execution record. **UNVERIFIED** means the required runtime evidence is unavailable. A refuted hypothesis is marked **VERIFIED — DISPROVED**. Proposed target decisions are explicitly proposals, not runtime facts.

Reference identity: user shorthand `ARK-20260810-223151-1`; actual Story ID **`ARK- 20260810-223151-1`**; Production ID **`PROD- ARK- 20260810-223151-1`**. Preserve the spaces. Row numbers are locations, not keys.

The complete 12-export / 81-module audit remains the configuration baseline. Existing sheet records, eight retained workbook revisions, Drive assets, four completed queue directories and local renderer source were read. Workbook revisions provide snapshots, not a complete cell-event history. Same-account revision authorship cannot distinguish Make from human edits. Current source code/export configuration is not automatically the version used in August.

## Evidence catalogue

Operational workbook/folder IDs and raw exports remain local, outside Git. Resource aliases match [SCENARIO_MAP](SCENARIO_MAP.md). Times below are UTC unless explicitly stated.

| Evidence | Direct source / bounded coverage | What it establishes |
| --- | --- | --- |
| E01 | 12 originals, SHA-256/module manifest in [intake](../legacy/make-blueprints/IMPORT_STATUS.json); [module audits](make/README.md) | VERIFIED current supplied configuration; not schedules or historical versions |
| E02 | S-MASTER Story A1:AK15 and full H sentinel; Production A1:AZ8 and ID sentinel; Assets A1:V25 and A:C sentinel | VERIFIED 11 current stories, four productions, 12 assets; target Story row 8, Production row 5, nine Assets rows 5–13 |
| E03 | Sources A1:S35 + A36:S90 and A:B sentinel through row 1046 | VERIFIED 47 Euclid source records, no V004 record in captured table |
| E04 | Platform Analytics A1:X30 and A:D sentinel through row 1000; Content Calendar and Automation Control A1:Z20 or narrower | VERIFIED headers only in these inspected tables; no current analytics observations, publication rows or control jobs |
| E05 | Visual Gate A1:AL35; Build Log A1:J40; Costs A1:M15; Story Archive A1:T100 | VERIFIED target FactGuard prerequisite pass but gate/reviewer fields blank; three Build Log entries and six subscription/credit cost rows, not per-call usage |
| E06 | S-MASTER retained revisions 444, 460, 568, 570, 591, 600, 605, 630, exported with all core sheets | VERIFIED snapshots in timeline below; no target Sources or Analytics rows in these inspected revisions |
| E07 | D-VISUAL and D-AUDIO file metadata and current asset links | VERIFIED eight target visuals; creation times and current voice creation; revision 591 has another voice file link under the same Asset ID |
| E08 | Queue incoming/processing/failed/completed listings; all four V004 handoff.json, job.json, result.json, compiled/project.v1.json; nine input asset hashes per job | VERIFIED snapshot: 0 incoming, 0 processing, 0 failed, 4 completed; all results SUCCEEDED, errors empty, no reusedFromJobId |
| E09 | Read-only local renderer scripts: make-handoff, render-worker, render-contract, compile-make-handoff, production-check, preflight-assets, inspect-compositions; runtime validators; V004 command scripts; scene treatment and composition | VERIFIED implemented code paths; historic caller/schedule and post-check completion remain UNVERIFIED |
| E10 | Pure existing parsers run on four captured handoffs/projects, asset-map validation and base-key reproduction | VERIFIED all four parse, eight scenes each, same manifest and nine asset hashes; no staging/compiler/worker execution |
| E11 | Existing ffprobe, read-only V4 MP4 inspection | VERIFIED H.264 1080×1920 30 fps; AAC 48 kHz stereo; video 53.933333s, audio/container 53.994667s, 52,582,688 bytes. Not full decode/perceptual QA |

S-MASTER metadata timezone is America/Los_Angeles; user timezone is Europe/Berlin. Make timezone and active cadence are **UNVERIFIED**. Do not infer UTC event times from an ID timestamp.

## Historical timeline — snapshots, not invented transitions

| Retained point | Story / Production / Assets | Evidence level and limit |
| --- | --- | --- |
| rev444, Aug 10 21:23:35.143; rev460, Aug 13 15:59:52.819 | Story row 20 = Idea; no target Production/Assets | VERIFIED; no discovery response/run ID retained |
| rev568, Aug 21 16:28:30.365; rev570, Aug 21 18:24:03.061 | Story row 20 = Needs Review; no target Production/Assets, Fact Guard blank | VERIFIED historical status outside current 02 output enum; writer/reason UNVERIFIED |
| rev591, Aug 29 21:40:02.311 | Story row 8 = Voice Ready, AD=pass, AJ/AK populated. Production row 5 = Voice Ready, created 20:52:54.864, updated 21:30:11.466. Voice Asset row 5, old file link. AE/AF empty | VERIFIED; intermediate Approved/Script Drafted states not captured |
| Drive Aug 29 23:33:58.024 | Shot 1 image created | VERIFIED; producer and intentional exclusion reason UNVERIFIED |
| Drive Aug 29 23:45:31.204–23:49:26.600; rev600 23:49:31.604 | Shots 4/5/6/8 images; all eight visual rows present. Production Visual Assets Pending QA. Official 2/3/7 Source Required without file. AE/AF still empty | VERIFIED; current 05 writes AE, so historic version/path differs or later edits intervened |
| Drive Sep 2 21:42:44.637–21:49:50.364; rev605 21:59:01.414 | Official 2/3/7 retrieved, review needed; Production Assets Ready; all visual QA Pending; AE/AF empty | VERIFIED; who promoted Assets Ready and their criteria UNVERIFIED |
| Current voice created Sep 5 19:13:09.396; rev630 19:38:42.288 | Same logical AUD…SHORT1-V1 now different file link, voice row 13; visuals rows 5–12. AE 12,544 chars, AF 12,896 chars; Production Assets Ready | VERIFIED replacement of file reference, not proof of duplicate provider billing or who removed old row |
| Current snapshot, updated Sep 13 13:58:53.678 | Production Render Queued; AG Queued; AY Render-{raw Production ID}; Story remains Voice Ready | VERIFIED, including stale business status after results below |
| Sep 13 four worker intervals below | Four completed results, eight image scenes including Shot 1, 53.92s compiled timeline | VERIFIED rendering success; no release/publish inference |

Snapshot adjacency does not prove a direct jump. Evaluation, Research Complete and Approved could have existed between retained revisions. The old Needs Review value proves historic drift; it does **not** prove that the current conflicting prompt produced it.

### Four concrete render attempts

Base directory `Render-PROD-ARK-20260810-223151-1-bb9f99ffe16b`, then suffixes -V2/-V3/-V4.

| Attempt | startedAt → finishedAt on Sep 13 UTC | MP4 bytes | Result |
| --- | --- | --- | --- |
| Base | 14:52:34.315 → 14:57:48.432 | 37,754,469 | VERIFIED SUCCEEDED |
| V2 | 15:34:10.571 → 15:39:40.077 | 49,528,902 | VERIFIED SUCCEEDED |
| V3 | 15:51:33.020 → 15:58:06.099 | 52,582,688 | VERIFIED SUCCEEDED |
| V4 | 16:22:27.661 → 16:28:22.524 | 52,582,688 | VERIFIED SUCCEEDED |

All four handoff byte hashes: `d8bfaad64f673f7b6b9bc30ec54c4d4128bea93a112230da74533693aa5d19bb`. All nine asset name/hash pairs match across attempts. The base key reproduces as `bb9f99ffe16b6b695ab1dfa315d77d4e3d54d670ed404d54a37452a90013a468`; V2–V4 have different v004-vN-prefixed keys. Base submittedAt is **1970-01-01T00:00:00.000Z**, exactly the current helper default; not actual submission time. Equal V3/V4 byte sizes do not establish equal video hashes.

**INFERRED:** later attempts correspond to the retained rerender command scripts and intentionally avoid reuse after treatment changes. **UNVERIFIED:** exact caller and whether every command-script post-check completed. They are not evidence of accidental duplicate triggering.

## End-to-end transition trace

Fields below reference the [complete column dictionary](make/COLUMN_DICTIONARY.md) and exact mapping appendices. “Configured” is VERIFIED from E01/E09; historic attribution is INFERRED unless a result directly establishes it. Detailed replay/failure behavior follows the table.

| Stage / owner | Before → after (configured; actual where known) | Read → write, IDs, files and handoff | Runtime comparison / repeat and failure |
| --- | --- | --- | --- |
| Discovery submit 00A | no job → pending | Brand/editorial prompt → background response_id, Data Store key=response_id, attempts=0, created_at; JSON provider request/result | V004 Idea exists by rev444; exact submit UNVERIFIED. Submit/persist gap can orphan a provider job |
| Discovery collect 00B | pending → completed/failed or pending; new Story Idea | response_id + completed output ideas[] → Story A:T subset; ARK- timestamp-index; URLs/notes; separate Data Store update | V004 identity/Idea VERIFIED; poll run/output lineage UNVERIFIED. Append then crash can duplicate ideas; failed attempts fixed 1 |
| Selection + evaluation 01 | external Selected for Check → Evaluated | Story topic/hook/source context → scores and U:AC narrative; same Story ID, no file | Current narrative fields VERIFIED; target intermediate state/run UNVERIFIED. No supplied selection writer; retry may overwrite scores |
| Admission + research 02 | external Research Ready → Research Complete/On Hold/Rejected | Story context → model claims/sources, Sources A:S projection and Story research summary/status/URLs; package-local Claim/Source IDs | Historical Needs Review VERIFIED; E03/E06 contain no V004 Sources. Actual run output/writer UNVERIFIED. Partial Sources append can repeat |
| Fact Guard 02B | Research Complete → Approved/pass, On Hold/hold, Rejected/reject | Story + Sources aggregation → safer hook, AD result, AE notes, AJ corrections, AK guardrails; no immutable evidence file | Current pass/AJ/AK VERIFIED; exact source bundle and status pairing in run UNVERIFIED. Re-evaluation overwrites decision; no claim/revision lock |
| Script 03 | Approved AND pass → Story Script; new Production Script Drafted | Story/narrative/AJ/AK → all 21 package outputs, full script, scene plan string, titles/copy, two short scripts; PROD- {Story ID} | Target package/createdAt VERIFIED, producing run INFERRED. Production append and Story update separate; duplicates possible |
| Voice 04 | Script Drafted or Assets Ready with Short1 and no AF → Voice Ready or preserved Assets Ready; Story Voice Ready | Production S + voice configuration → ElevenLabs MP3 + character alignment; AUD-{Production}-SHORT1-V1, audio filename; Asset file/duration; AF JSON | Earlier file without AF, later same ID/new link with AF VERIFIED. Historic script/provider version UNVERIFIED. Upload before row/timing can orphan/duplicate |
| Visual 05 | Voice Ready + fixed target → Visual Assets Pending QA at final shot | S/J → ~55s plan AE; per-shot image or Source Required row; IMG-/SRCVIS-…SHORT1-SHOTn-V1, PNG files; both creation routes require n>1 | All eight shots incl. Shot1 VERIFIED; current filter cannot create Shot1. AE absent rev600 despite assets. Resume/special-case explanation INFERRED |
| Official retrieval 05B | Source Required + no file + fixed target → Retrieved – Needs Review/Pending or failure/Blocked | Asset request → web candidate/approval/direct URL → download/upload, links/rights/Source ID/Notes | 2/3/7 files and status VERIFIED by rev605. Duplicate extensions/concatenated rights VERIFIED. HTTP failure does not automatically reach semantic fallback |
| Readiness / handoff 06 | externally Assets Ready → Render Queued, AG Queued, AY job | Production S/AE/AF + first 20 Story-linked assets with File Link → copied files + flat schemaVersion "1.0" manifest; Render-{Production ID} | Actual manifest has nine assets and Pending/null QA; C/AG stale after success VERIFIED. Readiness author UNVERIFIED; copying and status write non-atomic |
| External intake / compiler | incoming → processing | Parse manifest, exact-one voice/per-shot mapping, files settled → RenderJob 1.0 + compiled Project v1, subtitles and staged media | Four parsed projects VERIFIED. Raw plan 55s trimmed to voice 53,920ms; Shot8 48,000–53,920ms. Invalid/missing files prevent staging or fail |
| External renderer / result | processing → completed/SUCCEEDED or failed/FAILED | Pre-render checks + Remotion invocation → MP4, result.json paths/times/errors | Four SUCCEEDED artifacts VERIFIED; no post-result Sheets consumer. No QA/release/publication transition follows |

### Research status and evidence conclusions

**VERIFIED (configuration):** 02 selects Research Ready. Its schema/instructions permit Research Complete, On Hold, Rejected, while its input prompt asks for Research Ready, Needs Review, Rejected. 02B selects only Research Complete. Returning/retaining Research Ready can cause repeated selection; Needs Review or an unpromoted Evaluated row can be skipped indefinitely. An actual deadlock duration/cause is **UNVERIFIED**.

**VERIFIED (artifacts):** current Story statuses include Published, Evaluated, Script, Research Ready and Voice Ready; historical target statuses include Idea and Needs Review. The target has pass plus corrections/guardrails, but no associated Sources in the inspected current or historical snapshots. Story M contains a truncated research JSON fragment followed by prose; it is not a complete evidence package. AJ/AK are comma/NBSP-serialized text, not canonical JSON arrays. Their explicit forwarding into 03 is a safeguard, not proof of faithful downstream model compliance.

**VERIFIED (mapping):** source_id/title, confidence, uncertainty/overclaim arrays and blocking_claim_ids are not fully persisted. Claim/URL/qualifier projections are intended, but cannot reconstruct V004's exact Fact Guard input. **UNVERIFIED:** whether V004 Sources once existed in an unretained interval and who removed/replaced them.

Target proposal: persist immutable raw structured research and review outputs with provider/run/prompt/schema revision, claim-source links and source snapshots, qualifiers/uncertainty/rights, guardrail and blocker arrays, decision authorship and timestamps. Canonical research outcome is RESEARCH_COMPLETE / ON_HOLD / REJECTED; preserve historical Needs Review as a raw value requiring reconciliation, never silently translate it to success.

## Counted risk register

Counting unit is the explicit hypothesis below, not every symptom or hardcoded constant. **18 hypotheses: 11 VERIFIED risks, 1 VERIFIED—DISPROVED, 6 UNVERIFIED.** Verified risks include directly proved design gaps; only rows explicitly saying observed incident establish one.

| ID | Hypothesis being tested | Blueprint/code vs artifact; outcome | Evidence |
| --- | --- | --- | --- |
| R01 | Research status contracts conflict and can skip/reselect work | VERIFIED configuration risk; historic Needs Review corroborates drift, causal deadlock not proved | E01 02/02B; E06 |
| R02 | V004 retained evidence is insufficient to reproduce Fact Guard | VERIFIED observed auditability gap: no associated Sources; partial notes; lost structured fields | E02/E03/E06 |
| R03 | Shot1 was absent from the actual V004 render | **VERIFIED — DISPROVED**: Asset, handoff and all eight-scene projects include it | E07/E08/E10 |
| R04 | Current production path contains V004-specific blockers/treatments | VERIFIED code risk; full catalogue linked below | E01/E09 |
| R05 | Make replay can repeat nontransactional side effects | VERIFIED code risk; duplicate billing/rows not proved by snapshots | E01 |
| R06 | Legacy renderer reuse omits asset bytes/renderer version | VERIFIED code risk; base key reproduced, manual variants bypass it | E08–E10 |
| R07 | Render completion is not reconciled into Production status | VERIFIED observed divergence: four success results versus C/AG Queued | E02/E08 |
| R08 | Review-pending assets can reach successful rendering | VERIFIED observed: all eight Pending, voice null; four successful results | E02/E08 |
| R09 | Existing QA cannot establish final-video release readiness | VERIFIED implementation/evidence gap; pre-checks and narrow duration check only | E05/E09/E11 |
| R10 | Analytics 10 and 10B duplicate IG append logic | VERIFIED configuration risk; simultaneous execution not proved | E01/E04 |
| R11 | YouTube row mixes grains/windows and mislabels total subscribers | VERIFIED mapping risk; no stored runtime observations to quantify impact | E01/E04 |
| R12 | Asset ID is not an immutable file revision | VERIFIED observed: same voice Asset ID, different historic/current links; no stored hash | E02/E06/E07 |
| R13 | The conflicting current 02 prompt caused historic Needs Review/deadlock | UNVERIFIED actual returned enum, exact running version and status writer missing | E06; L1 |
| R14 | Shot1 exclusion was an intentional resume-only change | UNVERIFIED intent; earlier Shot1 creation supports INFERRED explanation | E07; L3 |
| R15 | A retry actually caused accidental duplicate paid outputs/jobs/rows | UNVERIFIED; current uniqueness and intentional render variants cannot establish this | E02/E08 |
| R16 | 9.Data actually yields missing/zero/error values in a successful 10 run | UNVERIFIED runtime connector behavior; interface exposes data | E01; L4 |
| R17 | 10 and 10B both ran and duplicated live metrics | UNVERIFIED; Analytics empty in inspected snapshots | E04/E06; activation evidence |
| R18 | Active schedules/cadence and worker supervision are established | UNVERIFIED; no scheduler/activation history supplied, --once default proves no daemon | E01/E09 |

Additional concrete symptoms under these risks: invalid epoch submittedAt; rights strings without separators; doubled official filename extensions; plan/timing populated later than asset generation; empty per-call cost/hash/version fields. These are not counted again.

## Retry, duplicate and restart analysis

All entries are **VERIFIED code/configuration risks**, not reproduced failures. No provider, scenario or worker was triggered. No explicit onerror exists in the 81 modules; maxErrors=3 is not a three-attempt idempotent retry contract. Exported sequential=false is not a durable row claim.

| Component | Retry / rerun / duplicate trigger | Timeout / delayed provider response | Restart / partial completion |
| --- | --- | --- | --- |
| 00A | Can submit another paid async request; new response ID is not logical dedup | Submit accepted but persistence fails → unknown/orphan response | No shared logical request key/reconciliation |
| 00B | Pending selection can append same ideas; completion route separate | Pending fallback polls without increasing attempts; failed writes attempts=1 | Crash between idea appends and completion can duplicate subset; no bounded timeout |
| 01 | Same selected row can be evaluated concurrently; last write wins | Repeated model request may bill twice; no request reconciliation | No in-progress claim or immutable score revision |
| 02 | Sources append is not an upsert; partial replay duplicates claim/source rows | Provider result can be lost after billing or before persistence | Status update and evidence appends separate; repeated/stranded Story possible |
| 02B | Repeated model judgment overwrites notes/state | Delayed result can overwrite a later decision; no revision guard | No immutable input bundle/blocker history or pair constraint |
| 03 | Same deterministic Production ID can be appended again | Successful model response/append may precede lost acknowledgment | Crash before Story=Script leaves repeat eligibility |
| 04 | Same AUD…V1 label can refer to another upload; AF presence narrows eligibility but is not a lock | Audio created before timeout/update can be orphaned or repeated | Upload/Asset/AF/Story writes not atomic; actual link replacement verified, cause unknown |
| 05 | Deterministic IMG/SRCVIS IDs not enforced; repeated shot creation/appends possible | Generated image can survive failure before link/status persistence | Final-shot status does not prove all earlier writes; fixed exclusion does not prove safe resume |
| 05B | Concurrent no-file selection can download/upload twice | Download/upload failure separate from semantic rejected-candidate fallback | Failure/Blocked rows no longer match Source Required; manual retry policy unknown |
| 06 | Repeated Assets Ready can copy/submit same flat names; no job claim | Partial Drive sync can delay readiness; copy/status failure can strand work | Up to 20 Story assets without revision/QA filter; parser rejects duplicate per-shot matches instead of silently selecting one |
| 10 | Repeated observations append; channel+IG are not one transaction | Partial YouTube/IG run may leave partial rows; no checkpoint reconciliation | Restart may append again; not publication-scoped |
| 10B | Same append semantics and same IG selection as 10 | No durable metric checkpoint/request status | No unique observation key |
| Worker | Completed job ID skipped; matching successful key may reuse old result paths; failed job ID skipped until new ID | Readiness only exists, size>0, mtime older than 2s; no content-hash/decode guarantee | processing directories resumed; local rename claim, no lease/fencing across workers; output existence/hash not checked on reuse |
| Future posts | No publisher in supplied implementation | Cannot claim current posting idempotency | Target needs external-post reconciliation before retry; not built here |

Flat malformed manifests can remain incoming with console diagnostics before a claimed job/result exists. Claimed worker errors produce FAILED and a failed directory; empty failed at snapshot is not proof of no historic failures. Current re-render scripts deliberately use new IDs/keys. No real retry fault injection was authorized or performed.

## QA: exact present strength

| Layer requested | Current evidence | Assessment |
| --- | --- | --- |
| Pre-render validation | production-check: typecheck, runtime project parser, asset preflight, composition inspection | VERIFIED implemented; four current captured projects also parse now |
| Technical validation | Schema/cross-field/timeline checks, path containment and existing files, Remotion exit status | VERIFIED, limited to these checks; no guarantee of media content quality |
| Final-video technical QA | V004 rerender scripts contain ffprobe duration 53.7–54.2s and result/file/mtime assertions; this audit independently probed V4 metadata | VERIFIED narrow checks exist and present metadata fits; historic post-check completion UNVERIFIED; no full decode, black/frozen-frame, clipping, subtitle/AV-sync suite |
| Perceptual audio QA | No persisted full-track review or implementation found | VERIFIED gap within inspected scope; possible undocumented human listening UNVERIFIED |
| Visual QA | Eight Asset QA Pending; Visual Gate review/result fields blank; no final-video visual inspector | VERIFIED no recorded pass; having overlays/source labels is not QA |
| Multimodal QA | No full latest-video review implementation/result | VERIFIED scope gap |
| Final judge | No fresh independent latest-artifact judgment | VERIFIED scope gap |
| Release gate | No release evidence consumer or publisher in 12; Production approval/QA/video URL fields blank | VERIFIED scope gap; SUCCEEDED only means render completed |

Fact Guard is upstream factual review of inputs, not final video fact/visual/audio verification. Build Log's historical manual CapCut publishing note is a record of reported manual work, not proof of an automatic pipeline or V004 publication.

## Analytics 10 / 10B and schedules

**VERIFIED configuration:** 10 runs YouTube channel/statistics/report logic before its IG branch; 10B contains the same IG tail without YouTube dependency. Both select the first media item from the same configured Instagram account, map the same insight fields and append Platform Analytics. Preserve media.id versus ig_id, media publication timestamp versus Retrieved At, metric definitions/availability and raw unit provenance. Consolidation is a later proposal, not disabling either scenario now.

**VERIFIED mapping risk:** YouTube Content ID is a channel, Views is lifetime channel views, Followers Gained receives total subscribers. Daily report request spans now−2 through now−1, but only first row is used and output Date is now. These dimensions cannot be interpreted as one daily performance observation. Two YouTube connection references exist; identical authenticated account scope is **UNVERIFIED**. Expressions use 9.Data while exported interface says data; actual runtime failure/missing/zero behavior is **UNVERIFIED**.

IG configured conversions: total watch /60,000 and average watch /1,000; live provider units/availability were not revalidated by calling the analytics APIs. Empty Analytics is absence of stored measurements, not zero performance. No per-publication checkpoints, older-media traversal, dedup or learning join is implemented. 10B can collect IG independently of a YouTube-stage failure in 10; this operational distinction must be retained in consolidation.

**UNVERIFIED:** live activation, cadence, scenario timezone, last success and 10/10B overlap. Non-instant metadata, maxErrors, sheet names and a worker --watch option do not establish an active schedule. No Make execution connector was available in the tool inventory; no Make scenario was launched.

## Hardcodings and target state ownership

See the exhaustive inspected-scope catalogue in [LEGACY_HARDCODINGS](LEGACY_HARDCODINGS.md): explicit IDs/commands, implicit shot treatments, asset/music paths, folders/accounts, row/column assumptions, templates and test-only constants. No hardcoding was changed.

[STATE_MACHINE](STATE_MACHINE.md) separates actual legacy snapshots/configuration from the proposed target. A single orchestration state writer owns each aggregate status; capabilities emit versioned results, never compete to mutate workflow fields. Canonical research admission/outcomes and ambiguous legacy Needs Review remain explicit. All target policies remain unimplemented.

## Minimal remaining Make evidence

Most artifact questions are resolved without logs. Request only these **four representative executions**, if retained; no blanket history export. Export input/output bundles and relevant filter outcomes, redact credentials, and include the scenario version/run ID. Dates identify search windows, not asserted execution timestamps.

| Ref | Scenario / exact run to locate | Missing information | Why this run is needed |
| --- | --- | --- | --- |
| L1 | 02 Research Agent: V004 run immediately preceding first retained Needs Review, on/before Aug 21 16:28 UTC (search Aug 13–21) | Actual output status, input/schema version, Sources writes and error/filter result | Distinguish prompt conflict from an external edit; recover lost research package and cause |
| L2 | 02B Fact Guard: V004 pass-producing run before Production creation Aug 29 20:52:54 UTC | Exact aggregated source bundle, returned blockers/guardrails/status and writes | Current pass exists without replayable evidence; validate the factual admission boundary |
| L3 | 05 Short Visual Production: V004 run nearest Shot1 creation Aug 29 23:33:58 UTC | Run version, shot iterator/filter results and produced file ID; any continuation marker | Determine whether Shot1 came from an earlier configuration and why current routes exclude it; later images began 23:45 UTC |
| L4 | 10 Platform Analytics: most recent existing successful run, date currently unknown; do not trigger a new one | YouTube raw data key/report rows + mapped Sheets bundle, connection account identities, IG branch outcome | Resolve Data/data and real units/window interpretation without another API call |

Separately request one **read-only activation/schedule overview for all 12 scenarios**, including timezone and last run; this is configuration evidence, not 12 logs. It resolves R18 and identifies whether 10B overlap needs any further investigation. No separate 10B bundle is requested now because its static tail is identical. If L3 does not exist or predates retention, record its absence; do not demand all August logs. Repeat/timeout incidents R15 may remain UNVERIFIED if no retained representative failure exists; do not induce one.

**Exactly one recommended next step:** close these targeted evidence gaps in one read-only reconciliation pass using L1–L4 and the activation overview, then record unresolved items explicitly before implementation authorization.

## Final read-only evidence pass — 2026-09-13

Final access check: VERIFIED no Make connector and browser shows the unauthenticated Make login page. No L1–L4 run or active schedule was readable. Previous UNVERIFIED=6; current=6; newly verified=0; newly disproved=0. Earlier code/artifact findings remain valid, not newly counted. The final evidence packet specifies exact views, twelve UNKNOWN scheduling rows and blocking versus nonblocking evidence.

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


## Make API read-only pass — 2026-09-14

- **API access:** VERIFIED. Local token used only in memory; scope configured as `scenarios:read`. GET `/api/v2/scenarios?teamId=2189886` returned 12 scenarios.
- **Scenario 02:** VERIFIED execution metadata for the relevant successful run `1c810e86c93145a2b322f2eb34b27afe` at `2026-08-21T16:25:49.608Z` (111 operations, 120518 bytes, status 1). `GET /logs/{executionId}` returns only compact `scenarioLog`; `GET /executions/{executionId}` returns only status. Story ID, research JSON, claims, sources, evidence and Sheet writes remain UNVERIFIED.
- **Scenario 02B:** VERIFIED successful runs `a7a675160d8441af9eb249ae306d0d27` at `2026-08-29T20:04:55.040Z` and `7a2b1f85d76a498cb661a94844f18c3d` at `2026-08-29T20:19:00.683Z`; both status 1, 5 operations. Errors are VERIFIED: RateLimitError at 19:37:52Z and BundleValidationError at 19:43:36Z. Fact Guard inputs/outputs, PASS/HOLD/REJECT, corrections, guardrails and final Sheet write remain UNVERIFIED.
- **API CAN ACCESS:** scenario list, execution IDs, timestamps, status, operation/transfer metadata, top-level error metadata.
- **API CANNOT ACCESS (with current read scope/endpoints):** historical module bundles, module inputs/outputs, provider payloads, and persisted Sheet/Drive values.
- **Sufficiency:** LEGACY UNDERSTANDING NOT YET SUFFICIENT for faithful app implementation; the two targeted blocker bundles remain required.
