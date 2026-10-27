/* =====================================================================
   EFFETS VISUELS & AUDIO (procédural, aucune lib externe en plus de Three r128)
   - Textures canvas : tissu, bois, carbone
   - Shader « détail » injecté dans les matériaux Lambert du terrain (grain monde + paillettes neige)
   - Eau : fresnel, reflet soleil, ondulations fines et écume animée (la géométrie ne change pas :
     les collisions restent sur les triangles affichés)
   - Ombre « blob » sous le rider (normal/éco), traces au sol (neige, sillage), flocons
   - Audio en couches : vent, route, neige, eau + impacts (choc, souffle, éclaboussure)
   Niveaux : eco = pas de shader injecté, moins de particules ; normal = tout ; high = + vraies ombres
===================================================================== */
const Q=()=>S().quality;
/* ---------- textures canvas ---------- */
function canvasTex(w,h,draw,repeat){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);
  t.wrapS=t.wrapT=THREE.RepeatWrapping;if(repeat)t.repeat.set(repeat[0],repeat[1]);return t}
const TEX={
  fabric:canvasTex(64,64,(g,w,h)=>{g.fillStyle='#fff';g.fillRect(0,0,w,h);for(let y=0;y<h;y+=2)for(let x=0;x<w;x+=2){const v=225+((x*7+y*13)%17)+Math.random()*14;g.fillStyle=`rgb(${v},${v},${v})`;g.fillRect(x,y,2,2)}
    g.strokeStyle='rgba(0,0,0,.08)';for(let i=0;i<h;i+=8){g.beginPath();g.moveTo(0,i);g.lineTo(w,i);g.stroke()}}),
  wood:canvasTex(32,128,(g,w,h)=>{g.fillStyle='#fff';g.fillRect(0,0,w,h);for(let i=0;i<40;i++){const x=Math.random()*w;g.strokeStyle=`rgba(90,60,30,${.05+Math.random()*.12})`;g.lineWidth=1+Math.random()*2;g.beginPath();g.moveTo(x,0);g.bezierCurveTo(x+4,h*.3,x-4,h*.7,x+2,h);g.stroke()}}),
  carbon:canvasTex(32,32,(g,w,h)=>{for(let y=0;y<h;y+=4)for(let x=0;x<w;x+=4){g.fillStyle=((x+y)/4)%2?'#3a3f46':'#24282d';g.fillRect(x,y,4,4)}},[3,3]),
  grip:canvasTex(32,32,(g,w,h)=>{g.fillStyle='#fff';g.fillRect(0,0,w,h);for(let i=0;i<260;i++){const v=Math.random()*80+150;g.fillStyle=`rgb(${v},${v},${v})`;g.fillRect(Math.random()*w,Math.random()*h,1,1)}},[1,4])
};
/* ---------- shader de détail pour le terrain (grain dans l'espace monde) ---------- */
const GLSL_NOISE=`float llh(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float lln(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);return mix(mix(llh(i),llh(i+vec2(1,0)),u.x),mix(llh(i+vec2(0,1)),llh(i+vec2(1,1)),u.x),u.y);}`;
function detailMaterial(mat,opts){if(Q()==='eco')return mat;opts=opts||{};const sparkle=opts.snow?1:0,amp=opts.amp??.14;
  mat.onBeforeCompile=sh=>{
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vWPos;').replace('#include <project_vertex>','#include <project_vertex>\nvWPos=(modelMatrix*vec4(transformed,1.0)).xyz;');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vWPos;\n'+GLSL_NOISE).replace('#include <color_fragment>',`#include <color_fragment>
      float dn=lln(vWPos.xz*.35)*.6+lln(vWPos.xz*2.1)*.4;diffuseColor.rgb*=1.0-${amp.toFixed(3)}*.5+${amp.toFixed(3)}*dn;
      ${sparkle?'float sp=step(.996,llh(floor(vWPos.xz*9.0)));diffuseColor.rgb+=sp*.5;':''}`)};
  mat.needsUpdate=true;return mat}
/* ---------- eau : fresnel + reflet + ondulations + écume animée ---------- */
const waterUniforms={uTime:{value:0},uSky:{value:new THREE.Color(0xbfe0ef)},uSun:{value:new THREE.Vector3(.3,.7,-.6)},uAmp:{value:1}};
function waterMaterial(mat){if(Q()==='eco')return mat;
  mat.onBeforeCompile=sh=>{Object.assign(sh.uniforms,waterUniforms);
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vWPos;').replace('#include <project_vertex>','#include <project_vertex>\nvWPos=(modelMatrix*vec4(transformed,1.0)).xyz;');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vWPos;uniform float uTime;uniform vec3 uSky;uniform vec3 uSun;uniform float uAmp;\n'+GLSL_NOISE)
      .replace('#include <color_fragment>',`#include <color_fragment>
        float wht=min(diffuseColor.r,min(diffuseColor.g,diffuseColor.b));float fm=smoothstep(.55,.85,wht);
        float fn=lln(vWPos.xz*.9+vec2(uTime*.35,uTime*.2))*.6+lln(vWPos.xz*3.1-uTime*.5)*.4;
        diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.95,.99,1.),fm*smoothstep(.35,.75,fn));
        float crest=smoothstep(.5,1.,vWPos.y/max(uAmp,.1))*smoothstep(.4,.8,fn);diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.93,.98,1.),crest*.85);
        diffuseColor.rgb*=.86+.22*clamp(vWPos.y/max(uAmp,.1)*.5+.5,0.,1.);`)
      .replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
        vec2 rp=vWPos.xz;float e=.6;float h0=lln(rp*.7+uTime*.6)+lln(rp*1.9-uTime*.9)*.5;
        float hx=lln((rp+vec2(e,0.))*.7+uTime*.6)+lln((rp+vec2(e,0.))*1.9-uTime*.9)*.5;float hz=lln((rp+vec2(0.,e))*.7+uTime*.6)+lln((rp+vec2(0.,e))*1.9-uTime*.9)*.5;
        vec3 rw=vec3((h0-hx)*.5,0.,(h0-hz)*.5);normal=normalize(normal+(viewMatrix*vec4(rw,0.)).xyz);`)
      .replace('#include <dithering_fragment>',`#include <dithering_fragment>
        vec3 V=normalize(vViewPosition);float fr=pow(1.-clamp(dot(normal,V),0.,1.),3.);
        vec3 Ls=normalize((viewMatrix*vec4(uSun,0.)).xyz);vec3 Hh=normalize(Ls+V);float gl=pow(max(dot(normal,Hh),0.),140.)*1.5+pow(max(dot(normal,Hh),0.),18.)*.12;
        gl_FragColor.rgb=mix(gl_FragColor.rgb,uSky,fr*.55)+vec3(gl);`)};
  mat.needsUpdate=true;return mat}
