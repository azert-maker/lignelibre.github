/* =====================================================================
   FOIL · deux variantes sur le même moteur
   - downwind : houle de 28 m (6,6 m/s), monde ouvert avec îles
   - surf     : vagues qui déferlent par séries, puissance réglable
   Collisions exactes : surface = triangles de l'eau affichée, bouées = cylindres, îles = plage
===================================================================== */
function makeFoilMode(variant){return function(cfg,look,ctx){
  const P_=cfg.params||{};const course=cfg.mode==='course';const surfV=variant==='surf';
  const env=surfV?{fogNear:120,fogFar:700,hemiGround:0x0e5a62,accent:'#ffb000',cloudY:150}:{fogNear:110,fogFar:660,hemiGround:0x0b4a5a,accent:'#3fe0c5',cloudY:150};
  const eco=S().quality==='eco';const seedI=strSeed(cfg.seed);const root=new THREE.Group();scene.add(root);let t=0;
  const fw=gearOf('fwing',look.gear.fwing).phys,fb=gearOf('fboard',look.gear.fboard).phys,MAST=gearOf('mast',look.gear.mast).len,VENT=MAST-.02;
  const AS=P_.assist??0;const STALL=fw.stall-(AS===0?.5:0);const wv=WIND[cfg.wind|0].v;const chop=.04+wv*.012;
  // --- surface de l'eau (fonction globale du temps : identique pour tous les joueurs) ---
  const SW=[.65,1,1.4][P_.swell??1];
  /* SURF : séries de vagues. Cycle de 10 créneaux espacés de LAM : 6 vagues (taille qui monte puis redescend), puis 4 créneaux vides
     (≈ 15 s de calme) où passe parfois une « bomb » isolée. Chaque vague a son type (petite rapide / moyenne parfaite / grosse),
     son pic (a-frame) autour d'un des 3 spots, sa largeur et son sens de déroulement. Fonction déterministe de (x, z, t) : collisions exactes. */
  const APOW=[.9,1.4,2.0][P_.power??1],CW=[6.4,7.2,8.2][P_.power??1],LAM=surfV?30:46,SPOTS=[-130,0,150],WCACHE=new Map();
  function waveInfo(k){let w=WCACHE.get(k);if(w!==undefined)return w;const R=rngAt(seedI,k+99991,77),slot=((k%9)+9)%9;let A=0,type='';
    if(slot<6){const pr=[.55,.8,1.05,1.18,.85,.6][slot]*(.85+R()*.3);A=APOW*pr;type=pr<.7?'petite':pr<1.02?'moyenne':'grosse'}else if(R()<.2){A=APOW*1.55;type='bomb'}
    w=A?{A,type,xp:SPOTS[Math.floor(R()*3)]+(R()-.5)*40,wd:type==='bomb'?95:42+R()*30,front:type==='petite'?5.5:6.5,back:type==='bomb'?20:15}:null;
    WCACHE.set(k,w);if(WCACHE.size>500)WCACHE.delete(WCACHE.keys().next().value);return w}
  const waveAmpAt=(w,x)=>{const dx=(x-w.xp)/w.wd;return w.A*(.42+.58*Math.exp(-dx*dx))};
  const Wd=(x,z,tt)=>SW*(.55*Math.sin(.224*z+1.48*tt+.3*Math.sin(x*.02))+.25*Math.sin(.349*(.85*z+.52*x)+1.85*tt+1.1))+chop*Math.sin(.9*x-1.1*z+2.6*tt);
  const Ws=(x,z,tt)=>{const kf=(z+CW*tt)/LAM,k0=Math.floor(kf);let h=chop*Math.sin(.9*x-1.1*z+2.6*tt)+.1*Math.sin(.21*z+1.1*tt+.3*Math.sin(x*.03));
    for(let k=k0-1;k<=k0+1;k++){const w=waveInfo(k);if(!w)continue;const zc=k*LAM-CW*tt,d=z-zc,Lw=d<0?w.front:w.back;if(d*d>9*Lw*Lw)continue;h+=waveAmpAt(w,x)*Math.exp(-(d*d)/(Lw*Lw))}return h};
  const W=surfV?Ws:Wd;
  const waveIdx=z=>Math.floor((z+CW*t)/LAM)+1;
  const N=eco?28:S().quality==='high'?72:52,SIZE=200,ST=SIZE/N;let tMesh=-1;
  const og=new THREE.BufferGeometry(),pos=new Float32Array((N+1)*(N+1)*3),col=new Float32Array((N+1)*(N+1)*3),idx=[],hg=new Float32Array((N+1)*(N+1));
  for(let j=0;j<=N;j++)for(let i=0;i<=N;i++){pos[(j*(N+1)+i)*3]=-SIZE/2+i*ST;pos[(j*(N+1)+i)*3+2]=-SIZE/2+j*ST}
  for(let j=0;j<N;j++)for(let i=0;i<N;i++){const a=j*(N+1)+i,b=a+1,c=a+N+1,d=c+1;idx.push(a,c,b,b,c,d)}
  og.setIndex(idx);og.setAttribute('position',new THREE.BufferAttribute(pos,3));og.setAttribute('color',new THREE.BufferAttribute(col,3));
  const ocean=new THREE.Mesh(og,eco?new THREE.MeshPhongMaterial({vertexColors:true,flatShading:true,shininess:0,specular:0x000000}):waterMaterial(new THREE.MeshPhongMaterial({vertexColors:true,flatShading:false,shininess:70,specular:surfV?0x2c4650:0x5a8090})));
  ocean.frustumCulled=false;ocean.receiveShadow=true;root.add(ocean);
  const cDeep=new THREE.Color(surfV?0x083f52:0x0a5a76),cMid=new THREE.Color(surfV?0x13808c:0x169bab),cFoam=new THREE.Color(0xe8fbf8),tc=new THREE.Color();
  const amp=surfV?APOW:SW;
  /* Eau (normal/high) : normales lissées recalculées sur la grille (vagues lisibles sans facettes), hauts-fonds turquoise près des îles,
     creux plus sombres, crêtes plus claires + écume dans le shader (uAmp). Éco : facettes plates, grille 28², mise à jour 30 Hz. */
  const nor=eco?null:new Float32Array((N+1)*(N+1)*3);if(nor)og.setAttribute('normal',new THREE.BufferAttribute(nor,3));waterUniforms.uAmp.value=surfV?APOW:SW;const cShal=new THREE.Color(0x3fd8c8);
  function updateOcean(cx0,cz0){const ox=Math.round(cx0/ST)*ST,oz=Math.round(cz0/ST)*ST;ocean.position.set(ox,0,oz);const isl=[...islands.values()].filter(Boolean);
    for(let n=0;n<(N+1)*(N+1);n++){const y=W(pos[n*3]+ox,pos[n*3+2]+oz,tMesh);pos[n*3+1]=y;hg[n]=y}
    for(let j=0;j<=N;j++)for(let i=0;i<=N;i++){const n=j*(N+1)+i,y=hg[n];tc.copy(cDeep).lerp(cMid,clamp((y/amp+.9)/1.8,0,1));
      if(surfV){const up=hg[Math.min(N,j+1)*(N+1)+i],dn=hg[Math.max(0,j-1)*(N+1)+i],sl=(up-dn)/(2*ST);if(sl>.15&&y>.35*APOW)tc.lerp(cFoam,clamp((sl-.15)*6,0,.9))}
      else if(y>.42*SW)tc.lerp(cFoam,clamp((y/SW-.42)*2.4,0,.8));
      if(isl.length){const wx=pos[n*3]+ox,wz=pos[n*3+2]+oz;for(const d of isl){const r=Math.hypot(wx-d.x,wz-d.z)/d.br;if(r<2.2){tc.lerp(cShal,clamp((2.2-r)/1.2,0,.75));break}}}
      col[n*3]=tc.r;col[n*3+1]=tc.g;col[n*3+2]=tc.b}
    if(nor)for(let j=0;j<=N;j++)for(let i=0;i<=N;i++){const n=j*(N+1)+i,l=hg[j*(N+1)+Math.max(0,i-1)],r=hg[j*(N+1)+Math.min(N,i+1)],u=hg[Math.max(0,j-1)*(N+1)+i],d=hg[Math.min(N,j+1)*(N+1)+i];
      const nx=-(r-l)/(2*ST),nz=-(d-u)/(2*ST),il=1/Math.sqrt(nx*nx+1+nz*nz);nor[n*3]=nx*il;nor[n*3+1]=il;nor[n*3+2]=nz*il}
    og.attributes.position.needsUpdate=true;og.attributes.color.needsUpdate=true;if(nor)og.attributes.normal.needsUpdate=true}
  function surfH(x,z){const fi=(x+SIZE/2)/ST,fj=(z+SIZE/2)/ST,i=Math.floor(fi),j=Math.floor(fj),u=fi-i,w=fj-j;
    const X0=i*ST-SIZE/2,Z0=j*ST-SIZE/2;const a=W(X0,Z0,tMesh),b=W(X0+ST,Z0,tMesh),c=W(X0,Z0+ST,tMesh);
    if(u+w<=1)return a+(b-a)*u+(c-a)*w;const d=W(X0+ST,Z0+ST,tMesh);return d+(c-d)*(1-u)+(b-d)*(1-w)}
  // --- îles déterministes (grille de 600 m) ---
  const CELL=600,isMat=new THREE.MeshLambertMaterial({color:0x3f7d4f}),sandMat=new THREE.MeshLambertMaterial({color:0xe6d3a3}),palmMat=new THREE.MeshLambertMaterial({color:0x2f6b3c}),trunkMat=new THREE.MeshLambertMaterial({color:0x7a5a3a});
  const islands=new Map();
  function islandAt(ci,cj){const R=rngAt(seedI,ci*31+7,cj*17+3);if((ci===0&&cj===0)||(ci===0&&cj===-1)||R()>.32)return null;
    return {x:(ci+.2+R()*.6)*CELL,z:(cj+.2+R()*.6)*CELL,r:40+R()*70,h:30+R()*60,R}}
  function updateIslands(px,pz){const ci0=Math.floor(px/CELL),cj0=Math.floor(pz/CELL);
    for(let ci=ci0-1;ci<=ci0+1;ci++)for(let cj=cj0-1;cj<=cj0+1;cj++){const key=ci+','+cj;if(islands.has(key))continue;const d=islandAt(ci,cj);if(!d){islands.set(key,null);continue}
      const g=new THREE.Group();const c=new THREE.Mesh(new THREE.ConeGeometry(d.r,d.h,7),isMat);c.position.y=d.h/2-4;g.add(c);
      const s=new THREE.Mesh(new THREE.CylinderGeometry(d.r*1.18,d.r*1.25,2.4,9),sandMat);g.add(s);
      for(let p=0;p<6;p++){const a=d.R()*6.28,pr=d.r*1.1;const tr=new THREE.Mesh(new THREE.CylinderGeometry(.25,.35,6,5),trunkMat);tr.position.set(Math.cos(a)*pr,4,Math.sin(a)*pr);g.add(tr);
        const crown=new THREE.Mesh(new THREE.ConeGeometry(2.6,2.4,6),palmMat);crown.position.set(Math.cos(a)*pr,7.6,Math.sin(a)*pr);g.add(crown)}
      g.position.set(d.x,-1,d.z);root.add(g);d.g=g;d.br=d.r*1.25;islands.set(key,d)}
    for(const [key,d] of islands){const [ci,cj]=key.split(',').map(Number);if(Math.abs(ci-ci0)>2||Math.abs(cj-cj0)>2){if(d){root.remove(d.g);d.g.traverse(n=>{if(n.geometry)n.geometry.dispose()})}islands.delete(key)}}}
  // --- bouées (cylindre r = 0,45 m) ---
  const BR=.45;const buoyGeo=new THREE.CylinderGeometry(BR*.7,BR,1.5,10);buoyGeo.translate(0,.55,0);
  const buoyMat=new THREE.MeshLambertMaterial({color:0xff6a3d}),buoyDone=new THREE.MeshLambertMaterial({color:0x7ee08a}),buoyNext=new THREE.MeshLambertMaterial({color:0xffd23a,emissive:0x553300});
  const buoys=[];let nextB=0,finishZ=null;
  if(course&&!surfV){const R=rngAt(seedI,5,5);for(let i=0;i<cfg.len;i++){const m=new THREE.Mesh(buoyGeo,buoyMat);const z=-60*(i+1)-30,x=(i%2?1:-1)*(9+R()*9);m.position.set(x,0,z);root.add(m);
      const lab=textSprite(String(i+1),0xffd23a,1.6);lab.position.set(0,2.6,0);m.add(lab);buoys.push({m,i,done:false})}
    finishZ=-60*(cfg.len+1)-50;const fm=new THREE.MeshLambertMaterial({color:0xff5a36});for(const s of [-1,1]){const py=new THREE.Mesh(new THREE.CylinderGeometry(.5,.8,6,8),fm);py.position.set(s*22,1.5,finishZ);root.add(py);
      const fl=textSprite('ARRIVÉE',0xff5a36,5);fl.position.set(s*22,6,finishZ);root.add(fl)}}
  function spawnBuoy(){const fx=Math.sin(F.h),fz=-Math.cos(F.h),d=70+Math.random()*40,side=(Math.random()<.5?-1:1)*(5+Math.random()*13);
    const m=new THREE.Mesh(buoyGeo,buoyMat);m.position.set(F.x+fx*d+Math.cos(F.h)*side,0,F.z+fz*d+Math.sin(F.h)*side);root.add(m);buoys.push({m,done:false,free:true})}
  // --- planche + rider ---
  const rig=buildFoil(look);castAll(rig,true,false);root.add(rig);const human=rig.human;
  const spray=makeParticles(eco?40:160,.45,.85,root);const sprayFade=new THREE.Color(0x7fc9d2);
  const wake=makeParticles(eco?30:120,.7,.6,root);
  /* Eau : sillage en ruban collé à la surface affichée (même triangles que la collision), éclaboussures au contact */
  const trail=makeTrail(root,{n:140,w:.42,color:0xf2fdff,fade:surfV?0x13808c:0x169bab,opacity:.6,life:5,step:.45,lift:.06,hf:(x,z)=>surfH(x,z)});const blob=makeBlob(root,1.6);let curWave=null,skimT=0,flightT=0,rollS=0,wasTouch=false,land=0,pChain=0,hPrev=0,jib={a:0,t:0},lnk=0,pushEnd=-9,wasPush=false;const wakeFade=new THREE.Color(0x169bab);
  const F={x:0,z:0,h:0,v:5.6*(ctx.boost?1.2:1),y:0,vy:0,st:1,last:-5,touch:0};
  if(surfV){let k=1;while(k<40){const w=waveInfo(k);if(w&&w.A>APOW*.7)break;k++}const w=waveInfo(k);F.z=k*LAM-11;if(w)F.x=w.xp+(seedI%2?1:-1)*12}// départ juste devant une bonne vague, sur l'épaule du pic
  /* DÉCOR foil : autres riders sur la houle (en surf : ils prennent les vagues), un bateau au loin, des mouettes */
  const pk=()=>PALETTE[Math.floor(Math.random()*PALETTE.length)],npc=[];
  for(let i=0;i<(eco?1:3);i++){const o=buildFoil(Object.assign({},look,{suit:pk(),accent:pk(),helmet:pk(),fcol:pk(),boardCol:pk(),name:'npc'}));o.human.snapPose({crouch:.4,lean:.25,twist:.7,spread:.6});root.add(o);
    npc.push({o,x:F.x+(i-1)*35+(Math.random()-.5)*10,z:F.z-40-i*28,h:(Math.random()-.5)*.6,sp:5.2+Math.random()*1.2,ph:Math.random()*6.28})}
  const boat=new THREE.Group();{const hm=new THREE.MeshLambertMaterial({color:0xf2f2ee}),dm=new THREE.MeshLambertMaterial({color:0x1d2731});const hull=new THREE.Mesh(new THREE.BoxGeometry(3,1.3,10),hm);hull.position.y=.3;boat.add(hull);
    const bow=new THREE.Mesh(new THREE.ConeGeometry(1.5,3,4),hm);bow.rotation.x=-Math.PI/2;bow.rotation.y=Math.PI/4;bow.position.set(0,.3,-6.3);bow.scale.set(1,1,.5);boat.add(bow);
    const cab=new THREE.Mesh(new THREE.BoxGeometry(2.2,1.6,3.2),dm);cab.position.set(0,1.7,.8);boat.add(cab);const mast=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,3.5,5),dm);mast.position.set(0,3.6,1.2);boat.add(mast)}
  root.add(boat);const BT={x:F.x+150,z:F.z-120,h:.4};
  const gulls=new THREE.InstancedMesh(makeBirdGeo(),new THREE.MeshLambertMaterial({color:0xf4f4f0,side:THREE.DoubleSide}),eco?2:5);gulls.frustumCulled=false;root.add(gulls);let gullT=4+Math.random()*8;
  function animDecor(dt,live){const tn=performance.now()/1000;
    for(const n of npc){if(surfV){let k=Math.floor((n.z+CW*t)/LAM)+1;for(let j=0;j<4&&!waveInfo(k);j++)k++;const zc=k*LAM-CW*t;n.z+=(zc+3.5-n.z)*Math.min(1,1.5*dt);n.x+=(Math.sin(tn*.35+n.ph)*4+2.5)*dt;n.h=-Math.PI/2+Math.sin(tn*.35+n.ph)*.6}
      else{n.h+=Math.sin(tn*.25+n.ph)*.25*dt;n.x+=Math.sin(n.h)*n.sp*dt;n.z-=Math.cos(n.h)*n.sp*dt}
      if(Math.hypot(n.x-F.x,n.z-F.z)>170){const a=F.h+(Math.random()-.5)*1.6,d=80+Math.random()*50;n.x=F.x+Math.sin(a)*d;n.z=F.z-Math.cos(a)*d;n.h=F.h+(Math.random()-.5)*.5}
      n.o.position.set(n.x,W(n.x,n.z,t)+.42,n.z);n.o.rotation.set(0,-n.h,Math.sin(tn*1.3+n.ph)*.12,'YXZ')}
    BT.x+=Math.sin(BT.h)*3*dt;BT.z-=Math.cos(BT.h)*3*dt;if(Math.hypot(BT.x-F.x,BT.z-F.z)>260){const a=F.h+(Math.random()<.5?-1:1)*(.7+Math.random()*.6);BT.x=F.x+Math.sin(a)*170;BT.z=F.z-Math.cos(a)*170;BT.h=F.h+(Math.random()-.5)}
    const by=W(BT.x,BT.z,t);boat.position.set(BT.x,by-.2,BT.z);boat.rotation.set((W(BT.x,BT.z-4,t)-W(BT.x,BT.z+4,t))*.08,-BT.h,(W(BT.x+1.5,BT.z,t)-W(BT.x-1.5,BT.z,t))*.15,'YXZ');
    for(let i=0;i<gulls.count;i++){const a=tn*.3+i*1.7,r=14+i*4;_dv.set(F.x+Math.cos(a)*r,9+i*2+Math.sin(tn*.7+i)*2,F.z-20+Math.sin(a)*r);_dq.setFromAxisAngle(_dy,-a);_ds.set(.8,.35+.65*Math.abs(Math.sin(tn*6+i)),.8);_dm.compose(_dv,_dq,_ds);gulls.setMatrixAt(i,_dm)}
    gulls.instanceMatrix.needsUpdate=true;if(live){gullT-=dt;if(gullT<0){gullT=9+Math.random()*12;sfx.gull(.22)}}}
  F.y=surfH(F.x,F.z)+.42;
  let pumpA=0,camYaw=0,ax=0,az=0,glideOn=false,glideT=0,wakeT=0,hb=.4,slope=0;
  let onWave=false,waveT=0,rideK=null,lastRideEnd=-99,lastCarve=0,lastX=0,rides=0;
  const stats={score:0,dist:0,vmax:0,buoys:0,pumps:0,time:0,longest:0,rides:0,carves:0,pen:0};const look3=V3();
  if(!course&&!surfV)spawnBuoy();
  function world(cxp,czp){updateIslands(cxp,czp);
    if(!eco||t-tMesh>=1/30||t<tMesh){tMesh=t;updateOcean(cxp,czp)}for(const b of buoys){b.m.position.y=surfH(b.m.position.x,b.m.position.z)-.15;b.m.rotation.z=Math.sin(t*1.7+b.m.position.x)*.1}}
  function drawProfile(){const cv=$('#iProf');if(!cv)return;const w=cv.width=(cv.clientWidth||180)*2,h=cv.height=(cv.clientHeight||64)*2,g=cv.getContext('2d');
    const fx=Math.sin(F.h),fz=-Math.cos(F.h),A=surfV?APOW*1.6:SW*1.2,sc=h/(2.6*A+MAST+.6),base=h*.6,span=surfV?34:24,y0=surfH(F.x,F.z);
    g.fillStyle=surfV?'rgba(255,176,0,.25)':'rgba(63,224,197,.28)';g.beginPath();g.moveTo(0,h);
    for(let i=0;i<=48;i++){const s=-span+i*(2*span/48),y=surfH(F.x+fx*s,F.z+fz*s);g.lineTo(i/48*w,base-(y-y0)*sc)}g.lineTo(w,h);g.closePath();g.fill();
    g.strokeStyle='rgba(255,255,255,.4)';g.setLineDash([5,5]);g.beginPath();g.moveTo(w/2-50,base-VENT*sc);g.lineTo(w/2+50,base-VENT*sc);g.stroke();g.setLineDash([]);
    g.fillStyle=hb>VENT-.12||hb<.1?'#ff5a4f':'#fff';g.fillRect(w/2-16,base-(F.y-y0)*sc-4,32,6);g.fillRect(w/2-1,base-(F.y-y0)*sc,3,MAST*sc);
    g.fillStyle='rgba(255,255,255,.65)';g.font='18px JetBrains Mono, monospace';g.fillText('avant →',w-80,22)}
  const crash=(a,b)=>{sfx.splash(1.3);ding(90,.7);buzz([40,30,60]);ctx.crash(a,b)};
  function pump(manual){if(F.st<.07){if(manual)toast('À bout de souffle',true);return}const d=t-F.last,good=d>.55&&d<1.15;
    F.v+=(good?(AS===0?.75:.55):.18)*fw.pump*clamp((8.5-F.v)/3,.15,1);F.vy+=.12;F.st-=AS===0?.035:.05;F.last=t;pumpA=1;stats.pumps++;sfx.pump(good);buzz(good?[14]:[6]);if(good&&manual)ding(520,.15);if(manual){pChain=good?pChain+1:0;if(pChain>=6){pChain=0;ctx.trick('Pompage parfait',200)}}}
  return {env,stats,name:surfV?'Surf foil':'Foil downwind',vScale:40,
    target:course?(surfV?cfg.len*14:(60*(cfg.len+1)+50)/6.2):0,
    keys:surfV?[['← →','tourner (demi-tour sur la vague = cutback)'],['↑ puis Espace','aerial sur la crête (← → en l\'air : 360)'],['Espace','pomper'+(AS===0?' (facultatif)':'')],['↑ ↓','hauteur du foil']]:[['← →','tourner (demi-tour en vol = jibe)'],['Espace','pomper'+(AS===0?' (facultatif)':' (rythme ~0,8 s)')+' · 6 en rythme = figure'],['↑ ↓','hauteur du foil'],['C','caméra']],
    touch:{u:'Monter',d:'Descendre',a:'Pomper'},
    inst:`<div class="ihead">${surfV?'Vague':'Vol'}</div>
      <canvas class="prof" id="iProf"></canvas>
      <div class="ro-grid"><div class="ro"><span>Hauteur</span><b id="iH">0<small>cm</small></b></div><div class="ro"><span>${surfV?'Vagues':'Houle'}</span><b id="iSw">—</b></div></div>
      <div class="rhythm"><svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="15" stroke="rgba(255,255,255,.15)"/><circle id="iRy" cx="20" cy="20" r="15" pathLength="100" stroke="var(--accent)" stroke-dasharray="0 100"/></svg><div class="t" id="iRyT">Rythme</div></div>
      <div class="barline"><span>Souffle</span><div class="bt"><i id="iSt"></i></div></div>`,
    hudUpdate(){const e=$('#iH');if(!e)return;e.innerHTML=Math.round(hb*100)+'<small>cm</small>';e.className=hb>VENT-.12||hb<.1?'bad':'';
      const s=$('#iSw');if(surfV){/* repère : type de la prochaine vague, délai et côté du pic */
        if(onWave&&curWave){s.textContent='sur la '+(curWave.type==='bomb'?'bomb !':curWave.type);s.className='ok'}
        else{let txt='calme…';for(let j=waveIdx(F.z),m=0;m<14;j++,m++){const w=waveInfo(j);if(!w)continue;const eta=(j*LAM-CW*t-F.z)/CW;if(eta<-1)continue;const dx=w.xp-F.x;
            txt=(w.type==='bomb'?'BOMB':w.type)+' '+Math.max(0,Math.round(eta))+' s '+(Math.abs(dx)<12?'·':dx>0?'→':'←')+(Math.abs(dx)<12?'':Math.round(Math.abs(dx))+'m');break}
          s.textContent=txt;s.className=''}}
      else{s.textContent=slope<-.025?'pousse':slope>.025?'freine':'plate';s.className=slope<-.025?'ok':slope>.025?'bad':''}
      const dt2=t-F.last,f=clamp(dt2/1.15,0,1),ry=$('#iRy');ry.style.strokeDasharray=(f*100).toFixed(1)+' 100';ry.style.stroke=dt2>.55&&dt2<1.15?'var(--good)':'var(--accent)';
      $('#iRyT').textContent=AS===0?'pompage auto':dt2<.55?'attends…':dt2<1.15?'pompe !':'glisse';const st=$('#iSt');st.style.width=(F.st*100)+'%';st.classList.toggle('hot',F.st<.2);drawProfile()},
    auto(){let x=0;if(surfV){const want=onWave?(Math.sin(t*.4)>0?.9:-.9):0;let dh=want-F.h;dh=Math.atan2(Math.sin(dh),Math.cos(dh));x=clamp(dh*1.5,-1,1)}
      else{const b=buoys.find(b=>!b.done);let want=Math.sin(t*.15)*.4;if(b){const ox=b.m.position.x+(b.m.position.x>F.x?-3.4:3.4);want=Math.atan2(ox-F.x,-(b.m.position.z-F.z))}let dh=want-F.h;dh=Math.atan2(Math.sin(dh),Math.cos(dh));x=clamp(dh*1.5,-1,1)}
      if(t-F.last>.8&&F.v<6.4&&F.st>.2)pump(false);return {x,y:hb<.25?1:hb>.6?-1:0,a:false}},
    prog(){if(!course)return '';return surfV?'Vagues <b>'+stats.rides+'</b>/'+cfg.len:'Bouée <b>'+Math.min(nextB+1,cfg.len)+'</b>/'+cfg.len+(stats.pen?' · +'+stats.pen+' s':'')},
    press(code){if(code!=='Space')return;
      /* aerial : de la vitesse + être sur la vague, foil haut OU juste après un pompage (pump-to-aerial) */
      if(surfV&&onWave&&!F.airb&&F.v>5.2&&(hb>VENT-.38||t-F.last<.5)){F.pta=t-F.last<.5;F.airb=true;F.airT=0;F.grab=false;F.vy=2.4+F.v*.14+(F.pta?.5:0);F.spinA=0;sfx.splash(.7);sfx.whoosh();camShake(.15);LOOK.go=Math.max(LOOK.go,.3);return}if(!F.airb)pump(true)},
    update(dt,I){const live=dt>0;t+=dt;
      /* carve : plus la planche est inclinée, plus la courbe se resserre ; sur la face de la vague, carver relance la vitesse */
      const cv=clamp(Math.abs(rollS)/.24,0,1);F.h+=I.x*fw.turn*fb.turn*(F.airb?0:.75+.55*cv)*dt;const fx=Math.sin(F.h),fz=-Math.cos(F.h);
      slope=(W(F.x+fx*.6,F.z+fz*.6,t)-W(F.x-fx*.6,F.z-fz*.6,t))/1.2;
      let acc=(onWave&&I.x&&!F.airb?.8*Math.abs(I.x)*clamp(-slope*12,0,1):0)-9.81*slope*(AS===0?.55:.75)-fw.drag*F.v*F.v-6/(F.v*F.v+.1)-Math.abs(I.x)*.1;
      const wdt=(W(F.x,F.z,t+.04)-W(F.x,F.z,t-.04))/.08,feel=wdt+slope*F.v;
      const hb0=F.y-surfH(F.x,F.z);
      /* assistance 0 : le foil suit la surface et se recale fort sur ~42 cm ; garde anti-ventilation près du haut du mât */
      if(F.airb){F.airT=(F.airT||0)+dt;F.vy-=9.81*.85*dt;F.y+=F.vy*dt;const nearL=F.vy<0&&F.y-surfH(F.x,F.z)<1.3;if(I.x&&!nearL)F.spinA+=I.x*6.5*dt;else{const tg=Math.round(F.spinA/(2*Math.PI))*2*Math.PI;F.spinA+=(tg-F.spinA)*(1-Math.exp(-(nearL?8:3.5)*dt))}if(I.a&&F.airT>.12)F.grab=true}else{
      const vyT=AS===0?I.y*.45+feel*.9+(.42-hb0)*3.2-Math.max(0,hb0-(VENT-.22))*8+Math.max(0,.12-hb0)*4:AS===1?I.y*.55+(F.v-5.5)*.02+feel*.9+(.4-hb0)*(fb.assist+.3):I.y*.55+(F.v-5.5)*.03+feel*.85+(.4-hb0)*fb.assist;F.vy+=(vyT-F.vy)*Math.min(1,(AS===0?7:4)*dt);F.y+=F.vy*dt;}
      F.x+=fx*F.v*dt;F.z+=fz*F.v*dt;
      const w1=surfH(F.x,F.z);hb=F.y-w1;
      if(F.airb&&hb<=.42&&F.vy<0){F.airb=false;const sa=Math.abs(F.spinA),rot=Math.round(sa/(2*Math.PI)),off=Math.abs(Math.atan2(Math.sin(F.spinA),Math.cos(F.spinA)));
        /* réception tolérante : jusqu'à 57° de travers, la planche est recalée */
        if(live&&off>1.0)return crash('Aerial raté','Retombé en travers ('+Math.round(off*57)+'°). Lâche ← → plus tôt : la rotation se termine seule.');
        F.y=w1+.42;hb=.42;F.vy=-.3;F.spinA=0;F.v*=1-off*.25;
        if(live){sfx.splash(1.1);human.impact(.5);camShake(.35);stats.aerials=(stats.aerials||0)+1;
          const nm=(F.pta?'Pump-to-':'')+'Aerial'+(rot?' '+rot*360:'')+(F.grab?' grab':'');ctx.trick(nm[0].toUpperCase()+nm.slice(1),400+rot*500+(F.grab?150:0)+(F.pta?200:0)+Math.round((F.airT||0)*150));
          for(let n=0;n<(eco?8:22);n++)spray.spawn(F.x,w1+.05,F.z,(Math.random()-.5)*4,1.5+Math.random()*2.5,(Math.random()-.5)*4,1,.97,.99,1);land=1}F.grab=false;F.pta=false;F.airT=0}
      if(AS===0&&t-F.last>.8&&F.v<6.3&&F.st>.25&&dt>0&&!F.airb)pump(false);
      if(hb<0&&!F.airb){F.y=w1;hb=0;F.vy=Math.max(F.vy,0);F.touch+=dt;acc-=AS===0?1.2:2.6;if(F.touch>.1&&live)toast('Touché !');if(F.touch>.2&&live&&!F.broke){F.broke=true;if(ctx.comboBreak)ctx.comboBreak()}flightT=0}
      else{F.touch=Math.max(0,F.touch-dt*2);if(F.touch===0)F.broke=false;if(live){flightT+=dt;stats.flight=Math.max(stats.flight||0,flightT)}}
      F.v=Math.max(0,F.v+acc*dt);F.st=Math.min(1,F.st+(t-F.last>.9?.12:.045)*dt);pumpA=Math.max(0,pumpA-dt*2.5);
      const kmh=F.v*3.6;if(live){stats.vmax=Math.max(stats.vmax,kmh);stats.time+=dt}
      if(live){
        if(hb>VENT&&!F.airb)return crash('Ventilation','L\'aile est sortie de l\'eau (mât '+Math.round(MAST*100)+' cm). Redescends quand la houle se creuse sous toi.');
        if(F.touch>(AS===0?1.6:.8))return crash('Board à l\'eau','Planche posée trop longtemps sur l\'eau. Remonte avant chaque creux.');
        if(F.v<STALL)return crash('Décroché','Sous '+Math.round(STALL*3.6)+' km/h ton aile ne porte plus. Pompe en rythme et cherche la pente de la vague.')}
      for(let i=buoys.length-1;i>=0;i--){const b=buoys[i],dx=b.m.position.x-F.x,dz=b.m.position.z-F.z,dd=Math.hypot(dx,dz),ahead=dx*fx+dz*fz;
        if(dd<3){for(const zz of [-fb.len/2,0,fb.len/2]){const px=F.x-fx*zz,pz=F.z-fz*zz;if(Math.hypot(b.m.position.x-px,b.m.position.z-pz)<BR+.25&&live&&!b.bump){b.bump=true;F.v*=.65;sfx.splash(.8);buzz([30]);toast('Bouée touchée',true);if(course&&!b.free){stats.pen+=3;feed('Bouée touchée · +3 s')}else{b.done=true;b.m.material=buoyMat}break}}}
        if(b.free){if(!b.done&&dd<5&&live){b.done=true;stats.buoys++;ctx.bonus(300,'Bouée');ding(880);b.m.material=buoyDone}if(ahead<-15||dd>220){root.remove(b.m);buoys.splice(i,1)}}
        else if(!b.done&&b.i===nextB){b.m.material=buoyNext;if(dd<6&&live){b.done=true;b.m.material=buoyDone;stats.buoys++;nextB++;ding(880);ctx.bonus(300,'Bouée '+(b.i+1));ctx.checkpoint(b.i+1,cfg.len)}
          else if(F.z<b.m.position.z-14&&live){b.done=true;b.m.material=buoyMat;stats.pen+=5;nextB++;feed('Bouée '+(b.i+1)+' manquée · +5 s');toast('+5 s',true)}}}
      if(!course&&!surfV)while(buoys.length<2)spawnBuoy();
      for(const d of islands.values()){if(d&&Math.hypot(d.x-F.x,d.z-F.z)<d.br&&live)return crash('Échoué','Le foil a touché le fond près de l\'île.')}
      if(course&&!surfV&&finishZ!==null&&F.z<=finishZ&&live){ding(990,.5);return ctx.finish(stats.time+stats.pen)}
      const d=F.v*dt;if(live)stats.dist+=d;
      if(surfV){const k=waveIdx(F.z),zc=k*LAM-CW*t,dz=F.z-zc,wI=waveInfo(k),A=wI?waveAmpAt(wI,F.x):0;const now=slope<-.035&&dz>-14&&A>.4;curWave=now?wI:null;
        if(now){if(!onWave){onWave=true;waveT=0;if(rideK!==k&&live&&t-lastRideEnd<10&&stats.rides>0)ctx.trick('Linké',300)}waveT+=dt;
          if(waveT>3&&rideK!==k&&live){rideK=k;stats.rides++;ctx.bonus(200,'Vague '+stats.rides);toast('Vague '+stats.rides,true);ding(740);if(course)ctx.checkpoint(stats.rides,cfg.len)}
          if(I.x!==0&&Math.sign(I.x)!==Math.sign(lastX)&&t-lastCarve>.5&&live){lastCarve=t;stats.carves++;ctx.trick('Carve',60*Math.min(2,F.v/6))}
          stats.score+=d*3;stats.longest=Math.max(stats.longest,waveT)}
        else{if(onWave)lastRideEnd=t;onWave=false;stats.score+=d}
        if(I.x!==0)lastX=I.x;
        if(course&&stats.rides>=cfg.len&&live){ding(990,.5);return ctx.finish(stats.time)}}
      else{const gl=t-F.last>1.6&&F.v>5;if(gl&&!glideOn&&live)toast('Glide',true);glideOn=gl;if(gl&&live){glideT+=dt;stats.longest=Math.max(stats.longest,glideT);if(glideT>5){ctx.trick('Longue glisse',100);glideT=.01}}else if(!gl)glideT=0;stats.score+=d*2*(gl?2:1)}
      /* FIGURES foil : jibe / cutback (demi-tour en vol), liaison de houles, pompage parfait, aerial (surf) */
      if(live){const dh=F.h-hPrev;hPrev=F.h;if(I.x!==0&&F.touch===0&&!F.airb){if(jib.t>(surfV?2.5:5)||Math.sign(dh)!==Math.sign(jib.a||dh)){jib.a=0;jib.t=0}jib.a+=dh;jib.t+=dt;
          if(Math.abs(jib.a)>(surfV?2.2:2.6)){ctx.trick(surfV?(onWave?'Cutback':'Roundhouse'):'Jibe',surfV?(onWave?380:250):300);sfx.shhh(1);for(let n=0;n<(eco?6:18);n++)spray.spawn(F.x,surfH(F.x,F.z)+.05,F.z,Math.cos(F.h)*(Math.random()*4-2),1+Math.random()*2,Math.sin(F.h)*(Math.random()*4-2),.9,.97,.99,1);jib.a=0;jib.t=0}}else if(F.touch>0){jib.a=0;jib.t=0}
        if(!surfV){const push=slope<-.025;if(push&&!wasPush){lnk=t-pushEnd<2.5?lnk+1:1;if(lnk>=3)ctx.trick('Liaison de houles ×'+lnk,120*lnk)}if(!push&&wasPush)pushEnd=t;wasPush=push}}
      world(F.x,F.z);
      rollS+=(-I.x*.24-rollS)*(live?1-Math.exp(-6*dt):1);
      rig.position.set(F.x,F.y,F.z);rig.rotation.set(F.airb?-.25:-F.vy*.1+pumpA*.06,-F.h-(F.spinA||0),rollS,'YXZ');
      human.pose({crouch:.35+pumpA*.45+(F.touch>0?.2:0)+(F.airb?.35:0),lean:.25+pumpA*.2+(onWave?.12:0),twist:.7,spread:.7-pumpA*.4+Math.abs(rollS)*.6,look:.6,reach:onWave?.25:0,turn:I.x*.55,side:-rollS*.8});
      const mx=F.x-fx*.18,mz=F.z-fz*.18,sy=surfH(mx,mz);
      if(live&&(I.x!==0||hb<.2||pumpA>.5||onWave)&&Math.random()<.6){for(let n=0;n<2;n++)spray.spawn(mx,sy+.05,mz,(Math.random()-.5)*1.4+Math.cos(F.h)*I.x*1.5,.8+Math.random()*1.2,(Math.random()-.5)*1.4+Math.sin(F.h)*I.x*1.5,.7,.95,.98,1)}
      /* frôler la surface (foil haut… planche qui effleure) : écume + petit « shhh » ; redécollage : souffle + gerbe */
      if(live&&!F.airb&&F.touch===0&&hb<.13){skimT-=dt;if(skimT<=0){skimT=.55;sfx.shhh(.5)}if(Math.random()<.5)spray.spawn(F.x,sy+.04,F.z,(Math.random()-.5)*1.5,.4+Math.random()*.6,(Math.random()-.5)*1.5,.6,.97,.99,1)}
      if(live&&!(F.touch>0)&&wasTouch&&F.v>4.5){sfx.whoosh();for(let n=0;n<(eco?4:10);n++)spray.spawn(F.x,sy+.05,F.z,(Math.random()-.5)*2,1+Math.random()*1.5,(Math.random()-.5)*2,.8,.97,.99,1)}
      const tch=F.touch>0;if(live&&tch&&!wasTouch){sfx.splash(.7);human.impact(.4);camShake(.2);for(let n=0;n<(eco?6:14);n++)spray.spawn(F.x,sy+.05,F.z,(Math.random()-.5)*3,1.2+Math.random()*1.8,(Math.random()-.5)*3,.9,.97,.99,1)}wasTouch=tch;
      if(live)trail.push(mx,sy,mz,Math.cos(F.h),Math.sin(F.h),!F.airb);trail.update(dt);blob.set(F.x,surfH(F.x,F.z),F.z,Math.max(0,F.y-surfH(F.x,F.z))*1.5);
      spray.update(dt,6,sprayFade);
      wakeT+=dt;if(live&&wakeT>.05){wakeT=0;wake.spawn(mx,sy+.02,mz,Math.cos(F.h)*.5,0,Math.sin(F.h)*.5,2.5,.9,.97,.97);wake.spawn(mx,sy+.02,mz,-Math.cos(F.h)*.5,0,-Math.sin(F.h)*.5,2.5,.9,.97,.97)}
      wake.update(dt,0,wakeFade);animDecor(dt,live);
      camYaw+=(F.h-camYaw)*(live?1-Math.exp(-3*dt):1);human.visible=ctx.cam()!==1;
      if(ctx.cam()===1){camera.position.set(F.x,F.y+1.45,F.z);camera.rotation.set(-.12,-F.h,-I.x*.08,'YXZ')}
      else{const bx=Math.sin(camYaw),bz=-Math.cos(camYaw),D=ctx.cam()===2?14:5.2,Hh=ctx.cam()===2?6:1.9;const X=F.x-bx*D,Z=F.z-bz*D;
        camera.position.set(X,Math.max(F.y+Hh*(surfV&&ctx.cam()===0?.8:1),surfH(X,Z)+.6),Z);look3.set(F.x+fx*7,F.y+.5,F.z+fz*7);camera.lookAt(look3);camera.rotateZ(rollS*.35)}
      camera.fov=64+clamp((F.v-5)*1.6,0,8);camera.updateProjectionMatrix();shadowFollow(rig.position);speedLines(0,dt);
      if(F.touch>0)sound(.3,500,.5);else sound(clamp(F.v/8,0,1)*.2+(onWave?.12:0),420+F.v*80+hb*500,.7);// sifflement du foil : plus grave et plein quand ça plane vite et bas
      surface('water',clamp(F.v/8,0,1)*(F.touch>0?1.4:.75)+(onWave?.15:0),F.v);
      ctx.hud({kmh,mult:onWave?'Sur la vague ×3':glideOn?'Glide ×2':''},dt)},
    attract(dt){t+=dt;az-=6*dt;rig.visible=false;const y=W(ax,az,t);camera.position.set(ax+Math.sin(t*.1)*3,Math.max(2.4,y+2),az);camera.lookAt(ax,0,az-30);camera.fov=64;camera.updateProjectionMatrix();
      F.x=ax;F.z=az;world(ax,az);sound(.12,800,.5)},
    idle(dt){t+=dt;world(F.x,F.z);spray.update(dt,6,sprayFade);wake.update(dt,0,wakeFade);trail.update(dt);sound(0,800,.5);surface('air',0,0)},
    snapshot(){return {x:F.x,z:F.z,h:F.h,v:F.v}},
    restore(s){trail.clear();F.airb=false;F.spinA=0;F.x=s.x;F.z=s.z;F.h=s.h;F.v=Math.max(s.v,STALL+2.4);F.y=surfH(F.x,F.z)+.42;F.vy=0;F.touch=0;F.st=1},
    netState(){return {p:[+F.x.toFixed(2),+F.y.toFixed(2),+F.z.toFixed(2)],q:rig.quaternion.toArray().map(v=>+v.toFixed(3))}},
    ghost(lk){const o=buildFoil(lk);o.human.pose({crouch:.4,lean:.25,twist:.7,spread:.6});const tag=textSprite(lk.name,lk.fcol,3);tag.position.y=2.3;o.add(tag);root.add(o);return o},
    overStats(){return surfV?[['Vagues',stats.rides],['Carves',stats.carves],['Plus longue vague',stats.longest.toFixed(1)+' s'],['Vitesse max',Math.round(stats.vmax)+' km/h'],['Temps',fmtT(stats.time)]]
      :[['Distance',fmt(stats.dist)+' m'],['Vitesse max',Math.round(stats.vmax)+' km/h'],['Bouées',stats.buoys+(course?'/'+cfg.len:'')],['Plus longue glisse',stats.longest.toFixed(1)+' s'],['Temps',fmtT(stats.time)]]},
    _h:(x,z)=>surfH(x,z),_ocean:ocean,_rig:rig,_world:(f)=>{t+=1/60;world(f.p.x,f.p.z)},_F:()=>({F,hb,VENT,slope,onWave,t}),
    dispose(){scene.remove(root);disposeTree(root)}
  }}}
MODES.foil=makeFoilMode('downwind');
MODES.surf=makeFoilMode('surf');
