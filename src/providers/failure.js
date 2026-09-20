import {assertSafe} from '../domain/research.js';
// Only diagnostics explicitly produced by an adapter enter the failure channel.
// Ordinary exception messages, stacks, causes and provider bodies are never copied.
const failures=new WeakMap();
export class ProviderFailure extends Error {
 constructor(code,category,metadata){
  if(!/^[A-Z][A-Z0-9_]{0,95}$/.test(code)||!['PROVIDER_FAILURE','PARSING_FAILURE','UNSAFE_PAYLOAD'].includes(category))throw Error('INVALID_FAILURE_CONTRACT');
  assertSafe(metadata);
  super(code);this.name='ProviderFailure';
  failures.set(this,{category,metadata:structuredClone(metadata)});
 }
}
export function providerFailure(error){const failure=failures.get(error);return failure?structuredClone(failure):null;}
