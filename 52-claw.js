/* =====================================================================
   SKINS, RÉCOMPENSES ET MACHINES À PINCES
   - Raretés communes à tout le jeu : Commun, Peu commun, Rare, Épique, Légendaire.
   - Deux façons de tenter sa chance, toutes deux payées en pièces gagnées en jouant (aucune monnaie réelle) :
       Boutique « Machine à skins » : tirage animé automatique (paiement → grappin → capture → révélation),
                                     chances affichées par rareté ;
       Garage « Machine »          : mini-jeu d'adresse, on pilote la pince soi-même.
   - Récompenses : skins (tenues, casques) + objets non consommables de la boutique (cosmétiques, équipements),
     en priorité ceux qu'on n'a pas. Doublon : 40 % du prix remboursés, affiché à l'écran.
   - Tout est enregistré tout de suite dans profile.owned et profile.coins.
===================================================================== */
const RARITY={
  c:{n:'Commun',col:'#b9c3cc',p:.50,grip:.9},
  u:{n:'Peu commun',col:'#3ddc84',p:.28,grip:.82},
  r:{n:'Rare',col:'#4da3ff',p:.14,grip:.72},
  e:{n:'Épique',col:'#b26bff',p:.06,grip:.55},
  l:{n:'Légendaire',col:'#f5c542',p:.02,grip:.4}};
const RAR_KEYS=['c','u','r','e','l'];
const CLAW_COST=150,CLAW_REFUND=Math.round(CLAW_COST*.4),CLAW_PITY=10;
/* pat : 0 uni, 1 bandes, 2 camouflage, 3 damier, 4 dégradé, 5 chevrons, 6 aurore animée */
const SKINCAT=[
  {id:'s_asphalte',k:'s',r:'c',name:'Asphalte',c1:0x5b6470,c2:0x5b6470,c3:0x22272e,pat:0,desc:'Tenue gris bitume, pantalon anthracite.'},
  {id:'s_lagon',k:'s',r:'c',name:'Lagon',c1:0x19b3b8,c2:0x19b3b8,c3:0x12343a,pat:0,desc:'Tenue turquoise, pantalon bleu nuit.'},
  {id:'h_nuit',k:'h',r:'c',name:'Nuit',c1:0x1b1f27,fin:'gloss',desc:'Casque noir brillant.'},
  {id:'h_sable',k:'h',r:'c',name:'Sable',c1:0xe2c79a,fin:'mat',desc:'Casque beige mat.'},
  {id:'s_brique',k:'s',r:'u',name:'Brique',c1:0xb5472f,c2:0xb5472f,c3:0x2b1f1c,pat:0,desc:'Tenue rouge brique.'},
  {id:'h_menthe',k:'h',r:'u',name:'Menthe',c1:0x9fe8c8,fin:'gloss',desc:'Casque vert d\'eau brillant.'},
  {id:'h_damier',k:'h',r:'u',name:'Damier',c1:0x111111,c2:0xf5f5f5,pat:3,fin:'gloss',sc:1,desc:'Casque à damier noir et blanc.'},
  {id:'s_rally',k:'s',r:'r',name:'Bandes Rally',c1:0xf4f4f0,c2:0x1d4ed8,c3:0x0f172a,pat:1,desc:'Tenue blanche à bandes bleues.'},
  {id:'s_camo',k:'s',r:'r',name:'Camo Urbain',c1:0x4b5a3a,c2:0x2f3a26,c3:0x8a8f6a,pants:0x232a1d,pat:2,desc:'Camouflage trois tons.'},
  {id:'h_couchant',k:'h',r:'r',name:'Coucher de soleil',c1:0xff7a2f,c2:0x7a2cff,pat:4,fin:'gloss',desc:'Dégradé orange vers violet.'},
  {id:'s_neon',k:'s',r:'e',name:'Néon Tokyo',c1:0x0d0d14,c2:0x39ff9c,c3:0x0b0b10,pat:5,glow:.55,desc:'Chevrons lumineux sur fond noir.'},
  {id:'h_chrome',k:'h',r:'e',name:'Chrome miroir',c1:0xdfe7ef,fin:'chrome',desc:'Coque chromée réfléchissante.'},
  {id:'h_carbone',k:'h',r:'e',name:'Carbone rouge',c1:0x1a1a1a,c2:0x2c2c2c,pat:3,fin:'gloss',sc:3.2,stripe:0xe11d2a,desc:'Tissage carbone et bande rouge.'},
  {id:'h_or',k:'h',r:'l',name:'Or massif',c1:0xffd36b,fin:'gold',desc:'Casque plaqué or.'},
  {id:'s_aurore',k:'s',r:'l',name:'Aurore boréale',c1:0x00e5ff,c2:0xff3df2,c3:0x0b1020,pat:6,glow:.5,desc:'Tenue animée aux couleurs d\'une aurore.'},
];
const skinById=id=>SKINCAT.find(s=>s.id===id);
/* objets de la boutique gagnables : rareté selon le prix (consommables exclus) */
const shopRarity=it=>it.price>=2000?'l':it.price>=1150?'e':it.price>=650?'r':'u';
function rewardPool(){return SKINCAT.map(s=>({id:s.id,r:s.r,name:s.name,kind:s.k==='s'?'Tenue':'Casque',desc:s.desc,skin:s}))
  .concat(SHOP.filter(it=>!it.cons).map(it=>({id:it.id,r:shopRarity(it),name:it.name,kind:it.kind,desc:it.effect,shop:it})))}
