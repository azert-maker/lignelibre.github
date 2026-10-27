'use strict';
/* =====================================================================
   CŒUR · utilitaires, rendu, météo, particules, audio, entrées, profil
===================================================================== */
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const lerp=(a,b,t)=>a+(b-a)*t;
const V3=()=>new THREE.Vector3();
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function save(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
function load(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}}
const fmt=n=>Math.round(n).toLocaleString('fr-FR');
const fmtT=s=>{if(!isFinite(s))return '—';const m=Math.floor(s/60),r=s-m*60;return m+':'+(r<10?'0':'')+r.toFixed(1)};
const fmtT2=s=>{if(!isFinite(s))return '—';const m=Math.floor(s/60),r=s-m*60;return m+':'+(r<10?'0':'')+r.toFixed(2)};
const hexCss=h=>'#'+(h>>>0).toString(16).padStart(6,'0');

/* ---------- bruit et hasard déterministes (même monde pour tous les joueurs d'un salon) ---------- */
function hash(x,y){let h=(Math.imul(x|0,374761393)+Math.imul(y|0,668265263))|0;h=Math.imul(h^(h>>>13),1274126177);h^=h>>>16;return (h>>>0)/4294967296}
function vnoise(x,y){const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi;const u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);
  const a=hash(xi,yi),b=hash(xi+1,yi),c=hash(xi,yi+1),d=hash(xi+1,yi+1);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v}
