/* =====================================================================
   PIÈCES À RAMASSER · les 7 sports
   - pièce dorée = 1 pièce (sur la ligne, facile) ; pièce cyan = 2 pièces (à l'écart : saut, rail,
     rase-mottes, corde de virage, wake to wake, écart entre deux toits)
   - plafond COIN_CAP pièces par partie ; crédit UNE fois, à la fin de partie (finalizeRun)
   - rien ne se ramasse hors de state==='play' (compte à rebours, chute, pause, replay, menu)
   - chaque sport fournit cur.coins = {r, cy, scale, every, life, spawn(api,p,dir)} :
     r = rayon de ramassage, cy = hauteur du centre du rider au-dessus de sa position,
     spawn place des motifs devant le rider (positions monde) ; le module gère le reste
   - un seul InstancedMesh (48 pièces max à l'écran), géométrie et matériau partagés
===================================================================== */
const COIN_CAP=40,COIN_MAX=48;
const COIN={on:false,list:[],inst:null,val:0,got:0,riskGot:0,spawned:0,spawnedV:0,plan:null,t:0,time:0,prev:new THREE.Vector3(),pos:new THREE.Vector3(),has:false,dir:new THREE.Vector3(0,0,-1),chain:0,chainT:0};
let _coG=null,_coMat=null;const _coM4=new THREE.Matrix4(),_coQ=new THREE.Quaternion(),_coV=new THREE.Vector3(),_coS=new THREE.Vector3(),_coY=new THREE.Vector3(0,1,0),_coC=new THREE.Color();
const COIN_GOLD=new THREE.Color(0xffc533),COIN_RISK=new THREE.Color(0x4ff0ff);
function coinAssets(){if(_coG)return;
  /* pièce : disque épais à tranche, face verticale (tourne autour de y) */
  _coG=new THREE.CylinderGeometry(.36,.36,.08,18,1);_coG.rotateX(Math.PI/2);
  /* matériau non éclairé (toujours lisible, même à contre-jour) ; l'ombrage est cuit dans les sommets : faces claires, tranche plus sombre */
  {const n=_coG.attributes.normal,P=_coG.attributes.position,col=new Float32Array(n.count*3);for(let i=0;i<n.count;i++){const face=Math.abs(n.getZ(i))>.5,r=Math.hypot(P.getX(i),P.getY(i));const k=face?(r<.05?1.12:1):.62;col[i*3]=col[i*3+1]=col[i*3+2]=k}
   _coG.setAttribute('color',new THREE.BufferAttribute(col,3))}
  _coMat=new THREE.MeshBasicMaterial({color:0xffffff,vertexColors:true});_coMat.userData.shared=true}
function coinsStop(){if(COIN.inst){scene.remove(COIN.inst);if(COIN.inst.dispose)COIN.inst.dispose()}COIN.inst=null;COIN.on=false;COIN.list.length=0;COIN.plan=null;
  const h=document.getElementById('hCoins');if(h)h.hidden=true}
function coinsStart(){coinsStop();COIN.val=COIN.got=COIN.riskGot=COIN.spawned=COIN.spawnedV=0;COIN.chain=0;COIN.chainT=0;COIN.has=false;COIN.time=0;COIN.t=0;
  if(!cur||!cur.coins)return;coinAssets();
  const im=new THREE.InstancedMesh(_coG,_coMat,COIN_MAX);im.frustumCulled=false;im.userData.shared=true;
  /* setColorAt crée le tampon à la taille de im.count : on le remplit AVANT de mettre count à 0 */for(let i=0;i<COIN_MAX;i++)im.setColorAt(i,COIN_GOLD);im.count=0;scene.add(im);COIN.inst=im;COIN.plan=cur.coins;COIN.on=true;coinsHud(false)}
const coinApi={
  /* ajoute une pièce ; refusée si l'écran est plein ou si le plafond de la partie est atteint */
  add(x,y,z,risk){if(COIN.list.length>=COIN_MAX||COIN.val>=COIN_CAP)return null;if(!Number.isFinite(x+y+z))return null;
    const c={x,y,z,v:risk?2:1,risk:!!risk,t:0,life:(COIN.plan&&COIN.plan.life)||16,pick:-1,ph:Math.random()*6.28};COIN.list.push(c);COIN.spawned++;COIN.spawnedV+=c.v;return c},
  line(pts,risk){let n=0;for(const p of pts)if(this.add(p[0],p[1],p[2],risk))n++;return n},
  get time(){return COIN.time},get live(){return COIN.list.filter(c=>c.pick<0).length},get val(){return COIN.val},
  near(x,z,r){return COIN.list.some(c=>c.pick<0&&Math.abs(c.x-x)<r&&Math.abs(c.z-z)<r)}};