const isOwned=id=>skinById(id)?!!profile.owned[id]:owns(id);
function skinState(){if(!profile.owned||typeof profile.owned!=='object')profile.owned={};
  if(!profile.skins||typeof profile.skins!=='object')profile.skins={pity:0,plays:0,wins:0};const S_=profile.skins;
  /* migration 0.20 : les skins possédés vivaient dans profile.skins.owned ; ils passent dans profile.owned */
  if(Array.isArray(S_.owned)){for(const id of S_.owned)if(skinById(id))profile.owned[id]=true;delete S_.owned}
  S_.pity|=0;S_.plays|=0;S_.wins|=0;S_.draws|=0;
  if(!profile.look.sk||typeof profile.look.sk!=='object')profile.look.sk={s:'',h:''};const k=profile.look.sk;if(k.s&&!profile.owned[k.s])k.s='';if(k.h&&!profile.owned[k.h])k.h='';
  S_.list=SKINCAT.filter(s=>profile.owned[s.id]).map(s=>s.id);return S_}
/* tirage de rareté (chances affichées) ; garantie : au moins Épique après CLAW_PITY tirages sans Épique ni Légendaire */
function rollRarity(){const S_=skinState();if(S_.pity>=CLAW_PITY-1)return Math.random()<RARITY.l.p/(RARITY.l.p+RARITY.e.p)?'l':'e';
  let x=Math.random();for(const k of RAR_KEYS){x-=RARITY[k].p;if(x<0)return k}return 'c'}
/* donne un objet de la rareté r (non possédé en priorité) ; renvoie {item, dup, refund} ; sauvegarde immédiate */
function grantReward(r){const S_=skinState();const pool=rewardPool().filter(x=>x.r===r);const fresh=pool.filter(x=>!isOwned(x.id));
  if(r==='e'||r==='l')S_.pity=0;else S_.pity++;S_.wins++;
  let res;if(fresh.length){const it=fresh[Math.floor(Math.random()*fresh.length)];profile.owned[it.id]=true;res={item:it,dup:false,refund:0}}
  else{const it=pool[Math.floor(Math.random()*pool.length)];profile.coins+=CLAW_REFUND;res={item:it,dup:true,refund:CLAW_REFUND}}
  saveProfile();return res}
function equipReward(it){if(it.skin){profile.look.sk[it.skin.k]=it.id}else if(it.shop&&it.shop.slot){profile.look.gear[it.shop.slot]=it.id}saveProfile()}
function rewardFanfare(r){if(r==='l'){if(!sfx.trick(6))ding(1320,.4);setTimeout(()=>ding(1760,.35),120);setTimeout(()=>ding(2093,.5),260)}
  else if(r==='e'){if(!sfx.trick(4))ding(1175,.3);setTimeout(()=>ding(1568,.35),140)}else ding(r==='r'?1047:r==='u'?880:784,.22)}

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


/* ---------- machine à pinces (3D, modèle fourni) : une seule logique pour le mini-jeu et le tirage animé ---------- */
const CL={g:null,st:'idle',mode:'skill',x:-.34,z:.29,drop:0,open:0,toys:[],held:null,t:0,msg:'',last:null,btn:{},timer:0,sp:1};
function clawBuild(){const gl=GLB.models.claw;if(!gl)return null;skinState();
  const root=new THREE.Group();const m=gl.scene.getObjectByName('claw_machine').clone(true);root.add(m);
  const play=m.userData.play||{x0:-.46,x1:.46,z0:-.39,z1:.37,floor:1.161},chute=m.userData.chute||[-.34,1.161,.29];
  const bar=gl.scene.getObjectByName('claw_bar').clone(true);root.add(bar);
  const car=bar.getObjectByName('claw_carriage'),head=bar.getObjectByName('claw_head'),fing=[0,1,2].map(i=>bar.getObjectByName('claw_finger'+i));
  root.traverse(n=>{if(n.isMesh){n.material=n.material.clone();if(n.material.transparent||/glass/i.test(n.material.name)){n.material.transparent=true;n.material.opacity=Math.min(n.material.opacity,.25);n.material.depthWrite=false}}});
  root.updateMatrixWorld(true);const hw=head.getWorldPosition(new THREE.Vector3());
  const cable=new THREE.Mesh(new THREE.CylinderGeometry(.006,.006,1,6),new THREE.MeshLambertMaterial({color:0x333333}));root.add(cable);
  CL.g={root,m,bar,car,head,fing,cable,play,chute:new THREE.Vector3(chute[0],chute[1],chute[2]),bar0:bar.position.clone(),car0:car.position.clone(),head0:head.position.clone(),hw0:hw.clone(),fq:fing.map(f=>f.quaternion.clone())};
  CL.x=CL.g.chute.x;CL.z=CL.g.chute.z;CL.st='idle';CL.held=null;CL.drop=0;CL.open=0;clawRefill();clawPose();return root}
