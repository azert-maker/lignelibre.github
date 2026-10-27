/* ---------- modèles GLB (Blender) embarqués ----------
   Les fichiers de assets/glb/ sont intégrés en base64 dans 17-assets.js par build.sh.
   Ils sont décodés au démarrage (GLTFLoader, asynchrone). Tant qu'ils ne sont pas prêts, ou si le chargeur
   manque (hors ligne, CDN bloqué), le jeu garde ses modèles procéduraux : il reste toujours jouable.

   Personnage : le rig procédural de buildHuman (groupes pelvis > spine > torso..., mêmes pivots que le
   squelette Blender) reste le « pilote ». Chaque image, les rotations locales des groupes sont recopiées
   sur les os du modèle skinné : q_os = inv(Q_repos_parent) · q_groupe · Q_repos_os.
   Tous les sports, le replay, le fantôme et le multijoueur continuent donc d'utiliser la même API de pose. */
const GLB={ready:false,models:{},err:null,stats:{}};
function b64ToBuf(s){const bin=atob(s),n=bin.length,u=new Uint8Array(n);for(let i=0;i<n;i++)u[i]=bin.charCodeAt(i);return u.buffer}
const GLB_P=(function(){
  if(typeof THREE==='undefined'||!THREE.GLTFLoader||typeof ASSET_GLB==='undefined'||!Object.keys(ASSET_GLB).length){GLB.err='chargeur ou modèles absents';return Promise.resolve(GLB)}
  const ld=new THREE.GLTFLoader(),t0=performance.now();
  return Promise.all(Object.keys(ASSET_GLB).map(n=>new Promise(res=>{
    try{ld.parse(b64ToBuf(ASSET_GLB[n]),'',gl=>{GLB.models[n]=gl;res()},e=>{GLB.err=n+': '+String(e&&e.message||e);res()})}catch(e){GLB.err=n+': '+String(e&&e.message||e);res()}
  }))).then(()=>{GLB.ready=true;GLB.stats.parseMs=Math.round(performance.now()-t0);return GLB})})();

/* clone d'un modèle skinné : SkeletonUtils si présent, sinon reconstruction manuelle des squelettes */
function glbClone(root){
  if(THREE.SkeletonUtils&&THREE.SkeletonUtils.clone)return THREE.SkeletonUtils.clone(root);
  const c=root.clone(true),src=[],dst=[];root.traverse(n=>src.push(n));c.traverse(n=>dst.push(n));const map=new Map();src.forEach((n,i)=>map.set(n,dst[i]));
  dst.forEach((n,i)=>{const s=src[i];if(s.isSkinnedMesh){const bones=s.skeleton.bones.map(b=>map.get(b));n.bind(new THREE.Skeleton(bones,s.skeleton.boneInverses),s.bindMatrix)}});return c}

const RIDER_BONES=['pelvis','spine','torso','neck','head','clavicle0','upperArm0','foreArm0','hand0','clavicle1','upperArm1','foreArm1','hand1','upperLeg0','lowerLeg0','foot0','upperLeg1','lowerLeg1','foot1'];
const _riderTpl={};
function riderTemplate(key){
  key=GLB.models[key]?key:GLB.models.rider?'rider':'rider_lo';
  if(_riderTpl[key]!==undefined)return _riderTpl[key];const gl=GLB.models[key];if(!gl)return null;
  const root=gl.scene;root.updateMatrixWorld(true);const inv=new THREE.Matrix4().copy(root.matrixWorld).invert();
  const W={},rel=n=>{const m=new THREE.Matrix4().multiplyMatrices(inv,n.matrixWorld),p=new THREE.Vector3(),q=new THREE.Quaternion(),s=new THREE.Vector3();m.decompose(p,q,s);return {p,q,m}};
  let ok=true;const info={};
  for(const b of RIDER_BONES){const n=root.getObjectByName(b);if(!n||!n.isBone){ok=false;break}
    const me=rel(n),pa=rel(n.parent);info[b]={A:pa.q.clone().invert(),B:me.q.clone(),p0:me.p.clone(),parentInv:pa.m.clone().invert()}}
  let tris=0;root.traverse(n=>{if(n.isMesh){const g=n.geometry;tris+=(g.index?g.index.count:g.attributes.position.count)/3}});
  GLB.stats[key+'Tris']=Math.round(tris);
  _riderTpl[key]=ok?{root,info,clips:gl.animations||[]}:null;if(!ok)GLB.err=key+' : os manquants';return _riderTpl[key]}

/* matériaux du modèle -> matériaux du jeu (couleurs du profil) ; skinning obligatoire en r128 */
function riderMaterial(src,L,hid){
  const nm=src.name||'',base=src.color?src.color.getHex():0xffffff;
  const shoe={trail:0x2a3038,grip:0xff6a1f,light:0x39e07a}[(L.gear&&L.gear.shoe)||'trail']||0x2a3038;
  const col={skin:L.skin,accent:L.accent,suit:L.suit,shoe,helmet:hid==='carbon'?0x22262b:L.helmet}[nm];
  const c=col!=null?col:base;
  if(nm==='helmet')return new THREE.MeshPhongMaterial({color:c,shininess:hid==='carbon'?95:55,specular:hid==='carbon'?0x8899aa:0x555555,skinning:true});
  if(nm==='visor'||nm==='metal'||nm==='eye_white'||nm==='iris'||nm==='pupil')return new THREE.MeshPhongMaterial({color:c,shininess:nm==='visor'?110:70,specular:0x8899aa,skinning:true});
  return new THREE.MeshLambertMaterial({color:c,skinning:true})}

