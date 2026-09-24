import {loadNativeContext} from './native-scene-context.js';
import {applyNativeScenes,nativeSchema} from './domain/native-scenes.js';
export async function resolveNativeSceneManifest(c,plan,d,manifest){
 if(!d.artifacts.some(a=>a.data?.schema===nativeSchema&&a.plan_hash===plan.content_hash))return manifest;
 const context=await loadNativeContext(c,plan,manifest.effective_production_package_id??plan.production_package_id);
 return applyNativeScenes(context,manifest,d.artifacts);
}