function toyMarker(t){const o=t.o;if(t.ring){o.remove(t.ring);t.ring.geometry.dispose()}if(o.userData.gem){o.remove(o.userData.gem);o.userData.gem.geometry.dispose();o.userData.gem=null}
  const R=RARITY[t.r];t.ring=new THREE.Mesh(new THREE.TorusGeometry(.14,.016,6,28),new THREE.MeshBasicMaterial({color:R.col}));t.ring.rotation.x=Math.PI/2;t.ring.position.y=.01;o.add(t.ring);
  if(t.r!=='c'){const gem=new THREE.Mesh(new THREE.OctahedronGeometry(t.r==='l'?.05:.035),new THREE.MeshBasicMaterial({color:R.col}));gem.position.y=t.h+.08;o.add(gem);o.userData.gem=gem}}
function clawRefill(){const G=CL.g;for(const t of CL.toys)G.root.remove(t.o);CL.toys=[];const gl=GLB.models.claw;
  const names=[];gl.scene.traverse(n=>{if(/^toy_/.test(n.name)&&n.parent===gl.scene)names.push(n.name)});
  /* 8 peluches : 3 communes, 2 peu communes, 1 rare, et 2 tirées avec les chances affichées */
  const rar=['c','c','c','u','u','r',rollRarityPlain(),rollRarityPlain()];
  for(let i=rar.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[rar[i],rar[j]]=[rar[j],rar[i]]}
  const cells=[];for(const x of [-.28,0,.28])for(const z of [-.25,0,.25])if(!(x<-.1&&z>.1))cells.push([x,z]);
  cells.forEach(([x,z],i)=>{const nm=names[Math.floor(Math.random()*names.length)];const o=gl.scene.getObjectByName(nm).clone(true);o.traverse(n=>{if(n.isMesh)n.material=n.material.clone()});
    const t={o,r:rar[i],h:(gl.scene.getObjectByName(nm).userData.h)||.28,vy:0,gone:false};toyMarker(t);
    o.position.set(x+(Math.random()-.5)*.05,G.play.floor,z+(Math.random()-.5)*.05);o.rotation.y=(Math.random()-.5)*1.2;G.root.add(o);CL.toys.push(t)})}
function rollRarityPlain(){let x=Math.random();for(const k of RAR_KEYS){x-=RARITY[k].p;if(x<0)return k}return 'c'}
function clawPose(){const G=CL.g;if(!G)return;
  G.bar.position.z=G.bar0.z+(CL.z-G.hw0.z);G.car.position.x=G.car0.x+(CL.x-G.hw0.x);G.head.position.y=G.head0.y-CL.drop;
  const ax=new THREE.Vector3(1,0,0);G.fing.forEach((f,i)=>{f.quaternion.copy(G.fq[i]).multiply(new THREE.Quaternion().setFromAxisAngle(ax,-.55*CL.open))});
  G.root.updateMatrixWorld(true);const a=G.car.getWorldPosition(new THREE.Vector3()),b=G.head.getWorldPosition(new THREE.Vector3());
  G.cable.position.copy(a).add(b).multiplyScalar(.5);G.cable.scale.y=Math.max(.01,a.y-b.y);G.cable.position.x=b.x;G.cable.position.z=b.z}
function clawBelow(){let best=null,bd=9;for(const t of CL.toys){if(t.gone)continue;const d=Math.hypot(t.o.position.x-CL.x,t.o.position.z-CL.z);if(d<bd){bd=d;best=t}}return {t:best,d:bd}}
function clawWhirr(){burst('bandpass',220,3,.35,.12,320)}
/* mini-jeu d'adresse (garage) */
function clawPlay(){const S_=skinState();if(CL.st!=='idle'||!CL.g||CL.mode!=='skill')return false;if(profile.coins<CLAW_COST){toast('Il faut '+CLAW_COST+' pièces',true);return false}
  profile.coins-=CLAW_COST;S_.plays++;saveProfile();CL.st='move';CL.timer=15;CL.msg='';CL.last=null;CL.sp=1;if(sfx.coin)sfx.coin();paintClawPanel();return true}
