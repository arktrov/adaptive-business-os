# State machines

The first section is **observed Make configuration** from the complete 12-export set. The later target design remains unimplemented. Exact status spelling/case is significant; do not collapse workflow, evidence, asset QA and release into one enum.

## Observed legacy transitions

| Entity / field | Required current value / event | Writer → next value | Notes |
| --- | --- | --- | --- |
| DiscoveryJobs.status | Successful async submit | 00A → pending; attempts=0 | Not a Story status |
| DiscoveryJobs.status | pending + provider completed | 00B → completed | Separate route from idea appends |
| DiscoveryJobs.status | pending + provider failed | 00B → failed; attempts=1 | Provider message stored |
| DiscoveryJobs.status | pending + fallback provider state | 00B → pending | Attempts unchanged; no timeout/backoff |
| Story H | New discovery idea | 00B → Idea | Fact Status independently Pending verification |
| Story H | Idea | No supplied writer → Selected for Check | External selection required for 01 |
| Story H | Selected for Check | 01 → Evaluated | No score-based rejection branch |
| Story H | Evaluated | No supplied writer → Research Ready | External promotion required for 02 |
| Story H | Research Ready | 02 → Research Complete / On Hold / Rejected | Status enum/instructions; older input prompt conflicts |
| Story AD + H | Research Complete + evidence | 02B → pass+Approved / hold+On Hold / reject+Rejected | Pairing prompt-only; schema permits inconsistent pairs |
| Story H | Approved AND AD=pass | 03 → Script | New production append precedes Story update |
| Production C | Created by 03 | Script Drafted | Independent aggregate from Story |
| Production C | Script Drafted, Short 1 script, no AF timing | 04 → Voice Ready | Audio/timing recorded |
| Production C | Assets Ready, Short 1 script, no AF timing | 04 → Assets Ready | Deliberate preservation for late voice |
| Story H | Matching production voice generated | 04 → Voice Ready | No later Story status writer in set |
| Production C | Voice Ready + fixed V004; processed final shot | 05 → Visual Assets Pending QA | Equality end_second=total, not all-assets QA |
| Asset I / U | AI/voice generated | 04/05 → Generated – Needs Review / Pending or unset | 04 does not explicitly map QA U |
| Asset I / U | official_source shot >1 | 05 → Source Required / Pending | File Link absent |
| Asset I / U | Source Required + verified candidate/direct URL | 05B → Retrieved – Needs Review / Pending | Download/upload must succeed |
| Asset I / U | Source Required + fallback outcome | 05B → Source Retrieval Failed / Blocked | No automatic retry selection |
| Production C | Visual Assets Pending QA or other state | No supplied writer → Assets Ready | Actor/evidence unknown |
| Production C / AG / AY | Assets Ready | 06 → Render Queued / Queued / Render-{ProductionID} | No asset QA predicate |
| Queue / worker result | Incoming manifest/assets | External worker → processing → completed/SUCCEEDED or failed/FAILED | Separate renderer contract; no Make writeback |
| Platform Analytics | Successful 10/10B query | Append observation | No production/release transition |

[Per-scenario predicates and mappings](make/README.md) are authoritative for this audit. Status values reported here are case-sensitive source literals, not suggested replacements.

## Distinct state dimensions and gaps

Story R Fact Status describes evidence (research verified/mostly_verified/partially_verified/disputed/unverified/false/outdated); T Publish Recommendation describes a stage-specific recommendation. Neither constitutes release. E Source Strength changes representation between discovery and research. Story AF Visual Gate Result and AG V004 Eligible exist in metadata but are not admission predicates in the audited visual/handoff flow.

Production AI/AJ/AK (technical QA, story QA, human approval), Asset U QA Status and final-video release are separate concepts. Copying existing fields during an update does not establish a QA implementation. 06 reads only Production Assets Ready and Asset File Link, not those QA fields.

