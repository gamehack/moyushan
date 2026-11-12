import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { loadScene, parseManifest } from './manifest';
import './style.css';

const canvas = document.querySelector<HTMLCanvasElement>('#garden-canvas');
const status = document.querySelector<HTMLElement>('#scene-status');
const metrics = document.querySelector<HTMLOutputElement>('#metrics');
if (!canvas || !status || !metrics) throw new Error('Required UI nodes are missing');

const scene = new THREE.Scene();
scene.background = new THREE.Color('#e7e6df');
const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 200);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.maxPolarAngle = Math.PI * 0.49;
controls.minDistance = 1.2;
controls.maxDistance = 45;

const sun = new THREE.DirectionalLight(0xfff2da, 2.6);
sun.position.set(8, 18, 12);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -30;
sun.shadow.camera.right = 30;
sun.shadow.camera.top = 30;
sun.shadow.camera.bottom = -30;
scene.add(sun, new THREE.HemisphereLight(0xdbe6ed, 0x686555, 1.6));

function resize() {
  const width = Math.max(1, canvas!.clientWidth);
  const height = Math.max(1, canvas!.clientHeight);
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
resize();

async function init() {
  const response = await fetch('/assets/scene.json', { cache: 'no-store' });
  if (!response.ok) throw new Error('Scene manifest HTTP ' + response.status);
  const manifest = parseManifest(await response.json());
  camera.position.fromArray(manifest.camera.position);
  controls.target.fromArray(manifest.camera.target);
  controls.update();
  await loadScene(scene, manifest);
  status!.textContent = manifest.models.length
    ? '已载入 ' + manifest.models.length + ' 组经版权核验的 3D 资产。可拖动旋转、滚轮缩放。'
    : '3D 渲染器已就绪；尚未加入经美术与版权验收的园林资产。';
}
init().catch((error: unknown) => {
  status!.textContent = '资源加载失败：' + (error instanceof Error ? error.message : String(error));
});

let frame = 0;
let animationId = 0;
function animate() {
  animationId = requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
  if (++frame % 60 === 0) metrics!.textContent = renderer.info.render.calls + ' draw calls · ' + renderer.info.render.triangles + ' triangles';
}
animate();
window.addEventListener('pagehide', () => {
  cancelAnimationFrame(animationId);
  controls.dispose();
  renderer.dispose();
}, { once: true });