/* ---------- ombre blob ---------- */
const blobTex=canvasTex(64,64,(g,w,h)=>{const r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,'rgba(0,0,0,.55)');r.addColorStop(.6,'rgba(0,0,0,.25)');r.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=r;g.fillRect(0,0,w,h)});
function makeBlob(parent,size){const m=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:blobTex,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2}));
  m.rotation.x=-Math.PI/2;m.renderOrder=1;parent.add(m);const up=new THREE.Vector3(0,1,0),q=new THREE.Quaternion(),q0=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),-Math.PI/2);
  return {m,set(x,y,z,h,n){m.visible=!shadowsOn&&h<40;if(!m.visible)return;m.position.set(x,y+.04,z);const s=size*(1+h*.06);m.scale.set(s,s,1);m.material.opacity=clamp(1-h/30,0,1);
    if(n){q.setFromUnitVectors(up,n);m.quaternion.copy(q).multiply(q0)}}}}
/* ---------- traces au sol (ruban à mémoire tournante) ---------- */
function makeTrail(parent,o){const n=Q()==='eco'?0:(o.n||90);if(!n)return {push(){},update(){},clear(){}};
  const pos=new Float32Array(n*2*3),col=new Float32Array(n*2*3),idx=[];for(let i=0;i<n-1;i++){const a=i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2)}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));g.setIndex(idx);
  const mesh=new THREE.Mesh(g,new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:o.opacity||.6,depthWrite:false,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-1,fog:true}));
  mesh.frustumCulled=false;mesh.renderOrder=1;parent.add(mesh);const pts=[];const c0=new THREE.Color(o.color),c1=new THREE.Color(o.fade);let lx=1e9,lz=1e9;
  function rebuild(){for(let i=0;i<n;i++){const p=pts[Math.min(i,pts.length-1)]||{x:0,y:-1e4,z:0,rx:0,rz:0,w:0,a:1};if(o.hf&&i<pts.length)p.y=o.hf(p.x,p.z)+(o.lift||.05);
      const w=p.w;pos.set([p.x-p.rx*w,p.y,p.z-p.rz*w,p.x+p.rx*w,p.y,p.z+p.rz*w],i*6);const f=clamp(p.a/(o.life||6),0,1);const r=lerp(c0.r,c1.r,f),gg=lerp(c0.g,c1.g,f),b=lerp(c0.b,c1.b,f);col.set([r,gg,b,r,gg,b],i*6)}
    g.attributes.position.needsUpdate=true;g.attributes.color.needsUpdate=true}
  return {push(x,y,z,rx,rz,on){if(Math.hypot(x-lx,z-lz)<(o.step||.5))return;lx=x;lz=z;pts.unshift({x,y,z,rx,rz,w:on?(o.w||.15):0,a:0});if(pts.length>n)pts.pop()},
    update(dt){for(const p of pts)p.a+=dt;rebuild()},clear(){pts.length=0;rebuild()}}}
