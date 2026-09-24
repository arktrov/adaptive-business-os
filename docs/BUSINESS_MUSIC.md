# Optional business music and background audio

Music is a first-class, optional asset independent of voice. New plans honor an explicit composition music_required boolean first, then a persisted business music_enabled preference, then the legacy audio-intent fallback. Existing approved packages/plans are never reinterpreted when preferences change. Voice-only, music-only, both and neither are valid. A music-required plan remains MUSIC unresolved until an actual approved, technically validated and rights-compatible asset is attached. An AudioPlan or mix intent alone cannot resolve it.

## Library and provenance

MusicAsset revisions are stored in business_music_assets, separate from visual/voice job artifacts. Each carries a stable track ID, business, version/status, title, creator, provider/source reference, optional source reference, provenance, actual audio bytes/hash/format/duration/QA, license and approval history. Statuses: CANDIDATE, APPROVED, RESTRICTED, RETIRED. Rights: UNKNOWN, REVIEW_REQUIRED, CLEARED, RESTRICTED, NOT_ALLOWED. All acquired catalog tracks are copied into a tenant-scoped record; there is no globally shared mutable license grant. Business-owned and catalog-origin tracks remain distinguishable through provenance.

Uploads create candidates with REVIEW_REQUIRED regardless of incoming approval/clearance fields. Human usage authorization is required for approving uploaded music. A generated-origin future asset must record model and generation reference in addition to provider, terms and provenance. No generator or remote catalog is connected or invoked in this phase. Replacements are new assets; retirements and corrections are immutable revisions. Latest retirement/restriction cannot fall back to historical approval.

The local importer validates actual WAV bytes. MP3 imports through the application interface require configured FFmpeg/ffprobe and the currently supported 44.1 kHz/128 kbit/s format; unsupported encodings stop safely. The current browser upload supports WAV candidates up to 8 MB. No URL fetch is performed by an import or preview. Previews serve the stored tenant-scoped bytes with no-store. Uploads, binaries and runtime exports remain outside Git.

## License evidence and compatibility

Persist license_type, license_reference, license_evidence (authority, reference, basis and terms hash; the UI also stores provided terms text), commercial/social permission, allowed platforms and territories, expiry, credit requirement/text and loop permission. Unknown scope fails compatibility; explicit * means documented unrestricted scope, never an assumed default. Royalty-free is a license category, not evidence. CLEARED requires an explicit human license decision plus evidence; an upload, public URL, profile approval or provider response cannot grant it. Changed license terms invalidate previous clearance unless a fresh explicit human clearance is provided.

Recommendations and selections check APPROVED + CLEARED, tenant, actual usage context, each requested platform, territory, time, commercial/social use and duration/loop permission. Required attribution is retained in the mix plan. Final publication must revalidate rights at actual use time; current compatibility is not publication approval. Library lifecycle changes and manifest admission use the same business advisory lock so readiness cannot race a rights change.

## Preferences and recommendations

Versioned business_music_preferences store music enabled, automatic recommendation enabled, multiple favorites, contextual defaults and named playlists. Defaults can be assigned by brand, language, format, channel or use case. Suitability also covers content type, emotional tone, audience, platform, narration presence, pacing and audio intent; actual duration constrains loop eligibility. Restrictive track suitability is checked against the requested context.

An explicit compatible user choice wins. Automatic selection uses one applicable compatible business default, then a unique compatible favorite, then a single remaining compatible candidate. Multiple valid unresolved choices return recommendations, not a random fallback. Recommendation can be disabled independently of whether a specific job requires music. No ARKTROV musical taste or provider is embedded in the generic core.

## Selection, manifest and AudioMixPlan

MusicSelectionService selects from existing local library assets only. It appends asset_music_selection and asset_audio_mix_plan and a manifest in the existing job transaction. It binds the selected track revision/hash, immutable plan and effective timing-package hashes, actual job duration, usage context and selection reason/actor. The soundtrack cannot silently use the old estimated duration after a voice timing revision. Tenant, package, audio identity, mix duration and voice binding are checked.

Every new manifest rechecks current track status/license/expiry. Retired/restricted tracks, changed license/track revisions or a new timing package restore MUSIC unresolved; historical selection and manifests remain unchanged. No live acquisition occurs during recommendation, selection or revalidation. Narration presence is derived from the composition requirement, even before VoiceAsset creation. A changed voice binding restores MUSIC unresolved for mix reselection/review rather than aborting manifest construction or resynthesizing audio.

AudioMixPlan persists voice/music IDs and hashes, start/end, loop strategy, fade intents (timings pending), ducking intent, hook intent, section intensity changes, SFX interaction and attribution. Voice stays primary when present. Loudness targets remain null until authoritative policy supplies them. The final mix QA must check audible music, intelligible/dominant voice, clipping, unintended silence, fades/transitions and duration. Planned presence is not perceptual audibility. QA remains NOT_RUN; Publication HOLD TRUE and RELEASE_ALLOWED FALSE. No renderer integration or publishing is added.

## Provider boundary and UI

MusicSourceProvider defines describe/search/fetchAsset for future licensed libraries, royalty-free catalogs, uploads and generated sources. Its unconfigured implementation rejects acquisition. Concrete network/provider implementations and credentials are out of scope.

Current local UI exposes MUSIC settings, enabled/recommendation toggles, a contextual default, existing tracks and rights status, stored-byte preview, local WAV candidate upload, human license/listening approval, retirement and job-level rights-checked selection/recommendation. Advanced multi-default/favorite/playlist editing is supported by the repository/preferences API; a richer editor can extend this surface. External catalog browsing/connection controls must remain unavailable until a concrete provider is connected. No manual scenario wiring is required.

Endpoints inherit the local server's business context, host/origin protections and JSON requirements: /api/music, /api/music/preferences, /api/music/import, /api/music/decision, /api/music/select and /api/music/{id}/preview. Audio data is excluded from the metadata list. Generic job evidence writes cannot forge reserved asset_music_selection or mix records.

## V005

Background music is requested: a restrained cinematic/documentary bed supporting mystery/science atmosphere without competing with the approved narration. This is business/job-specific intent, not a global rule. No actual track or license evidence has been supplied in this task. V005 therefore retains MUSIC unresolved, its approved voice and timing revision, ASSETS_PARTIAL, publication HOLD and release prohibition. No music, images or video are acquired/generated.
