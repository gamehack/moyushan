import * as THREE from 'three';

export interface GardenSlice { root: THREE.Group; water: THREE.ShaderMaterial; dispose(): void; }
const roofMat=new THREE.MeshStandardMaterial({color:0x303734,roughness:0.89,side:THREE.DoubleSide});
const ridgeMat=new THREE.MeshStandardMaterial({color:0x414943,roughness:0.86});
const wood=new THREE.MeshStandardMaterial({color:0x523e30,roughness:0.81});
const woodLight=new THREE.MeshStandardMaterial({color:0x806047,roughness:0.82});
const white=new THREE.MeshStandardMaterial({color:0xebe7da,roughness:0.99});
const stone=new THREE.MeshStandardMaterial({color:0xa19e91,roughness:0.95});
const paleStone=new THREE.MeshStandardMaterial({color:0xc5bbac,roughness:1});
const leafMaterial=new THREE.MeshStandardMaterial({color:0xffffff,roughness:1,side:THREE.DoubleSide});
const bambooMat=new THREE.MeshStandardMaterial({color:0x576c4a,roughness:0.91});
function randomSource(seed:number):()=>number {let x=seed>>>0;return ()=>((x=(Math.imul(x,1664525)+1013904223)>>>0)/4294967296);}
function add(parent:THREE.Object3D,g:THREE.BufferGeometry,m:THREE.Material,name:string) {
 const o=new THREE.Mesh(g,m);o.name=name;o.castShadow=o.receiveShadow=true;parent.add(o);return o;
}
function block(parent:THREE.Object3D,name:string,m:THREE.Material,w:number,h:number,d:number,x:number,y:number,z:number) {
 const o=add(parent,new THREE.BoxGeometry(w,h,d),m,name);o.position.set(x,y,z);return o;
}
function beam(parent:THREE.Object3D,a:THREE.Vector3,b:THREE.Vector3,r:number,m:THREE.Material,name:string) {
 const direction=new THREE.Vector3().subVectors(b,a);
 const obj=add(parent,new THREE.CylinderGeometry(r*.82,r,direction.length(),9),m,name);
 obj.position.copy(a).add(b).multiplyScalar(.5);
 obj.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),direction.normalize());
 return obj;
}
function roofY(x:number,z:number) {
 const pitch=Math.max(Math.abs(z)/3.1,Math.max(0,(Math.abs(x)-1.5)/2.7));
 const corner=Math.pow(Math.max(0,(Math.abs(x)-2.6)/1.6),2)*Math.pow(Math.max(0,(Math.abs(z)-1.7)/1.4),2);
 return 5.45-1.43*Math.min(1,pitch)+corner*.36;
}
function roof(p:THREE.Group) {
 const vs:number[]=[],index:number[]=[],nu=52,nv=40;
 for(let j=0;j<=nv;j++)for(let i=0;i<=nu;i++) {
  const x=-4.2+8.4*i/nu,z=-3.1+6.2*j/nv;vs.push(x,roofY(x,z),z);
 }
 for(let j=0;j<nv;j++)for(let i=0;i<nu;i++){const a=j*(nu+1)+i,b=a+1,c=a+nu+1;index.push(a,c,b,b,c,c+1);}
 const geom=new THREE.BufferGeometry();geom.setAttribute('position',new THREE.Float32BufferAttribute(vs,3));geom.setIndex(index);geom.computeVertexNormals();
 add(p,geom,roofMat,'小青瓦四坡曲檐');
 const tile=new THREE.InstancedMesh(new THREE.CylinderGeometry(.054,.06,.35,8,1,false,0,Math.PI),ridgeMat,46*18*2);
 tile.name='叠排筒瓦';const o=new THREE.Object3D(),up=new THREE.Vector3(0,1,0);
 let n=0;
 for(let i=0;i<46;i++){
  const x=-4.05+8.10*i/45;
  for(const s of [-1,1])for(let j=0;j<18;j++){
   const z1=s*(.11+j*.16),z2=s*(.11+(j+1)*.16);
   const a=new THREE.Vector3(x,roofY(x,z1)+.048,z1),b=new THREE.Vector3(x,roofY(x,z2)+.048,z2);
   o.position.copy(a).add(b).multiplyScalar(.5);
   o.quaternion.setFromUnitVectors(up,b.clone().sub(a).normalize());
   o.scale.set(1,a.distanceTo(b)/.35,1);o.updateMatrix();tile.setMatrixAt(n++,o.matrix);
  }
 }
 tile.count=n;tile.castShadow=tile.receiveShadow=true;p.add(tile);
 beam(p,new THREE.Vector3(-1.7,5.49,0),new THREE.Vector3(1.7,5.49,0),.15,ridgeMat,'正脊');
 for(const s of [-1,1])for(let x=-4.05;x<4.05;x+=.27){
  beam(p,new THREE.Vector3(x,roofY(x,s*3.1)-.04,s*3.1),new THREE.Vector3(x+.27,roofY(x+.27,s*3.1)-.04,s*3.1),.088,wood,'飞檐');
 }
}
function pavilion(root:THREE.Group) {
 const p=new THREE.Group();p.name='临水茶亭·建筑比例验证';p.position.set(-2.8,0,-3.5);root.add(p);
 block(p,'青石台基',paleStone,7.65,.4,5.1,0,.22,0);
 block(p,'木槛',woodLight,7.34,.16,4.52,0,.52,0);
 for(const x of [-3.4,-1.1,1.1,3.4])for(const z of [-2,2]) {
  const foot=add(p,new THREE.CylinderGeometry(.29,.34,.17,14),stone,'石柱础');foot.position.set(x,.68,z);
  const post=add(p,new THREE.CylinderGeometry(.155,.178,3.05,14),wood,'木柱');post.position.set(x,2.24,z);
  block(p,'雀替',woodLight,.48,.23,.48,x,3.8,z);
 }
 for(const z of [-2,2])block(p,'正向枋梁',wood,7.5,.28,.22,0,3.8,z);
 for(const x of [-3.4,3.4])block(p,'侧向枋梁',wood,.22,.28,4.4,x,3.8,0);
 for(let z=-1.6;z<1.7;z+=.32)for(const x of [-3.4,3.4])block(p,'竖向窗棂',woodLight,.035,2.05,.036,x,2.32,z);
 for(let y=1.4;y<3.4;y+=.33)for(const x of [-3.4,3.4])block(p,'横向窗棂',woodLight,.04,.035,3.5,x,y,0);
 block(p,'茶案台面',woodLight,1.6,.09,.85,0,1.25,-.8);
 for(const x of [-.65,.65])for(const z of [-1.09,-.5])block(p,'茶案腿',wood,.08,1,.08,x,.75,z);
 for(const x of [-1.45,1.45]) {
  block(p,'木凳坐面',woodLight,.64,.09,.62,x,.79,-.74);
  for(const dz of [-.19,.19])block(p,'木凳腿',wood,.1,.4,.1,x,.57,-.74+dz);
 }
 for(const z of [2.76,3.08,3.4])block(p,'临水台阶',stone,2.35,.12,.34,0,.06+(3.4-z)*.16,z);
 roof(p);
}
function screen(root:THREE.Group) {
 const shape=new THREE.Shape();shape.moveTo(-14,0);shape.lineTo(14,0);shape.lineTo(14,3.35);shape.lineTo(-14,3.35);shape.closePath();
 const hole=new THREE.Path();hole.absarc(7.3,1.57,1.16,0,Math.PI*2,true);shape.holes.push(hole);
 const wall=add(root,new THREE.ExtrudeGeometry(shape,{depth:.25,bevelEnabled:false,curveSegments:48}),white,'白墙与月洞门');wall.position.z=-9.8;
 const frame=add(root,new THREE.TorusGeometry(1.18,.12,8,48),stone,'圆门灰石边框');frame.position.set(7.3,1.57,-9.51);
 block(root,'墙顶黑瓦',roofMat,28.4,.22,.5,0,3.47,-9.67);
 const s=new THREE.Group();s.position.set(4.5,0,-4.3);root.add(s);
 for(const x of [-1.28,1.28])block(s,'隔扇立柱',wood,.13,2.8,.13,x,1.45,0);
 for(const y of [.9,3.0])block(s,'隔扇横枋',wood,2.7,.12,.13,0,y,0);
 for(let x=-1.06;x<=1.06;x+=.26)block(s,'木格棂条',woodLight,.034,2.06,.034,x,1.96,0);
 for(let y=1.05;y<2.9;y+=.3)block(s,'木格棂条',woodLight,2.34,.034,.034,0,y,0);
}
function water(root:THREE.Group):THREE.ShaderMaterial {
 const shape=new THREE.Shape();shape.moveTo(-5.5,-2);
 const points=[[-3,-1],[1,-.8],[5,-1.1],[9,-2.6],[10.7,-5.1],[9.8,-8.4],[6.8,-10.1],[2,-10],[-2.9,-8.9],[-5.2,-6.1],[-5.5,-2]].map(([x,y])=>new THREE.Vector2(x,y));
 shape.splineThru(points);
 const geom=new THREE.ShapeGeometry(shape,70);geom.rotateX(-Math.PI/2);
 const mat=new THREE.ShaderMaterial({
  uniforms:{uTime:{value:0},uWarm:{value:0}},
  side:THREE.DoubleSide,
  vertexShader:'varying vec3 vWorld;void main(){vec4 w=modelMatrix*vec4(position,1.);vWorld=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}',
  fragmentShader:'precision highp float;uniform float uTime;uniform float uWarm;varying vec3 vWorld;float h(vec2 p){return sin(p.x*2.1+uTime*.42)*sin(p.y*2.6-uTime*.31)*.5+sin(p.x*4.5+p.y*1.3+uTime*.23)*.25;}void main(){vec2 p=vWorld.xz;float w=h(p);float d=.02;vec3 n=normalize(vec3(h(p+vec2(d,0.))-w,.22,h(p+vec2(0.,d))-w));vec3 v=normalize(cameraPosition-vWorld);float f=pow(1.-max(0.,dot(v,n)),2.3);vec3 c=mix(vec3(.105,.19,.17),vec3(.34,.47,.41),.24+f*.52);c+=vec3(.07,.10,.06)*max(w,0.);c+=uWarm*vec3(.095,.038,.005);gl_FragColor=vec4(c,1.);}'
 });
 const surface=add(root,geom,mat,'动态池水');surface.position.y=.055;surface.castShadow=false;
 const banks=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,2),stone,145);
 const sample=randomSource(188),o=new THREE.Object3D();let n=0;
 const edge=[[-5.5,2],[-3,1],[1,.8],[5,1.1],[9,2.6],[10.7,5.1],[9.8,8.4],[6.8,10.1],[2,10],[-2.9,8.9],[-5.2,6.1]];
 for(let i=0;i<145;i++){
  const t=i/145*edge.length,idx=Math.floor(t)%edge.length,a=edge[idx],b=edge[(idx+1)%edge.length],f=t-Math.floor(t);
  o.position.set(THREE.MathUtils.lerp(a[0],b[0],f)+(sample()-.5)*.3,.08,THREE.MathUtils.lerp(a[1],b[1],f)+(sample()-.5)*.3);
  o.rotation.set(sample()*4,sample()*6,sample()*3);o.scale.set(.18+sample()*.19,.08+sample()*.1,.16+sample()*.2);
  o.updateMatrix();banks.setMatrixAt(n++,o.matrix);
 }
 banks.castShadow=banks.receiveShadow=true;banks.name='池岸自然石占位';root.add(banks);
 return mat;
}
function trees(root:THREE.Group,seed:number,x:number,z:number,h:number){
 const r=randomSource(seed),tree=new THREE.Group();tree.position.set(x,0,z);root.add(tree);
 const trunk=new THREE.MeshStandardMaterial({color:0x514839,roughness:1});
 const top=new THREE.Vector3((r()-.5),h*.68,(r()-.5));
 beam(tree,new THREE.Vector3(0,0,0),top,.2,trunk,'树干');
 const tips:THREE.Vector3[]=[];
 for(let i=0;i<15;i++){
  const angle=i/15*Math.PI*2;
  const a=top.clone().multiplyScalar(.48+r()*.18);
  const b=new THREE.Vector3(top.x+Math.cos(angle)*(1.3+r()*1.3),h*(.65+r()*.28),top.z+Math.sin(angle)*(1.3+r()*1.2));
  beam(tree,a,b,.05+r()*.03,trunk,'枝条');tips.push(b);
 }
 const leaves=new THREE.InstancedMesh(new THREE.PlaneGeometry(.18,.39),leafMaterial,2800);
 const colors=['#354c39','#486047','#526a4a','#647a51','#718258'].map(v=>new THREE.Color(v));
 const o=new THREE.Object3D();
 for(let i=0;i<2800;i++){
  const tip=tips[Math.floor(r()*tips.length)],angle=r()*6.28,rad=Math.cbrt(r());
  o.position.set(tip.x+Math.cos(angle)*rad*.8,tip.y+(r()-.5)*1.25,tip.z+Math.sin(angle)*rad*.8);
  o.rotation.set(r()*6,r()*6,r()*6);o.scale.setScalar(.5+r()*.6);o.updateMatrix();leaves.setMatrixAt(i,o.matrix);leaves.setColorAt(i,colors[Math.floor(r()*colors.length)]);
 }
 leaves.castShadow=true;leaves.name='自然树冠实例·待资产替换';tree.add(leaves);
}
function bamboo(root:THREE.Group,seed:number,x:number,z:number,count:number){
 const r=randomSource(seed),stem=new THREE.InstancedMesh(new THREE.CylinderGeometry(.03,.044,1,7),bambooMat,count*5);
 const leaves=new THREE.InstancedMesh(new THREE.PlaneGeometry(.085,.51),leafMaterial,count*120);
 const o=new THREE.Object3D();let i=0,j=0;
 for(let n=0;n<count;n++){
  const px=x+(r()-.5)*2.3,pz=z+(r()-.5)*2.3,h=3.3+r()*2;
  for(let k=0;k<5;k++){o.position.set(px,(k+.5)*h/5,pz);o.rotation.set(0,0,(r()-.5)*.035);o.scale.set(1,h/5,1);o.updateMatrix();stem.setMatrixAt(i++,o.matrix);}
  for(let k=0;k<120;k++){const a=r()*6.28,rr=r()*.8;o.position.set(px+Math.cos(a)*rr,1.6+r()*(h-1.7),pz+Math.sin(a)*rr);o.rotation.set(r()*6,r()*6,r()*6);o.scale.setScalar(.55+r()*.55);o.updateMatrix();leaves.setMatrixAt(j++,o.matrix);leaves.setColorAt(j,new THREE.Color(k%3===0?'#536a44':'#71835a'));}
 }
 stem.castShadow=leaves.castShadow=true;root.add(stem,leaves);
}
export function createTeaGarden():GardenSlice {
 const root=new THREE.Group();root.name='临水茶亭 R1 建筑场景样板';
 block(root,'园林地面',new THREE.MeshStandardMaterial({color:0x888e7d,roughness:1}),50,.25,35,0,-.2,-1);
 const pond=water(root);screen(root);pavilion(root);
 trees(root,41,-11,-4.1,7.3);trees(root,206,11,-4.7,8.1);trees(root,911,14.6,-4.8,7.5);
 bamboo(root,71,-11,-8,12);bamboo(root,72,11.9,-8,10);
 const path=new THREE.InstancedMesh(new THREE.BoxGeometry(1,.07,1),paleStone,120);
 const r=randomSource(981),o=new THREE.Object3D();let count=0;
 for(let n=0;n<120;n++){const row=Math.floor(n/8),col=n%8,x=-11.7+col*.82,z=-5+row*.78;if(x>-6&&z>1.5)continue;o.position.set(x+(r()-.5)*.15,.038,z+(r()-.5)*.1);o.rotation.set(0,(r()-.5)*.13,0);o.scale.set(.65,1,.69);o.updateMatrix();path.setMatrixAt(count++,o.matrix);}
 path.count=count;path.receiveShadow=true;path.name='石板园路·材质候选';root.add(path);
 return {root,water:pond,dispose(){
  const geometries=new Set<THREE.BufferGeometry>(),materials=new Set<THREE.Material>();
  root.traverse(x=>{if(x instanceof THREE.Mesh){geometries.add(x.geometry);for(const m of (Array.isArray(x.material)?x.material:[x.material]))materials.add(m);}});
  geometries.forEach(x=>x.dispose());materials.forEach(x=>x.dispose());
 }};
}
