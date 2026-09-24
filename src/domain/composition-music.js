export function musicRequirement(pkg,preferences=null){
 const explicit=pkg.music_configuration?.music_required??pkg.audio_plan?.music_required;
 if(explicit!==undefined&&typeof explicit!=='boolean')throw Error('MUSIC_REQUIREMENT_INVALID');
 if(preferences&&preferences.business_id!==pkg.business_id)throw Error('MUSIC_TENANT_MISMATCH');
 return {required:explicit??preferences?.music_enabled??Boolean(pkg.audio_plan?.music_intent),status:'UNRESOLVED',intent:pkg.audio_plan?.music_intent??null};
}
