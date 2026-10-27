/* =====================================================================
   PARAPENTE · vitesse bras hauts 38 km/h, chute 1,1 m/s (finesse ~9)
   Thermiques : colonnes d'air chaud qui font monter de 2 à 5 m/s
   Collisions exactes : pilote + voile (bouts d'aile, centre) contre relief, sapins et pylônes
===================================================================== */
function buildParaglider(look){const g=new THREE.Group();
  const pilot=buildHuman(look);pilot.rotation.y=Math.PI/2;pilot.pose({crouch:.95,lean:-.25,spread:.15});pilot.position.y=-.9;g.add(pilot);g.human=pilot;
  const harness=new THREE.Mesh(new THREE.BoxGeometry(.5,.25,.7),new THREE.MeshLambertMaterial({color:0x1b2026}));harness.position.set(0,-.35,.05);g.add(harness);
  const c1=new THREE.MeshLambertMaterial({color:look.wing1,side:THREE.DoubleSide}),c2=new THREE.MeshLambertMaterial({color:look.wing2,side:THREE.DoubleSide});
  const R=6.5,cells=9,pts=[];
  for(let i=0;i<cells;i++){const th=-.85+i*(1.7/(cells-1));const cell=new THREE.Mesh(new THREE.BoxGeometry(1.25,.22,2.5),i%2?c2:c1);
    cell.position.set(R*Math.sin(th),R*Math.cos(th),-.3);cell.rotation.z=-th;g.add(cell);pts.push(cell.position.x,cell.position.y,cell.position.z)}
  const lp=[];for(let i=0;i<cells;i++){lp.push(0,.1,0,pts[i*3],pts[i*3+1]-.1,pts[i*3+2]+.6,0,.1,0,pts[i*3],pts[i*3+1]-.1,pts[i*3+2]-1)}
  const lg=new THREE.BufferGeometry();lg.setAttribute('position',new THREE.Float32BufferAttribute(lp,3));g.add(new THREE.LineSegments(lg,new THREE.LineBasicMaterial({color:0x222222,transparent:true,opacity:.6})));
  return g}
