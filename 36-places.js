/* =====================================================================
   LIEUX ICONIQUES · décors signature des cartes
   Règles : rien sur la ligne de jeu (décor hors des pistes / derrière les quarters), géométries fusionnées
   à couleurs de sommet (1 appel de dessin par type d'objet), instanciées quand elles se répètent.
     BMX       Venice Beach Park   béton à joints, coping acier, sable, océan, palmiers, postes de sauveteurs,
                                   façades du boardwalk, montagnes de Santa Monica au loin, lumière dorée
     Wingsuit  Lauterbrunnen       falaises verticales (makeValley cliff), cascades, chalets, église au clocher pointu
     Snowboard Whistler Blackcomb  snowpark (modules fournis), filets orange, drapeaux, sommets glaciaires
===================================================================== */
/* fusion de géométries (non indexées) avec une couleur par pièce */
function mergeColored(parts){let n=0;const geos=parts.map(([g,c,m])=>{let x=g.index?g.toNonIndexed():g;if(m)x.applyMatrix4(m);if(!x.attributes.normal)x.computeVertexNormals();n+=x.attributes.position.count;return [x,new THREE.Color(c)]});
  const pos=new Float32Array(n*3),nor=new Float32Array(n*3),col=new Float32Array(n*3);let o=0;
  for(const [g,c] of geos){const p=g.attributes.position.array,q=g.attributes.normal.array;pos.set(p,o*3);nor.set(q,o*3);for(let i=0;i<g.attributes.position.count;i++){col[(o+i)*3]=c.r;col[(o+i)*3+1]=c.g;col[(o+i)*3+2]=c.b}o+=g.attributes.position.count}
  const r=new THREE.BufferGeometry();r.setAttribute('position',new THREE.BufferAttribute(pos,3));r.setAttribute('normal',new THREE.BufferAttribute(nor,3));r.setAttribute('color',new THREE.BufferAttribute(col,3));return r}
const _pm=(x,y,z,rx,ry,rz,sx,sy,sz)=>new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(rx||0,ry||0,rz||0)),new THREE.Vector3(sx??1,sy??1,sz??1));
const VCOL=()=>new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide});
function instanceAll(geo,mat,list,root){if(!list.length)return null;const im=new THREE.InstancedMesh(geo,mat,list.length);const m=new THREE.Matrix4();
  list.forEach((t,i)=>{m.compose(new THREE.Vector3(t[0],t[1],t[2]),new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),t[3]||0),new THREE.Vector3(t[4]||1,t[5]||t[4]||1,t[4]||1));im.setMatrixAt(i,m)});root.add(im);return im}

/* ---------- objets ---------- */
let _palm=null;function palmGeo(){if(_palm)return _palm;const P=[];const H=9,N=4;let x=0,y=0;
  for(let i=0;i<N;i++){const t=i/N,bend=.9*t*t;const seg=new THREE.CylinderGeometry(.2-.07*t,.24-.07*t,H/N+.05,5,1,true);P.push([seg,i%2?0x8a6a4a:0x7a5c3e,_pm(bend,y+H/N/2,0,0,0,-.12*t)]);y+=H/N}
  const top=new THREE.Vector3(.9,H,0);
  for(let k=0;k<7;k++){const a=k/7*Math.PI*2;const fr=new THREE.PlaneGeometry(3.4,.6);fr.rotateX(-Math.PI/2);fr.translate(1.7,0,0);P.push([fr,k%2?0x2f7d3a:0x3c9147,_pm(top.x,top.y,top.z,0,a,-.45-(k%3)*.12)])}
  P.push([new THREE.SphereGeometry(.35,5,3),0x6b4a2e,_pm(top.x,top.y-.2,0)]);return _palm=mergeColored(P)}
function lifeguardGeo(col){const P=[];for(const [x,z] of [[-1,-1],[1,-1],[-1,1],[1,1]])P.push([new THREE.BoxGeometry(.18,2.6,.18),0xe8e2d6,_pm(x*1.1,1.3,z*1.1)]);
  P.push([new THREE.BoxGeometry(3,2,3),col,_pm(0,3.6,0)]);P.push([new THREE.BoxGeometry(3.5,.25,3.5),0xf4f1ea,_pm(0,4.7,0)]);P.push([new THREE.BoxGeometry(2.2,.9,.06),0x2a3a4a,_pm(0,3.8,1.52)]);
  P.push([new THREE.BoxGeometry(1,.12,3.6),0xd8cfbf,_pm(0,1.3,2.9,-.62)]);P.push([new THREE.BoxGeometry(3.4,.12,1.2),0xd8cfbf,_pm(0,2.6,2.1)]);
  P.push([new THREE.CylinderGeometry(.04,.04,1.6,5),0xffffff,_pm(1.3,5.6,-1.3)]);P.push([new THREE.BoxGeometry(.9,.5,.02),0xe63946,_pm(1.75,6.1,-1.3)]);return mergeColored(P)}