function fbm(x,y){return vnoise(x,y)*.55+vnoise(x*2.07+5.2,y*2.07)*.3+vnoise(x*4.3,y*4.3+1.7)*.15}
function mulberry(seed){let a=seed>>>0;return ()=>{a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return ((t^(t>>>14))>>>0)/4294967296}}
const rngAt=(seed,a,b)=>mulberry(((hash(a|0,b|0)*4294967296)>>>0)^(seed>>>0));
function strSeed(s){let h=2166136261;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
const dailySeed=()=>{const d=new Date();return 'J'+d.getFullYear()+String(d.getMonth()+1).padStart(2,'0')+String(d.getDate()).padStart(2,'0')};
const randCode=n=>{const a='abcdefghjkmnpqrstuvwxyz23456789';let s='';for(let i=0;i<n;i++)s+=a[Math.floor(Math.random()*a.length)];return s};

/* ---------- profil (local) ---------- */
/* Comptes locaux (PC partagés) : chaque compte a son propre profil dans le navigateur.
   ll3_accounts = {list:{id:{pseudo,pinHash,recHash,created}}, active:id|''} ; invité = 'll3_profile' */
const ACC_KEY='ll3_accounts';
const ACC=(()=>{const a=load(ACC_KEY,null);return a&&typeof a==='object'&&a.list&&typeof a.list==='object'?a:{list:{},active:''}})();
if(ACC.active&&!ACC.list[ACC.active])ACC.active='';
const PROFILE_KEY=ACC.active?'ll3_profile_'+ACC.active:'ll3_profile';
const PROFILE_DEFAULT={
  look:{name:'Rider',skin:0xd9a77f,suit:0x1d2731,accent:0xff5a36,helmet:0xf2f2ee,wing1:0xff5a36,wing2:0xffb000,pattern:1,deck:0x2a1f17,wheel:0xf0b84a,fcol:0x3fe0c5,boardCol:0xf3f1ea,
    gear:{helmet:'full',wing:'proxy',board:'top98',wheel:'w83'}},
  coins:0,xp:{},ach:{},achP:{},owned:{},adp:{},cons:{revive:0,boost:0,x15:0},
  records:{},medals:{},history:[],runs:0,
  settings:{quality:'normal',vol:.8,music:true,ghost:true,autoQ:true,sbAssist:true,spinSens:1,invert:false,cam:0,adsDemo:true,haptics:true,assist:true},
  last:{},
  streak:0,bestStreak:0,lastPlayDay:'',dailyDone:'',tutorialStep:0,
  account:{pseudo:'',pinHash:'',syncedAt:0,recoveryCode:''},classCode:''
};
function deepMerge(a,b){for(const k in b){if(b[k]&&typeof b[k]==='object'&&!Array.isArray(b[k])){a[k]=deepMerge(a[k]&&typeof a[k]==='object'?a[k]:{},b[k])}else if(a[k]===undefined)a[k]=b[k]}return a}
const profile=deepMerge(load(PROFILE_KEY,{}),JSON.parse(JSON.stringify(PROFILE_DEFAULT)));
/* filets : champs ajoutés après coup (profils anciens) */
for(const k of ['streak','bestStreak','tutorialStep'])if(typeof profile[k]!=='number')profile[k]=0;for(const k of ['lastPlayDay','dailyDone','classCode'])if(typeof profile[k]!=='string')profile[k]='';
/* MIGRATION v4 (refonte « 7 sports ») : luge, parapente, foil et surf foil sont retirés.
   On garde tout le reste (pièces, XP, records, cosmétiques, réglages, identifiants) ; les données des sports
   retirés restent dans le profil mais ne sont plus lues ; le dernier sport choisi est ramené sur un sport existant. */
const REMOVED_SPORTS=['luge','paraglide','foil','surf'];
if(!profile.last||typeof profile.last!=='object')profile.last={};
if(REMOVED_SPORTS.includes(profile.last.sport))profile.last.sport='wingsuit';
if((profile.v|0)<4){profile.v=4;if(profile.cons&&typeof profile.cons==='object')for(const k of ['revive','boost','x15'])profile.cons[k]=Math.max(0,profile.cons[k]|0)}
if(!profile.account||typeof profile.account!=='object')profile.account={pseudo:'',pinHash:'',syncedAt:0,recoveryCode:''};
if(!profile.settings.qChosen){const weak=matchMedia('(pointer:coarse)').matches||(navigator.hardwareConcurrency||8)<=4||(navigator.deviceMemory||8)<=4;profile.settings.quality=weak?'eco':'normal';profile.settings.qChosen=true}
let saveT=null,profileFrozen=false;/* gelé pendant un changement de compte / import pour ne pas réécrire l'ancien profil */
function saveProfile(){if(profileFrozen)return;clearTimeout(saveT);saveT=setTimeout(()=>{if(!profileFrozen)save(PROFILE_KEY,profile)},150)}
function flushProfile(){clearTimeout(saveT);if(!profileFrozen)save(PROFILE_KEY,profile)}
const S=()=>profile.settings;

/* ---------- moteur 3D ---------- */
if(!window.THREE){document.body.insertAdjacentHTML('beforeend','<div style="position:fixed;inset:0;display:grid;place-items:center;padding:24px;text-align:center;font-family:system-ui"><div><p style="font-size:18px;margin:0 0 12px">Le moteur 3D (Three.js) n\'a pas pu être chargé.</p><p style="color:#a7b3b6;margin:0 0 16px">Vérifie ta connexion internet : le jeu télécharge Three.js depuis cdnjs.</p><button onclick="location.reload()" style="padding:12px 20px;border-radius:4px;border:0;background:#8fd3ff;font-weight:700;cursor:pointer">Réessayer</button></div></div>');throw new Error('three')}
const renderer=new THREE.WebGLRenderer({antialias:false,powerPreference:'high-performance'});
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
$('#stage').appendChild(renderer.domElement);
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(66,1,0.1,1600);
const hemi=new THREE.HemisphereLight(0xffffff,0x444444,.85);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xffffff,.9);scene.add(sun);scene.add(sun.target);
sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-12,right:12,top:12,bottom:-12,near:1,far:140});sun.shadow.bias=-.0015;

function softTexture(inner,outer){const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');const r=g.createRadialGradient(32,32,0,32,32,32);
  r.addColorStop(0,inner);r.addColorStop(.45,inner.replace(/[\d.]+\)$/,'0.55)'));r.addColorStop(1,outer);g.fillStyle=r;g.fillRect(0,0,64,64);return new THREE.CanvasTexture(c)}