function clawRelease(){if(CL.st==='move'&&CL.mode==='skill'){CL.st='down';paintClawPanel()}}
function clawFrame(dt){const G=CL.g;if(!G)return;CL.t+=dt;const P=G.play,k_=CL.sp;
  for(const t of CL.toys){if(t.ring)t.ring.rotation.z+=dt*(t.r==='l'?2.5:.6);const gm=t.o.userData.gem;if(gm){gm.rotation.y+=dt*2;gm.visible=!t.gone&&CL.held!==t}}
  if(CL.st==='move'){if(CL.mode==='auto'){const t=CL.target,dx=t.o.position.x-CL.x,dz=t.o.position.z-CL.z,dd=Math.hypot(dx,dz),s=Math.min(dd,dt*1.05);if(dd>1e-3){CL.x+=dx/dd*s;CL.z+=dz/dd*s}CL.open=Math.min(1,CL.open+dt*3.5);if(dd<.004&&CL.open>=1){CL.st='down';clawWhirr()}}
    else{const k=keys,b=CL.btn;const dx=((k.ArrowRight||k.KeyD||b.r)?1:0)-((k.ArrowLeft||k.KeyA||b.l)?1:0),dz=((k.ArrowDown||k.KeyS||b.d)?1:0)-((k.ArrowUp||k.KeyW||b.u)?1:0);const sp=.42*dt;
      CL.x=clamp(CL.x+dx*sp,P.x0+.04,P.x1-.04);CL.z=clamp(CL.z+dz*sp,P.z0+.04,P.z1-.04);CL.timer-=dt;CL.open=Math.min(1,CL.open+dt*2);
      if(k.Space||k.Enter||CL.timer<=0)CL.st='down';const el=$('#clawTimer');if(el)el.textContent=Math.max(0,Math.ceil(CL.timer))+' s'}}
  else if(CL.st==='down'){const {t,d}=clawBelow();const stop=t&&d<.16?t.h*.85:0.03;const maxDrop=G.hw0.y-(P.floor+stop+.11);CL.drop=Math.min(maxDrop,CL.drop+dt*.55*k_);if(CL.drop>=maxDrop){CL.st='close';CL.tc=0}}
  else if(CL.st==='close'){CL.tc+=dt*k_;CL.open=Math.max(0,1-CL.tc*2.2);if(CL.tc>.55){if(CL.tc<.6)ding(220,.06);
      if(CL.mode==='auto'){const t=CL.target;CL.held=t;t.off=new THREE.Vector3(t.o.position.x-CL.x,0,t.o.position.z-CL.z)}
      else{const {t,d}=clawBelow();/* prise : centrage × adhérence de la rareté */const p=t?clamp(1-d/.15,0,1)*RARITY[t.r].grip:0;CL.lastP=p;
        if(t&&Math.random()<p){CL.held=t;t.off=new THREE.Vector3(t.o.position.x-CL.x,0,t.o.position.z-CL.z)}else CL.held=null;if(!CL.held)CL.msg=t&&d<.15?'Raté de peu… la peluche a glissé.':'Raté : vise le centre d\'une peluche.'}
      CL.st='up';clawWhirr()}}
  else if(CL.st==='up'){CL.drop=Math.max(0,CL.drop-dt*.5*k_);if(CL.drop<=0)CL.st='carry'}
  else if(CL.st==='carry'){const tx=G.chute.x,tz=G.chute.z,dx=tx-CL.x,dz=tz-CL.z,dd=Math.hypot(dx,dz),s=Math.min(dd,dt*.35*k_);if(dd>1e-3){CL.x+=dx/dd*s;CL.z+=dz/dd*s}
    /* mini-jeu : une peluche légendaire peut encore glisser pendant le transport */
    if(CL.mode==='skill'&&CL.held&&CL.held.r==='l'&&!CL.slipTested&&dd<.25){CL.slipTested=true;if(Math.random()<.2){const t=CL.held;CL.held=null;t.vy=0;t.falling=true;CL.msg='Elle a glissé au dernier moment !'}}
    if(dd<.005){CL.st='drop';CL.tc=0}}
  else if(CL.st==='drop'){CL.tc+=dt*k_;CL.open=Math.min(1,CL.tc*2.5);if(CL.held&&CL.tc>.25){const t=CL.held;CL.held=null;t.falling=true;t.vy=0;t.toChute=true}
    if(CL.tc>(CL.mode==='auto'?.85:1.3)){CL.st='idle';CL.slipTested=false;if(CL.mode==='auto')clawAutoDone();else clawEnd()}}
  if(CL.held){const t=CL.held;const hw=G.head.getWorldPosition(new THREE.Vector3());t.o.position.set(CL.x+t.off.x*.4,hw.y-.16-t.h,CL.z+t.off.z*.4)}
  for(const t of CL.toys){if(!t.falling)continue;t.vy-=9.8*dt;t.o.position.y+=t.vy*dt;const fl=t.toChute?.55:P.floor;if(t.o.position.y<=fl){t.o.position.y=fl;t.falling=false;if(t.toChute){t.gone=true;t.o.visible=false;CL.won=t;if(t.toChute)ding(330,.08)}}}
  clawPose()}
