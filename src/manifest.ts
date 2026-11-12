import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export type Vec3 = [number, number, number];
export interface SceneAsset {
  id: string;
  url: string;
  position: Vec3;
  rotationY?: number;
  scale?: number;
  castShadow?: boolean;
  receiveShadow?: boolean;
}
export interface SceneManifest {
  version: 1;
  camera: { position: Vec3; target: Vec3 };
  models: SceneAsset[];
}

const isVec3 = (value: unknown): value is Vec3 =>
  Array.isArray(value) && value.length === 3 && value.every((x) => typeof x === 'number' && Number.isFinite(x));

export function parseManifest(value: unknown): SceneManifest {
  if (!value || typeof value !== 'object') throw new Error('Scene manifest must be an object');
  const obj = value as Record<string, unknown>;
  const camera = obj.camera as Record<string, unknown> | undefined;
  if (obj.version !== 1 || !camera || !isVec3(camera.position) || !isVec3(camera.target) || !Array.isArray(obj.models)) {
    throw new Error('Unsupported scene manifest structure');
  }
  const ids = new Set<string>();
  const models = obj.models.map((item): SceneAsset => {
    if (!item || typeof item !== 'object') throw new Error('Invalid scene asset');
    const asset = item as Record<string, unknown>;
    if (typeof asset.id !== 'string' || !asset.id.trim() || ids.has(asset.id)) throw new Error('Missing or duplicate asset id');
    if (typeof asset.url !== 'string' || !/^\/assets\/[a-zA-Z0-9_./-]+\.glb$/.test(asset.url) || asset.url.includes('..')) {
      throw new Error('Invalid local GLB path for asset ' + String(asset.id));
    }
    if (!isVec3(asset.position)) throw new Error('Invalid position for ' + asset.id);
    if (asset.scale !== undefined && (typeof asset.scale !== 'number' || !Number.isFinite(asset.scale) || asset.scale <= 0)) throw new Error('Invalid scale for ' + asset.id);
    if (asset.rotationY !== undefined && (typeof asset.rotationY !== 'number' || !Number.isFinite(asset.rotationY))) throw new Error('Invalid rotation for ' + asset.id);
    for (const key of ['castShadow', 'receiveShadow']) {
      if (asset[key] !== undefined && typeof asset[key] !== 'boolean') throw new Error('Invalid ' + key + ' for ' + asset.id);
    }
    ids.add(asset.id);
    return asset as unknown as SceneAsset;
  });
  return { version: 1, camera: { position: camera.position, target: camera.target }, models };
}

export async function loadScene(scene: THREE.Scene, manifest: SceneManifest): Promise<void> {
  const loader = new GLTFLoader();
  for (const asset of manifest.models) {
    const gltf = await loader.loadAsync(asset.url);
    gltf.scene.name = asset.id;
    gltf.scene.position.fromArray(asset.position);
    gltf.scene.rotation.y = asset.rotationY ?? 0;
    gltf.scene.scale.setScalar(asset.scale ?? 1);
    gltf.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.castShadow = asset.castShadow ?? true;
        object.receiveShadow = asset.receiveShadow ?? true;
      }
    });
    scene.add(gltf.scene);
  }
}
