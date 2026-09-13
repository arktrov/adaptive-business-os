# State machines

Target design, not implemented. Legacy queue states remain separate.

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

## Legacy mapping

incoming -> queued; processing -> running; completed/SUCCEEDED -> RENDERED; failed/FAILED -> failed attempt. Legacy QA_PASS or APPROVED strings are not sufficient target release evidence. Keep legacy result contract unchanged and add target state outside it.
