# ProductionAssetManifest

Immutable versioned manifests bind plan, human-selected script and package hashes, voice ID, visual mapping, artifact hashes, rights, disclosures and attempt IDs. Music, SFX and subtitle timing requirements remain explicit.

ASSETS_PARTIAL means at least one required input is absent or not cleared. ASSETS_READY requires all visual mappings with valid QA and CLEARED rights, valid cleared voice, and no remaining required audio/subtitle inputs. Current production has unresolved BGM/SFX and timing; no empty placeholders count as assets. Repeated snapshots produce new immutable versions.

Central transitions: PRODUCTION_PACKAGE_READY -> ASSET_PLANNING -> ASSETS_PENDING; ASSETS_READY requires a persisted manifest re-derived from persisted artifacts. Generic HTTP evidence writes cannot forge asset records. Human review remains required even when technically ready; publication HOLD stays true, release_allowed false.

This is the application-side Phase-2D boundary. native-scene/1 must be compiled/adapted by a future renderer integration; no existing Remotion code is changed or executed.
