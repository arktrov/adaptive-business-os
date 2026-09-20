// Production ports: adapters implement describe() and execute(request, {attempt, run_id}).
// describe() returns immutable JSON {provider, model, adapter_version, configuration}.
// execute() returns {output: canonical domain contract, metadata: {synthetic, ...}}.
// No credentials, raw headers or private reasoning belong in either response.
export function requireProvider(provider){
 if(!provider||typeof provider.describe!=='function'||typeof provider.execute!=='function')throw Error('PROVIDER_PORT_REQUIRED');
 return provider;
}
