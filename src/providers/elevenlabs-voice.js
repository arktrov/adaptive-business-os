import {hash} from '../domain/research.js';
const need=(ok,code)=>{if(!ok)throw Error(code)};
export class ElevenLabsVoiceProvider {
 #key; #fetch; #calls=0; #requestId=null;
 constructor({apiKey=process.env.ELEVENLABS_API_KEY,fetchImpl=globalThis.fetch,profile,requestHash}){this.#key=apiKey;this.#fetch=fetchImpl;this.profile=profile;this.requestHash=requestHash}
 describe(){return {id:'ElevenLabs',model:this.profile.model,external:true,available:!!this.#key,quality:1,capabilities:['VoiceGenerationProvider']}}
 diagnostics(){return {external_calls:this.#calls,request_id:this.#requestId}}
 async request(input){
  need(this.#key,'ELEVENLABS_CREDENTIAL_NOT_AVAILABLE');need(this.#calls===0,'VOICE_SINGLE_CALL_ALREADY_USED');need(hash(input)===this.requestHash&&input.profile.content_hash===this.profile.content_hash,'VOICE_REQUEST_CHANGED');
  const profile=input.profile;need(profile.status==='APPROVED'&&profile.provider==='ElevenLabs'&&profile.model==='eleven_v3','VOICE_PROFILE_PROVIDER_MISMATCH');
  need(profile.output_settings.output_format==='mp3_44100_128','AUDIO_FORMAT_UNSUPPORTED');const settings=profile.generation_settings;
  need(Number(settings.speed)===1&&settings.use_speaker_boost===false&&settings.apply_text_normalization==='auto','VOICE_SETTINGS_NOT_SUPPORTED');
  const body={text:input.text,model_id:profile.model,language_code:input.language,voice_settings:{speed:Number(settings.speed),use_speaker_boost:false},apply_text_normalization:'auto'};
  const url='https://api.elevenlabs.io/v1/text-to-speech/'+encodeURIComponent(profile.provider_voice_reference)+'?output_format=mp3_44100_128';
  this.#calls++;let response;
  try{response=await this.#fetch(url,{method:'POST',headers:{'xi-api-key':this.#key,'content-type':'application/json',accept:'audio/mpeg'},body:JSON.stringify(body),redirect:'error',signal:AbortSignal.timeout(240000)})}catch{throw Error('ELEVENLABS_NETWORK_FAILURE')}
  const header=response.headers.get('request-id')??response.headers.get('x-request-id');this.#requestId=header&&/^[A-Za-z0-9._:-]{1,128}$/.test(header)&&!header.includes(this.#key)?header:null;
  need(response.ok,'ELEVENLABS_HTTP_'+response.status);
  const chunks=[];let complete=true,total=0;
  try{for await(const chunk of response.body){total+=chunk.length;need(total<=32*1024*1024,'AUDIO_RESPONSE_TOO_LARGE');chunks.push(Buffer.from(chunk))}}catch{complete=false}
  const cost=response.headers.get('character-cost');const billed=cost&&/^\d+$/.test(cost)?Number(cost):null;
  let bytes=Buffer.concat(chunks);if(bytes.includes(Buffer.from(this.#key))){bytes=Buffer.from('REDACTED_PROVIDER_SECRET_ECHO');complete=false}
  return {format:'mp3',bytes,request_id:this.#requestId,http_status:response.status,response_complete:complete,usage:{input_characters:input.text.length,billed_characters:billed},cost:null,duration_ms:null};
 }
}
