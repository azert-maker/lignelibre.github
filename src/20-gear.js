/* =====================================================================
   ÉQUIPEMENT · catalogue, stats, constructeurs 3D partagés (jeu, garage, adversaires)
===================================================================== */
const GEAR={
  helmet:[{id:'full',name:'Intégral',desc:'Mentonnière et visière fumée.'},{id:'open',name:'Bol',desc:'Casque ouvert, look freeride.'},{id:'carbon',name:'Carbone',desc:'Coque carbone brillante.',cost:1}],
  wing:[
    {id:'sprint',name:'Squirrel Sprint',desc:'Petite voilure indulgente. Décroche tard, pardonne les erreurs.',st:{Vitesse:.45,Finesse:.5,Maniabilité:.9,Stabilité:.95},phys:{area:2.6,cd0:.086,k:.34,cla:1.45,stall:.48}},
    {id:'proxy',name:'Freak Proxy',desc:'La référence du proximity flying. Équilibrée.',st:{Vitesse:.65,Finesse:.7,Maniabilité:.75,Stabilité:.7},phys:{area:2.3,cd0:.075,k:.32,cla:1.6,stall:.42}},
    {id:'aura',name:'Aura Pro',desc:'Grosse voilure de performance : finesse 3,6 mais décroche plus tôt.',st:{Vitesse:.85,Finesse:.92,Maniabilité:.6,Stabilité:.45},phys:{area:2.15,cd0:.066,k:.30,cla:1.72,stall:.37},cost:3}],
  board:[
    {id:'top98',name:'Topmount 98',desc:'Planche de descente polyvalente, 98 cm.',st:{Vitesse:.7,Adhérence:.7,Stabilité:.75,Slide:.65},phys:{alat:9.0,tuck:.00135,len:.98,wob:0}},
    {id:'drop105',name:'Drop-through 105',desc:'Plus basse et plus longue : stable, très accrocheuse.',st:{Vitesse:.6,Adhérence:.85,Stabilité:.9,Slide:.8},phys:{alat:9.6,tuck:.00145,len:1.05,wob:0},cost:1},
    {id:'speed85',name:'Speedboard 85',desc:'Courte et rigide, la plus rapide en tuck. Nerveuse au-delà de 100 km/h.',st:{Vitesse:.95,Adhérence:.6,Stabilité:.5,Slide:.55},phys:{alat:8.6,tuck:.00118,len:.85,wob:1},cost:2}],
  bmx:[
    {id:'street',name:'Street 20,5"',desc:'Cadre polyvalent et réactif. Le bon point de départ.',st:{Accélération:.7,Rotation:.75,Stabilité:.7},phys:{acc:5,spin:1,turn:1,whip:1}},
    {id:'park',name:'Park 20,75"',desc:'Plus long : réceptions plus stables, tourne un peu moins vite.',st:{Accélération:.65,Rotation:.68,Stabilité:.9},phys:{acc:4.8,spin:.93,turn:.94,whip:.95},cost:1},
    {id:'flat',name:'Flatland Light',desc:'Ultra léger : rotations et tailwhips plus rapides, moins pardonnant.',st:{Accélération:.85,Rotation:.95,Stabilité:.5},phys:{acc:5.4,spin:1.12,turn:1.08,whip:1.15},cost:2}],
  moto:[
    {id:'250f',name:'250 4T',desc:'La référence du motocross : puissante sans être brutale.',st:{Puissance:.72,Maniabilité:.75,Suspension:.75},phys:{power:7.4,top:27,turn:1,grip:8.6,pitch:1,susp:15.5}},
    {id:'125',name:'125 2T',desc:'Légère et joueuse : assiette plus vive en l\'air, moins de vitesse de pointe.',st:{Puissance:.55,Maniabilité:.95,Suspension:.62},phys:{power:6.7,top:24.5,turn:1.15,grip:9.2,pitch:1.18,susp:14.5},cost:1},
    {id:'450f',name:'450 4T',desc:'Couple énorme et suspension costaude. Lourde à faire tourner.',st:{Puissance:.95,Maniabilité:.55,Suspension:.95},phys:{power:8.7,top:30,turn:.88,grip:8.2,pitch:.88,susp:17.5},cost:2}],
  wboard:[
    {id:'flex',name:'Flex 140',desc:'Planche souple et tolérante : réceptions douces.',st:{Coupe:.7,Rotation:.75,Stabilité:.8},phys:{cut:8.6,spin:1,len:1.4}},
    {id:'stiff',name:'Boat 144',desc:'Rigide, coupe plus fort vers le sillage : sauts plus hauts.',st:{Coupe:.92,Rotation:.68,Stabilité:.75},phys:{cut:9.5,spin:.93,len:1.44},cost:1},
    {id:'parkw',name:'Park 136',desc:'Courte et vive : rotations plus rapides.',st:{Coupe:.65,Rotation:.95,Stabilité:.6},phys:{cut:8.2,spin:1.13,len:1.36},cost:2}],
  shoe:[
    {id:'trail',name:'Baskets Run',desc:'Polyvalentes : bon grip, bonne relance.',st:{Vitesse:.7,Détente:.7,Grip:.75},phys:{speed:1,jump:1}},
    {id:'grip',name:'Grip Pro',desc:'Semelle collante : saute un peu plus haut, sprint un peu moins vite.',st:{Vitesse:.62,Détente:.85,Grip:.9},phys:{speed:.97,jump:1.06},cost:1},
    {id:'light',name:'Racer Light',desc:'Ultra légères : sprint +5 %.',st:{Vitesse:.9,Détente:.65,Grip:.6},phys:{speed:1.05,jump:.98},cost:2}],
  wheel:[
    {id:'w80',name:'Grip 80A',desc:'Gomme tendre, colle en courbe, slide plus dur.',st:{Adhérence:.9,Slide:.45,Roulement:.55},phys:{alat:.5,slide:5.0,rr:.16}},
    {id:'w83',name:'Freeride 83A',desc:'Compromis grip et slide.',st:{Adhérence:.7,Slide:.75,Roulement:.65},phys:{alat:0,slide:5.8,rr:.15}},
    {id:'w86',name:'Race 86A',desc:'Gomme dure : roule plus vite, accroche moins.',st:{Adhérence:.55,Slide:.7,Roulement:.95},phys:{alat:-.4,slide:5.4,rr:.10},cost:1}]
};
const gearOf=(slot,id)=>GEAR[slot].find(g=>g.id===id)||GEAR[slot][0];
const PALETTE=[0xff5a36,0xffb000,0xf5e663,0x7ee08a,0x3fe0c5,0x8fd3ff,0x2b6cff,0x6a5cff,0xff4f9a,0xd23c3c,0xf2f2ee,0x9aa3ab,0x1d2731,0x111418,0x2a1f17,0x8a6b4a];
const NEON=[0x39ff14,0xff00e6,0x00f0ff,0xfff200];
const SKINS=[0xf1c9a5,0xd9a77f,0xb07a55,0x8a5a3c,0x5e3b26];