/* ---------- flocons (météo « neige légère ») ---------- */
/* flocons : 200 (éco) / 700 (normal) / 1400 (haute), seulement en météo neige ; la boucle ne touche que les flocons affichés */
const flakes=(()=>{const N=1400,p=new Float32Array(N*3),sp=new Float32Array(N);for(let i=0;i<N;i++){p[i*3]=Math.random()*60-30;p[i*3+1]=Math.random()*30-8;p[i*3+2]=Math.random()*60-30;sp[i]=.6+Math.random()*.9}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(p,3));const pts=new THREE.Points(g,new THREE.PointsMaterial({color:0xffffff,size:.12,map:softTex,transparent:true,opacity:.9,depthWrite:false}));
  pts.frustumCulled=false;pts.visible=false;scene.add(pts);let t=0,n=0,FW=0;
  return {wind(v){FW=v||0},set(on){n=Q()==='eco'?200:Q()==='high'?N:700;pts.visible=!!on;g.setDrawRange(0,n)},count:()=>pts.visible?n:0,
    update(dt,cp){if(!pts.visible)return;t+=dt;pts.position.copy(cp);for(let i=0;i<n;i++){let y=p[i*3+1]-sp[i]*dt;if(y<-8)y+=30;p[i*3+1]=y;p[i*3]+=Math.sin(t*.7+i)*.004+FW*dt;if(p[i*3]>30)p[i*3]-=60}g.attributes.position.needsUpdate=true}}})();

/* ---------- audio en couches ---------- */
const AUD={ready:false,layers:{}};
function initAudioLayers(){if(AUD.ready||!actx)return;AUD.ready=true;const buf=nFilt.context&&noiseBuffer();
  const mk=(type,f,q)=>{const s=actx.createBufferSource();s.buffer=buf;s.loop=true;s.playbackRate.value=.8+Math.random()*.4;const fl=actx.createBiquadFilter();fl.type=type;fl.frequency.value=f;fl.Q.value=q;
    const gn=actx.createGain();gn.gain.value=0;s.connect(fl);fl.connect(gn);gn.connect(master);s.start();return {fl,gn}};
  AUD.wind=mk('bandpass',500,.6);{const lf=actx.createOscillator(),lg=actx.createGain();lf.frequency.value=.17;lg.gain.value=180;lf.connect(lg);lg.connect(AUD.wind.fl.frequency);lf.start()}
  AUD.layers.road=mk('lowpass',420,.8);AUD.layers.snow=mk('highpass',2400,.4);AUD.layers.water=mk('bandpass',650,.9);
  // ondulation de l'eau : LFO sur la fréquence du filtre
  const lfo=actx.createOscillator(),lg=actx.createGain();lfo.frequency.value=.45;lg.gain.value=260;lfo.connect(lg);lg.connect(AUD.layers.water.fl.frequency);lfo.start();
  // grain de l'asphalte : modulation d'amplitude rapide
  const am=actx.createOscillator(),ag=actx.createGain();am.frequency.value=38;ag.gain.value=0;am.connect(ag);ag.connect(AUD.layers.road.gn.gain);am.start();AUD.roadAM=ag;AUD.buf=buf}