const PG_HIT=[[0,-1.75,0],[0,.75,0],[-5.3,4.2,-.3],[5.3,4.2,-.3],[0,6.6,-.3],[-3,5.8,-.3],[3,5.8,-.3],[0,6.5,-1.55]].map(v3);
MODES.paraglide=function(cfg,look,ctx){
  const P_=cfg.params||{};const course=cfg.mode==='course';
  const env={fogNear:160,fogFar:780,hemiGround:0x4a4038,accent:'#c6a6ff',cloudY:220};
  const eco=S().quality==='eco';const seedI=strSeed(cfg.seed);const root=new THREE.Group();scene.add(root);
  const TSTR=[[2,3.2],[2.6,4.2],[3.2,5.2]][P_.thermals??1];
  let thermals=[],pylons=[],finishZ=null;
  const colMat=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:eco?.05:.07,depthWrite:false});colMat.userData.shared=true;
  const colGeo=new THREE.CylinderGeometry(1,1.4,1,14,1,true);
  const birdGeo=new THREE.BufferGeometry();birdGeo.setAttribute('position',new THREE.Float32BufferAttribute([-.6,.15,0,0,0,0,0,0,0,.6,.15,0,0,0,0,.0,.0,.0],3));
  const birdMat=new THREE.LineBasicMaterial({color:0x222222});birdMat.userData.shared=true;
  const V=makeValley({seedI,root,SL:.06,W0:[60,80,110][P_.width??1],relief:[.8,1.1,1.5][P_.relief??1],trees:true,treeDensity:.8,xw:900,
    onChunk(k,chunk,g,R){const CH=160,z0=-k*CH;if(k<0)return;
      const n=k===0?1:(R()<[.45,.7,.9][P_.thermals??1]?1:0)+(R()<.25?1:0);
      for(let i=0;i<n;i++){const z=z0-20-R()*120,x=V.cx(z)+(R()*2-1)*V.vw(z)*.7,gy=V.groundH(x,z),r=20+R()*16,s=TSTR[0]+R()*(TSTR[1]-TSTR[0]),top=gy+260+R()*200;
        const col=new THREE.Mesh(colGeo,colMat);col.userData.shared=true;col.scale.set(r,top-gy,r);col.position.set(x,(top+gy)/2,z);g.add(col);
        const birds=new THREE.Group();for(let b=0;b<3;b++){const l=new THREE.LineSegments(birdGeo,birdMat);l.userData.shared=true;l.scale.setScalar(3);l.position.set(Math.cos(b*2.1)*r*.6,0,Math.sin(b*2.1)*r*.6);birds.add(l)}
        birds.position.set(x,Math.min(top,gy+140),z);g.add(birds);const th={x,z,gy,r,s,top,birds};chunk.extra.push(th);thermals.push(th)}
      if(course&&k>=2&&k%2===0&&k/2<=cfg.len){const gi=k/2,z=z0-80,x=V.cx(z)+(R()*2-1)*20,gy=V.groundH(x,z),ry=-V.yawAt(z);
        const pg=new THREE.Group();const pm=new THREE.MeshLambertMaterial({color:0xc6a6ff});
        for(const s of [-1,1]){const pole=new THREE.Mesh(new THREE.CylinderGeometry(.6,.6,90,8),pm);pole.position.set(s*18,45,0);pg.add(pole)}
        const lab=textSprite('Balise '+gi+'/'+cfg.len,0xc6a6ff,10);lab.position.y=95;pg.add(lab);pg.position.set(x,gy-5,z);pg.rotation.y=ry;g.add(pg);
        const p={gi,x,z,gy:gy-5,cos:Math.cos(ry),sin:Math.sin(ry),done:false};chunk.extra.push(p);pylons.push(p)}
      if(course&&k===2*cfg.len+2){finishZ=z0-80;g.add(finishArch(V.cx(finishZ),V.groundH(V.cx(finishZ),finishZ)-2,finishZ,-V.yawAt(finishZ),30,60))}},
    onDrop(k,c){thermals=thermals.filter(t=>!c.extra.includes(t));pylons=pylons.filter(t=>!c.extra.includes(t))}});
  const {groundH,cx,yawAt,CH}=V;
  const rig=buildParaglider(look);castAll(rig,true,false);root.add(rig);const blob=makeBlob(root,2.4);const hw=PG_HIT.map(()=>V3());const HR=.15;
  const wv=WIND[cfg.wind|0].v,wa=(seedI%628)/100;
  const St={x:cx(-30),z:-30,y:0,yaw:yawAt(-30),va:10.5*(ctx.boost?1.15:1),bank:0,lift:0,climb:0,thermalGain:0,inThermal:false};
  V.updateChunks(St.z,true);St.y=groundH(St.x,St.z)+110;
  const stats={score:0,dist:0,vmax:0,time:0,gates:0,pen:0,climbed:0,maxAlt:0};let tt=0,camYaw=St.yaw,vario=0,agl=99,az=-10,stallT=0;const prev=V3(),cur3=V3(),look3=V3();
  function place(){rig.position.set(St.x,St.y,St.z);rig.rotation.set(0,-St.yaw,-St.bank,'YXZ');rig.updateMatrixWorld();for(let i=0;i<PG_HIT.length;i++)hw[i].copy(PG_HIT[i]).applyMatrix4(rig.matrixWorld)}
  place();
  /* FIGURES parapente : wingover (virages alternés appuyés), spirale (360 engagés), rase-cime */
  const wo={s:0,n:0,t:9},spir={a:0},rc={t:0,cd:0};
  const crash=(t,x)=>{ding(90,.7);buzz([40,30,60]);ctx.crash(t,x)};
  function liftAt(x,z,y){let L=0;for(const t of thermals){const d=Math.hypot(x-t.x,z-t.z);if(d<t.r){if(y<t.top)L+=t.s*(1-(d/t.r)**2)*clamp((t.top-y)/60,0,1)}else if(d<t.r*1.6)L-=.9*(1-(d-t.r)/(t.r*.6))}return L}
  return {env,stats,name:'Parapente',vScale:70,target:course?((2*cfg.len+2.5)*CH)/9.5:0,
    keys:[['← →','tourner (alterner = wingover, tenir = spirale)'],['↓','freiner : plus lent, chute mini (décroche sous 27 km/h)'],['↑','accélérateur : plus vite, chute plus forte'],['C','caméra']],
    touch:{u:'Accél.',d:'Freins',a:null},
    inst:`<div class="ihead">Vario</div><div class="ro-grid"><div class="ro"><span>Vario</span><b id="iVz">0<small>m/s</small></b></div><div class="ro"><span>Sol</span><b id="iAgl">0<small>m</small></b></div>
      <div class="ro"><span>Thermique</span><b id="iTh">—</b></div><div class="ro"><span>Gain</span><b id="iGain">0<small>m</small></b></div></div>
      <div class="barline"><span>Vitesse air</span><div class="bt"><i id="iVa"></i></div><b id="iVaV">38</b></div>`,
    hudUpdate(){const v=$('#iVz');if(!v)return;v.innerHTML=(vario>0?'+':'')+vario.toFixed(1)+'<small>m/s</small>';v.className=vario>.5?'ok':vario<-2?'bad':'';
      const a=$('#iAgl');a.innerHTML=Math.round(Math.max(0,agl))+'<small>m</small>';a.className=agl<20?'bad':'';
      $('#iTh').textContent=St.inThermal?'dedans':'—';$('#iTh').className=St.inThermal?'ok':'';$('#iGain').innerHTML=Math.round(St.thermalGain)+'<small>m</small>';
      const vi=$('#iVa');vi.style.width=(clamp((St.va-6)/9,0,1)*100)+'%';vi.classList.toggle('hot',St.va<7.8);$('#iVaV').textContent=Math.round(St.va*3.6)},
    prog(){return course?'Balise <b>'+Math.min(stats.gates+stats.pen/3+1,cfg.len)+'</b>/'+cfg.len:''},
    auto(){let best=null,bd=1e9;for(const t of thermals){const dz=St.z-t.z;if(dz<-40||dz>500)continue;const d=Math.hypot(t.x-St.x,t.z-St.z);if(d<bd&&St.y<t.top-30){bd=d;best=t}}
      let tx,tz;const p=pylons.find(p=>!p.done&&p.z<St.z);if(agl<160&&best){tx=best.x;tz=best.z}else if(p){tx=p.x;tz=p.z}else{tz=St.z-120;tx=cx(tz)}
      if(best&&Math.hypot(best.x-St.x,best.z-St.z)<best.r*.9&&agl<200)return {x:.8,y:0,a:false};
      const want=Math.atan2(tx-St.x,-(tz-St.z));let dY=want-St.yaw;dY=Math.atan2(Math.sin(dY),Math.cos(dY));return {x:clamp(dY*2,-1,1),y:0,a:false}},
    update(dt,I){const live=dt>0;tt+=dt;
      const vaT=I.y>0?14:I.y<0?7.6:10.5;St.va+=(vaT-St.va)*Math.min(1,.8*dt);
      St.bank+=(I.x*.55-St.bank)*Math.min(1,1.6*dt);St.yaw+=9.81*Math.tan(St.bank)/St.va*dt;
      let sink=1+.045*(St.va-9)**2;if(St.va<7.3){stallT+=dt;sink+=3*(7.3-St.va)*4}else stallT=0;sink/=Math.pow(Math.cos(St.bank),1.5);
      St.lift=liftAt(St.x,St.z,St.y);const gust=wv?(fbm(tt*.25,V.seed)-.5)*wv*.15:0;
      prev.set(St.x,St.y,St.z);vario=St.lift-sink+gust;
      St.x+=(Math.sin(St.yaw)*St.va+Math.cos(wa)*wv)*dt;St.z+=(-Math.cos(St.yaw)*St.va+Math.sin(wa)*wv)*dt;St.y+=vario*dt;
      St.inThermal=St.lift>.8;if(St.inThermal&&vario>0){St.thermalGain+=vario*dt;if(live){stats.climbed+=vario*dt;stats.score+=vario*dt*6}}
      else if(St.thermalGain>0){if(St.thermalGain>40&&live){ctx.bonus(St.thermalGain*4,'Thermique +'+Math.round(St.thermalGain)+' m');ding(700)}St.thermalGain=0}
      V.updateChunks(St.z,false);place();
      const gs=Math.hypot(St.x-prev.x,St.z-prev.z)/(dt||1);const kmh=gs*3.6;
      if(live){stats.vmax=Math.max(stats.vmax,kmh);stats.time+=dt;stats.maxAlt=Math.max(stats.maxAlt,St.y-St.z*.06)}
      agl=1e9;for(const p of hw){const c=p.y-HR-groundH(p.x,p.z);if(c<agl)agl=c}
      if(agl<0&&live){const feet=hw[0],gy=groundH(feet.x,feet.z),n=V.groundN(feet.x,feet.z,cur3);const feetFirst=feet.y-HR-gy<=agl+.05;
        if(feetFirst&&n.y>.9&&vario>-2.6&&St.va<11.5&&Math.abs(St.bank)<.25){ding(880,.5);ctx.bonus(400,'Atterrissage');return crash('Posé !','Atterrissage en douceur après '+fmt(stats.dist)+' m de vol. Bien joué.')}
        return crash('Contact avec le relief','Voile ou pilote a touché le relief. Garde de la marge et cherche les thermiques.')}
      if(stallT>2&&live)return crash('Décrochage','Trop freiné trop longtemps : la voile a décroché. Relâche les freins.');
      if(live&&V.treeHit(hw,HR,rig.position))return crash('Arbre','La voile s\'est prise dans un sapin.');
      for(const p of pylons){if(p.done)continue;const lzP=-(prev.x-p.x)*p.sin+(prev.z-p.z)*p.cos,lz=-(St.x-p.x)*p.sin+(St.z-p.z)*p.cos;
        if(Math.abs(lz)<8){for(const q of hw){const lx=(q.x-p.x)*p.cos+(q.z-p.z)*p.sin,lzz=-(q.x-p.x)*p.sin+(q.z-p.z)*p.cos;if(q.y<p.gy+90&&(Math.hypot(lx-18,lzz)<.6+HR||Math.hypot(lx+18,lzz)<.6+HR)&&live)return crash('Pylône','Collision avec un pylône de balise.')}}
        if((lzP>0&&lz<=0)||(lzP<0&&lz>=0)){p.done=true;const lx=(St.x-p.x)*p.cos+(St.z-p.z)*p.sin;if(Math.abs(lx)<18&&St.y<p.gy+90){stats.gates++;ctx.bonus(300,'Balise '+p.gi);ctx.checkpoint(p.gi,cfg.len);toast('Balise '+p.gi,true);ding(760)}
          else if(live){stats.pen+=3;feed('Balise '+p.gi+' manquée · +3 s');toast('+3 s',true)}}}
      if(course&&finishZ!==null&&prev.z>finishZ&&St.z<=finishZ&&live){ding(990,.5);return ctx.finish(stats.time+stats.pen)}
      if(live){wo.t+=dt;const sg=Math.abs(St.bank)>.42?Math.sign(St.bank):0;if(sg&&sg!==wo.s){wo.n=wo.t<2.8?wo.n+1:1;wo.s=sg;wo.t=0;if(wo.n>=4&&wo.n%2===0)ctx.trick(wo.n>4?'Wingover ×'+(wo.n/2):'Wingover',150*wo.n/2)}
        if(Math.abs(St.bank)>.45){spir.a+=9.81*Math.tan(St.bank)/St.va*dt;if(Math.abs(spir.a)>=2*Math.PI){spir.n=(spir.n||0)+1;spir.a=0;ctx.trick(spir.n>1?'Spirale ×'+spir.n:'Spirale',200)}}else if(Math.abs(St.bank)<.3){spir.a=0;spir.n=0}
        rc.cd-=dt;if(agl>0&&agl<12){rc.t+=dt;if(rc.t>1.5&&rc.cd<=0){ctx.trick('Rase-cime',180);rc.cd=5;rc.t=0}}else rc.t=0}
      const d=Math.hypot(St.x-prev.x,St.z-prev.z);if(live)stats.dist+=d;stats.score+=d*.5*(agl<40?2:1);
      for(const t of thermals)t.birds.rotation.y+=dt*.5;
      camYaw+=(St.yaw-camYaw)*(live?1-Math.exp(-2.5*dt):1);rig.human.visible=ctx.cam()!==1;
      if(ctx.cam()===1){camera.position.set(St.x,St.y+.6,St.z);camera.rotation.set(-.15,-St.yaw,-St.bank*.6,'YXZ')}
      else{const D=ctx.cam()===2?40:16,Hh=ctx.cam()===2?14:5.5;camera.position.set(St.x-Math.sin(camYaw)*D,St.y+Hh,St.z+Math.cos(camYaw)*D);
        camera.position.y=Math.max(camera.position.y,groundH(camera.position.x,camera.position.z)+2);look3.set(St.x+Math.sin(St.yaw)*10,St.y+2.5,St.z-Math.cos(St.yaw)*10);camera.lookAt(look3);camera.rotateZ(-St.bank*.25)}
      camera.fov=62;camera.updateProjectionMatrix();shadowFollow(rig.position);speedLines(0,dt);
      sound(.12+clamp(St.va/14,0,1)*.15,300+St.va*25,.6);surface('air',0,St.va);blob.set(St.x,groundH(St.x,St.z),St.z,Math.max(0,agl));
      rig.human.pose({crouch:.95,lean:-.25+St.bank*.1,spread:.15,twist:-St.bank*.25,look:-St.bank*.3});if(St.inThermal&&live&&Math.floor(tt*4)!==Math.floor((tt-dt)*4)&&vario>.5)ding(500+vario*120,.08);
      ctx.hud({kmh,mult:St.inThermal?'Thermique':''},dt)},
    attract(dt){az-=14*dt;V.updateChunks(az,false);rig.visible=false;const x=cx(az);camera.position.set(x,groundH(x,az)+60,az);const lz=az-120;camera.lookAt(cx(lz),groundH(cx(lz),lz)+30,lz);camera.fov=62;camera.updateProjectionMatrix();sound(.1,400,.6)},
    idle(dt){for(const t of thermals)t.birds.rotation.y+=dt*.5;sound(0,300,.6);speedLines(0,dt)},
    snapshot(){return {x:St.x,y:St.y,z:St.z,yaw:St.yaw}},
    restore(s){Object.assign(St,{x:s.x,z:s.z,yaw:s.yaw,va:10.5,bank:0,thermalGain:0});St.y=Math.max(s.y,groundH(s.x,s.z)+60)},
    netState(){return {p:[+St.x.toFixed(2),+St.y.toFixed(2),+St.z.toFixed(2)],q:rig.quaternion.toArray().map(v=>+v.toFixed(3))}},
    ghost(lk){const o=buildParaglider(lk);const tag=textSprite(lk.name,lk.wing1,4);tag.position.y=8.5;o.add(tag);root.add(o);return o},
    overStats(){return [['Distance',fmt(stats.dist)+' m'],['Gain en thermique',Math.round(stats.climbed)+' m'],[course?'Balises':'Altitude max',course?stats.gates+'/'+cfg.len:Math.round(stats.maxAlt)+' m'],['Vitesse sol max',Math.round(stats.vmax)+' km/h'],['Temps de vol',fmtT(stats.time)]]},
    _h:groundH,_root:root,_rig:rig,_world:(f,all)=>V.updateChunks(f.p.z,all),
    dispose(){scene.remove(root);disposeTree(root);colMat.dispose();birdMat.dispose()}
  };
};
