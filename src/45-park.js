/* =====================================================================
   PARC À MODULES · BMX (skatepark) et motocross (circuit, arène freestyle)
   Relief EXACT : chaque module est un profil de hauteur échantillonné le long de son axe u
   (constant sur la largeur v). La physique interpole les MÊMES points que le maillage affiché :
   ce que le joueur voit est ce qu'il touche (aucune hitbox invisible).
   Types linéaires : kicker (montée, dos vertical) · quarter (arc raide + plateforme, sortie « vert »)
     table (montée, plat, descente) · landing (réception) · box (plat bas, petites rampes, arêtes grindables)
     bank (plan incliné + plateforme) · whoops (bosses en série) · step (marche montante)
   Type radial : corner / berm (arc de quarter ou virage relevé autour d'un centre).
   Rails : segments grindables (barre + pieds), rangés à part.
   Index spatial : cases de 16 m → hauteur en O(modules de la case).
===================================================================== */
function makePark(o){
  const root=o.root,CELL=16,cells=new Map(),mods=[],rails=[];const eco=S().quality==='eco';
  const base=o.base||(()=>0);
  /* géométrie fusionnée : un maillage « dessus » et un maillage « côtés » (couleurs par sommet) */
  const TP=[],TC=[],SP=[],SC=[];const tc=new THREE.Color();
  const key=(i,j)=>i*73856093^j*19349663;
  function reg(m,x0,z0,x1,z1){for(let i=Math.floor(x0/CELL);i<=Math.floor(x1/CELL);i++)for(let j=Math.floor(z0/CELL);j<=Math.floor(z1/CELL);j++){const k=key(i,j);let a=cells.get(k);if(!a){a=[];cells.set(k,a)}a.push(m)}}
  function tri(A,ax,ay,az,bx,by,bz,cx,cy,cz,col,C){A.push(ax,ay,az,bx,by,bz,cx,cy,cz);for(let i=0;i<3;i++)C.push(col.r,col.g,col.b)}
  function quad(A,C,p0,p1,p2,p3,col){tri(A,...p0,...p1,...p2,col,C);tri(A,...p0,...p2,...p3,col,C)}
  /* profils (u normalisé 0..1 sur la longueur L) */
  function sample(N,f){const a=new Float32Array(N+1);for(let i=0;i<=N;i++)a[i]=f(i/N);return a}
  /* profil par morceaux : [[longueur, f(x local), nb de segments], …] avec un échantillon exactement à chaque cassure (lèvre nette) */
  function piece(parts,extra){let N=0;for(const p of parts)N+=p[2];const prof=new Float32Array(N+1),us=new Float32Array(N+1);let k=0,u0=0;prof[0]=parts[0][1](0);
    for(const [len,f,n] of parts){for(let i=1;i<=n;i++){k++;us[k]=u0+len*i/n;prof[k]=f(len*i/n)}u0+=len}return Object.assign({N,prof,us,L:u0},extra||{})}
  function profileOf(t,L,H,P){P=P||{};switch(t){
    case 'kicker':{if(P.back){/* butte de terre : montée puis dos en pente raide (pas de mur) ; un échantillon pile sur la lèvre */return piece([[L,x=>H*Math.pow(x/L,P.pow||1.8),16],[P.back,x=>H*(1-x/P.back),3]],{lipU:L})}
      const N=12;return {N,prof:sample(N,u=>H*Math.pow(u,P.pow||1.8))}}
    case 'quarter':{/* arc de cercle jusqu'à P.ang (rad), puis plateforme */const ang=P.ang||1.2,R=H/(1-Math.cos(ang)),xa=R*Math.sin(ang),D=Math.max(.5,L-xa),N=16;
      const xs=[],ys=[];for(let i=0;i<=12;i++){const a=ang*i/12;xs.push(R*Math.sin(a));ys.push(R*(1-Math.cos(a)))}
      /* points non uniformes → on rééchantillonne en u uniforme (N=16 sur l'arc, +4 sur la plateforme) */
      const NA=16,ND=Math.max(2,Math.round(D/.6)),Nt=NA+ND,prof=new Float32Array(Nt+1),us=new Float32Array(Nt+1);
      for(let i=0;i<=NA;i++){const x=xa*i/NA;let k=0;while(k<11&&xs[k+1]<x)k++;const f=(x-xs[k])/(xs[k+1]-xs[k]||1);prof[i]=ys[k]+(ys[k+1]-ys[k])*clamp(f,0,1);us[i]=x}
      for(let i=1;i<=ND;i++){prof[NA+i]=H;us[NA+i]=xa+D*i/ND}return {N:Nt,prof,us,lipU:xa,L:xa+D}}
    case 'table':{const lu=P.up||L*.35,lf=P.flat||L*.3,ld=L-lu-lf;return piece([[lu,x=>H*Math.pow(x/lu,P.upPow||1.6),12],[lf,x=>H,1],[ld,x=>H*(1-x/ld),8]])}
    case 'landing':{const lf=P.flat||1,N=14;return {N,prof:sample(N,u=>{const x=u*L;return x<lf?H:H*Math.pow(1-(x-lf)/(L-lf),1.15)})}}
    case 'box':{const r=P.ramp||.7,N=8;return {N,prof:sample(N,u=>{const x=u*L;return x<r?H*x/r:x>L-r?H*(L-x)/r:H})}}
    case 'bank':{const lu=P.up||L*.6,N=12;return {N,prof:sample(N,u=>{const x=u*L;return x<lu?H*x/lu:H})}}
    case 'step':{const lu=P.up||L*.4,N=12;return {N,prof:sample(N,u=>{const x=u*L;return x<lu?H*Math.pow(x/lu,1.4):H})}}
    case 'block':return {N:1,prof:new Float32Array([H,H])};
    case 'whoops':{const n=P.n||5,N=n*6;return {N,prof:sample(N,u=>H*(1-Math.cos(u*n*2*Math.PI))/2)}}}
    throw new Error('module '+t)}
  /* ---------- module linéaire ---------- */
  function add(type,x,z,yaw,L,W,H,P){P=P||{};const fx=Math.sin(yaw),fz=-Math.cos(yaw),rx=Math.cos(yaw),rz=Math.sin(yaw);
    const pr=profileOf(type,L,H,P);if(pr.L)L=pr.L;const y0=P.y0!=null?P.y0:base(x,z);
    if(pr.L&&!pr.us)L=pr.L;const us=pr.us||sample(pr.N,u=>u*L);const m={type,x,z,yaw,fx,fz,rx,rz,L,W,H,y0,N:pr.N,prof:pr.prof,us,lipU:pr.lipU||L,radial:false,tag:P.tag||type,col:P.col,id:mods.length};
    mods.push(m);const ex=Math.abs(fx)*L+Math.abs(rx)*W,ez=Math.abs(fz)*L+Math.abs(rz)*W,cxm=x+fx*L/2,czm=z+fz*L/2;reg(m,cxm-ex/2-1,czm-ez/2-1,cxm+ex/2+1,czm+ez/2+1);
    /* maillage : dessus (2 colonnes v=±W/2 + milieu), flancs, dos, face avant */
    const P3=(u,v,h)=>[x+fx*u+rx*v,y0+h,z+fz*u+rz*v];const top=new THREE.Color(P.top||o.top||0xc9c4bb),side=new THREE.Color(P.side||o.side||0x5d6670),lip=new THREE.Color(P.lip||o.lip||0xff5a36);
    for(let i=0;i<m.N;i++){const u0=us[i],u1=us[i+1],h0=m.prof[i],h1=m.prof[i+1];const sl=Math.abs(h1-h0)/Math.max(.01,u1-u0);
      tc.copy(top).multiplyScalar(.92+.1*clamp(1-sl*.35,0,1)+((i%2)?.02:0));
      quad(TP,TC,P3(u0,-W/2,h0),P3(u0,W/2,h0),P3(u1,W/2,h1),P3(u1,-W/2,h1),tc);
      for(const s of [-1,1])quad(SP,SC,P3(u0,s*W/2,-.05),P3(u1,s*W/2,-.05),P3(u1,s*W/2,h1),P3(u0,s*W/2,h0),side)}
    if(m.prof[m.N]>.02)quad(SP,SC,P3(m.L,-W/2,-.05),P3(m.L,W/2,-.05),P3(m.L,W/2,m.prof[m.N]),P3(m.L,-W/2,m.prof[m.N]),side);
    if(m.prof[0]>.02)quad(SP,SC,P3(0,W/2,-.05),P3(0,-W/2,-.05),P3(0,-W/2,m.prof[0]),P3(0,W/2,m.prof[0]),side);
    /* liseré de lèvre / coping : repère visuel de la zone de décollage */
    if(type==='kicker'||type==='quarter'||type==='table'){const ul=type==='table'?(P.up||L*.35):m.lipU,hl=hAt(m,ul)-y0;const t=.08;
      quad(TP,TC,P3(ul-.12,-W/2,hl+.006),P3(ul-.12,W/2,hl+.006),P3(ul,W/2,hl+.006),P3(ul,-W/2,hl+.006),lip);if(type==='quarter')m.coping=P.vert!==false}
    if(type==='box'&&P.ledge!==false){/* arêtes grindables du box */for(const s of [-1,1]){const r0=P.ramp||.7;addRailRaw(x+fx*r0+rx*s*(W/2-.05),z+fz*r0+rz*s*(W/2-.05),x+fx*(L-r0)+rx*s*(W/2-.05),z+fz*(L-r0)+rz*s*(W/2-.05),y0+H,y0+H,'ledge',false)}}
    return m}
  /* ---------- module radial (coin de quarter, virage relevé) ----------
     centre (cx,cz), arc [a0,a1] (angles monde, sens trigo sur x/z), profil de rIn (bas) à rIn+L (haut/plateforme) */
  function addRadial(type,cx,cz,a0,a1,rIn,L,H,P){P=P||{};const pr=profileOf(type==='berm'?'table':'quarter',L,H,Object.assign({},P,{up:P.up||L*.55,flat:P.flat||L*.12}));/* berm = butte (montée, crête, dos en pente : pas de mur côté extérieur) */if(type==='corner'&&P.L2)pr.L=Math.max(pr.L||0,P.L2),pr.us&&(pr.us[pr.N]=pr.L);if(pr.L)L=pr.L;const y0=P.y0!=null?P.y0:base(cx,cz);
    const us=pr.us||sample(pr.N,u=>u*L);const m={type,cx,cz,a0,a1,rIn,L,H,y0,N:pr.N,prof:pr.prof,us,lipU:pr.lipU||L,radial:true,tag:P.tag||type,id:mods.length,coping:type==='corner',taper:P.taper||0};
    /* biseau angulaire (virages relevés) : la hauteur monte de 0 à 100 % sur « taper » radians aux deux bouts → pas de mur en entrée de virage */
    const tf=a=>m.taper?clamp(Math.min(a-a0,a1-a)/m.taper,0,1):1;m.tf=tf;
    mods.push(m);const R=rIn+L;reg(m,cx-R-1,cz-R-1,cx+R+1,cz+R+1);
    const top=new THREE.Color(P.top||o.top||0xc9c4bb),side=new THREE.Color(P.side||o.side||0x5d6670);const NA=Math.max(4,Math.round((a1-a0)*R/(P.taper?1.4:2.2)));
    const P3=(a,r,h)=>[cx+Math.cos(a)*r,y0+h*tf(a),cz+Math.sin(a)*r];const NAx=m.taper?Math.max(4,Math.round((a1-a0)*R/1.4)):0;
    for(let k=0;k<NA;k++){const b0=a0+(a1-a0)*k/NA,b1=a0+(a1-a0)*(k+1)/NA;
      for(let i=0;i<m.N;i++){const r0=rIn+us[i],r1=rIn+us[i+1],h0=m.prof[i],h1=m.prof[i+1];tc.copy(top).multiplyScalar(.93+((i+k)%2)*.03);quad(TP,TC,P3(b0,r0,h0),P3(b0,r1,h1),P3(b1,r1,h1),P3(b1,r0,h0),tc)}
      if(m.prof[m.N]>.02)quad(SP,SC,P3(b0,R,-.05),P3(b1,R,-.05),P3(b1,R,m.prof[m.N]),P3(b0,R,m.prof[m.N]),side)}
    for(const b of [a0,a1])for(let i=0;i<m.N;i++){const r0=rIn+us[i],r1=rIn+us[i+1];quad(SP,SC,P3(b,r0,-.05),P3(b,r1,-.05),P3(b,r1,m.prof[i+1]),P3(b,r0,m.prof[i]),side)}
    return m}
  const wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
  function inArc(m,a){const d=wrap(a-m.a0),span=wrap(m.a1-m.a0)<0?wrap(m.a1-m.a0)+2*Math.PI:(m.a1-m.a0);return (d<0?d+2*Math.PI:d)<=span}
  /* coordonnées locales : u (le long du profil), v (travers) ; null si hors module */
  function local(m,x,z,out){if(m.radial){const dx=x-m.cx,dz=z-m.cz,r=Math.hypot(dx,dz),u=r-m.rIn;const a=Math.atan2(dz,dx);if(u<0||u>m.L||!inArc(m,a))return null;out.u=u;out.v=0;out.fx=dx/(r||1);out.fz=dz/(r||1);out.ta=m.taper?m.tf(m.a0+wrap(a-m.a0)+(wrap(a-m.a0)<0?2*Math.PI:0)):1;return out}
    const dx=x-m.x,dz=z-m.z,u=dx*m.fx+dz*m.fz;if(u<0||u>m.L)return null;const v=dx*m.rx+dz*m.rz;if(Math.abs(v)>m.W/2)return null;out.u=u;out.v=v;out.fx=m.fx;out.fz=m.fz;return out}
  function hAt(m,u){const us=m.us;let i=Math.min(m.N-1,Math.max(0,Math.floor(u/m.L*m.N)));while(i<m.N-1&&us[i+1]<u)i++;while(i>0&&us[i]>u)i--;const f=(u-us[i])/((us[i+1]-us[i])||1);return m.y0+m.prof[i]+(m.prof[i+1]-m.prof[i])*clamp(f,0,1)}
  const _l={u:0,v:0,fx:0,fz:0};
  /* hauteur exacte + module porteur (le plus haut) */
  const HIT={h:0,m:null,u:0,v:0,fx:0,fz:0};
  function ground(x,z){let h=base(x,z),best=null,bu=0,bv=0,bfx=0,bfz=0;const a=cells.get(key(Math.floor(x/CELL),Math.floor(z/CELL)));
    if(a)for(const m of a){_l.ta=1;if(!local(m,x,z,_l))continue;let hm=hAt(m,_l.u);if(_l.ta<1)hm=m.y0+(hm-m.y0)*_l.ta;if(hm>h+1e-4){h=hm;best=m;bu=_l.u;bv=_l.v;bfx=_l.fx;bfz=_l.fz}}
    HIT.h=h;HIT.m=best;HIT.u=bu;HIT.v=bv;HIT.fx=bfx;HIT.fz=bfz;return HIT}
  const H=(x,z)=>ground(x,z).h;
  /* normale EXACTE du triangle porteur (pente du segment de profil) : pas de différences finies à cheval sur un bord de module */
  function normal(x,z,out){const g=ground(x,z);if(!g.m){if(o.base){const e=.1,hx=(base(x+e,z)-base(x-e,z))/(2*e),hz=(base(x,z+e)-base(x,z-e))/(2*e);return out.set(-hx,1,-hz).normalize()}return out.set(0,1,0)}
    const m=g.m,us=m.us;let i=Math.min(m.N-1,Math.max(0,Math.floor(g.u/m.L*m.N)));while(i<m.N-1&&us[i+1]<g.u)i++;while(i>0&&us[i]>g.u)i--;let sl=(m.prof[i+1]-m.prof[i])/((us[i+1]-us[i])||1);if(m.radial&&m.taper)sl*=_l.ta??1;
    return out.set(-sl*g.fx,1,-sl*g.fz).normalize()}
  /* ---------- rails ---------- */
  const railMat=new THREE.MeshPhongMaterial({color:o.rail||0xffc23a,shininess:80,specular:0x887755}),legMat=new THREE.MeshLambertMaterial({color:0x2a2f36});
  function addRailRaw(x0,z0,x1,z1,y0,y1,kind,mesh){const r={x0,y0,z0,dx:x1-x0,dy:y1-y0,dz:z1-z0,kind};r.hl=Math.hypot(r.dx,r.dz);r.len=Math.hypot(r.dx,r.dy,r.dz);r.fx=r.dx/r.hl;r.fz=r.dz/r.hl;r.rx=-r.fz;r.rz=r.fx;r.yaw=Math.atan2(r.fx,-r.fz);
    r.rx=Math.cos(r.yaw);r.rz=Math.sin(r.yaw);rails.push(r);
    if(mesh!==false){const bar=new THREE.Mesh(new THREE.CylinderGeometry(.045,.045,r.len,8),railMat);bar.position.set(x0+r.dx/2,y0+r.dy/2,z0+r.dz/2);bar.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(r.dx,r.dy,r.dz).normalize());bar.castShadow=true;root.add(bar);
      const nL=Math.max(2,Math.round(r.hl/3));for(let i=0;i<=nL;i++){const t=.04+.92*i/nL,lx=x0+r.dx*t,lz=z0+r.dz*t,ly=y0+r.dy*t,gy=base(lx,lz);const leg=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,ly-gy,6),legMat);leg.position.set(lx,(ly+gy)/2,lz);root.add(leg)}}
    return r}
  function addRail(x,z,yaw,len,h0,h1){const fx=Math.sin(yaw),fz=-Math.cos(yaw);return addRailRaw(x,z,x+fx*len,z+fz*len,base(x,z)+h0,base(x+fx*len,z+fz*len)+(h1??h0),'rail')}
  /* ---------- finalisation : 2 maillages fusionnés ---------- */
  let meshes=[];
  function finalize(){const mk=(A,C,mat)=>{if(!A.length)return null;const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(A,3));g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));g.computeVertexNormals();const me=new THREE.Mesh(g,mat);me.receiveShadow=true;me.castShadow=!eco;root.add(me);meshes.push(me);return me};
    mk(TP,TC,detailMaterial(new THREE.MeshLambertMaterial({vertexColors:true}),{amp:.12}));mk(SP,SC,new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide}));TP.length=TC.length=SP.length=SC.length=0}
  /* rail le plus proche compatible (pour l'accroche) */
  function railNear(x,y,z,maxLat){let best=null,bd=maxLat;for(const r of rails){const px=x-r.x0,pz=z-r.z0,t=(px*r.dx+pz*r.dz)/(r.hl*r.hl);if(t<-.02||t>1.02)continue;const lat=Math.abs(px*r.rx+pz*r.rz);if(lat<bd){bd=lat;best={r,t:clamp(t,0,1),lat:px*r.rx+pz*r.rz,dy:y-(r.y0+r.dy*clamp(t,0,1))}}}return best}
  /* face verticale franchie entre deux positions (pour rebondir de façon lisible au lieu de chuter) :
     renvoie la normale horizontale sortante de la face touchée (côté, avant, arrière, bouts d'arc) */
  const WN={x:0,z:0};
  function wallNormal(m,px,pz){if(!m)return null;if(m.radial){const dx=px-m.cx,dz=pz-m.cz,r=Math.hypot(dx,dz)||1,u=r-m.rIn;if(u>m.L){WN.x=dx/r;WN.z=dz/r;return WN}if(u<0){WN.x=-dx/r;WN.z=-dz/r;return WN}
      const a=Math.atan2(dz,dx),t0=Math.abs(wrap(a-m.a0)),t1=Math.abs(wrap(a-m.a1));const b=t0<t1?m.a0:m.a1,s=t0<t1?-1:1;WN.x=-Math.sin(b)*s;WN.z=Math.cos(b)*s;return WN}
    const dx=px-m.x,dz=pz-m.z,u=dx*m.fx+dz*m.fz,v=dx*m.rx+dz*m.rz;if(Math.abs(v)>m.W/2){const s=Math.sign(v);WN.x=m.rx*s;WN.z=m.rz*s;return WN}if(u<0){WN.x=-m.fx;WN.z=-m.fz;return WN}WN.x=m.fx;WN.z=m.fz;return WN}
  return {wallNormal,add,addRadial,addRail,addRailRaw,finalize,ground,H,normal,mods,rails,railNear,hAt,local}}