/* Objets débloquables en regardant des pubs (récompense proportionnelle à l'avantage) */
const SHOP=[
  {id:'aura',price:800,kind:'Équipement',slot:'wing',name:'Wingsuit Aura Pro',effect:'Finesse 3,6 au lieu de 3,2 et +8 % de vitesse. Décroche plus tôt.',ads:3},
  {id:'speed85',price:550,kind:'Équipement',slot:'board',name:'Speedboard 85',effect:'Traînée en tuck −13 %, jusqu\'à ~130 km/h. Moins d\'adhérence.',ads:2},
  {id:'drop105',price:280,kind:'Équipement',slot:'board',name:'Drop-through 105',effect:'Adhérence +7 %, slides plus stables.',ads:1},
  {id:'w86',price:240,kind:'Équipement',slot:'wheel',name:'Roues Race 86A',effect:'Résistance au roulement −33 %.',ads:1},
  {id:'park',price:240,kind:'Équipement',slot:'bmx',name:'BMX Park 20,75"',effect:'Cadre long : réception plus stable (même tolérance, moins de rebond).',ads:1},
  {id:'flat',price:480,kind:'Équipement',slot:'bmx',name:'BMX Flatland Light',effect:'Rotations +12 %, tailwhip +15 %. Accélération +8 %.',ads:2},
  {id:'125',price:300,kind:'Équipement',slot:'moto',name:'Moto 125 2T',effect:'Assiette en l\'air +18 %, braquage +15 %. Vitesse de pointe −9 %.',ads:1},
  {id:'450f',price:750,kind:'Équipement',slot:'moto',name:'Moto 450 4T',effect:'Puissance +18 %, pointe +11 %, encaisse des réceptions plus dures. Plus lourde.',ads:3},
  {id:'stiff',price:300,kind:'Équipement',slot:'wboard',name:'Wakeboard Boat 144',effect:'Coupe +10 % vers le sillage : sauts plus hauts.',ads:1},
  {id:'parkw',price:450,kind:'Équipement',slot:'wboard',name:'Wakeboard Park 136',effect:'Rotations +13 %.',ads:2},
  {id:'grip',price:240,kind:'Équipement',slot:'shoe',name:'Chaussures Grip Pro',effect:'Détente +6 % (sauts un peu plus hauts), sprint −3 %.',ads:1},
  {id:'light',price:400,kind:'Équipement',slot:'shoe',name:'Chaussures Racer Light',effect:'Sprint +5 %, détente −2 %.',ads:2},
  {id:'carbon',price:180,rar:'u',kind:'Cosmétique',slot:'helmet',name:'Casque carbone',effect:'Coque carbone brillante.',ads:1},
  {id:'neon',price:150,rar:'u',kind:'Cosmétique',name:'Pack couleurs néon',effect:'4 teintes fluo pour tout l\'équipement.',ads:1},
  {id:'smoke',price:150,rar:'u',kind:'Cosmétique',name:'Fumigènes couleur',effect:'Fumée aux couleurs de ta voilure en wingsuit.',ads:1},
  {id:'revive',price:80,kind:'Consommable',name:'Second souffle',effect:'Après une chute, reprends quelques secondes avant. 1 charge par pub.',ads:1,cons:true},
  {id:'boost',price:60,kind:'Consommable',name:'Départ lancé',effect:'+20 % de vitesse au départ d\'une partie. 1 charge par pub.',ads:1,cons:true},
  {id:'x15',price:150,kind:'Consommable',name:'Score ×1,5',effect:'Score majoré de 50 % sur une partie en monde libre. 1 charge pour 2 pubs.',ads:2,cons:true}
];
const owns=id=>{const it=SHOP.find(s=>s.id===id);return !it||!!profile.owned[id]||(!it.cons&&lvlUnlocked(id))};
const gearCost=(slot,id)=>{const g=gearOf(slot,id);return g.cost||0};
const gearUnlocked=(slot,id)=>!gearCost(slot,id)||!!profile.owned[id]||lvlUnlocked(id);

