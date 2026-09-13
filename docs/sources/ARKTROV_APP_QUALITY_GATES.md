# ARKTROV App – Quality Gates & Self-Correcting Render Loop

Status: BINDING ARCHITECTURE RULE
Date: 2026-09-13

## 1. Core release rule

No rendered video may be published directly.

Every render must pass a closed automatic QA loop:

Render -> Technical QA -> Gemini Video QA -> Repair Plan -> Automatic Repair -> Re-render -> Final QA -> Release Gate

Publication is only allowed when every mandatory gate returns PASS.

`RELEASE_ALLOWED = TRUE` only if all of the following are PASS:

- technical_gate
- fact_gate
- visual_gate
- audio_gate
- mobile_readability_gate
- branding_gate
- final_video_judge

A weighted average score must never override a failed critical gate.

## 2. Technical QA

Before model-based review, deterministic checks must validate at minimum:

- expected resolution and aspect ratio
- expected duration / voice master-clock alignment
- audio present and decodable
- no missing assets
- no black / empty / broken frames
- no render errors
- subtitle timing within video duration
- text and labels inside safe areas
- no illegal overlap between subtitle, hook, source label, AI label and branding regions
- output file exists and is playable
- required disclosures / source labels are present where applicable

Technical QA failure blocks publication and produces a machine-readable repair task.

## 3. Gemini Video QA

After every technically valid render, Gemini reviews the complete rendered video including audio.

The review must not return only a generic score. It must return structured, machine-readable issues with exact time ranges and repair instructions.

Required issue fields:

- severity: critical | high | medium | low
- category
- start_ms
- end_ms
- problem
- evidence / reason
- required_fix
- responsible_component

Important QA categories include:

- hook / scroll-stop strength
- visual pacing
- dead or static sections
- mobile readability
- text hierarchy
- subtitle readability
- overlay collisions
- source-figure readability
- crop / focus quality
- scientific visual integrity
- AI reconstruction labeling
- source labeling
- scene transitions
- motion quality
- branding consistency
- audio clarity
- music level
- sound-design quality
- ending quality
- overall professional feel

## 4. Automatic repair routing

The system must route each detected issue to the component that can actually fix it.

Examples:

- text_layout -> Remotion layout / scene compiler
- source_readability -> crop / focus / evidence treatment
- weak_motion -> scene motion logic
- weak_asset -> asset generation / retrieval stage
- subtitle_issue -> subtitle renderer / timing compiler
- audio_mix -> audio mixer
- weak_sound_design -> BGM / SFX layer
- factual_visual_problem -> Fact Guard / visual-plan repair
- branding_problem -> branding renderer

Only the necessary part should be regenerated or repaired where possible. Avoid rebuilding unrelated pipeline stages.

## 5. Repair loop

After repair, the video must be rendered again and the complete QA process must run again.

The previous approval must never carry forward automatically to a new render.

Each new render is a new candidate and must be independently validated.

Recommended loop:

1. Render candidate
2. Deterministic Technical QA
3. Gemini Video QA
4. Generate structured repair plan
5. Apply targeted repairs
6. Re-render
7. Repeat QA
8. Independent final judge
9. Release only on full PASS

## 6. Independent final judge

The final judge must inspect the latest full video as a fresh artifact.

It should not simply confirm that old issues were marked fixed. It must independently answer whether the current final video is acceptable for publication.

Final result:

- APPROVED
- REJECTED

`APPROVED` is required for publication.

## 7. Infinite-loop protection

Automatic repair loops need a safety ceiling.

Default recommendation: maximum 3 automatic repair cycles per candidate.

If a critical or high-severity issue persists after the maximum cycle count:

`status = NEEDS_REVIEW`

The system must stop automatic publication.

It must never publish merely because retry limits were reached.

## 8. Learning from repeated failures

The system must distinguish one-off repair instructions from recurring renderer defects.

If the same issue pattern appears repeatedly across videos, convert it into a permanent renderer / compiler rule.

Example:

Repeated QA issue:
"Scientific source figure is unreadable in vertical mobile format."

Permanent rule:
"Scientific source figures must use mobile-specific crop/focus treatment, progressive zoom or focus boxes instead of full-frame static display."

This feedback loop should improve first-pass render quality over time.

## 9. ARKTROV-specific visual requirements

The renderer must target a professional short-form documentary standard, not a slideshow.

Binding principles:

- visible, controlled motion on mobile
- no long static image holds without intentional treatment
- no oversized persistent explanatory overlays
- subtitles remain the main narration text layer
- hook text is short, high-impact and temporary
- source labels are small and unobtrusive
- AI reconstruction / AI diagram labels are clear but unobtrusive
- scientific figures preserve data integrity
- source figures use crop/focus/highlight treatment for readability
- diagram shots use staged reveals / emphasis instead of static display
- transitions must support pacing without becoming flashy
- voice remains dominant in the mix
- restrained documentary BGM and SFX where appropriate
- ARKTROV dark / deep-space / electric-blue visual language remains consistent

## 10. Architecture requirement for the future app

This QA loop is a core architecture component, not an optional later add-on.

The app's normal production path must include:

- renderer
- technical validator
- video QA model
- repair planner
- repair executor
- re-render loop
- independent final judge
- release gate

The customer should never need to manually inspect workflow wiring or repair individual pipeline modules.

The system should expose status and reasons, while keeping orchestration internal.

## 11. Source-of-truth rule

Once the application repository is established, this document must live in GitHub and be versioned with the application code.

Recommended repository location:

`docs/QUALITY_GATES.md`

Any architecture or implementation change that bypasses these gates requires an explicit recorded decision.

Recommended companion files:

- `MASTER_STATE.md`
- `ARCHITECTURE.md`
- `DECISIONS.md`
- `ROADMAP.md`
- `docs/QUALITY_GATES.md`

GitHub becomes the authoritative technical source of truth. Google Drive may keep an operational copy, but implementation decisions must be reflected in the repository.