/* habille un buildHuman avec le modèle Blender ; renvoie false si indisponible (le procédural reste visible) */
function dressHuman(g,L,drivers){
  /* niveau de détail : léger en qualité éco et pour les personnages secondaires (look.lod='lo') */
  const T=riderTemplate(L.lod==='lo'||S().quality==='eco'?'rider_lo':'rider');if(!T)return false;
  const hid=(L.gear&&L.gear.helmet)||'full';const model=glbClone(T.root);model.name='riderGLB';
  /* un seul squelette partagé par toutes les primitives (sinon une texture d'os et un envoi GPU par maillage) */
  let sk=null;model.traverse(n=>{if(n.isSkinnedMesh){if(!sk)sk=n.skeleton;else if(n.skeleton!==sk&&n.skeleton.bones.length===sk.bones.length)n.bind(sk,n.bindMatrix)}});
  const mats=new Map();
  model.traverse(n=>{if(n.isMesh){const k=n.material;if(!mats.has(k))mats.set(k,riderMaterial(k,L,hid));n.material=mats.get(k);n.frustumCulled=false}});
  const show=(name,v)=>{const o=model.getObjectByName(name);if(o)o.visible=v};
  show('helmet_full',hid!=='open');show('helmet_open',hid==='open');show('hair',hid==='open');
  /* masque le procédural (pas les objets ajoutés plus tard par un sport : ils restent visibles) */
  g.traverse(n=>{if(n.isMesh)n.visible=false});
  g.add(model);
  const B=RIDER_BONES.map(name=>({bone:model.getObjectByName(name),drv:drivers[name],I:T.info[name]}));
  const pel=B[0],tmpV=new THREE.Vector3(),q=new THREE.Quaternion();
  let mixer=null,act=null,lastClip=0;
  function sync(){
    if(mixer){const now=performance.now();mixer.update(Math.min(.1,(now-lastClip)/1000));lastClip=now;return}
    for(const b of B){q.copy(b.I.A).multiply(b.drv.quaternion).multiply(b.I.B);b.bone.quaternion.copy(q)}
    /* bassin : décalage du groupe pilote par rapport à sa position de repos (0, 0.96, 0) */
    tmpV.set(pel.I.p0.x+pel.drv.position.x,pel.I.p0.y+pel.drv.position.y-.96,pel.I.p0.z+pel.drv.position.z).applyMatrix4(pel.I.parentInv);pel.bone.position.copy(tmpV)}
  g.updateMatrixWorld=function(force){sync();THREE.Object3D.prototype.updateMatrixWorld.call(this,force)};
  /* clips Blender (garage, écran de fin) : g.clip('celebrate') ; g.clip(null) rend la main au rig du jeu */
  g.clip=name=>{if(!name){if(mixer){mixer.stopAllAction();mixer=null;act=null}return true}
    const c=T.clips.find(c=>c.name===name);if(!c)return false;mixer=mixer||new THREE.AnimationMixer(model);mixer.stopAllAction();act=mixer.clipAction(c);act.reset().play();lastClip=performance.now();return true};
  g.glb=model;return true}

/* BMX Blender : chaque pièce GLB a son origine sur le pivot du groupe procédural correspondant
   (cadre et avant : pivot tailwhip / barspin ; roues : axes ; pédalier : boîtier). Les animations du jeu
   (rotation des roues, du pédalier, tailwhip, barspin) s'appliquent donc telles quelles. */
function dressBmx(g,L){
  const gl=GLB.models.bmx,b=g.bike;if(!gl||!b)return false;
  const mk=src=>{const nm=src.name||'',c={frame:L.bmxCol??L.accent,rim:L.wheel??0xf0b84a,grip:L.accent}[nm],col=c!=null?c:(src.color?src.color.getHex():0xffffff);
    if(nm==='chrome')return new THREE.MeshPhongMaterial({color:col,shininess:100,specular:0xbbbbbb});
    if(nm==='frame'||nm==='rim')return new THREE.MeshPhongMaterial({color:col,shininess:70,specular:0x777777});
    return new THREE.MeshLambertMaterial({color:col})};
  const cache=new Map();let n=0;
  const put=(name,grp)=>{const src=gl.scene.getObjectByName(name);if(!src||!grp)return;
    for(const c of grp.children)if(c.isMesh)c.visible=false;
    const o=src.clone(true);o.position.set(0,0,0);o.quaternion.identity();o.scale.set(1,1,1);
    o.traverse(m=>{if(m.isMesh){if(!cache.has(m.material))cache.set(m.material,mk(m.material));m.material=cache.get(m.material)}});grp.add(o);n++};
  put('bmx_frame',b.frame);put('bmx_front',b.front);put('bmx_wheelR',b.wR);put('bmx_wheelF',b.wF);put('bmx_crank',b.crank);
  g.glbBike=n===5;return g.glbBike}
