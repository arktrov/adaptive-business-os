# Asset contract

AssetRequirement and immutable AssetPlan bind the selected human-approved Script/Package hashes, policy snapshots and each beat. AssetGenerationAttempt, AssetArtifact, AssetProvenance and AssetRightsStatus are immutable hashed records. Types: VOICE, IMAGE, VIDEO, SVG, DATA_VISUAL, SOURCE_MEDIA, MUSIC, SFX, NATIVE_SCENE_SPEC. Current native output is native-scene/1 JSON with normalized layer positions, duration, motion, factual classification, source references and disclosures. It is an application-side specification, not rendered media.

PostgreSQL append-only evidence stores plan, attempt, sanitized recoverable response, outcome, artifact and manifest. Existing tenant/job foreign keys and immutable-row triggers apply; no duplicate persistence framework or migration is introduced. Blob bytes are base64 within recoverable/artifact records for this local foundation. Large-media object storage is future deployment work.

Voice metadata binds exact script text/hash/version, language, profile, settings, request, format, sample rate, duration and byte SHA256. PCM16 WAV QA decodes RIFF chunks, checks plausibility, clipping and prolonged silence. Supplied transcript must equal approved text; absent alignment remains NOT_AVAILABLE. PNG checks CRC, dimensions, decompression and row filters. Other codecs require an explicit trusted decoder; metadata-only success is rejected. Technical QA does not replace perceptual human/video QA.

No current authoritative ARKTROV voice ID/model/profile is configured. Historical Make ElevenLabs settings are not adopted. Live voice must report VOICE_PROFILE_MISSING; missing credentials with a valid profile report VOICE_PROVIDER_CREDENTIAL_NOT_AVAILABLE.