function clawEnd(){const S_=skinState();const t=CL.won;CL.won=null;
  if(t){const res=grantReward(t.r);CL.last=res;rewardFanfare(t.r);toast((res.dup?'Doublon · +'+res.refund+' pièces':RARITY[t.r].n+' : '+res.item.name),true);if(CL.toys.filter(x=>!x.gone).length<=3)clawRefill()}
  else{S_.pity++;CL.last=null}
  saveProfile();paintClawPanel()}

/* ---------- tirage animé (Boutique « Machine à skins ») ---------- */
const CM={open:false,busy:false,ren:null,scene:null,cam:null,res:null,r:null,raf:0,last:0,fallback:false};
function clawModalHtml(){return `<div class="cm-box" role="dialog" aria-modal="true" aria-labelledby="cmTitle">
  <header class="cm-head"><h2 id="cmTitle">Machine à skins</h2><span class="cm-coins">Pièces <b id="cmCoins">${fmt(profile.coins)}</b></span><button class="btn small" id="cmClose" aria-label="Fermer">Fermer</button></header>
  <div class="cm-stage" id="cmStage"><canvas id="cmCanvas"></canvas><div class="cm-fb" id="cmFb" hidden><div class="cm-fb-rail"><div class="cm-fb-claw" id="cmFbClaw"><i></i><i></i><i></i></div></div><div class="cm-fb-balls" id="cmFbBalls"></div></div>
    <div class="cm-coin" id="cmCoin">${CLAW_COST}</div><div class="cm-reveal" id="cmReveal" hidden></div></div>
  <div class="cm-foot"><button class="btn primary" id="cmTry">Tenter · ${CLAW_COST} pièces</button>
    <div class="cm-odds">${RAR_KEYS.map(k=>`<span style="--c:${RARITY[k].col}"><i></i>${RARITY[k].n} ${Math.round(RARITY[k].p*100)} %</span>`).join('')}</div>
    <p class="note">Pièces du jeu uniquement. Objets non possédés en priorité ; doublon remboursé ${CLAW_REFUND} pièces (40 %). Épique ou Légendaire garanti au plus tard au ${CLAW_PITY}e tirage.</p></div></div>`}
function clawModalOpen(){let el=$('#clawModal');if(!el){el=document.createElement('div');el.id='clawModal';document.body.appendChild(el)}
  el.innerHTML=clawModalHtml();el.hidden=false;CM.open=true;CM.busy=false;$('#cmReveal').hidden=true;
  $('#cmClose').onclick=()=>clawModalClose();$('#cmTry').onclick=()=>clawTry();clawModalSync();
  addEventListener('keydown',clawModalKey,true);
  glbLoad('claw').then(gl=>{if(!CM.open)return;if(gl&&clawModalScene()){CM.fallback=false}else{CM.fallback=true;clawFallbackInit()}clawModalSync();cancelAnimationFrame(CM.raf);CM.last=performance.now();CM.raf=requestAnimationFrame(clawModalLoop)})}
function clawModalKey(e){if(!CM.open)return;if(e.code==='Escape'){e.stopPropagation();e.preventDefault();if(!CM.busy)clawModalClose()}else if((e.code==='Enter'||e.code==='Space')&&!CM.busy&&e.target===document.body){e.preventDefault();e.stopPropagation();clawTry()}}
function clawModalClose(){if(CM.busy)return;CM.open=false;cancelAnimationFrame(CM.raf);removeEventListener('keydown',clawModalKey,true);const el=$('#clawModal');if(el){el.hidden=true;el.innerHTML=''}
  if(CL.g&&CM.scene){CM.scene.remove(CL.g.root);disposeTree(CL.g.root)}CL.g=null;if(CM.ren){CM.ren.dispose();CM.ren.forceContextLoss&&CM.ren.forceContextLoss();CM.ren=null}CL.mode='skill';if(typeof paintShop==='function'&&screen==='shop')paintShop()}
function clawModalSync(){const c=$('#cmCoins');if(c)c.textContent=fmt(profile.coins);const t=$('#cmTry');if(t)t.disabled=CM.busy||profile.coins<CLAW_COST;const x=$('#cmClose');if(x)x.disabled=CM.busy;
  const tb=$('#cmTry');if(tb&&!CM.busy)tb.textContent=profile.coins<CLAW_COST?'Il faut '+CLAW_COST+' pièces':'Tenter · '+CLAW_COST+' pièces'}