function noiseBuffer(){const len=actx.sampleRate*2,b=actx.createBuffer(1,len,actx.sampleRate),d=b.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;return b}
const SURF_BASE={road:.5,snow:.32,water:.38};
/* surface('road'|'snow'|'water'|'air', intensité 0..1, vitesse m/s) : fondu enchaîné entre couches */
const SLOOP_BASE={road:.75,snow:.55,water:.6},SLOOP_RATE={road:[.65,1/28,1.7],snow:[.8,1/55,1.35],water:[.85,1/30,1.4]};
function surface(kind,level,speed){if(!actx||!AUD.ready)return;if(kind!=='air'&&!SDEC[kind])ensureSample(kind);const t=actx.currentTime;const L=quiet?0:clamp(level,0,1);
  for(const k in AUD.layers){const on=k===kind,sl=SLOOP[k];AUD.layers[k].gn.gain.setTargetAtTime(on?L*SURF_BASE[k]*(sl?.3:1):0,t,.045);
    if(sl){sl.g.gain.setTargetAtTime(on?L*SLOOP_BASE[k]:0,t,.045);if(on){const r=SLOOP_RATE[k];sl.src.playbackRate.setTargetAtTime(clamp(r[0]+(speed||0)*r[1],.5,r[2]),t,.2)}}}
  if(kind==='road'){AUD.layers.road.fl.frequency.setTargetAtTime(250+(speed||0)*14,t,.2);AUD.roadAM.gain.setTargetAtTime(on2(L)*.08,t,.2)}
  if(kind==='snow')AUD.layers.snow.fl.frequency.setTargetAtTime(1800+(speed||0)*40,t,.2)}
const on2=v=>v>.02?v:0;
function burst(type,f,q,dur,gain,sweep){if(!actx||!AUD.ready||quiet)return;const t=actx.currentTime,s=actx.createBufferSource();s.buffer=AUD.buf;const fl=actx.createBiquadFilter();fl.type=type;fl.frequency.setValueAtTime(f,t);if(sweep)fl.frequency.exponentialRampToValueAtTime(sweep,t+dur);fl.Q.value=q;
  const g=actx.createGain();g.gain.setValueAtTime(gain*(S().sfxVol??1)+1e-4,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);s.connect(fl);fl.connect(g);g.connect(master);s.start(t);s.stop(t+dur+.05)}
/* ---------- échantillons (Pixabay, voir 16-sfx-data) : décodés au premier geste, repli procédural sinon ----------
   Boucles de surface road/snow/water en fondu enchaîné avec le bruit filtré ; musique de menu ; one-shots. */
/* décodage paresseux : chaque son n'est décodé qu'au premier besoin (premier sfxPlay / première surface / musique au menu) ;
   seuls les sons du départ sont préparés à l'avance, un par un, pour ne pas bloquer le premier clic */
const SMP={},SLOOP={},SDEC={};let smpLoading=false,musicSrc=null,musicGain=null;
function ensureSample(k){if(!actx||SDEC[k]||typeof SFX_DATA==='undefined'||!SFX_DATA[k])return;SDEC[k]=1;
  try{const bin=atob(SFX_DATA[k].u.split(',')[1]),u8=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u8[i]=bin.charCodeAt(i);
    const p=actx.decodeAudioData(u8.buffer,buf=>{SMP[k]=buf;sampleReady(k)},()=>{});if(p&&p.catch)p.catch(()=>{})}catch(e){}}
function loadSamples(){if(smpLoading||!actx)return;smpLoading=true;const warm=['click','count','trick','whoosh','crash','combo','finish'];let i=0;
  (function next(){if(i<warm.length){ensureSample(warm[i++]);setTimeout(next,120)}})()}
