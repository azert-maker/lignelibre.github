/* =====================================================================
   WAKEBOARD · tracté par un bateau qui suit vraiment son parcours
   Modèle arcade « au bout de la corde » : le rider garde la longueur de corde (20 m) derrière le point de
   remorquage ; ← → = mettre la carre, ce qui le fait traverser latéralement (vitesse de coupe progressive,
   limitée quand il s'écarte trop : la corde le ramène). Le sillage est une vraie bosse calculée dans le repère
   du bateau (deux crêtes en V à ±19°) et AFFICHÉE avec la même fonction : on saute exactement ce qu'on voit.
   Saut : charger (Espace) puis relâcher en montant sur la crête = pop ; wake to wake = retomber de l'autre côté.
   Modules flottants (kickers, sliders) le long du parcours ; parcours = slalom de bouées derrière le bateau.
===================================================================== */
function buildWake(look){const g=new THREE.Group();const wp=gearOf('wboard',look.gear.wboard);
  const bm=new THREE.MeshPhongMaterial({color:look.boardCol??0xf3f1ea,shininess:60,specular:0x444444}),dk=new THREE.MeshLambertMaterial({color:0x15191e}),ac=new THREE.MeshLambertMaterial({color:look.accent});
  const len=wp.phys.len||1.4;const board=new THREE.Mesh(new THREE.BoxGeometry(.42,.035,len),bm);board.position.y=.02;g.add(board);
  for(const z of [-len/2,len/2]){const tip=new THREE.Mesh(new THREE.CylinderGeometry(.21,.21,.035,14,1,false,0,Math.PI),bm);tip.rotation.y=z<0?Math.PI/2:-Math.PI/2;tip.position.set(0,.02,z);tip.scale.set(1,1,.5);g.add(tip)}
  const stripe=new THREE.Mesh(new THREE.BoxGeometry(.43,.036,.12),ac);stripe.position.y=.021;g.add(stripe);
  for(const z of [-.27,.27]){const b=new THREE.Mesh(new THREE.BoxGeometry(.2,.12,.14),dk);b.position.set(0,.09,z);g.add(b)}
  const human=buildHuman(look);human.position.y=.04;g.add(human);g.human=human;
  const handle=new THREE.Mesh(new THREE.CylinderGeometry(.018,.018,.34,6),dk);handle.rotation.x=Math.PI/2;g.add(handle);g.handle=handle;g.len=len;g.phys=wp.phys;return g}
function buildBoat(look){const g=new THREE.Group();const hull=new THREE.MeshPhongMaterial({color:0xf4f6f8,shininess:80,specular:0x777777}),stripe=new THREE.MeshLambertMaterial({color:look.accent}),dk=new THREE.MeshLambertMaterial({color:0x1a2026}),gl=new THREE.MeshPhongMaterial({color:0x223344,transparent:true,opacity:.55,shininess:120});
  const h=new THREE.Mesh(new THREE.BoxGeometry(2.4,.8,5.6),hull);h.position.y=.35;g.add(h);const bow=new THREE.Mesh(new THREE.ConeGeometry(1.2,2.2,4,1),hull);bow.rotation.x=-Math.PI/2;bow.rotation.y=Math.PI/4;bow.scale.set(1,1,.55);bow.position.set(0,.35,-3.7);g.add(bow);
  const st=new THREE.Mesh(new THREE.BoxGeometry(2.42,.18,5.62),stripe);st.position.y=.12;g.add(st);const deck=new THREE.Mesh(new THREE.BoxGeometry(2.2,.08,4.6),new THREE.MeshLambertMaterial({color:0xd8cfc0}));deck.position.y=.79;g.add(deck);
  const ws=new THREE.Mesh(new THREE.BoxGeometry(2.1,.5,.06),gl);ws.position.set(0,1.05,-1.2);ws.rotation.x=-.35;g.add(ws);
  for(const s of [-1,1]){const leg=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,1.8,6),dk);leg.position.set(s*1.0,1.6,.6);leg.rotation.z=-s*.25;g.add(leg)}
  const bar=new THREE.Mesh(new THREE.BoxGeometry(1.6,.12,.3),dk);bar.position.set(0,2.45,.6);g.add(bar);
  const driver=buildHuman(Object.assign({},look,{accent:0x2b6cff,suit:0x333a44,lod:'lo'}));driver.rotation.y=Math.PI/2;driver.position.set(-.5,.4,-.6);driver.snapPose({crouch:.9,lean:-.2,back:.8,stance:0});g.add(driver);
  g.tow=new THREE.Vector3(0,2.45,.6);return g}