/* ---------- PERSONNAGE · rig hiérarchique unique (jeu, garage, démo, fantômes, wingsuit) ----------
   Hiérarchie : root > pelvis > spine > torso > neck > head ; torso > clavicle > upperArm > foreArm > hand (×2) ;
   pelvis > upperLeg > lowerLeg > foot (×2). Repère : buste vers +x, pieds sur l'axe z (planche), y vers le haut.
   pose(p) fixe une CIBLE que le corps rejoint en douceur (≈ 11 Hz) ; snapPose(p) place immédiatement ;
   setPose(nom, t, extra) mélange depuis idle ; impact(v) comprime les jambes (réception, touché d'eau) ;
   respiration automatique (buste, clavicules, tête).
   Paramètres : crouch, lean (pitch du buste), side (vers le nez / la queue), twist, turn (anticipation : le buste
   et le regard partent avant la planche), spread (bras), back, reach, look, handDown (-1/1), legSpread, stance */
const POSES={idle:{crouch:.12,lean:.05,twist:.2,spread:.22,look:.2},
  stand:{crouch:.05,lean:-.1,twist:.6,spread:.9,look:.6},
  tuck:{crouch:.95,lean:1.15,twist:.95,back:1,look:.3},
  carve:{crouch:.45,lean:.3,twist:.75,spread:.4,look:.5},
  carve_L:{crouch:.55,lean:.35,twist:.75,spread:.5,look:.7,side:-.22,turn:-.5},
  carve_R:{crouch:.55,lean:.35,twist:.75,spread:.5,look:.3,side:.22,turn:.5},
  slide:{crouch:.7,lean:.5,twist:.5,handDown:1,look:.6},
  grab:{crouch:1,lean:.4,twist:.6,handDown:1},
  wingsuit_glide:{crouch:0,lean:0,twist:0,spread:1,back:.15,look:0,legSpread:1,stance:0},
  wingsuit_dive:{crouch:0,lean:0,twist:0,spread:.75,back:.55,look:0,legSpread:.7,stance:0},
  foil_neutral:{crouch:.35,lean:.25,twist:.7,spread:.6,look:.6},
  foil_pump:{crouch:.8,lean:.45,twist:.7,spread:.3,look:.6},
  surf_bottom:{crouch:.75,lean:.5,twist:.8,spread:.7,look:.8,side:.15,turn:.4,reach:.2},
  crash:{crouch:.15,lean:-.4,spread:1,back:1,twist:0,look:0,side:.3}};
const POSE_KEYS=['crouch','lean','side','twist','turn','spread','back','look','reach','legSpread','stance'];
function applyStance(h,sport,I,v){if(!h||!h.setPose)return;I=I||NEUTRAL;const sp=clamp((v||0)/25,0,1);
  if(sport==='wingsuit')return h.setPose(I.y>0?'wingsuit_dive':'wingsuit_glide',1);
  if(I.y<0)return h.setPose('tuck',1,{side:I.x*.12});if(I.a)return h.setPose('slide',1,{handDown:I.x>=0?-1:1});if(I.y>0)return h.setPose('stand',1);
  if(I.x)return h.setPose(I.x<0?'carve_L':'carve_R',.5+sp*.5);h.setPose('carve',.6+sp*.4)}