const softTex=softTexture('rgba(255,255,255,1)','rgba(255,255,255,0)');
const skyGeo=new THREE.SphereGeometry(1200,24,14);
const skyCol=new Float32Array(skyGeo.attributes.position.count*3);skyGeo.setAttribute('color',new THREE.BufferAttribute(skyCol,3));
const sky=new THREE.Mesh(skyGeo,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.BackSide,fog:false,depthWrite:false}));sky.renderOrder=-2;scene.add(sky);
const sunSprite=new THREE.Sprite(new THREE.SpriteMaterial({map:softTexture('rgba(255,252,240,1)','rgba(255,220,180,0)'),fog:false,depthWrite:false,transparent:true}));sunSprite.renderOrder=-1;scene.add(sunSprite);
const stars=(()=>{const n=700,p=new Float32Array(n*3),r=mulberry(7);for(let i=0;i<n;i++){const u=r()*2-1,a=r()*6.283,s=Math.sqrt(1-u*u);const y=Math.abs(u);p[i*3]=Math.cos(a)*s*1100;p[i*3+1]=y*1100;p[i*3+2]=Math.sin(a)*s*1100}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(p,3));const m=new THREE.Points(g,new THREE.PointsMaterial({size:2.2,sizeAttenuation:false,color:0xffffff,fog:false,transparent:true,opacity:.9,depthWrite:false}));m.renderOrder=-1;m.visible=false;scene.add(m);return m})();
const sunDir=new THREE.Vector3();

