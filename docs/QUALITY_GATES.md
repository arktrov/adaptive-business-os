# Quality gates

Binding target policy. Canonical implementation rules derived from ARKTROV_APP_QUALITY_GATES.md, APP_BOOTSTRAP_SPEC.md and the owner brief. Not yet an implemented service.

## Release predicate

RELEASE_ALLOWED is true only for the latest candidate if:

- technical_gate = PASS
- fact_gate = PASS
- visual_gate = PASS
- audio_gate = PASS
- mobile_readability_gate = PASS
- branding_gate = PASS
- final_video_judge = APPROVED
- no unresolved critical/high issues; all applicable hard rules pass
- evidence matches the current artifact hash, policy and business
- human approval, when required by business policy, approves this exact artifact

Missing evidence, provider timeout, malformed output and unknown results fail closed. A weighted score cannot compensate for a failed gate. Render result SUCCEEDED never supplies approval.

## Deterministic checks

Resolution/aspect/FPS; expected duration and voice-clock alignment; file exists and fully decodes; audio track and voice present; required music/SFX; loudness, clipping and unintended silence; missing/corrupt assets; black/empty frames; safe-area geometry; text bounds; subtitle timing and collisions; hook/source/AI/brand overlay overlap; required labels and branding. Required presence depends on the pinned production plan; music/SFX are not mandatory when the plan intentionally omits them.

Numeric tolerances for loudness, silence, safe areas and duration must be versioned per platform/format and calibrated before use. None are claimed tested in this foundation. Inspect the real output in addition to render metadata; preflight is insufficient.

## Full-video creative QA

Review the entire final video including audio, not only JSON or sampled stills. Initial provider candidate is Gemini from the source policy, behind a replaceable full-video port. Review first second, hook/scroll-stop, story coherence, pacing, static stretches, motion, crops, evidence figures, overlays/text/mobile readability, transitions, voice mix, music/SFX, emotional effect, credibility, brand, CTA and ending.

Issue payload: issue_id, candidate_id, artifact_hash, severity (critical/high/medium/low), category, start_ms, end_ms, problem, evidence/reason, required_fix, responsible_component, evaluator_version. Validate 0 <= start_ms <= end_ms <= duration; evidence may cover the full artifact for global issues.

## Repair routing

| Issue | Responsible component |
| --- | --- |
| text_layout / branding_problem | layout renderer / brand configuration |
| source_readability / crop | scene compiler and evidence treatment |
| weak_motion / timing | scene motion / timeline planner |
| weak_asset | retrieval or generation |
| subtitle_issue | subtitle compiler/renderer |
| audio_mix / weak_sound_design | audio mixer and music/SFX layer |
| factual_visual_problem | research, Fact Guard and visual plan |

Repair only affected inputs where possible, create a new candidate, then re-render and repeat all QA. Three cycles maximum per variant run; unresolved blocking findings stop at NEEDS_REVIEW. Keep issue and repair history.

## Independent final judge

Fresh evaluation of the latest complete video+audio after technical and multimodal gates. Separate evaluation invocation, evidence record and decision from the repair agent. APPROVED/REJECTED only. It must not merely trust previously fixed issue flags. Provider failures remain blocked.

## ARKTROV policy overlay

Evidence-led short documentary: controlled mobile-visible motion, source-figure crop/focus/highlight while retaining data integrity, staged diagrams, temporary concise hook, narration-led subtitles, discreet source/disclosure labels, restrained documentary audio and dominant voice. Dark/deep-space/electric-blue styling belongs to ARKTROV configuration. Truthful packaging and scientific qualification apply to claims and visuals.

Other businesses use their own brand/industry overlays. Facts, safety, copyright, source obligations, platform constraints, compliance, brand safety, AI disclosure and privacy cannot be weakened automatically.

## Baseline gap

The current worker implements pre-render checks and rendering. It does not implement this gate service. Therefore no Phase 0 artifact is RELEASE_ALLOWED.