function buildHuman(look){
  const g=new THREE.Group();const L=look&&look.sk&&typeof skinLookColors==='function'?skinLookColors(look):look;const lo=S().quality==='eco';const seg=lo?6:10;
  const mS=new THREE.MeshLambertMaterial({color:L.suit,map:TEX.fabric}),mT=new THREE.MeshLambertMaterial({color:L.accent,map:TEX.fabric}),
    mV=new THREE.MeshPhongMaterial({color:0x0b0e11,shininess:110,specular:0x8899aa}),mK=new THREE.MeshLambertMaterial({color:L.skin}),
    mSole=new THREE.MeshLambertMaterial({color:0xe9e6dc}),mG=new THREE.MeshLambertMaterial({color:0x1b2026}),mShoe=new THREE.MeshLambertMaterial({color:{trail:0x2a3038,grip:0xff6a1f,light:0x39e07a}[(L.gear&&L.gear.shoe)||'trail']||0x2a3038}),mPad=new THREE.MeshLambertMaterial({color:new THREE.Color(L.suit).multiplyScalar(.55)});
  const hid=(L.gear&&L.gear.helmet)||'full';const mH=hid==='carbon'?new THREE.MeshPhongMaterial({color:0xffffff,map:TEX.carbon,shininess:90,specular:0x8899aa}):new THREE.MeshPhongMaterial({color:L.helmet,shininess:50,specular:0x444444});
  const cyl=(r1,r2,h,m,s)=>{const ge=new THREE.CylinderGeometry(r1,r2,h,s||seg);ge.translate(0,-h/2,0);return new THREE.Mesh(ge,m)};
  const ball=(r,m)=>new THREE.Mesh(new THREE.SphereGeometry(r,seg,Math.max(4,seg-3)),m);
  const grp=(parent,x,y,z,name)=>{const o=new THREE.Group();o.position.set(x,y,z);o.name=name;parent.add(o);return o};
  // bassin
  const pelvis=grp(g,0,.96,0,'pelvis');{const m=new THREE.Mesh(new THREE.CylinderGeometry(.165,.17,.22,seg),mS);m.scale.set(.8,1,1.15);pelvis.add(m);
    const belt=new THREE.Mesh(new THREE.CylinderGeometry(.158,.158,.04,seg),mPad);belt.position.y=.08;belt.scale.set(.8,1,1.14);pelvis.add(belt)}
  // colonne, buste, cou, tête
  const spine=grp(pelvis,0,.1,0,'spine');{const m=new THREE.Mesh(new THREE.CylinderGeometry(.17,.16,.22,seg),mT);m.position.y=.09;m.scale.set(.74,1,1.04);spine.add(m);const hem=new THREE.Mesh(new THREE.CylinderGeometry(.168,.168,.04,seg),mPad);hem.position.y=-.01;hem.scale.set(.76,1,1.06);spine.add(hem)}
  const torso=grp(spine,0,.2,0,'torso');torso.rotation.order='YZX';
  const chest=new THREE.Mesh(new THREE.CylinderGeometry(.235,.18,.36,seg),mT);chest.position.y=.17;chest.scale.set(.66,1,1);torso.add(chest);
  const stripe=new THREE.Mesh(new THREE.CylinderGeometry(.226,.215,.045,seg),mS);stripe.position.y=.24;stripe.scale.set(.67,1,1.01);torso.add(stripe);const zip=new THREE.Mesh(new THREE.BoxGeometry(.02,.34,.025),mPad);zip.position.set(.155,.16,0);torso.add(zip);
  const collar=new THREE.Mesh(new THREE.CylinderGeometry(.085,.13,.1,seg),mPad);collar.position.y=.38;torso.add(collar);
  const pack=new THREE.Mesh(new THREE.CylinderGeometry(.09,.1,.26,seg),mPad);pack.scale.set(.55,1,1);pack.position.set(-.135,.2,0);torso.add(pack);
  const neck=grp(torso,0,.4,0,'neck');{const m=cyl(.05,.055,.06,mK);m.position.y=.06;neck.add(m)}
  const head=grp(neck,0,.05,0,'head');
  {const skull=ball(.1,mK);skull.position.y=.1;skull.scale.set(1,1.1,.95);head.add(skull);
   if(hid==='open'){const cap=new THREE.Mesh(new THREE.SphereGeometry(.135,seg+2,6,0,Math.PI*2,0,Math.PI/2),mH);cap.position.y=.12;head.add(cap);
     const goggles=new THREE.Mesh(new THREE.BoxGeometry(.035,.055,.2),mV);goggles.position.set(.1,.12,0);head.add(goggles);const strap=new THREE.Mesh(new THREE.TorusGeometry(.132,.012,4,seg+4),mT);strap.rotation.z=Math.PI/2;strap.rotation.y=Math.PI/2;strap.position.y=.12;head.add(strap)}
   else{const helm=ball(.148,mH);helm.position.y=.12;helm.scale.set(1.06,1,1.02);head.add(helm);
     const visor=new THREE.Mesh(new THREE.SphereGeometry(.153,seg+2,6,-Math.PI*.42,Math.PI*.84,Math.PI*.36,Math.PI*.3),mV);visor.position.y=.12;visor.rotation.y=Math.PI/2;head.add(visor);
     const band=new THREE.Mesh(new THREE.TorusGeometry(.149,.012,4,seg+6),mT);band.rotation.x=Math.PI/2;band.position.y=.135;band.scale.set(1.06,1.02,1);head.add(band);
     if(hid==='full'){const chin=new THREE.Mesh(new THREE.BoxGeometry(.075,.065,.18),mH);chin.position.set(.115,-.005,0);head.add(chin)}}}
  // bras : clavicule > bras > avant-bras > main
  const arms=[];
  for(const side of [-1,1]){const cl=grp(torso,0,.31,side*.07,'clavicle');const ua=grp(cl,0,0,side*.15,'upperArm');
    const sh=ball(.085,mT);ua.add(sh);ua.add(cyl(.066,.05,.3,mT));const band=cyl(.06,.06,.035,mS);band.position.y=-.16;ua.add(band);
    const fa=grp(ua,0,-.3,0,'foreArm');fa.add(ball(.052,mT));fa.add(cyl(.052,.04,.27,mT));const cuff=cyl(.042,.042,.04,mG);cuff.position.y=-.25;fa.add(cuff);
    const hand=grp(fa,0,-.3,0,'hand');const palm=new THREE.Mesh(new THREE.BoxGeometry(.065,.1,.09),mG);palm.position.y=-.03;hand.add(palm);
    const thumb=new THREE.Mesh(new THREE.BoxGeometry(.03,.05,.03),mG);thumb.position.set(.03,-.01,side*.04);hand.add(thumb);arms.push({cl,ua,fa,hand,side})}
  // jambes : cuisse > tibia > pied
  const legs=[];
  for(const side of [-1,1]){const th=grp(pelvis,0,-.05,side*.1,'upperLeg');th.add(cyl(.105,.074,.44,mS));const pad=ball(.07,mPad);pad.position.set(.025,-.44,0);pad.scale.set(.9,1,1);th.add(pad);
    const sh=grp(th,0,-.44,0,'lowerLeg');sh.add(cyl(.074,.056,.42,mS));const bootTop=cyl(.068,.072,.12,mG);bootTop.position.y=-.3;sh.add(bootTop);
    const ft=grp(sh,0,-.43,0,'foot');const shoe=new THREE.Mesh(new THREE.BoxGeometry(.28,.08,.12),mShoe);shoe.position.set(.05,0,0);ft.add(shoe);
    const sole=new THREE.Mesh(new THREE.BoxGeometry(.29,.025,.125),mSole);sole.position.set(.05,-.045,0);ft.add(sole);const strap=new THREE.Mesh(new THREE.BoxGeometry(.05,.085,.13),mT);strap.position.set(.02,.005,0);ft.add(strap);
    legs.push({th,sh,ft,side})}
  /* IK deux os des bras (mains sur le guidon, etc.) : g.ik={anchors:[Object3D,Object3D], w:0..1}.
     Le coude est orienté vers l'extérieur et un peu en arrière ; si la cible est hors d'atteinte, le bras se tend vers elle. */
  const _S=new THREE.Vector3(),_T=new THREE.Vector3(),_u=new THREE.Vector3(),_ud=new THREE.Vector3(),_n=new THREE.Vector3(),_pl=new THREE.Vector3(),_f=new THREE.Vector3(),
    _qp=new THREE.Quaternion(),_qi=new THREE.Quaternion(),_q=new THREE.Quaternion(),_gq=new THREE.Quaternion(),DOWN=new THREE.Vector3(0,-1,0);
  function ikArms(){const w=clamp(g.ik.w==null?1:g.ik.w,0,1);
    for(const A of arms){A.ua.rotation.y=0;A.fa.rotation.x=0;A.fa.rotation.y=0}
    if(w<.001)return;const L1=.3,L2=.36;g.updateWorldMatrix(true,false);g.getWorldQuaternion(_gq);
    arms.forEach((A,i)=>{const an=g.ik.anchors[i];if(!an)return;
      A.cl.updateWorldMatrix(true,false);_S.copy(A.ua.position).applyMatrix4(A.cl.matrixWorld);
      an.updateWorldMatrix(true,false);_T.setFromMatrixPosition(an.matrixWorld);
      _u.subVectors(_T,_S);const d=clamp(_u.length(),.08,L1+L2-.003);_u.normalize();
      const a1=Math.acos(clamp((L1*L1+d*d-L2*L2)/(2*L1*d),-1,1));
      _pl.set(-.35,-.15,A.side).applyQuaternion(_gq);_n.crossVectors(_u,_pl);if(_n.lengthSq()<1e-8)_n.set(0,0,1);_n.normalize();
      _ud.copy(_u).applyAxisAngle(_n,a1);
      _f.copy(_u).multiplyScalar(d).addScaledVector(_ud,-L1).normalize();
      A.cl.getWorldQuaternion(_qp);_qi.copy(_qp).invert();
      _q.setFromUnitVectors(DOWN,_ud.clone().applyQuaternion(_qi));A.ua.quaternion.slerp(_q,w);
      _qp.multiply(A.ua.quaternion);_qi.copy(_qp).invert();
      _q.setFromUnitVectors(DOWN,_f.applyQuaternion(_qi));A.fa.quaternion.slerp(_q,w)})}
  const P={};for(const k of POSE_KEYS)P[k]=0;P.hd=0;P.stance=1;let hdSide=1,lastT=-1e9,imp=0,gA=0,gPh=0,gK=0;/* gA/gPh : cycle de jambes (course, pédalage) ; gK = 0 course, 1 pédalage */
  /* réception : ressort amorti (compression des jambes, buste qui plonge, petit rebond) + roulis de déséquilibre pour une réception limite */
  const LS={x:0,v:0,w:0,ph:0,q:''};
  function apply(now){const lx=Math.max(0,LS.x),wb=LS.w*Math.sin(LS.ph),k=Math.min(1.25,P.crouch+imp+lx*1.1),kb=k*1.7,br=Math.sin(now*.0026),ls=P.legSpread||0,st=P.stance;
    for(const Lg of legs){Lg.th.rotation.z=kb*.5;Lg.th.rotation.x=-Lg.side*(st*.17+ls*.3);Lg.sh.rotation.z=-kb;Lg.ft.rotation.z=kb*.5;Lg.ft.rotation.x=Lg.side*(st*.17+ls*.3)}
    pelvis.position.y=.86*Math.cos(kb*.5)*Math.cos(st*.17+ls*.3)+.13;pelvis.position.x=-Math.sin(kb*.5)*.1;pelvis.position.z=P.side*.06;
    spine.rotation.z=-(P.lean+lx*.45)*.5;spine.rotation.x=(P.side+wb*.5)*.55;spine.rotation.y=P.twist*.35+P.turn*.15;
    torso.rotation.z=-(P.lean+lx*.35)*.5;torso.rotation.x=(P.side+wb)*.45;torso.rotation.y=P.twist*.65+P.turn*.35+wb*.25;
    chest.scale.y=1+br*.014;
    neck.rotation.z=P.lean*.45+lx*.25;head.rotation.z=P.lean*.3;head.rotation.y=-(P.twist+P.turn*.35)*.5+P.look+P.turn*.5;head.position.y=.08+br*.004;
    for(const A of arms){const sp=P.spread+Math.abs(LS.w)*(.6+.4*Math.sin(LS.ph*1.3+A.side))+lx*.15;A.cl.rotation.x=-A.side*(.05+sp*.12+br*.012);
      A.ua.rotation.x=-A.side*(.22+sp*1.15);A.ua.rotation.z=P.back*1.3-P.reach;A.fa.rotation.z=-(.32+P.back*.45)+P.reach*.4;A.hand.rotation.z=-.2+P.spread*.2}
    /* cycle de marche / course / pédalage : cuisses en opposition, genou plié au retour, bras en balancier (course) */
    if(gA>.01){for(const Lg of legs){const ph=gPh+(Lg.side>0?0:Math.PI),sw=Math.sin(ph);
        if(gK){Lg.th.rotation.z+=gA*(.55+.45*sw);Lg.sh.rotation.z-=gA*(.7+.6*sw);Lg.ft.rotation.z+=gA*.2*sw}
        else{Lg.th.rotation.z+=gA*sw*.95;Lg.sh.rotation.z-=gA*Math.max(0,-Math.cos(ph))*1.5+gA*.2;Lg.ft.rotation.z+=gA*.25*sw}}
      if(!gK)for(const A of arms){const ph=gPh+(A.side>0?Math.PI:0);A.ua.rotation.z+=gA*Math.sin(ph)*.8;A.fa.rotation.z-=gA*.6}}
    if(P.hd>.01){const A=arms[hdSide>0?1:0];A.ua.rotation.x=lerp(A.ua.rotation.x,-A.side*1.25,P.hd);A.ua.rotation.z=lerp(A.ua.rotation.z,-.2,P.hd);A.fa.rotation.z=lerp(A.fa.rotation.z,-.1,P.hd)}
    if(g.ik)ikArms()}
  g.pose=p=>{const now=performance.now(),gap=now-lastT;lastT=now;const dt=Math.min(.1,gap/1000),k=gap>400?1:1-Math.exp(-(g.poseRate||11)*dt);
    if(gap>400){LS.x=LS.v=LS.w=0}else{const n=Math.ceil(dt/.008),h=dt/n;for(let i=0;i<n;i++){LS.v+=(-75*LS.x-12*LS.v)*h;LS.x+=LS.v*h}LS.x=clamp(LS.x,-.15,.95);LS.w*=Math.exp(-2.4*dt);LS.ph+=dt*12}
    for(const key of POSE_KEYS){const tv=p[key]!=null?p[key]:key==='stance'?1:0;P[key]+=(tv-P[key])*k}
    if(p.gA!=null){gA=p.gA;gPh=p.gPh||0;gK=p.gK||0}
    if(p.handDown)hdSide=p.handDown>0?1:-1;P.hd+=((p.handDown?1:0)-P.hd)*k;imp*=gap>400?0:Math.exp(-5*dt);apply(now)};
  g.snapPose=p=>{lastT=-1e9;g.pose(p);lastT=-1e9};
  g.impact=v=>{imp=Math.min(.6,Math.max(imp,v||.3))};
  /* g.land(qualité, intensité 0..1) : parfaite = compression nette et courte ; propre = normale ; limite = forte + déséquilibre */
  g.land=(q,kk)=>{kk=clamp(kk==null?.6:kk,0,1.2);const a={perfect:.85,clean:1,sketchy:1.3}[q]||1;LS.v+=6.6*kk*a;LS.q=q;
    if(q==='sketchy'){LS.w=(Math.random()<.5?-1:1)*(.45+.35*kk);LS.ph=0}};
  g.landState=()=>({x:LS.x,w:LS.w,q:LS.q});
  g.gait=(amp,phase,pedal)=>{gA=amp||0;gPh=phase||0;gK=pedal?1:0};
  g.getPose=()=>{const o={};for(const k of POSE_KEYS)o[k]=P[k];o.handDown=P.hd>.5?hdSide:0;o.gA=gA;o.gPh=gPh;o.gK=gK;return o};
  g.setPose=(name,t,extra)=>{const a=POSES.idle,b=POSES[name]||a,w=t==null?1:clamp(t,0,1),o={};
    for(const k of POSE_KEYS){const av=a[k]!=null?a[k]:k==='stance'?1:0,bv=b[k]!=null?b[k]:k==='stance'?1:0;o[k]=lerp(av,bv,w)}o.handDown=w>.5?b.handDown||0:0;if(extra)Object.assign(o,extra);g.pose(o)};
  g.bones={root:g,pelvis,spine,torso,neck,head,legs:legs.map((l,i)=>{l.th.name='upperLeg'+i;l.sh.name='lowerLeg'+i;l.ft.name='foot'+i;return {upper:l.th,lower:l.sh,foot:l.ft}}),
    arms:arms.map((a,i)=>{a.cl.name='clavicle'+i;a.ua.name='upperArm'+i;a.fa.name='foreArm'+i;a.hand.name='hand'+i;return {clavicle:a.cl,upper:a.ua,fore:a.fa,hand:a.hand}})};
  g.head=head;g.isHuman=true;
  /* modèle Blender skinné (18-glb.js) piloté par ce rig ; procédural si le GLB manque ou si look.proc */
  if(!L.proc&&typeof dressHuman==='function'&&GLB.ready){const D={pelvis,spine,torso,neck,head};arms.forEach((a,i)=>{D['clavicle'+i]=a.cl;D['upperArm'+i]=a.ua;D['foreArm'+i]=a.fa;D['hand'+i]=a.hand});
    legs.forEach((l,i)=>{D['upperLeg'+i]=l.th;D['lowerLeg'+i]=l.sh;D['foot'+i]=l.ft});try{dressHuman(g,L,D)}catch(e){GLB.err='dressHuman: '+e.message}}
  g.snapPose({});return g}

