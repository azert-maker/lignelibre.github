/* =====================================================================
   VALLÉE · terrain de montagne généré par tronçons de 160 m (wingsuit, parapente, snowboard)
   groundH(x,z) renvoie la hauteur EXACTE du triangle affiché : sert aux collisions
===================================================================== */
const MODES={};
function makeValley(o){
  const eco=S().quality==='eco';const seedI=o.seedI,seed=(seedI%40000)/100+10;
  const CH=160,XW=o.xw||760,NX=eco?32:46,NZ=eco?14:20,SL=o.SL,DX=XW/NX,DZ=CH/NZ;
  const W0=o.W0,RELIEF=o.relief,snow=o.palette==='snow';const AHEAD=eco?3:4;
  const cx=z=>70*Math.sin(z*.0035+seed)+35*Math.sin(z*.0091+seed*1.9);
  const vw=z=>W0+W0*.4*Math.sin(z*.0027+seed*.7);
  const yawAt=z=>Math.atan((cx(z-1)-cx(z+1))/2);
  const bumps=o.bumps||0;
  function H(x,z){const c=cx(z),d=Math.abs(x-c),w=vw(z),n=fbm(x*.011+seed,z*.011);let h=z*SL+n*16;
    if(d>w){const e=(d-w)/30;h+=(Math.pow(e,1.45)*38+n*n*75*Math.min(1,e*.4))*RELIEF}
    /* pitons rocheux : jamais sur la piste quand o.clearPiste (snowboard) ; libres en wingsuit (obstacles de proximité) */
    const b=fbm(x*.028+seed*2,z*.028);if(b>.63){let k=1;if(o.clearPiste){const t=clamp((d-w*.85)/(w*.35),0,1);k=t*t*(3-2*t)}h+=(b-.63)*170*RELIEF*(o.towers??1)*k}
    if(bumps){const m=fbm(x*.06+seed,z*.06+3);if(m>.6)h+=(m-.6)*bumps}
    return h}
  const terrMat=detailMaterial(new THREE.MeshLambertMaterial({vertexColors:true}),{snow:o.palette==='snow',amp:o.palette==='snow'?.08:.16});
  const TR=1.8,TH=6;const treeGeo=treeGeometry(TR,TH);const treeMat=new THREE.MeshLambertMaterial({color:snow?0x24402e:0x2c5034});
  const chunks=new Map();const tc=new THREE.Color();const root=o.root;
  function faceColor(y,z,ny,r){const rel=y-z*SL;let c;
    if(snow){/* neige lisible : roche, neige à l'ombre des pentes raides (bleutée), neige moyenne, neige plate éclatante */if(ny<.68)c=rel>40?0x6a717b:0x5d636b;else c=ny<.78?0xa7b8cc:ny<.9?0xc8d5e4:rel>30?0xf3f6fa:0xe2e9f1}
    else if(rel>80+r*24&&ny>.5)c=0xeef3f6;else if(ny<.72)c=rel>50?(r<.5?0x7c808a:0x8a8c93):(r<.5?0x6c6962:0x77716a);else if(ny<.82)c=0x8a8578;else if(rel>50)c=r<.5?0x8d9a63:0x9aa46b;else c=r<.35?0x557e45:r<.7?0x4c7440:0x60874c;
    /* relief : les crêtes captent la lumière, le fond de vallée est plus sombre */
    return tc.setHex(c).multiplyScalar((.9+r*.18)*(.84+.3*clamp(rel/140,0,1)))}
  function buildChunk(k){
    const z0=-k*CH,cm=cx(z0-CH/2),x0=Math.floor((cm-XW/2)/DX)*DX;const G=new Float32Array((NX+1)*(NZ+1));
    for(let j=0;j<=NZ;j++){const z=z0-j*DZ;for(let i=0;i<=NX;i++)G[j*(NX+1)+i]=H(x0+i*DX,z)}
    const pos=new Float32Array(NX*NZ*18),col=new Float32Array(NX*NZ*18);let p=0;
    const put=(ax,ay,az,bx,by,bz,qx,qy,qz)=>{const ux=bx-ax,uy=by-ay,uz=bz-az,vx=qx-ax,vy=qy-ay,vz=qz-az;
      const nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx,nl=Math.hypot(nx,ny,nz)||1;const c=faceColor((ay+by+qy)/3,(az+bz+qz)/3,ny/nl,hash(p,k+7));
      pos.set([ax,ay,az,bx,by,bz,qx,qy,qz],p);for(let s=0;s<9;s+=3){col[p+s]=c.r;col[p+s+1]=c.g;col[p+s+2]=c.b}p+=9};
    for(let j=0;j<NZ;j++)for(let i=0;i<NX;i++){const xa=x0+i*DX,xb=xa+DX,za=z0-j*DZ,zc=za-DZ;
      const a=G[j*(NX+1)+i],b=G[j*(NX+1)+i+1],c=G[(j+1)*(NX+1)+i],d=G[(j+1)*(NX+1)+i+1];put(xa,a,za,xb,b,za,xa,c,zc);put(xb,b,za,xb,d,zc,xa,c,zc)}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setAttribute('color',new THREE.BufferAttribute(col,3));geo.computeVertexNormals();
    const g=new THREE.Group();const tm=new THREE.Mesh(geo,terrMat);tm.receiveShadow=true;g.add(tm);
    const chunk={g,geo,z0,x0,G,trees:[],extra:[]};chunks.set(k,chunk);const R=rngAt(seedI,k,1);
    if(o.trees){const TN=Math.round((eco?35:60)*(o.treeDensity??1)),inst=new THREE.InstancedMesh(treeGeo,treeMat,Math.max(1,TN)),m=new THREE.Matrix4(),q=new THREE.Quaternion(),s=V3(),v=V3();let n=0;
      for(let t=0;t<TN*3&&n<TN;t++){const z=z0-R()*CH,c=cx(z),x=c+(R()*2-1)*(vw(z)+(o.treeSpread??70));const y=groundH(x,z);const sc=.7+R()*.9,sy=sc*(.8+R()*.6);if(y-z*SL>55)continue;
        if(o.treeClear&&Math.abs(x-c)<o.treeClear&&k<=1)continue;
        s.set(sc,sy,sc);v.set(x,y-.4,z);m.compose(v,q,s);inst.setMatrixAt(n++,m);chunk.trees.push({x,y:y-.4,z,r:TR*sc,h:TH*sy})}
      inst.count=n;g.add(inst)}
    if(o.onChunk)o.onChunk(k,chunk,g,R);
    root.add(g);return chunk}
  function groundH(x,z){const k=Math.floor(-z/CH),c=chunks.get(k);if(!c)return H(x,z);
    const fi=(x-c.x0)/DX,fj=(c.z0-z)/DZ;const i=Math.floor(fi),j=Math.floor(fj);if(i<0||i>=NX||j<0||j>=NZ)return H(x,z);
    const u=fi-i,w=fj-j,G=c.G,a=G[j*(NX+1)+i],b=G[j*(NX+1)+i+1],cc=G[(j+1)*(NX+1)+i],d=G[(j+1)*(NX+1)+i+1];
    return (u+w<=1)?a+(b-a)*u+(cc-a)*w:d+(cc-d)*(1-u)+(b-d)*(1-w)}
  /* normale exacte du triangle sous (x,z) */
  function groundN(x,z,out){const k=Math.floor(-z/CH),c=chunks.get(k);const e=.5;
    if(c){const fi=(x-c.x0)/DX,fj=(c.z0-z)/DZ;const i=Math.floor(fi),j=Math.floor(fj);if(i>=0&&i<NX&&j>=0&&j<NZ){const u=fi-i,w=fj-j,G=c.G,
      a=G[j*(NX+1)+i],b=G[j*(NX+1)+i+1],cc=G[(j+1)*(NX+1)+i],d=G[(j+1)*(NX+1)+i+1];let hx,hz;
      if(u+w<=1){hx=(b-a)/DX;hz=-(cc-a)/DZ}else{hx=(d-cc)/DX;hz=-(d-b)/DZ}return out.set(-hx,1,-hz).normalize()}}
    const hx=(H(x+e,z)-H(x-e,z))/(2*e),hz=(H(x,z+e)-H(x,z-e))/(2*e);return out.set(-hx,1,-hz).normalize()}
  function dropChunk(k,c){root.remove(c.g);c.geo.dispose();c.g.traverse(n=>{if(n.material&&n.material!==terrMat&&n.material!==treeMat&&!n.userData.shared){if(n.material.map&&n.material.map!==softTex)n.material.map.dispose();n.material.dispose()}});
    if(o.onDrop)o.onDrop(k,c);chunks.delete(k)}
  function updateChunks(z,all){const kc=Math.floor(-z/CH);
    for(let k=Math.max(-1,kc-1);k<=kc+AHEAD;k++)if(!chunks.has(k)){buildChunk(k);if(!all)break}
    for(const [k,c] of chunks)if(k<kc-1||k>kc+AHEAD+1)dropChunk(k,c)}
  function treeHit(pts,r,pos){const kc=Math.floor(-pos.z/CH);
    for(let k=kc-1;k<=kc+1;k++){const c=chunks.get(k);if(!c)continue;for(const t of c.trees){const dx=pos.x-t.x,dz=pos.z-t.z;if(dx*dx+dz*dz>36)continue;
      for(const p of pts){const hh=p.y-t.y;if(hh<-r||hh>t.h+r)continue;const rr=t.r*(1-clamp(hh,0,t.h)/t.h)+r;if(Math.hypot(p.x-t.x,p.z-t.z)<rr)return true}}}return false}
  return {CH,SL,cx,vw,yawAt,H,groundH,groundN,updateChunks,chunks,treeHit,seed}}
