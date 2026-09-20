import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {hash,assertSafe} from '../domain/research.js';
import {arktrovPolicy} from './research.js';
const root=new URL('../../',import.meta.url);
export async function loadContentPolicies(business,read=path=>readFile(new URL(path,root),'utf8')){
 if(business!=='arktrov')throw Error('POLICY_SOURCE_MISSING');
 const paths=['docs/QUALITY_GATES.md','docs/sources/ARKTROV_APP_QUALITY_GATES.md','docs/adr/0002-artifact-release.md','src/config/research.js'];
 const docs=[];
 for(const path of paths){let content;try{content=await read(path)}catch{throw Error('POLICY_SOURCE_MISSING')}if(!content?.trim())throw Error('POLICY_SOURCE_MISSING');docs.push({path,sha256:createHash('sha256').update(content).digest('hex'),content})}
 const section=(doc,title)=>{const start=doc.content.indexOf(title);if(start<0)throw Error('POLICY_SOURCE_MISSING');const end=doc.content.indexOf('\n## ',start+title.length);return {...doc,section:title,content:doc.content.slice(start,end<0?undefined:end).trim()}};
 const brandSources=[section(docs[1],'## 9. ARKTROV-specific visual requirements'),section(docs[0],'## ARKTROV policy overlay')];
 const build=(kind,sources)=>{const content={business_id:business,kind,sources};const content_hash=hash(content);return {...content,version:'source-sha256:'+content_hash,content_hash}};
 const result={brand:build('brand',brandSources),quality:build('quality',[docs[0],docs[2]]),research:{policy:arktrovPolicy,source:docs[3]}};assertSafe(result);return result;
}
export function verifyPolicySnapshot(p,business,kind){
 if(!p||p.business_id!==business||p.kind!==kind||!p.sources?.length||p.sources.some(s=>!s.path||!s.sha256||!s.content?.trim()))throw Error('POLICY_SOURCE_MISSING');
 const h=hash({business_id:p.business_id,kind:p.kind,sources:p.sources});
 if(p.content_hash!==h||p.version!=='source-sha256:'+h)throw Error('POLICY_HASH_MISMATCH');assertSafe(p);return p;
}