function storefrontGeo(R,n){const P=[];const cols=[0xf6c1c7,0xa7d8de,0xf9e08b,0xb8e0a8,0xd9c2f0,0xffb37a,0x9fc5f8,0xf4f1ea];let x=0;
  for(let i=0;i<n;i++){const w=6+R()*5,h=6+R()*6,c=cols[Math.floor(R()*cols.length)];P.push([new THREE.BoxGeometry(w,h,7),c,_pm(x+w/2,h/2,0)]);
    P.push([new THREE.BoxGeometry(w*.8,1.6,.1),0x1d2731,_pm(x+w/2,2,3.56)]);/* vitrine */
    for(let s=0;s<6;s++)P.push([new THREE.BoxGeometry(w*.9/6,.12,1.6),s%2?0xffffff:[0xe63946,0x2a9d8f,0xf4a261,0x457b9d][i%4],_pm(x+w*.05+(s+.5)*w*.9/6,3.3,4.3,.35)]);/* auvent rayé */
    if(R()<.5)P.push([new THREE.BoxGeometry(w*.7,1.2,.08),[0xff3fbf,0x22d3c5,0xffd23a][i%3],_pm(x+w/2,h-1.2,3.56)]);/* enseigne */
    x+=w+.3}return {geo:mergeColored(P),len:x}}
function chaletGeo(){const P=[];P.push([new THREE.BoxGeometry(8,4,6),0xf1ebe0,_pm(0,2,0)]);P.push([new THREE.BoxGeometry(8,3,6.2),0x8a5a36,_pm(0,5.5,0)]);
  const roof=new THREE.CylinderGeometry(.01,5.4,3.2,4,1);roof.rotateY(Math.PI/4);P.push([roof,0x4a3a32,_pm(0,8.6,0,0,0,0,1.15,1,.85)]);
  P.push([new THREE.BoxGeometry(8.6,.25,1.4),0x6b4426,_pm(0,4.1,3.5)]);for(let i=-1;i<=1;i++)P.push([new THREE.BoxGeometry(1.1,1.3,.1),0x2a3540,_pm(i*2.4,2.4,3.02)]);
  for(let i=-1;i<=1;i+=2)P.push([new THREE.BoxGeometry(1.2,.4,.4),0xd94b5a,_pm(i*2.4,1.5,3.2)]);/* géraniums */return mergeColored(P)}
function churchGeo(){const P=[];P.push([new THREE.BoxGeometry(9,7,16),0xf4f1ea,_pm(0,3.5,0)]);const roof=new THREE.CylinderGeometry(.01,7.2,4,4,1);roof.rotateY(Math.PI/4);P.push([roof,0x5a4038,_pm(0,9,0,0,0,0,.9,1,1.6)]);
  P.push([new THREE.BoxGeometry(4,14,4),0xf7f4ee,_pm(0,7,-9)]);const sp=new THREE.ConeGeometry(2.9,11,4);sp.rotateY(Math.PI/4);P.push([sp,0x3d2f2a,_pm(0,19.5,-9)]);
  P.push([new THREE.CylinderGeometry(1,1,.2,12),0x2a2a2a,_pm(0,11.5,-6.9,Math.PI/2)]);return mergeColored(P)}
function fenceGeo(len){const P=[];const n=Math.max(2,Math.round(len/3));for(let i=0;i<=n;i++)P.push([new THREE.CylinderGeometry(.04,.04,1.3,5),0x333333,_pm(-len/2+i*len/n,.65,0)]);
  P.push([new THREE.BoxGeometry(len,1,.03),0xff6a1f,_pm(0,.75,0)]);return mergeColored(P)}
function placeFlagGeo(c){return mergeColored([[new THREE.CylinderGeometry(.05,.05,5,6),0xdddddd,_pm(0,2.5,0)],[new THREE.BoxGeometry(.04,2.6,1),c,_pm(0,3.4,.5)]])}
/* cascade : ruban vertical animé (texture qui défile) + brume au pied */
let _fallTex=null;const FALLS=[];
function fallTex(){if(_fallTex)return _fallTex;_fallTex=canvasTex(64,256,(c,w,h)=>{c.fillStyle='rgba(255,255,255,0)';c.clearRect(0,0,w,h);for(let i=0;i<140;i++){const x=Math.random()*w,y=Math.random()*h,l=10+Math.random()*40;c.strokeStyle=`rgba(255,255,255,${.25+Math.random()*.6})`;c.lineWidth=1+Math.random()*3;c.beginPath();c.moveTo(x,y);c.lineTo(x+(Math.random()-.5)*3,y+l);c.stroke()}});
  _fallTex.wrapS=_fallTex.wrapT=THREE.RepeatWrapping;return _fallTex}
