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

/* ---------- habillage du skatepark (visuel seul, aucune incidence sur le relief) ----------
   coping : tube d'acier sur la lèvre des quarters et des coins ; cornières d'acier sur les arêtes des box ;
   garde-corps à l'arrière des decks du périmètre ; tags (motifs abstraits générés, aucune marque) sur les flancs. */
const TAG_COLS=['#ff5a36','#2bb3ff','#ffd23a','#7ee08a','#c77dff','#ff7eb6','#f4f4f0'];
const TAG_WORDS=['FLOW','RIDE','SESH','DROP','WAVE','LIGNE','OLLIE','ZEN','KRUZ','SK8','VNC','LL','AIR','GRIND','SUN'];
function tagTex(seed){const R=mulberry(seed);const t=canvasTex(256,128,(c,w,h)=>{c.clearRect(0,0,w,h);
  /* tag en lettres pleines : contour sombre, remplissage dégradé, reflet, ombre portée, éclats de bombe ; mots neutres choisis à la main */
  const word=TAG_WORDS[Math.floor(R()*TAG_WORDS.length)],c1=TAG_COLS[Math.floor(R()*TAG_COLS.length)],c2=TAG_COLS[Math.floor(R()*TAG_COLS.length)];
  const fs=Math.min(96,Math.floor(210/Math.max(2.2,word.length*.62)));c.font=`900 ${fs}px Impact, "Arial Black", sans-serif`;c.textAlign='center';c.textBaseline='middle';
  c.save();c.translate(w/2,h/2+6);c.rotate((R()-.5)*.18);c.transform(1,0,(R()-.5)*.5,1,0,0);
  c.lineJoin='round';c.fillStyle='rgba(0,0,0,.35)';c.fillText(word,5,5);
  c.lineWidth=fs*.22;c.strokeStyle='#15161a';c.strokeText(word,0,0);
  const gr=c.createLinearGradient(0,-fs/2,0,fs/2);gr.addColorStop(0,c1);gr.addColorStop(1,c2);c.fillStyle=gr;c.fillText(word,0,0);
  c.lineWidth=fs*.05;c.strokeStyle='rgba(255,255,255,.75)';c.strokeText(word,-2,-3);c.restore();
  for(let i=0;i<90;i++){c.fillStyle=R()<.5?c1:'#15161a';c.globalAlpha=.6;c.fillRect(w*.08+R()*w*.84,h*.1+R()*h*.8,1.5,1.5)}c.globalAlpha=1;
  /* usure : le béton reprend le dessus par endroits */
  c.globalCompositeOperation='destination-out';for(let i=0;i<220;i++){c.fillStyle=`rgba(0,0,0,${R()*.4})`;c.fillRect(R()*w,R()*h,2+R()*7,2+R()*5)}c.globalCompositeOperation='source-over'});
  t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping;return t}
let _bowlTile=null;function bowlTileTex(){if(_bowlTile)return _bowlTile;_bowlTile=canvasTex(64,32,(c,w,h)=>{const C=['#1f6fa8','#2b86c4','#e9eef2'];
  for(let y=0;y<2;y++)for(let x=0;x<4;x++){c.fillStyle=y===0?C[(x%2)]:C[2];c.fillRect(x*16,y*16,16,16);c.strokeStyle='rgba(30,30,30,.35)';c.lineWidth=1.2;c.strokeRect(x*16+.5,y*16+.5,15,15)}});
  _bowlTile.wrapS=THREE.RepeatWrapping;_bowlTile.wrapT=THREE.ClampToEdgeWrapping;return _bowlTile}
