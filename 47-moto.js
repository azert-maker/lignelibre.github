/* =====================================================================
   MOTOCROSS · circuit de terre (parcours) et arène freestyle (monde libre)
   Physique arcade « lourde » : poussée moteur décroissante avec la vitesse (5 rapports simulés pour
   le son), adhérence latérale limitée (au-delà : la moto glisse et projette de la terre), virages
   relevés (berms) qui tiennent la moto par la pente réelle, suspension visuelle qui encaisse.
   En l'air : assiette (↑ plonge, ↓ cabre), whip (← →), scrub au décollage, figures freestyle
   (Shift/F + direction : Superman, Nac-nac, Heel clicker), backflip. Réception évaluée sur
   l'écart entre l'assiette de la moto et la pente de réception, la vitesse d'impact, le whip
   ramené et le pilote revenu sur la moto.
===================================================================== */
function buildMoto(look){const g=new THREE.Group();const gp=gearOf('moto',look.gear.moto);
  const plast=new THREE.MeshPhongMaterial({color:look.motoCol??look.accent,shininess:60,specular:0x555555}),dark=new THREE.MeshLambertMaterial({color:0x17191c}),metal=new THREE.MeshPhongMaterial({color:0xb9c0c8,shininess:90,specular:0xaaaaaa}),tyre=new THREE.MeshLambertMaterial({color:0x101112}),seatM=new THREE.MeshLambertMaterial({color:0x111111});
  const numTex=canvasTex(128,128,(c,w,h)=>{c.fillStyle='#f4f4f0';c.fillRect(0,0,w,h);c.fillStyle=hexCss(look.accent);c.font='800 84px Bricolage Grotesque, Arial';c.textAlign='center';c.textBaseline='middle';c.fillText(String(((strSeed(look.name||'R')%89)+10)),w/2,h/2+4)});
  const body=new THREE.Group();g.add(body);
  const box=(w,h,d,m,x,y,z,rx)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);if(rx)o.rotation.x=rx;body.add(o);return o};
  box(.26,.22,.5,plast,0,.95,-.18,-.12);/* réservoir */box(.24,.08,.72,seatM,0,1.02,.32,.06);/* selle */box(.3,.12,.5,plast,0,.9,.62,-.25);/* garde-boue arrière */
  box(.16,.32,.42,dark,0,.6,-.05);/* moteur */box(.05,.42,.3,new THREE.MeshLambertMaterial({map:numTex}),.14,.86,.42,-.1);box(.05,.42,.3,new THREE.MeshLambertMaterial({map:numTex}),-.14,.86,.42,-.1);
  box(.3,.36,.06,new THREE.MeshLambertMaterial({map:numTex}),0,1.05,-.62,-.35);/* plaque avant */
  const ex=new THREE.Mesh(new THREE.CylinderGeometry(.05,.06,.75,8),metal);ex.rotation.x=Math.PI/2-.25;ex.position.set(.16,.8,.42);body.add(ex);
  const swing=new THREE.Group();swing.position.set(0,.55,.15);body.add(swing);{const a=new THREE.Mesh(new THREE.BoxGeometry(.2,.06,.62),metal);a.position.set(0,-.08,.3);swing.add(a)}
  /* avant : fourche qui s'enfonce (compression visuelle), guidon */
  const front=new THREE.Group();front.position.set(0,1.12,-.48);body.add(front);
  for(const s of [-1,1]){const t=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,.8,8),metal);t.position.set(s*.11,-.38,-.12);t.rotation.x=-.42;front.add(t)}
  const bar=new THREE.Mesh(new THREE.BoxGeometry(.78,.035,.035),dark);bar.position.set(0,.12,.04);front.add(bar);const ff=new THREE.Mesh(new THREE.BoxGeometry(.18,.05,.5),plast);ff.position.set(0,-.48,-.38);ff.rotation.x=-.1;front.add(ff);
  function wheel(r){const w=new THREE.Group();const t=new THREE.Mesh(new THREE.TorusGeometry(r-.06,.07,8,22),tyre);t.rotation.y=Math.PI/2;w.add(t);for(let i=0;i<10;i++){const k=new THREE.Mesh(new THREE.BoxGeometry(.15,.035,.035),tyre);const a=i/10*Math.PI*2;k.position.set(0,Math.cos(a)*(r-.01),Math.sin(a)*(r-.01));k.rotation.x=a;w.add(k)}
    const rim=new THREE.Mesh(new THREE.TorusGeometry(r-.13,.015,4,22),metal);rim.rotation.y=Math.PI/2;w.add(rim);const hub=new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,.16,8),metal);hub.rotation.z=Math.PI/2;w.add(hub);return w}
  const wF=wheel(.42),wR=wheel(.4);wF.position.set(0,-.72,-.32);front.add(wF);wR.position.set(0,.4,.73);body.add(wR);
  const human=buildHuman(look);human.rotation.y=Math.PI/2;human.position.set(0,.58,.18);g.add(human);g.human=human;
  g.moto={body,front,wF,wR,swing};g.phys=gp.phys;return g}