function clawModalScene(){/* un rendu dédié, recréé à chaque ouverture (le canvas est neuf), libéré à la fermeture */
  try{CM.ren=new THREE.WebGLRenderer({canvas:$('#cmCanvas'),antialias:S().quality!=='eco'});CM.ren.outputEncoding=renderer.outputEncoding}catch(e){CM.ren=null;return false}
  if(!CM.scene){CM.scene=new THREE.Scene();CM.scene.background=new THREE.Color(0x0d141b);CM.scene.add(new THREE.HemisphereLight(0xfff4e0,0x1a2026,1.05));const d=new THREE.DirectionalLight(0xffffff,.8);d.position.set(1.5,4,3);CM.scene.add(d);
    const fl=new THREE.Mesh(new THREE.CircleGeometry(6,32),new THREE.MeshLambertMaterial({color:0x151d26}));fl.rotation.x=-Math.PI/2;CM.scene.add(fl);CM.cam=new THREE.PerspectiveCamera(36,1,.05,40)}
  const root=clawBuild();if(!root)return false;CM.scene.add(root);CL.mode='auto';CL.sp=1.9;CM.camK=0;return true}
function clawModalLoop(now){if(!CM.open)return;CM.raf=requestAnimationFrame(clawModalLoop);const dt=Math.min(.1,(now-CM.last)/1000);CM.last=now;
  if(CM.fallback)return;const st=$('#cmStage');if(!st||!CM.ren)return;const w=st.clientWidth,h=st.clientHeight;const cv=CM.ren.domElement;
  if(cv.width!==Math.round(w*Math.min(2,devicePixelRatio))||cv.height!==Math.round(h*Math.min(2,devicePixelRatio))){CM.ren.setPixelRatio(Math.min(2,devicePixelRatio));CM.ren.setSize(w,h,false);CM.cam.aspect=w/h;CM.cam.updateProjectionMatrix()}
  /* cadrage : la vitrine remplit la scène ; la caméra se rapproche pendant la prise */
  const near=CL.st==='idle'?0:1;CM.camK=(CM.camK||0)+(near-(CM.camK||0))*(1-Math.exp(-3*dt));const k=CM.camK;
  CM.cam.position.set(0,1.95-k*.12,2.75-k*.55);CM.cam.lookAt(0,1.55-k*.05,0);
  clawFrame(dt);CM.ren.render(CM.scene,CM.cam)}
/* « Tenter » : débit immédiat (une seule fois), tirage et enregistrement tout de suite, puis animation, puis révélation */
function clawTry(){if(CM.busy||!CM.open)return;if(profile.coins<CLAW_COST){toastMenu('Il te faut '+CLAW_COST+' pièces');return}
  const S_=skinState();CM.busy=true;profile.coins-=CLAW_COST;S_.draws++;const r=rollRarity();CM.r=r;CM.res=grantReward(r);saveProfile();
  $('#cmReveal').hidden=true;clawModalSync();
  /* 1. paiement : pièce qui tombe dans la fente + son */
  const coin=$('#cmCoin');coin.classList.remove('go');void coin.offsetWidth;coin.classList.add('go');if(sfx.coin&&!sfx.coin())ding(1568,.08);setTimeout(()=>ding(1175,.06),180);
  setTimeout(()=>{if(!CM.open)return;if(CM.fallback){clawFallbackRun(r);return}
    /* 2 à 6 : la pince va chercher une peluche de la rareté tirée (on en marque une si besoin) */
    let t=CL.toys.find(x=>!x.gone&&x.r===r);if(!t){t=CL.toys.filter(x=>!x.gone).sort((a,b)=>Math.hypot(a.o.position.x,a.o.position.z)-Math.hypot(b.o.position.x,b.o.position.z))[0];t.r=r;toyMarker(t)}
    CL.target=t;CL.st='move';CL.drop=0;clawWhirr()},450)}