function coinsHud(pulse){const h=document.getElementById('hCoins');if(!h)return;h.hidden=false;const b=h.querySelector('b');if(b)b.textContent=COIN.val>=COIN_CAP?COIN_CAP+' max':String(COIN.val);
  if(pulse){h.classList.remove('pop');void h.offsetWidth;h.classList.add('pop')}}
function coinCollect(c){c.pick=0;const gain=Math.min(c.v,COIN_CAP-COIN.val);if(gain<=0)return;COIN.val+=gain;COIN.got++;if(c.risk)COIN.riskGot++;
  COIN.chain=COIN.chainT>0?Math.min(COIN.chain+1,10):0;COIN.chainT=1.1;
  if(!sfxPlay('coin',c.risk?.5:.36,1+COIN.chain*.045+(c.risk?.12:0)))ding(1320+COIN.chain*60,.12);
  if(COIN.val>=COIN_CAP)toast('Pièces : maximum de la partie atteint',true);coinsHud(true)}
/* distance point / segment (balayage entre deux images : rien ne passe au travers à grande vitesse) */
function _coinSeg(px,py,pz,a,b){const ux=b.x-a.x,uy=b.y-a.y,uz=b.z-a.z,l2=ux*ux+uy*uy+uz*uz;let t=l2>1e-9?((px-a.x)*ux+(py-a.y)*uy+(pz-a.z)*uz)/l2:0;t=t<0?0:t>1?1:t;
  const dx=a.x+ux*t-px,dy=a.y+uy*t-py,dz=a.z+uz*t-pz;return dx*dx+dy*dy+dz*dz}
function coinsTick(dt){if(!COIN.on||!cur||!COIN.inst)return;const P=COIN.plan,live=state==='play';
  if(live&&dt>0){COIN.time+=dt;const ns=cur.netState().p;COIN.pos.set(ns[0],ns[1]+(P.cy||0),ns[2]);
    let sweep=COIN.has;if(COIN.has){const dx=COIN.pos.x-COIN.prev.x,dy=COIN.pos.y-COIN.prev.y,dz=COIN.pos.z-COIN.prev.z,d=Math.hypot(dx,dz);
      if(d>40*Math.max(dt,1/60)+15)sweep=false;/* téléportation (reprise après chute) : pas de balayage */else if(d>1e-3)COIN.dir.set(dx/d,0,dz/d)}
    const a=sweep?COIN.prev:COIN.pos,R=P.r||1.2;
    /* aimant léger : une pièce dorée frôlée vient au rider (lisible sur mobile) ; les cyan demandent d'être sur la bonne trajectoire */
    const M=R*2.6,kM=1-Math.exp(-10*dt);
    for(const c of COIN.list){if(c.pick>=0)continue;const rr=R*(c.risk?1.1:1.5);if(_coinSeg(c.x,c.y,c.z,a,COIN.pos)<rr*rr){coinCollect(c);continue}
      if(!c.risk){const dx=COIN.pos.x-c.x,dy=COIN.pos.y-c.y,dz=COIN.pos.z-c.z;if(dx*dx+dy*dy+dz*dz<M*M){c.x+=dx*kM;c.y+=dy*kM;c.z+=dz*kM}}}
    COIN.prev.copy(COIN.pos);COIN.has=true;
    COIN.t-=dt;if(COIN.t<=0){COIN.t=P.every||.35;if(COIN.val<COIN_CAP){try{P.spawn(coinApi,COIN.pos,COIN.dir)}catch(e){if(!COIN.err){COIN.err=e.message;console.warn('coins',e)}}}}
    /* pièces dépassées ou trop vieilles : retirées */
    const back=P.behind??30;for(const c of COIN.list){if(c.pick>=0)continue;c.t+=dt;const dx=c.x-COIN.pos.x,dz=c.z-COIN.pos.z;
      if(c.t>c.life||(back>0&&dx*COIN.dir.x+dz*COIN.dir.z<-back)||dx*dx+dz*dz>(P.cull||400)*(P.cull||400))c.pick=9}
    if(COIN.chainT>0)COIN.chainT-=dt}
  /* affichage : rotation, flottement, envol au ramassage */
  const im=COIN.inst,sc=P.scale||1,tn=performance.now()/1000;let n=0;
  for(let i=COIN.list.length-1;i>=0;i--){const c=COIN.list[i];if(c.pick>=0){if(c.pick>=.3){COIN.list.splice(i,1);continue}if(live)c.pick+=dt}}
  for(const c of COIN.list){const k=c.pick>=0?c.pick/.3:0;const s=sc*(c.risk?1.3:1)*(1+k*.9)*(k>0?1-k*k:1);
    _coQ.setFromAxisAngle(_coY,tn*(c.risk?4.2:3)+c.ph);_coV.set(c.x,c.y+Math.sin(tn*2.2+c.ph)*.1*sc+k*1.4*sc,c.z);_coS.set(s,s,s);_coM4.compose(_coV,_coQ,_coS);im.setMatrixAt(n,_coM4);
    im.setColorAt(n,c.risk?COIN_RISK:COIN_GOLD);n++}
  im.count=n;im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;im.visible=state!=='replay'}