/* ---------- portes de passage (parcours) : arche franchissable, ordre imposé ---------- */
function makeGates(root,list,color,opt){opt=opt||{};const mat=new THREE.MeshLambertMaterial({color:color||0xff5a36}),mat2=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.18,side:THREE.DoubleSide,depthWrite:false});
  const gates=list.map((g,i)=>{const grp=new THREE.Group();const hw=g.hw||3.2,h=g.h||4.5;for(const s of [-1,1]){const p=new THREE.Mesh(new THREE.BoxGeometry(.25,h,.25),mat);p.position.set(s*hw,h/2,0);grp.add(p)}
    const top=new THREE.Mesh(new THREE.BoxGeometry(2*hw+.25,.35,.25),mat);top.position.y=h;grp.add(top);const plane=new THREE.Mesh(new THREE.PlaneGeometry(2*hw,h),mat2);plane.position.y=h/2;grp.add(plane);
    const tag=textSprite('Porte '+(i+1),0xff5a36,2.6);tag.position.y=h+1;grp.add(tag);grp.position.set(g.x,g.y,g.z);grp.rotation.y=-g.yaw;root.add(grp);
    return Object.assign({grp,plane,done:false,i,hw,h,cos:Math.cos(g.yaw),sin:Math.sin(g.yaw)},g)});
  /* franchissement : passage du plan de la porte entre les poteaux (hauteur libre jusqu'à h+2 m) */
  function check(prev,p){const g=gates.find(x=>!x.done);if(!g)return null;const fx=Math.sin(g.yaw),fz=-Math.cos(g.yaw);const a=(prev.x-g.x)*fx+(prev.z-g.z)*fz,b=(p.x-g.x)*fx+(p.z-g.z)*fz;
    if(a<0&&b>=0||a>0&&b<=0){const lat=(p.x-g.x)*g.cos+(p.z-g.z)*g.sin;if(opt.lenient&&Math.abs(lat)>=g.hw+.3&&Math.abs(lat)<g.hw*3+6){g.done=true;g.missed=true;g.plane.material=g.plane.material.clone();g.plane.material.color.set(0xff5a4f);return g}
      if(Math.abs(lat)<g.hw+.3&&p.y<g.y+g.h+2){g.done=true;g.plane.material=g.plane.material.clone();g.plane.material.color.set(0x7ee08a);g.plane.material.opacity=.3;return g}}return null}
  function next(){return gates.find(x=>!x.done)}
  function paint(){const n=next();for(const g of gates){g.grp.visible=!g.done||true;g.grp.scale.setScalar(g===n?1.0:.85)}}
  return {gates,check,next,paint}}

