# Existing renderer audit

Snapshot: 2026-09-13. Paths below are relative to the external `arktrov-remotion` directory. See [source inventory](SOURCE_INVENTORY.md).

## Observed architecture

`src/index.ts -> Root.tsx -> ProjectComposition.tsx` is the current registration path. Root reads V003 as studio default and registers ArktrovVideo (1080x1920) and ArktrovVideoHorizontal (1920x1080). React 18.3.1, Remotion 4.0.504 and TypeScript 5.5.4 are declared locally; these are observed versions, not recommendations for new installations.

Two worker input paths converge on Project JSON v1:

1. Production V2 via compile-production: schema validation, ASSETS_READY, READY voice, exact equality of shot/target/voice duration, one READY image/video per shot.
2. Make handoff via make-handoff and compile-make-handoff: embedded visual-plan JSON, character timings, shot-number asset mapping and deterministic subtitle grouping.

Worker: Drive Desktop local queue -> claim -> compile -> production-check -> Remotion -> result.json -> completed/failed. No network listener and no Make API call. Worker completion is only render success.

## Reuse assessment

| Component | Existing behavior | Extraction decision |
| --- | --- | --- |
| types.ts / frame helpers | Integer milliseconds, absolute interval rounding, timeline lengths | Preserve with contract fixtures |
| validateProjectData.ts | Required fields, enums, unique IDs, gaps/overlaps, frame duration and audio metadata checks | Reuse concept; reconcile with JSON Schema |
| ProjectComposition.tsx | Scene/media/camera/transition/text/audio layers | Extract after isolating hardcoded styling and scene IDs |
| make-handoff.ts | Parses current manifest, normalizes IDs, maps assets, hashes manifest, waits for sync | Keep as legacy adapter |
| compile-production.ts | Production V2 -> v1, source and AI labels, fixed defaults | Preserve mapping behind adapter |
| compile-make-handoff.ts | Voice-clock trimming, labels, hooks and music envelope | Preserve parity before configuration extraction |
| render-worker.ts | Directory claims, result writes, resume and successful-key reuse | Preserve behavior; redesign durable multi-tenant execution |
| MakeShortScene.tsx | Shot-number-based V004 motion, IXPE and scientific captions | Content-specific; must not become generic default |
| Captions / KenBurnsImage / VideoComposition | Older seconds-based renderer | Reference only; not current Root composition |
| production-check.ts | Typecheck, runtime validation, asset existence, composition inspection | Reuse pre-render checks; not final-video QA |

## Stable contracts to retain at boundary

- RenderJob contractVersion 1.0: jobId, idempotencyKey, productionFile, submittedAt, composition=ArktrovVideo, format=vertical, outputFile under output/*.mp4.
- Result contractVersion 1.0: SUCCEEDED/FAILED, identifiers, start/end timestamps, errors, project/output paths and optional reusedFromJobId. SUCCEEDED must map to RENDERED, never RELEASE_ALLOWED.
- Project schemaVersion 1: scenes, hookText, subtitles, sourceLabels, aiReconstructionLabels, branding, voice, music, soundEffects; timeline mode; milliseconds; camera x/y percentages. Both orientations declared by compilers because inspection checks both.
- Production contractVersion 2.0-final, schemaVersion 2. Upstream intelligence is compiled, not rendered directly.
- Subtitle schemaVersion 1: ordered id/text/startMs/endMs segments. Character timing must reproduce the script, except normalized line endings.
- Queue state directories incoming/processing/completed/failed; failed jobId terminal, retry uses a fresh jobId.

These are preservation targets, not claims of complete production validation.

## Important source differences

The older handoff document describes only Production V2 and no music. Current Make compatibility code also accepts flat manifests and adds a fixed V003 music asset at 0.16 with fades. The V2 compiler still has no music or SFX. Do not merge those defaults inadvertently.

Make compiler uses en-US and ARKTROV watermark. It accepts short/vertical, not long. Production V2 limits target duration to 15–60 seconds, shot duration to 0.5–5 seconds and fixes voice provider to ElevenLabs. It permits some motion enums and TEXT_ONLY which the compiler rejects. These are adapter constraints, not future core limits.

ProjectComposition routes every image with ID shot-NNN through MakeShortScene, which contains eight-shot narrative assumptions. It also checks two specific older scene IDs. Camera directives may therefore not describe actual rendered motion. Render behavior depends on code and IDs as well as JSON.

The runtime validator permits some values/extra fields that the JSON Schema forbids, while enforcing cross-field rules not captured in the schema. It rejects durationMode=voice and enabled ducking. No automatic audio-duration probing is implemented there.

## Reliability and safety gaps

- No full artifact QA, independent judge or release gate in worker. Preflight checks paths/existence, not decode integrity, sound levels or real overlay geometry.
- Manifest idempotency hashes omit actual file bytes and renderer version. A changed asset under the same name can reuse old output. Manual V004 rerender scripts alter the key to incorporate a renderer revision marker.
- Successful-key reuse returns paths to the original completed job; cleanup cannot discard that original while referenced.
- Local rename and file-settle heuristics are not a distributed lock or proof of complete Drive synchronization. Concurrent workers, same-name uploads and crash recovery need explicit tests.
- Legacy parser carries asset QA/rights metadata but does not use it as a publishing gate.
- Voice timing ends at 53.92s for inspected V004; initial visual plan ends at 55s. Compiler trims the last visual. This is not independent audio decoding verification.
- No tenant key in legacy contracts. New tenant envelope must not silently alter old strict schema.
- Retrieved V4 result says SUCCEEDED; final MP4 was not watched or QA-approved in this phase.
- `rerender-v004-v4.cmd` includes a narrow duration check and checks for reused output. It is a manual operational script, not the autonomous quality system.

No source was modified and no production queue worker or render was executed.

## V004 runtime validation supplement — 2026-09-13

[runtime validation](LEGACY_RUNTIME_VALIDATION.md) supersedes static-only hypotheses with dated workbook revisions, current Sheets/Drive evidence, four queue jobs and exact evidence levels. Actual Shot1 absence is disproved; historic producer/intent remains UNVERIFIED. Full inspected hardcoding inventory: [LEGACY_HARDCODINGS](LEGACY_HARDCODINGS.md). No external renderer/Make source or operational data was edited.
