import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {wavQA} from '../domain/asset-qa.js';
const need=(ok,code)=>{if(!ok)throw Error(code)};
export function checkAudioTools(){for(const name of ['FFMPEG_PATH','FFPROBE_PATH']){need(process.env[name],'AUDIO_DECODER_NOT_CONFIGURED');const r=spawnSync(process.env[name],['-version'],{windowsHide:true,timeout:10000,encoding:'utf8'});need(r.status===0,'AUDIO_DECODER_UNAVAILABLE')}}
export function mp3QA(data,expectedDuration){
 need(data.format==='mp3','AUDIO_FORMAT_UNSUPPORTED');const bytes=Buffer.from(data.bytes_base64??'','base64');need(bytes.length>0&&bytes.length<=32*1024*1024,'AUDIO_DECODE_FAILED');
 need(process.env.FFMPEG_PATH&&process.env.FFPROBE_PATH,'AUDIO_DECODER_NOT_CONFIGURED');
 const probe=spawnSync(process.env.FFPROBE_PATH,['-v','error','-f','mp3','-show_streams','-show_format','-of','json','pipe:0'],{input:bytes,windowsHide:true,timeout:30000,maxBuffer:2*1024*1024});
 need(probe.status===0,'AUDIO_DECODE_FAILED');let meta;try{meta=JSON.parse(probe.stdout.toString())}catch{throw Error('AUDIO_DECODE_FAILED')}
 const streams=meta.streams??[],audio=streams.filter(s=>s.codec_type==='audio');need(audio.length===1&&streams.length===1&&audio[0].codec_name==='mp3','AUDIO_FORMAT_UNSUPPORTED');
 const stream=audio[0],sample_rate=Number(stream.sample_rate),channels=Number(stream.channels);need(sample_rate===44100&&[1,2].includes(channels)&&Number(stream.bit_rate)===128000,'AUDIO_OUTPUT_FORMAT_MISMATCH');
 const decoded=spawnSync(process.env.FFMPEG_PATH,['-hide_banner','-loglevel','error','-xerror','-f','mp3','-i','pipe:0','-map','0:a:0','-f','wav','-acodec','pcm_s16le','pipe:1'],{input:bytes,windowsHide:true,timeout:30000,maxBuffer:128*1024*1024});
 need(decoded.status===0&&!decoded.error&&decoded.stdout?.length,'AUDIO_DECODE_FAILED');
 const decodedWav=decoded.stdout;let pcm;
 need(decodedWav.toString('ascii',0,4)==='RIFF'&&decodedWav.toString('ascii',8,12)==='WAVE','AUDIO_DECODE_FAILED');
 for(let n=12;n+8<=decodedWav.length;){const type=decodedWav.toString('ascii',n,n+4),size=decodedWav.readUInt32LE(n+4);if(type==='data'){pcm=decodedWav.subarray(n+8,size===0xffffffff?decodedWav.length:n+8+size);break}need(n+8+size<=decodedWav.length,'AUDIO_DECODE_FAILED');n+=8+size+(size%2)}
 need(pcm?.length&&pcm.length%(2*channels)===0,'AUDIO_DECODE_FAILED');const wav=Buffer.alloc(44+pcm.length);wav.write('RIFF');wav.writeUInt32LE(wav.length-8,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(channels,22);wav.writeUInt32LE(sample_rate,24);wav.writeUInt32LE(sample_rate*channels*2,28);wav.writeUInt16LE(channels*2,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(pcm.length,40);pcm.copy(wav,44);
 const qa=wavQA(wav,expectedDuration),frames=pcm.length/(2*channels);let leading=0,trailing=0,clipped=0;
 const silent=frame=>{for(let c=0;c<channels;c++)if(Math.abs(pcm.readInt16LE((frame*channels+c)*2))>=100)return false;return true};
 while(leading<frames&&silent(leading))leading++;while(trailing<frames&&silent(frames-1-trailing))trailing++;for(let n=0;n<pcm.length;n+=2)if(Math.abs(pcm.readInt16LE(n))>=32760)clipped++;
 need(leading/sample_rate<2&&trailing/sample_rate<2,'AUDIO_EDGE_SILENCE');
 return {...qa,format:'mp3',codec:'mp3',bit_rate:128000,leading_silence_seconds:leading/sample_rate,trailing_silence_seconds:trailing/sample_rate,clipped_sample_fraction:clipped/(pcm.length/2),file_sha256:createHash('sha256').update(bytes).digest('hex'),decoder:'ffmpeg-pcm16/1',perceptual_review_required:true};
}