function waterfall(x,yTop,yBot,z,ry,w){const h=Math.max(10,yTop-yBot),t=fallTex().clone();t.needsUpdate=true;t.repeat.set(1,h/40);
  if(!waterfall.geo)waterfall.geo=new THREE.PlaneGeometry(1,1);const m=new THREE.Mesh(waterfall.geo,new THREE.MeshBasicMaterial({map:t,transparent:true,opacity:.85,depthWrite:false,side:THREE.DoubleSide,color:0xeef7ff}));
  m.scale.set(w,h,1);m.position.set(x,yBot+h/2,z);m.rotation.y=ry;m.renderOrder=2;const mist=new THREE.Sprite(new THREE.SpriteMaterial({map:softTex,color:0xffffff,transparent:true,opacity:.55,depthWrite:false}));mist.scale.set(w*4,w*2.4,1);mist.position.set(x,yBot+w*.8,z);
  const g=new THREE.Group();g.add(m);g.add(mist);FALLS.push(t);return g}
function placesTick(dt){for(const t of FALLS)t.offset.y+=dt*.9;if(FALLS.length>40)FALLS.splice(0,FALLS.length-40)}
/* ciel / brouillard propres au lieu (mélangés à la météo choisie) */
const PLACE_TINT={bmx:{top:0x3d6fb3,horizon:0xffc59a,glow:0xffb36b,k:.55},wingsuit:{top:0x3a7bd5,horizon:0xd8ecf7,glow:0xfff6dc,k:.4},snowboard:{top:0x1f63c6,horizon:0xe4f1ff,glow:0xffffff,k:.45}};

/* ---------- Venice Beach Park (BMX) ---------- */
function veniceDecor(root,SZ,seedI,eco){const R=rngAt(seedI,21,5),HS=SZ/2;
  /* sable tout autour, océan à l'ouest (−X) avec ligne d'écume, promenade à l'est */
  const sand=new THREE.Mesh(new THREE.RingGeometry(HS*1.15,420,24,1),detailMaterial(new THREE.MeshLambertMaterial({color:0xe9d7a8}),{amp:.08}));sand.rotation.x=-Math.PI/2;sand.position.y=-.03;root.add(sand);
  const sea=new THREE.Mesh(new THREE.PlaneGeometry(700,1200),new THREE.MeshBasicMaterial({color:0x2b7fae}));sea.rotation.x=-Math.PI/2;sea.position.set(-HS-150-350,.02,0);root.add(sea);
  const surf=new THREE.Mesh(new THREE.PlaneGeometry(14,1200),new THREE.MeshBasicMaterial({color:0xf4fbff,transparent:true,opacity:.7}));surf.rotation.x=-Math.PI/2;surf.position.set(-HS-150+4,.03,0);root.add(surf);
  const walk=new THREE.Mesh(new THREE.PlaneGeometry(10,SZ*3),new THREE.MeshLambertMaterial({color:0x9b948b}));walk.rotation.x=-Math.PI/2;walk.position.set(HS+22,.0,0);root.add(walk);
  /* façades colorées du boardwalk (est) */
  {const sf=storefrontGeo(R,eco?10:18);const m=new THREE.Mesh(sf.geo,VCOL());m.position.set(HS+32,0,-sf.len/2);m.rotation.y=-Math.PI/2;root.add(m)}
  /* palmiers : allées le long de la plage et de la promenade */
  const pl=[];for(let i=0;i<(eco?12:26);i++){const side=i%3,t=(R()-.5)*SZ*2.4;const x=side===0?-HS-25-R()*30:side===1?HS+15+R()*3:(R()-.5)*SZ*1.4,z=side<2?t:(R()<.5?-1:1)*(HS+20+R()*40);
    pl.push([x,0,z,R()*6.3,.9+R()*.5])}instanceAll(palmGeo(),VCOL(),pl,root);
  /* postes de sauveteurs pastel (signature Venice) */
  [[0x9fd3e8,-HS-60,-40],[0xf2a3b9,-HS-62,30],[0xf9e08b,-HS-58,100],[0xb8e0a8,-HS-61,-110]].forEach(([c,x,z])=>{const m=new THREE.Mesh(lifeguardGeo(c),VCOL());m.position.set(x,0,z);m.rotation.y=-Math.PI/2;root.add(m)});
  /* montagnes de Santa Monica au nord, brumeuses */
  {const pts=[];const N=18;for(let i=0;i<=N;i++){const x=-900+i*1800/N,y=30+45*Math.abs(Math.sin(i*.7+seedI))+18*Math.sin(i*1.9);pts.push(new THREE.Vector2(x,y))}
   const sh=new THREE.Shape();sh.moveTo(-900,0);pts.forEach(p=>sh.lineTo(p.x,p.y));sh.lineTo(900,0);const g=new THREE.ShapeGeometry(sh);
   const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:0x8a8fb3,fog:true}));m.position.set(0,0,-820);root.add(m)}
  /* sol du parc : béton clair avec joints de dilatation (texture répétée) */
  const jt=canvasTex(128,128,(c,w,h)=>{c.fillStyle='#a8a196';c.fillRect(0,0,w,h);for(let i=0;i<600;i++){c.fillStyle=`rgba(${80+Math.random()*60|0},${70+Math.random()*50|0},60,${Math.random()*.06})`;c.fillRect(Math.random()*w,Math.random()*h,2+Math.random()*6,2+Math.random()*6)}
    c.fillStyle='rgba(40,36,32,.7)';c.fillRect(0,0,w,3);c.fillRect(0,0,3,h);c.fillStyle='rgba(255,255,255,.15)';c.fillRect(0,2,w,1);c.fillRect(2,0,1,h)},true);
  jt.wrapS=jt.wrapT=THREE.RepeatWrapping;jt.repeat.set((SZ+40)/4,(SZ+40)/4);return {floorMap:jt}}

