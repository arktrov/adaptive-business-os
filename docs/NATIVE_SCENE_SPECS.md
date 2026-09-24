# Native scene specifications

## Contract and boundaries

native-scene/2 is an application asset specification, not a rendered video or a change to the external renderer's Project JSON / RenderJob contracts. It uses the existing NATIVE_SCENE_SPEC asset type and immutable asset_artifact evidence. asset_id is the native scene ID; the asset envelope binds business/job, original AssetPlan hash, exact script ID/version/hash and current effective ProductionPackage ID/version/hash. Existing native-scene/1 records remain immutable historical coarse scene plans.

Each version-2 record contains the exact beat start/end/duration, approved narration segment, voice/audio/timing identity when present, claim IDs and typed evidence references. Its design includes objective, composition hierarchy/layout/normalized coordinates, background, foreground geometry/bounds/meaning/style, explicit diagram semantics, exact anchored text/labels, disclosure, motion/keyframes, emphasis, transitions, safe/subtitle areas, mobile requirements, brand policy references, factual guardrails/qualifiers, dependency inventory and renderer notes.

This contract currently supports controlled non-spatial schematic original compositions. It does not claim support for measured-coordinate diagrams or observational media. New factual labels must occur in the bound narration, brief or disclosure. Count semantics separate selected samples, minimum counts and scope counts; complete-census claims, invented spatial distribution and population-wide physical identity are rejected. These deterministic checks are necessary preflight, not an independent scientific or perceptual review of all authored geometry/prose. Human visual review and later full-video QA remain mandatory.

## Persistence and timing

NativeSceneService is offline-only and has no provider/renderer dependency. Under the existing job lock/transaction it revalidates the current approved AssetPlan and effective timing revision, loads persisted script/scope and policy evidence, validates all requested beats, then writes immutable assets, verifies readback and appends a manifest and batch audit record. A duplicate identical batch reuses existing records; a transaction failure leaves no partial batch. Changed designs create new revisions, never overwrite prior artifacts. Only ASSETS_PENDING accepts this authoring command; no state override occurs.

The original plan still binds the human-approved creative package. A voice-timing-only package provides the effective beat clock. Version-2 assets bind that effective package directly. Manifest reconstruction first retains historical voice/plan validation, applies the timing authority, then validates/adopts current native specs. Stale-package specs cannot resolve current beats. Current mapping, including asset ID, timing, rights, provenance and spec readiness, is exposed in Job Detail together with actual persisted scene data; no fake preview is shown.

## Rights

An original geometry/text specification with an empty third-party dependency inventory has CLEARED rights for SPECIFICATION_ONLY. Its authorship evidence binds the design hash and explicitly excludes embedded/acquired third-party media, textures, logos and fonts. A declared third-party dependency yields REVIEW_REQUIRED and cannot resolve that beat's render-asset readiness. This does not clear future font/media dependencies or authorize publication. Referenced research sources are evidence citations, not acquired or licensed source imagery.

## V005 authoring

The V005 designs follow the persisted eleven-beat sequence and Package v5's 0–59.9209977324263 second voice timeline. Scene instructions implement the stored dark/electric-blue brand direction as local design choices, not global brand defaults. All geometric placements are schematic and non-spatial; no sky coordinates, per-galaxy distributions, quantitative instrument curves, Type Ia or ionization assertions are added.

The opening uses a fixed 84 candidates label and six equal scope outlines, followed within the same scene by the selected-sample qualification. Mystery scenes keep physical identities unnamed and unresolved. Detection scenes distinguish sensitivity/exposure/absorption and varying context without numerical weights. M31 scenes use at least six typography plus an ellipsis, never exactly six plotted objects, and restrict the white-dwarf branch to the nearby low-luminosity subset. Original-script qualifiers and typed support/context evidence remain attached.

The persisted Package-v5 Beat 4 transition still describes a numeral-84 handoff inherited from an earlier order. Only the new scene's transition treatment is adapted to its actual next detection beat: the observational signal compresses into the detector input. The original package and inherited transition text are preserved for traceability.

Human review output is exported from persisted assets to ignored local Markdown/HTML/JSON. It includes a compact eleven-row table and full per-scene identity, narration, evidence, composition, text, semantics, motion, rights and renderer notes. It is a specification review, not rendered previews. MUSIC, SFX, SUBTITLE_TIMING and uncleared voice rights remain independent blockers; HOLD TRUE and RELEASE_ALLOWED FALSE persist.

## Tests

NS01–NS36 cover the contract, eleven-beat admission, exact timing/script/claims, blocked/context claims, disclosures, original/dependency rights, mandatory composition/motion, text anchoring, safe areas, count/position/identity semantics, no provider access, manifest gates, PostgreSQL restart/concurrency/rollback, immutable history and effective voice-timing package admission. Existing renderer hashes and Make originals are verified without executing them.