/* ---------- wingsuit (repère : avant = −z, dos = +y) ---------- */
const FLY={sh:[[-.2,0,-.5],[.2,0,-.5]],el:[[-.55,0,-.42],[.55,0,-.42]],wr:[[-.86,0,-.32],[.86,0,-.32]],hp:[[-.11,0,.08],[.11,0,.08]],kn:[[-.24,0,.52],[.24,0,.52]],an:[[-.34,0,.96],[.34,0,.96]]};
const v3=a=>new THREE.Vector3(a[0],a[1],a[2]);
/* points de contact : casque, pieds, poignets, coudes, genoux, ventre (sphères de 10 cm) */
const FLY_HIT=[[0,.04,-.82],FLY.an[0],FLY.an[1],FLY.wr[0],FLY.wr[1],FLY.el[0],FLY.el[1],FLY.kn[0],FLY.kn[1],[0,-.1,-.2]].map(v3);
function limb(a,b,w,h,mat){const len=a.distanceTo(b);const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,len),mat);m.position.copy(a).add(b).multiplyScalar(.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),b.clone().sub(a).normalize());return m}
function buildFlyer(look){
  const L=look,g=new THREE.Group();const hid=(L.gear&&L.gear.helmet)||'full';
  const mBody=new THREE.MeshLambertMaterial({color:L.suit}),mHel=hid==='carbon'?new THREE.MeshPhongMaterial({color:0x22262b,shininess:90,specular:0x8899aa}):new THREE.MeshLambertMaterial({color:L.helmet}),
    mVis=new THREE.MeshLambertMaterial({color:0x111418}),mShoe=new THREE.MeshLambertMaterial({color:0x0e1114}),
    mWing=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide});
  /* même rig que les autres sports, couché à plat ventre : tête vers −z, dos vers +y ; voilure tendue entre les membres */
  const human=buildHuman(L);human.rotation.set(0,0,0);{const m=new THREE.Matrix4().makeBasis(new THREE.Vector3(0,-1,0),new THREE.Vector3(0,0,-1),new THREE.Vector3(1,0,0));human.quaternion.setFromRotationMatrix(m)}
  human.position.set(0,0,.98);human.snapPose(POSES.wingsuit_glide);g.add(human);g.human=human;g.head=human.bones.head;
  const pack=new THREE.Mesh(new THREE.BoxGeometry(.3,.08,.42),new THREE.MeshLambertMaterial({color:L.wing1}));pack.position.set(0,.13,-.2);g.add(pack);
  const P={};for(const k in FLY)P[k]=FLY[k].map(v3);
  const c1=new THREE.Color(L.wing1),c2=new THREE.Color(L.wing2),tmp=new THREE.Color();
  // motif : 0 uni, 1 bras/jambes bicolore, 2 dégradé vers les bouts, 3 rayures
  const colAt=(p,legPart)=>{const pat=L.pattern|0;if(pat===0)return c1;if(pat===1)return legPart?c2:c1;if(pat===2)return tmp.copy(c1).lerp(c2,clamp(Math.abs(p.x)/.9,0,1)).clone();
    return (Math.floor((p.z+1)*6)%2)?c2:c1};
  const pos=[],col=[];const tri=(a,b,c,leg)=>{for(const p of [a,b,c]){pos.push(p.x,p.y,p.z);const cc=colAt(p,leg);col.push(cc.r,cc.g,cc.b)}};
  const th=[new THREE.Vector3(-.2,0,.4),new THREE.Vector3(.2,0,.4)],mid=s=>P.wr[s].clone().lerp(th[s],.5).add(new THREE.Vector3(0,.05,0));
  for(let s=0;s<2;s++){tri(P.sh[s],P.el[s],th[s]);tri(P.el[s],P.wr[s],mid(s));tri(P.el[s],mid(s),th[s])}
  const cr=new THREE.Vector3(0,0,.2);tri(cr,P.kn[0],P.an[0],1);tri(cr,P.an[0],P.an[1],1);tri(cr,P.an[1],P.kn[1],1);tri(cr,P.hp[0],P.kn[0],1);tri(cr,P.kn[1],P.hp[1],1);
  const wg=new THREE.BufferGeometry();wg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));wg.setAttribute('color',new THREE.Float32BufferAttribute(col,3));wg.computeVertexNormals();
  const wmesh=new THREE.Mesh(wg,mWing);g.add(wmesh);g.wing=wmesh;
  return g}

