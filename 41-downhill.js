/* =====================================================================
   DOWNHILL · route de col (lignes droites + virages à rayon constant)
   Traînée ½ρ·CdA·v², adhérence selon planche + roues, slide −0,55 g
   Collisions exactes : 4 coins de la planche contre glissière et paroi rocheuse
===================================================================== */
function makeRoadMode(variant){return function(cfg,look,ctx){const luge=variant==='luge';
  const P_=cfg.params||{};const course=cfg.mode==='course';
  const env={fogNear:90,fogFar:520,hemiGround:0x3a3426,accent:luge?'#ff5a7a':'#ff9a3c',cloudY:160};
  const eco=S().quality==='eco';const seedI=strSeed(cfg.seed),R0=mulberry(seedI);const root=new THREE.Group();scene.add(root);
  const bp0=gearOf('board',look.gear.board).phys,wp=gearOf('wheel',look.gear.wheel).phys;const bp=luge?{alat:8.4,tuck:.0009,len:1.9,wob:0}:bp0;const BRAKE=luge?4.5:wp.slide;
  const STEP=2,PER=100,ALAT=bp.alat+wp.alat;
  const HW=[3.6,4.4,5.4][P_.width??1],RAIL=HW+.6,ROCK=-(HW+1.2);
  const GBASE=[[.06,.04],[.10,.07],[.13,.08]][P_.slope??1];
  const TURNS=P_.turns??1;
  const LEN=course?cfg.len*1000:Infinity;
  const K=[],HD=[0],X=[0],Z=[0],Y=[0],GR=[];const turns=[];const queue=[];let genH=0,gsm=GBASE[0]+.02;
  function plan(){const R=R0;
    const ls=Math.round((60+R()*[260,200,140][TURNS])/STEP),g1=GBASE[0]+R()*GBASE[1];for(let i=0;i<ls;i++)queue.push([0,g1]);
    const sign=Math.abs(genH)>.5?-Math.sign(genH):(R()<.5?-1:1);
    let th=.45+R()*[1.3,2.0,2.4][TURNS];th=Math.min(th,1.42-sign*genH);
    const Rr=th>1.8?24+R()*14:[45,30,26][TURNS]+Math.pow(R(),1.3)*[110,95,70][TURNS];
    const k=sign/Rr,tot=Math.max(4,Math.round(th/(Math.abs(k)*STEP))),n=Math.min(6,Math.floor(tot/2)),m=tot-n;
    const gT=GBASE[0]*.6+R()*.03,i0=K.length+queue.length,q0=queue.length;
    for(let j=0;j<n;j++)queue.push([k*(j+.5)/n,gT]);for(let j=0;j<m-n;j++)queue.push([k,gT]);for(let j=n-1;j>=0;j--)queue.push([k*(j+.5)/n,gT]);
    let real=0;for(let j=q0;j<queue.length;j++)real+=queue[j][0]*STEP;genH+=real;
    turns.push({i0,i1:K.length+queue.length,R:Rr,dir:sign,th:Math.abs(real),done:false,clean:true,vmin:1e9,adv:Math.sqrt(ALAT*Rr)*.95})}
  function ensure(n){while(K.length<n+1){if(!queue.length)plan();const q=queue.shift(),i=K.length;K.push(q[0]);gsm+=(q[1]-gsm)*.05;GR.push(gsm);
    const h=HD[i],hm=h+q[0]*STEP*.5;X.push(X[i]+Math.sin(hm)*STEP);Z.push(Z[i]-Math.cos(hm)*STEP);HD.push(h+q[0]*STEP);Y.push(Y[i]-gsm*STEP)}}
  function hdAt(s){const f=Math.max(0,s)/STEP,i=Math.floor(f);ensure(i+2);return lerp(HD[i],HD[i+1],f-i)}
  function grAt(s){const i=Math.floor(Math.max(0,s)/STEP);ensure(i+2);return GR[i]}
  function at(s,o){s=Math.max(0,s);const f=s/STEP,i=Math.floor(f),t=f-i;ensure(i+2);const h=lerp(HD[i],HD[i+1],t);
    return [lerp(X[i],X[i+1],t)+Math.cos(h)*o,lerp(Y[i],Y[i+1],t),lerp(Z[i],Z[i+1],t)+Math.sin(h)*o,h]}
  const OFFS=[-40,-20,-(HW+4.6),-(HW+2),ROCK,-HW,-(HW-.15),-.1,.1,HW-.15,HW,HW+1,HW+3.6,18+HW,40+HW];
  const OH=[21,10.5,4.5,2.8,-.25,0,0,0,0,0,0,-.05,-1.6,-12,-32];
  const NZ_=[8,4,1,0,0,0,0,0,0,0,0,0,0,-4,-8];
  const snowy=cfg.weather==='neige';
  /* Neige : en météo « neige légère », bas-côtés et pentes passent en neige (route déneigée), grain + paillettes */
  const BAND=snowy?[0xe6eaf0,0xdfe4ea,0xcfd3d8,0x9a9894,0x8d8a82,0xe9e6dc,0x3a3b40,0,0x3a3b40,0xe9e6dc,0xb9bcc0,0xe2e6ec,0xd6dbe2,0xcdd2d9]:[0x6f7f4a,0x6a7a45,0x7a7468,0x6c665c,0x8d8a82,0xe9e6dc,0x3a3b40,0,0x3a3b40,0xe9e6dc,0x8a7f6c,0x58753a,0x6a6152,0x5c5548];
  const terrMat=detailMaterial(new THREE.MeshLambertMaterial({vertexColors:true}),{snow:snowy,amp:.12});
  const treeGeo=treeGeometry(1.4,4.6);const treeMat=new THREE.MeshLambertMaterial({color:snowy?0x3d5a4a:0x2e4f2f});
  const postGeo=new THREE.BoxGeometry(.12,.75,.12);postGeo.translate(0,.37,0);const postMat=new THREE.MeshLambertMaterial({color:0x5a5f66});
  const railMat=new THREE.MeshLambertMaterial({color:0xc3c8ce,side:THREE.DoubleSide});
  const chevTex=(()=>{const c=document.createElement('canvas');c.width=128;c.height=96;const g=c.getContext('2d');g.fillStyle='#c8282a';g.fillRect(0,0,128,96);
    g.strokeStyle='#fff';g.lineWidth=13;for(const x of [28,64,100]){g.beginPath();g.moveTo(x-16,14);g.lineTo(x+10,48);g.lineTo(x-16,82);g.stroke()}return new THREE.CanvasTexture(c)})();
  const signMat=new THREE.MeshLambertMaterial({map:chevTex}),signGeo=new THREE.PlaneGeometry(1.1,.8),signPost=new THREE.BoxGeometry(.08,1.1,.08);signPost.translate(0,.55,0);
  const chunks=new Map();const tc=new THREE.Color();
  function buildChunk(k){
    const i0=k*PER;ensure(i0+PER+2);const rows=[];const R=rngAt(seedI,k,2);
    for(let i=0;i<=PER;i++){const s=(i0+i)*STEP,kk=K[i0+i]||0,lim=Math.abs(kk)>1e-4?.75/Math.abs(kk):1e9;
      rows.push(OFFS.map((o,j)=>{let oo=o;if(Math.sign(o)===Math.sign(kk)&&Math.abs(o)>lim)oo=Math.sign(o)*lim;const a=at(s,oo);return [a[0],a[1]+OH[j]+NZ_[j]*fbm(a[0]*.04,a[2]*.04),a[2]]}))}
    const NB=OFFS.length-1,pos=new Float32Array(PER*NB*18),col=new Float32Array(PER*NB*18);let p=0;
    for(let i=0;i<PER;i++)for(let j=0;j<NB;j++){let c=BAND[j];if(j===7)c=((i0+i)%8<4)?0xeeeae0:0x3a3b40;if(j<=1&&hash(i0+i,j)>.62)c=0x7d776b;
      if(course&&Math.abs((i0+i)*STEP-LEN)<3&&j>=5&&j<=9)c=((j+i)%2)?0xffffff:0x111111;
      tc.setHex(c).multiplyScalar(.93+hash(i0+i,j+31)*.12);const a=rows[i][j],b=rows[i][j+1],cc=rows[i+1][j],d=rows[i+1][j+1];
      for(const V of [a,b,cc,b,d,cc]){pos[p]=V[0];pos[p+1]=V[1];pos[p+2]=V[2];col[p]=tc.r;col[p+1]=tc.g;col[p+2]=tc.b;p+=3}}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setAttribute('color',new THREE.BufferAttribute(col,3));geo.computeVertexNormals();
    const g=new THREE.Group();const tm=new THREE.Mesh(geo,terrMat);tm.receiveShadow=true;g.add(tm);
    const rp=new Float32Array(PER*18);let r=0;
    for(let i=0;i<PER;i++){const a=at((i0+i)*STEP,RAIL),b=at((i0+i+1)*STEP,RAIL);rp.set([a[0],a[1]+.45,a[2],a[0],a[1]+.75,a[2],b[0],b[1]+.45,b[2], a[0],a[1]+.75,a[2],b[0],b[1]+.75,b[2],b[0],b[1]+.45,b[2]],r);r+=18}
    const rg=new THREE.BufferGeometry();rg.setAttribute('position',new THREE.BufferAttribute(rp,3));rg.computeVertexNormals();g.add(new THREE.Mesh(rg,railMat));
    const m=new THREE.Matrix4(),q=new THREE.Quaternion(),sv=V3(),v=V3();
    const PN=PER/2,posts=new THREE.InstancedMesh(postGeo,postMat,PN);sv.set(1,1,1);
    for(let n=0;n<PN;n++){const a=at((i0+n*2)*STEP,RAIL+.08);v.set(a[0],a[1],a[2]);m.compose(v,q,sv);posts.setMatrixAt(n,m)}g.add(posts);
    const TN=eco?30:55,trees=new THREE.InstancedMesh(treeGeo,treeMat,TN);let nT=0;
    for(let n=0;n<TN*2&&nT<TN;n++){const ii=Math.floor(R()*PER),s=(i0+ii)*STEP,kk=K[i0+ii]||0,left=R()<.6,o=left?-(HW+5.6)-R()*28:HW+4.6+R()*26,sc=.7+R()*.8,sy=sc*(.8+R()*.6);
      if(Math.sign(o)===Math.sign(kk)&&Math.abs(o)>.7/Math.max(Math.abs(kk),1e-4))continue;const a=at(s,o);
      const jj=OFFS.findIndex(x=>x>=o);const t2=(o-OFFS[jj-1])/(OFFS[jj]-OFFS[jj-1]);const hh=lerp(OH[jj-1],OH[jj],t2);
      sv.set(sc,sy,sc);v.set(a[0],a[1]+hh-.3,a[2]);m.compose(v,q,sv);trees.setMatrixAt(nT++,m)}
    trees.count=nT;g.add(trees);
    for(const t of turns){if(t.th<.7||t.i0<i0||t.i0>=i0+PER)continue;const span=t.i1-t.i0;
      for(let n=0;n<3;n++){const ii=t.i0+Math.round(span*(.1+n*.25));const o=t.dir>0?ROCK-.35:RAIL+.6;const a=at(ii*STEP,o);
        const sg=new THREE.Group();sg.position.set(a[0],a[1]+(t.dir>0?-.25:0),a[2]);sg.rotation.y=-a[3];
        sg.add(new THREE.Mesh(signPost,postMat));const pl=new THREE.Mesh(signGeo,signMat);pl.position.y=1.15;if(t.dir<0)pl.scale.x=-1;sg.add(pl);g.add(sg)}}
    if(course&&LEN>=i0*STEP&&LEN<(i0+PER)*STEP){const a=at(LEN,0);const arch=new THREE.Group();const pm=new THREE.MeshLambertMaterial({color:0xff9a3c});
      for(const s of [-1,1]){const pil=new THREE.Mesh(new THREE.BoxGeometry(.4,5,.4),pm);pil.position.set(s*(RAIL+.4),2.5,0);arch.add(pil)}
      const ban=new THREE.Mesh(new THREE.BoxGeometry(2*RAIL+1.2,1.1,.2),new THREE.MeshBasicMaterial({map:bannerTex('ARRIVÉE','#ff7a2a')}));ban.position.y=5;arch.add(ban);
      arch.position.set(a[0],a[1],a[2]);arch.rotation.y=-a[3];g.add(arch)}
    if(course){for(let km=1;km*1000<LEN;km++){const s=km*1000;if(s<i0*STEP||s>=(i0+PER)*STEP)continue;const a=at(s,RAIL+1.5);const lab=textSprite('KM '+km,0xff9a3c,3);lab.position.set(a[0],a[1]+2.2,a[2]);g.add(lab)}}
    /* DÉCOR : groupes de spectateurs derrière la glissière (sautent et crient quand tu passes), banderole */
    const crowd=[],groups=[];const pm=new THREE.MeshLambertMaterial({color:0xffffff});
    for(let n=0;n<(eco?1:2);n++){const ii=4+Math.floor(R()*(PER-12)),s=(i0+ii)*STEP;groups.push({s,done:false});
      for(let m=0;m<(eco?5:10);m++){const o=RAIL+1.2+R()*2.4,ds=(R()-.5)*8,a=at(s+ds,o),jj=OFFS.findIndex(x=>x>=o),t2=(o-OFFS[jj-1])/(OFFS[jj]-OFFS[jj-1]);
        crowd.push({x:a[0],y:a[1]+lerp(OH[jj-1],OH[jj],t2)-.05,z:a[2],ph:R()*6.28,s:s+ds,c:PEOPLE_COLS[Math.floor(R()*PEOPLE_COLS.length)]})}
      const a=at(s,RAIL+.9),ban=new THREE.Mesh(new THREE.PlaneGeometry(3.4,.7),new THREE.MeshBasicMaterial({map:bannerTex(R()<.5?'ALLEZ !':'LIGNE LIBRE',R()<.5?'#ff5a36':'#2b8cff'),side:THREE.DoubleSide}));
      ban.position.set(a[0],a[1]+.75,a[2]);ban.rotation.y=-a[3]-Math.PI/2;g.add(ban)}
    let body=null,head=null;if(crowd.length){body=new THREE.InstancedMesh(PEOPLE_GEO.b,pm,crowd.length);head=new THREE.InstancedMesh(PEOPLE_GEO.h,new THREE.MeshLambertMaterial({color:0xd9a77f}),crowd.length);
      const cc=new THREE.Color();crowd.forEach((p,i)=>{body.setColorAt(i,cc.setHex(p.c));_dm.makeTranslation(p.x,p.y,p.z);body.setMatrixAt(i,_dm);head.setMatrixAt(i,_dm)});
      body.instanceColor.needsUpdate=true;g.add(body);g.add(head)}
    root.add(g);return {g,geo,rg,crowd,groups,body,head}}
  function animCrowd(live){const tn=performance.now()/1000,kc=Math.floor(L.s/STEP/PER);
    for(let k=kc-1;k<=kc+1;k++){const c=chunks.get(k);if(!c||!c.body)continue;
      c.crowd.forEach((p,i)=>{const ex=clamp(1-Math.abs(p.s-L.s)/70,0,1),j=ex>0?Math.max(0,Math.sin(tn*9+p.ph))*.38*ex:0;_dm.makeTranslation(p.x,p.y+j,p.z);c.body.setMatrixAt(i,_dm);c.head.setMatrixAt(i,_dm)});
      c.body.instanceMatrix.needsUpdate=true;c.head.instanceMatrix.needsUpdate=true;
      if(live)for(const gr of c.groups)if(!gr.done&&Math.abs(gr.s-L.s)<26&&L.v>10){gr.done=true;sfx.crowd(.5)}}}
  function updateChunks(s,all){const kc=Math.floor(s/STEP/PER);
    for(let k=Math.max(0,kc-1);k<=kc+3;k++)if(!chunks.has(k)){chunks.set(k,buildChunk(k));if(!all)break}
    for(const [k,c] of chunks)if(k<kc-1||k>kc+4){root.remove(c.g);c.geo.dispose();c.rg.dispose();c.g.traverse(n=>{if(n.isSprite||(n.material&&n.material.map&&n.material.map!==chevTex)){if(n.material.map&&n.material.map!==chevTex)n.material.map.dispose();if(n.material!==signMat)n.material.dispose()}});chunks.delete(k)}}
  const peaks=mountainRing(root,18,560,760,180,420,0x6b6e78,0xf4f4f0,new THREE.Color(WEATHER[cfg.weather].horizon),mulberry(seedI+3));

  const rig=luge?buildLuge(look):buildLongboard(look);castAll(rig,true,false);root.add(rig);const human=rig.human;
  const dust=makeParticles(eco?36:120,.9,.5,root);const blob=makeBlob(root,luge?1.5:1.3);let leanS=0,camY=null;const _t=V3(),_sd=V3(),_n=V3();const dustFade=new THREE.Color(WEATHER[cfg.weather].horizon);
  const half=rig.len/2,hwid=luge?.225:.125,CORN=[[-hwid,-half],[hwid,-half],[-hwid,half],[hwid,half]];
  const wv=WIND[cfg.wind|0].v,wa=(seedI%628)/100;
  const L={s:8,o:1.8,r:0,v:16*(ctx.boost?1.2:1)};let snowT=0,rubT=0,nearT=0,nearCd=0,tuckT=0,SL={on:false},slideVis=0,slideT=0,camYaw=0,sa=6,speedTier=1,offT=0,dustT=0,grip=0,lastSlide=false,paceTxt=null,km=1,wob=0;
  const bestSplits=load('ll3_splits_'+cfg.seed+'_'+(P_.slope??1),[]);const splits=[];
  const stats={score:0,dist:0,vmax:0,turnsClean:0,slides:0,slideTime:0,time:0};const look3=V3();
  updateChunks(0,true);camYaw=hdAt(8);
  function nextTurn(s){for(const t of turns){if(t.i1*STEP>s)return t}return null}
  const isPin=t=>t.th>1.8&&t.R<40;
  const sevName=t=>isPin(t)?'Épingle '+(t.dir>0?'droite':'gauche'):(t.dir>0?'Droite ':'Gauche ')+(t.R<38?1:t.R<52?2:t.R<72?3:t.R<95?4:5);
  const ARROWS={turn:'<path d="M12 36 V20 Q12 10 22 10 H30"/><path d="M26 4 L33 10 L26 16"/>',pin:'<path d="M12 36 V16 Q12 6 21 6 Q30 6 30 16 V24"/><path d="M24 20 L30 27 L36 20"/>',flag:'<path d="M10 36 V6"/><path d="M10 6 H30 L26 12 L30 18 H10"/>'};
  const crash=(t,x)=>{ding(90,.7);buzz([40,30,60]);ctx.crash(t,x)};
  return {env,stats,name:luge?'Street luge':'Downhill',vScale:luge?160:140,target:course?LEN/24:0,
    keys:luge?[['← →','se pencher pour tourner'],['↓','tête baissée : plus aéro (6 s = figure)'],['↑','se redresser (frein à air)'],['Espace','freiner avec les pieds'],['C','caméra']]:[['← →','carver (frôle la glissière = figure)'],['↓','tuck : position aéro'],['Espace + ← →','slide : Coleman, Pendulum (change de côté)'],['↑ + Espace','stand-up slide'],['C','caméra']],
    touch:luge?{u:'Redresser',d:'Aéro',a:'Frein'}:{u:'Debout',d:'Tuck',a:'Slide'},
    inst:`<div class="ihead">Notes de virage</div>
      <div class="pace" id="iPace"><svg id="iArrow" viewBox="0 0 40 40"></svg><div><div class="pn" id="iPn">Ligne droite</div><div class="pd" id="iPd"></div></div></div>
      <div class="ro-grid"><div class="ro"><span>Pente</span><b id="iSl">0<small>%</small></b></div><div class="ro"><span>Dernier km</span><b id="iKm">—</b></div></div>
      <div class="barline"><span>Grip</span><div class="bt"><i id="iGrip"></i></div><b id="iGripV">0%</b></div>`,
    hudUpdate(d){const pace=$('#iPace');if(!pace)return;const t=d.turn;
      if(course&&LEN-L.s<350){$('#iArrow').innerHTML=ARROWS.flag;$('#iArrow').style.transform='';paceTxt='f';$('#iPn').textContent='Arrivée';$('#iPd').textContent=Math.max(0,Math.round(LEN-L.s))+' m';pace.classList.remove('brake')}
      else if(t){const dist=t.i0*STEP-L.s,inT=dist<=0,adv=t.adv*3.6;const key=sevName(t);
        if(paceTxt!==key){paceTxt=key;const svg=$('#iArrow');svg.innerHTML=isPin(t)?ARROWS.pin:ARROWS.turn;svg.style.transform=t.dir<0?'scaleX(-1)':''}
        $('#iPn').textContent=key;const brk=(L.v*L.v-t.adv*t.adv)/(2*BRAKE);const brake=L.v>t.adv*1.04&&(inT||dist<brk+15);pace.classList.toggle('brake',brake);
        $('#iPd').textContent=(brake?'FREINE · ':'')+(inT?'dans le virage':Math.round(dist)+' m')+' · '+Math.round(adv/5)*5+' km/h max'}
      $('#iSl').innerHTML=Math.round(grAt(L.s)*100)+'<small>%</small>';$('#iKm').textContent=splits.length?splits[splits.length-1].txt:'—';
      const gi=$('#iGrip');gi.style.width=(clamp(grip,0,1)*100)+'%';gi.classList.toggle('hot',grip>.95||d.slide);$('#iGripV').textContent=d.slide?'slide':Math.round(grip*100)+'%'},
    prog(){return course?'<b>'+(L.s/1000).toFixed(2)+'</b> / '+cfg.len+' km':''},
    auto(){const t=nextTurn(L.s);let brake=false,near=false;if(t){const dist=t.i0*STEP-L.s;near=dist<70&&dist>-5;const brk=(L.v*L.v-t.adv*t.adv)/(2*BRAKE);brake=L.v>t.adv*.97&&dist<brk+12}
      const target=near?-t.dir*Math.min(1.4,HW*.3):.5;return {x:clamp((target-L.o)*.45-L.r*3.2,-1,1),y:brake?0:-1,a:brake}},
    update(dt,I){const live=dt>0;
      const slide=I.a&&L.v>3,tuck=I.y<0,stand=I.y>0;
      /* slide : la planche part en travers (visuel + hitbox) mais la trajectoire ne tourne qu'à ~0,8 g (frottement des gommes) */
      const rate=slide&&!luge?Math.min(2.1,7.8/Math.max(L.v,1)):Math.min(1.7,ALAT/Math.max(L.v,.5));
      L.r+=I.x*rate*dt;grip=Math.abs(I.x*rate*L.v)/ALAT;
      if(bp.wob&&L.v>28&&!tuck){wob+=dt*14;L.r+=Math.sin(wob)*.004*(L.v-28)}
      const ds=L.v*Math.cos(L.r)*dt;L.r-=hdAt(L.s+ds)-hdAt(L.s);L.s+=ds;L.o+=L.v*Math.sin(L.r)*dt;
      if(L.v<5)L.r=clamp(L.r,-1.3,1.3);
      const g=grAt(L.s),kd=luge?(tuck?.0008:stand?.003:.0011):tuck?bp.tuck:stand?.0045:.0026,hAbs0=hdAt(L.s)+L.r;
      const head=-wv*Math.sin(hAbs0-wa),va=L.v+head;
      let acc=9.81*g-kd*va*Math.abs(va)-wp.rr;
      if(stand&&L.v<6)acc+=2.2;
      if(slide)acc-=luge?BRAKE:wp.slide+Math.abs(I.x)*.8;
      slideVis+=((slide&&!luge?I.x*.95:0)-slideVis)*Math.min(1,6*dt);
      const yawB=L.r+slideVis,cb=Math.cos(yawB),sb=Math.sin(yawB);let oMin=1e9,oMax=-1e9;
      for(const c of CORN){const oc=L.o+c[0]*cb-c[1]*sb;if(oc<oMin)oMin=oc;if(oc>oMax)oMax=oc}
      const offA=oMax>HW||oMin<-HW;
      if(offA){acc-=3.5;offT+=dt;if(offT>.3&&live){toast(oMin<-HW?'Caniveau':'Gravier');offT=-1}}else offT=0;
      L.v=Math.max(0,L.v+acc*dt);updateChunks(L.s,false);
      const kmh=L.v*3.6;if(live){stats.vmax=Math.max(stats.vmax,kmh);stats.time+=dt}
      if(live){
        /* glissière / roche : frottement si on arrive en biais (vitesse latérale faible), chute si on la prend de face */
        const vLat=L.v*Math.sin(L.r);
        if(oMax>=RAIL){if(vLat>(luge?6:5.5))return crash('Glissière','Glissière prise à '+Math.round(kmh)+' km/h ('+Math.round(vLat*3.6)+' km/h vers l\'extérieur). Les notes de virage donnent la vitesse max.');
          L.o-=oMax-RAIL+.02;L.r=Math.min(L.r,-.02);L.v*=.9;rubT=.35;for(const tt of turns)if(!tt.done&&tt.i0*STEP<L.s)tt.clean=false}
        if(oMin<=ROCK){if(-vLat>(luge?4.5:4))return crash('Paroi rocheuse','Trop à l\'intérieur, la planche a tapé la roche à '+Math.round(kmh)+' km/h.');
          L.o+=ROCK-oMin+.02;L.r=Math.max(L.r,.02);L.v*=.86;rubT=.35;for(const tt of turns)if(!tt.done&&tt.i0*STEP<L.s)tt.clean=false}
        if(rubT>0){rubT-=dt;if(rubT>.3){toast('Frotté !');sfx.thud(.3);buzz([25]);if(human&&human.impact)human.impact(.35);camShake(.25)}}
        if(Math.abs(L.r)>(slide?1.5:1.1)&&L.v>5)return crash('Chute','Planche en travers à '+Math.round(kmh)+' km/h sans slide.')}
      if(course&&L.s>=LEN&&live){ding(990,.5);return ctx.finish(stats.time)}
      const dd=Math.max(0,ds);if(live)stats.dist+=dd;
      const mult=L.v>30?3:L.v>22?2:1;stats.score+=dd*Math.pow(L.v/25,2)*.8;
      if(live&&mult>speedTier&&mult>1)toast(mult===3?'Plein gaz':'Ça file',true);speedTier=mult;
      if(slide&&L.v>8){stats.score+=L.v*dt*1.5;slideT+=dt;if(live)stats.slideTime=(stats.slideTime||0)+dt;if(slideT>.25&&!lastSlide&&live)stats.slides++;lastSlide=slideT>.25}else{slideT=0;lastSlide=false}
      /* FIGURES downhill : slides nommés (Coleman / Stand-up / Pendulum, toe ou heel), frôle-glissière, tuck long, virages parfaits */
      if(slide&&L.v>6){if(!SL.on){SL.on=true;SL.t=0;SL.dir=I.x>=0?1:-1;SL.stand=false;SL.pend=false;SL.v0=L.v}SL.t+=dt;if(stand)SL.stand=true;if(I.x!==0&&Math.sign(I.x)!==SL.dir&&SL.t>.3)SL.pend=true}
      else if(SL.on){SL.on=false;if(live&&SL.t>.5){if(luge)ctx.trick('Freinage pieds',40+SL.t*40);else{const nm=(SL.pend?'Pendulum':SL.stand?'Stand-up':'Coleman')+' '+(SL.dir>0?'heelside':'toeside'),perfect=SL.t>.7&&SL.t<1.6&&Math.abs(L.r)<.15;
          /* slide parfait : bonne durée et sortie dans l'axe de la route */
          ctx.trick((perfect?'Slide parfait · ':'')+nm,(60+SL.t*90*clamp(SL.v0/15,.6,2))*(perfect?1.8:1));if(perfect){nearMissFx();sfx.whoosh()}}}}
      if(live){nearCd-=dt;const gapR=RAIL-oMax,gapK=oMin-ROCK;if((gapR<.4||gapK<.4)&&rubT<=0&&L.v>14){nearT+=dt;if(nearT>.7&&nearCd<=0){ctx.trick(gapR<gapK?'Frôle-glissière':'Frôle-roche',150);nearCd=3;nearT=0}}else nearT=0;
        if(tuck&&L.v>19){tuckT+=dt;if(tuckT>6){ctx.trick(luge?'Aéro parfait':'Tuck long',150);tuckT=0}}else tuckT=0}
      const t=nextTurn(L.s);
      for(const tt of turns){if(tt.done)continue;if(tt.i1*STEP<L.s){tt.done=true;
          if(live&&tt.clean&&tt.vmin<1e8){const ratio=clamp(tt.vmin/tt.adv,.4,1.3);stats.turnsClean++;ctx.trick(ratio>.95?'Virage parfait':'Virage propre',150*tt.th*ratio*ratio)}}
        else if(tt.i0*STEP<L.s){tt.vmin=Math.min(tt.vmin,L.v);if(offA)tt.clean=false}else break}
      if(live&&L.s>=km*1000){const prevT=splits.length?splits[splits.length-1].t:0,seg=stats.time-prevT,bst=bestSplits[km-1];
        const delta=bst?seg-bst:null;splits.push({t:stats.time,txt:fmtT(seg)});feed('KM '+km+' · '+fmtT(seg)+(delta!=null?' ('+(delta<0?'−':'+')+Math.abs(delta).toFixed(1)+')':''));
        if(!bst||seg<bst){bestSplits[km-1]=seg;save('ll3_splits_'+cfg.seed+'_'+(P_.slope??1),bestSplits)}if(course)ctx.checkpoint(km,cfg.len);km++}
      const a=at(L.s,L.o),hAbs=a[3]+L.r;
      /* Persos : inclinaison lissée (inertie) + anticipation de la courbure à ~0,6 s devant */
      const kAhead=K[Math.floor((L.s+L.v*.6)/STEP)]||0,leanT=(-I.x*(slide?.06:.2)-clamp(kAhead*L.v*L.v/9.81,-.5,.5)*.35)*clamp(L.v/15,0,1);
      leanS+=(leanT-leanS)*(live?1-Math.exp(-7*dt):1);
      rig.position.set(a[0],a[1],a[2]);rig.rotation.set(Math.atan(-g),-(hAbs+slideVis),leanS,'YXZ');
      _t.set(Math.sin(a[3]),-g,-Math.cos(a[3])).normalize();_sd.set(Math.cos(a[3]),0,Math.sin(a[3]));_n.crossVectors(_sd,_t).normalize();if(_n.y<0)_n.negate();blob.set(a[0],a[1],a[2],0,_n);
      if(!luge){const hp=tuck?{crouch:.95,lean:1.15,twist:.95,back:1,look:.3}:slide?{crouch:.7,lean:.5,twist:.5,handDown:I.x>=0?-1:1,look:.6}:stand?{crouch:.05,lean:-.1,twist:.6,spread:.9,look:.6}:{crouch:.4,lean:.45,twist:.8,spread:.3,look:.5};hp.turn=I.x*.5*clamp(L.v/10,0,1);hp.side=(hp.side||0)-leanS*.5;human.pose(hp)}
      dustT+=dt;if(live&&dustT>.025&&(slide&&L.v>6||offA&&L.v>4)){dustT=0;const c=snowy?[.97,.98,1]:offA&&!slide?[.62,.55,.45]:[.9,.9,.9];for(let n=0;n<2;n++)dust.spawn(a[0]+(Math.random()-.5)*.6,a[1]+.1,a[2]+(Math.random()-.5)*.6,(Math.random()-.5)*1.2,.6+Math.random()*.6,(Math.random()-.5)*1.2,1.4,c[0],c[1],c[2])}
      if(live&&snowy&&L.v>12&&Math.abs(leanS)>.1){snowT+=dt;if(snowT>(eco?.09:.035)){snowT=0;const sd=Math.sign(leanS),hx=Math.cos(a[3]),hz=Math.sin(a[3]);dust.spawn(a[0]+hx*sd*.3,a[1]+.08,a[2]+hz*sd*.3,hx*sd*(1.5+Math.random()),.6+Math.random()*.8,hz*sd*(1.5+Math.random()),1,.97,.98,1)}}// gerbe de neige en carve
      dust.update(dt,-.2,dustFade);peaks.position.set(a[0],a[1]-160,a[2]);animCrowd(live);
      camYaw+=(hAbs-camYaw)*(live?1-Math.exp(-3.5*dt):1);human.visible=ctx.cam()!==1;
      if(ctx.cam()===1){camera.position.set(a[0],a[1]+(luge?.5:tuck?1.05:1.5),a[2]);camera.rotation.set(Math.atan(-g)-.06,-hAbs,-I.x*.04,'YXZ')}
      else{const fx=Math.sin(camYaw),fz=-Math.cos(camYaw),D=ctx.cam()===2?16:luge?4.6:5.6,Hh=ctx.cam()===2?7:luge?1.15:(tuck?1.8:2.1);
        const cy=a[1]+Hh+g*D;camY=camY==null||!live?cy:camY+(cy-camY)*(1-Math.exp(-6*dt));camera.position.set(a[0]-fx*D,camY,a[2]-fz*D);look3.set(a[0]+Math.sin(hAbs)*9,a[1]+.5-g*9,a[2]-Math.cos(hAbs)*9);camera.lookAt(look3)}
      const shake=clamp((L.v-18)/16,0,1)*(bp.wob?.016:.01)+(offA?.02:0);if(shake>0){camera.rotation.x+=(Math.random()-.5)*shake;camera.rotation.z+=(Math.random()-.5)*shake}
      camera.fov=64+clamp((L.v-12)*.75,0,22);camera.updateProjectionMatrix();rig.getWorldPosition(look3);shadowFollow(look3);
      speedLines(clamp((L.v-16)/16,0,1),dt);
      if(slide)sound(clamp(L.v/25,0,1)*.45,1700,3);else sound(clamp(L.v/32,0,1)*.32,110+L.v*11,.6);
      surface(snowy?'snow':'road',clamp(L.v/22,0,1)*(slide?1.2:offA?1.1:.85),L.v);
      ctx.hud({kmh,mult:slide?'Slide':mult>1?'×'+mult:'',turn:t,slide},dt)},
    attract(dt){sa+=18*dt;updateChunks(sa,false);rig.visible=false;const a=at(sa,2.4),b=at(sa+32,0);camera.position.set(a[0],a[1]+3.4,a[2]);camera.lookAt(b[0],b[1]+.8,b[2]);
      peaks.position.set(a[0],a[1]-160,a[2]);camera.fov=66;camera.updateProjectionMatrix();sound(.12,200,.6)},
    idle(dt){dust.update(dt,-.2,dustFade);sound(0,200,.6);surface('air',0,0);speedLines(0,dt)},
    snapshot(){return {s:L.s,v:L.v}},
    restore(s){L.s=s.s;L.o=0;L.r=0;L.v=Math.min(s.v,10);slideVis=0},
    netState(){const a=at(L.s,L.o);return {p:[+a[0].toFixed(2),+a[1].toFixed(2),+a[2].toFixed(2)],q:rig.quaternion.toArray().map(v=>+v.toFixed(3))}},
    ghost(lk){const o=luge?buildLuge(lk):buildLongboard(lk);if(!luge)o.human.pose({crouch:.6,lean:.7,twist:.8,back:.5});const tag=textSprite(lk.name,lk.accent,3.2);tag.position.y=2.4;o.add(tag);root.add(o);return o},
    overStats(){return [['Distance',(stats.dist/1000).toFixed(2)+' km'],['Vitesse max',Math.round(stats.vmax)+' km/h'],['Virages propres',stats.turnsClean],['Slides',stats.slides],['Temps',fmtT(stats.time)]]},
    _rig:rig,_L:()=>L,_recX:()=>L.s,_world:(f,all)=>{updateChunks(f.e,!!all);peaks.position.set(f.p.x,f.p.y-160,f.p.z)},dispose(){scene.remove(root);disposeTree(root)}
  };
}};
MODES.longboard=makeRoadMode('board');
MODES.luge=makeRoadMode('luge');
function buildLuge(look){const g=new THREE.Group();const sm=new THREE.MeshLambertMaterial({color:look.deck});
  const sled=new THREE.Mesh(new THREE.BoxGeometry(.45,.05,1.9),sm);sled.position.y=.1;g.add(sled);
  const rest=new THREE.Mesh(new THREE.BoxGeometry(.4,.12,.3),new THREE.MeshLambertMaterial({color:0x15191e}));rest.position.set(0,.18,.8);g.add(rest);
  const tm=new THREE.MeshLambertMaterial({color:0x9aa0a6}),wm=new THREE.MeshLambertMaterial({color:look.wheel});
  for(const z of [-.7,.7]){const tr=new THREE.Mesh(new THREE.BoxGeometry(.4,.04,.06),tm);tr.position.set(0,.06,z);g.add(tr);
    for(const x of [-.21,.21]){const w=new THREE.Mesh(new THREE.CylinderGeometry(.04,.04,.05,10),wm);w.rotation.z=Math.PI/2;w.position.set(x,.04,z);g.add(w)}}
  const human=buildHuman(look);human.rotation.set(0,Math.PI/2,Math.PI/2,'YXZ');human.position.set(0,.3,-.85);human.pose({crouch:0,spread:0,back:.2});g.add(human);g.human=human;g.len=1.9;return g}
