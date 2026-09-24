// Capability contract only. No live music provider is configured or called by Phase 2C.
export class MusicSourceProvider {
 describe(){return {id:'unconfigured',capabilities:['MusicSourceProvider'],available:false,acquisition_enabled:false}}
 async search(){throw Error('MUSIC_PROVIDER_NOT_CONNECTED')}
 async fetchAsset(){throw Error('MUSIC_ACQUISITION_NOT_AUTHORIZED')}
}
export function verifyMusicSourceProvider(provider){if(!provider?.describe?.().capabilities?.includes('MusicSourceProvider')||typeof provider.search!=='function'||typeof provider.fetchAsset!=='function')throw Error('INVALID_MUSIC_SOURCE_PROVIDER');return provider}