function sampleReady(k){const d=SFX_DATA[k];
  if(k==='road'||k==='snow'||k==='water'){const src=actx.createBufferSource();src.buffer=SMP[k];src.loop=true;src.loopStart=d.loop[0];src.loopEnd=d.loop[1];
    const g=actx.createGain();g.gain.value=0;src.connect(g);g.connect(master);src.start(0,d.loop[0]);SLOOP[k]={src,g}}
  if(k==='music'){musicSrc=actx.createBufferSource();musicSrc.buffer=SMP.music;musicSrc.loop=true;musicGain=actx.createGain();musicGain.gain.value=0;musicSrc.connect(musicGain);musicGain.connect(master);musicSrc.start()}}
function sfxPlay(name,gain,rate){if(!actx||(quiet&&name!=='click'))return false;if(!SMP[name]){ensureSample(name);return false}const t=actx.currentTime,s=actx.createBufferSource(),g=actx.createGain();s.buffer=SMP[name];s.playbackRate.value=rate||1;g.gain.value=(gain??1)*(name==='click'?1:(S().sfxVol??1));s.connect(g);g.connect(master);s.start(t);return true}
/* musique : présente dans les menus, très discrète en course ; réglage « Musique » */
function musicTick(st){if(!musicGain){if(actx&&S().music!==false)ensureSample('music');return}const on=S().music!==false;const v=(!on?0:(st==='play'||st==='count')?.07:st==='ad'?0:.3)*(S().musicVol??1);musicGain.gain.setTargetAtTime(v,actx.currentTime,.6)}
const sfx={thud(p){p=p||1;if(!sfxPlay('crash',Math.min(1,.95*p))){burst('lowpass',180,1,.5,.9*p);ding(70,.45)}},
  whoosh(){if(!sfxPlay(Math.random()<.5?'whoosh':'whoosh2',.55,.9+Math.random()*.2))burst('bandpass',500,1.2,.45,.5,2400)},
  splash(p){p=p||1;if(!sfxPlay(p>1?'splashL':'splashS',Math.min(1,.7*p),.9+Math.random()*.2))burst('bandpass',1300,.7,.6,.6*p,500)},
  crunch(){if(!sfxPlay('crunch',.8,.9+Math.random()*.25))burst('highpass',2500,.6,.25,.35)},
  trick(n){return sfxPlay(n>=3?'combo':'trick',.5,1+Math.min(n||1,6)*.04)},finish(){return sfxPlay('finish',.7)},click(){return sfxPlay('click',.3)},coin(){return sfxPlay('coin',.45)},count(){return sfxPlay('count',.55)},pump(good){burst('lowpass',good?240:180,.9,.2,good?.45:.25);burst('bandpass',850,.7,.28,good?.18:.1,420)},shhh(g){if(!sfxPlay('splashS',.35*(g||1),1.25))burst('highpass',1800,.5,.5,.25*(g||1))},crowd(g){return sfxPlay('crowd',g??.5,.9+Math.random()*.2)},gull(g){return sfxPlay('gull',g??.25,.9+Math.random()*.25)}};