function clawAutoDone(){if(CL.toys.filter(x=>!x.gone).length<=3)clawRefill();clawReveal()}
/* 7. révélation */
function clawReveal(){const res=CM.res,r=CM.r,R=RARITY[r],it=res.item;CM.busy=false;const el=$('#cmReveal');if(!el)return;
  const canEquip=!res.dup&&(it.skin||(it.shop&&it.shop.slot));
  el.className='cm-reveal r-'+r;el.style.setProperty('--c',R.col);
  el.innerHTML=`<span class="cm-rar">${R.n}</span><h3>${esc(it.name)}</h3><span class="cm-kind">${it.kind}</span><p>${esc(it.desc||'')}</p>
    ${res.dup?`<p class="cm-dup">Déjà possédé · doublon remboursé <b>+${res.refund} pièces</b> (40 % du prix)</p>`:'<p class="cm-new">Nouveau ! Ajouté à ta collection.</p>'}
    <div class="row">${canEquip?'<button class="btn small primary" id="cmEquip">Équiper</button>':''}<button class="btn small" id="cmAgain" ${profile.coins>=CLAW_COST?'':'disabled'}>Retenter · ${CLAW_COST}</button></div>`;
  el.hidden=false;rewardFanfare(r);toastMenu(res.dup?'Doublon '+R.n.toLowerCase()+' · +'+res.refund+' pièces':R.n+' : '+it.name);
  const eq=$('#cmEquip');if(eq)eq.onclick=()=>{equipReward(it);eq.disabled=true;eq.textContent='Équipé'};$('#cmAgain').onclick=()=>clawTry();clawModalSync()}
/* repli 2D (modèle 3D indisponible) : pince en CSS au-dessus de capsules colorées, même séquence */
function clawFallbackInit(){$('#cmCanvas').hidden=true;const fb=$('#cmFb');fb.hidden=false;const balls=$('#cmFbBalls');balls.innerHTML=RAR_KEYS.concat(['c','u','c']).map(k=>`<b data-r="${k}" style="--c:${RARITY[k].col}"></b>`).join('')}
function clawFallbackRun(r){const claw=$('#cmFbClaw'),balls=[...$$('#cmFbBalls b')];const ball=balls.find(b=>b.dataset.r===r&&!b.classList.contains('gone'))||balls.find(b=>!b.classList.contains('gone'));
  ball.dataset.r=r;ball.style.setProperty('--c',RARITY[r].col);const st=$('#cmStage').getBoundingClientRect(),bb=ball.getBoundingClientRect();const x=bb.left-st.left+bb.width/2-st.width/2,yd=bb.top-st.top-40;
  const a=claw.animate([{transform:'translate(0,0)'},{transform:`translate(${x}px,0)`,offset:.22},{transform:`translate(${x}px,${yd}px)`,offset:.4},{transform:`translate(${x}px,${yd}px)`,offset:.5},{transform:`translate(${x}px,0)`,offset:.68},{transform:'translate(0,0)',offset:.9},{transform:'translate(0,0)'}],{duration:2900,easing:'ease-in-out'});
  setTimeout(()=>{claw.classList.add('closed');ball.classList.add('held')},1450);setTimeout(()=>{claw.classList.remove('closed');ball.classList.add('gone')},2650);a.onfinish=()=>{ball.classList.remove('held');clawReveal()}}
/* carte de la boutique */
function clawShopCard(){return `<div class="shopcard cm-card" data-shop="claw"><span class="kind">Machine à skins</span><span></span><h4>Tente ta chance</h4><span class="owned">${CLAW_COST} pièces</span>
  <p>Une pince attrape un objet au hasard : skin de tenue ou de casque, équipement ou cosmétique de la boutique. Ceux que tu n'as pas sortent en priorité.</p>
  <div class="cm-odds" style="grid-column:1/-1">${RAR_KEYS.map(k=>`<span style="--c:${RARITY[k].col}"><i></i>${RARITY[k].n} ${Math.round(RARITY[k].p*100)} %</span>`).join('')}</div>
  <div class="row" style="grid-column:1/-1"><button class="btn small primary" id="openClaw">${profile.coins>=CLAW_COST?'Ouvrir la machine':'Ouvrir · il faut '+CLAW_COST+' pièces'}</button></div></div>`}

