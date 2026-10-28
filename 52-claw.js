/* =====================================================================
   SKINS (tenues et casques) + MACHINE À PINCES
   - Les skins sont des cosmétiques : aucun effet sur la physique.
   - On les gagne à la machine à pinces du garage, avec des pièces gagnées en jouant. Aucune monnaie réelle.
   - Transparence : la composition de la machine et le taux de prise par rareté sont affichés ; un compteur de
     garantie offre une peluche épique au plus tard toutes les 10 parties ; un doublon est remboursé en pièces.
   - Rendu : motifs calculés dans le shader à partir de la position du sommet (le modèle n'a pas d'UV),
     finitions brillante, chrome, or, néon et carbone (matcaps générés).
===================================================================== */
const RARITY={c:{n:'Commun',col:'#b9c3cc',grip:.9,refund:40},r:{n:'Rare',col:'#4da3ff',grip:.75,refund:80},e:{n:'Épique',col:'#b26bff',grip:.55,refund:150},l:{n:'Légendaire',col:'#f5c542',grip:.4,refund:300}};
const CLAW_COST=120,CLAW_PITY=10;
/* pat : 0 uni, 1 bandes, 2 camouflage, 3 damier, 4 dégradé, 5 chevrons, 6 aurore animée */
const SKINCAT=[
  {id:'s_asphalte',k:'s',r:'c',name:'Asphalte',c1:0x5b6470,c2:0x5b6470,c3:0x22272e,pat:0},
  {id:'s_lagon',k:'s',r:'c',name:'Lagon',c1:0x19b3b8,c2:0x19b3b8,c3:0x12343a,pat:0},
  {id:'s_brique',k:'s',r:'c',name:'Brique',c1:0xb5472f,c2:0xb5472f,c3:0x2b1f1c,pat:0},
  {id:'h_nuit',k:'h',r:'c',name:'Nuit',c1:0x1b1f27,fin:'gloss'},
  {id:'h_menthe',k:'h',r:'c',name:'Menthe',c1:0x9fe8c8,fin:'gloss'},
  {id:'h_sable',k:'h',r:'c',name:'Sable',c1:0xe2c79a,fin:'mat'},
  {id:'s_rally',k:'s',r:'r',name:'Bandes Rally',c1:0xf4f4f0,c2:0x1d4ed8,c3:0x0f172a,pat:1},
  {id:'s_camo',k:'s',r:'r',name:'Camo Urbain',c1:0x4b5a3a,c2:0x2f3a26,c3:0x8a8f6a,pants:0x232a1d,pat:2},
  {id:'h_damier',k:'h',r:'r',name:'Damier',c1:0x111111,c2:0xf5f5f5,pat:3,fin:'gloss',sc:1},
  {id:'h_couchant',k:'h',r:'r',name:'Coucher de soleil',c1:0xff7a2f,c2:0x7a2cff,pat:4,fin:'gloss'},
  {id:'s_neon',k:'s',r:'e',name:'Néon Tokyo',c1:0x0d0d14,c2:0x39ff9c,c3:0x0b0b10,pat:5,glow:.55},
  {id:'h_chrome',k:'h',r:'e',name:'Chrome miroir',c1:0xdfe7ef,fin:'chrome'},
  {id:'h_carbone',k:'h',r:'e',name:'Carbone rouge',c1:0x1a1a1a,c2:0x2c2c2c,pat:3,fin:'gloss',sc:3.2,stripe:0xe11d2a},
  {id:'h_or',k:'h',r:'l',name:'Or massif',c1:0xffd36b,fin:'gold'},
  {id:'s_aurore',k:'s',r:'l',name:'Aurore boréale',c1:0x00e5ff,c2:0xff3df2,c3:0x0b1020,pat:6,glow:.5},
];
const skinById=id=>SKINCAT.find(s=>s.id===id);
function skinState(){if(!profile.skins||typeof profile.skins!=='object')profile.skins={owned:[],pity:0,plays:0,wins:0};const S_=profile.skins;
  if(!Array.isArray(S_.owned))S_.owned=[];S_.owned=S_.owned.filter(id=>skinById(id));S_.pity|=0;S_.plays|=0;S_.wins|=0;
  if(!profile.look.sk||typeof profile.look.sk!=='object')profile.look.sk={s:'',h:''};const k=profile.look.sk;if(!S_.owned.includes(k.s))k.s='';if(!S_.owned.includes(k.h))k.h='';return S_}

