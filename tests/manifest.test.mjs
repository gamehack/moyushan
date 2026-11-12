import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
const json=(path)=>JSON.parse(readFileSync(new URL(path,import.meta.url),'utf8'));
const manifest=json('../public/assets/scene.json');
const ledger=json('../docs/CC0-IMPORTS.json');
test('manifest is versioned and camera coordinates are finite',()=>{
 assert.equal(manifest.version,1);
 for(const vec of [manifest.camera.position,manifest.camera.target]){
  assert.equal(vec.length,3);
  assert.ok(vec.every(Number.isFinite));
 }
});
test('all imported models are explicitly tracked as CC0',()=>{
 assert.ok(manifest.models.length>0);
 assert.equal(manifest.models.length,ledger.assets.length);
 for(const model of manifest.models){
  assert.match(model.url,/^\/assets\/polyhaven\/[a-z0-9_/.]+\.gltf$/);
  const asset=ledger.assets.find(x=>x.id===model.id);
  assert.ok(asset,'Missing asset ledger entry: '+model.id);
  assert.equal(asset.license,'CC0-1.0');
  assert.equal(asset.model.path,model.url);
  assert.ok(existsSync(new URL('../public'+model.url,import.meta.url)));
 }
});
test('all source and dependency files match SHA256 audit ledger',()=>{
 for(const asset of ledger.assets){
  for(const file of [asset.model,...asset.dependencies]){
   const rel=file.path.startsWith('/assets/')
    ? '../public'+file.path
    : '../public/assets/polyhaven/'+asset.id+'/'+file.path;
   const bytes=readFileSync(new URL(rel,import.meta.url));
   assert.equal(bytes.byteLength,file.bytes);
   assert.equal(createHash('sha256').update(bytes).digest('hex'),file.sha256);
  }
 }
});