/* double appui gauche/droite (≤ 0,32 s) : déclencheur de figures (tonneau, etc.) */
function dblTap(){let last=0,lt=-9;return code=>{const d=code==='ArrowLeft'||code==='KeyA'?-1:code==='ArrowRight'||code==='KeyD'?1:0;if(!d)return 0;const t=performance.now()/1000;const hit=d===last&&t-lt<.32;last=d;lt=hit?-9:t;return hit?d:0}}
/* =====================================================================
   NEIGE PROFONDE (hors-piste) · couche de poudreuse déformable autour du rider
   - Grille torique en coordonnées monde : chaque case garde sa hauteur de base (terrain exact),
     son épaisseur, son tassement (dent 0..1) et son bourrelet (berm, neige repoussée).
   - Le rider reste posé sur le terrain exact (collisions et hitbox inchangées) ; la poudreuse
     au-dessus s'écarte : tranchée sous la planche, bourrelets sur les côtés, cratère à la réception.
   - Les traces restent tant qu'on est à moins d'une vingtaine de mètres (taille de la grille).
   Éco : grille plus petite et plus grossière ; normal/high : plus fine.
===================================================================== */
function makeDeepSnow(parent,o){const q=Q();const N=q==='eco'?44:q==='high'?128:100,S=q==='eco'?30:q==='high'?52:44,C=S/N,M=N+1,D=o.depth||.32;
  const NV=M*M,pos=new Float32Array(NV*3),col=new Float32Array(NV*3),nor=new Float32Array(NV*3),idx=[];
  for(let j=0;j<N;j++)for(let i=0;i<N;i++){const a=j*M+i,b=a+1,c=a+M,d=c+1;idx.push(a,c,b,b,c,d)}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));g.setAttribute('normal',new THREE.BufferAttribute(nor,3));g.setIndex(idx);
  const mat=detailMaterial(new THREE.MeshLambertMaterial({vertexColors:true,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-2}),{snow:true,amp:.05});
  const mesh=new THREE.Mesh(g,mat);mesh.frustumCulled=false;mesh.receiveShadow=true;parent.add(mesh);
  const base=new Float32Array(NV),dep=new Float32Array(NV),dent=new Float32Array(NV),berm=new Float32Array(NV),own=new Float64Array(NV).fill(NaN);
  function cell(wi,wj){const ii=((wi%M)+M)%M,jj=((wj%M)+M)%M,k=jj*M+ii,key=wi*1e6+wj;
    if(own[k]!==key){own[k]=key;const x=wi*C,z=wj*C;base[k]=o.groundH(x,z);dep[k]=o.depthAt?o.depthAt(x,z):D;dent[k]=0;berm[k]=0}return k}
  let c0i=0,c0j=0;
  function update(cx,cz){c0i=Math.floor(cx/C)-(N>>1);c0j=Math.floor(cz/C)-(N>>1);
    for(let j=0;j<=N;j++)for(let i=0;i<=N;i++){const wi=c0i+i,wj=c0j+j,k=cell(wi,wj),v=(j*M+i)*3;
      // fondu circulaire : la poudreuse rejoint le terrain sur un anneau, puis passe dessous (invisible)
      const r=Math.hypot(i-N/2,j-N/2)/(N/2),e=clamp((1-r)/.3,0,1),fade=e*e*(3-2*e),dn=dent[k]*fade;
      pos[v]=wi*C;pos[v+1]=r>1?base[k]-.6:base[k]+(dep[k]*(1-dent[k])+berm[k])*fade+.01;pos[v+2]=wj*C;
      const t=dn*.9,bb=berm[k]*fade;col[v]=.93-t*.17+bb;col[v+1]=.955-t*.13+bb;col[v+2]=.975-t*.05+bb*.4}
    for(let j=0;j<=N;j++)for(let i=0;i<=N;i++){const v=(j*M+i)*3,l=(j*M+Math.max(0,i-1))*3,rr=(j*M+Math.min(N,i+1))*3,u=(Math.max(0,j-1)*M+i)*3,d=(Math.min(N,j+1)*M+i)*3;
      const nx=-(pos[rr+1]-pos[l+1])/(pos[rr]-pos[l]||C),nz=-(pos[d+1]-pos[u+1])/(pos[d+2]-pos[u+2]||C),il=1/Math.sqrt(nx*nx+1+nz*nz);nor[v]=nx*il;nor[v+1]=il;nor[v+2]=nz*il}
    g.attributes.position.needsUpdate=true;g.attributes.color.needsUpdate=true;g.attributes.normal.needsUpdate=true}
  function each(x,z,r,fn){const i0=Math.floor((x-r)/C),i1=Math.ceil((x+r)/C),j0=Math.floor((z-r)/C),j1=Math.ceil((z+r)/C);
    for(let wj=j0;wj<=j1;wj++)for(let wi=i0;wi<=i1;wi++){if(wi<c0i||wi>c0i+N||wj<c0j||wj>c0j+N)continue;fn(cell(wi,wj),wi*C-x,wj*C-z)}}
  /* planche : tranchée de largeur w, bourrelets jusqu'à w+0,45 m */
  function stamp(x,z,fx,fz,len,w,str){const hl=len/2;each(x,z,hl+.8,(k,px,pz)=>{const u=px*fx+pz*fz,v=-px*fz+pz*fx,au=Math.abs(u),av=Math.abs(v);
      if(au<hl+.05&&av<w){if(str>dent[k]){dent[k]=str;berm[k]*=.3}}
      else if(au<hl+.35&&av<w+.45&&dent[k]<.5){const b=.14*(1-(av-w)/.45)*(1-Math.max(0,au-hl)/.35);if(b>berm[k])berm[k]=b}})}
  function crater(x,z,r){each(x,z,r+.7,(k,px,pz)=>{const d=Math.hypot(px,pz);if(d<r){const s=1-(d/r)*(d/r)*.35;if(s>dent[k]){dent[k]=s;berm[k]=0}}else if(d<r+.7&&dent[k]<.5){const b=.2*(1-(d-r)/.7);if(b>berm[k])berm[k]=b}})}
  function fresh(x,z){const wi=Math.round(x/C),wj=Math.round(z/C);if(wi<c0i||wi>c0i+N||wj<c0j||wj>c0j+N)return 1;return 1-dent[cell(wi,wj)]}
  return {mesh,update,stamp,crater,fresh}}
