#!/usr/bin/env node
/**
 * Download Poly Haven CC0 preview assets with verifiable provenance.
 * This script runs only in the isolated R1 asset-import workflow.
 * It never depends on paid services, scraped images, or secret credentials.
 */
import {createHash} from 'node:crypto';
import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';

const UA='Moyushan-AssetImporter/0.1 (+https://github.com/gamehack/moyushan)';
const API='https://api.polyhaven.com';
const TARGETS=[
 {id:'rock_moss_set_01',position:[-3.8,.08,3.8],scale:.52},
 {id:'shrub_03',position:[7.1,.05,-3.2],scale:8}
];
const MAX_PER_FILE=18*1024*1024,MAX_TOTAL=48*1024*1024;
let downloadedBytes=0;
const ledger=[];

function safeLocal(relative){
 if(typeof relative!=='string'||relative.startsWith('/')||relative.includes('\\')||
    relative.split('/').some(x=>x==='..'||x===''||x==='.')||relative.includes('?')){
   throw Error('Unsafe model dependency path: '+relative);
 }
 return relative;
}
async function getJson(url){
 const r=await fetch(url,{headers:{'User-Agent':UA,'Accept':'application/json'}});
 if(!r.ok)throw Error('API HTTP '+r.status+': '+url);
 return r.json();
}
function chooseGltf(files){
 const entries=Object.entries(files.gltf??{});
 for(const res of ['1k','2k']){
  const matching=entries.find(([key])=>key.toLowerCase()===res);
  if(matching&&matching[1]&&matching[1].gltf?.url) return {res,file:matching[1].gltf};
 }
 throw Error('No glTF 1k/2k available from Poly Haven');
}
function includeCandidates(node,out=[],hint=''){
 if(!node||typeof node!=='object')return out;
 if(typeof node.url==='string'){out.push({hint,file:node});return out;}
 for(const [k,v] of Object.entries(node))includeCandidates(v,out,hint?hint+'/'+k:k);
 return out;
}
function checkUrl(value){
 const u=new URL(value);
 if(u.protocol!=='https:'||!['dl.polyhaven.org','cdn.polyhaven.com'].includes(u.hostname))throw Error('External download host is not allowlisted: '+u.hostname);
 return u;
}
async function download(file,dest){
 const url=checkUrl(file.url);
 const r=await fetch(url,{headers:{'User-Agent':UA}});
 if(!r.ok)throw Error('Asset HTTP '+r.status+': '+url);
 const size=Number(r.headers.get('content-length')||0);
 if(size>MAX_PER_FILE)throw Error('File too large: '+size+' '+url);
 const buffer=Buffer.from(await r.arrayBuffer());
 if(buffer.byteLength>MAX_PER_FILE||downloadedBytes+buffer.byteLength>MAX_TOTAL)throw Error('Asset size budget exceeded: '+url);
 downloadedBytes+=buffer.byteLength;
 if(file.md5&&createHash('md5').update(buffer).digest('hex')!==file.md5)throw Error('Poly Haven checksum mismatch: '+url);
 await mkdir(path.dirname(dest),{recursive:true});
 await writeFile(dest,buffer);
 return {url:file.url,bytes:buffer.length,sha256:createHash('sha256').update(buffer).digest('hex')};
}
async function importModel(target){
 const meta=await getJson(API+'/info/'+target.id);
 if(meta.type!==2)throw Error('Expected model type 2: '+target.id);
 const files=await getJson(API+'/files/'+target.id);
 const selected=chooseGltf(files);
 const source=selected.file.url;
 const name=path.posix.basename(new URL(source).pathname);
 const dir='public/assets/polyhaven/'+target.id;
 const manifestPath='/assets/polyhaven/'+target.id+'/'+name;
 const primary=await download(selected.file,path.join(dir,name));
 const gltf=JSON.parse(await (await import('node:fs/promises')).readFile(path.join(dir,name),'utf8'));
 const refs=[...(gltf.buffers??[]),...(gltf.images??[])].map(x=>x.uri).filter(Boolean);
 const includes=includeCandidates(selected.file.include);
 const dependencies=[];
 for(const uriValue of [...new Set(refs)]){
  if(uriValue.startsWith('data:'))continue;
  const uri=safeLocal(uriValue);
  const item=includes.find(x=>x.hint===uri||x.hint.endsWith('/'+uri)||
    path.posix.basename(new URL(x.file.url).pathname)===path.posix.basename(uri));
  const desc=item?.file??{url:new URL(uri,source).href};
  const hash=await download(desc,path.join(dir,uri));
  dependencies.push({path:uri,...hash});
 }
 const authors=meta.authors??{};
 ledger.push({id:target.id,title:meta.name,authors,license:'CC0-1.0',sourcePage:'https://polyhaven.com/a/'+target.id,
  model:{path:manifestPath,format:'gltf',resolution:selected.res,...primary},dependencies});
 return {id:target.id,url:manifestPath,position:target.position,scale:target.scale,castShadow:true,receiveShadow:true};
}
const models=[];
for(const target of TARGETS)models.push(await importModel(target));
await writeFile('public/assets/scene.json',JSON.stringify({version:1,camera:{position:[11,6.1,14],target:[-1.3,2.15,-2.5]},models},null,2)+'\n');
await mkdir('docs',{recursive:true});
await writeFile('docs/CC0-IMPORTS.json',JSON.stringify({source:'Poly Haven',license:'CC0',api:'https://api.polyhaven.com',apiAttribution:'Assets from Poly Haven',importedAt:new Date().toISOString(),totalBytes:downloadedBytes,assets:ledger},null,2)+'\n');
console.log(JSON.stringify({modelCount:models.length,totalBytes:downloadedBytes,models:models.map(x=>({id:x.id,url:x.url}))},null,2));