/* ---------- panneaux du garage ---------- */
function paintClawPanel(){const el=$('#garageBody');if(!el||gTab!=='claw')return;const S_=skinState();
  const res=CL.last?(()=>{const it=CL.last.item,R=RARITY[it.r];return CL.last.dup?`<div class="clawres" style="border-color:${R.col}">Doublon ${R.n.toLowerCase()} (${esc(it.name)}) · +${CL.last.refund} pièces</div>`:
    `<div class="clawres" style="border-color:${R.col}"><span><b style="color:${R.col}">${R.n}</b> · ${esc(it.name)}</span>${it.skin||(it.shop&&it.shop.slot)?'<button class="btn small primary" id="clawEquip">Équiper</button>':''}</div>`})():(CL.msg?`<p class="note">${CL.msg}</p>`:'');
  el.innerHTML=`<div class="row" style="justify-content:space-between"><span class="lbl">Tes pièces <b>${fmt(profile.coins)}</b></span><span class="note">Une partie : ${CLAW_COST} pièces</span></div>
    ${CL.st==='idle'?`<button class="btn primary" id="clawPlay" ${profile.coins>=CLAW_COST?'':'disabled'}>Jouer · ${CLAW_COST} pièces</button>`:`<div class="row"><span class="lbl">Temps <b id="clawTimer">${Math.ceil(CL.timer)} s</b></span></div>`}
    <div class="clawpad" ${CL.st==='move'?'':'aria-disabled="true"'}><button class="btn" data-m="l" aria-label="Gauche">◀</button><button class="btn" data-m="u" aria-label="Fond">▲</button><button class="btn" data-m="d" aria-label="Avant">▼</button><button class="btn" data-m="r" aria-label="Droite">▶</button><button class="btn primary" id="clawDrop">Lâcher</button></div>
    <p class="note">Mode adresse : flèches pour viser, Espace pour lâcher la pince. Plus tu es centré sur la peluche, plus la prise tient. La couleur de l'anneau indique la rareté de ce que tu gagnes.</p>
    ${res}
    <div class="grp"><span class="lbl">Raretés <b>pièces du jeu uniquement</b></span>
      <table class="odds"><tr><th>Rareté</th><th>Chance par peluche</th><th>Prise si bien centré</th></tr>
      ${RAR_KEYS.map(k=>{const v=RARITY[k];return `<tr><td style="color:${v.col}">${v.n}</td><td>${Math.round(v.p*100)} %</td><td>${Math.round(v.grip*100)} %</td></tr>`}).join('')}</table>
      <p class="note">La machine contient toujours 3 communes, 2 peu communes, 1 rare, et 2 peluches tirées avec ces chances. Doublon : +${CLAW_REFUND} pièces. Tu préfères un tirage automatique ? Boutique, « Machine à skins ».</p></div>
    <div class="grp"><span class="lbl">Collection <b>${S_.list.length}/${SKINCAT.length} skins</b></span><button class="btn small" id="clawToSkins">Voir mes skins</button></div>`;
  const pb=$('#clawPlay');if(pb)pb.onclick=()=>clawPlay();const db=$('#clawDrop');if(db)db.onclick=()=>clawRelease();
  $$('#garageBody .clawpad [data-m]').forEach(b=>{const m=b.dataset.m;const on=e=>{e.preventDefault();CL.btn[m]=true},off=()=>{CL.btn[m]=false};b.onpointerdown=on;b.onpointerup=off;b.onpointerleave=off;b.onpointercancel=off});
  const eq=$('#clawEquip');if(eq)eq.onclick=()=>{equipReward(CL.last.item);toast(CL.last.item.name+' équipé',true);eq.disabled=true};
  const ts=$('#clawToSkins');if(ts)ts.onclick=()=>{gTab='skins';paintGarage()}}
function skinsPanelHtml(){const S_=skinState(),L=profile.look;const by=k=>SKINCAT.filter(s=>s.k===k);
  const card=s=>{const own=!!profile.owned[s.id],on=L.sk[s.k]===s.id,R=RARITY[s.r];
    const sw=`<span class="skinsw" style="background:linear-gradient(135deg,${hexCss(s.c1)} 0 55%,${hexCss(s.c2??s.c1)} 55% 100%)"></span>`;
    return `<button class="item skin" data-sk="${s.id}" aria-pressed="${on}" ${own?'':'disabled'} style="border-left:3px solid ${R.col}"><h4>${sw}${own?s.name:'???'}</h4><span class="tagr" style="color:${R.col}">${R.n}${on?' · équipé':own?'':' · à gagner'}</span></button>`};
  return `<div class="row" style="justify-content:space-between"><span class="lbl">Collection <b>${S_.list.length}/${SKINCAT.length}</b></span><button class="btn small primary" id="toClaw">Machine à pinces</button></div>
    <p class="note">Les skins sont purement cosmétiques. Ils s'appliquent au rider de tous les sports. Tant qu'aucun skin n'est équipé, tes couleurs de l'onglet Teintes s'appliquent.</p>
    <div class="grp"><span class="lbl">Tenues</span><div class="items">${by('s').map(card).join('')}</div><button class="btn small" data-unsk="s">Retirer la tenue</button></div>
    <div class="grp"><span class="lbl">Casques</span><div class="items">${by('h').map(card).join('')}</div><button class="btn small" data-unsk="h">Retirer le casque</button></div>`}
function bindSkinsPanel(){const L=profile.look;$$('#garageBody .item.skin').forEach(b=>b.onclick=()=>{const s=skinById(b.dataset.sk);if(!s)return;L.sk[s.k]=L.sk[s.k]===s.id?'':s.id;saveProfile();paintGarage()});
  $$('#garageBody [data-unsk]').forEach(b=>b.onclick=()=>{L.sk[b.dataset.unsk]='';saveProfile();paintGarage()});const c=$('#toClaw');if(c)c.onclick=()=>{gTab='claw';paintGarage()}}