/* ---------- météo (jamais de pluie) ---------- */
const WEATHER={
  soleil:{label:'Grand soleil',top:0x2a64b0,horizon:0xcfe3ef,glow:0xfff1cc,sun:[.35,.8,-.5],sunColor:0xfff4e0,sunI:.95,hemiSky:0xe0efff,hemiI:.85,fog:1,clouds:5,cloudCol:0xffffff,size:150},
  aube:{label:'Aube',top:0x3a4f8f,horizon:0xf2c0b8,glow:0xffc9a0,sun:[-.6,.16,-.7],sunColor:0xffd2b0,sunI:.72,hemiSky:0xe8d0e0,hemiI:.78,fog:.9,clouds:7,cloudCol:0xffd8d0,size:190},
  couchant:{label:'Coucher de soleil',top:0x34518a,horizon:0xf3b27b,glow:0xffa45a,sun:[.7,.2,-.66],sunColor:0xffc086,sunI:1,hemiSky:0xffe0bd,hemiI:.85,fog:1,clouds:6,cloudCol:0xffd0a0,size:200},
  nuageux:{label:'Nuageux',top:0x7d8a99,horizon:0xc9ced3,glow:0xdfe3e6,sun:[.2,.9,-.3],sunColor:0xe8ecef,sunI:.5,hemiSky:0xd5dbe0,hemiI:1.0,fog:.8,clouds:18,cloudCol:0xe2e6ea,size:0},
  brume:{label:'Brume matinale',top:0xaab4bd,horizon:0xd7dcdf,glow:0xf0f0ea,sun:[.3,.6,-.6],sunColor:0xf4f1e8,sunI:.6,hemiSky:0xe4e8ea,hemiI:.95,fog:.4,clouds:3,cloudCol:0xeef0f2,size:120},
  neige:{label:'Neige légère',top:0x8f9db0,horizon:0xdde3ea,glow:0xf2f4f7,sun:[.2,.7,-.5],sunColor:0xeef2f6,sunI:.55,hemiSky:0xe6ebf0,hemiI:1.0,fog:.62,clouds:14,cloudCol:0xe4e8ee,size:0,flakes:true},
  nuit:{label:'Nuit étoilée',top:0x050a1a,horizon:0x1b2846,glow:0x8ea6d8,sun:[-.4,.55,-.7],sunColor:0xa7bbe6,sunI:.45,hemiSky:0x50669a,hemiI:.6,fog:.8,clouds:3,cloudCol:0x34425f,size:70,stars:true}
};
const WIND=[{label:'Calme',v:0},{label:'Léger',v:3},{label:'Modéré',v:7},{label:'Fort',v:12}];
let curEnv=null;
function applyEnv(modeEnv,wid){
  const w=WEATHER[wid]||WEATHER.soleil;curEnv=Object.assign({},w,modeEnv,{wid});
  const top=new THREE.Color(w.top),hor=new THREE.Color(w.horizon),glow=new THREE.Color(w.glow);
  sunDir.set(w.sun[0],w.sun[1],w.sun[2]).normalize();
  const p=skyGeo.attributes.position,v=V3(),c=new THREE.Color();
  for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).normalize();
    if(v.y>=0)c.copy(hor).lerp(top,Math.pow(v.y,.55));else c.copy(hor).multiplyScalar(1-Math.min(.3,-v.y*.6));
    const s=Math.max(0,v.dot(sunDir));c.lerp(glow,Math.pow(s,6)*.6);skyCol[i*3]=c.r;skyCol[i*3+1]=c.g;skyCol[i*3+2]=c.b}
  skyGeo.attributes.color.needsUpdate=true;
  scene.fog=new THREE.Fog(w.horizon,modeEnv.fogNear*w.fog,modeEnv.fogFar*w.fog);
  const lk=modeEnv.light||1;hemi.color.setHex(w.hemiSky);hemi.groundColor.setHex(modeEnv.hemiGround);hemi.intensity=w.hemiI*lk;
  sun.color.setHex(w.sunColor);sun.intensity=w.sunI*lk;
  sunSprite.visible=w.size>0;sunSprite.scale.set(w.size,w.size,1);sunSprite.material.color.setHex(wid==='nuit'?0xdfe8ff:0xffffff);
  stars.visible=!!w.stars;if(typeof flakes!=='undefined')flakes.set(w.flakes);if(typeof waterUniforms!=='undefined'){waterUniforms.uSky.value.set(w.horizon).lerp(new THREE.Color(w.top),.35);waterUniforms.uSun.value.copy(sunDir)}
  clouds.setup(S().quality==='eco'?Math.min(4,w.clouds):w.clouds,w.cloudCol,modeEnv.cloudY||120);
  document.documentElement.style.setProperty('--accent',modeEnv.accent||'#8fd3ff');
}
/* nuages : nappe qui suit la caméra (enroulement sur une tuile de 1600 m) */
const clouds=(()=>{const mat=new THREE.SpriteMaterial({map:softTex,color:0xffffff,transparent:true,opacity:.6,depthWrite:false,fog:false});const list=[];let y0=120;const T=1600;
  for(let i=0;i<20;i++){const s=new THREE.Sprite(mat);s.userData={ox:Math.random()*T,oz:Math.random()*T,h:Math.random()*120,w:120+Math.random()*160};s.scale.set(s.userData.w,s.userData.w*.38,1);s.visible=false;scene.add(s);list.push(s)}
  return {setup(n,col,y){mat.color.setHex(col);y0=y;list.forEach((s,i)=>s.visible=i<n)},
    update(cp){for(const s of list){if(!s.visible)continue;const u=s.userData;let x=((u.ox-cp.x)%T+T)%T-T/2,z=((u.oz-cp.z)%T+T)%T-T/2;s.position.set(cp.x+x,cp.y+y0+u.h,cp.z+z)}}}})();

let shadowsOn=false,dynScale=1;
const basePR=()=>{const q=S().quality,d=window.devicePixelRatio||1;return q==='eco'?Math.min(d,1)*.75:Math.min(d,q==='high'?1.6:1.25)};
function applyPR(){renderer.setPixelRatio(basePR()*dynScale);renderer.setSize(innerWidth,innerHeight)}
/* résolution adaptative : baisse la définition si le jeu passe sous ~45 i/s, la remonte s'il a de la marge */
const perf={acc:0,n:0,t:0};
function perfTick(dt){perf.acc+=dt;perf.n++;perf.t+=dt;if(perf.t<1.5)return;const ms=perf.acc/perf.n*1000;perf.acc=perf.n=perf.t=0;
  const lo=S().quality==='eco'?.5:.6;if(ms>22&&dynScale>lo){dynScale=Math.max(lo,dynScale-.1);applyPR()}else if(ms<14&&dynScale<1){dynScale=Math.min(1,dynScale+.05);applyPR()}}
