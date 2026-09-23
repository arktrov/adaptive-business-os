import {readdir,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const root=new URL('../',import.meta.url);
export async function scriptCodeHash(){
 const walk=async dir=>{const rows=[];for(const e of await readdir(new URL(dir,root),{withFileTypes:true})){const path=dir+'/'+e.name;if(e.isDirectory())rows.push(...await walk(path));else if(/\.(js|mjs|sql)$/.test(path))rows.push(path)}return rows};
 const files=(await Promise.all(['src','db/migrations','scripts'].map(walk))).flat().sort(),h=createHash('sha256');for(const path of files){h.update(path+'\0');h.update(await readFile(new URL(path,root)));h.update('\0')}return h.digest('hex');
}