The complete set has no return transition from On Hold/Rejected, Source Retrieval Failed or Render Queued, no producer of Shot 1, and no publish lifecycle. External actions must be discovered from execution evidence. No undocumented implicit transition is assumed.

Polling/appends and provider side effects are not atomic with state writes. There is no in-progress row claim or enforced asset/production idempotency, and no explicit onerror handler in any of the 81 modules. Scenario maxErrors=3 and sequential=false do not supply a durable retry state machine.

## Target design — foundation proposal, not implemented

## Content and variant progression

DISCOVERY -> IDEA_SCORING -> RESEARCH -> FACT_GUARD -> BRAND_GUARD -> HOOK_PACKAGING -> SCRIPT -> VISUAL_PLAN -> ASSETS -> VOICE -> AUDIO -> RENDER_PENDING -> RENDERING -> RENDERED.

Asset and voice tasks may overlap only when the plan declares valid dependencies; the final timeline is compiled against voice timing. Hard-rule failure blocks downstream stages. Unsupported prerequisites pause; provider retries never skip a gate.

| From | Event / guard | To |
| --- | --- | --- |
| RENDERED | new immutable video candidate exists | TECHNICAL_QA |
| TECHNICAL_QA | all deterministic checks pass | MULTIMODAL_QA |
| Any QA / FINAL_JUDGE | repairable failure and run repair count < 3 | REPAIR_PENDING |
| REPAIR_PENDING | scoped repair actions applied | RENDER_PENDING (new candidate) |
| MULTIMODAL_QA | complete video+audio reviewed, all six gates PASS, no blocking issues | FINAL_JUDGE |
| FINAL_JUDGE | fresh latest-video decision APPROVED | RELEASE_CHECK |
| RELEASE_CHECK | full gate evidence valid; approval required but missing | AWAITING_APPROVAL |
| AWAITING_APPROVAL | authorized human approves same hash; recheck all gates | RELEASE_CHECK |
| RELEASE_CHECK | all predicates true | RELEASE_ALLOWED |
| RELEASE_ALLOWED | channel/payload/disclosure valid, current release checked atomically | PUBLISH_PENDING |
| PUBLISH_PENDING | external request dispatched | PUBLISHING |
| PUBLISHING | confirmed external post id | PUBLISHED |
| PUBLISHING | response ambiguous | PUBLISH_UNKNOWN |
| PUBLISH_UNKNOWN | reconciliation finds post / proves no post | PUBLISHED / PUBLISH_PENDING |
| PUBLISHED | scheduled provider observation available | analytics observation appended |
| Any stage | unrecoverable fault or exhausted ordinary retries | FAILED / NEEDS_REVIEW |
| Any stage | cancellation or budget hold | CANCELLED / PAUSED |

Each successful publication starts its own analytics timers. Partial multi-platform publication remains explicit; never retry already confirmed channels automatically. Learning progresses independently and never rewinds publication state.

## Invariants

Six gates are technical, fact, visual, audio, mobile_readability and branding. Missing/error/pending is not PASS. APPROVED is the only acceptable final judge value. Hard rules, zero unresolved critical/high issues, exact candidate hash, current policy and optional human approval are additional release requirements.

Default ceiling: three repairs per variant run, persisted across re-renders and process retries. New candidate IDs do not reset the counter. Exhaustion with any blocking failure => NEEDS_REVIEW. Human review cannot bypass hard gates; it can provide corrections and authorize a new traced run.

Any asset, script, timeline, video, relevant packaging or policy change revokes affected release authority and requires corresponding revalidation; a new render always runs all gates again. Final judge receives the complete latest video as fresh evidence.

## External queue mapping

incoming -> queued; processing -> running; completed/SUCCEEDED -> RENDERED; failed/FAILED -> failed attempt. Legacy QA_PASS or APPROVED strings are not sufficient target release evidence. Keep legacy result contract unchanged and add target state outside it.