/* ---------- « spots » du monde libre : défis secondaires posés sur un module ----------
   Un spot = un module + un type de figure attendu ; réussir la figure au-dessus du module = bonus.
   Toujours 2 spots actifs ; un nouveau apparaît quand l'un est validé. */
function makeSpots(root,o){const list=[];const R=o.rng;let mat=null;
  function spawn(){const pool=o.mods().filter(m=>!list.some(s=>s.m===m)&&o.ok(m));if(!pool.length)return;const m=pool[Math.floor(R()*pool.length)];const ch=o.pick(m,R);
    const p=o.pos(m);const s=textSprite(ch.label+' · +'+ch.bonus,0xffd23a,4.6);s.position.set(p.x,p.y+3.2,p.z);root.add(s);
    if(!mat)mat=new THREE.MeshBasicMaterial({color:0xffd23a,transparent:true,opacity:.55,depthWrite:false});const ring=new THREE.Mesh(new THREE.TorusGeometry(1.4,.07,6,28),mat);ring.rotation.x=Math.PI/2;ring.position.set(p.x,p.y+2.2,p.z);root.add(ring);
    list.push({m,ch,s,ring,p})}
  function test(name,info,ctx){for(let i=0;i<list.length;i++){const sp=list[i];if(info.mod!==sp.m&&!(info.near&&Math.hypot(info.near.x-sp.p.x,info.near.z-sp.p.z)<sp.ch.r))continue;if(!sp.ch.test(name,info))continue;
      root.remove(sp.s);root.remove(sp.ring);sp.s.material.map.dispose();sp.s.material.dispose();ctx.bonus(sp.ch.bonus,'Spot : '+sp.ch.label);if(!sfx.trick(4))ding(990,.3);list.splice(i,1);spawn();return true}return false}
  function update(t){for(const sp of list){sp.ring.rotation.z=t*1.5;sp.ring.position.y=sp.p.y+2.2+Math.sin(t*2)*.15}}
  for(let i=0;i<(o.n||2);i++)spawn();return {list,test,update,spawn}}
