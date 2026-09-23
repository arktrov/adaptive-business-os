# Provider routing

Adaptive Business OS automatically resolves asset requirements and provider routing. Customers do not manually wire provider modules.

Observed media requires SOURCE_ASSET with authenticated source and rights. Controlled diagrams/data visuals use NATIVE_SCENE. Illustrative eligible requirements may use GENERATED_STILL, GENERATED_VIDEO or IMAGE_TO_VIDEO; licensed media uses SourceMediaProvider. Noneligible illustrative content uses controlled native scenes. No vendor is encoded in the domain or ProductionPackage.

Registry capabilities: VoiceGenerationProvider, ImageGenerationProvider, VideoGenerationProvider, SourceMediaProvider. describe/request adapters are replaceable; a Runway adapter can implement the video port without changing domain/persistence. No live video adapter is configured or executed. Registry selection checks capability, availability, policy allowlist, aspect ratio, quality, duration and optional cost ceiling. Unknown cost does not satisfy a numeric ceiling.

AssetService routeAndProduce selects an adapter from the registry. Voice profile provider must match the selected adapter. One immutable initial attempt per plan/requirement; no automatic retries. Persist the attempt and call permit before dispatch, recoverable sanitized response before normalization/QA, and independent outcome afterwards. Reprocessing is offline and returns a candidate; it does not rewrite a failed outcome or invent a provider call.

V005 v4 has 11 noneligible native/controlled beats; no image/video provider is needed. Generic source/image/video ports are verified with offline adapters; that does not certify an unconfigured live vendor.