/* ---------- décor partagé : silhouettes de spectateurs, oiseaux ---------- */
const PEOPLE_COLS=[0xff5a36,0x2b8cff,0xffc23a,0x3fd38a,0xe94dc2,0xf2f2ee,0x1d2731,0x8a5cff,0xff8a3a,0x35c6e8];
const PEOPLE_GEO=(()=>{const b=new THREE.CylinderGeometry(.2,.26,1.1,6);b.translate(0,.55,0);const h=new THREE.SphereGeometry(.15,6,5);h.translate(0,1.27,0);return {b,h}})();
function makeBirdGeo(){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute([0,0,-.35,-1,.18,.15,0,0,.25, 0,0,-.35,1,.18,.15,0,0,.25],3));g.computeVertexNormals();return g}
const _dm=new THREE.Matrix4(),_dq=new THREE.Quaternion(),_dv=new THREE.Vector3(),_ds=new THREE.Vector3(),_dy=new THREE.Vector3(0,1,0);

/* sapin à étages (normal/high) : 3 cônes fusionnés qui restent DANS le cône de collision (r, h) ; éco : un seul cône */
function mergeGeos(list){const P=[],N=[];for(const g0 of list){const g=g0.index?g0.toNonIndexed():g0;g.computeVertexNormals();P.push(...g.attributes.position.array);N.push(...g.attributes.normal.array)}
  const out=new THREE.BufferGeometry();out.setAttribute('position',new THREE.Float32BufferAttribute(P,3));out.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));return out}
function treeGeometry(r,h){if(Q()==='eco'){const g=new THREE.ConeGeometry(r,h,6);g.translate(0,h/2,0);return g}
  const t=(rr,hh,y0)=>{const g=new THREE.ConeGeometry(rr,hh,7);g.translate(0,y0+hh/2,0);return g};return mergeGeos([t(r*.92,h*.5,h*.06),t(r*.66,h*.44,h*.32),t(r*.38,h*.36,h*.62)])}
/* vent procédural : couche continue dont le volume et la brillance suivent la vitesse ; plus fort dans les sports aériens */
function wind(s01,air){if(!actx||!AUD.wind)return;const t=actx.currentTime,s=clamp(s01,0,1.3),g=quiet?0:(.015+.42*s*s)*(air?1.15:.7);
  AUD.wind.gn.gain.setTargetAtTime(g,t,.08);AUD.wind.fl.frequency.setTargetAtTime(260+s*1500,t,.1)}

/* flash de frôlement (wingsuit près d'un sapin / du sol, slide parfait) */
function nearMissFx(){const el=document.getElementById('nmFlash');if(!el||S().flash===false){if(typeof camShake==='function')camShake(.18);return}el.classList.remove('on');void el.offsetWidth;el.classList.add('on');if(typeof camShake==='function')camShake(.18)}

/* fantômes (multi, record) : un seul matériau transparent partagé par fantôme, teinté de sa couleur (moins d'appels GPU) */
function ghostify(obj,color,op){const m=new THREE.MeshLambertMaterial({color:color||0x8fd3ff,transparent:true,opacity:op||.42,depthWrite:false});let ms=null;obj.traverse(n=>{if(n.isMesh||n.isInstancedMesh){if(!n.isSprite)n.material=n.isSkinnedMesh?(ms||(ms=Object.assign(m.clone(),{skinning:true}))):m}n.castShadow=false});obj.userData.ghostMat=m;return obj}
