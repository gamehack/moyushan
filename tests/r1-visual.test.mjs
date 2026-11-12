import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
const file=(path)=>readFileSync(new URL(path,import.meta.url),'utf8');
test('R1 prototype includes roof tiles and a moon gate',()=>{
 const code=file('../src/world/tea-garden.ts');
 assert.match(code,/function roofY/);
 assert.match(code,/new THREE.InstancedMesh/);
 assert.match(code,/hole.absarc/);
});
test('preview declares that it is not final realistic art',()=>{
 assert.match(file('../index.html'),/非最终写实成品/);
});
test('shipped downloaded models have only verified CC0 licenses',()=>{
 const models=JSON.parse(file('../public/assets/scene.json')).models;
 const ledger=JSON.parse(file('../docs/CC0-IMPORTS.json'));
 assert.equal(models.length,ledger.assets.length);
 assert.ok(ledger.assets.every(x=>x.license==='CC0-1.0'));
});