function resize(){const q=S().quality;applyPR();$('#vignette').hidden=q==='eco';
  camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();sl.width=Math.round(innerWidth/2);sl.height=Math.round(innerHeight/2);
  shadowsOn=q==='high';renderer.shadowMap.enabled=shadowsOn;sun.castShadow=shadowsOn}
function shadowFollow(p){sun.target.position.copy(p);sun.position.copy(p).addScaledVector(sunDir,70)}
function castAll(o,cast,recv){o.traverse(n=>{if(n.isMesh){n.castShadow=!!cast;n.receiveShadow=!!recv}})}

/* ---------- lignes de vitesse ---------- */
const sl=$('#speedlines'),slx=sl.getContext('2d');
const streaks=Array.from({length:70},()=>({a:Math.random()*6.283,r:.3+Math.random()*.7,s:.5+Math.random()}));let slOn=false;
function speedLines(k,dt){const W=sl.width,H=sl.height;if(S().quality==='eco')k=0;if(k<=.03){if(slOn){slx.clearRect(0,0,W,H);slOn=false}return}slOn=true;
  slx.clearRect(0,0,W,H);const cx=W/2,cy=H*.46,R=Math.hypot(W,H)/2;slx.strokeStyle='rgba(255,255,255,'+(.32*k).toFixed(3)+')';slx.lineWidth=1;slx.beginPath();
  for(const s of streaks){s.r+=dt*s.s*(1.2+3.5*k);if(s.r>1.05){s.r=.32+Math.random()*.15;s.a=Math.random()*6.283}
    const r0=R*s.r,r1=r0+R*.14*k*s.s,ca=Math.cos(s.a),sa=Math.sin(s.a);slx.moveTo(cx+ca*r0,cy+sa*r0);slx.lineTo(cx+ca*r1,cy+sa*r1)}slx.stroke()}
addEventListener('resize',resize);

/* ---------- particules ---------- */
function makeParticles(n,size,opacity,parent){
  const g=new THREE.BufferGeometry(),p=new Float32Array(n*3),c=new Float32Array(n*3);for(let i=0;i<n;i++)p[i*3+1]=-1e5;
  g.setAttribute('position',new THREE.BufferAttribute(p,3));g.setAttribute('color',new THREE.BufferAttribute(c,3));
  const m=new THREE.PointsMaterial({size,vertexColors:true,transparent:true,opacity,depthWrite:false,map:softTex});
  const pts=new THREE.Points(g,m);pts.frustumCulled=false;parent.add(pts);
  const vel=new Float32Array(n*3),age=new Float32Array(n).fill(99),life=new Float32Array(n).fill(1),base=new Float32Array(n*3);let idx=0;
  return {spawn(x,y,z,vx,vy,vz,lt,r,gg,b){const i=idx;idx=(idx+1)%n;p[i*3]=x;p[i*3+1]=y;p[i*3+2]=z;vel[i*3]=vx;vel[i*3+1]=vy;vel[i*3+2]=vz;age[i]=0;life[i]=lt;base[i*3]=r;base[i*3+1]=gg;base[i*3+2]=b},
    update(dt,grav,fade){for(let i=0;i<n;i++){if(age[i]>=life[i]){if(p[i*3+1]>-1e4)p[i*3+1]=-1e5;continue}age[i]+=dt;vel[i*3+1]-=grav*dt;
      p[i*3]+=vel[i*3]*dt;p[i*3+1]+=vel[i*3+1]*dt;p[i*3+2]+=vel[i*3+2]*dt;const f=age[i]/life[i];
      c[i*3]=lerp(base[i*3],fade.r,f);c[i*3+1]=lerp(base[i*3+1],fade.g,f);c[i*3+2]=lerp(base[i*3+2],fade.b,f)}
      g.attributes.position.needsUpdate=true;g.attributes.color.needsUpdate=true}}}