function parkDress(park,root,o){o=o||{};const eco=!!o.eco,R=mulberry(o.seed||1);
  const steel=new THREE.MeshPhongMaterial({color:0xd8dde2,shininess:110,specular:0xcccccc}),iron=new THREE.MeshLambertMaterial({color:0x6d747c});
  const g=new THREE.Group();g.name='parkDress';root.add(g);const up=new THREE.Vector3(0,1,0),d=new THREE.Vector3();
  /* tous les tubes d'un même matériau sont fusionnés en un seul maillage (un appel de dessin par matériau) */
  const acc=new Map(),M4=new THREE.Matrix4(),Q=new THREE.Quaternion(),S1=new THREE.Vector3(1,1,1),C=new THREE.Vector3();
  const pipe=(ax,ay,az,bx,by,bz,r,mat,seg)=>{d.set(bx-ax,by-ay,bz-az);const L=d.length();if(L<.05)return;const cg=new THREE.CylinderGeometry(r,r,L,seg||8,1,true).toNonIndexed();
    Q.setFromUnitVectors(up,d.normalize());M4.compose(C.set((ax+bx)/2,(ay+by)/2,(az+bz)/2),Q,S1);cg.applyMatrix4(M4);
    let a=acc.get(mat);if(!a){a={p:[],n:[]};acc.set(mat,a)}a.p.push(...cg.attributes.position.array);a.n.push(...cg.attributes.normal.array);cg.dispose()};
  const tags=[];const tagN=eco?3:6;for(let i=0;i<tagN;i++)tags.push(new THREE.MeshLambertMaterial({map:tagTex((o.seed||1)*31+i),transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2}));
  let nTags=0;const maxTags=eco?6:16;
  for(const m of park.mods){
    if(m.radial&&m.tag==='bowl'){/* bowl : frise de carreaux sous le coping (suit la courbe de la transition) et fond légèrement teinté */
      const tile=bowlTileTex();const mat=new THREE.MeshLambertMaterial({map:tile,polygonOffset:true,polygonOffsetFactor:-2});
      let uA=0;for(let i=0;i<=m.N;i++)if(m.prof[i]<=m.H-.32)uA=m.us[i];const uB=m.lipU,NA=Math.max(8,Math.round((m.a1-m.a0)*(m.rIn+uB)/.5)),NU=6;
      const pos=[],uv=[];const Pt=(a,u)=>{const h=park.hAt(m,u)-m.y0,r=m.rIn+u-.012;return [m.cx+Math.cos(a)*r,m.y0+h+.004,m.cz+Math.sin(a)*r]};
      for(let k=0;k<NA;k++){const b0=m.a0+(m.a1-m.a0)*k/NA,b1=m.a0+(m.a1-m.a0)*(k+1)/NA;for(let j=0;j<NU;j++){const u0=uA+(uB-uA)*j/NU,u1=uA+(uB-uA)*(j+1)/NU;
        const q=[[b0,u0],[b1,u0],[b1,u1],[b0,u1]];for(const ix of [0,1,2,0,2,3]){pos.push(...Pt(q[ix][0],q[ix][1]));uv.push((q[ix][0]-m.a0)*(m.rIn+uB)/.6,(q[ix][1]-uA)/(uB-uA))}}}
      const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.computeVertexNormals();
      const fr=new THREE.Mesh(geo,mat);fr.material.side=THREE.DoubleSide;g.add(fr);
      const fl=new THREE.Mesh(new THREE.CircleGeometry(m.rIn+.4,40),new THREE.MeshLambertMaterial({color:0xbdb8ae,polygonOffset:true,polygonOffsetFactor:-1}));fl.rotation.x=-Math.PI/2;fl.position.set(m.cx,m.y0+.006,m.cz);g.add(fl)}
    if(m.radial){if(m.coping){const r=m.rIn+m.lipU,h=m.H,n=Math.max(4,Math.round((m.a1-m.a0)*r/.8));let pa=null;
        for(let k=0;k<=n;k++){const a=m.a0+(m.a1-m.a0)*k/n,p=[m.cx+Math.cos(a)*(r-.03),m.y0+h*(m.tf?m.tf(a):1)+.03,m.cz+Math.sin(a)*(r-.03)];if(pa)pipe(...pa,...p,.035,steel,8);pa=p}}continue}
    const P3=(u,v,h)=>[m.x+m.fx*u+m.rx*v,m.y0+h,m.z+m.fz*u+m.rz*v];
    if(m.type==='quarter'&&m.coping){const u=m.lipU-.03,h=park.hAt(m,m.lipU)-m.y0+.03;pipe(...P3(u,-m.W/2,h),...P3(u,m.W/2,h),.035,steel,10);
      /* garde-corps au bord arrière des decks du périmètre */
      if(m.tag==='quarter'&&!eco){const ub=m.L-.08,hb=m.prof[m.N];for(const y of [.55,1.05])pipe(...P3(ub,-m.W/2,hb+y),...P3(ub,m.W/2,hb+y),.025,iron,6);
        const np=Math.max(2,Math.round(m.W/2));for(let i=0;i<=np;i++){const v=-m.W/2+m.W*i/np;pipe(...P3(ub,v,hb),...P3(ub,v,hb+1.05),.025,iron,6)}}}
    if(m.type==='box'){/* cornières : arêtes vives en acier sur le plat du box */const r0=Math.min(m.L/2,.8),h=m.H;for(const s of [-1,1])pipe(...P3(r0,s*(m.W/2-.02),h-.01),...P3(m.L-r0,s*(m.W/2-.02),h-.01),.03,steel,4)}
    /* tags sur les flancs des modules intérieurs (pas sur le périmètre, tourné vers les tribunes) */
    if(m.tag!=='quarter'&&m.tag!=='landing'&&nTags<maxTags&&Math.max(...m.prof)>=.4&&R()<.7){const s=R()<.5?-1:1,mat=tags[Math.floor(R()*tags.length)],Hm=Math.max(.3,...m.prof);
      /* un tag de 2,4 × 1,2 m posé sur la longueur ; hors de ce cadre la texture est transparente (bords vides, ClampToEdge) */
      const TW=Math.min(2.4,m.L*.8),TH=Math.min(1.2,Hm),uc=TW/2+R()*Math.max(0,m.L-TW);
      const pos=[],uv=[];const v=s*(m.W/2+.012);for(let i=0;i<m.N;i++){const u0=m.us[i],u1=m.us[i+1],h0=m.prof[i],h1=m.prof[i+1];
        const q=[[u0,0],[u1,0],[u1,h1],[u0,h0]].map(([u,h])=>[P3(u,v,h),[.5+(u-uc)/TW*(s<0?-1:1),(h-.05)/TH]]);
        for(const ix of [0,1,2,0,2,3]){pos.push(...q[ix][0]);uv.push(...q[ix][1])}}
      const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.computeVertexNormals();
      const tm=new THREE.Mesh(geo,mat);tm.material.side=THREE.DoubleSide;g.add(tm);nTags++}}
  for(const [mat,a] of acc){const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(a.p,3));geo.setAttribute('normal',new THREE.Float32BufferAttribute(a.n,3));const m=new THREE.Mesh(geo,mat);m.castShadow=!eco;g.add(m)}
  return g}