/* ---------- rendu des skins ---------- */
const SKIN_T={value:0};let skinTicking=false;
function skinTick(){SKIN_T.value=performance.now()/1000;requestAnimationFrame(skinTick)}
function matcapTex(kind){return canvasTex(128,128,(c,w,h)=>{const g=c.createRadialGradient(w*.38,h*.32,4,w*.5,h*.5,w*.55);
  if(kind==='gold'){g.addColorStop(0,'#fff6d6');g.addColorStop(.35,'#f2c14e');g.addColorStop(.7,'#9a6a12');g.addColorStop(1,'#3a2604')}
  else{g.addColorStop(0,'#ffffff');g.addColorStop(.3,'#c9d3dc');g.addColorStop(.55,'#5b6773');g.addColorStop(.75,'#e6edf3');g.addColorStop(1,'#26303a')}
  c.fillStyle=g;c.fillRect(0,0,w,h)})}
const MATCAP={};
function patternize(m,sk,useStripe){if(!sk.pat&&!sk.glow&&!useStripe)return m;
  const U={uC2:{value:new THREE.Color(sk.c2??sk.c1)},uC3:{value:new THREE.Color(sk.c3??sk.c1)},uPat:{value:sk.pat||0},uSc:{value:sk.sc||1},uGlow:{value:sk.glow||0},uT:SKIN_T,uStripe:{value:new THREE.Color(sk.stripe||0)},uHasStripe:{value:sk.stripe?1:0}};
  if(sk.pat===6&&!skinTicking){skinTicking=true;skinTick()}
  m.onBeforeCompile=sh=>{Object.assign(sh.uniforms,U);
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vSkP;').replace('#include <begin_vertex>','#include <begin_vertex>\nvSkP=position;');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vSkP;uniform vec3 uC2,uC3,uStripe;uniform float uPat,uSc,uGlow,uT,uHasStripe;')
      .replace('vec4 diffuseColor = vec4( diffuse, opacity );',`vec3 p_=vSkP*uSc;float t_=0.;vec3 c_=diffuse;
        if(uPat>.5&&uPat<1.5){t_=step(.5,fract(p_.y*7.));c_=mix(diffuse,uC2,t_);}
        else if(uPat<2.5&&uPat>1.5){float n=sin(p_.x*9.+sin(p_.y*7.)*1.7)*sin(p_.y*8.+sin(p_.z*10.)*1.5)+.5*sin(p_.z*13.+p_.x*5.);c_=n>.35?uC3:(n>-.2?uC2:diffuse);}
        else if(uPat<3.5&&uPat>2.5){t_=mod(floor(p_.x*14.)+floor(p_.y*14.)+floor(p_.z*14.),2.);c_=mix(diffuse,uC2,t_);}
        else if(uPat<4.5&&uPat>3.5){t_=clamp((p_.y-1.74)/.26,0.,1.);c_=mix(diffuse,uC2,t_);}
        else if(uPat<5.5&&uPat>4.5){t_=step(.55,fract(p_.y*5.+abs(p_.z)*6.));c_=mix(diffuse,uC2,t_);}
        else if(uPat>5.5){t_=.5+.5*sin(p_.y*6.+uT*1.4+p_.x*3.);c_=mix(diffuse,uC2,t_);}
        if(uHasStripe>.5&&abs(vSkP.z)<.022&&vSkP.y>1.88)c_=uStripe;
        vec4 diffuseColor=vec4(c_,opacity);`)
      .replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\ntotalEmissiveRadiance+=diffuseColor.rgb*uGlow*(uPat>5.5?.8+.4*sin(uT*2.):1.)*step(.5,max(t_,uPat>5.5?1.:0.));')};
  m.customProgramCacheKey=()=>'sk'+sk.id;return m}
/* appelé par riderMaterial (18-glb.js) : renvoie un matériau de skin pour la pièce, ou null */
function skinMat(nm,L){const k=L&&L.sk;if(!k)return null;
  if((nm==='accent'||nm==='suit')&&k.s){const sk=skinById(k.s);if(!sk)return null;
    if(nm==='suit')return new THREE.MeshLambertMaterial({color:sk.pants??sk.c3??sk.c1,skinning:true});
    return patternize(new THREE.MeshPhongMaterial({color:sk.c1,shininess:sk.glow?60:18,specular:0x222222,skinning:true}),sk)}
  if(nm==='helmet'&&k.h){const sk=skinById(k.h);if(!sk)return null;
    if(sk.fin==='chrome'||sk.fin==='gold'){MATCAP[sk.fin]=MATCAP[sk.fin]||matcapTex(sk.fin);return patternize(new THREE.MeshMatcapMaterial({color:sk.fin==='gold'?0xffffff:sk.c1,matcap:MATCAP[sk.fin],skinning:true}),sk)}
    return patternize(new THREE.MeshPhongMaterial({color:sk.c1,shininess:sk.fin==='mat'?8:sk.fin==='gloss'?90:50,specular:sk.fin==='mat'?0x111111:0x888888,skinning:true}),sk,!!sk.stripe)}
  return null}
/* modèle procédural (repli) : on applique au moins les couleurs */
function skinLookColors(L){const k=L.sk||{},o={};const s=skinById(k.s),h=skinById(k.h);if(s){o.accent=s.c1;o.suit=s.pants??s.c3??s.c1}if(h)o.helmet=h.c1;return Object.assign({},L,o)}

/* ---------- machine à pinces ---------- */
const CL={g:null,st:'idle',x:-.34,z:.29,drop:0,open:0,toys:[],held:null,t:0,msg:'',last:null,btn:{},timer:0};
function clawBuild(){const gl=GLB.models.claw;if(!gl)return null;skinState();
  const root=new THREE.Group();const m=gl.scene.getObjectByName('claw_machine').clone(true);root.add(m);
  const play=m.userData.play||{x0:-.46,x1:.46,z0:-.39,z1:.37,floor:1.161},chute=m.userData.chute||[-.34,1.161,.29];
  const bar=gl.scene.getObjectByName('claw_bar').clone(true);root.add(bar);
  const car=bar.getObjectByName('claw_carriage'),head=bar.getObjectByName('claw_head'),fing=[0,1,2].map(i=>bar.getObjectByName('claw_finger'+i));
  root.traverse(n=>{if(n.isMesh){n.material=n.material.clone();if(n.material.transparent||/glass/i.test(n.material.name)){n.material.transparent=true;n.material.opacity=Math.min(n.material.opacity,.25);n.material.depthWrite=false}}});
  root.updateMatrixWorld(true);const hw=head.getWorldPosition(new THREE.Vector3());
  /* câble entre chariot et tête */
  const cable=new THREE.Mesh(new THREE.CylinderGeometry(.006,.006,1,6),new THREE.MeshLambertMaterial({color:0x333333}));root.add(cable);
  CL.g={root,m,bar,car,head,fing,cable,play,chute:new THREE.Vector3(chute[0],chute[1],chute[2]),bar0:bar.position.clone(),car0:car.position.clone(),head0:head.position.clone(),hw0:hw.clone(),fq:fing.map(f=>f.quaternion.clone())};
  CL.x=CL.g.chute.x;CL.z=CL.g.chute.z;CL.st='idle';CL.held=null;CL.drop=0;CL.open=0;clawRefill(false);clawPose();return root}
function clawRefill(guarantee){const G=CL.g;for(const t of CL.toys)G.root.remove(t.o);CL.toys=[];const gl=GLB.models.claw;
  const names=[];gl.scene.traverse(n=>{if(/^toy_/.test(n.name)&&n.parent===gl.scene)names.push(n.name)});
  const rar=['c','c','c','c','c','r','r','e'];if(Math.random()<.25)rar[0]='l';if(guarantee&&!rar.includes('e')&&!rar.includes('l'))rar[1]='e';
  for(let i=rar.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[rar[i],rar[j]]=[rar[j],rar[i]]}
  const cells=[];for(const x of [-.28,0,.28])for(const z of [-.25,0,.25])if(!(x<-.1&&z>.1))cells.push([x,z]);
  cells.forEach(([x,z],i)=>{const nm=names[Math.floor(Math.random()*names.length)];const o=gl.scene.getObjectByName(nm).clone(true);o.traverse(n=>{if(n.isMesh)n.material=n.material.clone()});
    const r=rar[i],ring=new THREE.Mesh(new THREE.TorusGeometry(.14,.016,6,28),new THREE.MeshBasicMaterial({color:RARITY[r].col}));ring.rotation.x=Math.PI/2;ring.position.y=.01;o.add(ring);
    if(r!=='c'){const gem=new THREE.Mesh(new THREE.OctahedronGeometry(r==='l'?.045:.035),new THREE.MeshBasicMaterial({color:RARITY[r].col}));gem.position.y=(gl.scene.getObjectByName(nm).userData.h||.28)+.08;o.add(gem);o.userData.gem=gem}
    o.position.set(x+(Math.random()-.5)*.05,G.play.floor,z+(Math.random()-.5)*.05);o.rotation.y=(Math.random()-.5)*1.2+(z>0?0:Math.PI*0);G.root.add(o);
    const h=(gl.scene.getObjectByName(nm).userData.h)||.28;CL.toys.push({o,r,h,ring,vy:0,gone:false})})}
function clawPose(){const G=CL.g;if(!G)return;
  G.bar.position.z=G.bar0.z+(CL.z-G.hw0.z);G.car.position.x=G.car0.x+(CL.x-G.hw0.x);G.head.position.y=G.head0.y-CL.drop;
  const ax=new THREE.Vector3(1,0,0);G.fing.forEach((f,i)=>{f.quaternion.copy(G.fq[i]).multiply(new THREE.Quaternion().setFromAxisAngle(ax,-.55*CL.open))});
  G.root.updateMatrixWorld(true);const a=G.car.getWorldPosition(new THREE.Vector3()),b=G.head.getWorldPosition(new THREE.Vector3());
  G.cable.position.copy(a).add(b).multiplyScalar(.5);G.cable.scale.y=Math.max(.01,a.y-b.y);G.cable.position.x=b.x;G.cable.position.z=b.z}
function clawBelow(){let best=null,bd=9;for(const t of CL.toys){if(t.gone)continue;const d=Math.hypot(t.o.position.x-CL.x,t.o.position.z-CL.z);if(d<bd){bd=d;best=t}}return {t:best,d:bd}}
function clawPlay(){const S_=skinState();if(CL.st!=='idle'||!CL.g)return false;if(profile.coins<CLAW_COST){toast('Il faut '+CLAW_COST+' pièces',true);return false}
  profile.coins-=CLAW_COST;S_.plays++;saveProfile();CL.st='move';CL.timer=15;CL.msg='';CL.last=null;if(sfx.coin)sfx.coin();paintClawPanel();return true}
function clawRelease(){if(CL.st==='move'){CL.st='down';paintClawPanel()}}
function clawFrame(dt){const G=CL.g;if(!G)return;CL.t+=dt;const P=G.play,sp=.42*dt;
  for(const t of CL.toys){if(t.ring)t.ring.rotation.z+=dt*(t.r==='l'?2.5:.6);const gm=t.o.userData.gem;if(gm){gm.rotation.y+=dt*2;gm.position.y+=Math.sin(CL.t*3+t.o.position.x*9)*.0006;gm.visible=!t.gone&&CL.held!==t}}
  if(CL.st==='move'){const k=keys,b=CL.btn;const dx=((k.ArrowRight||k.KeyD||b.r)?1:0)-((k.ArrowLeft||k.KeyA||b.l)?1:0),dz=((k.ArrowDown||k.KeyS||b.d)?1:0)-((k.ArrowUp||k.KeyW||b.u)?1:0);
    CL.x=clamp(CL.x+dx*sp,P.x0+.04,P.x1-.04);CL.z=clamp(CL.z+dz*sp,P.z0+.04,P.z1-.04);CL.timer-=dt;CL.open=Math.min(1,CL.open+dt*2);
    if(k.Space||k.Enter||CL.timer<=0){CL.st='down'}const el=$('#clawTimer');if(el)el.textContent=Math.max(0,Math.ceil(CL.timer))+' s'}
  else if(CL.st==='down'){const {t,d}=clawBelow();const stop=t&&d<.16?t.h*.85:0.03;const maxDrop=G.hw0.y-(P.floor+stop+.11);CL.drop=Math.min(maxDrop,CL.drop+dt*.55);if(CL.drop>=maxDrop){CL.st='close';CL.tc=0}}
  else if(CL.st==='close'){CL.tc+=dt;CL.open=Math.max(0,1-CL.tc*2.2);if(CL.tc>.55){const {t,d}=clawBelow();
      /* prise : centrage (distance au centre de la peluche) × adhérence de la rareté */
      const p=t?clamp(1-d/.15,0,1)*RARITY[t.r].grip:0;CL.lastP=p;if(t&&Math.random()<p){CL.held=t;t.off=new THREE.Vector3(t.o.position.x-CL.x,0,t.o.position.z-CL.z)}else CL.held=null;
      CL.st='up';if(!CL.held)CL.msg=t&&d<.15?'Raté de peu… la peluche a glissé.':'Raté : vise le centre d\'une peluche.'}}
  else if(CL.st==='up'){CL.drop=Math.max(0,CL.drop-dt*.5);if(CL.drop<=0)CL.st='carry'}
  else if(CL.st==='carry'){const tx=G.chute.x,tz=G.chute.z,dx=tx-CL.x,dz=tz-CL.z,dd=Math.hypot(dx,dz),s=Math.min(dd,dt*.35);if(dd>1e-3){CL.x+=dx/dd*s;CL.z+=dz/dd*s}
    /* une peluche légendaire peut encore glisser pendant le transport */
    if(CL.held&&CL.held.r==='l'&&!CL.slipTested&&dd<.25){CL.slipTested=true;if(Math.random()<.2){const t=CL.held;CL.held=null;t.vy=0;t.falling=true;CL.msg='Elle a glissé au dernier moment !'}}
    if(dd<.005){CL.st='drop';CL.tc=0}}
  else if(CL.st==='drop'){CL.tc+=dt;CL.open=Math.min(1,CL.tc*2.5);if(CL.held&&CL.tc>.25){const t=CL.held;CL.held=null;t.falling=true;t.vy=0;t.toChute=true}
    if(CL.tc>1.3){CL.st='idle';CL.slipTested=false;clawEnd()}}
  if(CL.held){const t=CL.held;const hw=G.head.getWorldPosition(new THREE.Vector3());t.o.position.set(CL.x+t.off.x*.4,hw.y-.16-t.h,CL.z+t.off.z*.4)}
  for(const t of CL.toys){if(!t.falling)continue;t.vy-=9.8*dt;t.o.position.y+=t.vy*dt;const fl=t.toChute?.55:P.floor;if(t.o.position.y<=fl){t.o.position.y=fl;t.falling=false;if(t.toChute){t.gone=true;t.o.visible=false;CL.won=t}}}
  clawPose()}
function clawEnd(){const S_=skinState();const t=CL.won;CL.won=null;
  if(t){const pool=SKINCAT.filter(s=>s.r===t.r),fresh=pool.filter(s=>!S_.owned.includes(s.id));S_.wins++;
    if(t.r==='e'||t.r==='l')S_.pity=0;else S_.pity++;
    if(fresh.length){const sk=fresh[Math.floor(Math.random()*fresh.length)];S_.owned.push(sk.id);CL.last={sk,dup:false};toast(RARITY[t.r].n+' : '+sk.name+' !',true);ding(t.r==='l'?1320:t.r==='e'?1175:988,.25)}
    else{const c=RARITY[t.r].refund;profile.coins+=c;CL.last={dup:true,r:t.r,c};toast('Doublon '+RARITY[t.r].n.toLowerCase()+' : +'+c+' pièces',true)}
    G_refillIfLow()}
  else{S_.pity++;CL.last=null}
  if(S_.pity>=CLAW_PITY){clawRefill(true);S_.pity=0;CL.msg='Garantie : la machine contient une peluche épique.'}
  saveProfile();paintClawPanel()}
function G_refillIfLow(){if(CL.toys.filter(t=>!t.gone).length<=3)clawRefill(false)}

/* ---------- panneaux du garage ---------- */
function rarityOdds(){/* composition moyenne d'un remplissage de 8 peluches (voir clawRefill) */return {c:(5-.25)/8,r:2/8,e:1/8,l:.25/8}}
function paintClawPanel(){const el=$('#garageBody');if(!el||gTab!=='claw')return;const S_=skinState(),o=rarityOdds();
  const res=CL.last?(CL.last.dup?`<div class="clawres" style="border-color:${RARITY[CL.last.r].col}">Doublon ${RARITY[CL.last.r].n.toLowerCase()} · +${CL.last.c} pièces</div>`:
    `<div class="clawres" style="border-color:${RARITY[CL.last.sk.r].col}"><b style="color:${RARITY[CL.last.sk.r].col}">${RARITY[CL.last.sk.r].n}</b> · ${CL.last.sk.name} <button class="btn small primary" id="clawEquip">Équiper</button></div>`):(CL.msg?`<p class="note">${CL.msg}</p>`:'');
  el.innerHTML=`<div class="row" style="justify-content:space-between"><span class="lbl">Tes pièces <b>${fmt(profile.coins)}</b></span><span class="note">Une partie : ${CLAW_COST} pièces</span></div>
    ${CL.st==='idle'?`<button class="btn primary" id="clawPlay" ${profile.coins>=CLAW_COST?'':'disabled'}>Jouer · ${CLAW_COST} pièces</button>`:`<div class="row"><span class="lbl">Temps <b id="clawTimer">${Math.ceil(CL.timer)} s</b></span></div>`}
    <div class="clawpad" ${CL.st==='move'?'':'aria-disabled="true"'}><button class="btn" data-m="l" aria-label="Gauche">◀</button><button class="btn" data-m="u" aria-label="Fond">▲</button><button class="btn" data-m="d" aria-label="Avant">▼</button><button class="btn" data-m="r" aria-label="Droite">▶</button><button class="btn primary" id="clawDrop">Lâcher</button></div>
    <p class="note">Clavier : flèches pour viser, Espace pour lâcher la pince. Vise le centre de la peluche : plus tu es centré, plus la prise tient.</p>
    ${res}
    <div class="grp"><span class="lbl">Probabilités <b>affichées, sans monnaie réelle</b></span>
      <table class="odds"><tr><th>Rareté</th><th>Part des peluches</th><th>Prise si bien centré</th><th>Doublon</th></tr>
      ${Object.entries(RARITY).map(([k,v])=>`<tr><td style="color:${v.col}">${v.n}</td><td>${(o[k]*100).toFixed(1)} %</td><td>${Math.round(v.grip*100)} %</td><td>+${v.refund} pièces</td></tr>`).join('')}</table>
      <p class="note">Garantie : au plus tard après ${CLAW_PITY} parties sans peluche épique ou légendaire, la machine en contient une (compteur : ${S_.pity}/${CLAW_PITY}). Les pièces se gagnent en jouant aux 7 sports.</p></div>
    <div class="grp"><span class="lbl">Collection <b>${S_.owned.length}/${SKINCAT.length}</b></span><button class="btn small" id="clawToSkins">Voir mes skins</button></div>`;
  const pb=$('#clawPlay');if(pb)pb.onclick=()=>clawPlay();const db=$('#clawDrop');if(db)db.onclick=()=>clawRelease();
  $$('#garageBody .clawpad [data-m]').forEach(b=>{const m=b.dataset.m;const on=e=>{e.preventDefault();CL.btn[m]=true},off=()=>{CL.btn[m]=false};b.onpointerdown=on;b.onpointerup=off;b.onpointerleave=off;b.onpointercancel=off});
  const eq=$('#clawEquip');if(eq)eq.onclick=()=>{const sk=CL.last.sk;profile.look.sk[sk.k]=sk.id;saveProfile();toast(sk.name+' équipé',true);eq.disabled=true};
  const ts=$('#clawToSkins');if(ts)ts.onclick=()=>{gTab='skins';paintGarage()}}
function skinsPanelHtml(){const S_=skinState(),L=profile.look;const by=k=>SKINCAT.filter(s=>s.k===k);
  const card=s=>{const own=S_.owned.includes(s.id),on=L.sk[s.k]===s.id,R=RARITY[s.r];
    const sw=`<span class="skinsw" style="background:linear-gradient(135deg,${hexCss(s.c1)} 0 55%,${hexCss(s.c2??s.c1)} 55% 100%)"></span>`;
    return `<button class="item skin" data-sk="${s.id}" aria-pressed="${on}" ${own?'':'disabled'} style="border-left:3px solid ${R.col}"><h4>${sw}${own?s.name:'???'}</h4><span class="tagr" style="color:${R.col}">${R.n}${on?' · équipé':own?'':' · à gagner'}</span></button>`};
  return `<div class="row" style="justify-content:space-between"><span class="lbl">Collection <b>${S_.owned.length}/${SKINCAT.length}</b></span><button class="btn small primary" id="toClaw">Machine à pinces</button></div>
    <p class="note">Les skins sont purement cosmétiques. Ils s'appliquent au rider de tous les sports. Tant qu'aucun skin n'est équipé, tes couleurs de l'onglet Teintes s'appliquent.</p>
    <div class="grp"><span class="lbl">Tenues</span><div class="items">${by('s').map(card).join('')}</div><button class="btn small" data-unsk="s">Retirer la tenue</button></div>
    <div class="grp"><span class="lbl">Casques</span><div class="items">${by('h').map(card).join('')}</div><button class="btn small" data-unsk="h">Retirer le casque</button></div>`}
function bindSkinsPanel(){const L=profile.look;$$('#garageBody .item.skin').forEach(b=>b.onclick=()=>{const s=skinById(b.dataset.sk);if(!s)return;L.sk[s.k]=L.sk[s.k]===s.id?'':s.id;saveProfile();paintGarage()});
  $$('#garageBody [data-unsk]').forEach(b=>b.onclick=()=>{L.sk[b.dataset.unsk]='';saveProfile();paintGarage()});const c=$('#toClaw');if(c)c.onclick=()=>{gTab='claw';paintGarage()}}