MODES.wakeboard=function(cfg,look,ctx){
  const P_=cfg.params||{},course=cfg.mode==='course',eco=S().quality==='eco',seedI=strSeed(cfg.seed);const R=rngAt(seedI,6,13);
  const env={fogNear:200,fogFar:900,hemiGround:0x1e6a72,accent:'#22d3c5',cloudY:170,light:.86};
  const root=new THREE.Group();scene.add(root);const WP=gearOf('wboard',look.gear.wboard).phys;
  const VB=[8.1,9.2,10.3][P_.speed??1],HWK=[.55,.75,.95][P_.wake??1]*(VB/9.2),LR=20,TAN=Math.tan(15*Math.PI/180);
  /* ---------- parcours du bateau : polyligne à abscisse curviligne (2 m) ---------- */
  const PX=[],PZ=[],PH=[];
  function addStraight(x,z,h,len){for(let d=0;d<len;d+=2){PX.push(x+Math.sin(h)*d);PZ.push(z-Math.cos(h)*d);PH.push(h)}return [x+Math.sin(h)*len,z-Math.cos(h)*len]}
  function addArc(x,z,h,ang,Rr){const dir=Math.sign(ang),cx=x+Math.cos(h)*Rr*dir,cz=z+Math.sin(h)*Rr*dir,a0=Math.atan2(z-cz,x-cx),n=Math.max(2,Math.round(Math.abs(ang)*Rr/2));
    for(let i=0;i<n;i++){const a=a0+ang*i/n;PX.push(cx+Math.cos(a)*Rr);PZ.push(cz+Math.sin(a)*Rr);PH.push(h+ang*i/n)}const a=a0+ang;return [cx+Math.cos(a)*Rr,cz+Math.sin(a)*Rr,h+ang]}
  let LOOP=false;
  if(course){let x=0,z=0,h=0;[x,z]=addStraight(x,z,h,90);const n=cfg.len;for(let i=0;i<Math.ceil(n/4);i++){const a=(i%2?1:-1)*.5;let r=addArc(x,z,h,a,160);x=r[0];z=r[1];h=r[2];[x,z]=addStraight(x,z,h,70);r=addArc(x,z,h,-a,160);x=r[0];z=r[1];h=r[2];[x,z]=addStraight(x,z,h,40)}[x,z]=addStraight(x,z,h,120);PX.push(x);PZ.push(z);PH.push(h)}
  else{LOOP=true;let x=0,z=0,h=0,r;[x,z]=addStraight(x,z,h,380);r=addArc(x,z,h,Math.PI,150);x=r[0];z=r[1];h=r[2];[x,z]=addStraight(x,z,h,380);r=addArc(x,z,h,Math.PI,150)}
  const PN=PX.length,PL=(PN-1)*2;
  const _pp={x:0,z:0,h:0};function pathAt(s,o){o=o||_pp;if(LOOP)s=((s%(PN*2))+PN*2)%(PN*2);else s=clamp(s,0,PL);const f=s/2,i=Math.min(PN-1,Math.floor(f)),j=LOOP?(i+1)%PN:Math.min(PN-1,i+1),t=f-i;o.x=lerp(PX[i],PX[j],t);o.z=lerp(PZ[i],PZ[j],t);o.h=PH[i]+wrapA(PH[j]-PH[i])*t;return o}
  const wrapA=a=>Math.atan2(Math.sin(a),Math.cos(a));
  /* ---------- bateau ---------- */
  const boat=buildBoat(look);castAll(boat,true,false);root.add(boat);const B={s:LR+12,x:0,z:0,h:0,fx:0,fz:-1,rx:1,rz:0,sx:0,sz:0,tx:0,ty:2.45,tz:0};
  function boatUpdate(){const p=pathAt(B.s);B.x=p.x;B.z=p.z;B.h=p.h;B.fx=Math.sin(p.h);B.fz=-Math.cos(p.h);B.rx=Math.cos(p.h);B.rz=Math.sin(p.h);B.sx=B.x-B.fx*2.8;B.sz=B.z-B.fz*2.8;B.tx=B.x-B.fx*-.6+0;B.tz=B.z-B.fz*.6*-1;
    B.tx=B.x+B.fx*-.6;B.tz=B.z+B.fz*-.6;boat.position.set(B.x,0,B.z);boat.rotation.y=-B.h;boat.rotation.x=.04+Math.sin(tN*1.7)*.008;boat.rotation.z=Math.sin(tN*1.3)*.01}
  /* ---------- sillage (repère bateau) + clapot : UNE fonction pour l'affichage et la physique ---------- */
  function wakeAt(x,z){const dx=x-B.sx,dz=z-B.sz,dl=-(dx*B.fx+dz*B.fz),lat=dx*B.rx+dz*B.rz;if(dl<=0)return 0;const xr=dl*TAN+1.1,d=(Math.abs(lat)-xr)/1.25;
    const fade=clamp(dl/7,0,1)*Math.exp(-dl/75);return HWK*fade*(Math.exp(-d*d)-.18*Math.exp(-(lat*lat)/(4+dl*.2)))}
  let tW=0;const Wf=(x,z)=>.06*Math.sin(.31*x+1.3*tW)+.05*Math.sin(.27*z-1.1*tW+.4*Math.sin(x*.05))+wakeAt(x,z);
  const N=eco?40:S().quality==='high'?84:60,SIZE=110,ST=SIZE/N;const WK=new Float32Array((N+1)*(N+1));
  const og=new THREE.BufferGeometry(),pos=new Float32Array((N+1)*(N+1)*3),col=new Float32Array((N+1)*(N+1)*3),idx=[],hg=new Float32Array((N+1)*(N+1));
  for(let j=0;j<=N;j++)for(let i=0;i<=N;i++){pos[(j*(N+1)+i)*3]=-SIZE/2+i*ST;pos[(j*(N+1)+i)*3+2]=-SIZE/2+j*ST}
  for(let j=0;j<N;j++)for(let i=0;i<N;i++){const a=j*(N+1)+i,b=a+1,c=a+N+1,d=c+1;idx.push(a,c,b,b,c,d)}
  og.setIndex(idx);og.setAttribute('position',new THREE.BufferAttribute(pos,3));og.setAttribute('color',new THREE.BufferAttribute(col,3));const nor=eco?null:new Float32Array((N+1)*(N+1)*3);if(nor)og.setAttribute('normal',new THREE.BufferAttribute(nor,3));
  const water=new THREE.Mesh(og,eco?new THREE.MeshPhongMaterial({vertexColors:true,flatShading:true,shininess:0}):waterMaterial(new THREE.MeshPhongMaterial({vertexColors:true,shininess:80,specular:0x6a9aa8})));water.frustumCulled=false;water.receiveShadow=true;root.add(water);
  waterUniforms.uAmp.value=.6;
  /* lac au-delà de la grille vivante : grand plan plat de la même teinte */
  const far=new THREE.Mesh(new THREE.PlaneGeometry(4000,4000),eco?new THREE.MeshLambertMaterial({color:0x1d8f99}):waterMaterial(new THREE.MeshPhongMaterial({color:0x1d8f99,shininess:60,specular:0x557788})));far.rotation.x=-Math.PI/2;far.position.y=-.08;root.add(far);
  const cDeep=new THREE.Color(0x0f5f70),cMid=new THREE.Color(0x1f97a0),cFoam=new THREE.Color(0xeefcfb),tc=new THREE.Color();let gx=0,gz=0;
  function updateWater(cx0,cz0){gx=Math.round(cx0/ST)*ST;gz=Math.round(cz0/ST)*ST;water.position.set(gx,0,gz);
    for(let n=0;n<(N+1)*(N+1);n++){const x=pos[n*3]+gx,z=pos[n*3+2]+gz,wk=wakeAt(x,z);WK[n]=wk;const y=.06*Math.sin(.31*x+1.3*tW)+.05*Math.sin(.27*z-1.1*tW+.4*Math.sin(x*.05))+wk;pos[n*3+1]=y;hg[n]=y}
    for(let n=0;n<(N+1)*(N+1);n++){const y=hg[n],wk=WK[n];tc.copy(cDeep).lerp(cMid,clamp(y*2+.5,0,1));if(wk>.12*HWK)tc.lerp(cFoam,clamp((wk/HWK-.12)*1.6,0,.85));col[n*3]=tc.r;col[n*3+1]=tc.g;col[n*3+2]=tc.b}
    if(nor)for(let j=0;j<=N;j++)for(let i=0;i<=N;i++){const n=j*(N+1)+i,l=hg[j*(N+1)+Math.max(0,i-1)],r=hg[j*(N+1)+Math.min(N,i+1)],u=hg[Math.max(0,j-1)*(N+1)+i],d=hg[Math.min(N,j+1)*(N+1)+i];const nx=-(r-l)/(2*ST),nz=-(d-u)/(2*ST),il=1/Math.sqrt(nx*nx+1+nz*nz);nor[n*3]=nx*il;nor[n*3+1]=il;nor[n*3+2]=nz*il}
    og.attributes.position.needsUpdate=true;og.attributes.color.needsUpdate=true;if(nor)og.attributes.normal.needsUpdate=true}
  /* hauteur EXACTE du triangle affiché (même découpage que l'index) ; hors grille : la fonction directe */
  function waterH(x,z){const fi=(x-gx+SIZE/2)/ST,fj=(z-gz+SIZE/2)/ST,i=Math.floor(fi),j=Math.floor(fj);if(i<0||j<0||i>=N||j>=N)return Wf(x,z);const u=fi-i,w=fj-j;
    const a=hg[j*(N+1)+i],b=hg[j*(N+1)+i+1],c=hg[(j+1)*(N+1)+i];if(u+w<=1)return a+(b-a)*u+(c-a)*w;const d=hg[(j+1)*(N+1)+i+1];return d+(c-d)*(1-u)+(b-d)*(1-w)}
  /* ---------- modules flottants (kickers, sliders) le long du parcours ---------- */
  const park=makePark({root,base:()=>-.04,top:0xe8e4da,side:0x22d3c5,lip:0xff5a7a,rail:0xff6f61});const feats=[];
  {const step=course?150:110,n=Math.floor((PL-80)/step);for(let i=0;i<n;i++){const s=60+i*step+R()*30;const p=pathAt(s,{});if(LOOP){const p2=pathAt(s+30,{});if(Math.abs(wrapA(p2.h-p.h))>.05)continue}
    const side=R()<.5?-1:1,off=side*(5+R()*5),fx=Math.sin(p.h),fz=-Math.cos(p.h),rx=Math.cos(p.h),rz=Math.sin(p.h);const k=R()<.6?'kicker':'slider';
    /* le module est posé derrière le point du parcours : le rider (20 m derrière le bateau) le rencontre quand le bateau est passé */
    const x=p.x+rx*off,z=p.z+rz*off;if(k==='kicker'){park.add('kicker',x,z,p.h,4,3,1.15,{tag:'kicker',pow:1.6,y0:-.04});feats.push({k,x,z,h:p.h,s,off})}
    else{park.add('kicker',x,z,p.h,1.6,1.4,.42,{tag:'slider',pow:1.2,y0:-.04});park.addRailRaw(x+fx*1.6,z+fz*1.6,x+fx*11,z+fz*11,.42,.42,'rail');feats.push({k,x,z,h:p.h,s,off})}}}
  park.finalize();
  const surfH=(x,z)=>{const w=waterH(x,z),g=park.ground(x,z);return g.m?Math.max(w,g.h):w};
  /* ---------- rivage, décor ---------- */
  {const rr=rngAt(seedI,8,3);mountainRing(root,eco?10:16,700,900,40,120,0x5f7b55,0xa9b88f,new THREE.Color(0xcfe3ef),rr);
    const shoreM=new THREE.MeshLambertMaterial({color:0x6f9a55}),sandM=new THREE.MeshLambertMaterial({color:0xe2cf9c}),treeG=treeGeometry(1.8,6),treeM=new THREE.MeshLambertMaterial({color:0x2c5a34});
    let minX=1e9,maxX=-1e9,minZ=1e9,maxZ=-1e9;for(let i=0;i<PN;i++){minX=Math.min(minX,PX[i]);maxX=Math.max(maxX,PX[i]);minZ=Math.min(minZ,PZ[i]);maxZ=Math.max(maxZ,PZ[i])}
    const cxl=(minX+maxX)/2,czl=(minZ+maxZ)/2,rx=(maxX-minX)/2+160,rz=(maxZ-minZ)/2+160;const shore=new THREE.Mesh(new THREE.RingGeometry(1,1.6,48,1),shoreM);shore.rotation.x=-Math.PI/2;shore.scale.set(rx,rz,1);shore.position.set(cxl,.3,czl);root.add(shore);
    const beach=new THREE.Mesh(new THREE.RingGeometry(.97,1.02,48,1),sandM);beach.rotation.x=-Math.PI/2;beach.scale.set(rx,rz,1);beach.position.set(cxl,.32,czl);root.add(beach);
    const TN=eco?90:240,inst=new THREE.InstancedMesh(treeG,treeM,TN);for(let i=0;i<TN;i++){const a=rr()*Math.PI*2,k=1.05+rr()*.45;_dv.set(cxl+Math.cos(a)*rx*k,.3,czl+Math.sin(a)*rz*k);_dq.identity();_ds.setScalar(.8+rr()*.9);_dm.compose(_dv,_dq,_ds);inst.setMatrixAt(i,_dm)}root.add(inst);
    /* pontons et cabanes sur la rive */const dm=new THREE.MeshLambertMaterial({color:0x8a6a48});for(let i=0;i<6;i++){const a=rr()*Math.PI*2;const d=new THREE.Mesh(new THREE.BoxGeometry(3,.3,18),dm);d.position.set(cxl+Math.cos(a)*rx*.97,.35,czl+Math.sin(a)*rz*.97);d.rotation.y=-a+Math.PI/2;root.add(d)}}
  /* ---------- bouées du slalom (parcours) ---------- */
  let gates=null,finishT=0;const buoyM=new THREE.MeshLambertMaterial({color:0xff7a1a}),buoyG=new THREE.SphereGeometry(.45,10,8);
  if(course){const list=[];for(let i=0;i<cfg.len;i++){const s=120+i*(PL-260)/Math.max(1,cfg.len-1);const p=pathAt(s,{});const off=(i%2?1:-1)*7.5;const x=p.x+Math.cos(p.h)*off,z=p.z+Math.sin(p.h)*off;list.push({x,z,y:0,yaw:p.h,hw:2.4,h:2.4,s})}
    gates=makeGates(root,list,0xff7a1a);for(const g of gates.gates){g.grp.children.forEach(c=>{if(c.isMesh&&c.geometry.type==='BoxGeometry')c.visible=false});for(const sd of [-1,1]){const b=new THREE.Mesh(buoyG,buoyM);b.position.set(sd*g.hw,.15,0);g.grp.add(b)}}
    finishT=(PL-LR-20)/VB+1}
  /* ---------- rider ---------- */
  const rig=buildWake(look);castAll(rig,true,false);root.add(rig);const human=rig.human;
  const ropeG=new THREE.BufferGeometry();ropeG.setAttribute('position',new THREE.Float32BufferAttribute([0,0,0,0,0,0],3));const rope=new THREE.Line(ropeG,new THREE.LineBasicMaterial({color:0xfff1a8}));rope.frustumCulled=false;root.add(rope);
  const spray=makeParticles(eco?60:220,.42,.85,root),sprayFade=new THREE.Color(0xdff6f4);const foam=makeParticles(eco?60:240,1.1,.55,root),foamFade=new THREE.Color(0x9fdcd8);
  const blob=makeBlob(root,1.4);
  const St={X:0,U:0,y:0,vy:0,air:false,airT:0,spinS:0,spin:0,yawRel:0,flip:0,roll:0,fArm:false,grab:false,grabT:0,grabN:'',raley:0,charge:0,prevA:false,aRel:false,side0:0,onWake:0,grind:null,hmax:0,takeK:null,crashT:0,edge:0,wx:0,wz:0,pvx:0,pvz:0,boardYaw:0};
  const stats={score:0,dist:0,vmax:0,time:0,airs:0,wakeAirs:0,w2w:0,best:'',bestPts:0,tricks:0,flips:0,maxH:0,gates:0,pen:0,slides:0};
  const G=9.81;let tN=0,camYaw=0,airCam=0,land=0,az=0,sprayT=0,foamT=0;const look3=V3(),q1=new THREE.Quaternion(),AXX=new THREE.Vector3(1,0,0),AZZ=new THREE.Vector3(0,0,1),AYY=new THREE.Vector3(0,1,0);
  boatUpdate();updateWater(B.x,B.z);
  function riderWorld(o){const D=Math.sqrt(Math.max(1,LR*LR-St.X*St.X));o.x=B.tx-B.fx*D+B.rx*St.X;o.z=B.tz-B.fz*D+B.rz*St.X;return o}
  const RW={x:0,z:0};riderWorld(RW);St.y=waterH(RW.x,RW.z);
  /* défis « sillage » du monde libre (en plus des spots sur les modules) */
  const WCH=[['Wake to wake',n=>/Wake to wake/.test(n),400],['Backroll',n=>/Backroll/.test(n),500],['360 sur le sillage',n=>/\b(360|540|720)\b/.test(n),500],['Tantrum',n=>/Tantrum/.test(n),550],['Raley',n=>/Raley/.test(n),450],['Grab tenu',n=>/Indy|Melon/.test(n),300]];let wch=course?null:WCH[Math.floor(R()*WCH.length)];
  const spots=course?null:makeSpots(root,{rng:rngAt(seedI,4,2),n:2,mods:()=>park.mods,ok:m=>true,pos:m=>({x:m.x+m.fx*m.L/2,y:1,z:m.z+m.fz*m.L/2}),pick:(m,r)=>{const T=m.tag==='slider'?[['Slide jusqu\'au bout',/Slide/]]:[['Backroll',/Backroll/],['360',/\b(360|540)\b/],['Grab',/Indy|Melon/]];const c=T[Math.floor(r()*T.length)];return {label:c[0],bonus:450,r:12,test:n=>c[1].test(n)}}});
  /* ---------- son du bateau (oscillateur grave, aucun fichier) ---------- */
  const ENG=(()=>{if(!actx)return null;try{const o=actx.createOscillator(),lp=actx.createBiquadFilter(),g=actx.createGain();o.type='sawtooth';o.frequency.value=48;lp.type='lowpass';lp.frequency.value=260;g.gain.value=0;o.connect(lp);lp.connect(g);g.connect(master);o.start();return {o,lp,g}}catch(e){return null}})();
  const crash=(t,x)=>{for(let i=0;i<(eco?10:28);i++)spray.spawn(RW.x,St.y+.3,RW.z,(Math.random()-.5)*5,1+Math.random()*3,(Math.random()-.5)*5,1,.9,.97,.98);sfx.splash(1.3);buzz([40,30,60]);ctx.crash(t,x);return true};
  function airTrick(){const flips=Math.round(Math.abs(St.flip)/(2*Math.PI)),rolls=Math.round(Math.abs(St.roll)/(2*Math.PI)),u=Math.round(Math.abs(St.spinS)/Math.PI),deg=u*180;const parts=[];
    if(rolls)parts.push(rolls>1?'Double backroll':'Backroll');if(flips)parts.push(flips>1?'Double tantrum':'Tantrum');if(deg>=180)parts.push(String(deg));if(St.raley>.3)parts.push('Raley');if(St.grab)parts.push(St.grabN);
    let name=parts.join(' ');if(!name)name=St.wakeJ?'Wake jump':St.takeK?'Kicker air':'Air';if(St.w2w)name+=' · Wake to wake';
    return {name,pts:Math.round(60*St.airT+St.hmax*60+u*130+(flips+rolls)*480+(St.raley>.3?220:0)+(St.grab?90+St.grabT*70:0)+(St.w2w?180:0)),deg,flips:flips+rolls}}
  function takeoff(vy){St.air=true;St.airT=0;St.vy=vy;St.spinS=0;St.spin=0;St.flip=0;St.roll=0;St.fArm=false;St.grab=false;St.grabT=0;St.raley=0;St.aRel=false;St.hmax=0;St.y0=St.y;
    const lat=(RW.x-B.sx)*B.rx+(RW.z-B.sz)*B.rz;St.side0=Math.sign(lat);St.wakeJ=St.onWake>.15;St.takeK=park.ground(RW.x,RW.z).m;St.w2w=false}
  function step(h,I,live){const ASS=S().sbAssist!==false;
    /* --- latéral : carre ← → (coupe progressive), corde qui ramène si on s'écarte trop --- */
    const prevSurf=surfH(RW.x,RW.z);
    if(St.grind){const g_=St.grind,r=g_.r;g_.t+=h;riderWorld(RW);/* le bateau avance : on glisse le long du slider */const px=RW.x-r.x0,pz=RW.z-r.z0,t=(px*r.dx+pz*r.dz)/(r.hl*r.hl),lat=px*r.rx+pz*r.rz;St.X-=lat*.9;St.U=0;St.y=r.y0+.03;St.vy=0;
      const hop=I.a&&!St.prevA;St.prevA=I.a;if(live){surface('road',.6,6);if(Math.random()<.4)spray.spawn(RW.x,St.y,RW.z,(Math.random()-.5),.8,(Math.random()-.5),.4,1,1,1);if(ctx.keep)ctx.keep()}
      if(t>1||t<0||hop){St.grind=null;const len=g_.t*VB;takeoff(hop?3.2:.4);if(live&&g_.t>.3){stats.slides++;ctx.trick('Slide '+Math.round(len)+' m',80+len*25,{hold:true,base:'Slide'});if(spots)spots.test('Slide',{mod:g_.m,near:RW},ctx)}}
      return null}
    const D=Math.sqrt(Math.max(1,LR*LR-St.X*St.X));const out=St.X*Math.sign(I.x||0)>0?clamp((Math.abs(St.X)-.62*LR)/(.28*LR),0,1):0;
    const tgt=St.air?St.U:I.x?I.x*(WP.cut||8.6)*(1-out):-St.X*.16;St.U+=(tgt-St.U)*(1-Math.exp(-(St.air?.3:I.x?2.4:1.4)*h));St.edge=I.x;
    St.X=clamp(St.X+St.U*h,-.93*LR,.93*LR);if(Math.abs(St.X)>=.93*LR)St.U*=.5;riderWorld(RW);
    const sH=surfH(RW.x,RW.z);const lat=(RW.x-B.sx)*B.rx+(RW.z-B.sz)*B.rz,dl=-((RW.x-B.sx)*B.fx+(RW.z-B.sz)*B.fz);St.onWake=Math.abs(Math.abs(lat)-(dl*TAN+1.1))<1.6?wakeAt(RW.x,RW.z)/Math.max(.1,HWK):0;
    if(!St.air){/* --- sur l'eau : on suit la surface ; si elle « tombe » sous nos pieds en montant, on décolle --- */
      const vSurf=h>0?(sH-prevSurf)/h:0;St.vy=St.vy+(vSurf-St.vy)*(1-Math.exp(-25*h));
      if(I.a)St.charge=Math.min(1,St.charge+h*1.8);else if(St.charge>0){const c=St.charge;St.charge=0;const rising=vSurf>.4;const onW=rising||St.onWake>.25;takeoff(Math.max(St.vy,0)+(onW?2.2+3.6*c+Math.abs(St.U)*.2:.8+1.5*c));if(onW)St.U*=1.15;if(live){sfx.whoosh();LOOK.go=Math.max(LOOK.go,.15+c*.2);camShake(.08+c*.1);if(c>.75&&(rising||St.onWake>.3))ctx.trick('Pop parfait',100)}St.y=sH+.02;St.prevA=I.a;return null}
      if(St.vy>1.1&&vSurf<St.vy-1.6){takeoff(St.vy);St.y=Math.max(St.y,sH)}else St.y=sH}
    else{St.vy-=G*.8*h;St.y+=St.vy*h;St.airT+=h;St.hmax=Math.max(St.hmax,St.y-Math.max(sH,St.y0||0));const ttg=(St.y-sH)/Math.max(.1,-St.vy);
      if(!I.a&&St.charge>0){if(St.airT<.15){St.vy+=1.6*St.charge;if(live)sfx.whoosh()}St.charge=0}if(!I.a)St.aRel=true;
      const SENS=S().spinSens||1,sr=5.4*SENS*(WP.spin||1)*clamp((St.airT-.06)/.12,0,1);
      if(I.x!==0&&sr>0&&!I.g&&!(ASS&&ttg<.16)){St.yawRel+=I.x*sr*h;St.spinS+=I.x*sr*h;St.spin+=Math.abs(I.x)*sr*h}
      else{/* fin de rotation : vers l'axe (avant ou switch) le plus proche, dans le sens engagé si on a dépassé ~60 % du demi-tour */const PI=Math.PI,rem=((St.yawRel%PI)+PI)%PI;let d=rem>PI/2?PI-rem:-rem;if(St.spin>.5&&Math.sign(St.spinS)>0&&rem>(ASS?.3:.5)*PI)d=PI-rem;if(St.spin>.5&&Math.sign(St.spinS)<0&&rem<(ASS?.7:.5)*PI)d=-rem;
        const st=Math.sign(d)*Math.min(Math.abs(d),Math.max(3,Math.abs(d)/Math.max(.12,ttg-.05))*h);St.yawRel+=st;St.spinS+=st}
      if(I.y===0)St.fArm=true;const fr=6*clamp((St.airT-.1)/.15,0,1);
      const TP=2*Math.PI;if(St.fArm&&I.y>0&&fr>0&&!(ASS&&ttg<.2))St.flip+=fr*h;else if(St.fArm&&I.y<0&&fr>0&&!(ASS&&ttg<.2))St.roll+=fr*h;
      else for(const k of ['flip','roll']){const v=St[k],fr0=Math.abs(v)%TP,fwd=fr0>(ASS?.38:.55)*TP,tg=(fwd?Math.ceil(Math.abs(v)/TP):Math.floor(Math.abs(v)/TP))*TP*Math.sign(v||1);const need=tg-v;St[k]+=Math.sign(need)*Math.min(Math.abs(need),(ASS?Math.max(2.4,Math.abs(need)/Math.max(.12,ttg-.04)):2.4)*h)}
      if(I.g){if(!St.grab){St.grab=true;St.grabN=I.x<0?'Melon':'Indy'}St.grabT+=h}
      if(I.a&&St.aRel&&St.airT>.1)St.raley+=h;
      /* atterrissage sur un slider ? */
      if(park.rails.length&&St.vy<.5){const nr=park.railNear(RW.x,St.y,RW.z,.5);if(nr&&nr.dy>-.3&&nr.dy<.5){St.grind={r:nr.r,t:0,m:park.ground(nr.r.x0-nr.r.fx*.5,nr.r.z0-nr.r.fz*.5).m};St.air=false;St.yawRel=Math.round(St.yawRel/Math.PI)*Math.PI;St.flip=St.roll=0;if(live){sfx.crunch();buzz([15])}St.prevA=I.a;return null}}
      if(St.y<=sH){const fl=Math.min(Math.abs(St.flip-Math.round(St.flip/TP)*TP),TP),rl=Math.abs(St.roll-Math.round(St.roll/TP)*TP),rem=((St.yawRel%Math.PI)+Math.PI)%Math.PI,off=Math.min(rem,Math.PI-rem),vn=-St.vy;
        if(live){if(fl>(ASS?1.1:.8)||rl>(ASS?1.1:.8))return ['Chute dans l\'eau','Rotation pas finie à la réception ('+Math.round(Math.max(fl,rl)*57)+'° de trop).'];
          if(off>(ASS?1.2:.95)&&St.airT>.35)return ['Réception de travers','La planche était à '+Math.round(off*57)+'° de la trajectoire.'];
          if(vn>11)return ['Réception trop violente','Impact à '+vn.toFixed(1)+' m/s.']}
        St.air=false;St.y=sH;St.vy=0;St.yawRel=Math.round(St.yawRel/Math.PI)*Math.PI;St.flip=0;St.roll=0;
        const latL=(RW.x-B.sx)*B.rx+(RW.z-B.sz)*B.rz,dlL=-((RW.x-B.sx)*B.fx+(RW.z-B.sz)*B.fz),xr=dlL*TAN+1.1;St.w2w=St.wakeJ&&Math.sign(latL)!==St.side0&&Math.abs(latL)>xr-.6;const onRidge=Math.abs(Math.abs(latL)-xr)<.7;
        const T=airTrick();const lq=off<.2&&vn<5.5&&!onRidge?'perfect':off<.6&&vn<7.5?'clean':'sketchy';
        if(live){land=clamp(vn/6,.2,1);human.impact(land*.5);camShake(land*.35);sfx.splash(.5+land*.6);for(let i=0;i<(eco?8:24);i++)spray.spawn(RW.x,St.y+.05,RW.z,(Math.random()-.5)*4,.8+Math.random()*2*land,(Math.random()-.5)*4,.9,.95,.98,1);
          if(St.airT>.45){stats.airs++;if(St.wakeJ)stats.wakeAirs++;if(St.w2w)stats.w2w++;stats.maxH=Math.max(stats.maxH,St.hmax);stats.flips+=T.flips;
            if(onRidge)feed('Réception sur le sillage');ctx.trick(T.name,T.pts,{land:lq,base:T.name.replace(' · Wake to wake','')});if(lq==='perfect'&&T.flips&&ctx.slowmo)ctx.slowmo(.3,.5);if(T.pts>stats.bestPts){stats.bestPts=T.pts;stats.best=T.name}
            if(wch&&wch[1](T.name)){ctx.bonus(wch[2],'Défi sillage : '+wch[0]);if(!sfx.trick(4))ding(990,.3);wch=WCH[Math.floor(Math.random()*WCH.length)];toast('Nouveau défi : '+wch[0],true)}
            if(spots&&St.takeK)spots.test(T.name,{mod:St.takeK,near:RW},ctx)}}}}
    St.prevA=I.a;return null}
  /* ---------- pose et orientation ---------- */
  function orient(I){const vx=B.fx*VB+B.rx*St.U,vz=B.fz*VB+B.rz*St.U;const travel=Math.atan2(vx,-vz);/* la planche suit la trajectoire, carre visible */
    St.boardYaw=travel+(St.air||St.grind?0:St.edge*.25);const q=rig.quaternion;q.setFromAxisAngle(AYY,-(St.boardYaw+St.yawRel));
    if(St.flip){q1.setFromAxisAngle(AXX,St.flip);q.multiply(q1)}if(St.roll){q1.setFromAxisAngle(AZZ,St.roll);q.multiply(q1)}
    if(!St.air&&!St.grind){q1.setFromAxisAngle(AZZ,-St.edge*.35);q.multiply(q1)}
    rig.position.set(RW.x,St.y,RW.z);if(St.flip||St.roll){const c=V3t.set(0,.9,0).applyQuaternion(q);rig.position.set(RW.x,St.y+.9,RW.z).sub(c)}}
  const V3t=V3();
  /* ---------- pilote automatique (aperçu) : coupe vers le sillage, pop sur la crête, figure ---------- */
  let apT=0,apDir=1,apTrick=0;
  function auto(){if(gates&&gates.next()){const g=gates.next();const ahead=g.s-(B.s-LR);if(ahead<70&&ahead>-5){const gl=(g.x-B.tx)*B.rx+(g.z-B.tz)*B.rz;const want=gl+(gl>0?-1:1)*0;return {x:clamp((want-St.X)*.5,-1,1),y:0,a:false,g:false}}}
    if(St.air){const t=St.airT;return {x:apTrick===1&&t<.55?apDir:0,y:apTrick===2&&t<.6?-1:apTrick===4&&t<.6?1:0,a:false,g:apTrick===3&&t>.15}}
    const xr=(Math.sqrt(LR*LR-St.X*St.X)-1.6)*TAN+1.1;apT+=1/60;if(St.X*apDir>xr+3.5||apT>6){apDir=-Math.sign(St.X)||1;apT=0;apTrick=Math.floor(Math.random()*5)}
    const d=Math.abs(St.X-(-apDir*0))-xr,near=(St.X*apDir<-xr+1.6&&St.X*apDir>-xr-1)&&Math.abs(St.U)>4;return {x:apDir,y:0,a:St.X*apDir<-xr-.2&&St.X*apDir>-xr-2.8,g:false}}
  return {env,stats,name:'Wakeboard',vScale:55,target:finishT,
    keys:[['← →','carre : traverser le sillage · en l\'air : rotations'],['Espace','maintenir = charger · relâcher sur la crête = pop'],['↑ / ↓','en l\'air : Tantrum / Backroll'],['Shift / F','grab (+ ← = Melon)'],['C','caméra']],
    touch:{u:'Tantrum',d:'Backroll',a:'Pop',g:'Grab'},
    inst:`<div class="ihead">Sillage</div><div class="ro-grid"><div class="ro"><span>Position</span><b id="wkPos">—</b></div><div class="ro"><span>Air</span><b id="wkAir">—</b></div>
      <div class="ro"><span>Meilleure figure</span><b id="wkBest" style="font-size:15px">—</b></div><div class="ro"><span>${course?'Bouées':'Défi'}</span><b id="wkCh" style="font-size:14px">—</b></div></div>
      <div class="barline"><span>Charge</span><div class="bt"><i id="wkBar"></i></div><b id="wkBarV">0%</b></div>`,
    hudUpdate(){const a=$('#wkPos');if(!a)return;const xr=(Math.sqrt(LR*LR-St.X*St.X)-1.6)*TAN+1.1;a.textContent=Math.abs(St.X)<xr-1?'entre les sillages':Math.abs(St.X)<xr+1?'sur la crête':St.X<0?'dehors à gauche':'dehors à droite';
      $('#wkAir').innerHTML=St.air?St.airT.toFixed(1)+'<small>s</small>':'—';$('#wkBest').textContent=stats.best||'—';$('#wkCh').textContent=course?(gates.gates.filter(g=>g.done&&!g.missed).length+' / '+gates.gates.length):wch?wch[0]:'—';
      const b=$('#wkBar');b.style.width=Math.round(St.charge*100)+'%';b.classList.toggle('hot',St.charge>.75);$('#wkBarV').textContent=Math.round(St.charge*100)+'%'},
    prog(){return course&&gates?'Bouée <b>'+Math.min(gates.gates.filter(g=>g.done).length+1,gates.gates.length)+'</b>/'+gates.gates.length+(stats.pen?' · +'+stats.pen+' s':''):''},
    auto,
    update(dt,I){const live=dt>0;tN+=dt;tW+=dt;const ox=RW.x,oz=RW.z;
      if(live){B.s+=VB*dt;if(!LOOP&&B.s>=PL){B.s=PL}}boatUpdate();updateWater(B.x-B.fx*16,B.z-B.fz*16);
      const nS=live?Math.max(1,Math.ceil(dt*60)):1,h=dt/nS;for(let k=0;k<nS;k++){const r=step(h,I,live);if(r){crash(r[0],r[1]);return}}
      riderWorld(RW);if(St.grind){const r=St.grind.r;/* recale exactement sur le slider */}
      orient(I);
      if(gates&&live){const g=gates.check({x:ox,z:oz,y:0},{x:RW.x,z:RW.z,y:St.y});if(g){stats.gates++;ctx.checkpoint(g.i+1,gates.gates.length);ctx.bonus(120,'Bouée '+(g.i+1))}
        /* bouée laissée derrière (le bateau l'a dépassée de 25 m) : manquée, +3 s */const ng=gates.next();if(ng&&B.s-ng.s>LR+14){ng.done=true;ng.missed=true;stats.pen+=3;feed('Bouée '+(ng.i+1)+' manquée · +3 s');toast('+3 s',true);ctx.checkpoint(ng.i+1,gates.gates.length)}
        if(!gates.next()&&B.s>=PL-1){ding(990,.5);return ctx.finish(stats.time+stats.pen)}}
      if(spots)spots.update(tN);
      const sp=Math.hypot(VB,St.U),kmh=sp*3.6;if(live){stats.vmax=Math.max(stats.vmax,kmh);stats.time+=dt;stats.dist+=VB*dt}stats.score+=Math.abs(St.U)*dt*.4;land=Math.max(0,land-dt*2.2);
      /* rider : penché contre la corde, buste vers le bateau ; compression en charge ; tuck/flip en l'air */
      const ps=St.grind?{crouch:.45,lean:.1,twist:1.2,back:.7,spread:.2,side:.3}:St.air?(St.grab?{crouch:1,lean:.4,twist:.9,handDown:1}:St.raley>.1?{crouch:0,lean:-.6,twist:1.2,back:1.2,spread:.1,side:-.4}:{crouch:.7,lean:.2,twist:1,back:.8,spread:.3}):
        {crouch:.4+St.charge*.5+land*.4,lean:-.15-Math.abs(St.edge)*.2,twist:1.15,back:.85,spread:.15,side:.35+St.edge*.25,look:.9};human.pose(ps);
      /* poignée dans les mains + corde jusqu'au mât du bateau */const hp=V3t.set(.35,1.05,-.25).applyQuaternion(rig.quaternion).add(rig.position);rig.handle.position.set(.35,1.05,-.25);
      const ra=ropeG.attributes.position.array;ra[0]=hp.x;ra[1]=hp.y;ra[2]=hp.z;ra[3]=B.tx;ra[4]=2.45;ra[5]=B.tz;ropeG.attributes.position.needsUpdate=true;
      /* gerbes : carre (rooster tail), écume du sillage du bateau */
      if(live&&!St.air&&!St.grind&&Math.abs(St.U)>2.5){sprayT+=dt;if(sprayT>(eco?.05:.016)){sprayT=0;const k=Math.abs(St.U)/8+overdrive()*.5;const sd=Math.sign(St.U);spray.spawn(RW.x-B.fx*.5,St.y+.1,RW.z-B.fz*.5,-B.rx*sd*(1.5+k*2)-B.fx*1.5+(Math.random()-.5),1+Math.random()*1.6*k,-B.rz*sd*(1.5+k*2)-B.fz*1.5+(Math.random()-.5),.8,.95,.98,1)}}
      foamT+=dt;if(foamT>(eco?.08:.03)){foamT=0;for(const sd of [-1,1])foam.spawn(B.sx+B.rx*sd*1.1,.05,B.sz+B.rz*sd*1.1,B.rx*sd*VB*TAN*.9-B.fx*.5,0,B.rz*sd*VB*TAN*.9-B.fz*.5,3.5,.93,.98,.98)}
      spray.update(dt,7,sprayFade);foam.update(dt,0,foamFade);blob.set(RW.x,waterH(RW.x,RW.z),RW.z,St.y-waterH(RW.x,RW.z));
      /* caméra : derrière le rider, cap du bateau ; recul en l'air */
      camYaw+=wrapA(B.h-camYaw)*(live?1-Math.exp(-3*dt):1);human.visible=ctx.cam()!==1;
      if(ctx.cam()===1){camera.position.set(RW.x,St.y+1.6,RW.z);camera.rotation.set(-.05,-camYaw,0,'YXZ')}
      else{const ab=St.air?clamp((St.airT-.15)*2,0,2):0;airCam+=(ab-airCam)*(1-Math.exp(-3*dt));const D=(ctx.cam()===2?16:6.5)+airCam,Hh=(ctx.cam()===2?9:2.6)+airCam*.6;
        camera.position.set(RW.x-Math.sin(camYaw)*D-B.rx*St.X*.12,Math.max(St.y,0)+Hh,RW.z+Math.cos(camYaw)*D-B.rz*St.X*.12);look3.set(RW.x+Math.sin(camYaw)*7,St.y+.9,RW.z-Math.cos(camYaw)*7);camera.lookAt(look3)}
      camera.fov=62+clamp(Math.abs(St.U)*.8,0,8)+overdrive()*4;camera.updateProjectionMatrix();shadowFollow(V3t.set(RW.x,St.y,RW.z));speedLines(0,dt);
      if(ENG&&actx){ENG.g.gain.setTargetAtTime(quiet?0:.035*(S().sfxVol??1),actx.currentTime,.2);ENG.o.frequency.setTargetAtTime(44+VB*1.5,actx.currentTime,.2)}
      sound(St.air?.05:.07+Math.abs(St.U)*.012,St.air?500:700+Math.abs(St.U)*60,.8);if(St.air)surface('air',0,sp);else if(!St.grind)surface('water',.45+Math.abs(St.U)*.06,sp);
      ctx.hud({kmh,mult:St.grind?'Slide':St.air?'Air '+St.airT.toFixed(1)+' s':St.charge>0?'Charge':''},dt)},
    silence(){if(ENG)ENG.g.gain.setTargetAtTime(0,actx.currentTime,.05)},
    attract(dt){az+=dt*.12;rig.visible=false;tW+=dt;camera.position.set(B.x+Math.cos(az)*40,14,B.z+Math.sin(az)*40);camera.lookAt(B.x,0,B.z);camera.fov=60;camera.updateProjectionMatrix();if(ENG)ENG.g.gain.setTargetAtTime(0,actx.currentTime,.1)},
    idle(dt){tW+=dt;spray.update(dt,7,sprayFade);foam.update(dt,0,foamFade);sound(0,300,.6);surface('air',0,0);if(ENG)ENG.g.gain.setTargetAtTime(0,actx.currentTime,.1)},
    snapshot(){return {s:B.s,X:St.X}},
    restore(s){B.s=s.s;St.X=s.X;St.U=0;St.air=false;St.grind=null;St.flip=St.roll=0;St.yawRel=Math.round(St.yawRel/Math.PI)*Math.PI;boatUpdate();updateWater(B.x,B.z);riderWorld(RW);St.y=waterH(RW.x,RW.z)},
    netState(){return {p:[+RW.x.toFixed(2),+St.y.toFixed(2),+RW.z.toFixed(2)],q:rig.quaternion.toArray().map(v=>+v.toFixed(3))}},
    ghost(lk){const o=buildWake(lk);o.human.pose({crouch:.4,lean:-.15,twist:1.15,back:.85,spread:.15,side:.35});const tag=textSprite(lk.name,lk.accent,3);tag.position.y=2.3;o.add(tag);root.add(o);return o},
    overStats(){return [['Figures',stats.tricks||0],['Meilleure figure',stats.best||'—'],['Sauts de sillage / wake to wake',stats.wakeAirs+' / '+stats.w2w],['Plus haut',stats.maxH.toFixed(1)+' m'],course?['Bouées',stats.gates+' / '+cfg.len]:['Slides',stats.slides]]},
    _h:(x,z)=>surfH(x,z),_root:root,_rig:rig,_st:()=>St,_B:()=>B,_park:()=>park,_world(){},
    dispose(){if(ENG){try{ENG.g.gain.value=0;ENG.o.stop();ENG.g.disconnect()}catch(e){}}scene.remove(root);disposeTree(root)}}};
