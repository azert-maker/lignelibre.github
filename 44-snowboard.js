/* =====================================================================
   SNOWBOARD FREERIDE · glisse sur le relief, carving limité à 0,9 g, sauts et figures
   Le rider suit EXACTEMENT les triangles de la neige affichée (hauteur + normale)
   Collisions : spatule/talon/tête/mains contre relief et sapins (cônes)
===================================================================== */
function buildSnowboard(look){const g=new THREE.Group();
  const board=new THREE.Mesh(new THREE.BoxGeometry(.29,.03,1.56),new THREE.MeshLambertMaterial({color:look.deck}));board.position.y=.015;g.add(board);
  for(const z of [-.78,.78]){const tip=new THREE.Mesh(new THREE.BoxGeometry(.27,.03,.14),board.material);tip.position.set(0,.05,z+(z>0?.05:-.05));tip.rotation.x=z>0?-.45:.45;g.add(tip)}
  const bm=new THREE.MeshLambertMaterial({color:0x15191e});for(const z of [-.24,.24]){const b=new THREE.Mesh(new THREE.BoxGeometry(.24,.06,.12),bm);b.position.set(0,.06,z);g.add(b)}
  const human=buildHuman(look);human.position.y=.03;g.add(human);g.human=human;return g}
const SB_HIT=[[0,.03,-.8],[0,.03,.8],[0,1.65,0],[0,1.0,-.3],[0,1.0,.3],[0,.05,-.4],[0,.05,0],[0,.05,.4],[0,.55,0]].map(v3);// spatule, talon, tête, mains, planche (3 pts), genoux
MODES.snowboard=function(cfg,look,ctx){
  const P_=cfg.params||{};const course=cfg.mode==='course';
  if(typeof glbLoad==='function')glbLoad('snowpark');/* modules de snowpark : chargés en tâche de fond, utilisés dès qu'ils sont prêts */
  const env={fogNear:120,fogFar:640,hemiGround:0x55657a,accent:'#2b8cff',cloudY:160,light:.62,tint:PLACE_TINT.snowboard};
  const eco=S().quality==='eco';const seedI=strSeed(cfg.seed);const root=new THREE.Group();scene.add(root);
  let gates=[],finishZ=null;
  /* ---------- PARK : tremplins (kickers) et rails ----------
     Hauteur EXACTE d'un kicker = terrain + profil échantillonné (KN points, les mêmes que le mesh affiché).
     Rails : segment droit, on monte dessus en arrivant aligné (comme une box) ou en retombant dessus. */
  const kickers=[],rails=[];const KL=7,KW=4.4,KH=1.55,KN=12,KPROF=[];for(let i=0;i<=KN;i++){const u=i/KN;KPROF.push(KH*u*u)}
  const kTop=new THREE.MeshLambertMaterial({color:0xcfdcea}),kSide=new THREE.MeshLambertMaterial({color:0x2b8cff}),rMat=new THREE.MeshPhongMaterial({color:0xffc23a,shininess:80,specular:0x887755}),lipMat=new THREE.MeshBasicMaterial({color:0xff4a3a}),legMat=new THREE.MeshLambertMaterial({color:0x2a2f36});
  lipMat.userData.shared=kTop.userData.shared=kSide.userData.shared=rMat.userData.shared=legMat.userData.shared=true;
  function buildKicker(x,z,yaw,g){const fx=Math.sin(yaw),fz=-Math.cos(yaw),rx=Math.cos(yaw),rz=Math.sin(yaw);const k={x,z,fx,fz,rx,rz};
    const P=(u,v)=>{const X=x+fx*u+rx*v,Z=z+fz*u+rz*v;return [X,Z]};const top=[],idx=[];
    for(let i=0;i<=KN;i++){const u=i/KN*KL;for(const v of [-KW/2,0,KW/2]){const [X,Z]=P(u,v);top.push(X,V.groundH(X,Z)+KPROF[i]+.005,Z)}}
    for(let i=0;i<KN;i++)for(let j=0;j<2;j++){const a=i*3+j,b2=a+1,c=a+3,d=c+1;idx.push(a,c,b2,b2,c,d)}
    const tg=new THREE.BufferGeometry();tg.setAttribute('position',new THREE.Float32BufferAttribute(top,3));tg.setIndex(idx);tg.computeVertexNormals();const tm=new THREE.Mesh(tg,kTop);tm.receiveShadow=true;g.add(tm);
    const sp=[],si=[];const quad=(p0,p1,p2,p3)=>{const o=sp.length/3;sp.push(...p0,...p1,...p2,...p3);si.push(o,o+1,o+2,o,o+2,o+3)};
    for(const v of [-KW/2,KW/2])for(let i=0;i<KN;i++){const [X0,Z0]=P(i/KN*KL,v),[X1,Z1]=P((i+1)/KN*KL,v);const g0=V.groundH(X0,Z0),g1=V.groundH(X1,Z1);quad([X0,g0-.3,Z0],[X1,g1-.3,Z1],[X1,g1+KPROF[i+1],Z1],[X0,g0+KPROF[i],Z0])}
    {const [Xa,Za]=P(KL,-KW/2),[Xb,Zb]=P(KL,KW/2);const ga=V.groundH(Xa,Za),gb=V.groundH(Xb,Zb);quad([Xa,ga-.3,Za],[Xb,gb-.3,Zb],[Xb,gb+KH,Zb],[Xa,ga+KH,Za])}
    {const [Xa,Za]=P(KL-.06,-KW/2),[Xb,Zb]=P(KL-.06,KW/2);const ga=V.groundH(Xa,Za)+KH,gb=V.groundH(Xb,Zb)+KH;const lip=new THREE.Mesh(new THREE.BoxGeometry(KW,.06,.14),lipMat);lip.position.set((Xa+Xb)/2,(ga+gb)/2+.02,(Za+Zb)/2);lip.rotation.y=-yaw;g.add(lip)}
    const sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.Float32BufferAttribute(sp,3));sg.setIndex(si);sg.computeVertexNormals();const sm=new THREE.Mesh(sg,kSide);sm.material.side=THREE.DoubleSide;g.add(sm);
    return k}
  function buildRail(x,z,yaw,g){const fx=Math.sin(yaw),fz=-Math.cos(yaw),L=10;const x1=x+fx*L,z1=z+fz*L;const y0=V.groundH(x,z)+.32,y1=V.groundH(x1,z1)+.5;
    const r={x0:x,y0,z0:z,dx:x1-x,dy:y1-y0,dz:z1-z,len:Math.hypot(x1-x,y1-y0,z1-z),hl:Math.hypot(x1-x,z1-z),fx,fz,rx:Math.cos(yaw),rz:Math.sin(yaw),yaw};
    /* rail de snowpark fourni (Blender) s'il est chargé, sinon rail procédural ; même hauteur de glisse */
    const src=GLB.models.snowpark&&GLB.models.snowpark.scene.getObjectByName('sp_rail');
    if(src){const o=src.clone(true),u=src.userData||{};o.rotation.order='YXZ';o.rotation.set(Math.atan2(r.dy,r.hl),-yaw,0);o.scale.set(1.2,.37/(u.h||1.005),r.len/(u.len||6.841));
      o.position.set(x+r.dx/2,y0+r.dy/2-.37,z+r.dz/2);o.traverse(n=>{n.userData.shared=true;if(n.isMesh)n.castShadow=true});g.add(o);return r}
    const bar=new THREE.Mesh(new THREE.BoxGeometry(.14,.1,r.len),rMat);bar.position.set(x+r.dx/2,y0+r.dy/2-.035,z+r.dz/2);bar.lookAt(x1,y1-.035,z1);bar.castShadow=true;g.add(bar);
    for(const t of [.08,.5,.92]){const lx=x+r.dx*t,lz=z+r.dz*t,ly=y0+r.dy*t,gy=V.groundH(lx,lz);const leg=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,ly-gy+.2,6),legMat);leg.position.set(lx,(ly+gy-.2)/2-.05,lz);g.add(leg)}
    return r}
  /* DÉCOR : télésiège le long de la piste (pylônes percutables comme les sapins, câbles, sièges qui défilent) */
  const LIFT_SP=80,liftSide=seedI%2?1:-1,liftMat=new THREE.MeshLambertMaterial({color:0x4a5059}),chairMat=new THREE.MeshLambertMaterial({color:0x2b8cff}),cableMat=new THREE.LineBasicMaterial({color:0x22262b});
  liftMat.userData.shared=chairMat.userData.shared=cableMat.userData.shared=true;const towerGeo=new THREE.CylinderGeometry(.28,.4,11,7),barGeo=new THREE.BoxGeometry(4.2,.25,.3);
  function pylon(i){const z=-20-i*LIFT_SP,x=V.cx(z)+liftSide*(V.vw(z)*.7+8);return {x,z,y:V.groundH(x,z)}}
  function liftTop(i,out){const P=pylon(i),Q=pylon(i+1);out.x=P.x;out.y=P.y+11;out.z=P.z;out.dx=Q.x-P.x;out.dz=Q.z-P.z;const n=Math.hypot(out.dx,out.dz)||1;out.dx/=n;out.dz/=n;out.q=Q;return out}
  const NCH=eco?12:30,rodM=new THREE.InstancedMesh(new THREE.BoxGeometry(.06,2,.06).translate(0,-1,0),liftMat,NCH),seatM=new THREE.InstancedMesh(new THREE.BoxGeometry(1.2,.12,.55).translate(0,-2,0),chairMat,NCH),backM=new THREE.InstancedMesh(new THREE.BoxGeometry(1.2,.55,.07).translate(0,-1.75,.26),chairMat,NCH);
  for(const m of [rodM,seatM,backM]){m.frustumCulled=false;root.add(m)}
  const _lt={},_lt2={};
  function animLift(){const tn=performance.now()/1000,ip=Math.floor((-St.pos.z-20)/LIFT_SP);let n=0;
    for(let i=Math.max(0,ip-1);i<=ip+3&&n<NCH;i++){liftTop(i,_lt);liftTop(i+1,_lt2);
      for(const sd of [-1,1])for(let c=0;c<3&&n<NCH;c++,n++){const u=(((tn*.05*sd+c/3)%1)+1)%1,px=-_lt.dz*1.8*sd,pz=_lt.dx*1.8*sd;
        _dv.set(lerp(_lt.x,_lt2.x,u)+px,lerp(_lt.y,_lt2.y,u)-Math.sin(Math.PI*u)*1.3,lerp(_lt.z,_lt2.z,u)+pz);_dq.setFromAxisAngle(_dy,Math.atan2(-_lt.dx,-_lt.dz)+(sd>0?0:Math.PI));_ds.set(1,1,1);_dm.compose(_dv,_dq,_ds);
        rodM.setMatrixAt(n,_dm);seatM.setMatrixAt(n,_dm);backM.setMatrixAt(n,_dm)}}
    for(const m of [rodM,seatM,backM]){m.count=n;m.instanceMatrix.needsUpdate=true}}
  function segD(px,pz,ax,az,bx,bz){const vx=bx-ax,vz=bz-az,t=clamp(((px-ax)*vx+(pz-az)*vz)/(vx*vx+vz*vz),0,1);return Math.hypot(px-ax-vx*t,pz-az-vz*t)}
  function kb(x,z){let best=0;for(const k of kickers){const dx=x-k.x,dz=z-k.z,u=dx*k.fx+dz*k.fz;if(u<0||u>KL)continue;const v=dx*k.rx+dz*k.rz;if(Math.abs(v)>KW/2)continue;
      const f=u/KL*KN,i=Math.min(KN-1,Math.floor(f)),hh=KPROF[i]+(KPROF[i+1]-KPROF[i])*(f-i);if(hh>best)best=hh}return best}
  const flagR=new THREE.MeshLambertMaterial({color:0xd23c3c}),flagB=new THREE.MeshLambertMaterial({color:0x2b6cff});flagR.userData.shared=flagB.userData.shared=true;
  const poleGeo=new THREE.CylinderGeometry(.03,.03,1.8,6);poleGeo.translate(0,.9,0);const flagGeo=new THREE.PlaneGeometry(.7,.45);
  const V=makeValley({seedI,root,SL:[.20,.28,.36][P_.slope??1],W0:45,relief:[.7,1,1.35][P_.relief??1],trees:true,treeDensity:[.5,1,1.6][P_.trees??1],treeSpread:40,treeClear:14,palette:'snow',bumps:[0,7,13][P_.bumps??1],towers:.6,clearPiste:true,
    onChunk(k,chunk,g,R){const CH=160,z0=-k*CH;whistlerChunk(V,k,g,R,eco);
      if(course&&k>=1&&k<=cfg.len){const z=z0-80,c=V.cx(z)+((k%2)?1:-1)*(5+R()*6),ry=-V.yawAt(z),half=4;const gg=new THREE.Group();const m=k%2?flagR:flagB;
        for(const s of [-1,1]){const pole=new THREE.Mesh(poleGeo,m);pole.userData.shared=true;pole.position.x=s*half;gg.add(pole);const f=new THREE.Mesh(flagGeo,m);f.userData.shared=true;f.position.set(s*half+s*.36,1.55,0);gg.add(f)}
        const y=V.groundH(c,z);gg.position.set(c,y,z);gg.rotation.y=ry;g.add(gg);
        for(const s of [-1,1]){const px=c+Math.cos(ry)*s*half,pz=z-Math.sin(ry)*s*half;gg.children[s<0?0:2].position.y=V.groundH(px,pz)-y}
        const gt={k,x:c,z,cos:Math.cos(ry),sin:Math.sin(ry),half,done:false};chunk.extra.push(gt);gates.push(gt)}
      if(k>=1&&P_.park!==false){// un tremplin et un rail par tronçon, hors des portes
        const zk=z0-(k%2?28:135),yk=-V.yawAt(zk)*-1,ck=V.cx(zk)+(R()*2-1)*9;const fl=(x,z)=>{const nn=V.groundN(x,z,V3());return Math.hypot(nn.x,nn.z)>.05?Math.atan2(nn.x,-nn.z):V.yawAt(z)};// axe = ligne de pente locale
        const kk=buildKicker(ck,zk,fl(ck,zk),g);chunk.extra.push(kk);kickers.push(kk);
        const zr=z0-(k%2?125:30),cr=V.cx(zr)+(R()*2-1)*9;const rr=buildRail(cr,zr,fl(cr,zr),g);chunk.extra.push(rr);rails.push(rr);
        const inst=g.children.find(o=>o.isInstancedMesh);if(inst){const m0=new THREE.Matrix4().makeScale(0,0,0);chunk.trees.forEach((t,i)=>{if(segD(t.x,t.z,kk.x-kk.fx*16,kk.z-kk.fz*16,kk.x+kk.fx*(KL+12),kk.z+kk.fz*(KL+12))<KW/2+4||segD(t.x,t.z,rr.x0-rr.fx*14,rr.z0-rr.fz*14,rr.x0+rr.fx*22,rr.z0+rr.fz*22)<5){inst.setMatrixAt(i,m0);t.gone=true}});inst.instanceMatrix.needsUpdate=true;chunk.trees=chunk.trees.filter(t=>!t.gone)}}
      for(let i=Math.max(0,Math.ceil((-z0-20)/LIFT_SP));-20-i*LIFT_SP>z0-CH;i++){const T=liftTop(i,{});const tw=new THREE.Mesh(towerGeo,liftMat);tw.position.set(T.x,T.y-5.5,T.z);g.add(tw);
        const bar=new THREE.Mesh(barGeo,liftMat);bar.position.set(T.x,T.y,T.z);bar.rotation.y=Math.atan2(-T.dx,-T.dz)+Math.PI/2;g.add(bar);
        for(const sd of [-1,1]){const pts=[];const px=-T.dz*1.8*sd,pz=T.dx*1.8*sd,Q=T.q;for(let u=0;u<=1.001;u+=1/8)pts.push(new THREE.Vector3(lerp(T.x,Q.x,u)+px,lerp(T.y,Q.y+11,u)-Math.sin(Math.PI*u)*1.3,lerp(T.z,Q.z,u)+pz));
          g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),cableMat))}
        chunk.trees.push({x:T.x,y:T.y-11.5,z:T.z,r:.45,h:26})}
      if(course&&k===cfg.len+1){finishZ=z0-80;g.add(finishArch(V.cx(finishZ),V.groundH(V.cx(finishZ),finishZ)-1,finishZ,-V.yawAt(finishZ),14,10))}},
    onDrop(k,c){gates=gates.filter(t=>!c.extra.includes(t));for(const A of [kickers,rails])for(let i=A.length-1;i>=0;i--)if(c.extra.includes(A[i]))A.splice(i,1)}});
  const {cx,yawAt,CH}=V;const groundT=V.groundH;
  function groundH(x,z){return groundT(x,z)+(kickers.length?kb(x,z):0)}
  function groundN(x,z,out){if(kickers.length&&kb(x,z)>0){const e=.08,hx=(groundH(x+e,z)-groundH(x-e,z))/(2*e),hz=(groundH(x,z+e)-groundH(x,z-e))/(2*e);return out.set(-hx,1,-hz).normalize()}return V.groundN(x,z,out)}const V3Y=new THREE.Vector3(0,1,0);
  const rig=buildSnowboard(look);castAll(rig,true,false);root.add(rig);const human=rig.human;const hw=SB_HIT.map(()=>V3());
  const spray=makeParticles(eco?36:140,.6,.8,root);const sprayFade=new THREE.Color(0xdfe8f2);
  /* Neige : traces de carre (ruban posé sur les triangles affichés), ombre blob, compression à la réception.
     L'inclinaison sur la carre est appliquée AVANT le calcul des points de collision : la hitbox suit le visuel. */
  const trail={push(){},update(){},clear(){}};// remplacé par la neige profonde déformable
  const DEPTH=.32,deep=makeDeepSnow(root,{groundH,depth:DEPTH,depthAt:(x,z)=>kickers.length&&kb(x,z)>0?.02:DEPTH});
  const powder=makeParticles(eco?24:130,2.8,.36,root),powderFade=new THREE.Color(0xe8f0f8);let powT=0,freshV=1;
  function powderBurst(x,y,z,n,spd){for(let i=0;i<n;i++){const a=Math.random()*6.28,r=spd*(.4+Math.random()*.6);powder.spawn(x,y+.2,z,Math.cos(a)*r,1+Math.random()*spd*.5,Math.sin(a)*r,1.8,.97,.98,1)}}
  const blob=makeBlob(root,1.5);let rollS=0,land=0;const qR=new THREE.Quaternion(),AZ=new THREE.Vector3(0,0,1);
  const wv=WIND[cfg.wind|0].v,wa=(seedI%628)/100;
  const St={charge:0,aRel:false,prevA:false,ttg:9,pos:V3(),vel:V3(),yaw:yawAt(-20),air:false,spin:0,spinS:0,flip:0,flipArm:false,grab:false,grabT:0,airT:0,airMax:0,grind:null};
  St.pos.set(cx(-20),0,-20);V.updateChunks(St.pos.z,true);St.pos.y=groundH(St.pos.x,St.pos.z);
  {const v0=13*(ctx.boost?1.2:1);St.vel.set(Math.sin(St.yaw)*v0,0,-Math.cos(St.yaw)*v0)}
  const n=V3(),b=V3(),side=V3(),gt=V3(),dir=V3(),tgt=V3(),prev=V3(),look3=V3(),up=V3(),m4=new THREE.Matrix4(),rgt=V3(),fw=V3(),bk=V3(),tmpQ=new THREE.Quaternion();
  const stats={score:0,dist:0,vmax:0,time:0,airs:0,best:'',pen:0,gates:0,maxAir:0,tricks:0,rails:0,grabs:0};let airCam=0,tipT=0,tipN=load('ll3_sbtut',0);let camYaw=St.yaw,az=-10,skidT=0,ollieT=0,sprayT=0,lastX=0;const nSm=V3(0,1,0);nSm.set(0,1,0);
  /* anneau sous le rider en l'air : l'arc montre la rotation en cours, la couleur annonce la réception
     (vert = propre, orange = limite, rouge = chute) ; jauge de charge du saut dans le panneau */
  const ringM=new THREE.Mesh(new THREE.RingGeometry(1.0,1.16,48,1),new THREE.MeshBasicMaterial({color:0x7ee08a,transparent:true,opacity:.8,depthWrite:false,side:THREE.DoubleSide}));ringM.rotation.x=-Math.PI/2;ringM.visible=false;ringM.renderOrder=3;root.add(ringM);
  function ringFx(){if(!St.air||St.airT<.12){ringM.visible=false;return}ringM.visible=true;ringM.position.set(St.pos.x,St.pos.y+.12,St.pos.z);
    const ASS=S().sbAssist!==false,off=Math.abs(nearestAxis(velYaw())),fo=Math.abs(St.flip-Math.round(St.flip/(2*Math.PI))*2*Math.PI),lo=ASS?1.45:1.3,lf=ASS?1.2:.9;
    ringM.material.color.setHex(off<.45&&fo<.45?0x7ee08a:off<lo*.85&&fo<lf*.85?0xffb000:0xff5a4f);
    const pr=Math.abs(St.spinS)%(2*Math.PI)/(2*Math.PI);ringM.geometry.setDrawRange(0,Math.abs(St.spinS)>.3?Math.max(6,Math.round(pr*48)*6):48*6)}
  const crash=(t,x)=>{deep.crater(St.pos.x,St.pos.z,1.1);powderBurst(St.pos.x,St.pos.y,St.pos.z,eco?10:26,4);ding(90,.7);buzz([40,30,60]);ctx.crash(t,x)};
  function trickName(rot,grab){const deg=Math.round(rot/Math.PI)*180;let s=deg>=180?deg+'':'';if(grab)s=(s?s+' ':'')+'grab';return s||'Air'}
  function orient(h){up.copy(St.air?nSm.lerp(V3Y,1-Math.exp(-3*(h||1))).normalize():nSm.lerp(n,h?1-Math.exp(-20*h):1).normalize());fw.set(Math.sin(St.yaw),0,-Math.cos(St.yaw));fw.addScaledVector(up,-fw.dot(up)).normalize();
    rgt.crossVectors(fw,up).normalize();bk.copy(fw).negate();m4.makeBasis(rgt,up,bk);rig.quaternion.setFromRotationMatrix(m4).multiply(qR.setFromAxisAngle(AZ,rollS));
    if(St.flip){rig.quaternion.multiply(qF.setFromAxisAngle(AX,-St.flip));tmpV.set(0,.85,0).applyQuaternion(rig.quaternion);rig.position.copy(St.pos).addScaledVector(up,.85).sub(tmpV)}else rig.position.copy(St.pos);rig.updateMatrixWorld();
    for(let i=0;i<SB_HIT.length;i++)hw[i].copy(SB_HIT[i]).applyMatrix4(rig.matrixWorld)}
  orient();
  /* ---------- PHYSIQUE SNOWBOARD ----------
     Sol : gravité projetée sur le triangle affiché, frottement neige + traînée v².
     Carving : la vitesse suit la planche dans la limite d'adhérence (CARVE m/s²). Si la planche tourne plus vite,
     elle dérape (perte de vitesse, gerbe) au lieu de faire chuter ; sans action, la planche s'aligne seule sur la trajectoire.
     Relief qui monte : rampe (on garde la vitesse tangente), chute seulement si on tape une vraie paroi.
     Air : petite auto-stabilisation sans touche ; réception pardonnée jusqu'à 75° (planche recalée dans l'axe). */
  const CARVE=9.5,G=9.81;let lastEdge=0;const wrapA=a=>Math.atan2(Math.sin(a),Math.cos(a));
  function velYaw(){return Math.atan2(St.vel.x,-St.vel.z)}
  function nearestAxis(yv){const d=wrapA(yv-St.yaw);return Math.abs(d)<=Math.PI/2?d:wrapA(d+Math.PI)}// écart à l'axe (avant ou switch)
  function takeoff(){St.air=true;St.spin=0;St.spinS=0;St.flip=0;St.flipArm=false;St.airT=0;St.grab=false;St.grabT=0;St.aRel=false}
  const AX=new THREE.Vector3(1,0,0),qF=new THREE.Quaternion(),tmpV=V3();
  function railYawOff(r){const d=wrapA(r.yaw-St.yaw);return Math.abs(d)<=Math.PI/2?d:wrapA(d+Math.PI)}
  /* montée sur un rail : aligné (≤ 35°), à la bonne hauteur, en avançant */
  function railCheck(live,h){for(const r of rails){const px=St.pos.x-r.x0,pz=St.pos.z-r.z0,t=(px*r.dx+pz*r.dz)/(r.hl*r.hl);const lat=px*r.rx+pz*r.rz;
      if(t>-.8&&t<0&&Math.abs(lat)<2.5){const hv0=Math.hypot(St.vel.x,St.vel.z)||1;if((St.vel.x*r.dx+St.vel.z*r.dz)/r.hl/hv0>.88){const k=1-Math.exp(-5*h);St.pos.x-=r.rx*lat*k;St.pos.z-=r.rz*lat*k}}// aimant d'approche
      if(t<0||t>1)continue;if(Math.abs(lat)>.8)continue;const yr=r.y0+r.dy*t,dyp=St.pos.y-yr;
      const hv=Math.hypot(St.vel.x,St.vel.z)||1,vAl=(St.vel.x*r.dx+St.vel.z*r.dz)/r.hl;
      const ok=vAl>2&&vAl/hv>.62&&(St.air?(St.vel.y<1.5&&dyp<.35&&dyp>-.5):(dyp>-.6&&dyp<.3));
      if(ok){St.grind={r,s:t*r.len,v:vAl*r.len/r.hl,t:0};St.air=false;if(live){sfx.crunch();buzz([15])}return}
      if(!St.air&&dyp<.22&&Math.abs(lat)<.3){const sd=Math.sign(lat)||1;St.pos.x+=r.rx*sd*(.32-Math.abs(lat));St.pos.z+=r.rz*sd*(.32-Math.abs(lat));St.vel.multiplyScalar(.75);if(live){toast('Rail !');sfx.thud(.25)}}}}
  function airTrick(){const flips=Math.round(Math.abs(St.flip)/(2*Math.PI)),spinU=Math.round(Math.abs(St.spinS)/Math.PI),deg=spinU*180;const parts=[];
    if(flips)parts.push((flips>1?'Double ':'')+(St.flip>0?'frontflip':'backflip'));if(deg>=180)parts.push((St.spinS>0?'FS ':'BS ')+deg);
    if(St.grab)parts.push(St.grabT>.8?'Method':flips?'Tail grab':spinU>=2?'Mute':'Indy');
    let name=parts.join(' ')||'Air';name=name[0].toUpperCase()+name.slice(1);
    return {name,pts:Math.round(60*St.airT+spinU*120+flips*420+(St.grab?80+St.grabT*60:0)),spinU,flips}}
  function step(h,I,live){
    if(St.grind){const g_=St.grind,r=g_.r;g_.v=Math.max(0,g_.v+(-G*r.dy/r.len-.07*G)*h);g_.s+=g_.v*h;g_.t+=h;const t=g_.s/r.len;
      St.pos.set(r.x0+r.dx*t,r.y0+r.dy*t,r.z0+r.dz*t);St.vel.set(r.dx,r.dy,r.dz).multiplyScalar(g_.v/r.len);n.set(0,1,0);St.yaw+=I.x*1.6*h;ollieT-=h;
      const off=(I.y>0||(I.a&&!St.prevA))&&ollieT<=0&&g_.t>.2;St.prevA=I.a;if(live)surface('road',.9,9);
      if(t>=1||g_.v<.6||off){const name=Math.abs(railYawOff(r))>.7?'Boardslide':'50-50',len=g_.s;St.grind=null;takeoff();St.pos.y+=.03;if(off){St.vel.y+=4.2;ollieT=.6}
        if(live&&len>1.5){stats.rails=(stats.rails||0)+1;ctx.trick(name+' '+Math.round(len)+' m',100+len*30)}}
      if(live){sprayT+=h;if(sprayT>.05){sprayT=0;spray.spawn(St.pos.x,St.pos.y,St.pos.z,(Math.random()-.5),.8,(Math.random()-.5),.4,1,.85,.5)}}
      orient(h);return null}
    if(!St.air){groundN(St.pos.x,St.pos.z,n);
      gt.set(0,-G,0).addScaledVector(n,G*n.y);St.vel.addScaledVector(gt,h);St.vel.addScaledVector(n,-St.vel.dot(n));
      let sp=St.vel.length();const skid=I.y>0&&sp>3;
      St.yaw+=I.x*(skid?2.6:clamp(CARVE*1.3/Math.max(sp,1),.9,2.4))*h;
      b.set(Math.sin(St.yaw),0,-Math.cos(St.yaw));b.addScaledVector(n,-b.dot(n)).normalize();
      let scrub=0;lastEdge=0;
      if(sp>.3){dir.copy(St.vel).divideScalar(sp);const fwdSign=dir.dot(b)>=0?1:-1;tgt.copy(b).multiplyScalar(fwdSign);
        const ang=Math.acos(clamp(dir.dot(tgt),-1,1)),amax=skid?3:I.x?CARVE:1.6,stp=Math.min(ang,amax/Math.max(sp,1)*h);
        if(ang>1e-4){dir.lerp(tgt,stp/ang).normalize();St.vel.copy(dir).multiplyScalar(sp)}
        lastEdge=clamp(Math.abs(I.x)*sp*sp/(CARVE*Math.max(6,sp))*.9,0,1);
        // la planche revient dans l'axe de la trajectoire (fort sans touche, léger en virage, pas en dérapage volontaire)
        const dy=nearestAxis(velYaw()),kAl=skid?0:I.x?1.4:4.5;St.yaw+=dy*(1-Math.exp(-kAl*h));
        const dy2=nearestAxis(velYaw());if(!skid&&Math.abs(dy2)>1.0)St.yaw+=dy2-Math.sign(dy2)*1.0;// jamais plus de 57° en travers sans freiner
        scrub=Math.abs(nearestAxis(velYaw()));if(scrub>.25&&sp>5)lastEdge=1}
      freshV=deep.fresh(St.pos.x,St.pos.z);
      const dec=.035*G*n.y+(I.y<0?.0026:.0036)*sp*sp+.0009*sp*sp*freshV+(skid?5+Math.abs(I.x)*1.5:0)+scrub*scrub*6;
      if(sp>1e-3)St.vel.multiplyScalar(Math.max(0,sp-dec*h)/sp);
      if(wv)St.vel.x+=Math.cos(wa)*wv*.02*h,St.vel.z+=Math.sin(wa)*wv*.02*h;
      sp=St.vel.length();ollieT-=h;
      if(I.y>0&&sp<=3)St.vel.addScaledVector(b,2.6*h);// poussée pour repartir à l'arrêt
      /* SAUT charge / relâche : maintenir Espace fléchit les jambes (jauge), relâcher = pop ∝ charge + vitesse.
         Relâcher pile au bord d'un tremplin bien chargé = « Pop parfait ». */
      if(I.a)St.charge=Math.min(1,St.charge+h*1.7);
      else if(St.charge>0){const c=St.charge;St.charge=0;if(ollieT<=0&&sp>2){const lip=kickers.length&&kb(St.pos.x,St.pos.z)>KH*.5;St.vel.addScaledVector(n,3+4.4*c+sp*.05);ollieT=.5;takeoff();
          if(live){sfx.whoosh();camShake(.1+c*.1);LOOK.go=Math.max(LOOK.go,.2+c*.25);if(c>.75&&lip)ctx.trick('Pop parfait',120)}}}
      St.pos.addScaledVector(St.vel,h);const gy=groundH(St.pos.x,St.pos.z);
      if(!St.air){
        if(gy>=St.pos.y){groundN(St.pos.x,St.pos.z,n);const vn=-St.vel.dot(n);
          if(vn>16&&live)return ['Impact','Paroi prise de face à '+Math.round(St.vel.length()*3.6)+' km/h : contourne les rochers.'];
          if(vn>0){St.vel.addScaledVector(n,vn);if(vn>4){St.vel.multiplyScalar(clamp(1-(vn-4)*.04,.5,1));if(live){land=Math.max(land,clamp(vn/14,.2,.8));sfx.thud(.25)}}}St.pos.y=gy}
        else if(St.pos.y-gy<Math.max(.06,sp*h*.1))St.pos.y=gy;
        else{takeoff();if(kickers.length&&kb(St.pos.x-St.vel.x*h*2,St.pos.z-St.vel.z*h*2)>.4)St.vel.addScaledVector(n,.8)}}// petit pop auto en sortie de tremplin
      if(rails.length)railCheck(live,h);if(St.grind){orient(h);return null}
      if(!St.air){deep.stamp(St.pos.x,St.pos.z,Math.sin(St.yaw),-Math.cos(St.yaw),1.56,.17,1);
        // poudreuse : nuage projeté vers l'extérieur du virage, panache léger derrière en neige fraîche
        if(live&&freshV>.4&&sp>6){powT+=h;const turn=lastEdge>.35||I.a,rate=turn?(eco?.07:.022):(eco?.2:.07);if(powT>rate){powT=0;const sd=-(Math.sign(I.x)||1),k=turn?2.5+sp*.15:.6;
          for(let i=0;i<(turn?2:1);i++)powder.spawn(St.pos.x+(Math.random()-.5)*.6,St.pos.y+.15,St.pos.z+(Math.random()-.5)*.6,rgt.x*sd*k*(.6+Math.random()*.6)+St.vel.x*.25,.8+Math.random()*(turn?2.2:.8),rgt.z*sd*k*(.6+Math.random()*.6)+St.vel.z*.25,turn?1.9:1.2,.97,.98,1)}}}
      if(live&&(I.a||lastEdge>.6)&&sp>5){sprayT+=h;if(sprayT>.03){sprayT=0;for(let i=0;i<3;i++)spray.spawn(St.pos.x,St.pos.y+.1,St.pos.z,(Math.random()-.5)*2-b.x*1.5,1+Math.random()*1.5,(Math.random()-.5)*2-b.z*1.5,.8,1,1,1)}}}
    else{St.vel.y-=G*.85*h;const sp=St.vel.length();St.vel.multiplyScalar(1-.0015*sp*h);St.pos.addScaledVector(St.vel,h);St.airT+=h;// gravité « arcade » : un peu plus de temps en l'air
      if(!I.a&&St.charge>0){if(St.airT<.18){St.vel.y+=2+3.4*St.charge;if(live)sfx.whoosh()}St.charge=0}// relâché juste après le bord : pop tardif toléré
      if(!I.a)St.aRel=true;const ASS=S().sbAssist!==false,SENS=S().spinSens||1;
      const sr=5.4*SENS*clamp((St.airT-.06)/.14,0,1);if(I.x!==0&&sr>0){St.yaw+=I.x*sr*h;St.spin+=Math.abs(I.x)*sr*h;St.spinS+=I.x*sr*h}
      else if(St.spin>.6&&(Math.abs(St.spinS)%Math.PI)>.3*Math.PI&&(Math.abs(St.spinS)%Math.PI)<.96*Math.PI){const rem=Math.abs(St.spinS)%Math.PI,dd=Math.sign(St.spinS)*Math.min(Math.PI-rem,6.5*h);St.yaw+=dd;St.spinS+=dd}// auto-complete : finit le demi-tour entamé
      else{const dy=nearestAxis(velYaw()),dd=dy*(1-Math.exp(-(St.spin>.6?3.2:2.5)*h));St.yaw+=dd;if(St.spin>.6&&Math.sign(dd)===Math.sign(St.spinS))St.spinS+=dd}// sans touche : la rotation finit sur le 180 le plus proche
      // flips : ↑ frontflip, ↓ backflip (il faut relâcher la touche après le saut) ; sans touche la rotation se termine seule
      if(I.y===0)St.flipArm=true;const fr=8*clamp((St.airT-.12)/.15,0,1);
      if(St.flipArm&&I.y!==0&&fr>0)St.flip+=I.y*fr*h;else{const tg=Math.round(St.flip/(2*Math.PI))*2*Math.PI;St.flip+=(tg-St.flip)*(1-Math.exp(-2.2*h))}
      if(I.g||(I.a&&St.aRel)){St.grab=true;St.grabT+=h}// grab : Shift / F / gâchettes, ou ré-appui sur Espace en l'air
      const gy=groundH(St.pos.x,St.pos.z);St.airMax=Math.max(St.airMax,St.pos.y-gy);
      /* assistance : dans le dernier quart de seconde avant le sol, la planche se recale (rotation et flip finissent proprement) */
      const ttg=(St.pos.y-gy)/Math.max(.1,-St.vel.y);St.ttg=ttg;if(ASS&&ttg<.25&&St.vel.y<0){const k=1-Math.exp(-9*h),dy=nearestAxis(velYaw());St.yaw+=dy*k;if(Math.sign(dy)===Math.sign(St.spinS))St.spinS+=dy*k;
        const tg=Math.round(St.flip/(2*Math.PI))*2*Math.PI;St.flip+=(tg-St.flip)*k}
      if(St.pos.y<=gy){groundN(St.pos.x,St.pos.z,n);const vn=-St.vel.dot(n),off=Math.abs(nearestAxis(velYaw()));
        if(live&&vn>14)return ['Réception trop violente','Impact à '+vn.toFixed(1)+' m/s : vise une pente qui descend pour réceptionner.'];
        const ASS2=S().sbAssist!==false,fo=Math.abs(St.flip-Math.round(St.flip/(2*Math.PI))*2*Math.PI);if(live&&fo>(ASS2?1.2:.9))return ['Réception sur la tête','Rotation pas terminée : '+Math.round(fo*57)+'° de trop. Lâche la touche plus tôt, la fin de rotation est assistée.'];
        if(live&&off>(ASS2?1.45:1.3)&&St.airT>.5)return ['Réception de travers','La planche était à '+Math.round(off*57)+'° de la trajectoire à l\'atterrissage (75° max).'];
        St.pos.y=gy;St.vel.addScaledVector(n,-St.vel.dot(n));St.yaw+=nearestAxis(velYaw());St.vel.multiplyScalar(1-Math.sin(off)*.35);St.air=false;nSm.copy(n);
        /* qualité de réception : axe de la planche, rotation finie, violence de l'impact */const lq=off<.22&&fo<.2&&vn<9?'perfect':off<.65&&fo<.5&&vn<11.5?'clean':'sketchy';
        if(live&&St.airT>.3){land=clamp(vn/9,.25,1);ctx.land(lq,{k:land,pos:St.pos,n,human,air:St.airT,trick:St.airT>.5});deep.crater(St.pos.x,St.pos.z,.45+land*.5);powderBurst(St.pos.x,St.pos.y,St.pos.z,eco?6:Math.round(10+land*16),2+land*3);sfx.crunch();for(let i=0;i<(eco?6:16);i++)spray.spawn(St.pos.x,St.pos.y+.1,St.pos.z,(Math.random()-.5)*4,1+Math.random()*2*land,(Math.random()-.5)*4,.9,1,1,1)}
        if(St.airT>.5&&live){const T=airTrick();stats.airs++;if(St.grab)stats.grabs=(stats.grabs||0)+1;stats.maxAir=Math.max(stats.maxAir,St.airMax);
          if(!stats.bestPts||T.pts>stats.bestPts){stats.bestPts=T.pts;stats.best=T.name}ctx.trick(T.name,T.pts,{land:lq})}
        St.flip=0;
        St.airMax=0}
      if(St.air&&rails.length){railCheck(live,h);if(St.grind){orient(h);return null}}}
    St.prevA=I.a;orient(h);
    if(live){if(hw[2].y<groundH(hw[2].x,hw[2].z)+.05)return ['Chute','La tête a touché la pente.'];
      if(V.treeHit(hw,.12,St.pos))return ['Collision','Sapin ou pylône de télésiège percuté.']}
    return null}
  /* pièces : ligne de pente (dans ta trajectoire), arc cyan au-dessus d'un tremplin ou le long d'un rail, ligne cyan hors-piste au bord des sapins */
  const coinPlan=(()=>{let zc=null,k=0;return {r:1.3,cy:.8,scale:1.3,every:.25,life:22,behind:25,cull:260,
    spawn(api,p){if(zc===null)zc=p.z-45;if(zc<p.z-115)return;const pat=k++%3,off=clamp(p.x-V.cx(p.z),-V.vw(p.z)*.7,V.vw(p.z)*.7)*.7;let done=false;
      if(pat===1){const kk=kickers.find(q=>q.z<zc+25&&q.z>zc-80&&q.z<p.z-35);
        if(kk){const lx=kk.x+kk.fx*KL,lz=kk.z+kk.fz*KL,gl=V.groundH(lx,lz)+KH;const app=[];for(const d of [-9,-5])app.push([kk.x+kk.fx*d,V.groundH(kk.x+kk.fx*d,kk.z+kk.fz*d)+.8,kk.z+kk.fz*d]);api.line(app,false);
          for(const [d,h] of [[3,1.9],[6.5,2.5],[10,2.2]])api.add(lx+kk.fx*d,gl+h,lz+kk.fz*d,true);done=true;zc=Math.min(zc,lz)-70}
        else{const rr=rails.find(q=>q.z0<zc+25&&q.z0>zc-80&&q.z0<p.z-30);if(rr){for(const t of [.15,.4,.65,.9])api.add(rr.x0+rr.dx*t,rr.y0+rr.dy*t+.62,rr.z0+rr.dz*t,true);done=true;zc=Math.min(zc,rr.z0+rr.dz)-70}}}
      if(!done&&pat===2){const sd=k%2?1:-1;for(let i=0;i<3;i++){const z=zc-i*8,x=V.cx(z)+sd*V.vw(z)*.85;api.add(x,V.groundH(x,z)+.8,z,true)}done=true;zc-=95}
      if(!done){for(let i=0;i<5;i++){const z=zc-i*7,x=V.cx(z)+off+Math.sin(i*.9)*1.2;api.add(x,V.groundH(x,z)+.8,z,false)}zc-=95}}}})();
  return {env,stats,name:'Snowboard',vScale:120,coins:coinPlan,target:course?((cfg.len+1.5)*CH)/16:0,
    keys:[['Espace','maintenir = charger · relâcher = saut'],['← →','carver · en l\'air : rotations'],['Shift / F','grab en l\'air (ou ré-appui Espace)'],['↑ / ↓','frein / tuck · en l\'air : flips'],['C','caméra']],
    touch:{u:'Frein',d:'Tuck',a:'Saut',g:'Grab'},
    inst:`<div class="ihead">Ride</div><div class="ro-grid"><div class="ro"><span>Pente</span><b id="iSl">0<small>°</small></b></div><div class="ro"><span>Air</span><b id="iAir">—</b></div>
      <div class="ro"><span>Meilleure figure</span><b id="iBest" style="font-size:15px">—</b></div><div class="ro"><span>Sauts</span><b id="iAirs">0</b></div></div>
      <div class="barline"><span>Carre</span><div class="bt"><i id="iEdge"></i></div><b id="iEdgeV">0%</b></div>`,
    hudUpdate(d){const s=$('#iSl');if(!s)return;s.innerHTML=Math.round(Math.acos(clamp(n.y,0,1))*57.3)+'<small>°</small>';
      $('#iAir').innerHTML=St.air?St.airT.toFixed(1)+'<small>s</small>':'—';$('#iBest').textContent=stats.best||'—';$('#iAirs').textContent=stats.airs;
      const e=$('#iEdge'),ch=St.charge>0&&!St.air;e.style.width=(clamp(ch?St.charge:d.edge||0,0,1)*100)+'%';e.classList.toggle('hot',ch?St.charge>.75:(d.edge||0)>.95);$('#iEdgeV').textContent=ch?'saut '+Math.round(St.charge*100)+'%':Math.round((d.edge||0)*100)+'%'},
    prog(){return course?'Porte <b>'+Math.min(stats.gates+stats.pen/3+1,cfg.len)+'</b>/'+cfg.len+(stats.pen?' · +'+stats.pen+' s':''):''},
    auto(){const z=St.pos.z-30;let tx=cx(z)+Math.sin(z*.03)*8;const gtn=gates.find(g=>!g.done&&g.z<St.pos.z);if(gtn&&St.pos.z-gtn.z<60)tx=gtn.x;
      // démo : évite les sapins sur ~28 m devant
      let tz=z;{const fx=Math.sin(St.yaw),fz=-Math.cos(St.yaw),rx=Math.cos(St.yaw),rz=Math.sin(St.yaw);let best=null;const kc=Math.floor(-St.pos.z/CH);
        for(let k=kc;k<=kc+1;k++){const c=V.chunks.get(k);if(!c)continue;for(const tr of c.trees){const dx=tr.x-St.pos.x,dz=tr.z-St.pos.z,ah=dx*fx+dz*fz,lat=dx*rx+dz*rz;
          if(ah>1&&ah<28&&Math.abs(lat)<tr.r+2.2&&(!best||ah<best.ah))best={ah,lat}}}
        if(best){const sd=best.lat>0?-1:1;tx=St.pos.x+fx*15+rx*6*sd;tz=St.pos.z+fz*15+rz*6*sd}}
      const want=Math.atan2(tx-St.pos.x,-(tz-St.pos.z));let dY=want-St.yaw;dY=Math.atan2(Math.sin(dY),Math.cos(dY));const sp=St.vel.length();
      return {x:St.air?0:clamp(dY*2.5,-1,1),y:St.air?0:sp>21?1:sp<15?-1:0,a:false}},
    update(dt,I){const live=dt>0;prev.copy(St.pos);V.updateChunks(St.pos.z,false);
      /* Physique en sous-pas de 1/60 s max : même comportement à 20 ou 144 images/s */
      const nS=live?Math.max(1,Math.ceil(dt*60)):1,h=dt/nS;let edge=0;
      for(let k=0;k<nS;k++){const r=step(h,I,live);if(r)return crash(r[0],r[1]);edge=Math.max(edge,lastEdge)}
      /* anti-blocage : arrêté au pied d'un kicker ou dans un creux (moins de 4 km/h pendant 1,2 s au sol),
         le rider repart tout seul dans la ligne de pente (comme un rider qui sautille pour se relancer) */
      if(live&&!St.air&&!St.grind){if(St.vel.length()<1.1)St.stuckT=(St.stuckT||0)+dt;else St.stuckT=0;
        if(St.stuckT>1.2){St.stuckT=0;const e=1.5,gx=groundT(St.pos.x+e,St.pos.z)-groundT(St.pos.x-e,St.pos.z),gz=groundT(St.pos.x,St.pos.z+e)-groundT(St.pos.x,St.pos.z-e);
          let dx=-gx,dz=-gz;const L_=Math.hypot(dx,dz)||1;dx/=L_;dz/=L_;if(dz>-.3){const tx=cx(St.pos.z-20)-St.pos.x;dx=Math.sign(tx)*.5;dz=-.87}
          const kb_=groundH(St.pos.x+dx*3,St.pos.z+dz*3)-groundH(St.pos.x,St.pos.z);if(kb_>.5){const tx=cx(St.pos.z-20)-St.pos.x;dx=Math.sign(tx||1)*.8;dz=-.6}
          St.vel.set(dx*5,0,dz*5);St.yaw=Math.atan2(dx,-dz);toast('Relance',true);if(sfx.pump)sfx.pump(true)}}
      const sp0=St.vel.length();
      rollS+=((St.air?0:-I.x*(I.a?.12:.32)*clamp(sp0/10,0,1))-rollS)*(live?1-Math.exp(-7*dt):1);land=Math.max(0,land-dt*2.2);
      for(const g of gates){if(g.done)continue;const lzP=-(prev.x-g.x)*g.sin+(prev.z-g.z)*g.cos,lz=-(St.pos.x-g.x)*g.sin+(St.pos.z-g.z)*g.cos;
        if((lzP>0&&lz<=0)||(lzP<0&&lz>=0)){g.done=true;const lx=(St.pos.x-g.x)*g.cos+(St.pos.z-g.z)*g.sin;
          if(Math.abs(lx)<g.half){stats.gates++;if(live){ctx.bonus(200,'Porte '+g.k);ctx.checkpoint(g.k,cfg.len);ding(760)}}else if(live){stats.pen+=3;feed('Porte '+g.k+' manquée · +3 s');toast('+3 s',true)}}}
      if(course&&finishZ!==null&&prev.z>finishZ&&St.pos.z<=finishZ&&live){ding(990,.5);return ctx.finish(stats.time+stats.pen)}
      const sp=St.vel.length(),kmh=sp*3.6;if(live){stats.vmax=Math.max(stats.vmax,kmh);stats.time+=dt}
      const d=Math.hypot(St.pos.x-prev.x,St.pos.z-prev.z);if(live)stats.dist+=d;stats.score+=d*.3*Math.max(1,sp/12);
      const ps=!St.air&&St.charge>0?{crouch:.55+St.charge*.45,lean:.35,twist:.7,spread:.25+St.charge*.2,look:.5}:St.grind?{crouch:.5,spread:1,twist:.85,look:.3}:St.air&&St.airT>.15&&Math.abs(St.flip%(2*Math.PI))>.4?{crouch:1,lean:.5,twist:.6,back:.8}:St.air&&St.airT>.15?(St.grab?{crouch:1,lean:.4,twist:.6,handDown:1}:{crouch:.6,lean:.2,twist:.6,spread:.8}):I.a?{crouch:.55,lean:-.3,twist:.4,spread:.5}:I.y<0?{crouch:.9,lean:.8,twist:.8,back:.6}:{crouch:.45,lean:.25,twist:.7,spread:.35};
      if(land>0)ps.crouch=Math.min(1,ps.crouch+land*.2);ps.spread=(ps.spread||0)+Math.abs(rollS)*.8;if(!St.air){ps.turn=I.x*.55;ps.side=-rollS*.5}human.pose(ps);
      const gyB=groundH(St.pos.x,St.pos.z);blob.set(St.pos.x,gyB,St.pos.z,St.pos.y-gyB,n);
      if(live)trail.push(St.pos.x,gyB,St.pos.z,rgt.x,rgt.z,!St.air);trail.update(dt);
      spray.update(dt,5,sprayFade);deep.update(St.pos.x,St.pos.z);animLift();ringFx();
      if(live&&!St.air&&St.charge>.2&&Math.random()<St.charge*.6)spray.spawn(St.pos.x,St.pos.y+.05,St.pos.z,(Math.random()-.5)*1.5,.3+Math.random()*.6,(Math.random()-.5)*1.5,.5,1,1,1);
      /* mini tutoriel des 3 premières descentes : charge, figures, réception */
      if(live&&tipN<3){tipT+=dt;const T=[['Maintiens Espace pour charger, relâche pour sauter (au bord d\'un tremplin = plus haut)',3],['En l\'air : ← → pour tourner, ↑ ↓ pour flipper, Shift ou F pour grab',10],['L\'anneau sous toi : vert = réception propre, rouge = chute',17]];
        for(let i=0;i<T.length;i++)if(tipT>T[i][1]&&tipT-dt<=T[i][1])toast(T[i][0],true);if(tipT>18&&tipT-dt<=18){tipN++;save('ll3_sbtut',tipN)}}powder.update(dt,1.1,powderFade);
      const vy=Math.atan2(St.vel.x,-St.vel.z);if(sp>1)camYaw+=Math.atan2(Math.sin(vy-camYaw),Math.cos(vy-camYaw))*(live?1-Math.exp(-3*dt):1);human.visible=ctx.cam()!==1;
      if(ctx.cam()===1){camera.position.copy(St.pos).addScaledVector(up,1.55);camera.rotation.set(-.25,-camYaw,0,'YXZ')}
      else{const ab=St.air?clamp((St.airT-.2)*2.5,0,3):0;airCam+=(ab-airCam)*(1-Math.exp(-3*dt));const D=(ctx.cam()===2?16:5.5)+airCam,Hh=(ctx.cam()===2?7:2.3)+airCam*.5;camera.position.set(St.pos.x-Math.sin(camYaw)*D,St.pos.y+Hh+V.SL*D-land*.35,St.pos.z+Math.cos(camYaw)*D);
        camera.position.y=Math.max(camera.position.y,groundH(camera.position.x,camera.position.z)+1.2);look3.set(St.pos.x+Math.sin(camYaw)*8,St.pos.y+.6-V.SL*8,St.pos.z-Math.cos(camYaw)*8);camera.lookAt(look3)}
      const shake=clamp((sp-14)/12,0,1)*.01;if(shake>0&&!St.air){camera.rotation.x+=(Math.random()-.5)*shake;camera.rotation.z+=(Math.random()-.5)*shake}
      camera.fov=64+clamp((sp-8)*.8,0,18);camera.updateProjectionMatrix();shadowFollow(St.pos);speedLines(clamp((sp-14)/14,0,1),dt);
      sound(St.air?.12:clamp(sp/22,0,1)*.22+(I.a?.08:0),St.air?500:400+sp*30,St.air?.5:I.a?2.5:.7);
      if(St.air&&St.airT>.15)surface("air",0,sp);else surface('snow',clamp(sp/18,0,1)*(I.a?1.3:.8)+Math.abs(rollS)*.4,sp);
      ctx.hud({kmh,mult:St.air?'Air '+St.airT.toFixed(1)+' s':I.a?'Dérapage':'',edge},dt)},
    attract(dt){az-=14*dt;V.updateChunks(az,false);rig.visible=false;const x=cx(az);camera.position.set(x+6,groundH(x,az)+5,az);const lz=az-40;camera.lookAt(cx(lz),groundH(cx(lz),lz)+1,lz);camera.fov=64;camera.updateProjectionMatrix();sound(.1,400,.6)},
    idle(dt){spray.update(dt,5,sprayFade);powder.update(dt,1.1,powderFade);trail.update(dt);sound(0,300,.6);surface('air',0,0);speedLines(0,dt)},
    snapshot(){return {p:St.pos.clone(),yaw:St.yaw}},
    restore(s){trail.clear();rollS=0;land=0;St.grind=null;St.flip=0;St.pos.copy(s.p);St.pos.y=groundH(s.p.x,s.p.z);St.yaw=yawAt(s.p.z);St.vel.set(Math.sin(St.yaw)*6,0,-Math.cos(St.yaw)*6);St.air=false},
    netState(){return {p:[+St.pos.x.toFixed(2),+St.pos.y.toFixed(2),+St.pos.z.toFixed(2)],q:rig.quaternion.toArray().map(v=>+v.toFixed(3))}},
    ghost(lk){const o=buildSnowboard(lk);o.human.pose({crouch:.45,lean:.25,twist:.7,spread:.35});const tag=textSprite(lk.name,lk.accent,3);tag.position.y=2.3;o.add(tag);root.add(o);return o},
    overStats(){return [['Distance',fmt(stats.dist)+' m'],['Vitesse max',Math.round(stats.vmax)+' km/h'],['Sauts',stats.airs],['Meilleure figure',stats.best||'—'],['Figures / rails',(stats.tricks||0)+' / '+(stats.rails||0)]]},
    _h:groundH,_root:root,
    _rig:rig,_world:(f,all)=>{V.updateChunks(f.p.z,all);deep.update(f.p.x,f.p.z)},_st:()=>St,_n:()=>n,_park:()=>({kickers,rails}),dispose(){scene.remove(root);disposeTree(root)}
  };
};