/* ---------- audio ---------- */
let actx=null,nGain=null,nFilt=null,master=null;
function initAudio(){if(actx){if(actx.state==='suspended')actx.resume();return}try{actx=new (window.AudioContext||window.webkitAudioContext)();master=actx.createGain();master.gain.value=S().vol;master.connect(actx.destination);
  const len=actx.sampleRate*2,buf=actx.createBuffer(1,len,actx.sampleRate),d=buf.getChannelData(0);let b=0;
  for(let i=0;i<len;i++){const w=Math.random()*2-1;b=(b+.02*w)/1.02;d[i]=b*3.2+w*.12}
  const src=actx.createBufferSource();src.buffer=buf;src.loop=true;nFilt=actx.createBiquadFilter();nFilt.type='bandpass';nGain=actx.createGain();nGain.gain.value=0;
  src.connect(nFilt);nFilt.connect(nGain);nGain.connect(master);src.start();initAudioLayers();loadSamples()}catch(e){actx=null}}
let audioMuted=false;
function setVolume(v){S().vol=v;saveProfile();if(master)master.gain.setTargetAtTime(audioMuted?0:v,actx.currentTime,.05)}
function muteAll(m){audioMuted=m;if(master)master.gain.setTargetAtTime(m?0:S().vol,actx.currentTime,.05)}
function sound(g,f,q){if(!actx)return;const t=actx.currentTime;nGain.gain.setTargetAtTime((quiet?g*.12:g)*.6,t,.12);nFilt.frequency.setTargetAtTime(f,t,.12);nFilt.Q.setTargetAtTime(q,t,.2)}
let quiet=false;
function ding(f,dur){if(!actx||quiet)return;dur=dur||.4;const t=actx.currentTime,o=actx.createOscillator(),g=actx.createGain();o.type=f<200?'sine':'triangle';o.frequency.value=f;
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(f<200?.4:.16,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(master);o.start(t);o.stop(t+dur+.05)}
function buzz(p){try{if(S().haptics&&navigator.vibrate)navigator.vibrate(p)}catch(e){}}

/* ---------- entrées : clavier, tactile, manette ---------- */
const keys=Object.create(null);const tch={l:0,r:0,u:0,d:0,a:0};const pad={x:0,y:0,a:false,rx:0,ry:0};
const NEUTRAL={x:0,y:0,a:false};
function inp(){const L=keys.ArrowLeft||keys.KeyA||tch.l,R=keys.ArrowRight||keys.KeyD||tch.r,U=keys.ArrowUp||keys.KeyW||tch.u,D=keys.ArrowDown||keys.KeyS||tch.d;
  let x=(R?1:0)-(L?1:0),y=(U?1:0)-(D?1:0);if(Math.abs(pad.x)>.25)x=pad.x;if(Math.abs(pad.y)>.35)y=pad.y>0?1:-1;
  return {x:clamp(x,-1,1),y,a:!!(keys.Space||tch.a||pad.a),g:!!(keys.ShiftLeft||keys.ShiftRight||keys.KeyF||pad.g)}}
const padPrev={};
let padOff=false;
function pollPad(onPress){if(padOff)return;let gps=[];try{gps=navigator.getGamepads?navigator.getGamepads():[]}catch(e){padOff=true;return}const gp=gps&&[...gps].find(g=>g&&g.connected);if(!gp){pad.x=0;pad.y=0;pad.a=false;pad.rx=0;pad.ry=0;return}
  pad.rx=gp.axes[2]||0;pad.ry=gp.axes[3]||0;
  pad.x=gp.axes[0]||0;pad.y=-(gp.axes[1]||0);if(gp.buttons[12]&&gp.buttons[12].pressed)pad.y=1;if(gp.buttons[13]&&gp.buttons[13].pressed)pad.y=-1;
  if(gp.buttons[14]&&gp.buttons[14].pressed)pad.x=-1;if(gp.buttons[15]&&gp.buttons[15].pressed)pad.x=1;
  pad.a=!!(gp.buttons[0]&&gp.buttons[0].pressed);pad.g=!!((gp.buttons[6]&&gp.buttons[6].pressed)||(gp.buttons[7]&&gp.buttons[7].pressed));
  const map={0:'Space',9:'Escape',3:'KeyC',2:'KeyR'};for(const b in map){const on=!!(gp.buttons[b]&&gp.buttons[b].pressed);if(on&&!padPrev[b])onPress(map[b]);padPrev[b]=on}}
const isTouch=matchMedia('(pointer:coarse)').matches;if(isTouch)document.body.classList.add('touch');

/* ---------- HUD ---------- */
const E={score:$('#hScore'),mult:$('#hMult'),speed:$('#hSpeed'),vmax:$('#hVmax'),arc:$('#spdArc'),time:$('#hTime'),toast:$('#toast'),touch:$('#touch'),feed:$('#feed'),inst:$('#inst'),count:$('#count'),prog:$('#hProg'),mp:$('#hMp'),vig:$('#vig'),flow:$('#hFlow')};
let toastT=0,lastToast='';
function toast(msg,force){if(!force&&msg===lastToast&&toastT>0){toastT=1.1;return}
  E.toast.textContent=msg;E.toast.classList.remove('show');void E.toast.offsetWidth;E.toast.classList.add('show');toastT=1.1;lastToast=msg}
function feed(txt){const d=document.createElement('div');d.className='fi';d.textContent=txt;E.feed.prepend(d);while(E.feed.children.length>4)E.feed.lastChild.remove();
  setTimeout(()=>d.classList.add('out'),1900);setTimeout(()=>d.remove(),2500)}

function disposeTree(o){o.traverse(n=>{if(n.geometry)n.geometry.dispose();if(n.material){(Array.isArray(n.material)?n.material:[n.material]).forEach(m=>{if(m.map&&m.map!==softTex)m.map.dispose();m.dispose()})}})}
function mountainRing(parent,count,rMin,rMax,hMin,hMax,rock,snow,haze,rnd){
  rnd=rnd||Math.random;const g=new THREE.Group();const c1=new THREE.Color(rock).lerp(haze,.55),c2=new THREE.Color(snow).lerp(haze,.35);
  const m1=new THREE.MeshBasicMaterial({color:c1,fog:false}),m2=new THREE.MeshBasicMaterial({color:c2,fog:false});
  for(let i=0;i<count;i++){const a=i/count*Math.PI*2+rnd()*.2,d=rMin+rnd()*(rMax-rMin),h=hMin+rnd()*(hMax-hMin),r=h*(.9+rnd()*.6);
    const cone=new THREE.Mesh(new THREE.ConeGeometry(r,h,6+(i%3)),m1);cone.position.set(Math.cos(a)*d,h/2,Math.sin(a)*d);cone.rotation.y=rnd()*3;g.add(cone);
    const cap=new THREE.Mesh(new THREE.ConeGeometry(r*.34,h*.34,6+(i%3)),m2);cap.position.set(Math.cos(a)*d,h*.83+.5,Math.sin(a)*d);cap.rotation.y=cone.rotation.y;g.add(cap)}
  parent.add(g);return g}
function textSprite(text,color,w){const c=document.createElement('canvas');c.width=256;c.height=64;const g=c.getContext('2d');g.font='700 30px Bricolage Grotesque, Arial, sans-serif';
  const tw=Math.min(240,g.measureText(text).width+28);g.fillStyle='rgba(8,13,18,.75)';g.beginPath();const x=(256-tw)/2;g.roundRect?g.roundRect(x,10,tw,44,22):g.rect(x,10,tw,44);g.fill();
  g.fillStyle=hexCss(color);g.fillRect(x+12,26,10,10);g.fillStyle='#fff';g.textBaseline='middle';g.fillText(text,x+28,33,tw-36);
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),depthTest:false,transparent:true,fog:false}));s.scale.set(w||3.2,(w||3.2)/4,1);s.renderOrder=5;return s}