/* ---------- planificateur commun des sports « à modules » (BMX, motocross) ----------
   Toutes les o.every secondes : choisit un module ou un rail DEVANT le rider (7 à 40 m, dans l'axe),
   pose 3 pièces d'approche au sol (faciles) puis le motif du module (pièces cyan : en l'air au-dessus
   du saut, sur le rail, au-dessus du coping, sur les crêtes de whoops). */
function coinParkPlan(park,o){o=o||{};const st={next:1.5,last:null};const J=o.jump||[[2,1],[4.5,1.6],[7,1.3]],cy=o.cy??.9;
  return {r:o.r||1.25,cy,scale:o.scale||1,every:.3,life:o.life||13,behind:0,cull:120,
    spawn(api,p,dir){if(api.time<st.next||api.live>4)return;st.next=api.time+(o.every||6);
      const ground=(x,z)=>park.H(x,z);const cand=[];
      for(const m of park.mods){if(m.radial||m===st.last)continue;if(!/kicker|quarter|table|fmx|box|whoops|step|bank/.test(m.tag+m.type))continue;
        const dx=m.x-p.x,dz=m.z-p.z,d=Math.hypot(dx,dz);if(d<7||d>40)continue;if((dx*dir.x+dz*dir.z)/d<.55)continue;if(m.fx*dir.x+m.fz*dir.z<.3)continue;cand.push({m,d})}
      for(const r of park.rails){if(r===st.last||r.kind==='ledge'&&Math.random()<.5)continue;const dx=r.x0-p.x,dz=r.z0-p.z,d=Math.hypot(dx,dz);if(d<6||d>36)continue;if((dx*dir.x+dz*dir.z)/d<.55)continue;if(r.fx*dir.x+r.fz*dir.z<.4)continue;cand.push({r,d})}
      if(!cand.length){/* rien devant : petite ligne droite dans l'axe */const pts=[];for(let i=1;i<=4;i++){const x=p.x+dir.x*(8+i*3),z=p.z+dir.z*(8+i*3);pts.push([x,ground(x,z)+cy,z])}if(o.free!==false)api.line(pts,false);return}
      cand.sort((a,b)=>a.d-b.d);const c=cand[Math.min(cand.length-1,Math.floor(Math.random()*Math.min(3,cand.length)))];
      const ex=c.m?c.m.x:c.r.x0,ez=c.m?c.m.z:c.r.z0;const appr=[];for(const t of [.4,.62,.84]){const x=lerp(p.x,ex,t),z=lerp(p.z,ez,t);appr.push([x,ground(x,z)+cy,z])}api.line(appr,false);
      if(c.r){const r=c.r;st.last=r;const pts=[];for(const t of [.22,.44,.66,.88])pts.push([r.x0+r.dx*t,r.y0+r.dy*t+cy*.75,r.z0+r.dz*t]);api.line(pts,true);return}
      const m=c.m;st.last=m;const pts=[];
      if(/whoops/.test(m.tag)){const n=Math.max(3,Math.round(m.L/4));for(let i=0;i<Math.min(n,5);i++){const u=(i+.5)/n*m.L;pts.push([m.x+m.fx*u,m.y0+m.H+cy,m.z+m.fz*u])}api.line(pts,true);return}
      if(/box|bank|step/.test(m.tag+m.type)){for(const u of [.3,.55,.8].map(k=>k*m.L)){const x=m.x+m.fx*u,z=m.z+m.fz*u;pts.push([x,park.hAt(m,u)+cy,z])}api.line(pts,false);return}
      const ul=m.type==='table'?Math.min(m.L*.4,8):m.lipU,hl=park.hAt(m,ul);
      if(m.type==='quarter'&&m.coping){/* air vertical : deux pièces au-dessus du coping */for(const h of [1.1,2.2])pts.push([m.x+m.fx*(ul-.4),hl+cy+h,m.z+m.fz*(ul-.4)]);api.line(pts,true);return}
      const k=clamp(m.H/(o.refH||1.4),.8,2.4);for(const [d,h] of J)pts.push([m.x+m.fx*(ul+d*k),hl+cy+h*Math.sqrt(k),m.z+m.fz*(ul+d*k)]);api.line(pts,true)}}}
