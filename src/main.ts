import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { loadScene, parseManifest } from './manifest';
import { createTeaGarden } from './world/tea-garden';
import './style.css';

const canvas=document.querySelector<HTMLCanvasElement>('#garden-canvas');
const status=document.querySelector<HTMLElement>('#scene-status');
const metrics=document.querySelector<HTMLOutputElement>('#metrics');
const morning=document.querySelector<HTMLButtonElement>('#light-morning');
const evening=document.querySelector<HTMLButtonElement>('#light-evening');
if(!canvas||!status||!metrics||!morning||!evening)throw Error('Missing scene UI nodes');
const ciSoftwareRender = new URLSearchParams(window.location.search).has('ci');
const scene=new THREE.Scene();
scene.background=new THREE.Color('#c9d5d0');
scene.fog=new THREE.FogExp2('#c9d5d0',.012);
const camera=new THREE.PerspectiveCamera(44,1,.1,200);
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.18;
renderer.shadowMap.enabled=!ciSoftwareRender;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.setPixelRatio(ciSoftwareRender ? 0.55 : Math.min(window.devicePixelRatio||1,1.8));
const controls=new OrbitControls(camera,canvas);
controls.enableDamping=true;
controls.dampingFactor=.06;
controls.maxPolarAngle=Math.PI*.46;
controls.minPolarAngle=.2;
controls.minDistance=3;
controls.maxDistance=28;
controls.screenSpacePanning=false;
const sun=new THREE.DirectionalLight(0xfff2d5,3.2);
sun.position.set(-6,13,7);sun.castShadow=!ciSoftwareRender;
sun.shadow.mapSize.set(2048,2048);
sun.shadow.camera.left=-22;sun.shadow.camera.right=22;
sun.shadow.camera.top=22;sun.shadow.camera.bottom=-22;
sun.shadow.camera.near=.5;sun.shadow.camera.far=70;
sun.shadow.bias=-.0001;sun.shadow.normalBias=.023;
const hemi=new THREE.HemisphereLight('#cce3e7','#666456',1.9);
scene.add(sun,hemi);
const garden=createTeaGarden();scene.add(garden.root);
function light(mode:'morning'|'evening'){
 const dusk=mode==='evening';
 sun.position.set(dusk?8:-6,dusk?7:13,dusk?10:7);
 sun.intensity=dusk?2.35:3.2;
 sun.color.set(dusk?'#ffbc8b':'#fff2d5');
 hemi.intensity=dusk?1.25:1.9;
 renderer.toneMappingExposure=dusk?1.03:1.18;
 const bg=dusk?'#b9bcb9':'#c9d5d0';
 scene.background=new THREE.Color(bg);
 scene.fog=new THREE.FogExp2(bg,.012);
 garden.water.uniforms.uWarm.value=dusk?1:0;
 morning!.setAttribute('aria-pressed',String(!dusk));
 evening!.setAttribute('aria-pressed',String(dusk));
}
morning.addEventListener('click',()=>light('morning'));
evening.addEventListener('click',()=>light('evening'));
function resize(){
 const w=Math.max(1,canvas!.clientWidth),h=Math.max(1,canvas!.clientHeight);
 renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
}
window.addEventListener('resize',resize);resize();
function dressShoreWithScannedAssets():void {
  const rock=scene.getObjectByName('rock_moss_set_01');
  const shrub=scene.getObjectByName('shrub_03');
  if(!rock||!shrub)return;
  const oldPebbles=scene.getObjectByName('池岸自然石占位');
  if(oldPebbles)oldPebbles.visible=false;
  // Keep scanned rock groups sparse until real-device performance is measured.
  const rocks:Array<[number,number,number]>=[
    [-5.2,2.2,.7],[-.8,1,.55],[4.3,1.1,.8],
    [9.2,3,.7],[7.8,9.3,.8],[-2.8,8.8,.7]
  ];
  const shrubs:Array<[number,number,number]>=[
    [-8.8,-5.1,.8],[10.8,-5.7,.9],[5.7,-8.4,.73]
  ];
  function placeCopies(base:THREE.Object3D,locations:Array<[number,number,number]>,prefix:string){
    locations.forEach(([x,z,scale],i)=>{
      const copy=base.clone(true);
      copy.name=prefix+'-'+i;
      copy.position.set(x,0,z);
      copy.rotation.y=(i*2.399963229728653)%(2*Math.PI);
      copy.scale.multiplyScalar(scale);
      copy.updateMatrixWorld(true);
      const box=new THREE.Box3().setFromObject(copy);
      copy.position.y+=.055-box.min.y;
      scene.add(copy);
    });
  }
  placeCopies(rock,rocks,'cc0-rock');
  placeCopies(shrub,shrubs,'cc0-shrub');
}

async function init(){
  if(ciSoftwareRender)document.body.dataset.visualFidelity='ci-software-reduced';
 const response=await fetch('/assets/scene.json',{cache:'no-store'});
 if(!response.ok)throw Error('Scene manifest HTTP '+response.status);
 const manifest=parseManifest(await response.json());
 camera.position.fromArray(manifest.camera.position);
 controls.target.fromArray(manifest.camera.target);
 controls.update();
 await loadScene(scene,manifest);
  dressShoreWithScannedAssets();
 status!.textContent=manifest.models.length
  ?'R1 场景研究版 · 已载入 '+manifest.models.length+' 项版权核验 3D 资源。'
  :'R1 建筑构图样板 · 尚未完成写实模型及材质替换。';
 document.body.dataset.sceneReady='true';
}
init().catch((e:unknown)=>{
 document.body.dataset.sceneReady='error';
 status!.textContent='资源加载失败：'+(e instanceof Error?e.message:String(e));
});
const clock=new THREE.Clock();let raf=0,frames=0,last=performance.now();
function draw(){
 raf=requestAnimationFrame(draw);
 garden.water.uniforms.uTime.value=clock.elapsedTime;
 controls.update();renderer.render(scene,camera);
 frames++;const now=performance.now();
 if(now-last>=1000){
  const fps=Math.round(frames*1000/(now-last));
  metrics!.textContent=fps+' fps · '+renderer.info.render.calls+' draw calls · '+(renderer.info.render.triangles/1000).toFixed(0)+'k tris';
  frames=0;last=now;
 }
}
draw();
window.addEventListener('pagehide',()=>{
 cancelAnimationFrame(raf);controls.dispose();garden.dispose();renderer.dispose();
},{once:true});