/* ---------- longboard + rider ---------- */
function buildLongboard(look){
  const L=look,b=gearOf('board',L.gear.board),g=new THREE.Group();const len=b.phys.len;
  const deck=new THREE.Mesh(new THREE.BoxGeometry(.25,.035,len),new THREE.MeshLambertMaterial({color:L.deck,map:TEX.wood}));deck.position.y=b.id==='drop105'?.085:.115;g.add(deck);
  const grip=new THREE.Mesh(new THREE.BoxGeometry(.24,.004,len-.08),new THREE.MeshLambertMaterial({color:0x2a2a2a,map:TEX.grip}));grip.position.y=deck.position.y+.019;g.add(grip);
  const tm=new THREE.MeshLambertMaterial({color:0x9aa0a6}),wm=new THREE.MeshLambertMaterial({color:L.wheel});
  for(const z of [-(len/2-.15),len/2-.15]){const tr=new THREE.Mesh(new THREE.BoxGeometry(.22,.05,.06),tm);tr.position.set(0,.075,z);g.add(tr);
    for(const x of [-.13,.13]){const w=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,.05,10),wm);w.rotation.z=Math.PI/2;w.position.set(x,.035,z);g.add(w)}}
  const human=buildHuman(L);human.position.y=deck.position.y+.02;g.add(human);g.human=human;g.len=len;return g}

