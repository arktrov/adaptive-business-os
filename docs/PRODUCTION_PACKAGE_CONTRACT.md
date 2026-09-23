# Production Package 1.0

Immutable package references exact script ID/version/hash, business/job, profile, scope and policy snapshots. It is generated deterministically only after script validation. For BOTH, separate SHORT and LONG drafts/packages commit atomically.

Each ordered contiguous timeline segment has target start/duration, exact voiceover, on-screen plan, claim refs, provider-agnostic visual requirement and classification, asset requirement, motion, transition, audio/SFX intent and branding requirements. Durations derive from profile speaking pace; all later voice-clock alignment and render QA remain mandatory.

Global fields include visual direction, audio plan, subtitle strategy, safe-area fractions, brand application, asset sourcing and rights requirements. Audio specifies voice style/language/pace/VO estimate/music intent/role/perceptual audibility/SFX requirements. Music presence alone never passes future audibility QA.

planned_asset_requirements is separate from actual artifacts. Every requirement retains source/evidence pointers, rights and credits, NOT_CLEARED reuse status, and null actual asset. Public access is never reuse permission. No media is downloaded, generated or rendered by this phase. Every asset must later be matched to its claim and classified honestly.

A package keeps publication_hold=true and release_allowed=false. Central gates verify persisted drafts, packages and asset rows before PRODUCTION_PACKAGE_READY. Failure rolls the transaction back. Package readiness does not invoke any downstream generator.