MODES.motocross=function(cfg,look,ctx){
  const P_=cfg.params||{},course=cfg.mode==='course',eco=S().quality==='eco',seedI=strSeed(cfg.seed);const R=rngAt(seedI,5,11);
  const env={fogNear:170,fogFar:720,hemiGround:0x6a4a2a,accent:'#ff6a1f',cloudY:170,light:.85};
  const root=new THREE.Group();scene.add(root);
  const JS=[.8,1,1.25][P_.jumps??1],GP=gearOf('moto',look.gear.moto).phys;
  const park=makePark({root,top:0x8a5a34,side:0x5a3a20,lip:0xffd23a,rail:0xff6a1f});
  const HW=5.2,TW=2*HW+2.4;/* demi-largeur de piste ; les modules du circuit couvrent toute la largeur (pas de flanc à longer) */const C=[];/* ligne centrale : échantillons {x,z,h} tous les 2 m */
  const cell=new Map(),CK=(i,j)=>i*73856093^j*19349663;function pushC(x,z,h,s){const p={x,z,h,s};C.push(p);const k=CK(Math.floor(x/12),Math.floor(z/12));let a=cell.get(k);if(!a){a=[];cell.set(k,a)}a.push(p)}
  function nearC(x,z){let best=1e9,bp=null;const i0=Math.floor(x/12),j0=Math.floor(z/12);for(let i=i0-1;i<=i0+1;i++)for(let j=j0-1;j<=j0+1;j++){const a=cell.get(CK(i,j));if(a)for(const p of a){const d=(p.x-x)*(p.x-x)+(p.z-z)*(p.z-z);if(d<best){best=d;bp=p}}}return bp?{d:Math.sqrt(best),p:bp}:{d:1e9,p:null}}
  const lines=[],gatesList=[],A=120;let startYaw=0,startX=0,startZ=0,LEN=0;
  /* ---------- PARCOURS : piste en serpentin (cap toujours vers le nord ±80° → jamais de croisement) ---------- */
  if(course){let x=0,z=0,h=0,s=0;const st=(len,feat)=>{const fx=Math.sin(h),fz=-Math.cos(h);const x0=x,z0=z;for(let d=0;d<len;d+=2){pushC(x+fx*d,z+fz*d,h,s+d)}
      if(feat)feat(x0,z0,h,len);x+=fx*len;z+=fz*len;s+=len};
    const turn=(ang,Rr)=>{const dir=Math.sign(ang),cxp=x+Math.cos(h)*Rr*dir,czp=z+Math.sin(h)*Rr*dir;const a0=Math.atan2(z-czp,x-cxp);const n=Math.max(3,Math.round(Math.abs(ang)*Rr/2));
      for(let i=1;i<=n;i++){const a=a0+ang*i/n;pushC(cxp+Math.cos(a)*Rr,czp+Math.sin(a)*Rr,h+ang*i/n,s+Math.abs(ang)*Rr*i/n)}
      /* berm extérieur : arc relevé autour du centre du virage */const aE=a0+ang;park.addRadial('berm',cxp,czp,Math.min(a0,aE),Math.max(a0,aE),Rr+HW-1.2,8.5,1.7*JS,{up:4.2,flat:.8,top:0x7a4c2b,taper:.35});
      x=cxp+Math.cos(aE)*Rr;z=czp+Math.sin(aE)*Rr;h+=ang;s+=Math.abs(ang)*Rr};
    const feats=['table','double','whoops','step','triple','table','double'];
    st(30,null);startYaw=0;
    for(let i=0;i<cfg.len;i++){const ft=feats[Math.floor(R()*feats.length)];const L=46+R()*24;
      st(L,(x0,z0,hh,len)=>{const fx=Math.sin(hh),fz=-Math.cos(hh);const at=d=>[x0+fx*d,z0+fz*d];let d=10;
        if(ft==='table'){const [a,b]=at(d);park.add('table',a,b,hh,20,TW,1.6*JS,{up:6,flat:8,tag:'table'});lines.push({k:ft,x:a,z:b,yaw:hh})}
        else if(ft==='double'){const [a,b]=at(d);park.add('kicker',a,b,hh,6,TW,1.8*JS,{tag:'kicker',pow:1.7,back:3});const [c2,d2]=at(d+6+10*JS-4.2);park.add('table',c2,d2,hh,16.2,TW,1.8*JS,{up:3.2,flat:1,tag:'landing',upPow:1});lines.push({k:ft,x:a,z:b,yaw:hh})}
        else if(ft==='triple'){const [a,b]=at(d-4);park.add('kicker',a,b,hh,7,TW,2.3*JS,{tag:'kicker',pow:1.7,back:3});const [c2,d2]=at(d+3+16*JS-4.4);park.add('table',c2,d2,hh,20.4,TW,2.4*JS,{up:3.4,flat:1,tag:'landing',upPow:1});lines.push({k:ft,x:a,z:b,yaw:hh})}
        else if(ft==='whoops'){const [a,b]=at(d);park.add('whoops',a,b,hh,len-20,TW,.55,{n:Math.round((len-20)/4),tag:'whoops'})}
        else{const [a,b]=at(d);park.add('step',a,b,hh,8,TW,1.4*JS,{up:5,tag:'step'});const [c2,d2]=at(d+8);park.add('landing',c2,d2,hh,10,TW,1.4*JS,{flat:4,tag:'landing',upPow:1});lines.push({k:ft,x:a,z:b,yaw:hh})}});
      if(i<cfg.len-1){gatesList.push({x,z,y:0,yaw:h,hw:HW+.6,h:6});const nh=(Math.abs(h)>.35?-Math.sign(h):(R()<.5?-1:1))*(.4+R()*.9);turn(clamp(nh-h,-2.6,2.6),16+R()*8)}}
    st(30,null);gatesList.push({x,z,y:0,yaw:h,hw:HW+1.5,h:7});LEN=s}
  else{/* ---------- ARÈNE FREESTYLE : lignes FMX, tables, step-ups, whoops, berms dans les coins ---------- */
    for(let a=0;a<96;a++){const t=a/96*Math.PI*2;pushC(Math.cos(t)*A*.82,Math.sin(t)*A*.6,Math.atan2(-Math.sin(t)*A*.82,-Math.cos(t)*A*.6),0)}/* boucle de liaison (repère « piste ») */
    for(let i=0;i<8;i++){const t=i/8*Math.PI*2+.2,cx=Math.cos(t)*A*.82,cz=Math.sin(t)*A*.6,hh=Math.atan2(-Math.sin(t)*A*.82,-Math.cos(t)*A*.6)*0+t+Math.PI/2;const yaw=Math.atan2(-Math.sin(t)*.82,-Math.cos(t)*.6);
      const fx=Math.sin(yaw),fz=-Math.cos(yaw);const k=i%4;
      if(k===0){park.add('kicker',cx-fx*14,cz-fz*14,yaw,7,8,2.8*JS,{tag:'fmx',pow:1.7,back:4.5});{const u0=-7+17*JS-8.4;park.add('table',cx+fx*u0,cz+fz*u0,yaw,26.4,12,3.6*JS,{up:7,flat:1.4,tag:'landing',upPow:1})}lines.push({k:'fmx',x:cx-fx*14,z:cz-fz*14,yaw})}
      else if(k===1){park.add('table',cx-fx*12,cz-fz*12,yaw,24,10,2*JS,{up:7,flat:9,tag:'table'});lines.push({k:'table',x:cx-fx*12,z:cz-fz*12,yaw})}
      else if(k===2){park.add('kicker',cx-fx*10,cz-fz*10,yaw,6,8,2*JS,{tag:'kicker',pow:1.7,back:3});{const u0=-4+11*JS-4.2;park.add('table',cx+fx*u0,cz+fz*u0,yaw,15.2,10,2*JS,{up:3.2,flat:1,tag:'landing',upPow:1})}lines.push({k:'double',x:cx-fx*10,z:cz-fz*10,yaw})}
      else{park.add('whoops',cx-fx*12,cz-fz*12,yaw,24,9,.55,{n:6,tag:'whoops'})}}
    /* grande ligne FMX au centre (le « big air ») */
    park.add('kicker',-6,22,0,8,9,3.4*JS,{tag:'fmx',pow:1.7,back:5});park.add('table',-6,14-20*JS+8.5,0,26.5,14,4.4*JS,{up:7,flat:1.5,tag:'landing',upPow:1});lines.push({k:'fmx',x:-6,z:22,yaw:0});
    startX=-6;startZ=60;startYaw=0}
  park.finalize();
  /* panneaux « vitesse conseillée » devant chaque saut à franchir : portée balistique (lèvre → début de la réception), corrigée sur nos essais */
  {const kicks=park.mods.filter(m=>m.type==='kicker');for(const k of kicks){const land=park.mods.find(l=>l.tag==='landing'&&!l.radial&&Math.abs(l.yaw-k.yaw)<.05&&((l.x-k.x)*k.fx+(l.z-k.z)*k.fz)>k.L&&Math.abs((l.x-k.x)*k.rx+(l.z-k.z)*k.rz)<2);if(!land)continue;
    const lipX=k.x+k.fx*k.lipU,lipZ=k.z+k.fz*k.lipU;const D=(land.x-lipX)*k.fx+(land.z-lipZ)*k.fz+(land.us?land.us[13]||0:0);const th=Math.atan(1.7*k.H/k.lipU),g=9.81*.92,c2=Math.cos(th)**2,den=2*c2*(k.H+D*Math.tan(th)-land.H);if(den<=0)continue;
    const vl=Math.sqrt(g*D*D/den),va=Math.sqrt(vl*vl+2*9.81*k.H)*1.18;k.vRec=va;const sp=textSprite('Saut '+Math.round(D)+' m · '+Math.round(va*3.6/5)*5+' km/h',0xffd23a,5.2);sp.position.set(k.x-k.fx*6,3.2,k.z-k.fz*6);root.add(sp)}}
  /* ---------- sol, piste peinte, décor ---------- */
  {const S_=course?900:420;const gm=detailMaterial(new THREE.MeshLambertMaterial({color:0x6d7d3e}),{amp:.18});const fl=new THREE.Mesh(new THREE.PlaneGeometry(S_*2,S_*2),gm);fl.rotation.x=-Math.PI/2;fl.position.set(0,-.01,course?-S_*.6:0);fl.receiveShadow=true;root.add(fl);
    /* ruban de terre sur la ligne centrale (visuel ; le relief des sauts vient des modules) */
    const pos=[],col=[];const c1=new THREE.Color(0x8a5a34),c2=new THREE.Color(0x7a4e2c);const w=HW+.5;
    for(let i=0;i<C.length-1;i++){const a=C[i],b=C[i+1];if(Math.hypot(a.x-b.x,a.z-b.z)>6)continue;const ra=[Math.cos(a.h),Math.sin(a.h)],rb=[Math.cos(b.h),Math.sin(b.h)];const cc=i%2?c1:c2;
      const P=[[a.x-ra[0]*w,.015,a.z-ra[1]*w],[a.x+ra[0]*w,.015,a.z+ra[1]*w],[b.x+rb[0]*w,.015,b.z+rb[1]*w],[b.x-rb[0]*w,.015,b.z-rb[1]*w]];for(const k of [0,1,2,0,2,3]){pos.push(...P[k]);col.push(cc.r,cc.g,cc.b)}}
    if(!course){const a=C[C.length-1],b=C[0];const ra=[Math.cos(a.h),Math.sin(a.h)],rb=[Math.cos(b.h),Math.sin(b.h)];const P=[[a.x-ra[0]*w,.015,a.z-ra[1]*w],[a.x+ra[0]*w,.015,a.z+ra[1]*w],[b.x+rb[0]*w,.015,b.z+rb[1]*w],[b.x-rb[0]*w,.015,b.z-rb[1]*w]];for(const k of [0,1,2,0,2,3]){pos.push(...P[k]);col.push(c1.r,c1.g,c1.b)}
      const big=new THREE.Mesh(new THREE.CircleGeometry(A*.95,40),detailMaterial(new THREE.MeshLambertMaterial({color:0x93623a}),{amp:.2}));big.scale.set(.86/.95,1,.64/.95);big.rotation.x=-Math.PI/2;big.position.y=.006;root.add(big)}
    const tg=new THREE.BufferGeometry();tg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));tg.setAttribute('color',new THREE.Float32BufferAttribute(col,3));tg.computeVertexNormals();const tm=new THREE.Mesh(tg,detailMaterial(new THREE.MeshLambertMaterial({vertexColors:true}),{amp:.22}));tm.receiveShadow=true;root.add(tm);
    /* piquets + rubalise en bord de piste (repères de trajectoire, sans collision) */
    const stakeN=Math.min(eco?160:420,Math.floor(C.length*2/3));const sg=new THREE.CylinderGeometry(.04,.04,1,5);sg.translate(0,.5,0);const st=new THREE.InstancedMesh(sg,new THREE.MeshLambertMaterial({color:0xf2f2ee}),stakeN);let n=0;
    for(let i=0;i<C.length&&n<stakeN;i+=3)for(const sd of [-1,1]){if(n>=stakeN)break;const p=C[i];_dv.set(p.x+Math.cos(p.h)*(HW+1.6)*sd,0,p.z+Math.sin(p.h)*(HW+1.6)*sd);_dq.identity();_ds.set(1,1,1);_dm.compose(_dv,_dq,_ds);st.setMatrixAt(n++,_dm)}st.count=n;root.add(st);
    const rr=rngAt(seedI,8,8);mountainRing(root,eco?10:18,600,780,60,160,0x6a6250,0xb9b19b,new THREE.Color(0xcfe3ef),rr);
    const treeG=treeGeometry(1.6,5.5),treeN=eco?80:220,trees=new THREE.InstancedMesh(treeG,new THREE.MeshLambertMaterial({color:0x2e5030}),treeN);n=0;
    for(let i=0;i<treeN*3&&n<treeN;i++){const x=(rr()-.5)*(course?500:420),z=course?-rr()*Math.max(200,-Math.min(0,...C.map(p=>p.z).slice(-1)))-40+60:(rr()-.5)*420;if(nearC(x,z).d<22||Math.abs(x)<A*.95&&Math.abs(z)<A*.7&&!course)continue;_dv.set(x,0,z);_ds.setScalar(.8+rr()*.8);_dq.identity();_dm.compose(_dv,_dq,_ds);trees.setMatrixAt(n++,_dm)}trees.count=n;root.add(trees);
    /* public le long de la piste */const crowdN=eco?50:150,cg=new THREE.InstancedMesh(PEOPLE_GEO.b,new THREE.MeshLambertMaterial({color:0xffffff}),crowdN),hg=new THREE.InstancedMesh(PEOPLE_GEO.h,new THREE.MeshLambertMaterial({color:0xd9a77f}),crowdN);n=0;
    for(let i=0;i<crowdN;i++){const p=C[Math.floor(rr()*C.length)];const sd=rr()<.5?-1:1,o=HW+6+rr()*5;_dv.set(p.x+Math.cos(p.h)*o*sd,0,p.z+Math.sin(p.h)*o*sd);_dq.setFromAxisAngle(_dy,p.h+(sd>0?-Math.PI/2:Math.PI/2));_ds.set(1,1,1);_dm.compose(_dv,_dq,_ds);cg.setMatrixAt(n,_dm);hg.setMatrixAt(n,_dm);cg.setColorAt(n,new THREE.Color(PEOPLE_COLS[n%PEOPLE_COLS.length]));n++}root.add(cg);root.add(hg)}
  if(course&&C.length){const a=C[C.length-1];root.add(finishArch(a.x,0,a.z,-a.h,HW+2,7))}
  const groundH=(x,z)=>park.H(x,z);
  /* ---------- rider + moto ---------- */
  const rig=buildMoto(look);castAll(rig,true,false);root.add(rig);const human=rig.human,MK=rig.moto;
  const blob=makeBlob(root,2);const roost=makeParticles(eco?60:220,.55,.8,root),roostFade=new THREE.Color(0xb39a7c);const dust=makeParticles(eco?24:90,2.4,.32,root),dustFade=new THREE.Color(0xd8c9b0);
  const trail=makeTrail(root,{n:120,w:.13,color:0x4a3020,fade:0x8a5a34,opacity:.45,life:7,step:.4,lift:.02,hf:(x,z)=>groundH(x,z)+.01});
  const St={pos:V3(),vel:V3(),yaw:startYaw,air:false,airT:0,pitch:0,pitchV:0,flipT:0,whip:0,whipMax:0,fmx:null,fmxT:0,fmxName:'',fmxBack:0,scrub:0,steerHist:0,hmax:0,takeY:0,dist0:V3(),comp:0,compV:0,thr:0,rpm:0,gear:1,steer:0,slide:0,lastI:null,offT:0,crashGrace:0};
  St.pos.set(startX,0,startZ);{const v0=(ctx.boost?9:5);St.vel.set(Math.sin(startYaw)*v0,0,-Math.cos(startYaw)*v0)}
  const stats={score:0,dist:0,vmax:0,time:0,airs:0,best:'',bestPts:0,tricks:0,bigAir:0,maxAir:0,maxH:0,maxDist:0,whips:0,flips:0,gates:0,pen:0};
  const n=V3(0,1,0),nSm=V3(0,1,0),fw=V3(),rgt=V3(),up=V3(),m4=new THREE.Matrix4(),q1=new THREE.Quaternion(),AXX=new THREE.Vector3(1,0,0),AYY=new THREE.Vector3(0,1,0),tmp=V3(),look3=V3(),gt=V3(),b=V3(),p0=V3(),prevP=V3();
  const G=9.81,wrapA=a=>Math.atan2(Math.sin(a),Math.cos(a));let camYaw=startYaw,airCam=0,land=0,az=0,tN=0,roostT=0,HITm=null;
  const velYaw=()=>Math.atan2(St.vel.x,-St.vel.z),hsp=()=>Math.hypot(St.vel.x,St.vel.z);
  let gates=course?makeGates(root,gatesList,0xff6a1f,{lenient:true}):null;const finishT=course?LEN/15.5+4:0;
  const spots=course?null:makeSpots(root,{rng:rngAt(seedI,4,9),n:2,mods:()=>park.mods.filter(m=>m.tag!=='landing'&&!m.radial),ok:m=>true,pos:m=>({x:m.x+m.fx*m.L/2,y:m.y0+m.H,z:m.z+m.fz*m.L/2}),
    pick:(m,r)=>{const T={fmx:[['Superman',/Superman/],['Backflip',/Backflip/],['Whip XXL',null,'whip'],['BIG AIR',null,'big']],kicker:[['Whip',/Whip/],['Nac-nac',/Nac/],['Scrub',/Scrub/]],table:[['Heel clicker',/Heel/],['Whip',/Whip/],['Scrub',/Scrub/]],whoops:[['Whoops à fond',/Whoops/]],step:[['Air',/./]]}[m.tag]||[['Air',/./]];
      const c=T[Math.floor(r()*T.length)];return {label:c[0],bonus:500+Math.round(r()*3)*100,r:12,test:(nm,info)=>c[1]?c[1].test(nm):c[2]==='whip'?(info.whip||0)>1.1:(info.h||0)>6}}});
  /* ---------- son moteur : oscillateurs synthétisés (aucun fichier), régime selon vitesse et rapport ---------- */
  const ENG=(()=>{if(!actx)return null;try{const o1=actx.createOscillator(),o2=actx.createOscillator(),lp=actx.createBiquadFilter(),sh=actx.createWaveShaper(),g=actx.createGain();o1.type='sawtooth';o2.type='square';
      const curve=new Float32Array(256);for(let i=0;i<256;i++){const x=i/128-1;curve[i]=Math.tanh(x*2.4)}sh.curve=curve;lp.type='lowpass';lp.frequency.value=900;lp.Q.value=2;g.gain.value=0;
      const g2=actx.createGain();g2.gain.value=.5;o1.connect(sh);o2.connect(g2);g2.connect(sh);sh.connect(lp);lp.connect(g);g.connect(master);o1.frequency.value=40;o2.frequency.value=20;o1.start();o2.start();return {o1,o2,lp,g}}catch(e){return null}})();
  function engine(dt,live){if(!ENG)return;const t=actx.currentTime;const sp=hsp();const GEARS=[0,7,12,17,22,28];let g_=1;while(g_<5&&sp>GEARS[g_]*.92)g_++;
    if(g_!==St.gear&&live&&!St.air){St.gear=g_;burst('lowpass',260,1,.12,.12)}const lo=GEARS[g_-1],hi=GEARS[g_];let rpm=St.air?(St.thr>0?.95:.35):clamp((sp-lo)/(hi-lo),0,1)*.75+.2+St.thr*.08;St.rpm+=(rpm-St.rpm)*(1-Math.exp(-8*dt));
    const f=36+St.rpm*120,vol=quiet||!live&&state!=='demo'?0:(.05+St.thr*.07+St.rpm*.04)*(S().sfxVol??1);ENG.o1.frequency.setTargetAtTime(f,t,.03);ENG.o2.frequency.setTargetAtTime(f*.5,t,.03);ENG.lp.frequency.setTargetAtTime(500+St.rpm*1600+St.thr*500,t,.05);ENG.g.gain.setTargetAtTime(vol,t,.05)}
  /* ---------- orientation : assiette (pitch) autour de l'essieu, whip = lacet de la moto sous le pilote ---------- */
  function orient(h){up.copy(St.air?nSm.lerp(AYY,1-Math.exp(-3*(h||1))).normalize():nSm.lerp(n,h?1-Math.exp(-14*h):1).normalize());
    fw.set(Math.sin(St.yaw),0,-Math.cos(St.yaw));fw.addScaledVector(up,-fw.dot(up)).normalize();rgt.crossVectors(fw,up).normalize();tmp.copy(fw).negate();m4.makeBasis(rgt,up,tmp);rig.quaternion.setFromRotationMatrix(m4);
    if(St.air&&St.pitch){q1.setFromAxisAngle(AXX,St.pitch);rig.quaternion.multiply(q1)}
    MK.body.rotation.set(0,St.whip*.75,St.whip*.55);/* whip : la moto pivote et se couche sous le pilote */
    rig.position.copy(St.pos);MK.front.position.y=1.12+St.comp*.18;MK.front.rotation.y=St.steer*.35;MK.body.position.y=-St.comp*.12}
  function takeoff(){St.air=true;St.pArm=false;St.airT=0;St.flipT=0;St.whip=0;St.whipMax=0;St.fmx=null;St.fmxT=0;St.fmxBack=0;St.hmax=0;St.takeY=St.pos.y;St.dist0.copy(St.pos);St.takeMod=HITm;
    /* assiette de départ = pente de la lèvre ; scrub = moto couchée en tournant juste avant la lèvre */
    St.pitch=Math.atan2(St.vel.y,Math.max(1,hsp()));St.scrub=0;/* assiette > 0 = nez en haut */
    if(Math.abs(St.steerHist)>.55&&hsp()>12&&St.vel.y>2){St.scrub=Math.abs(St.steerHist);St.vel.y*=.8;St.vel.x*=1.04;St.vel.z*=1.04}}
  const crash=(t,x)=>{for(let i=0;i<(eco?10:26);i++)roost.spawn(St.pos.x,St.pos.y+.3,St.pos.z,(Math.random()-.5)*6,1+Math.random()*3,(Math.random()-.5)*6,1.2,.55,.4,.28);buzz([60,40,80]);sfx.thud(1);ctx.crash(t,x);return true};
  function airTrick(){const flips=Math.round(Math.abs(St.flipT)/(2*Math.PI)),dist=Math.hypot(St.pos.x-St.dist0.x,St.pos.z-St.dist0.z);const parts=[];
    if(flips)parts.push((flips>1?'Double ':'')+(St.flipT>0?'Backflip':'Frontflip'));if(St.fmxName)parts.push(St.fmxName);if(St.whipMax>.75)parts.push(St.whipMax>1.15?'Whip XXL':'Whip');if(St.scrub)parts.push('Scrub');
    let name=parts.join(' · ');const big=St.hmax>6||St.airT>2.1;if(!name)name=big?'BIG AIR':St.airT>1.2?'Air':'Saut';
    const pts=Math.round(40*St.airT+dist*4+St.hmax*25+flips*900+(St.fmxName?250+St.fmxT*180:0)+(St.whipMax>.75?120+St.whipMax*140:0)+(St.scrub?120:0));return {name,pts,flips,dist,big}}
  /* ---------- un pas de physique ---------- */
  function step(h,I,live){St.lastI=I;
    if(!St.air){const g0=park.ground(St.pos.x,St.pos.z);HITm=g0.m;park.normal(St.pos.x,St.pos.z,n);
      gt.set(0,-G,0).addScaledVector(n,G*n.y);St.vel.addScaledVector(gt,h);St.vel.addScaledVector(n,-St.vel.dot(n));
      let sp=St.vel.length();St.steer+=(I.x-St.steer)*(1-Math.exp(-6*h));St.steerHist=St.steerHist*Math.exp(-5*h)+St.steer*(1-Math.exp(-5*h));
      St.yaw+=St.steer*clamp(8.5/Math.max(sp,2.2),.5,2.2)*(GP.turn||1)*h;
      b.set(Math.sin(St.yaw),0,-Math.cos(St.yaw));b.addScaledVector(n,-b.dot(n)).normalize();
      /* adhérence latérale limitée (terre) : au-delà, la moto glisse et « roost » */
      if(sp>.3){const dir=V3t.copy(St.vel).divideScalar(sp),tgt=V3u.copy(b).multiplyScalar(dir.dot(b)>=0?1:-1);const ang=Math.acos(clamp(dir.dot(tgt),-1,1));const ALAT=(GP.grip||8.5)+(n.y<.97?5:0);const stp=Math.min(ang,ALAT/Math.max(sp,1)*h);
        if(ang>1e-4){dir.lerp(tgt,stp/ang).normalize();St.vel.copy(dir).multiplyScalar(sp)}St.slide=clamp((ang-.04)*1.6,0,1);
        /* la moto revient dans l'axe de la trajectoire si on ne braque pas fort */const dy=wrapA(velYaw()-St.yaw),dd=Math.abs(dy)<=Math.PI/2?dy:wrapA(dy+Math.PI);St.yaw+=dd*(1-Math.exp(-(Math.abs(St.steer)>.5?1.2:3.5)*h))}
      St.thr+=((I.y>0?1:0)-St.thr)*(1-Math.exp(-10*h));const off=course?nearC(St.pos.x,St.pos.z).d>HW+1.2:(St.pos.x*St.pos.x)/(105*105)+(St.pos.z*St.pos.z)/(78*78)>1;St.off=off;
      St.stun=(St.stun||0)-h;if(I.y>0&&St.stun<=0){const f=St.vel.dot(b),top=(GP.top||27)*(off?.7:1);St.vel.addScaledVector(b,(GP.power||7.2)*clamp(1-f/top,0,1)*h)}
      if(I.y<0){const s2=St.vel.length();if(s2>.01)St.vel.multiplyScalar(Math.max(0,s2-8.5*h)/s2)}
      sp=St.vel.length();const dec=.25+(off?1.6:0)+.0045*sp*sp;if(sp>1e-3)St.vel.multiplyScalar(Math.max(0,sp-dec*h)/sp);
      /* « pre-load » : Espace maintenu comprime la suspension, relâché = saut un peu plus haut (et pop sur le plat) */
      if(I.a)St.preload=Math.min(1,(St.preload||0)+h*2.2);else if(St.preload>0){const c=St.preload;St.preload=0;if(HITm&&!HITm.radial&&(HITm.type==='kicker'||HITm.type==='table'||HITm.type==='step')){St.vel.addScaledVector(n,1+1.4*c)}else St.vel.addScaledVector(n,1.6+1.8*c);St.compV-=2*c}
      prevP.copy(St.pos);St.pos.addScaledVector(St.vel,h);
      const g=park.ground(St.pos.x,St.pos.z),gy=g.h;
      if(gy-St.pos.y>.65&&gy-St.pos.y>Math.abs(St.vel.y*h)*3+.15){/* une marche ≤ 65 cm s'avale (bosse) ; au-delà : face verticale.
          On rebondit en glissant le long de la face ; chute seulement si on la prend vraiment de face et vite */
        St.pos.copy(prevP);const wn=park.wallNormal(g.m,prevP.x,prevP.z);const imp=wn?-(St.vel.x*wn.x+St.vel.z*wn.z):hsp();
        if(live&&imp>9.5)return ['Contre le flanc','Face du saut prise à '+Math.round(imp*3.6)+' km/h : arrive dans l\'axe des bosses.'];
        if(wn&&imp>0){St.vel.x+=wn.x*(imp*1.4+1.5);St.vel.z+=wn.z*(imp*1.4+1.5);St.yaw+=wrapA(Math.atan2(St.vel.x,-St.vel.z)-St.yaw)*.5}else{St.vel.x*=-.25;St.vel.z*=-.25}St.vel.multiplyScalar(.85);St.stun=.4;if(live&&imp>2){sfx.thud(.3+imp*.03);toast('Bonk !');camShake(.2+imp*.02);if(imp>4)ctx.comboBreak()}}
      else if(gy>=St.pos.y-.02){const vin=St.vel.y;St.pos.y=gy;park.normal(St.pos.x,St.pos.z,n);const vn=-St.vel.dot(n);if(vn>0){St.vel.addScaledVector(n,vn);St.compV+=vn*.12}}
      else{/* décollage si la vitesse s'éloigne de la nouvelle surface (lèvre convexe) ; sinon on colle aux descentes */park.normal(St.pos.x,St.pos.z,V3t);const away=St.vel.dot(V3t);
        if(away>.8||St.pos.y-gy>=Math.max(.06,hsp()*h*.3))takeoff();else{St.pos.y=gy;n.copy(V3t)}}}
    else{/* ---------- EN L'AIR ---------- */
      St.vel.y-=G*.92*h;St.pos.addScaledVector(St.vel,h);St.airT+=h;const gy=groundH(St.pos.x,St.pos.z);St.hmax=Math.max(St.hmax,St.pos.y-Math.max(gy,St.takeY));const ASS=S().sbAssist!==false;
      const ttg=(St.pos.y-gy)/Math.max(.1,-St.vel.y);St.thr+=((I.y>0?1:0)-St.thr)*(1-Math.exp(-10*h));
      /* figures freestyle : Shift/F maintenu = le pilote lâche la moto (pas de contrôle d'assiette) */
      const fmxOn=I.g&&St.airT>.15;if(fmxOn&&!St.fmx){St.fmx=I.x?'Nac-nac':I.y<0?'Heel clicker':'Superman';St.fmxName=St.fmx}
      if(St.fmx){if(fmxOn){St.fmxT+=h;St.fmxBack=0}else{St.fmxBack+=h;if(St.fmxBack>.22)St.fmx=null}}
      /* assiette : ↓ cabre (backflip si on insiste), ↑ plonge ; sans touche elle suit doucement la trajectoire */
      const trajP=Math.atan2(St.vel.y,Math.max(1,hsp()));let tgtP=trajP;
      if(I.y===0)St.pArm=true;/* il faut relâcher gaz/frein après le décollage pour piloter l'assiette (pas de flip involontaire en gardant les gaz) */
      if(!St.fmx&&St.pArm&&I.y!==0&&!(ASS&&ttg<.2)){const r=(I.y<0?3.6:2.6)*(GP.pitch||1);St.pitch+=(I.y<0?r:-r)*h;St.flipT+=(I.y<0?r:-r)*h}
      else{/* flip entamé au-delà de ~140° : il se termine ; sinon on revient à l'assiette de la trajectoire */const TP=2*Math.PI,fr0=Math.abs(St.flipT)%TP;if(Math.abs(St.flipT)>.6*Math.PI&&fr0>(ASS?.38:.55)*TP){const tg=Math.sign(St.flipT)*Math.ceil(Math.abs(St.flipT)/TP)*TP;const need=tg-St.flipT,st=Math.sign(need)*Math.min(Math.abs(need),(ASS?Math.max(2.4,Math.abs(need)/Math.max(.15,ttg-.05)):2.4)*h);St.flipT+=st;St.pitch+=st}
        else{const k=1-Math.exp(-(ASS&&ttg<.35?4.5:1.2)*h);const d=wrapA(tgtP-St.pitch);St.pitch+=d*k;if(Math.abs(St.flipT)<Math.PI)St.flipT*=1-k}}
      /* whip : ← → couche la moto ; relâché, elle revient (plus vite en assisté près du sol) */
      if(!St.fmx&&I.x!==0&&St.airT>.12&&!(ASS&&ttg<.22)){St.whip=clamp(St.whip+I.x*3.2*h,-1.45,1.45)}else St.whip*=Math.exp(-(ASS&&ttg<.45?9:3.2)*h);St.whipMax=Math.max(St.whipMax,Math.abs(St.whip));
      if(St.pos.y<=gy){const g=park.ground(St.pos.x,St.pos.z);park.normal(St.pos.x,St.pos.z,n);const vn=-St.vel.dot(n),hv=hsp();
        const slopeP=Math.atan2(-(n.x*Math.sin(St.yaw)-n.z*Math.cos(St.yaw)),n.y);/* pente de réception dans l'axe */const pd=Math.abs(wrapA(St.pitch-slopeP));
        if(live){if(St.fmx)return ['Pas revenu sur la moto','Lâche Shift/F au moins 0,3 s avant la réception.'];
          if(pd>(ASS?.85:.6))return [St.pitch-slopeP>0?'Réception sur la roue arrière':'Réception sur la roue avant','Assiette à '+Math.round(pd*57)+'° de la pente : ↓ cabre, ↑ plonge. Vise la pente de réception.'];
          if(Math.abs(St.whip)>(ASS?.75:.5))return ['Whip pas ramené','La moto était encore couchée ('+Math.round(Math.abs(St.whip)*57)+'°) à l\'atterrissage.'];
          if(vn>(GP.susp||15.5))return ['Réception trop violente','Impact à '+vn.toFixed(1)+' m/s : la suspension a talonné. Vise la descente du saut.']}
        St.pos.y=g.h;St.vel.addScaledVector(n,-St.vel.dot(n));St.vel.multiplyScalar(1-pd*.25-(vn>11?.12:0));St.air=false;nSm.copy(n);HITm=g.m;St.compV+=vn*.22;
        const T=airTrick();const lq=pd<.18&&Math.abs(St.whip)<.2&&vn<9?'perfect':pd<.45&&vn<12.5?'clean':'sketchy';St.pitch=0;
        if(live){land=clamp(vn/10,.25,1);human.impact(land*.6);camShake(land*.55);sfx.thud(.3+land*.5);for(let i=0;i<(eco?8:24);i++)roost.spawn(St.pos.x,St.pos.y+.1,St.pos.z,(Math.random()-.5)*5,.5+Math.random()*2*land,(Math.random()-.5)*5,1,.55,.4,.28);
          for(let i=0;i<(eco?2:6);i++)dust.spawn(St.pos.x,St.pos.y+.3,St.pos.z,(Math.random()-.5)*3,.5+Math.random(),(Math.random()-.5)*3,2.4,.85,.78,.66);
          if(St.airT>.55){stats.airs++;stats.maxAir=Math.max(stats.maxAir,St.airT);stats.maxH=Math.max(stats.maxH,St.hmax);stats.maxDist=Math.max(stats.maxDist,T.dist);stats.flips+=T.flips;if(St.whipMax>.75)stats.whips++;
            if(T.big){stats.bigAir++;if(ctx.slowmo)ctx.slowmo(.35,.45);toast('BIG AIR · '+St.hmax.toFixed(1)+' m',true);nearMissFx()}
            ctx.trick(T.name,T.pts,{land:lq,base:T.name,big:T.big});if(T.pts>stats.bestPts){stats.bestPts=T.pts;stats.best=T.name}
            if(spots)spots.test(T.name,{mod:St.takeMod,near:St.dist0,h:St.hmax,whip:St.whipMax},ctx)}}
        St.whip=0;St.fmx=null;St.fmxName='';St.flipT=0}}
    orient(h);return null}
  const V3t=V3(),V3u=V3();
  /* suspension (ressort amorti) : compression visuelle de la fourche et du châssis */
  function susp(dt){St.compV+=(-St.comp*90-St.compV*11)*dt;St.comp=clamp(St.comp+St.compV*dt,-.15,.6)}
  /* pilote auto (aperçu) : suit la ligne centrale / va vers les lignes de l'arène, gaz, whip parfois */
  let apI=0,apTrick=0,apNext=0;
  function auto(){const sp=hsp();if(!St.air&&sp<1.5){St.apStuck=(St.apStuck||0)+1/60;if(St.apStuck>1.2){St.apStuck=0;St.yaw+=Math.PI*.6}}else St.apStuck=0;let tx,tz;if(course){/* suit la ligne centrale en avançant (index monotone : pas de saut vers un autre bout de piste voisin) */let k=St.apK||0,bd=1e9;for(let j=Math.max(0,k-6);j<Math.min(C.length,k+40);j++){const d=(C[j].x-St.pos.x)**2+(C[j].z-St.pos.z)**2;if(d<bd){bd=d;k=j}}St.apK=k;const ahead=C[Math.min(C.length-1,k+Math.max(4,Math.round(sp*.55)))];tx=ahead.x;tz=ahead.z;const far=C[Math.min(C.length-1,k+14)];St.apCurve=Math.abs(wrapA(far.h-C[k].h))}
    else{/* arène : choisit une ligne, se place 30 m avant dans l'axe, puis la prend à fond */
      if(!apI||apI.ph===2){apI={l:lines[Math.floor(Math.random()*lines.length)],ph:0}}const l=apI.l,fx=Math.sin(l.yaw),fz=-Math.cos(l.yaw);
      if(apI.ph===0){tx=l.x-fx*32;tz=l.z-fz*32;if(Math.hypot(tx-St.pos.x,tz-St.pos.z)<9)apI.ph=1}else{tx=l.x+fx*60;tz=l.z+fz*60;if((St.pos.x-l.x)*fx+(St.pos.z-l.z)*fz>40)apI.ph=2}}
    if(St.air){if(St.airT<.1)apTrick=St.vel.y>4?Math.floor(Math.random()*4):0;const t=St.airT,up=St.vel.y>.5;return {x:apTrick===1&&up&&t>.15?1:0,y:0,a:false,g:apTrick===2&&up&&t>.2}}
    const want=Math.atan2(tx-St.pos.x,-(tz-St.pos.z)),dY=wrapA(want-St.yaw);const vT=course?(St.apCurve>.9?11:St.apCurve>.5?14:19):apI&&apI.ph===1?(apI.l.k==='fmx'?19:15):11;return {x:clamp(dY*2,-1,1),y:Math.abs(dY)>.9&&sp>9?-1:sp<vT?1:0,a:false,g:false}}
  return {env,stats,name:'Motocross',vScale:100,target:finishT,
    keys:[['↑ / ↓','gaz / frein · en l\'air : plonger / cabrer (backflip)'],['← →','braquer · en l\'air : whip'],['Shift / F','figure freestyle en l\'air (+ ← → / ↓)'],['Espace','maintenir = précharger la suspension · relâcher = saut'],['C','caméra']],
    touch:{u:'Gaz',d:'Frein',a:'Saut',g:'Freestyle'},
    inst:`<div class="ihead">Moto</div><div class="ro-grid"><div class="ro"><span>Rapport</span><b id="mGear">1</b></div><div class="ro"><span>Air</span><b id="mAir">—</b></div>
      <div class="ro"><span>Meilleure figure</span><b id="mBest" style="font-size:15px">—</b></div><div class="ro"><span>Plus haut</span><b id="mH">—</b></div></div>
      <div class="barline"><span id="mLbl">Assiette</span><div class="bt"><i id="mBar"></i></div><b id="mBarV">—</b></div>`,
    hudUpdate(){const g=$('#mGear');if(!g)return;g.textContent=St.air?'—':St.gear;$('#mAir').innerHTML=St.air?St.airT.toFixed(1)+'<small>s</small>':'—';$('#mBest').textContent=stats.best||'—';$('#mH').innerHTML=stats.maxH?stats.maxH.toFixed(1)+'<small>m</small>':'—';
      const bar=$('#mBar'),v=$('#mBarV'),lb=$('#mLbl');if(St.air){lb.textContent=St.fmx?'Figure':'Assiette';const tp=Math.atan2(St.vel.y,Math.max(1,hsp()));const d=St.fmx?clamp(St.fmxT/1.2,0,1):clamp(.5+wrapA(St.pitch-tp)/1.6,0,1);bar.style.width=Math.round(d*100)+'%';bar.classList.toggle('hot',St.fmx?false:Math.abs(d-.5)>.3);v.textContent=St.fmx?St.fmx:(Math.abs(d-.5)<.12?'ok':d>.5?'cabré':'plongé')}
      else{lb.textContent=St.off?'Hors piste':'Gaz';bar.style.width=Math.round(St.thr*100)+'%';bar.classList.toggle('hot',!!St.off);v.textContent=Math.round(St.rpm*100)+'%'}},
    prog(){return course&&gates?'Section <b>'+Math.min(gates.gates.filter(g=>g.done).length+1,gates.gates.length)+'</b>/'+gates.gates.length:''},
    auto,
    update(dt,I){const live=dt>0;tN+=dt;p0.copy(St.pos);
      const nS=live?Math.max(1,Math.ceil(dt*60)):1,h=dt/nS;for(let k=0;k<nS;k++){const r=step(h,I,live);if(r){crash(r[0],r[1]);return}}
      susp(dt);engine(dt,live||state==='demo');
      if(gates&&live){const g=gates.check(p0,St.pos);if(g){if(g.missed){stats.pen+=2;feed('Porte '+(g.i+1)+' coupée · +2 s');toast('+2 s',true)}else{stats.gates++;ctx.bonus(150,'Section '+(g.i+1))}ctx.checkpoint(g.i+1,gates.gates.length);if(!gates.next()){ding(990,.5);return ctx.finish(stats.time+stats.pen)}}
        /* sortie de piste prolongée en parcours : retour sur la piste (+3 s) */const nc=nearC(St.pos.x,St.pos.z);if(nc.p&&nc.d<HW+3)St.lastC=nc.p;if(nc.d>HW+14){St.offT+=dt;if(St.offT>2.5&&St.lastC){St.offT=0;const p=St.lastC;St.pos.set(p.x,0,p.z);St.yaw=p.h;St.vel.set(Math.sin(p.h)*6,0,-Math.cos(p.h)*6);stats.pen+=3;feed('Retour sur la piste · +3 s');toast('+3 s',true)}}else St.offT=0}
      if(spots)spots.update(tN);
      const sp=St.vel.length(),kmh=sp*3.6;if(live){stats.vmax=Math.max(stats.vmax,kmh);stats.time+=dt;stats.dist+=Math.hypot(St.pos.x-p0.x,St.pos.z-p0.z)}
      stats.score+=Math.hypot(St.pos.x-p0.x,St.pos.z-p0.z)*.12;land=Math.max(0,land-dt*2.2);
      /* whoops avalés à fond = figure */if(live&&!St.air&&HITm&&HITm.type==='whoops'&&sp>15){St.whT=(St.whT||0)+dt;if(St.whT>1.6){St.whT=-9;ctx.trick('Whoops à fond',220,{base:'Whoops'})}}else if(!HITm||HITm.type!=='whoops')St.whT=0;
      const rollW=sp*dt/.41;if(!St.air){MK.wF.rotation.x-=rollW;MK.wR.rotation.x-=rollW}else if(St.thr>0)MK.wR.rotation.x-=dt*40;
      /* pilote : debout sur les cale-pieds, buste en avant ; en freestyle, poses dédiées */
      const ps=St.fmx==='Superman'?{crouch:0,lean:1.2,back:1.1,spread:.2,stance:0,legSpread:.4}:St.fmx==='Nac-nac'?{crouch:.3,lean:.4,back:.9,spread:.3,stance:0,side:.5,legSpread:1}:St.fmx==='Heel clicker'?{crouch:.1,lean:-.2,back:1,spread:.1,stance:0,legSpread:.8}:
        St.air?{crouch:.45,lean:.55+(I.y>0?.3:I.y<0?-.3:0),back:.9,spread:.15,stance:0}:{crouch:.45+land*.4+(St.preload||0)*.3,lean:.6,back:.9,spread:.18,stance:0,turn:-St.steer*.4,side:St.steer*.25};
      human.pose(ps);
      const gyB=groundH(St.pos.x,St.pos.z);blob.set(St.pos.x,gyB,St.pos.z,St.pos.y-gyB);
      if(live)trail.push(St.pos.x,gyB,St.pos.z,Math.cos(St.yaw),Math.sin(St.yaw),!St.air);trail.update(dt);roost.update(dt,9,roostFade);dust.update(dt,-.2,dustFade);
      /* roost : terre projetée par la roue arrière à l'accélération et en glisse */
      if(!St.air&&sp>2&&(St.thr>.5||St.slide>.25)){roostT+=dt;const rate=eco?.06:.02;if(roostT>rate){roostT=0;const k=1+St.slide*2+overdrive();for(let i=0;i<(eco?1:2);i++)roost.spawn(St.pos.x-fw.x*.8,St.pos.y+.2,St.pos.z-fw.z*.8,-fw.x*(2+sp*.15)+(Math.random()-.5)*2*k,1.2+Math.random()*2*k,-fw.z*(2+sp*.15)+(Math.random()-.5)*2*k,.7,.5,.36,.24);if(Math.random()<.15)dust.spawn(St.pos.x,St.pos.y+.3,St.pos.z,(Math.random()-.5),.4,(Math.random()-.5),2.2,.85,.78,.66)}}
      /* caméra : poursuite derrière la moto (pas le whip), plus haute que les autres sports ; recul et hauteur en l'air pour révéler le saut */
      const hv=hsp();if(hv>2){camYaw+=wrapA((St.air?velYaw():St.yaw)-camYaw)*(live?1-Math.exp(-(St.air?2:3.5)*dt):1)}
      human.visible=ctx.cam()!==1;
      if(ctx.cam()===1){camera.position.copy(St.pos).addScaledVector(up,1.7);camera.rotation.set(-.12+(St.air?St.pitch*.5:0),-camYaw,-St.steer*.08,'YXZ')}
      else{const ab=St.air?clamp((St.airT-.2)*2,0,3.5):0;airCam+=(ab-airCam)*(1-Math.exp(-2.5*dt));const D=(ctx.cam()===2?18:7.2)+airCam*1.3,Hh=(ctx.cam()===2?10:2.8)+airCam*.8;
        camera.position.set(St.pos.x-Math.sin(camYaw)*D,Math.max(St.pos.y,0)+Hh-land*.4,St.pos.z+Math.cos(camYaw)*D);const gc=groundH(camera.position.x,camera.position.z);if(camera.position.y<gc+1.2)camera.position.y=gc+1.2;
        look3.set(St.pos.x+Math.sin(camYaw)*6,St.pos.y+1,St.pos.z-Math.cos(camYaw)*6);camera.lookAt(look3);if(!St.air)camera.rotateZ(-St.steer*.03)}
      camera.fov=62+clamp((sp-8)*.65,0,16)+overdrive()*4;camera.updateProjectionMatrix();shadowFollow(St.pos);speedLines(clamp((sp-16)/12,0,1)*.7,dt);
      if(!St.air&&sp>14){const k=clamp((sp-14)/14,0,1)*.006*(S().shake??1);camera.rotation.x+=(Math.random()-.5)*k;camera.rotation.z+=(Math.random()-.5)*k}
      sound(St.air?.06:clamp(sp/20,0,1)*.1+(St.off?.06:0),St.air?500:240+sp*16,.7);if(St.air)surface('air',0,sp);else surface('road',clamp(sp/22,0,1)*(St.off?.35:.55)+St.slide*.3,sp*.6);
      ctx.hud({kmh,mult:St.air?(St.fmx?St.fmx:'Air '+St.airT.toFixed(1)+' s'):St.off?'Hors piste':St.slide>.4?'Glisse':''},dt)},
    silence(){if(ENG)ENG.g.gain.setTargetAtTime(0,actx.currentTime,.05)},
    attract(dt){az+=dt*.1;rig.visible=false;camera.position.set(Math.cos(az)*90,30,Math.sin(az)*90);camera.lookAt(0,0,0);camera.fov=60;camera.updateProjectionMatrix();if(ENG)ENG.g.gain.setTargetAtTime(0,actx.currentTime,.1)},
    idle(dt){roost.update(dt,9,roostFade);dust.update(dt,-.2,dustFade);trail.update(dt);sound(0,300,.6);surface('air',0,0);speedLines(0,dt);if(ENG)ENG.g.gain.setTargetAtTime(0,actx.currentTime,.1)},
    snapshot(){return {p:St.pos.clone(),yaw:St.yaw}},
    restore(s){trail.clear();St.air=false;St.pitch=0;St.whip=0;St.fmx=null;St.flipT=0;St.pos.copy(s.p);St.pos.y=groundH(s.p.x,s.p.z);St.yaw=s.yaw;St.vel.set(Math.sin(s.yaw)*5,0,-Math.cos(s.yaw)*5)},
    netState(){return {p:[+St.pos.x.toFixed(2),+St.pos.y.toFixed(2),+St.pos.z.toFixed(2)],q:rig.quaternion.toArray().map(v=>+v.toFixed(3))}},
    ghost(lk){const o=buildMoto(lk);o.human.pose({crouch:.45,lean:.6,back:.9,spread:.18,stance:0});const tag=textSprite(lk.name,lk.accent,3.2);tag.position.y=2.8;o.add(tag);root.add(o);return o},
    overStats(){return [['Figures',stats.tricks||0],['Meilleure figure',stats.best||'—'],['Plus haut / plus loin',stats.maxH.toFixed(1)+' m / '+Math.round(stats.maxDist)+' m'],['Big airs',stats.bigAir],['Vitesse max',Math.round(stats.vmax)+' km/h']]},
    _h:groundH,_root:root,_rig:rig,_st:()=>St,_park:()=>park,_lines:()=>lines,_C:()=>C,_world(){},
    dispose(){if(ENG){try{ENG.g.gain.value=0;ENG.o1.stop();ENG.o2.stop();ENG.g.disconnect()}catch(e){}}scene.remove(root);disposeTree(root)}}};
