/* =====================================================================
   PARKOUR · toits d'une ville stylisée (néons magenta / cyan / jaune)
   Contrôleur de personnage indépendant des sports de glisse : cylindre (rayon 0,32 m, 1,8 m ;
   1,0 m en glissade) contre des boîtes alignées (immeubles, obstacles). Le relief EST la liste de
   boîtes affichées : sol = dessus de boîte le plus haut sous les pieds, murs = faces latérales.
   Mouvements : course (↑), virages (← →), saut (Espace, temps « coyote » de 0,12 s au bord),
   vault automatique sur un obstacle bas (Espace juste avant = kong vault), escalade d'un rebord
   à portée (≤ 2,3 m), wallrun UNIQUEMENT sur les panneaux cyan marqués, walljump depuis le wallrun,
   glissade (↓ en course) sous les barres magenta, roulade (↓ à l'atterrissage) pour les grosses chutes.
===================================================================== */
MODES.parkour=function(cfg,look,ctx){
  const P_=cfg.params||{},course=cfg.mode==='course',eco=S().quality==='eco',seedI=strSeed(cfg.seed);const R=rngAt(seedI,7,17);
  const env={fogNear:120,fogFar:520,hemiGround:0x3a2a4a,accent:'#ff3fbf',cloudY:160,light:.9};
  const root=new THREE.Group();scene.add(root);const SH=gearOf('shoe',look.gear.shoe).phys;
  const GAP=[[1.6,3.0],[2.0,3.8],[2.4,4.4]][P_.gaps??1],HV=[2,3,4.5][P_.height??1];
  /* ---------- boîtes : [x0,x1,y0,y1,z0,z1,type] ---------- */
  const boxes=[],CELL=8,cells=new Map(),K=(i,j)=>i*73856093^j*19349663;
  function reg(b){for(let i=Math.floor(b.x0/CELL);i<=Math.floor(b.x1/CELL);i++)for(let j=Math.floor(b.z0/CELL);j<=Math.floor(b.z1/CELL);j++){const k=K(i,j);let a=cells.get(k);if(!a){a=[];cells.set(k,a)}a.push(b)}}
  function addBox(x0,x1,y0,y1,z0,z1,t,extra){const b=Object.assign({x0,x1,y0,y1,z0,z1,t:t||'b'},extra||{});boxes.push(b);reg(b);return b}
  function near(x,z,r,out){out.length=0;const seen=near.s||(near.s=new Set());seen.clear();for(let i=Math.floor((x-r)/CELL);i<=Math.floor((x+r)/CELL);i++)for(let j=Math.floor((z-r)/CELL);j<=Math.floor((z+r)/CELL);j++){const a=cells.get(K(i,j));if(a)for(const b of a)if(!seen.has(b)){seen.add(b);out.push(b)}}return out}
  /* ---------- génération : une bande d'immeubles vers le nord (parcours) ou un quartier (libre) ---------- */
  const COLS=course?3:7,ROWS=course?Math.max(6,cfg.len*2+2):9,BW=11;let roofs=[],route=[];const H0=14;
  const colX=[],rowZ=[];{let x=-(COLS*BW)/2;for(let c=0;c<COLS;c++){colX.push(x);x+=BW+(1.6+R()*1.6)}let z=10;for(let r=0;r<ROWS;r++){rowZ.push(z);z-=BW+(GAP[0]+R()*(GAP[1]-GAP[0]))}}
  const Hgt=[];for(let r=0;r<ROWS;r++){Hgt.push([]);for(let c=0;c<COLS;c++){const prev=r?Hgt[r-1][c]:H0;let h=prev+(R()<.3?(R()<.5?-1:1)*(1+R()*HV):(R()-.5)*1.4);h=clamp(h,9,26);Hgt[r].push(Math.round(h*2)/2)}}
  const wide=new Set();for(let r=2;r<ROWS-1;r+=3)if(R()<.7)wide.add(r);
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){const x0=colX[c],z1=rowZ[r];let z0=z1-BW;/* rangée « large » : on élargit l'écart avant elle (mur de wallrun prévu à côté) */
    if(wide.has(r)&&r>0){/* le bâtiment recule de 3 m : écart de ~7 m */}
    const b=addBox(x0,x0+BW,0,Hgt[r][c],z1-BW-(wide.has(r)?0:0),z1,'roof',{r,c});roofs.push(b)}
  /* écarts larges : le bâtiment de la rangée suivante recule ; un mur haut longe l'écart (panneau cyan de wallrun), une poutre parfois */
  for(const r of wide){if(r+1>=ROWS)continue;for(let c=0;c<COLS;c++){const b=roofs.find(o=>o.r===r+1&&o.c===c);b.z1-=3.5}
    const zA=roofs.find(o=>o.r===r).z0,zB=roofs.find(o=>o.r===r+1).z1;for(let c=0;c<COLS;c+=2){const cx=colX[c]+(c===0?-1.1:BW+.1);const top=Math.max(Hgt[r][c],Hgt[r+1][c])+4.5;addBox(cx,cx+1,0,top,zB-1.5,zA+1.5,'wall',{wr:true,face:c===0?1:-1})}}
  /* il faut reconstruire l'index après le recul des immeubles */
  cells.clear();for(const b of boxes)reg(b);
  /* mobilier des toits : climatiseurs (vault), murets, barres de glissade, plots de précision, rampes/escaliers vers un toit plus haut */
  const props=[];
  for(const b of roofs){const y=b.y1,cx=(b.x0+b.x1)/2,cz=(b.z0+b.z1)/2;const n=1+Math.floor(R()*2.2);
    for(let i=0;i<n;i++){const k=R();const px=b.x0+2+R()*(BW-4),pz=b.z0+2.5+R()*(b.z1-b.z0-5);if(b.r===0&&Math.abs(px-(b.x0+b.x1)/2)<3.5&&pz>b.z1-7)continue;/* zone de départ dégagée */
      if(k<.35){const w=1.4,d=1.1,hh=.9+R()*.3;props.push(addBox(px-w/2,px+w/2,y,y+hh,pz-d/2,pz+d/2,'vault'))}
      else if(k<.55){const w=4,hh=.75;props.push(addBox(px-w/2,px+w/2,y,y+hh,pz-.2,pz+.2,'vault'))}
      else if(k<.72){props.push(addBox(px-2.2,px+2.2,y+1.15,y+1.45,pz-.15,pz+.15,'bar'));for(const s of [-1,1])props.push(addBox(px+s*2.2-.1,px+s*2.2+.1,y,y+1.15,pz-.1,pz+.1,'post'))}
      else if(k<.85){props.push(addBox(px-.4,px+.4,y,y+2.6,pz-.4,pz+.4,'chim'))}
      else{const hh=1.6;props.push(addBox(px-.45,px+.45,y,y+hh,pz-.45,pz+.45,'pad'));props.push(addBox(px+1.9-.45,px+1.9+.45,y,y+hh+.6,pz-.45,pz+.45,'pad'))}}}
  /* ponts : planches étroites au-dessus de certains écarts (précision) */
  for(let r=0;r<ROWS-1;r++)for(let c=0;c<COLS;c++){if(R()>.22||wide.has(r+1))continue;const a=roofs.find(o=>o.r===r&&o.c===c),b=roofs.find(o=>o.r===r+1&&o.c===c);if(Math.abs(a.y1-b.y1)>.6)continue;const x=colX[c]+2+R()*(BW-4),y=Math.min(a.y1,b.y1);addBox(x-.25,x+.25,y-.15,y,b.z1-.4,a.z0+.4,'beam')}
  const groundTop=(x,z,feet,_a)=>{let best=0;/* rue = 0 */for(const b of near(x,z,.3,_N)){if(b.t==='bar')continue;if(x>=b.x0-.12&&x<=b.x1+.12&&z>=b.z0-.12&&z<=b.z1+.12&&b.y1<=feet+.5&&b.y1>best)best=b.y1}return best};const _N=[],_N2=[];
  /* ---------- rendu : immeubles fusionnés (façades à fenêtres en UV monde), toits, néons ---------- */
  {const winTex=canvasTex(128,128,(g,w,h)=>{g.fillStyle='#ffffff';g.fillRect(0,0,w,h);for(let y=0;y<2;y++)for(let x=0;x<2;x++){g.fillStyle=(x+y)%3?'#2a2f45':'#ffd27a';g.fillRect(x*64+12,y*64+14,40,34)}},true);
    const facM=new THREE.MeshLambertMaterial({vertexColors:true,map:winTex}),topM=detailMaterial(new THREE.MeshLambertMaterial({vertexColors:true}),{amp:.12});
    const F={P:[],U:[],C:[]},T={P:[],C:[]};const col=new THREE.Color();
    const pal=[0x3b2f5c,0x2d3a5e,0x4a2f50,0x2f4552,0x3d3348];
    function boxGeo(b,c,ct){const {x0,x1,y0,y1,z0,z1}=b;const q=(A,Uv,C,p,u,cc)=>{for(const k of [0,1,2,0,2,3]){A.push(...p[k]);if(Uv)Uv.push(...u[k]);C.push(cc.r,cc.g,cc.b)}};
      const sides=[[[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1],x1-x0],[[x1,y0,z0],[x0,y0,z0],[x0,y1,z0],[x1,y1,z0],x1-x0],[[x1,y0,z1],[x1,y0,z0],[x1,y1,z0],[x1,y1,z1],z1-z0],[[x0,y0,z0],[x0,y0,z1],[x0,y1,z1],[x0,y1,z0],z1-z0]];
      for(const s of sides){const w=s[4]/4,hh=(y1-y0)/3.2,v0=y0/3.2;q(F.P,F.U,F.C,s.slice(0,4),[[0,v0],[w,v0],[w,v0+hh],[0,v0+hh]],c)}
      q(T.P,null,T.C,[[x0,y1,z1],[x1,y1,z1],[x1,y1,z0],[x0,y1,z0]],null,ct)}
    for(const b of roofs){col.setHex(pal[(b.r*3+b.c)%pal.length]);boxGeo(b,col.clone(),new THREE.Color(0x6c6878).multiplyScalar(.9+((b.r+b.c)%2)*.1))}
    const mk=(G,mat,uv)=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(G.P,3));g.setAttribute('color',new THREE.Float32BufferAttribute(G.C,3));if(uv)g.setAttribute('uv',new THREE.Float32BufferAttribute(G.U,2));g.computeVertexNormals();const m=new THREE.Mesh(g,mat);m.receiveShadow=true;root.add(m);return m};
    winTex.wrapS=winTex.wrapT=THREE.RepeatWrapping;mk(F,facM,true);mk(T,topM,false);
    /* éléments de jeu : couleurs codées (jaune = vault, magenta = glissade, cyan = wallrun, blanc = précision) + rayures */
    const cols={vault:0xffd23a,bar:0xff3fbf,post:0x5a2a5a,chim:0x6a6070,pad:0xf2f2ee,beam:0xe8d9b0,wall:0x2b2f4a};
    const geo=new THREE.BoxGeometry(1,1,1);const mats={};for(const k in cols)mats[k]=new THREE.MeshLambertMaterial({color:cols[k]});
    /* obstacles regroupés par type en InstancedMesh (un appel de dessin par type au lieu d'un par objet) */
    const byT={};for(const b of boxes){if(b.t==='roof')continue;(byT[b.t]=byT[b.t]||[]).push(b)}
    for(const t in byT){const L_=byT[t],im=new THREE.InstancedMesh(geo,mats[t]||mats.chim,L_.length);L_.forEach((b,i)=>{_dv.set((b.x0+b.x1)/2,(b.y0+b.y1)/2,(b.z0+b.z1)/2);_dq.identity();_ds.set(b.x1-b.x0,b.y1-b.y0,b.z1-b.z0);_dm.compose(_dv,_dq,_ds);im.setMatrixAt(i,_dm)});im.castShadow=!eco;im.receiveShadow=true;root.add(im)}
    for(const b of boxes){if(b.t==='roof')continue;
      if(b.wr){/* panneau néon de wallrun, bien visible */const pm=new THREE.Mesh(new THREE.PlaneGeometry(b.z1-b.z0-1,4),new THREE.MeshBasicMaterial({color:0x2ee6ff,transparent:true,opacity:.85}));pm.rotation.y=b.face>0?Math.PI/2:-Math.PI/2;pm.position.set(b.face>0?b.x1+.02:b.x0-.02,b.y1-4.6,(b.z0+b.z1)/2);root.add(pm);
        const ar=textSprite('WALLRUN',0x2ee6ff,3);ar.position.set(b.face>0?b.x1+.4:b.x0-.4,b.y1-2,(b.z0+b.z1)/2);root.add(ar)}}
    /* rue en contrebas, enseignes, ciel nocturne de la ville au loin */
    const st=new THREE.Mesh(new THREE.PlaneGeometry(900,900),new THREE.MeshLambertMaterial({color:0x2a2633}));st.rotation.x=-Math.PI/2;st.position.y=-.02;root.add(st);
    const rr=rngAt(seedI,9,4),bm=new THREE.MeshLambertMaterial({color:0x2a2440});for(let i=0;i<(eco?20:46);i++){const a=rr()*Math.PI*2,d=160+rr()*240,h=30+rr()*80,w=16+rr()*22;const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,w),bm);m.position.set(Math.cos(a)*d,h/2,Math.sin(a)*d+(course?-ROWS*7:0));root.add(m)}
    const signC=[0xff3fbf,0x2ee6ff,0xffd23a];for(let i=0;i<Math.min(roofs.length,eco?8:18);i++){const b=roofs[Math.floor(rr()*roofs.length)];const s=new THREE.Mesh(new THREE.PlaneGeometry(4,1.2),new THREE.MeshBasicMaterial({color:signC[i%3]}));s.position.set(b.x0-.03,b.y1-2-rr()*4,(b.z0+b.z1)/2);s.rotation.y=-Math.PI/2;root.add(s)}}
  /* ---------- départ, portes (parcours), spots (libre) ---------- */
  const startB=roofs.find(o=>o.r===0&&o.c===Math.floor(COLS/2));
  const St={pos:V3((startB.x0+startB.x1)/2,startB.y1,startB.z1-2),vel:V3(),h:0,sp:0,mode:'run',t:0,onG:true,coy:0,peak:0,from:null,jumpT:0,height:1.8,wr:null,wrUsed:null,vault:null,climb:null,slide:0,roll:0,stun:0,prevA:false,prevD:false,runT:0,phase:0,aBuf:-9,lastBox:null,flow:0};
  if(ctx.boost)St.sp=4;
  const stats={score:0,dist:0,vmax:0,time:0,moves:0,best:'',bestPts:0,tricks:0,flowMax:0,vaults:0,wallruns:0,gaps:0,maxGap:0,gates:0,pen:0};
  let gates=null,finishT=0;
  if(course){const list=[];let len=0,px=St.pos.x,pz=St.pos.z;for(let r=2;r<ROWS;r+=2){const b=roofs.find(o=>o.r===r&&o.c===Math.floor(COLS/2)+(r%4===0?0:(R()<.5?-1:1)*(COLS>2?1:0)))||roofs.find(o=>o.r===r);const x=(b.x0+b.x1)/2,z=(b.z0+b.z1)/2;list.push({x,z,y:b.y1,yaw:0,hw:BW/2-.3,h:3.6});len+=Math.hypot(x-px,z-pz);px=x;pz=z}
    gates=makeGates(root,list,0xff3fbf);finishT=len/5.6+list.length*1.2+3}
  const spots=course?null:makeSpots(root,{rng:rngAt(seedI,4,6),n:2,mods:()=>boxes.filter(b=>b.t==='vault'||b.wr||b.t==='beam'||b.t==='bar'),ok:()=>true,pos:b=>({x:(b.x0+b.x1)/2,y:b.y1-(b.wr?3:0),z:(b.z0+b.z1)/2}),
    pick:(b,r)=>{const T=b.t==='vault'?[['Kong vault',/Kong/],['Speed vault',/vault/i]]:b.wr?[['Wallrun',/Wallrun/],['Wall jump',/Wall jump/]]:b.t==='bar'?[['Glissade sous la barre',/Glissade/]]:[['Précision',/Précision/]];const c=T[Math.floor(r()*T.length)];return {label:c[0],bonus:400,r:7,test:n=>c[1].test(n)}}});
  /* ---------- rider ---------- */
  const human=buildHuman(look);castAll(human,true,false);root.add(human);const rig=human;rig.human=human;
  const blob=makeBlob(root,1.1);const dust=makeParticles(eco?30:100,.35,.7,root),dustFade=new THREE.Color(0x8a8296);
  const trail=makeTrail(root,{n:60,w:.12,color:0xff3fbf,fade:0x2ee6ff,opacity:.35,life:1.2,step:.3,lift:.9,hf:null});
  const fw=V3(),look3=V3(),tmp=V3();let camYaw=0,land=0,tN=0,az=0;const G=9.81*1.05,RAD=.32;const wrapA=a=>Math.atan2(Math.sin(a),Math.cos(a));
  const crash=(t,x)=>{for(let i=0;i<(eco?8:20);i++)dust.spawn(St.pos.x,St.pos.y+.4,St.pos.z,(Math.random()-.5)*3,1+Math.random()*2,(Math.random()-.5)*3,.8,.6,.55,.7);sfx.thud(1);buzz([40,30,60]);ctx.crash(t,x);return true};
  const vmax=()=>(St.runT>1.6?8.6:7.6)*(SH.speed||1);
  /* collision horizontale : sort le cylindre des boîtes qui dépassent de la hauteur de marche */
  function pushOut(feet,head){let hit=null;for(const b of near(St.pos.x,St.pos.z,RAD+.2,_N2)){if(b.y1<=feet+.45||b.y0>=head)continue;
      const ex0=b.x0-RAD,ex1=b.x1+RAD,ez0=b.z0-RAD,ez1=b.z1+RAD;const x=St.pos.x,z=St.pos.z;if(x<=ex0||x>=ex1||z<=ez0||z>=ez1)continue;
      const dx0=x-ex0,dx1=ex1-x,dz0=z-ez0,dz1=ez1-z,m=Math.min(dx0,dx1,dz0,dz1);let nx=0,nz=0;if(m===dx0){St.pos.x=ex0;nx=-1}else if(m===dx1){St.pos.x=ex1;nx=1}else if(m===dz0){St.pos.z=ez0;nz=-1}else{St.pos.z=ez1;nz=1}
      hit={b,nx,nz}}return hit}
  /* profondeur d'une boîte dans le sens de la course (pour savoir si on peut la franchir en vault) */
  const depthAlong=(b,dx,dz)=>Math.abs(dx)>Math.abs(dz)?b.x1-b.x0:b.z1-b.z0;
  function name(n,pts,opt){const p=ctx.trick(n,pts,opt);stats.moves++;if(pts>stats.bestPts){stats.bestPts=pts;stats.best=n}if(spots)spots.test(n,{mod:St.lastProp,near:St.pos},ctx);return p}
  function startAir(vy,kind){St.mode='air';St.onG=false;St.vel.y=vy;St.peak=St.pos.y;St.from=St.lastBox;St.fromPos=St.pos.clone();St.airT=0;St.kind=kind}
  function step(h,I,live){const ASS=S().sbAssist!==false;const aE=I.a&&!St.prevA;St.prevA=I.a;if(aE)St.aBuf=tN;const dE=I.y<0&&!St.prevD;St.prevD=I.y<0;
    fw.set(Math.sin(St.h),0,-Math.cos(St.h));St.stun-=h;
    if(St.mode==='vault'||St.mode==='climb'){const v=St.vault||St.climb;v.t+=h;const k=clamp(v.t/v.dur,0,1),e=k*k*(3-2*k);St.pos.x=lerp(v.a.x,v.b.x,e);St.pos.z=lerp(v.a.z,v.b.z,e);St.pos.y=lerp(v.a.y,v.b.y,Math.min(1,e*1.6))+Math.sin(Math.PI*k)*v.arc;
      if(k>=1){St.mode='run';St.onG=true;St.sp=Math.max(St.sp,v.out);St.vault=St.climb=null;if(live&&v.trick)name(v.trick,v.pts,v.opt||{})}return null}
    if(St.mode==='wallrun'){const w=St.wr;w.t+=h;St.vel.y+=(-1.8-St.vel.y)*(1-Math.exp(-(w.t>.4?2.6:1.1)*h));St.pos.addScaledVector(V3t.set(w.tx,0,w.tz),St.sp*h);St.pos.y+=St.vel.y*h;
      /* toujours contre le panneau ? */const b=w.b,inside=St.pos.z>b.z0-.2&&St.pos.z<b.z1+.2&&St.pos.y<b.y1-.3&&St.pos.y>b.y0;
      if(aE||!inside||w.t>1.35){const d=w.t*St.sp;St.mode='air';St.wrUsed=b;if(live)name('Wallrun '+Math.round(d)+' m',90+d*30,{hold:true,base:'Wallrun'});
        if(aE&&inside){St.vel.set(w.tx*St.sp*.75+w.nx*4.6,6,w.tz*St.sp*.75+w.nz*4.6);St.h=Math.atan2(St.vel.x,-St.vel.z);St.sp=Math.hypot(St.vel.x,St.vel.z);St.peak=St.pos.y;St.airT=0;if(live){sfx.whoosh();name('Wall jump',200,{risk:.4});camShake(.15)}}
        else{St.vel.set(w.tx*St.sp+w.nx*1.6,St.vel.y,w.tz*St.sp+w.nz*1.6);St.h=Math.atan2(St.vel.x,-St.vel.z)}}return null}
    if(St.mode==='run'||St.mode==='slide'||St.mode==='roll'){
      const feet=St.pos.y;/* vitesse et virages */const vm=vmax();let acc=0;
      if(St.mode==='slide'){St.slide-=h;St.sp=Math.max(2.5,St.sp-2.6*h);if(St.slide<=0||(I.y>=0&&St.slide<.45)){St.mode='run';St.height=1.8}}
      else if(St.mode==='roll'){St.roll-=h;if(St.roll<=0)St.mode='run'}
      else{if(I.y>0&&St.stun<=0){St.sp=Math.min(vm,St.sp+(St.sp<4?9:4.5)*h);St.runT+=h}else{St.sp=Math.max(0,St.sp-(I.y<0&&St.sp<4.5?12:8)*h);St.runT=0}
        if(dE&&St.sp>4.5){St.mode='slide';St.slide=.85;St.height=1.0;if(live){sfx.crunch();name('Glissade',60,{base:'Glissade'})}}}
      St.h+=I.x*clamp(5.5/Math.max(St.sp,2),1.1,3.2)*h*(St.mode==='slide'?.4:1);fw.set(Math.sin(St.h),0,-Math.cos(St.h));
      St.vel.set(fw.x*St.sp,0,fw.z*St.sp);St.pos.x+=St.vel.x*h;St.pos.z+=St.vel.z*h;
      /* obstacle devant : vault, escalade, ou mur */
      const hit=pushOut(feet,feet+St.height);
      if(hit){const top=hit.b.y1-feet,dep=depthAlong(hit.b,fw.x,fw.z),face=-(fw.x*hit.nx+fw.z*hit.nz);
        if(hit.b.t!=='wall'&&top<=1.35&&dep<=2.4&&St.sp>2.8&&face>.6){const kong=tN-St.aBuf<.35;St.mode='vault';const out=St.pos.clone().addScaledVector(fw,dep+RAD*2+.5);St.vault={t:0,dur:.42,a:St.pos.clone(),b:V3(out.x,groundTop(out.x,out.z,feet+.3),out.z),arc:top+.35,out:St.sp+(kong?.8:.3),trick:kong?'Kong vault':'Speed vault',pts:kong?210:130,opt:{base:kong?'Kong':'Speed vault'}};St.lastProp=hit.b;stats.vaults++;if(live){sfx.whoosh()}return null}
        if(top>0&&top<=1.7&&face>.6&&(aE||tN-St.aBuf<.25||St.sp>5.5&&top<=1.4)){/* rebord à hauteur : on monte (wall pop si on arrive vite) */const fast=St.sp>5.5;const tgt=St.pos.clone().addScaledVector(fw,RAD*2+.4);St.mode='climb';St.climb={t:0,dur:fast?.32:.5,a:St.pos.clone(),b:V3(tgt.x,hit.b.y1,tgt.z),arc:.2,out:fast?St.sp*.85:2.5,trick:fast?'Wall pop':'Montée',pts:fast?150:70};return null}
        St.sp*=face>.7?.2:.85;if(live&&face>.7&&St.sp>1){St.stun=.25;if(ctx.comboBreak&&St.sp>3)ctx.comboBreak();sfx.thud(.25)}}
      /* sol : bord de toit → temps coyote, puis chute */
      const gt=groundTop(St.pos.x,St.pos.z,feet);if(gt<feet-.45){St.coy+=h;if(St.coy>.12||St.mode==='slide'&&St.coy>.05){startAir(0,'fall');return null}}else{St.coy=0;St.pos.y=gt;St.lastBox=boxUnder()}
      if(aE&&St.mode!=='slide'||tN-St.aBuf<.12&&St.coy>0){St.aBuf=-9;startAir(5.1+(St.runT>1.6?.3:0)*(SH.jump||1),'jump');St.mode='air';if(live)sfx.whoosh();return null}
      return null}
    /* ---------- EN L'AIR ---------- */
    St.airT+=h;St.vel.y-=G*h;St.h+=I.x*.9*h;if(I.y>0)St.sp=Math.min(vmax(),St.sp+.6*h);const hs=Math.hypot(St.vel.x,St.vel.z)||St.sp;fw.set(Math.sin(St.h),0,-Math.cos(St.h));St.vel.x=fw.x*Math.max(hs,0);St.vel.z=fw.z*Math.max(hs,0);
    St.pos.addScaledVector(St.vel,h);St.peak=Math.max(St.peak,St.pos.y);const feet=St.pos.y;
    const hit=pushOut(feet,feet+1.8);
    if(hit){const b=hit.b,top=b.y1-feet,face=-(fw.x*hit.nx+fw.z*hit.nz);
      /* panneau cyan : wallrun si on arrive en biais (pas de face) avec de la vitesse */
      if(b.wr&&hit.nx!==0&&St.wrUsed!==b&&hs>3.5&&face<.82&&St.pos.y<b.y1-1.2){const tz=Math.sign(fw.z)||-1;St.mode='wallrun';St.wr={b,t:0,tx:0,tz,nx:hit.nx,nz:0};St.pos.x=hit.nx>0?b.x1+RAD+.02:b.x0-RAD-.02;St.h=Math.atan2(0,-tz);St.from=null;/* la traversée en wallrun n'est pas comptée en plus comme « saut de toit » */St.vel.y=clamp(St.vel.y+.8,1,1.8);St.sp=Math.max(hs,6.2);stats.wallruns++;if(live){sfx.crunch();camShake(.1)}return null}
      /* rebord à portée des mains : escalade */
      if(top>0&&top<=2.35&&face>.35&&b.t!=='bar'){const tgt=St.pos.clone().addScaledVector(V3t.set(-hit.nx,0,-hit.nz),RAD*2+.4);const fast=hs>5;St.mode='climb';St.climb={t:0,dur:fast?.36:.55,a:St.pos.clone(),b:V3(tgt.x,b.y1,tgt.z),arc:.15,out:fast?hs*.7:2.2,trick:fast?'Wall pop':'Montée',pts:fast?160:80};St.sp=0;return null}
      /* sinon : on glisse le long du mur, choc si on le prend de face */
      if(face>.75&&hs>5&&live){St.stun=.4;sfx.thud(.4);if(ctx.comboBreak)ctx.comboBreak();toast('Choc !')}const vn=St.vel.x*hit.nx+St.vel.z*hit.nz;if(vn<0){St.vel.x-=hit.nx*vn;St.vel.z-=hit.nz*vn}}
    /* sous une barre de glissade debout en l'air : la tête cogne */
    const gt=groundTop(St.pos.x,St.pos.z,feet);
    if(St.vel.y<=0&&feet<=gt){const drop=St.peak-gt,fromB=St.from,toB=boxUnder();St.pos.y=gt;St.vel.y=0;St.onG=true;St.lastBox=toB;
      if(gt<.05){if(live)return ['Tombé dans la rue','Chute de '+Math.round(drop)+' m entre deux immeubles. Saute plus tôt, au bord du toit.'];St.mode='run';return null}
      const rollIn=I.y<0||(ASS&&drop>4.5&&drop<=8.5);
      if(drop>8.5&&live)return ['Chute trop haute','Réception de '+drop.toFixed(1)+' m : vise un toit plus proche en hauteur.'];
      if(live){land=clamp(drop/4,.2,1);human.impact(land*.6);camShake(Math.min(.5,drop*.06));sfx.thud(.15+land*.35);for(let i=0;i<(eco?3:8);i++)dust.spawn(St.pos.x,St.pos.y+.05,St.pos.z,(Math.random()-.5)*2,.4+Math.random(),(Math.random()-.5)*2,.6,.6,.55,.7)}
      St.mode='run';
      if(drop>3.2){if(rollIn){St.mode='roll';St.roll=.45;St.sp=Math.max(St.sp*.92,3);if(live)name('Roulade',90+drop*20,{land:'clean'})}else{St.sp=0;St.stun=.6;if(live){toast('Réception lourde',true);if(ctx.comboBreak)ctx.comboBreak()}}}
      /* saut entre deux toits / précision */
      if(live&&fromB&&toB&&fromB!==toB&&St.fromPos){const d=Math.hypot(St.pos.x-St.fromPos.x,St.pos.z-St.fromPos.z);const narrow=Math.min(toB.x1-toB.x0,toB.z1-toB.z0)<1.3;
        if(narrow){const cx=(toB.x0+toB.x1)/2,cz=(toB.z0+toB.z1)/2,off=toB.x1-toB.x0<toB.z1-toB.z0?Math.abs(St.pos.x-cx):Math.abs(St.pos.z-cz);St.lastProp=toB;name('Précision',150+d*20,{land:off<.18?'perfect':'clean',base:'Précision'})}
        else if((fromB.t==='roof'||fromB.t==='beam')&&(toB.t==='roof'||toB.t==='beam')&&d>3){stats.gaps++;stats.maxGap=Math.max(stats.maxGap,d);name('Saut de toit '+d.toFixed(1).replace('.',',')+' m',60+d*28,{risk:clamp((d-3.5)/2.5,0,1),land:drop<1.2&&St.sp>5?'perfect':'clean',base:'Saut de toit'})}}
      return null}
    if(feet<-2&&live)return ['Tombé dans la rue','Tu as raté le toit.'];
    return null}
  function boxUnder(){let best=null,by=-1;for(const b of near(St.pos.x,St.pos.z,.3,_N)){if(b.t==='bar')continue;if(St.pos.x>=b.x0-.12&&St.pos.x<=b.x1+.12&&St.pos.z>=b.z0-.12&&St.pos.z<=b.z1+.12&&Math.abs(b.y1-St.pos.y)<.05&&b.y1>by){by=b.y1;best=b}}return best}
  const V3t=V3();
  /* ---------- pilote automatique (aperçu) : court vers la porte / vers le nord, saute aux bords, glisse sous les barres ---------- */
  function auto(){if(St.mode==='run'&&St.sp<.8){St.apStuck=(St.apStuck||0)+1/60;if(St.apStuck>.7){St.apStuck=0;St.h+=(Math.random()<.5?-1:1)*1.2}}else St.apStuck=0;let tx,tz;const g=gates&&gates.next();if(g){tx=g.x;tz=g.z-6}else{tx=Math.sin(tN*.13)*20;tz=St.pos.z-40}
    const want=Math.atan2(tx-St.pos.x,-(tz-St.pos.z));const dY=wrapA(want-St.h);const ahead=V3t.set(St.pos.x+Math.sin(St.h)*1.4,0,St.pos.z-Math.cos(St.h)*1.4);
    const gA=groundTop(ahead.x,ahead.z,St.pos.y+.3);const edge=St.mode==='run'&&gA<St.pos.y-.6&&St.sp>4;let bar=false;for(const b of near(ahead.x,ahead.z,.6,_N)){if(b.t==='bar'&&Math.abs(b.y0-St.pos.y-1.15)<.3&&ahead.x>b.x0-.5&&ahead.x<b.x1+.5&&ahead.z>b.z0-.8&&ahead.z<b.z1+.8)bar=true}
    return {x:clamp(dY*2,-1,1),y:bar?-1:1,a:edge,g:false}}
  return {env,stats,name:'Parkour',vScale:32,target:finishT,
    keys:[['↑','courir · ← → tourner'],['Espace','sauter (bord du toit) · walljump en wallrun · kong vault'],['↓','glissade en course · roulade à la réception'],['Panneaux cyan','wallrun : arrive en biais, saute pour enchaîner'],['C','caméra']],
    touch:{u:'Courir',d:'Glisser',a:'Saut',g:false},
    inst:`<div class="ihead">Flow</div><div class="ro-grid"><div class="ro"><span>Mouvement</span><b id="pkMode" style="font-size:15px">—</b></div><div class="ro"><span>Hauteur</span><b id="pkH">—</b></div>
      <div class="ro"><span>Meilleur</span><b id="pkBest" style="font-size:15px">—</b></div><div class="ro"><span>Sauts de toit</span><b id="pkG">0</b></div></div>
      <div class="barline"><span>Élan</span><div class="bt"><i id="pkBar"></i></div><b id="pkBarV">0%</b></div>`,
    hudUpdate(){const m=$('#pkMode');if(!m)return;m.textContent={run:St.sp>7.8?'sprint':St.sp>.5?'course':'arrêt',air:'en l\'air',vault:'vault',climb:'montée',wallrun:'wallrun',slide:'glissade',roll:'roulade'}[St.mode]||St.mode;
      $('#pkH').innerHTML=Math.round(St.pos.y)+'<small>m</small>';$('#pkBest').textContent=stats.best||'—';$('#pkG').textContent=stats.gaps;const f=clamp(St.sp/8.6,0,1),b=$('#pkBar');b.style.width=Math.round(f*100)+'%';b.classList.toggle('hot',St.sp>7.8);$('#pkBarV').textContent=Math.round(St.sp*3.6)+' km/h'},
    prog(){return course&&gates?'Porte <b>'+Math.min(gates.gates.filter(g=>g.done).length+1,gates.gates.length)+'</b>/'+gates.gates.length:''},
    auto,
    update(dt,I){const live=dt>0;tN+=dt;const p0x=St.pos.x,p0y=St.pos.y,p0z=St.pos.z;
      const nS=live?Math.max(1,Math.ceil(dt*60)):1,h=dt/nS;for(let k=0;k<nS;k++){const r=step(h,I,live);if(r){crash(r[0],r[1]);return}}
      if(gates&&live){const g=gates.check({x:p0x,y:p0y,z:p0z},St.pos);if(g){stats.gates++;ctx.checkpoint(g.i+1,gates.gates.length);ctx.bonus(120,'Porte '+(g.i+1));if(!gates.next()){ding(990,.5);return ctx.finish(stats.time)}}}
      if(spots)spots.update(tN);
      const sp=Math.hypot(St.pos.x-p0x,St.pos.z-p0z)/Math.max(dt,1e-3),kmh=(live?sp:St.sp)*3.6;if(live){stats.vmax=Math.max(stats.vmax,kmh);stats.time+=dt;stats.dist+=sp*dt}
      /* flow : courir vite sans s'arrêter remplit un compteur ; affiché en fin de partie */if(live){St.flow=St.sp>6&&St.stun<=0?St.flow+dt:Math.max(0,St.flow-dt*3);stats.flowMax=Math.max(stats.flowMax,St.flow);if(St.flow>0&&ctx.keep&&St.sp>7)ctx.keep()}
      stats.score+=sp*dt*.08;land=Math.max(0,land-dt*2.5);
      /* corps : foulées liées à la distance (pas de glisse sur place), poses dédiées par mouvement */
      St.phase+=(St.mode==='run'?St.sp*dt*1.15:0);const run=St.mode==='run'&&St.sp>.3;
      const ps=St.mode==='slide'?{crouch:.7,lean:-.7,spread:.5,back:.2,stance:0,look:.2}:St.mode==='vault'?{crouch:.75,lean:.7,spread:.1,back:.3,stance:0,handDown:1}:St.mode==='climb'?{crouch:.6,lean:.4,back:1.3,stance:0}:
        St.mode==='wallrun'?{crouch:.3,lean:.25,spread:.8,side:St.wr&&St.wr.nx>0?-.5:.5,stance:0}:St.mode==='roll'?{crouch:1.1,lean:1.3,back:.5,stance:0}:St.mode==='air'?{crouch:St.vel.y>0?.55:.35,lean:.35,spread:.5,back:.25,stance:0,legSpread:.2}:
        {crouch:.12+clamp(St.sp/8.6,0,1)*.18+land*.4,lean:.12+clamp(St.sp/8.6,0,1)*.4,spread:.12,stance:0,look:0};
      human.pose(ps);human.gait(run?clamp(St.sp/7,.25,1)*.85:0,St.phase,false);
      human.rotation.set(0,Math.PI/2-St.h,0);if(St.mode==='roll'){human.rotation.z=0;human.rotateZ(-(1-St.roll/.45)*Math.PI*2)}if(St.mode==='wallrun'&&St.wr)human.rotateX(St.wr.nx*-.35);
      human.position.copy(St.pos);if(St.mode==='roll')human.position.y+=.45;
      blob.set(St.pos.x,groundTop(St.pos.x,St.pos.z,St.pos.y+.1),St.pos.z,St.pos.y-groundTop(St.pos.x,St.pos.z,St.pos.y+.1));
      if(live)trail.push(St.pos.x,St.pos.y+.9,St.pos.z,Math.cos(St.h),Math.sin(St.h),St.sp>7||St.mode==='wallrun'||St.mode==='air'&&St.sp>6);trail.update(dt);dust.update(dt,3,dustFade);
      if(live&&run&&Math.floor(St.phase/Math.PI)!==Math.floor((St.phase-St.sp*dt*1.15)/Math.PI)){burst('lowpass',380,1.2,.06,.12*(.4+St.sp/12));if(St.sp>6&&Math.random()<.3)dust.spawn(St.pos.x,St.pos.y+.05,St.pos.z,(Math.random()-.5),.3,(Math.random()-.5),.4,.6,.55,.7)}
      /* caméra : derrière, regarde loin devant ; pendant le wallrun elle s'incline côté mur */
      camYaw+=wrapA(St.h-camYaw)*(live?1-Math.exp(-(St.mode==='air'?2.5:5)*dt):1);human.visible=ctx.cam()!==1;
      if(ctx.cam()===1){camera.position.set(St.pos.x,St.pos.y+(St.mode==='slide'?.9:1.65),St.pos.z);camera.rotation.set(-.08,-camYaw,St.mode==='wallrun'&&St.wr?St.wr.nx*.15:0,'YXZ')}
      else{const D=ctx.cam()===2?12:4.4,Hh=ctx.cam()===2?7:2.1;camera.position.set(St.pos.x-Math.sin(camYaw)*D,St.pos.y+Hh,St.pos.z+Math.cos(camYaw)*D);
        /* la caméra ne traverse pas les murs : on la rapproche si une boîte est entre elle et le rider */
        for(const b of near(camera.position.x,camera.position.z,1,_N)){if(camera.position.y<b.y1+.3&&camera.position.y>b.y0&&camera.position.x>b.x0-.3&&camera.position.x<b.x1+.3&&camera.position.z>b.z0-.3&&camera.position.z<b.z1+.3){camera.position.y=b.y1+.6}}
        look3.set(St.pos.x+Math.sin(camYaw)*5,St.pos.y+1.1,St.pos.z-Math.cos(camYaw)*5);camera.lookAt(look3);if(St.mode==='wallrun'&&St.wr)camera.rotateZ(St.wr.nx*.12)}
      camera.fov=64+clamp((St.sp-4)*1.6,0,10)+overdrive()*4;camera.updateProjectionMatrix();shadowFollow(St.pos);speedLines(clamp((St.sp-7.2)/2,0,1)*.5,dt);
      sound(St.mode==='air'?.06:.02+St.sp*.006,St.mode==='air'?600:400,.7);surface('air',0,St.sp);
      ctx.hud({kmh,mult:St.mode==='wallrun'?'Wallrun':St.mode==='slide'?'Glissade':St.mode==='air'?'Air '+St.airT.toFixed(1)+' s':St.flow>2?'Flow '+St.flow.toFixed(0)+' s':''},dt)},
    attract(dt){az+=dt*.1;human.visible=false;camera.position.set(Math.cos(az)*60,40,Math.sin(az)*60-20);camera.lookAt(0,10,-20);camera.fov=60;camera.updateProjectionMatrix()},
    idle(dt){dust.update(dt,3,dustFade);trail.update(dt);sound(0,300,.6);surface('air',0,0);speedLines(0,dt)},
    snapshot(){return {p:St.pos.clone(),h:St.h,ok:St.mode==='run'&&St.pos.y>1}},
    restore(s){let p=s.p;/* reprise sur le dernier toit sûr */if(!s.ok||p.y<1){const b=St.lastBox&&St.lastBox.y1>1?St.lastBox:startB;p=V3((b.x0+b.x1)/2,b.y1,(b.z0+b.z1)/2)}St.pos.copy(p);St.pos.y=groundTop(p.x,p.z,p.y+.5);St.h=s.h||0;St.mode='run';St.sp=0;St.vel.set(0,0,0);St.stun=0;St.height=1.8},
    netState(){return {p:[+St.pos.x.toFixed(2),+St.pos.y.toFixed(2),+St.pos.z.toFixed(2)],q:human.quaternion.toArray().map(v=>+v.toFixed(3))}},
    ghost(lk){const o=buildHuman(lk);o.snapPose({crouch:.2,lean:.3,stance:0});const tag=textSprite(lk.name,lk.accent,3);tag.position.y=2.3;o.add(tag);root.add(o);return o},
    overStats(){return [['Mouvements',stats.moves],['Meilleur',stats.best||'—'],['Sauts de toit (max)',stats.gaps+' ('+stats.maxGap.toFixed(1)+' m)'],['Vaults / wallruns',stats.vaults+' / '+stats.wallruns],['Flow continu max',stats.flowMax.toFixed(1)+' s']]},
    _h:(x,z)=>groundTop(x,z,1e9),_root:root,_rig:rig,_st:()=>St,_boxes:()=>boxes,_world(){},
    dispose(){scene.remove(root);disposeTree(root)}}};