/* ---------- Lauterbrunnen (wingsuit) : décor par tronçon de vallée ---------- */
let _chalet=null,_church=null;
function lauterbrunnenChunk(V,k,g,R,eco){const CH=160,z0=-k*CH;if(!_chalet){_chalet=chaletGeo();_church=churchGeo()}
  /* cascades depuis le haut des falaises (une ou deux par tronçon, côté alterné) */
  for(let n=0;n<(eco?1:2);n++){const z=z0-CH*(.25+.5*n+R()*.15),side=(k+n)%2?1:-1,w=V.vw(z),c=V.cx(z);const xTop=c+side*(w+30),xBot=c+side*(w+3);
    const yTop=V.groundH(xTop,z),yBot=V.groundH(xBot,z);if(yTop-yBot>40)g.add(waterfall(xBot+side*1.5,yTop,yBot,z,side>0?-Math.PI/2:Math.PI/2,6+R()*5))}
  /* chalets au fond de vallée, contre les falaises (hors de la ligne de vol) */
  const list=[];for(let i=0;i<(eco?2:4);i++){const z=z0-R()*CH,side=R()<.5?-1:1,c=V.cx(z),w=V.vw(z),x=c+side*w*(.78+R()*.15);list.push([x,V.groundH(x,z)-.3,z,R()*6.3,.8+R()*.4])}
  instanceAll(_chalet,VCOL(),list,g);
  if(k%3===1){const z=z0-CH*.6,side=k%2?1:-1,c=V.cx(z),w=V.vw(z),x=c+side*w*.82;const ch=new THREE.Mesh(_church,VCOL());ch.position.set(x,V.groundH(x,z)-.3,z);ch.rotation.y=side>0?Math.PI/2:-Math.PI/2;g.add(ch)}}

/* ---------- Whistler Blackcomb (snowboard) ---------- */
let _fence=null,_flags=null;
function whistlerChunk(V,k,g,R,eco,kicks){const CH=160,z0=-k*CH;if(!_fence){_fence=fenceGeo(12);_flags=[0xff3b30,0x2b8cff,0xffd23a,0x22c55e].map(placeFlagGeo)}
  /* filets orange et drapeaux en bord de piste (repères de vitesse, jamais sur la ligne) */
  const fl=[];for(let i=0;i<(eco?3:6);i++){const z=z0-R()*CH,c=V.cx(z),w=V.vw(z),side=R()<.5?-1:1,x=c+side*(w*.98);fl.push([x,V.groundH(x,z),z,-V.yawAt(z)+Math.PI/2])}
  instanceAll(_fence,VCOL(),fl,g);
  for(let i=0;i<(eco?2:4);i++){const z=z0-R()*CH,c=V.cx(z),w=V.vw(z),side=R()<.5?-1:1,x=c+side*(w*.9);const f=new THREE.Mesh(_flags[i%4],VCOL());f.position.set(x,V.groundH(x,z),z);g.add(f)}
  /* modules de snowpark fournis (décor en bord de piste, côté opposé aux kickers) */
  if(GLB.models.snowpark&&k>=1&&!eco){const gl=GLB.models.snowpark,names=['sp_bonk','sp_aframe','sp_rainbow','sp_kink','sp_srail'].filter(n=>gl.scene.getObjectByName(n));
    for(let i=0;i<2;i++){const nm=names[Math.floor(R()*names.length)];if(!nm)break;const z=z0-CH*(.3+.4*i),c=V.cx(z),w=V.vw(z),side=(k+i)%2?1:-1,x=c+side*(w+5);
      const o=gl.scene.getObjectByName(nm).clone(true);o.traverse(n=>n.userData.shared=true);o.position.set(x,V.groundH(x,z),z);o.rotation.y=-V.yawAt(z);g.add(o)}}}
