/* =====================================================================
   WINGSUIT · modèle aéro portance/traînée (air relatif = vitesse − vent)
   Collisions exactes : relief (triangles du maillage), sapins (cônes), anneaux (tore)
===================================================================== */
MODES.wingsuit=function(cfg,look,ctx){
  const P_=cfg.params||{};const course=cfg.mode==='course';
  const env={fogNear:140,fogFar:720,hemiGround:0x4a4038,accent:'#8fd3ff',cloudY:140};
  const eco=S().quality==='eco';const seedI=strSeed(cfg.seed);const root=new THREE.Group();scene.add(root);
  const RD=[.35,.75,1][P_.rings??1];
  const RING_R=5,RING_T=.34;const ringGeo=new THREE.TorusGeometry(RING_R,RING_T,8,28);
  let rings=[],finishZ=null;
  const V=makeValley({seedI,root,SL:.46,W0:[28,40,58][P_.width??1],relief:[.65,1,1.45][P_.relief??1],trees:P_.trees!==false,
    onChunk(k,chunk,g,R){const CH=160,z0=-k*CH;const wantRing=course?(k>=1&&k<=cfg.len):(k>=1&&R()<RD);
      if(wantRing){const z=z0-CH*.5,x=V.cx(z)+(R()*2-1)*12,y=V.groundH(x,z)+10+R()*14;
        const mat=new THREE.MeshBasicMaterial({color:course?0xff9a3c:0xffcf6e,transparent:true,opacity:.95});const mesh=new THREE.Mesh(ringGeo,mat);mesh.userData.ring=true;
        const ry=-V.yawAt(z);mesh.position.set(x,y,z);mesh.rotation.y=ry;g.add(mesh);
        if(course){const lab=textSprite('Porte '+k+'/'+cfg.len,0xff9a3c,6);lab.position.set(x,y+7,z);g.add(lab)}
        const r={k,x,y,z,cos:Math.cos(ry),sin:Math.sin(ry),mesh,mat,done:false,hit:false,fade:0};chunk.extra.push(r);rings.push(r)}
      if(course&&k===cfg.len+1){finishZ=z0-CH*.5;g.add(finishArch(V.cx(finishZ),V.groundH(V.cx(finishZ),finishZ)-2,finishZ,-V.yawAt(finishZ),16,40))}},
    onDrop(k,c){rings=rings.filter(r=>!c.extra.includes(r))}});
  const {groundH,cx,yawAt,CH}=V;
  const gp=gearOf('wing',look.gear.wing).phys;
  const flyer=buildFlyer(look);castAll(flyer,true,false);root.add(flyer);const blob=makeBlob(root,2.2);
  const HIT_R=.1;const hw=FLY_HIT.map(()=>V3());
  const smoke=makeParticles(eco?40:180,1.3,.55,root);const smokeCol=new THREE.Color(cfg.smoke&&owns('smoke')?look.wing1:0xffffff),smokeFade=new THREE.Color(0xdcdfe6);
  const wv=WIND[cfg.wind|0].v,wa=(seedI%628)/100,wind=new THREE.Vector3(Math.cos(wa)*wv,0,Math.sin(wa)*wv);
  const St={pos:V3(),vel:V3(),a:.19,b:0};
  St.pos.set(cx(-30),0,-30);
  {const y=yawAt(-30),v0=22*(ctx.boost?1.2:1);St.vel.set(Math.sin(y)*v0,-4,-Math.cos(y)*v0)}
  const M=85,RHO=1.0;
  const d=V3(),up0=V3(),rt=V3(),lift=V3(),acc=V3(),prev=V3(),fwd=V3(),bup=V3(),brt=V3(),back=V3(),cd=V3(),look3=V3(),tmp=V3(),air=V3(),m4=new THREE.Matrix4();
  const stats={score:0,dist:0,vmax:0,rings:0,closest:999,time:0,pen:0,missed:0};
  let az=-10,proxT=0,wallT=0,chain=0,smokeT=0,gload=1,lastMult=1,agl=99,vario=0,glide=0,stalled=false,nextGate=1,tt=0;
  V.updateChunks(St.pos.z,true);St.pos.y=groundH(St.pos.x,St.pos.z)+70;prev.copy(St.pos);cd.copy(St.vel).normalize();
  function animRings(dt){for(const r of rings){if(r.hit){r.fade+=dt*2.2;r.mesh.scale.setScalar(1+r.fade*.8);r.mat.opacity=Math.max(0,.95-r.fade)}else if(!r.done)r.mesh.rotation.z+=dt*.6}}
  function orient(){fwd.copy(d).multiplyScalar(Math.cos(St.a)).addScaledVector(up0,Math.sin(St.a)).normalize();
    bup.copy(up0).multiplyScalar(Math.cos(St.a)).addScaledVector(d,-Math.sin(St.a));bup.multiplyScalar(Math.cos(St.b)).addScaledVector(rt,Math.sin(St.b)).normalize();
    brt.crossVectors(fwd,bup).normalize();back.copy(fwd).negate();m4.makeBasis(brt,bup,back);flyer.quaternion.setFromRotationMatrix(m4);if(roll.on)flyer.quaternion.multiply(qRoll.setFromAxisAngle(AZr,roll.ang));flyer.position.copy(St.pos);flyer.updateMatrixWorld();
    for(let i=0;i<FLY_HIT.length;i++)hw[i].copy(FLY_HIT[i]).applyMatrix4(flyer.matrixWorld)}
  /* FIGURES wingsuit : tonneau (double appui ← ou →), ressource (piqué puis remontée), rase-mottes, vol de paroi */
  let nmT=0;const roll={on:false,t:0,dir:1,ang:0},qRoll=new THREE.Quaternion(),AZr=new THREE.Vector3(0,0,1),tap=dblTap();let diveF=false;
  /* DÉCOR wingsuit : vols d'oiseaux en V qui traversent la vallée, nappes de nuage basses qu'on traverse */
  const NB=eco?10:24,flocks=[...Array(eco?2:4)].map(()=>({c:V3(),v:V3()})),birds=new THREE.InstancedMesh(makeBirdGeo(),new THREE.MeshLambertMaterial({color:0x2a2e33,side:THREE.DoubleSide}),NB);birds.frustumCulled=false;root.add(birds);
  function spawnFlock(f,near){const z=St.pos.z-(near?90:200)-Math.random()*200,x=cx(z)+(Math.random()-.5)*90;f.c.set(x,groundH(x,z)+22+Math.random()*55,z);const a=Math.random()*6.28;f.v.set(Math.cos(a)*11,(Math.random()-.5)*1.5,Math.sin(a)*5)}
  const wisps=[];for(let i=0;i<(eco?4:9);i++){const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:softTex,color:0xffffff,transparent:true,opacity:0,depthWrite:false}));root.add(sp);wisps.push({sp,a:0})}
  function spawnWisp(w,near){const z=St.pos.z-(near?60:160)-Math.random()*260,x=cx(z)+(Math.random()-.5)*70;const sc=30+Math.random()*45;w.sp.scale.set(sc*1.6,sc,1);w.sp.position.set(x,groundH(x,z)+12+Math.random()*45,z);w.a=.18+Math.random()*.22}
  function animDecor(dt){const tn=performance.now()/1000;let i=0;const per=Math.ceil(NB/flocks.length);
    for(const f of flocks){f.c.addScaledVector(f.v,dt);if(f.c.z>St.pos.z+70||Math.abs(f.c.z-St.pos.z)>650)spawnFlock(f);_dq.setFromAxisAngle(_dy,Math.atan2(f.v.x,f.v.z));
      for(let j=0;j<per&&i<NB;j++,i++){const r=Math.ceil(j/2),sd=j%2?1:-1;_dv.set(sd*r*1.7,Math.sin(tn*2+j)*.3,-r*1.5).applyQuaternion(_dq).add(f.c);_ds.set(1.3,.35+.65*Math.abs(Math.sin(tn*8+j*.7)),1.3);_dm.compose(_dv,_dq,_ds);birds.setMatrixAt(i,_dm)}}
    birds.instanceMatrix.needsUpdate=true;
    for(const w of wisps){const d=w.sp.position.distanceTo(St.pos);if(w.sp.position.z>St.pos.z+40||d>700)spawnWisp(w);w.sp.material.opacity=w.a*clamp((d-8)/40,0,1)*clamp((520-d)/200,0,1)}}
  flocks.forEach(f=>spawnFlock(f,true));wisps.forEach(w=>spawnWisp(w,true));
  const crash=(t,x)=>{ding(90,.7);buzz([40,30,60]);ctx.crash(t,x)};
  const totalDist=(cfg.len+1)*CH;
  return {env,stats,name:'Wingsuit',vScale:260,
    target:course?totalDist/36:0,
    keys:[['← →','incliner / virer'],[S().invert?'↓':'↑','plonger (prendre de la vitesse)'],[S().invert?'↑':'↓','cabrer (attention au décrochage)'],['←← / →→','tonneau (double appui)'],['C','caméra']],
    press(code){const d=tap(code);if(d&&!roll.on){roll.on=true;roll.t=0;roll.dir=d}},
    touch:{u:S().invert?'Cabrer':'Plonger',d:S().invert?'Plonger':'Cabrer',a:null},
    inst:`<div class="ihead">Instruments de vol</div>
      <div class="ro-grid"><div class="ro"><span>Sol</span><b id="iAgl">0<small>m</small></b></div><div class="ro"><span>Vario</span><b id="iVar">0<small>m/s</small></b></div>
      <div class="ro"><span>Finesse</span><b id="iGr">0</b></div><div class="ro"><span>Charge</span><b id="iG">1.0<small>g</small></b></div></div>
      <div class="barline"><span>Proxi</span><div class="bt"><i id="iProx"></i></div><b id="iMult">×1</b></div>`,
    hudUpdate(){const a=$('#iAgl');if(!a)return;a.innerHTML=Math.round(Math.max(0,agl))+'<small>m</small>';a.className=agl<8?'bad':agl<30?'ok':'';
      $('#iVar').innerHTML=(vario>0?'+':'')+vario.toFixed(1)+'<small>m/s</small>';$('#iGr').textContent=glide>9?'—':glide.toFixed(1);
      const g=$('#iG');g.innerHTML=gload.toFixed(1)+'<small>g</small>';g.className=stalled?'bad':'';
      $('#iProx').style.width=(clamp((30-agl)/30,0,1)*100)+'%';$('#iMult').textContent='×'+lastMult},
    prog(){return course?'Porte <b>'+Math.min(nextGate,cfg.len)+'</b>/'+cfg.len+(stats.pen?' · pénalités +'+stats.pen+' s':''):''},
    auto(){const z=St.pos.z-70,tx=cx(z);let ty=groundH(tx,z)+18;const r=rings.find(r=>!r.done&&r.z<St.pos.z-8&&r.z>St.pos.z-200);
      let ax=tx;if(r){ax=r.x;ty=r.y}const want=Math.atan2(ax-St.pos.x,-(z-St.pos.z));const yaw=Math.atan2(St.vel.x,-St.vel.z);
      const x=clamp((want-yaw)*2.2,-1,1);const V_=St.vel.length();let la=1e9;for(let dd=20;dd<=40+V_*1.6;dd+=20){const zz=St.pos.z-dd,xx=St.pos.x+(ax-St.pos.x)*dd/70;la=Math.min(la,St.pos.y-groundH(xx,zz))}
      let dive=(St.pos.y>ty+4&&V_<34&&la>25)||V_<24?1:(St.pos.y<ty-3||agl<12||la<14+V_*.25||St.vel.y<-V_*.45)?-1:0;
      return {x,y:S().invert?-dive:dive,a:false}},
    update(dt,I){const live=dt>0;tt+=dt;
      const iy=S().invert?-I.y:I.y;const Vn=St.vel.length();const aT=iy>0?-.03:iy<0?(Vn<24?gp.stall+.06:gp.stall*.95):.19;// cabrer : portance max ; décrochage seulement si on cabre sous ~85 km/h
      St.a+=(aT-St.a)*Math.min(1,3.6*dt);St.b+=(I.x*1.05-St.b)*Math.min(1,2.8*dt);
      const Vv=St.vel.length()||1;
      const gust=wv?(fbm(tt*.3,V.seed)-.5)*wv*.8:0;air.copy(St.vel).sub(wind);air.x-=gust*.5;air.z-=gust*.5;
      const Va=air.length()||1;const da=tmp.copy(air).divideScalar(Va);
      up0.set(0,1,0).addScaledVector(da,-da.y);if(up0.lengthSq()<1e-4)up0.set(0,0,-1);up0.normalize();rt.crossVectors(da,up0).normalize();
      stalled=St.a>gp.stall;const CLmax=.22+gp.cla*gp.stall;const CL=stalled?CLmax-(St.a-gp.stall)*3:.22+gp.cla*St.a;
      const CD=gp.cd0+gp.k*CL*CL+(stalled?(St.a-gp.stall)*1.5:0)+Math.abs(St.b)*.012;const q=.5*RHO*Va*Va*gp.area;
      lift.copy(up0).multiplyScalar(Math.cos(St.b)).addScaledVector(rt,Math.sin(St.b));
      acc.copy(lift).multiplyScalar(q*CL/M*(roll.on?.55:1)).addScaledVector(da,-q*CD/M);acc.y-=9.81;
      prev.copy(St.pos);St.vel.addScaledVector(acc,dt);St.pos.addScaledVector(St.vel,dt);
      if(roll.on){roll.t+=dt;const k=clamp(roll.t/.85,0,1);roll.ang=-roll.dir*2*Math.PI*(k*k*(3-2*k));if(k>=1){roll.on=false;roll.ang=0;if(live){ctx.trick(roll.dir<0?'Tonneau gauche':'Tonneau droit',250);sfx.whoosh()}}}
      if(flyer.human)flyer.human.setPose(iy>0?'wingsuit_dive':'wingsuit_glide',1,{turn:St.b*.5,look:St.b*.4});
      gload=q*CL/(M*9.81);vario=St.vel.y;
      if(live){if(vario<-18)diveF=true;else if(diveF&&vario>3&&Vv>30){diveF=false;ctx.trick('Ressource',200)}}const hs=Math.hypot(St.vel.x,St.vel.z);glide=vario<-.3?hs/-vario:99;
      d.copy(da);V.updateChunks(St.pos.z,false);orient();
      const kmh=Vv*3.6;if(live){stats.vmax=Math.max(stats.vmax,kmh);stats.time+=dt}
      agl=1e9;for(const p of hw){const c=p.y-HIT_R-groundH(p.x,p.z);if(c<agl)agl=c}
      if(agl<0&&live)return crash('Impact','Contact avec le relief à '+Math.round(kmh)+' km/h. Arrondis plus tôt en sortie de piqué.');
      if(live&&V.treeHit(hw,HIT_R,St.pos))return crash('Sapin','Accroché un sapin (4 à 13 m de haut).');
      for(const r of rings){if(r.done)continue;
        const lzP=-(prev.x-r.x)*r.sin+(prev.z-r.z)*r.cos,lz=-(St.pos.x-r.x)*r.sin+(St.pos.z-r.z)*r.cos;
        if(Math.abs(lz)<3){for(const p of hw){const lx=(p.x-r.x)*r.cos+(p.z-r.z)*r.sin,ly=p.y-r.y,lzz=-(p.x-r.x)*r.sin+(p.z-r.z)*r.cos;
          if(Math.hypot(Math.hypot(lx,ly)-RING_R,lzz)<RING_T+HIT_R&&live)return crash('Anneau percuté','Tu as touché le cadre de l\'anneau. Vise le centre.')}}
        if((lzP>0&&lz<=0)||(lzP<0&&lz>=0)){const t=lzP/(lzP-lz),px=lerp(prev.x,St.pos.x,t),py=lerp(prev.y,St.pos.y,t),pz=lerp(prev.z,St.pos.z,t);
          const lx=(px-r.x)*r.cos+(pz-r.z)*r.sin,ly=py-r.y;r.done=true;
          if(Math.hypot(lx,ly)<RING_R-RING_T){r.hit=true;r.mat.color.setHex(0xffffff);chain++;stats.rings++;St.vel.multiplyScalar(1.05);
            if(live){if(course){nextGate=r.k+1;ctx.bonus(300,'Porte '+r.k);ctx.checkpoint(r.k,cfg.len)}else ctx.bonus(500*chain,chain>1?'Anneaux ×'+chain:'Anneau');toast(course?'Porte '+r.k:chain>1?'Série ×'+chain:'Anneau',true);ding(660+Math.min(chain,6)*110);sfx.whoosh()}}
          else{r.mat.opacity=.25;if(live){if(course){stats.pen+=3;stats.missed++;nextGate=r.k+1;feed('Porte '+r.k+' manquée · +3 s');toast('+3 s',true)}else if(chain>1)feed('Série perdue')}chain=0}}}
      if(course&&finishZ!==null&&prev.z>finishZ&&St.pos.z<=finishZ&&live){ding(990,.5);return ctx.finish(stats.time+stats.pen)}
      animRings(dt);
      const dist=Math.hypot(St.pos.x-prev.x,St.pos.z-prev.z);if(live)stats.dist+=dist;
      let mult=1;if(agl<30&&Vv>25)mult=1+Math.round((30-agl)/6*2)/2;lastMult=mult;
      stats.score+=dist*.4*mult;if(Vv>25&&live)stats.closest=Math.min(stats.closest,agl);
      if(live){if(mult>=4.5){proxT+=dt;if(proxT>.5){ctx.trick('Rase-mottes',150);proxT=-2.5;nearMissFx();sfx.whoosh()}}else proxT=Math.min(proxT+dt,0);
        let wall=99;tmp.set(rt.x,0,rt.z).normalize();for(const sd of [-1,1])for(const dd of [6,12]){const gy=groundH(St.pos.x+tmp.x*dd*sd,St.pos.z+tmp.z*dd*sd);if(gy>St.pos.y-2)wall=Math.min(wall,dd)}
        if(wall<99&&Vv>25){stats.score+=dist*(wall<8?3:1.5);wallT+=dt;if(wallT>.6){ctx.trick('Vol de paroi',150);wallT=-2}}else wallT=Math.min(wallT+dt,0)}
      smokeT+=dt;if(live&&smokeT>(eco?.06:.03)){smokeT=0;for(let s=1;s<=2;s++)smoke.spawn(hw[s].x,hw[s].y,hw[s].z,(Math.random()-.5)*.6,.3,(Math.random()-.5)*.6,2.2,smokeCol.r,smokeCol.g,smokeCol.b)}
      /* frôlement de sapin : passé à moins de 4 m d'un arbre sans le toucher, à plus de 90 km/h */
      nmT-=dt;if(live&&nmT<=0&&Vv>25){const kc=Math.floor(-St.pos.z/CH);for(let k=kc-1;k<=kc;k++){const c=V.chunks.get(k);if(!c)continue;for(const tr of c.trees){const dx=St.pos.x-tr.x,dz=St.pos.z-tr.z;if(dx*dx+dz*dz>16)continue;
          if(St.pos.y<tr.y+tr.h+2.5&&St.pos.y>tr.y){nmT=1.5;ctx.trick('Frôle-sapin',220);nearMissFx();sfx.whoosh();break}}if(nmT>0)break}}
      smoke.update(dt,-.15,smokeFade);animDecor(dt);
      if(live)cd.lerp(St.vel.clone().normalize(),1-Math.exp(-3.2*dt)).normalize();else cd.copy(St.vel).normalize();
      flyer.head.visible=ctx.cam()!==1;
      if(ctx.cam()===1){camera.position.copy(St.pos).addScaledVector(bup,.24).addScaledVector(fwd,.85);camera.quaternion.copy(flyer.quaternion)}
      else{const D=ctx.cam()===2?24:7.2,hgt=ctx.cam()===2?7:1.7;camera.position.copy(St.pos).addScaledVector(cd,-D);camera.position.y+=hgt;
        camera.position.y=Math.max(camera.position.y,groundH(camera.position.x,camera.position.z)+1.5);look3.copy(St.pos).addScaledVector(cd,10);camera.lookAt(look3);camera.rotateZ(-St.b*.22)}
      const shake=clamp((Vv-48)/45,0,1)*.008+(wv?wv*.0006:0);if(shake>0&&ctx.cam()!==2){camera.rotation.x+=(Math.random()-.5)*shake;camera.rotation.y+=(Math.random()-.5)*shake}
      camera.fov=64+clamp((Vv-25)*.35,0,20);camera.updateProjectionMatrix();shadowFollow(St.pos);
      speedLines(clamp((Vv-30)/40,0,1)*(agl<30?1:.6),dt);sound(clamp((Va-10)/55,0,1)*.55,250+Va*16,.8);surface('air',0,Va);
      flyer.wing.scale.y=1+Math.sin(tt*31)*clamp((Va-20)/40,0,1)*.6;flyer.wing.scale.x=1-Math.abs(St.b)*.05;blob.set(St.pos.x,groundH(St.pos.x,St.pos.z),St.pos.z,agl);
      ctx.hud({kmh,mult:mult>1?'×'+mult:''},dt)},
    attract(dt){az-=30*dt;V.updateChunks(az,false);flyer.visible=false;smoke.update(dt,0,smokeFade);const x=cx(az);let y=-1e9;for(let dd=0;dd<=60;dd+=20){const zz=az-dd;y=Math.max(y,groundH(cx(zz),zz))}
      camera.position.set(x,y+24,az);const lz=az-80;camera.lookAt(cx(lz),groundH(cx(lz),lz)+14,lz);camera.fov=66;camera.updateProjectionMatrix();animRings(dt);sound(.12,500,.8)},
    idle(dt){animRings(dt);smoke.update(dt,-.15,smokeFade);sound(0,300,.8);speedLines(0,dt)},
    snapshot(){return {p:St.pos.clone(),v:St.vel.clone(),a:St.a,b:St.b,ng:nextGate}},
    restore(s){roll.on=false;roll.ang=0;St.pos.copy(s.p);St.pos.y=Math.max(St.pos.y,groundH(St.pos.x,St.pos.z)+25);St.vel.copy(s.v);St.a=.19;St.b=0;prev.copy(St.pos)},
    netState(){return {p:[+St.pos.x.toFixed(2),+St.pos.y.toFixed(2),+St.pos.z.toFixed(2)],q:flyer.quaternion.toArray().map(v=>+v.toFixed(3))}},
    ghost(lk){const o=buildFlyer(lk);const tag=textSprite(lk.name,lk.wing1,3.6);tag.position.y=1.6;o.add(tag);root.add(o);return o},
    overStats(){return [['Distance',fmt(stats.dist)+' m'],['Vitesse max',Math.round(stats.vmax)+' km/h'],[course?'Portes':'Anneaux',course?(stats.rings+'/'+cfg.len):stats.rings],['Temps de vol',fmtT(stats.time)],['Plus près du sol',stats.closest<900?Math.max(0,stats.closest).toFixed(1)+' m':'—']]},
    _h:groundH,_root:root,_rig:flyer,_world:(f,all)=>V.updateChunks(f.p.z,all),
    dispose(){scene.remove(root);disposeTree(root)}
  };
};
function bannerTex(text,bg){const c=document.createElement('canvas');c.width=512;c.height=64;const g=c.getContext('2d');g.fillStyle=bg;g.fillRect(0,0,512,64);
  g.fillStyle='#fff';g.font='800 44px Bricolage Grotesque, Arial, sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(text,256,34);return new THREE.CanvasTexture(c)}
function finishArch(x,y,z,ry,halfW,h){const arch=new THREE.Group();const pm=new THREE.MeshLambertMaterial({color:0xff5a36});
  for(const s of [-1,1]){const pil=new THREE.Mesh(new THREE.BoxGeometry(1.2,h,1.2),pm);pil.position.set(s*halfW,h/2,0);arch.add(pil)}
  const ban=new THREE.Mesh(new THREE.BoxGeometry(2*halfW+1.2,Math.max(1.2,h*.09),.5),new THREE.MeshBasicMaterial({map:bannerTex('ARRIVÉE','#ff5a36')}));ban.position.y=h;arch.add(ban);
  arch.position.set(x,y,z);arch.rotation.y=ry;return arch}
