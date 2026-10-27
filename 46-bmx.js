/* =====================================================================
   BMX FREESTYLE · skatepark modulaire fermé par des quarters
   Physique arcade : vélo posé sur le relief exact (hauteur + normale du module), adhérence forte
   (pas de dérapage), pédalage jusqu'à ~34 km/h, la pente fait le reste. Décollage = sortie de lèvre
   ou bunny hop chargé ; sortie « vert » sur quarter (on retombe dans la courbe, demi-tour de base
   assisté). En l'air : rotations, flips, tailwhip, barspin, tous réellement animés ; réception évaluée
   (axe, flip fini, tailwhip / barspin finis, violence). Grinds sur rails et arêtes de box, manuals
   en équilibre. Le combo commun (×4) relie airs, grinds et manuals.
===================================================================== */
function buildBmx(look){const g=new THREE.Group();const bp=gearOf('bmx',look.gear.bmx);
  const fm=new THREE.MeshPhongMaterial({color:look.bmxCol??look.accent,shininess:70,specular:0x666666}),dk=new THREE.MeshLambertMaterial({color:0x16191d}),ch=new THREE.MeshPhongMaterial({color:0xc9ced4,shininess:90,specular:0x999999}),tyre=new THREE.MeshLambertMaterial({color:0x111214}),rimM=new THREE.MeshLambertMaterial({color:look.wheel??0xf0b84a});
  const V=(x,y,z)=>new THREE.Vector3(x,y,z);const PIV=-.42;
  const frame=new THREE.Group();frame.position.z=PIV;g.add(frame);const front=new THREE.Group();front.position.z=PIV;g.add(front);
  const fr=(a,b,w,m,par)=>{const l=limb(a.clone().setZ(a.z-PIV),b.clone().setZ(b.z-PIV),w,w,m||fm);par.add(l);return l};
  const BB=V(0,.3,.1),HB=V(0,.56,-.38),HT=V(0,.76,-.42),ST=V(0,.66,.26),RA=V(0,.26,.47),FA=V(0,.26,-.5);
  fr(BB,HB,.045,fm,frame);fr(ST,HT,.04,fm,frame);fr(BB,ST,.04,fm,frame);for(const s of [-1,1]){fr(V(s*.05,BB.y,BB.z),V(s*.06,RA.y,RA.z),.025,fm,frame);fr(V(s*.03,ST.y,ST.z),V(s*.06,RA.y,RA.z),.022,fm,frame)}
  const seat=new THREE.Mesh(new THREE.BoxGeometry(.12,.04,.24),dk);seat.position.set(0,.72,.3-PIV);seat.rotation.x=.25;frame.add(seat);
  const crank=new THREE.Group();crank.position.set(0,BB.y,BB.z-PIV);frame.add(crank);for(const s of [-1,1]){const arm=new THREE.Mesh(new THREE.BoxGeometry(.025,.17,.03),ch);arm.position.set(s*.08,-.085*s,0);crank.add(arm);const pd=new THREE.Mesh(new THREE.BoxGeometry(.1,.025,.08),dk);pd.position.set(s*.13,-.17*s,0);crank.add(pd)}
  const sprocket=new THREE.Mesh(new THREE.CylinderGeometry(.075,.075,.012,14),ch);sprocket.rotation.z=Math.PI/2;sprocket.position.set(.055,BB.y,BB.z-PIV);frame.add(sprocket);
  for(const s of [-1,1]){const peg=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,.11,8),ch);peg.rotation.z=Math.PI/2;peg.position.set(s*.11,RA.y,RA.z-PIV);frame.add(peg)}
  function wheel(par,p){const w=new THREE.Group();w.position.set(0,p.y,p.z-PIV);const t=new THREE.Mesh(new THREE.TorusGeometry(.25,.035,6,20),tyre);t.rotation.y=Math.PI/2;w.add(t);
    const rim=new THREE.Mesh(new THREE.TorusGeometry(.215,.012,4,20),rimM);rim.rotation.y=Math.PI/2;w.add(rim);for(let i=0;i<3;i++){const sp=new THREE.Mesh(new THREE.BoxGeometry(.008,.42,.008),ch);sp.rotation.x=i*Math.PI/3;w.add(sp)}
    const hub=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,.12,8),ch);hub.rotation.z=Math.PI/2;w.add(hub);par.add(w);return w}
  const wR=wheel(frame,RA),wF=wheel(front,FA);
  fr(HB,FA,.032,ch,front);fr(HT,HB,.05,fm,front);const stem=V(0,.9,-.4);fr(HT,stem,.04,dk,front);
  const bar=new THREE.Mesh(new THREE.BoxGeometry(.7,.03,.03),dk);bar.position.set(0,.95,-.4-PIV);front.add(bar);for(const s of [-1,1]){const up=new THREE.Mesh(new THREE.BoxGeometry(.03,.14,.03),dk);up.position.set(s*.22,.89,-.4-PIV);front.add(up);const grip=new THREE.Mesh(new THREE.CylinderGeometry(.022,.022,.1,6),new THREE.MeshLambertMaterial({color:look.accent}));grip.rotation.z=Math.PI/2;grip.position.set(s*.32,.95,-.4-PIV);front.add(grip)}
  for(const s of [-1,1]){const peg=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,.11,8),ch);peg.rotation.z=Math.PI/2;peg.position.set(s*.11,FA.y,FA.z-PIV);front.add(peg)}
  const human=buildHuman(look);human.rotation.y=Math.PI/2;human.position.set(0,.33,.04);g.add(human);g.human=human;
  g.bike={frame,front,wR,wF,crank,R:.26};g.phys=bp.phys;return g}

