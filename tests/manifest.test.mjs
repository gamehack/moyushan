import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';

const manifest = JSON.parse(readFileSync(new URL('../public/assets/scene.json', import.meta.url)));
test('manifest explicitly declares schema version', () => assert.equal(manifest.version, 1));
test('initial scene never presents unreviewed models as final art', () => assert.deepEqual(manifest.models, []));
test('camera position and target are finite vectors', () => {
  for (const vector of [manifest.camera.position, manifest.camera.target]) {
    assert.equal(vector.length, 3);
    assert.ok(vector.every(Number.isFinite));
  }
});
