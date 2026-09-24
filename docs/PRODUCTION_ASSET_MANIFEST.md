# ProductionAssetManifest

Immutable versioned manifests bind plan, human-selected script and package hashes, voice ID, visual mapping, artifact hashes, rights, disclosures and attempt IDs. Music, SFX and subtitle timing requirements remain explicit.

ASSETS_PARTIAL means at least one required input is absent or not cleared. ASSETS_READY requires all visual mappings with valid QA and CLEARED rights, valid cleared voice, and no remaining required audio/subtitle inputs. Current production has unresolved BGM/SFX and timing; no empty placeholders count as assets. Repeated snapshots produce new immutable versions.

Central transitions: PRODUCTION_PACKAGE_READY -> ASSET_PLANNING -> ASSETS_PENDING; ASSETS_READY requires a persisted manifest re-derived from persisted artifacts. Generic HTTP evidence writes cannot forge asset records. Human review remains required even when technically ready; publication HOLD stays true, release_allowed false.

This is the application-side Phase-2D boundary. native-scene/1 must be compiled/adapted by a future renderer integration; no existing Remotion code is changed or executed.


## Optional business voice profiles

See [Business voice profiles](BUSINESS_VOICE_PROFILES.md). Composition-driven zero/one/multiple voice requirements replace the mandatory-voice assumption for new plans. Business-scoped immutable profile revisions and explicit human approval are required for synthesis; historical values are candidates only. No provider defaults, credentials, live calls or historical artifact rewrites. V005 retains its narration requirement; the original VOICE_PROFILE_MISSING checkpoint is historical. Current runtime status is recorded in MASTER_STATE.md.

## Voice availability and rights are separate

Manifest resolution validates the actual audio bytes, exact script/text binding, tenant, package and recorded QA before attaching a VoiceAsset. A valid attachment resolves the corresponding synthesis requirement (VOICE or an explicit voice-slot ID), even while rights await review. A separate VOICE_RIGHTS:<requirement_id> entry blocks readiness for every non-CLEARED rights status; voice_rights records the exact slot, asset and stored rights status. UNKNOWN, REVIEW_REQUIRED, RESTRICTED and NOT_ALLOWED never imply permission to use or render the asset. Cleared matching assets are preferred; the summary voice_asset_id and per-slot mapping use the same selection. Missing or invalid audio cannot resolve the synthesis requirement.

No rights record, prior manifest or historical attempt is rewritten. New snapshots are immutable revisions via AssetRepository.manifest. Visual readiness rules are unchanged. Human perceptual review remains mandatory and publication HOLD/release protection stay independent.

## Approved voice timing overlay

See [Voice timing](VOICE_TIMING.md). A timing-only ProductionPackage revision is bound via effective_production_package_id/hash, production_timing and voice approval references. Original creative plan/package identities remain intact. Existing visual assets retain their history but require retiming review before reuse; the manifest cannot infer readiness from their old durations. Exact captions, rights, music and SFX remain separate gates.

## Music selection

See [Business music](BUSINESS_MUSIC.md). MUSIC is resolved only by a persisted MusicSelection/AudioMixPlan bound to an actual approved, rights-compatible, byte-validated business track and current effective timing package. New manifest admission rechecks lifecycle and license changes/expiry. Optional music requires no track; an audio intent alone never resolves required music. V005 retains MUSIC unresolved.

## Current native specification admission

Native-scene/2 assets bind the effective ProductionPackage hash and actual beat timeline. Manifest reconstruction validates these bindings after the voice-timing overlay and selects the highest current scene revision per beat. A validated original specification can resolve its visual requirement, while MUSIC, SFX, subtitle timing and voice-rights gates remain independent. Historical assets/manifests stay unchanged. RENDERER_SPEC_READY describes specification completeness only; human visual approval and later rendered-output QA are still required. Details: [Native scenes](NATIVE_SCENE_SPECS.md).