MODES.bmx=function(cfg,look,ctx){
  const P_=cfg.params||{},course=cfg.mode==='course',eco=S().quality==='eco',seedI=strSeed(cfg.seed);const R=rngAt(seedI,3,7);
  const env={fogNear:150,fogFar:560,hemiGround:0x4a3a5a,accent:'#b26bff',cloudY:140,light:.78};
  const root=new THREE.Group();scene.add(root);
  const SZ=[96,124,150][P_.size??1],HS=SZ/2,QL=[3.4,3.9,4.4][P_.height??1],QH=[1.9,2.4,2.9][P_.height??1],JH=[.9,1.2,1.6][P_.height??1];
  const park=makePark({root,top:0xbdb6ad,side:0x6a4fb0,lip:0x2ee6ff,rail:0xff8a2a});
  /* ---------- sol, murs, décor ---------- */
  {const fl=new THREE.Mesh(new THREE.PlaneGeometry(SZ+40,SZ+40),detailMaterial(new THREE.MeshLambertMaterial({color:0x8e8a86}),{amp:.12}));fl.rotation.x=-Math.PI/2;fl.receiveShadow=true;root.add(fl);
   const out=new THREE.Mesh(new THREE.RingGeometry(SZ*.75,900,32,1),new THREE.MeshLambertMaterial({color:0x5f7d4a}));out.rotation.x=-Math.PI/2;out.position.y=-.02;root.add(out);
   /* lignes de sol peintes (repères de vitesse et de direction) */
   const lm=new THREE.MeshBasicMaterial({color:0x8a6bff,transparent:true,opacity:.35,depthWrite:false});for(let i=-2;i<=2;i++){const s=new THREE.Mesh(new THREE.PlaneGeometry(.25,SZ-2*QL-8),lm);s.rotation.x=-Math.PI/2;s.position.set(i*SZ/6,.01,0);root.add(s)}
   /* tribunes et immeubles autour : profondeur, silhouette urbaine */
   const bm=new THREE.MeshLambertMaterial({color:0x3b3550}),wm=new THREE.MeshBasicMaterial({color:0xffc86a});const rr=rngAt(seedI,9,9);
   for(let i=0;i<(eco?14:28);i++){const a=i/(eco?14:28)*Math.PI*2+rr()*.2,d=SZ*.9+rr()*120,h=14+rr()*46,w=14+rr()*18;const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,w),bm);b.position.set(Math.cos(a)*d,h/2,Math.sin(a)*d);b.rotation.y=rr()*3;root.add(b)}
   /* tribunes derrière les quarters (le public voit par-dessus les decks) */
   const stM=new THREE.MeshLambertMaterial({color:0x2b2840});for(const [sx,sz,rot] of [[0,1,0],[0,-1,0],[1,0,1],[-1,0,1]])for(let k=0;k<3;k++){const st=new THREE.Mesh(new THREE.BoxGeometry(rot?2:SZ*.8,QH+.4+k*.9,rot?SZ*.8:2),stM);st.position.set(sx*(HS+1.6+k*2),(QH+.4+k*.9)/2,sz*(HS+1.6+k*2));root.add(st)}
   const crowdN=eco?60:180,cg=new THREE.InstancedMesh(PEOPLE_GEO.b,new THREE.MeshLambertMaterial({color:0xffffff}),crowdN),hg=new THREE.InstancedMesh(PEOPLE_GEO.h,new THREE.MeshLambertMaterial({color:0xd9a77f}),crowdN);
   for(let i=0;i<crowdN;i++){const side=i%4,k=Math.floor(rr()*3),t=(rr()-.5)*SZ*.75,o=HS+1.6+k*2;const x=side<2?t:side===2?o:-o,z=side===0?o:side===1?-o:t;_dv.set(x,QH+.4+k*.9,z);_dq.setFromAxisAngle(_dy,Math.atan2(-x,-z));_ds.set(1,1,1);_dm.compose(_dv,_dq,_ds);cg.setMatrixAt(i,_dm);hg.setMatrixAt(i,_dm);cg.setColorAt(i,new THREE.Color(PEOPLE_COLS[i%PEOPLE_COLS.length]))}
   root.add(cg);root.add(hg)}
  /* périmètre : quarters sur les 4 murs + coins radiaux + blocs d'angle (on ne sort pas du parc) */
  const inner=HS-QL;
  for(const [yaw,ax] of [[0,'n'],[Math.PI/2,'e'],[Math.PI,'s'],[-Math.PI/2,'w']]){const fx=Math.sin(yaw),fz=-Math.cos(yaw),rx=Math.cos(yaw),rz=Math.sin(yaw);const segs=Math.max(2,Math.round(2*inner/12)),W=2*inner/segs;
    for(let i=0;i<segs;i++){const v=-inner+W*(i+.5);park.add('quarter',fx*inner+rx*v,fz*inner+rz*v,yaw,QL,W,QH,{ang:1.18,tag:'quarter'})}}
  for(const [sx,sz] of [[1,-1],[1,1],[-1,1],[-1,-1]]){const a0=Math.atan2(sz,0),a1=Math.atan2(0,sx);let A0=Math.min(a0,a1),A1=Math.max(a0,a1);if(A1-A0>Math.PI){const t=A0;A0=A1;A1=t+2*Math.PI}
    park.addRadial('corner',sx*inner,sz*inner,A0,A1,0,QL,QH,{ang:1.18,L2:QL*1.45});}
  /* modules intérieurs : grille de cases, une « ligne » par case */
  const IN=inner-6,CELLS=SZ<110?3:4,CW=2*IN/CELLS,lines=[];
  const KINDS=['gap','table','box','rail','spine','kicker','bank','gap','table'];
  for(let i=0;i<CELLS;i++)for(let j=0;j<CELLS;j++){const cx=-IN+CW*(i+.5),cz=-IN+CW*(j+.5);if(Math.abs(cx)<CW*.6&&cz>IN-CW*1.2)continue;/* zone de départ dégagée */
    const k=KINDS[Math.floor(R()*KINDS.length)],yaw=[0,Math.PI/2,Math.PI,-Math.PI/2][Math.floor(R()*4)],fx=Math.sin(yaw),fz=-Math.cos(yaw),rx=Math.cos(yaw),rz=Math.sin(yaw);
    const at=(u,v)=>[cx+fx*u+rx*v,cz+fz*u+rz*v];let L0=0;
    if(k==='gap'){const gp=3+R()*2.5,kl=3.2,ll=5.2,tot=kl+gp+ll,[x0,z0]=at(-tot/2,0);park.add('kicker',x0,z0,yaw,kl,3.6,JH,{tag:'kicker'});const [x1,z1]=at(-tot/2+kl+gp,0);park.add('landing',x1,z1,yaw,ll,4,JH,{flat:.6,tag:'landing'});lines.push({k,cx,cz,yaw,x:x0,z:z0,ex:at(tot/2+2,0)})}
    else if(k==='table'){const L=10+R()*3,[x0,z0]=at(-L/2,0);park.add('table',x0,z0,yaw,L,5.5,JH,{up:3.2,flat:L-3.2-4.2,tag:'table'});if(R()<.6){const [rx0,rz0]=at(-L/2+3.4,2.2);park.addRailRaw(rx0,rz0,rx0+fx*(L-3.4-4.4),rz0+fz*(L-3.4-4.4),JH+.35,JH+.35,'rail')}lines.push({k,cx,cz,yaw,x:x0,z:z0,ex:at(L/2+2,0)})}
    else if(k==='box'){const L=7+R()*2,[x0,z0]=at(-L/2,0);park.add('box',x0,z0,yaw,L,1.5,.45,{ramp:.8,tag:'box'});lines.push({k,cx,cz,yaw,x:x0,z:z0,ex:at(L/2+2,0)})}
    else if(k==='rail'){const L=7+R()*3,[x0,z0]=at(-L/2,0);park.addRail(x0,z0,yaw,L,.5,R()<.4?.5:.5);lines.push({k,cx,cz,yaw,x:x0,z:z0,ex:at(L/2+2,0)})}
    else if(k==='spine'){const L=3.1,H=1.6,[x0,z0]=at(-L-.6,0);park.add('quarter',x0,z0,yaw,L+.6,6,H,{ang:1.05,tag:'spine',vert:false});const [x1,z1]=at(L+.6,0);park.add('quarter',x1,z1,yaw+Math.PI,L+.6,6,H,{ang:1.05,tag:'spine',vert:false});lines.push({k,cx,cz,yaw,x:x0,z:z0,ex:at(L+3,0)})}
    else if(k==='kicker'){const [x0,z0]=at(-3,0);park.add('kicker',x0,z0,yaw,3.4,3.4,JH*1.1,{tag:'kicker'});lines.push({k,cx,cz,yaw,x:x0,z:z0,ex:at(6,0)})}
    else{const L=7,[x0,z0]=at(-L/2,0);park.add('bank',x0,z0,yaw,L,5,JH+.3,{up:4.2,tag:'bank'});const [rx0,rz0]=at(-L/2+4.4,-2.4);park.addRailRaw(rx0,rz0,rx0+fx*2.4,rz0+fz*2.4,JH+.3+.4,JH+.3+.4,'rail');lines.push({k,cx,cz,yaw,x:x0,z:z0,ex:at(L/2+2,0)})}}
  park.finalize();const LIM=inner+park.mods[0].L-.35;/* bord extérieur des decks */
  const groundH=(x,z)=>park.H(x,z);
  /* ---------- rider ---------- */
  const rig=buildBmx(look);castAll(rig,true,false);root.add(rig);const human=rig.human,BK=rig.bike;const GP=rig.phys;
  const blob=makeBlob(root,1.4);const dust=makeParticles(eco?40:150,.5,.7,root),dustFade=new THREE.Color(0xd0c8bc);const spark=makeParticles(eco?30:90,.18,1,root),sparkFade=new THREE.Color(0xff6a20);
  const trail=makeTrail(root,{n:90,w:.05,color:0x2a2a2e,fade:0xb9b4ad,opacity:.35,life:4,step:.35,lift:.012,hf:(x,z)=>groundH(x,z)});
  const St={pos:V3(),vel:V3(),yaw:0,air:false,airT:0,spin:0,spinS:0,pitch:0,flipArm:false,whip:null,bar:null,whips:0,bars:0,charge:0,aRel:false,prevA:false,prevG:false,man:null,grind:null,vert:null,hmax:0,takeMod:null,ollieT:0,stun:0,steer:0,crankA:0,lastLand:0,wheelie:0};
  St.pos.set(0,0,IN+4);St.yaw=0;{const v0=5*(ctx.boost?1.25:1);St.vel.set(0,0,-v0)}
  const stats={score:0,dist:0,vmax:0,time:0,airs:0,best:'',bestPts:0,tricks:0,grinds:0,manualT:0,maxManual:0,whips:0,flips:0,maxH:0,gates:0,pen:0};
  const n=V3(0,1,0),nSm=V3(0,1,0),fw=V3(),rgt=V3(),up=V3(),m4=new THREE.Matrix4(),q1=new THREE.Quaternion(),q2=new THREE.Quaternion(),AXX=new THREE.Vector3(1,0,0),tmp=V3(),prev=V3(),look3=V3(),gt=V3(),b=V3();
  const p0=V3(),G=9.81,wrapA=a=>Math.atan2(Math.sin(a),Math.cos(a));let camYaw=0,airCam=0,land=0,az=0,tN=0,tickT=0,sprayT=0;
  const velYaw=()=>Math.atan2(St.vel.x,-St.vel.z),hsp=()=>Math.hypot(St.vel.x,St.vel.z);
  /* ---------- parcours : portes sur les lignes ; monde libre : spots ---------- */
  let gates=null,spots=null,finishT=0;
  if(course){const pool=lines.slice();const list=[];let px=0,pz=IN+4;const K=Math.min(cfg.len,pool.length);let dist=0;
    for(let i=0;i<K;i++){let bi=0,bd=1e9;pool.forEach((l,j)=>{const d=Math.hypot(l.ex[0]-px,l.ex[1]-pz);if(d<bd){bd=d;bi=j}});const l=pool.splice(bi,1)[0];
      list.push({x:l.ex[0],z:l.ex[1],y:0,yaw:l.yaw,hw:3.4,h:5});dist+=bd;px=l.ex[0];pz=l.ex[1]}
    gates=makeGates(root,list,0xb26bff);finishT=dist/7.5+K*2.2+4}
  else spots=makeSpots(root,{rng:rngAt(seedI,4,4),n:2,mods:()=>park.mods.filter(m=>m.tag!=='landing'),ok:m=>!m.radial,pos:m=>({x:m.x+m.fx*m.L/2,y:m.y0+m.H,z:m.z+m.fz*m.L/2}),
    pick:(m,r)=>{const T={kicker:[['360',/\b(360|540|720)\b/],['Tailwhip',/Tailwhip/],['Backflip',/Backflip/]],table:[['Tailwhip',/Tailwhip/],['Barspin',/Barspin/],['360',/\b(360|540|720)\b/]],
      quarter:[['Air 1,5 m',null,1.5],['540',/\b(540|720)\b/]],spine:[['Transfert',/Transfert/]],box:[['Grind sur le box',/Peg|Feeble|Smith|Crooked/]],bank:[['Air',/./]]}[m.tag]||[['Air',/./]];
      const c=T[Math.floor(r()*T.length)];return {label:c[0],bonus:400+Math.round(r()*3)*100,r:8,test:(nm,info)=>c[1]?c[1].test(nm):(info.h||0)>=c[2]}}});
  /* ---------- orientation du rig : axe vélo, flip autour de l'axe des pédales, wheelie autour de la roue arrière ---------- */
  function orient(h){up.copy(St.air||St.grind?nSm.lerp(_Y,1-Math.exp(-4*(h||1))).normalize():nSm.lerp(n,h?1-Math.exp(-18*h):1).normalize());
    fw.set(Math.sin(St.yaw),0,-Math.cos(St.yaw));fw.addScaledVector(up,-fw.dot(up)).normalize();rgt.crossVectors(fw,up).normalize();tmp.copy(fw).negate();m4.makeBasis(rgt,up,tmp);rig.quaternion.setFromRotationMatrix(m4);
    rig.position.copy(St.pos);
    if(St.pitch){q1.setFromAxisAngle(AXX,-St.pitch);rig.quaternion.multiply(q1);tmp.set(0,.55,0).applyQuaternion(rig.quaternion);rig.position.copy(St.pos).addScaledVector(up,.55).sub(tmp)}
    else if(St.wheelie>.01){q1.setFromAxisAngle(AXX,St.wheelie);const pv=V3t.set(0,.0,.47);tmp.copy(pv).applyQuaternion(rig.quaternion);rig.quaternion.multiply(q1);const t2=V3u.copy(pv).applyQuaternion(rig.quaternion);rig.position.add(tmp).sub(t2)}
    BK.frame.rotation.y=St.whip?St.whip.a:0;BK.front.rotation.y=(St.bar?St.bar.a:0)+St.steer*.35}
  const _Y=new THREE.Vector3(0,1,0),V3t=V3(),V3u=V3();
  function takeoff(){St.air=true;St.airT=0;St.spin=0;St.spinS=0;St.pitch=0;St.flipArm=false;St.whip=null;St.bar=null;St.whips=0;St.bars=0;St.aRel=false;St.hmax=0;St.man=null;St.wheelie=0;St.takeMod=HITm;St.takeY=St.pos.y}
  let HITm=null;
  const crash=(t,x)=>{for(let i=0;i<(eco?8:20);i++)dust.spawn(St.pos.x,St.pos.y+.2,St.pos.z,(Math.random()-.5)*4,1+Math.random()*2,(Math.random()-.5)*4,.9,.8,.75,.7);buzz([40,30,60]);ctx.crash(t,x);return true};
  /* ---------- figures en l'air ---------- */
  function airTrick(){const flips=Math.round(Math.abs(St.pitch)/(2*Math.PI)),u0=Math.round(Math.abs(St.spinS)/Math.PI),deg=St.vert?(u0>=3?u0*180:0):u0*180;/* sur quarter : le demi-tour de base est l'« air », puis 540, 900 */const parts=[];
    if(flips)parts.push((flips>1?'Double ':'')+(St.pitch>0?'Backflip':'Frontflip'));if(deg>=180)parts.push(String(deg));
    if(St.whips)parts.push(St.whips>1?'Double tailwhip':'Tailwhip');if(St.bars)parts.push(St.bars>1?'Barspin ×'+St.bars:'Barspin');
    let name=parts.join(' ');if(!name)name=St.vert?(St.hmax>1.8?'Air haut':'Air'):St.airT>.9?'Big air':'Air';if(St.transfer)name+=' · Transfert';
    const pts=Math.round(50*St.airT+St.hmax*40+deg/180*130+flips*480+St.whips*280+St.bars*170+(St.transfer?150:0));return {name,pts,deg,flips}}
  function finishVisualSpins(h,ttg,live){/* tailwhip / barspin : animation réelle, accélérée en fin de vol en mode assisté */
    const ASS=S().sbAssist!==false;for(const k of ['whip','bar']){const w=St[k];if(!w)continue;const dur=k==='whip'?.42/(GP.whip||1):.34;let rate=2*Math.PI/dur;
      if(ASS&&ttg<.3)rate=Math.max(rate,(w.n*2*Math.PI-w.a)/Math.max(.05,ttg-.03));w.a+=rate*h*(w.dir||1);if(Math.abs(w.a)>=w.n*2*Math.PI){if(k==='whip')St.whips++;else St.bars++;St[k]=null;if(live)sfx.whoosh()}}}
  /* ---------- rails ---------- */
  function railTry(live){const near=park.railNear(St.pos.x,St.pos.y,St.pos.z,.5);if(!near)return false;const r=near.r;const hv=hsp();if(hv<1.5)return false;
    const along=(St.vel.x*r.fx+St.vel.z*r.fz)/hv;if(Math.abs(along)<.78)return false;const ok=St.air?(St.vel.y<1&&near.dy>-.25&&near.dy<.45):(near.dy>-.12&&near.dy<.35);if(!ok)return false;
    const dir=Math.sign(along),I=St.lastI||NEUTRAL;const name=r.kind==='ledge'?(I.y<0?'Crooked':I.x?'Smith':'Feeble'):(I.y<0?'Icepick':I.x?'Feeble':'Double peg');
    St.grind={r,s:near.t*r.len,dir,v:hv,t:0,name,fromAir:St.air};St.air=false;St.spin=0;St.pitch=0;St.whip=null;St.bar=null;St.man=null;
    if(live){sfx.crunch();buzz([15]);ctx.keep&&ctx.keep()}return true}
  /* ---------- un pas de physique ---------- */
  function step(h,I,live){St.lastI=I;
    if(St.grind){const g_=St.grind,r=g_.r;g_.v=Math.max(0,g_.v+(-G*r.dy/r.len*g_.dir-.05*G)*h);g_.s+=g_.v*h*g_.dir;g_.t+=h;const t=g_.s/r.len;
      St.pos.set(r.x0+r.dx*t,r.y0+r.dy*t+.06,r.z0+r.dz*t);St.vel.set(r.dx,r.dy,r.dz).multiplyScalar(g_.v*g_.dir/r.len);St.yaw+=wrapA(Math.atan2(r.fx*g_.dir,-r.fz*g_.dir)-St.yaw)*(1-Math.exp(-12*h));n.set(0,1,0);
      const hop=I.a&&!St.prevA;St.prevA=I.a;if(live){surface('road',.8,6);sprayT+=h;if(sprayT>.03){sprayT=0;for(let i=0;i<2;i++)spark.spawn(St.pos.x,St.pos.y-.05,St.pos.z,(Math.random()-.5)*2-St.vel.x*.2,Math.random()*1.5,(Math.random()-.5)*2-St.vel.z*.2,.35,1,.85,.4)}if(ctx.keep)ctx.keep()}
      if(t<0||t>1||g_.v<.5||hop){St.grind=null;const len=g_.t*Math.max(1,g_.v);takeoff();if(hop){St.vel.y+=3.6;St.ollieT=.4;if(live)sfx.whoosh()}
        if(live&&g_.t>.25){stats.grinds++;const m=Math.max(1,Math.round(Math.abs(g_.s-(g_.s0??g_.s))||len));ctx.trick(g_.name+' '+Math.max(1,Math.round(g_.t*g_.v))+' m',90+g_.t*g_.v*28,{hold:true,base:g_.name})}}
      orient(h);return null}
    if(!St.air){const g0=park.ground(St.pos.x,St.pos.z);HITm=g0.m;park.normal(St.pos.x,St.pos.z,n);
      gt.set(0,-G,0).addScaledVector(n,G*n.y);St.vel.addScaledVector(gt,h);St.vel.addScaledVector(n,-St.vel.dot(n));
      let sp=St.vel.length();St.steer+=(I.x-St.steer)*(1-Math.exp(-10*h));
      const tr=clamp(9/Math.max(sp,1.4),.9,3.2)*(GP.turn||1);St.yaw+=St.steer*tr*h*(St.man?.6:1);
      b.set(Math.sin(St.yaw),0,-Math.cos(St.yaw));b.addScaledVector(n,-b.dot(n)).normalize();
      /* adhérence : la vitesse suit l'axe du vélo (avant ou arrière : on peut rouler en arrière après une montée de rampe) */
      if(sp>.2){const fsg=St.vel.dot(b)>=0?1:-1;tmp.copy(b).multiplyScalar(fsg*sp);St.vel.lerp(tmp,1-Math.exp(-9*h))}
      /* pédalage, freins, traînée */
      St.stun-=h;if(I.y>0&&!St.man&&St.charge<=0&&St.stun<=0){const f=St.vel.dot(b);const a=(GP.acc||5)*clamp(1-f/10.5,.15,1);St.vel.addScaledVector(b,a*h);St.crankA+=h*clamp(sp,2,9)*2.2}
      else St.crankA+=0;
      if(I.y<0&&!St.man){const s2=St.vel.length();if(s2>.01)St.vel.multiplyScalar(Math.max(0,s2-7*h)/s2)}
      sp=St.vel.length();const dec=.22+.011*sp*sp;if(sp>1e-3)St.vel.multiplyScalar(Math.max(0,sp-dec*h)/sp);
      /* manual : Shift / F maintenu ; équilibre instable à corriger avec ↑ / ↓ */
      const gEdge=I.g&&!St.prevG;St.prevG=I.g;
      if(gEdge&&!St.man&&sp>2.2&&n.y>.85){St.man={b:(Math.random()-.5)*.3,t:0};if(live)sfx.whoosh()}
      if(St.man){const M=St.man;M.t+=h;M.b+=(M.b*1.35+(Math.random()-.5)*1.2+(St.vel.dot(_Y)>0?.2:0))*h-I.y*2.4*h;St.wheelie+=((.42+M.b*.12)-St.wheelie)*(1-Math.exp(-10*h));
        if(live&&ctx.keep)ctx.keep();
        if(Math.abs(M.b)>1||!I.g||I.y<0&&Math.abs(M.b)>.9){const okM=Math.abs(M.b)<=1;St.man=null;
          if(live){if(okM&&M.t>.6){stats.manualT+=M.t;stats.maxManual=Math.max(stats.maxManual,M.t);ctx.trick('Manual '+M.t.toFixed(1).replace('.',',')+' s',50+M.t*110,{hold:true,base:'Manual'})}
            else if(!okM){toast('Manual perdu',true);if(ctx.comboBreak)ctx.comboBreak();sfx.thud(.3);land=.5}}}}
      else St.wheelie*=Math.exp(-12*h);
      /* bunny hop : maintenir Espace charge, relâcher saute (au bord d'une lèvre = plus haut) */
      St.ollieT-=h;if(I.a){St.charge=Math.min(1,St.charge+h*2)}
      else if(St.charge>0){const c=St.charge;St.charge=0;if(St.ollieT<=0){const onLip=HITm&&!HITm.radial&&(HITm.type==='kicker'||HITm.type==='table'||HITm.type==='bank');St.vel.addScaledVector(n,onLip?1.3+1.7*c:2.5+1.7*c+Math.min(sp,9)*.06);St.ollieT=.4;takeoff();if(live){sfx.whoosh();camShake(.08+c*.08);LOOK.go=Math.max(LOOK.go,.15+c*.2);
        if(c>.75&&HITm&&!HITm.radial&&(HITm.type==='kicker'||HITm.type==='table')&&HIT_U()>HITm.lipU-1)ctx.trick('Pop parfait',100)}}}
      prev.copy(St.pos);St.pos.addScaledVector(St.vel,h);
      if(!St.air){const g=park.ground(St.pos.x,St.pos.z),gy=g.h;
        /* SORTIE VERT : en haut d'un quarter en montant vite → on décolle à la verticale et on retombe dans la courbe */
        if(g.m&&g.m.coping&&g.u>g.m.lipU-.22&&g.u<g.m.lipU+.05&&St.vel.y>2.2){const fx=g.fx,fz=g.fz;const vf=St.vel.x*fx+St.vel.z*fz,lat=V3t.set(St.vel.x-fx*vf,0,St.vel.z-fz*vf);const v=St.vel.length();
          St.vel.set(lat.x*.85-fx*.45,v*.97,lat.z*.85-fz*.45);St.pos.x-=fx*.12;St.pos.z-=fz*.12;St.pos.y=gy+.05;takeoff();St.vert={fx,fz,dir:Math.sign(I.x||((lat.x*-fz+lat.z*fx)>=0?1:-1))||1,m:g.m};if(live){sfx.whoosh();LOOK.go=Math.max(LOOK.go,.2)}}
        else if(gy-St.pos.y>.3&&gy-St.pos.y>Math.abs(St.vel.y*h)*3+.12){/* marche trop haute : flanc de module ou bord de deck → bonk */
          St.pos.copy(prev);const wn=park.wallNormal(g.m,prev.x,prev.z);const imp=wn?-(St.vel.x*wn.x+St.vel.z*wn.z):hsp();if(live&&imp>7.5)return ['Bonk','Flanc de module pris de face à '+Math.round(imp*3.6)+' km/h : arrive dans l\'axe des rampes.'];
          if(wn&&imp>0){St.vel.x+=wn.x*(imp*1.4+1.2);St.vel.z+=wn.z*(imp*1.4+1.2);St.yaw+=wrapA(Math.atan2(St.vel.x,-St.vel.z)-St.yaw)*.5}else{St.vel.x*=-.3;St.vel.z*=-.3}St.vel.multiplyScalar(.85);St.stun=.35;if(live&&imp>1.5){sfx.thud(.3);toast('Bonk !');camShake(.2);if(imp>3&&ctx.comboBreak)ctx.comboBreak();land=.5}}
        else if(gy>=St.pos.y-.02){St.pos.y=gy;park.normal(St.pos.x,St.pos.z,n);const vn=-St.vel.dot(n);if(vn>0)St.vel.addScaledVector(n,vn)}
        else if(St.pos.y-gy<Math.max(.07,hsp()*h*.35)&&St.vel.dot(park.normal(St.pos.x,St.pos.z,V3u))<.7){St.pos.y=gy;park.normal(St.pos.x,St.pos.z,n)}
        else{takeoff();if(live&&HITm&&HITm.type==='kicker')LOOK.go=Math.max(LOOK.go,.15)}}
      /* bornes du parc (garde-corps au bord des decks) */
      const lim=LIM;if(Math.abs(St.pos.x)>lim){St.pos.x=Math.sign(St.pos.x)*lim;St.vel.x*=-.2}if(Math.abs(St.pos.z)>lim){St.pos.z=Math.sign(St.pos.z)*lim;St.vel.z*=-.2}
      if(!St.air&&park.rails.length&&railTry(live)){orient(h);return null}}
    else{/* ---------- EN L'AIR ---------- */
      St.vel.y-=G*.9*h;St.pos.addScaledVector(St.vel,h);St.airT+=h;const gy=groundH(St.pos.x,St.pos.z);St.hmax=Math.max(St.hmax,St.pos.y-Math.max(gy,St.takeY||0));
      if(!I.a&&St.charge>0){if(St.airT<.16){St.vel.y+=2+2.4*St.charge;if(live)sfx.whoosh()}St.charge=0}
      if(!I.a)St.aRel=true;const ASS=S().sbAssist!==false,SENS=S().spinSens||1;const ttg=(St.pos.y-gy)/Math.max(.1,-St.vel.y);
      /* cap d'atterrissage : vers la vitesse horizontale (en sortie vert : vers le bas de la courbe) */
      const hv=hsp(),tgt=St.vert&&hv<1.2?Math.atan2(-St.vert.fx,St.vert.fz):hv>.3?velYaw():St.yaw;
      const sr=5.2*SENS*(GP.spin||1)*clamp((St.airT-.05)/.12,0,1);
      if(I.x!==0&&sr>0&&!(ASS&&ttg<.18)){St.yaw+=I.x*sr*h;St.spin+=Math.abs(I.x)*sr*h;St.spinS+=I.x*sr*h}
      else{/* fin de rotation : on termine le demi-tour vers le cap d'atterrissage dans le sens engagé (sinon le plus court) */
        let d=wrapA(tgt-St.yaw);const dir=Math.sign(St.spinS)||(St.vert?St.vert.dir:0);
        if(dir&&(St.spin>.5||St.vert)&&Math.abs(d)>.01){if(Math.sign(d)!==dir&&Math.abs(d)>.25)d+=dir*2*Math.PI;
          const need=Math.abs(d),rate=ASS?Math.max(3.2,need/Math.max(.12,ttg-.05)):3.4;const st=Math.sign(d)*Math.min(need,rate*h);St.yaw+=st;St.spinS+=st}
        else St.yaw+=d*(1-Math.exp(-3*h))}
      if(I.y===0)St.flipArm=true;const fr=6.4*clamp((St.airT-.1)/.15,0,1);
      if(St.flipArm&&I.y!==0&&fr>0&&!(ASS&&ttg<.2))St.pitch+=-I.y*fr*h;else{const TP=2*Math.PI,fr0=Math.abs(St.pitch)%TP,fwd=fr0>(ASS?.38:.55)*TP;const tg=fwd?Math.sign(St.pitch)*Math.ceil(Math.abs(St.pitch)/TP)*TP:Math.sign(St.pitch)*Math.floor(Math.abs(St.pitch)/TP)*TP;/* flip entamé au-delà de ~140° : il se termine ; sinon il revient */const need=tg-St.pitch;St.pitch+=Math.sign(need)*Math.min(Math.abs(need),(ASS?Math.max(2.2,Math.abs(need)/Math.max(.12,ttg-.04)):2.2)*h)}
      const gE=I.g&&!St.prevG;St.prevG=I.g;if(gE&&St.airT>.08){if(St.whip)St.whip.n++;else St.whip={a:0,n:1,dir:I.x<0?-1:1}}
      const aE=I.a&&!St.prevA&&St.aRel;if(aE&&St.airT>.08){if(St.bar)St.bar.n++;else St.bar={a:0,n:1,dir:1}}
      finishVisualSpins(h,ttg,live);
      if(park.rails.length&&St.vel.y<1&&railTry(live)){St.prevA=I.a;orient(h);return null}
      if(St.pos.y<=gy){const g=park.ground(St.pos.x,St.pos.z);park.normal(St.pos.x,St.pos.z,n);const vn=-St.vel.dot(n),hv2=hsp();
        const off=hv2>1.2?Math.abs(wrapA(velYaw()-St.yaw)):0,fl=Math.abs(St.pitch-Math.round(St.pitch/(2*Math.PI))*2*Math.PI);
        if(live){if(St.whip)return ['Tailwhip pas fini','Le cadre n\'avait pas fini son tour à la réception. Lance le tailwhip plus tôt.'];
          if(St.bar)return ['Barspin pas fini','Le guidon tournait encore à la réception.'];
          if(fl>(ASS?1.05:.75))return ['Réception sur '+(St.pitch>0?'la roue arrière':'la roue avant'),'Flip pas terminé : '+Math.round(fl*57)+'° de trop. Lâche la touche plus tôt.'];
          if(off>(ASS?1.2:.95))return ['Réception de travers','Le vélo était à '+Math.round(off*57)+'° de la trajectoire.'];
          if(vn>13.5)return ['Réception trop violente','Impact à '+vn.toFixed(1)+' m/s : vise la pente de réception plutôt que le plat.']}
        St.pos.y=g.h;St.vel.addScaledVector(n,-St.vel.dot(n));if(hv2>1.2)St.yaw=velYaw();St.vel.multiplyScalar(1-Math.sin(Math.min(off,1.2))*.4-(vn>9?.15:0));
        St.air=false;nSm.copy(n);St.transfer=!!(St.takeMod&&g.m&&g.m!==St.takeMod&&St.takeMod.tag==='spine'&&g.m.tag==='spine');HITm=g.m;const T=airTrick();St.pitch=0;const lq=off<.2&&fl<.2&&vn<8.5?'perfect':off<.55&&vn<10.5?'clean':'sketchy';
        if(live){land=clamp(vn/8,.25,1);human.impact(land*.5);camShake(land*.4);sfx.thud(.25+land*.3);for(let i=0;i<(eco?5:14);i++)dust.spawn(St.pos.x,St.pos.y+.05,St.pos.z,(Math.random()-.5)*3,.4+Math.random()*1.2*land,(Math.random()-.5)*3,.8,.85,.8,.75);
          if(St.airT>.4||T.flips||T.deg||St.whips||St.bars){stats.airs++;stats.maxH=Math.max(stats.maxH,St.hmax);stats.whips+=St.whips;stats.flips+=T.flips;
            const p=ctx.trick(T.name,T.pts,{land:lq,base:T.name.replace(/ · Transfert/,'')});if(T.pts>stats.bestPts){stats.bestPts=T.pts;stats.best=T.name}
            if(spots)spots.test(T.name,{mod:St.takeMod,near:St.pos,h:St.hmax},ctx)}}
        St.vert=null;St.whips=0;St.bars=0}}
    St.prevA=I.a;if(!St.air&&!St.grind)St.prevG=I.g;orient(h);return null}
  function HIT_U(){const l=park.local(HITm,St.pos.x,St.pos.z,{u:0,v:0,fx:0,fz:0});return l?l.u:0}
  /* ---------- pilote automatique (aperçu des menus) : va chercher une ligne, charge, saute, tente une figure ---------- */
  let apT=null,apPhase=0,apTrick=0;
  function auto(){const sp=hsp();/* coincé (contre un module) : petit détour */if(!St.air&&sp<1.2){St.apStuck=(St.apStuck||0)+1/60;if(St.apStuck>1){St.apStuck=0;St.yaw+=Math.PI*.6}}else St.apStuck=0;if(gates&&gates.next()){const g=gates.next();const fx=Math.sin(g.yaw),fz=-Math.cos(g.yaw);const ah=(g.x-St.pos.x)*fx+(g.z-St.pos.z)*fz,lat=(St.pos.x-g.x)*g.cos+(St.pos.z-g.z)*g.sin;let tx,tz;
      if(ah>3&&Math.abs(lat)>2){const k=Math.min(ah*.6,10);tx=g.x-fx*k;tz=g.z-fz*k}else if(ah>-1&&Math.abs(lat)<3){tx=g.x+fx*8;tz=g.z+fz*8}else if(ah>3){tx=g.x;tz=g.z}else{tx=g.x-fx*11;tz=g.z-fz*11}
      if(St.air)return {x:0,y:0,a:false,g:false};const dY=wrapA(Math.atan2(tx-St.pos.x,-(tz-St.pos.z))-St.yaw);return {x:clamp(dY*2.2,-1,1),y:Math.abs(dY)>1.1&&sp>4?-1:sp<7.5?1:0,a:false,g:false}}
    if(!apT||apPhase===2){const l=lines[Math.floor(Math.random()*lines.length)];apT=l;apPhase=0;apTrick=Math.floor(Math.random()*4)}
    const fx=Math.sin(apT.yaw),fz=-Math.cos(apT.yaw);let tx,tz;if(apPhase===0){tx=apT.x-fx*14;tz=apT.z-fz*14;if(Math.hypot(tx-St.pos.x,tz-St.pos.z)<4)apPhase=1}else{tx=apT.x+fx*30;tz=apT.z+fz*30;if((St.pos.x-apT.x)*fx+(St.pos.z-apT.z)*fz>12)apPhase=2}
    const want=Math.atan2(tx-St.pos.x,-(tz-St.pos.z));const dY=wrapA(want-St.yaw);
    if(St.air){const t=St.airT;return {x:apTrick===1&&t<.5?1:0,y:apTrick===2&&t<.55?-1:0,a:false,g:apTrick===3&&t>.1&&t<.18}}
    const toLip=(apT.x-St.pos.x)*fx+(apT.z-St.pos.z)*fz;
    return {x:clamp(dY*2.2,-1,1),y:Math.abs(dY)>1.1&&sp>4?-1:sp<8.5?1:0,a:apPhase===1&&toLip<2.5&&toLip>-2,g:false}}
  return {env,stats,name:'BMX',vScale:45,target:course?finishT:0,
    keys:[['↑ / ↓','pédaler / freiner · en l\'air : flips'],['← →','tourner · en l\'air : rotations'],['Espace','maintenir = charger · relâcher = bunny hop · en l\'air : barspin'],['Shift / F','manual au sol · tailwhip en l\'air'],['C','caméra']],
    touch:{u:'Pédaler',d:'Freiner',a:'Saut'},
    inst:`<div class="ihead">Ligne</div><div class="ro-grid"><div class="ro"><span>Air</span><b id="bAir">—</b></div><div class="ro"><span>Hauteur</span><b id="bH">—</b></div>
      <div class="ro"><span>Meilleure figure</span><b id="bBest" style="font-size:15px">—</b></div><div class="ro"><span>Grinds</span><b id="bGr">0</b></div></div>
      <div class="barline"><span id="bLbl">Saut</span><div class="bt"><i id="bBar"></i></div><b id="bBarV">0%</b></div>`,
    hudUpdate(){const a=$('#bAir');if(!a)return;a.innerHTML=St.air?St.airT.toFixed(1)+'<small>s</small>':'—';$('#bH').innerHTML=St.air?Math.max(0,St.hmax).toFixed(1)+'<small>m</small>':stats.maxH?stats.maxH.toFixed(1)+'<small>m max</small>':'—';
      $('#bBest').textContent=stats.best||'—';$('#bGr').textContent=stats.grinds;const bar=$('#bBar'),lb=$('#bLbl'),v=$('#bBarV');
      if(St.man){lb.textContent='Équilibre';const x=clamp(St.man.b,-1,1);bar.style.width=Math.round((x+1)*50)+'%';bar.classList.toggle('hot',Math.abs(x)>.7);v.textContent=Math.abs(x)>.7?(x>0?'↑ !':'↓ !'):'ok'}
      else{lb.textContent='Saut';bar.style.width=Math.round(St.charge*100)+'%';bar.classList.toggle('hot',St.charge>.75);v.textContent=Math.round(St.charge*100)+'%'}},
    prog(){return course&&gates?'Porte <b>'+Math.min(gates.gates.filter(g=>g.done).length+1,gates.gates.length)+'</b>/'+gates.gates.length:''},
    auto,
    press(code){},
    update(dt,I){const live=dt>0;tN+=dt;p0.copy(St.pos);
      const nS=live?Math.max(1,Math.ceil(dt*60)):1,h=dt/nS;for(let k=0;k<nS;k++){const r=step(h,I,live);if(r){crash(r[0],r[1]);return}}
      if(gates&&live){const g=gates.check(p0,St.pos);if(g){stats.gates++;ctx.checkpoint(g.i+1,gates.gates.length);ctx.bonus(150,'Porte '+(g.i+1));if(!gates.next()){ding(990,.5);return ctx.finish(stats.time)}}}
      if(spots)spots.update(tN);
      const sp=St.vel.length(),kmh=sp*3.6;if(live){stats.vmax=Math.max(stats.vmax,kmh);stats.time+=dt;stats.dist+=Math.hypot(St.pos.x-p0.x,St.pos.z-p0.z)}
      stats.score+=Math.hypot(St.pos.x-p0.x,St.pos.z-p0.z)*.15;land=Math.max(0,land-dt*2.4);
      /* rider : pédalage, compression, tuck en l'air, manual penché en arrière */
      const ped=!St.air&&!St.man&&!St.grind&&I.y>0;St.crankA+=ped?dt*clamp(sp,2,9)*2.2:0;BK.crank.rotation.x=-St.crankA;
      const rollW=sp*dt/BK.R*(St.air?0:1);BK.wR.rotation.x-=rollW;BK.wF.rotation.x-=rollW*(St.wheelie>.2?0:1);
      const ps=St.charge>0&&!St.air?{crouch:.55+St.charge*.45,lean:.6,back:.85,spread:.12,stance:0,look:0}:St.grind?{crouch:.55,lean:.45,back:.85,spread:.15,stance:0,side:.15}:St.man?{crouch:.25,lean:-.35,back:1.05,spread:.08,stance:0}:
        St.air?{crouch:St.whip||St.bar?.85:.65,lean:.4,back:St.bar?.3:.85,spread:St.bar?.9:.15,stance:0,look:0}:{crouch:.35+land*.4,lean:.55,back:.85,spread:.12,stance:0,turn:-St.steer*.4,side:St.steer*.15};
      human.pose(ps);human.gait(ped?.35:0,St.crankA,true);
      const gyB=groundH(St.pos.x,St.pos.z);blob.set(St.pos.x,gyB,St.pos.z,St.pos.y-gyB);
      if(live)trail.push(St.pos.x,gyB,St.pos.z,Math.cos(St.yaw),Math.sin(St.yaw),!St.air&&!St.grind);trail.update(dt);dust.update(dt,3,dustFade);spark.update(dt,9,sparkFade);
      if(live&&!St.air&&I.y<0&&sp>4){sprayT+=dt;if(sprayT>.05){sprayT=0;dust.spawn(St.pos.x,St.pos.y+.05,St.pos.z,(Math.random()-.5),.3,(Math.random()-.5),.6,.85,.8,.75)}}
      /* caméra : derrière le cap du vélo ; en sortie vert elle ne se retourne pas ; recul en l'air */
      const hv=hsp();if(!St.air&&hv>1.5){const vy=St.vel.dot(fw)>=0?St.yaw:St.yaw+Math.PI;camYaw+=wrapA(vy-camYaw)*(live?1-Math.exp(-4*dt):1)}else if(St.air&&!St.vert&&hv>3)camYaw+=wrapA(velYaw()-camYaw)*(live?1-Math.exp(-2*dt):1);
      human.visible=ctx.cam()!==1;
      if(ctx.cam()===1){camera.position.copy(St.pos).addScaledVector(up,1.55);camera.rotation.set(-.2,-camYaw,0,'YXZ')}
      else{const ab=St.air?clamp((St.airT-.15)*2.5,0,2.2):0;airCam+=(ab-airCam)*(1-Math.exp(-3*dt));const D=(ctx.cam()===2?14:5.2)+airCam,Hh=(ctx.cam()===2?8:2.3)+airCam*.6;
        camera.position.set(St.pos.x-Math.sin(camYaw)*D,Math.max(St.pos.y,0)+Hh-land*.3,St.pos.z+Math.cos(camYaw)*D);const gc=groundH(camera.position.x,camera.position.z);if(camera.position.y<gc+1)camera.position.y=gc+1;
        look3.set(St.pos.x+Math.sin(camYaw)*4,St.pos.y+.8,St.pos.z-Math.cos(camYaw)*4);camera.lookAt(look3)}
      camera.fov=62+clamp((sp-5)*1.4,0,14)+overdrive()*4;camera.updateProjectionMatrix();shadowFollow(St.pos);speedLines(clamp((sp-9)/6,0,1)*.6,dt);
      /* son : pneus sur béton, roue libre qui cliquette, grind métallique */
      sound(St.air?.08:clamp(sp/10,0,1)*.12,St.air?600:300+sp*40,.8);if(St.air)surface('air',0,sp);else if(!St.grind)surface('road',clamp(sp/9,0,1)*.55,sp*1.6);
      if(live&&!St.air&&!ped&&sp>2){tickT+=dt*sp;if(tickT>2.4){tickT=0;burst('highpass',5200,1.5,.03,.05)}}
      ctx.hud({kmh,mult:St.grind?St.grind.name:St.man?'Manual '+St.man.t.toFixed(1)+' s':St.air?'Air '+St.airT.toFixed(1)+' s':''},dt)},
    attract(dt){az+=dt*.15;rig.visible=false;camera.position.set(Math.cos(az)*SZ*.45,9,Math.sin(az)*SZ*.45);camera.lookAt(0,0,0);camera.fov=60;camera.updateProjectionMatrix();sound(0,300,.6)},
    idle(dt){dust.update(dt,3,dustFade);spark.update(dt,9,sparkFade);trail.update(dt);sound(0,300,.6);surface('air',0,0);speedLines(0,dt)},
    snapshot(){return {p:St.pos.clone(),yaw:St.yaw}},
    restore(s){trail.clear();St.grind=null;St.man=null;St.air=false;St.pitch=0;St.whip=null;St.bar=null;St.vert=null;St.pos.copy(s.p);St.pos.y=groundH(s.p.x,s.p.z);St.yaw=s.yaw;St.vel.set(Math.sin(s.yaw)*3,0,-Math.cos(s.yaw)*3)},
    netState(){return {p:[+St.pos.x.toFixed(2),+St.pos.y.toFixed(2),+St.pos.z.toFixed(2)],q:rig.quaternion.toArray().map(v=>+v.toFixed(3))}},
    ghost(lk){const o=buildBmx(lk);o.human.pose({crouch:.35,lean:.55,back:.85,spread:.12,stance:0});const tag=textSprite(lk.name,lk.accent,3);tag.position.y=2.4;o.add(tag);root.add(o);return o},
    overStats(){return [['Figures',stats.tricks||0],['Meilleure figure',stats.best||'—'],['Plus haut',stats.maxH.toFixed(1)+' m'],['Grinds / manual max',stats.grinds+' / '+stats.maxManual.toFixed(1)+' s'],['Combo max','×'+String(stats.comboMax||1).replace('.',',')]]},
    _h:groundH,_root:root,_rig:rig,_st:()=>St,_park:()=>park,_lines:()=>lines,_world(){},
    dispose(){scene.remove(root);disposeTree(root)}}};