/* look compact pour le réseau (≤ 300 octets) */
function packLook(L){return {n:String(L.name||'Rider').slice(0,16),s:L.skin,u:L.suit,a:L.accent,h:L.helmet,w1:L.wing1,w2:L.wing2,pt:L.pattern,d:L.deck,wh:L.wheel,b:L.boardCol,bx:L.bmxCol,mc:L.motoCol,g:L.gear,k:L.sk&&{s:L.sk.s||'',h:L.sk.h||''}}}
function unpackLook(k){k=k||{};const num=(v,d)=>Number.isFinite(v)?v>>>0&0xffffff:d;const D=PROFILE_DEFAULT.look;const gr=k.g&&typeof k.g==='object'?k.g:{};
  const gear={};for(const s of Object.keys(GEAR))gear[s]=GEAR[s].some(x=>x.id===gr[s])?gr[s]:D.gear[s];
  return {name:String(k.n||'Rider').slice(0,16),skin:num(k.s,D.skin),suit:num(k.u,D.suit),accent:num(k.a,D.accent),helmet:num(k.h,D.helmet),wing1:num(k.w1,D.wing1),wing2:num(k.w2,D.wing2),
    pattern:clamp(k.pt|0,0,3),deck:num(k.d,D.deck),wheel:num(k.wh,D.wheel),boardCol:num(k.b,D.boardCol),bmxCol:num(k.bx,D.bmxCol),motoCol:num(k.mc,D.motoCol),gear,sk:{s:typeof k.k?.s==='string'&&typeof skinById==='function'&&skinById(k.k.s)?k.k.s:'',h:typeof k.k?.h==='string'&&typeof skinById==='function'&&skinById(k.k.h)?k.k.h:''}}}
