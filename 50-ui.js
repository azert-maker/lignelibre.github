/* =====================================================================
   MENUS · accueil, choix du sport, réglages de partie, garage, boutique,
   classement, réglages, multijoueur
===================================================================== */
const SPORTS={
  wingsuit:{name:'Wingsuit',place:'Vallée des Aiguilles',c:'#8fd3ff',desc:'Proximity flying : rase le relief, enfile les portes.',facts:['135 km/h','finesse 3:1'],
    modes:{course:'Parcours de portes',free:'Vol libre'},len:{opts:[8,12,20],unit:'portes',def:1},yt:'wingsuit proximity flying',
    params:[{k:'width',label:'Largeur de la vallée',opts:['Étroite','Normale','Large'],def:1},{k:'relief',label:'Relief',opts:['Doux','Alpin','Extrême'],def:1},
      {k:'rings',label:'Anneaux',opts:['Peu','Normal','Beaucoup'],def:1,free:true},{k:'trees',label:'Sapins',opts:['Non','Oui'],def:1,bool:true}]},
  longboard:{name:'Downhill',place:'Col des Sept Lacets',c:'#ff9a3c',desc:'Route de col, épingles, notes de virage façon rallye.',facts:['jusqu\'à 130 km/h','slide −0,55 g'],
    modes:{course:'Course chrono',free:'Descente infinie'},len:{opts:[2,3,5],unit:'km',def:1},yt:'downhill skateboarding race',
    params:[{k:'slope',label:'Pente',opts:['Douce','Normale','Raide'],def:1},{k:'turns',label:'Virages',opts:['Fluides','Techniques','Épingles'],def:1},{k:'width',label:'Largeur de route',opts:['Étroite','Normale','Large'],def:1}]},
  snowboard:{name:'Snowboard',place:'Combe des Arêtes',c:'#7fd6ff',desc:'Freeride en poudreuse : carve, saute les bosses, plaque des rotations.',facts:['carving 0,9 g','sauts et 360'],
    modes:{course:'Slalom géant',free:'Freeride'},len:{opts:[8,12,20],unit:'portes',def:1},yt:'snowboard freeride powder pov',
    params:[{k:'slope',label:'Pente',opts:['Douce','Normale','Raide'],def:1},{k:'trees',label:'Sapins',opts:['Peu','Normal','Forêt'],def:1},{k:'bumps',label:'Bosses et sauts',opts:['Aucune','Quelques','Beaucoup'],def:1},{k:'relief',label:'Relief',opts:['Doux','Alpin','Extrême'],def:1}]},
  bmx:{name:'BMX freestyle',place:'Skatepark des Docks',c:'#b26bff',desc:'Ta ligne dans un skatepark fermé : gaps, quarters, spine, rails, box. Tailwhips, barspins, manuals.',facts:['35 km/h','combos ×4'],
    modes:{course:'Ligne chrono',free:'Session jam'},len:{opts:[4,6,8],unit:'portes',def:1},yt:'bmx park run',
    params:[{k:'size',label:'Taille du parc',opts:['Petit','Moyen','Grand'],def:1},{k:'height',label:'Hauteur des modules',opts:['Basse','Moyenne','Haute'],def:1}]},
  motocross:{name:'Motocross',place:'Circuit de la Combe Rouge',c:'#ff6a1f',desc:'Terre, bosses, doubles et berms. Gère l\'assiette en l\'air, whippe, pose les gros sauts.',facts:['jusqu\'à 100 km/h','big airs'],
    modes:{course:'Course sur circuit',free:'Arène freestyle'},len:{opts:[4,6,9],unit:'sections',def:1},yt:'motocross onboard',
    params:[{k:'jumps',label:'Taille des sauts',opts:['Petits','Moyens','Gros'],def:1}]},
  wakeboard:{name:'Wakeboard',place:'Lac des Turquoises',c:'#22d3c5',desc:'Tracté par le bateau : coupe vers le sillage, pop sur la crête, wake to wake, kickers et sliders.',facts:['33 km/h','sillage 75 cm'],noSnow:true,
    modes:{course:'Slalom de bouées',free:'Session au lac'},len:{opts:[8,12,16],unit:'bouées',def:1},yt:'wakeboarding wake to wake',
    params:[{k:'speed',label:'Vitesse du bateau',opts:['29 km/h','33 km/h','37 km/h'],def:1},{k:'wake',label:'Taille du sillage',opts:['Petit','Moyen','Gros'],def:1}]},
  parkour:{name:'Parkour',place:'Toits de Néo-Belleville',c:'#ff3fbf',desc:'Cours sur les toits : sauts entre immeubles, vaults, wallruns sur les panneaux cyan, glissades, roulades.',facts:['30 km/h','flow continu'],
    modes:{course:'Course des toits',free:'Quartier libre'},len:{opts:[3,4,6],unit:'portes',def:1},yt:'parkour rooftop run pov',
    params:[{k:'gaps',label:'Écarts entre toits',opts:['Courts','Moyens','Longs'],def:1},{k:'height',label:'Dénivelé',opts:['Doux','Moyen','Fort'],def:1}]},
};
const SPORT_IDS=Object.keys(SPORTS).filter(k=>MODES[k]);

/* ---------- navigation ---------- */
const SCREENS=['home','play','setup','garage','shop','ranking','settings','multi','lobby','prog'];
let screen='home';const navStack=[];
function go(id,push=true){if(push&&screen!==id)navStack.push(screen);screen=id;SCREENS.forEach(s=>$('#'+s).hidden=s!==id);
  ({home:paintHome,play:paintPlay,setup:paintSetup,garage:paintGarage,shop:paintShop,ranking:paintRanking,prog:paintProg,settings:paintSettings,multi:paintMulti,lobby:paintLobby})[id]();
  state=id==='garage'?'garage':(demo?'demo':'menu');showDemoTag();
  if(id!=='garage')camera.clearViewOffset();
  const f=$('#'+id+' .back, #'+id+' .navbtn');if(f&&!isTouch)f.focus({preventScroll:true})}
function back(){const p=navStack.pop()||'home';go(p,false)}
$$('[data-back]').forEach(b=>b.onclick=back);
$$('[data-go]').forEach(b=>b.onclick=()=>go(b.dataset.go));
function hideMenus(){SCREENS.forEach(s=>$('#'+s).hidden=true)}

/* ---------- accueil ---------- */
function paintHome(){paintHomeEngage();paintSportStrip();const L=profile.look;$('#profileChip').innerHTML=`<span class="av" style="background:${hexCss(L.accent)}"></span><span><b>${esc(L.name)}</b><small>${fmt(profile.coins)} pièces · ${medalCount()} médailles</small></span>`;
  Net.onReady(k=>{$('#netState').textContent=k==='claude'?'salons en direct disponibles':k==='ws'?'serveur connecté':'nécessite Claude ou un serveur'})}
/* bandeau des 7 sports sur l'accueil : accès direct aux réglages de partie */
function paintSportStrip(){const el=$('#sportStrip');if(!el)return;el.innerHTML=SPORT_IDS.map(id=>{const s=SPORTS[id],lv=lvlOf((profile.xp||{})[id]||0).l;return `<button class="sstrip" data-s="${id}" style="--c:${s.c}"><i></i><b>${s.name}</b><small>niv. ${lv}</small></button>`}).join('');
  $$('#sportStrip .sstrip').forEach(b=>b.onclick=()=>{setup=loadSetup(b.dataset.s);go('setup')})}
function medalCount(){let n=0;for(const s in profile.medals){const m=profile.medals[s];n+=(m.g||0)+(m.s||0)+(m.b||0)}return n}

/* ---------- choix du sport ---------- */
let hostMode=false;
let playSel=null,playHover=null;
function paintPlay(){hostMode=false;playSel=playSel||profile.last.sport||'wingsuit';
  $('#playBody').innerHTML=`<p class="note">Choisis un sport : l'aperçu en direct joue derrière (pilote automatique, vrai moteur du jeu).</p><div class="sport-cards">${SPORT_IDS.map(id=>{const s=SPORTS[id],b=profile.records[id+'|free'],sel=id===playSel;
  const lv=lvlOf((profile.xp||{})[id]||0),pct=Math.round(lv.x/lv.need*100);
  return `<div class="scard" role="button" tabindex="0" data-sport="${id}" style="--c:${s.c};${sel?'border-color:var(--c)':''}" aria-pressed="${sel}"><span class="place">${s.place}</span><h3>${s.name}</h3><p>${s.desc}</p><span class="best">${s.facts.join(' · ')}${b?' · record '+fmt(b):''}</span>
    <span class="slv"><b>Niv. ${lv.l}</b><i><em style="width:${pct}%"></em></i></span>
    ${sel?`<span class="row" style="margin-top:6px"><button class="btn small primary" data-pick="${id}" data-mode="course">${s.modes.course}</button><button class="btn small primary" data-pick="${id}" data-mode="free">${s.modes.free}</button><a class="btn small" href="https://www.youtube.com/results?search_query=${encodeURIComponent(s.yt)}" target="_blank" rel="noopener">Vraie vidéo ↗</a></span>`:''}</div>`}).join('')}</div>
  <p class="note">Astuce : le « parcours du jour » est le même pour tout le monde. Compare tes temps avec tes amis.</p>`;
  previewSport(playSel);showDemoTag();
  $$('#playBody .scard').forEach(c=>{const id=c.dataset.sport;
    c.onclick=e=>{if(e.target.closest('a'))return;const pk=e.target.closest('[data-pick]');if(pk){setup=loadSetup(id);if(pk.dataset.mode)setup.mode=pk.dataset.mode;go('setup');return}if(playSel===id&&isTouch){return}playSel=id;paintPlay()};
    c.onkeydown=e=>{if(e.key==='Enter'){setup=loadSetup(id);go('setup')}};
    c.onmouseenter=()=>{if(isTouch)return;clearTimeout(playHover);playHover=setTimeout(()=>{if(screen==='play'&&playSel!==id){playSel=id;paintPlay()}},260)}})}
function showDemoTag(){const t=$('#demoTag');const id=previewId;t.hidden=!(screen==='play'&&id);if(id)t.innerHTML='<i></i>Aperçu en direct · '+SPORTS[id].name}

/* ---------- réglages de partie ---------- */
let setup=null;
function loadSetup(sport){const sp=SPORTS[sport],last=profile.last[sport]||{};const params={};sp.params.forEach(p=>params[p.k]=last.params&&last.params[p.k]!=null?last.params[p.k]:p.def);
  return {sport,mode:last.mode||'course',lenIdx:last.lenIdx??sp.len.def,weather:last.weather||'soleil',wind:last.wind??0,params,seedMode:last.seedMode||'daily',seedTxt:last.seedTxt||'',smoke:!!last.smoke,use:{boost:false,x15:false}}}
function cfgFromSetup(st){const sp=SPORTS[st.sport];const params={};sp.params.forEach(p=>params[p.k]=p.bool?st.params[p.k]===1:st.params[p.k]);
  const seed=st.seedMode==='daily'?dailySeed()+st.sport:st.seedMode==='custom'&&st.seedTxt.trim()?st.seedTxt.trim().slice(0,24):'R'+randCode(6);
  return {sport:st.sport,mode:st.mode,len:sp.len.opts[st.lenIdx],weather:st.weather,wind:st.wind,params,seed,smoke:st.smoke}}
function chipRow(name,opts,cur,dis){return `<div class="chips" data-row="${name}">${opts.map((o,i)=>`<button class="chip" data-v="${i}" aria-pressed="${i===cur}" ${dis&&dis(i)?'disabled':''}>${o}</button>`).join('')}</div>`}
function paintSetup(){const st=setup,sp=SPORTS[st.sport];if(st.weather==='neige'&&sp.noSnow)st.weather='soleil';previewSport(st.sport,st.weather);
  $('#setupTitle').textContent=(hostMode?'Salon · ':'')+sp.name;
  const wk=Object.keys(WEATHER);
  const h=[];
  h.push(`<div class="grp"><span class="lbl">Mode</span>${chipRow('mode',[sp.modes.course,sp.modes.free],st.mode==='course'?0:1)}</div>`);
  if(st.mode==='course')h.push(`<div class="grp"><span class="lbl">Longueur <b>${sp.len.opts[st.lenIdx]} ${sp.len.unit}</b></span>${chipRow('len',sp.len.opts.map(v=>v+' '+sp.len.unit),st.lenIdx)}</div>`);
  h.push(`<div class="grp"><span class="lbl">Météo <b>jamais de pluie</b></span>${chipRow('weather',wk.map(k=>WEATHER[k].label),wk.indexOf(st.weather),i=>wk[i]==='neige'&&!!sp.noSnow)}</div>`);
  h.push(`<div class="grp"><span class="lbl">Vent <b>${WIND[st.wind].v} m/s</b></span>${chipRow('wind',WIND.map(w=>w.label),st.wind)}</div>`);
  sp.params.forEach(p=>{if(p.free&&st.mode==='course')return;h.push(`<div class="grp"><span class="lbl">${p.label}</span>${chipRow('p_'+p.k,p.opts,st.params[p.k])}</div>`)});
  if(st.sport==='wingsuit')h.push(`<div class="grp"><span class="lbl">Fumigènes couleur ${owns('smoke')?'':'<b>à débloquer en boutique</b>'}</span>${chipRow('smoke',['Blancs','Couleur de ta voile'],st.smoke&&owns('smoke')?1:0,i=>i===1&&!owns('smoke'))}</div>`);
  h.push(`<div class="grp"><span class="lbl">Monde</span>${chipRow('seed',['Parcours du jour','Aléatoire','Code'],['daily','random','custom'].indexOf(st.seedMode))}
    ${st.seedMode==='custom'?`<input class="txt" id="seedTxt" maxlength="24" placeholder="ex. teahupoo" value="${esc(st.seedTxt)}">`:''}
    <p class="note">${st.seedMode==='daily'?'Même monde pour tout le monde aujourd\'hui.':st.seedMode==='random'?'Un monde neuf à chaque partie.':'Partage le code pour rejouer exactement le même monde.'}</p></div>`);
  const c=profile.cons;
  h.push(`<div class="grp"><span class="lbl">Bonus <b>${c.boost} départ lancé · ${c.x15} score ×1,5</b></span><div class="chips">
    <button class="chip" data-use="boost" aria-pressed="${st.use.boost}" ${c.boost?'':'disabled'}>Départ lancé +20 %</button>
    <button class="chip" data-use="x15" aria-pressed="${st.use.x15}" ${c.x15&&st.mode==='free'?'':'disabled'}>Score ×1,5 (libre)</button>
    <button class="chip" id="toShop">Obtenir des bonus</button></div></div>`);
  $('#setupBody').innerHTML=h.join('');
  $('#btnLaunch').textContent=hostMode?'Créer le salon':'Lancer';$('#setupNote').textContent=hostMode?'Tes amis rejoindront avec le code du salon.':'';
  $$('#setupBody [data-row]').forEach(row=>row.onclick=e=>{const b=e.target.closest('.chip');if(!b||b.disabled)return;const v=+b.dataset.v,n=row.dataset.row;
    if(n==='mode')st.mode=v?'free':'course';else if(n==='len')st.lenIdx=v;else if(n==='weather'){st.weather=wk[v];previewSport(st.sport,st.weather)}else if(n==='wind')st.wind=v;
    else if(n==='seed')st.seedMode=['daily','random','custom'][v];else if(n==='smoke')st.smoke=v===1;else if(n.startsWith('p_'))st.params[n.slice(2)]=v;paintSetup()});
  $$('#setupBody [data-use]').forEach(b=>b.onclick=()=>{st.use[b.dataset.use]=!st.use[b.dataset.use];paintSetup()});
  const tb=$('#toShop');if(tb)tb.onclick=()=>go('shop');
  const si=$('#seedTxt');if(si)si.oninput=()=>{st.seedTxt=si.value}}
$('#btnLaunch').onclick=()=>{const st=setup;profile.last[st.sport]={mode:st.mode,lenIdx:st.lenIdx,weather:st.weather,wind:st.wind,params:st.params,seedMode:st.seedMode,seedTxt:st.seedTxt,smoke:st.smoke};profile.last.sport=st.sport;saveProfile();
  const cfg=cfgFromSetup(st);if(hostMode){createRoom(cfg);return}
  const use={boost:st.use.boost&&profile.cons.boost>0,x15:st.use.x15&&profile.cons.x15>0&&st.mode==='free'};if(use.boost)profile.cons.boost--;if(use.x15)profile.cons.x15--;st.use={boost:false,x15:false};saveProfile();
  startRun(cfg,{use})};

/* ---------- garage (aperçu 3D) ---------- */
const gScene=new THREE.Scene();gScene.background=new THREE.Color(0x0d141b);gScene.fog=new THREE.Fog(0x0d141b,8,22);
const gCam=new THREE.PerspectiveCamera(38,1,.05,100);
gScene.add(new THREE.HemisphereLight(0xdfeaf5,0x1a2026,.9));const gSun=new THREE.DirectionalLight(0xffffff,.9);gSun.position.set(3,6,4);gScene.add(gSun);
const gRim=new THREE.DirectionalLight(0x8fd3ff,.5);gRim.position.set(-4,3,-5);gScene.add(gRim);
{const plat=new THREE.Mesh(new THREE.CylinderGeometry(2.3,2.5,.16,48),new THREE.MeshLambertMaterial({color:0x1c252e}));plat.position.y=-.08;gScene.add(plat);
 const ring=new THREE.Mesh(new THREE.TorusGeometry(2.38,.025,6,64),new THREE.MeshBasicMaterial({color:0x8fd3ff}));ring.rotation.x=Math.PI/2;ring.position.y=.01;gScene.add(ring);gScene.userData.ring=ring;
 const floor=new THREE.Mesh(new THREE.CircleGeometry(30,32),new THREE.MeshLambertMaterial({color:0x111a22}));floor.rotation.x=-Math.PI/2;floor.position.y=-.17;gScene.add(floor)}
let gObj=null,gTab='corps',gRot=-1.05,gDrag=null,gAuto=true;
function garageObj(){if(gObj){gScene.remove(gObj);disposeTree(gObj)}const L=profile.look;let o,ty=1,d=4.4;
  /* Garage : aperçu temps réel, le perso « respire » et bouge légèrement (idle) avec les pièces équipées */
  let hu=null,ps=null;
  if(gTab==='corps'){o=buildHuman(L);hu=o;ps={crouch:.15,spread:.25,twist:.2,look:.2};ty=.95;d=4.4}
  else if(gTab==='equip'){o=new THREE.Group();const f=buildFlyer(L);f.rotation.x=1.05;f.position.y=1.1;f.scale.setScalar(1.25);o.add(f);o.userData.fly=f;ty=1.1;d=4.8}
  else if(gTab==='board'||gTab==='teintes'){o=buildLongboard(L);hu=o.human;ps={crouch:.55,lean:.6,twist:.8,back:.4};ty=.8;d=4.6}
  else if(gTab==='velo'){o=buildBmx(L);hu=o.human;ps={crouch:.35,lean:.55,back:.85,spread:.12,stance:0};ty=.75;d=4.2}
  else if(gTab==='moto'){o=buildMoto(L);hu=o.human;ps={crouch:.45,lean:.6,back:.9,spread:.18,stance:0};ty=.95;d=5.6}
  else if(gTab==='wake'){o=buildWake(L);hu=o.human;ps={crouch:.4,lean:-.15,twist:1.15,back:.85,spread:.15,side:.35};ty=.85;d=4.4}
  else if(gTab==='pk'){o=buildHuman(L);hu=o;ps={crouch:.25,lean:.35,spread:.15,stance:0};ty=.95;d=4.2}
  else if(gTab==='skins'){o=buildHuman(L);hu=o;ps={crouch:.12,spread:.3,twist:.15,look:.15};ty=1.05;d=3.9}
  else if(gTab==='claw'){o=(GLB.models.claw&&clawBuild())||null;
    if(!o){o=new THREE.Group();glbLoad('claw').then(gl=>{if(gl&&gTab==='claw'&&state==='garage'){garageObj();paintClawPanel()}})}ty=1.3;d=3.7}
  if(hu){hu.snapPose?hu.snapPose(ps):hu.pose(ps)}o.userData.hu=hu;o.userData.ps=ps;
  gObj=o;gScene.add(o);gScene.userData.ring.material.color.set(getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()||'#8fd3ff');
  gCam.userData={ty,d,cy:gTab==='claw'?2.85:undefined}}
function garageFrame(dt){if(!gObj)return;if(gAuto&&!gDrag)gRot+=dt*.35;gObj.rotation.y=gTab==='equip'?Math.sin(gRot)*.7:gTab==='claw'?0:gRot;
  if(gTab==='claw'&&typeof clawFrame==='function'&&CL.g&&gObj===CL.g.root)clawFrame(dt);
  const u=gObj.userData,tn=performance.now()/1000;if(u.hu&&u.ps){const p=Object.assign({},u.ps);p.look=(p.look||0)+Math.sin(tn*.7)*.25;p.crouch+=Math.sin(tn*1.3)*.03;p.lean=(p.lean||0)+Math.sin(tn*.9)*.04;p.side=Math.sin(tn*.6)*.07;p.spread=(p.spread||0)+Math.max(0,Math.sin(tn*.45))*.15;u.hu.pose(p)}
  if(u.fly&&u.fly.wing)u.fly.wing.scale.y=1+Math.sin(tn*9)*.12;const {ty,d,cy}=gCam.userData;gCam.position.set(0,cy??ty+.7,d);gCam.lookAt(0,ty,0);
  const w=innerWidth,h=innerHeight;gCam.aspect=w/h;if(w>700){gCam.setViewOffset(w,h,-Math.min(580,w)/2,0,w,h)}else{gCam.setViewOffset(w,h,0,h*.29,w,h)}gCam.updateProjectionMatrix()}
renderer.domElement.addEventListener('pointerdown',e=>{if(state!=='garage')return;gDrag={x:e.clientX,r:gRot};gAuto=false});
addEventListener('pointermove',e=>{if(gDrag)gRot=gDrag.r+(e.clientX-gDrag.x)*.01});addEventListener('pointerup',()=>{gDrag=null});
const GTABS=[['skins','Skins'],['claw','Machine'],['corps','Corps'],['equip','Wingsuit'],['board','Downhill'],['velo','BMX'],['moto','Moto'],['wake','Wake'],['pk','Parkour'],['teintes','Teintes']];
function statBars(st){return st?`<div class="stbars">${Object.entries(st).map(([k,v])=>`<div class="stb"><span>${k}</span><i style="--v:${Math.round(v*100)}%"></i></div>`).join('')}</div>`:''}
function itemList(slot){const cur=profile.look.gear[slot];return `<div class="items">${GEAR[slot].map(g=>{const un=gearUnlocked(slot,g.id),it=SHOP.find(s=>s.id===g.id);
  return `<button class="item" data-slot="${slot}" data-id="${g.id}" aria-pressed="${cur===g.id}"><h4>${g.name}</h4><span class="tagr ${un?'':'lock'}">${un?(cur===g.id?'équipé':'disponible'):('🔒 '+it.ads+' pub'+(it.ads>1?'s':'')+' ou '+fmt(it.price)+' pièces'+(LVL_UNLOCK[g.id]?' ou '+lvlLabel(g.id):''))}</span><p>${g.desc}</p>${statBars(g.st)}</button>`}).join('')}</div>`}
function swatches(key,list){const cur=profile.look[key];const all=list.concat(owns('neon')?NEON:[]);
  return `<div class="swatches" data-key="${key}">${all.map(c=>`<button class="sw" style="background:${hexCss(c)}" data-c="${c}" aria-pressed="${c===cur}" aria-label="Couleur ${hexCss(c)}"></button>`).join('')}${owns('neon')?'':NEON.map(c=>`<button class="sw lock" style="background:${hexCss(c)}" data-lock="neon" aria-label="Néon à débloquer"></button>`).join('')}</div>`}
function paintGarage(){$('#garageTabs').innerHTML=GTABS.map(([k,l])=>`<button class="tab" role="tab" data-t="${k}" aria-selected="${gTab===k}">${l}</button>`).join('');
  $$('#garageTabs .tab').forEach(b=>b.onclick=()=>{gTab=b.dataset.t;paintGarage()});
  const L=profile.look;let h='';
  if(gTab==='skins')h=skinsPanelHtml();
  else if(gTab==='claw')h='<p class="note">Chargement de la machine…</p>';
  else if(gTab==='corps')h=`<div class="grp"><span class="lbl">Pseudo</span><input class="txt" id="gName" maxlength="16" value="${esc(L.name)}"></div>
    <div class="grp"><span class="lbl">Peau</span>${swatches('skin',SKINS).replace(/<button class="sw lock[^>]*><\/button>/g,'')}</div>
    <div class="grp"><span class="lbl">Casque</span>${itemList('helmet')}</div>`;
  else if(gTab==='equip')h=`<div class="grp"><span class="lbl">Voilure wingsuit</span>${itemList('wing')}</div><div class="grp"><span class="lbl">Motif</span>${chipRow('pattern',['Uni','Bras / jambes','Dégradé','Rayures'],L.pattern)}</div>`;
  else if(gTab==='board')h=`<div class="grp"><span class="lbl">Planche <b>downhill</b></span>${itemList('board')}</div><div class="grp"><span class="lbl">Roues</span>${itemList('wheel')}</div>`;
  else if(gTab==='velo')h=`<div class="grp"><span class="lbl">Cadre BMX <b>change la physique</b></span>${itemList('bmx')}</div><div class="grp"><span class="lbl">Couleur du cadre <b>cosmétique</b></span>${swatches('bmxCol',PALETTE)}</div><div class="grp"><span class="lbl">Jantes</span>${swatches('wheel',PALETTE)}</div>`;
  else if(gTab==='moto')h=`<div class="grp"><span class="lbl">Moto <b>change la physique</b></span>${itemList('moto')}</div><div class="grp"><span class="lbl">Plastiques <b>cosmétique</b></span>${swatches('motoCol',PALETTE)}</div>`;
  else if(gTab==='wake')h=`<div class="grp"><span class="lbl">Wakeboard <b>change la physique</b></span>${itemList('wboard')}</div><div class="grp"><span class="lbl">Couleur de la planche <b>cosmétique</b></span>${swatches('boardCol',PALETTE)}</div>`;
  else if(gTab==='pk')h=`<div class="grp"><span class="lbl">Chaussures <b>vitesse et détente</b></span>${itemList('shoe')}</div><p class="note">La couleur des chaussures suit le modèle choisi. Tenue et casque : onglets Corps et Teintes.</p>`;
  else h=`<div class="grp"><span class="lbl">Combinaison</span>${swatches('suit',PALETTE)}</div><div class="grp"><span class="lbl">Haut / accent</span>${swatches('accent',PALETTE)}</div>
    <div class="grp"><span class="lbl">Casque</span>${swatches('helmet',PALETTE)}</div>
    <div class="grp"><span class="lbl">Wingsuit principale</span>${swatches('wing1',PALETTE)}</div><div class="grp"><span class="lbl">Wingsuit secondaire</span>${swatches('wing2',PALETTE)}</div>
    <div class="grp"><span class="lbl">Deck <b>aussi le snowboard</b></span>${swatches('deck',PALETTE)}</div><div class="grp"><span class="lbl">Roues <b>aussi les jantes BMX</b></span>${swatches('wheel',PALETTE)}</div>
    <div class="grp"><span class="lbl">Cadre BMX</span>${swatches('bmxCol',PALETTE)}</div><div class="grp"><span class="lbl">Plastiques moto</span>${swatches('motoCol',PALETTE)}</div><div class="grp"><span class="lbl">Wakeboard</span>${swatches('boardCol',PALETTE)}</div>`;
  $('#garageBody').innerHTML=h;
  const n=$('#gName');if(n)n.oninput=()=>{L.name=n.value.replace(/[\u0000-\u001f]/g,'').slice(0,16)||'Rider';saveProfile()};
  $$('#garageBody .swatches').forEach(w=>w.onclick=e=>{const b=e.target.closest('.sw');if(!b)return;if(b.dataset.lock){offerUnlock('neon');return}L[w.dataset.key]=+b.dataset.c;saveProfile();paintGarage()});
  $$('#garageBody .item').forEach(b=>b.onclick=()=>{const {slot,id}=b.dataset;if(!gearUnlocked(slot,id)){offerUnlock(id);return}L.gear[slot]=id;saveProfile();paintGarage()});
  const pr=$('#garageBody [data-row="pattern"]');if(pr)pr.onclick=e=>{const b=e.target.closest('.chip');if(!b)return;L.pattern=+b.dataset.v;saveProfile();paintGarage()};
  if(gTab==='skins')bindSkinsPanel();
  if(gTab==='claw'&&CL.st!=='idle'){/* partie en cours : on garde la machine */paintClawPanel();return}
  garageObj();if(gTab==='claw')paintClawPanel()}
async function offerUnlock(id){go('shop');setTimeout(()=>{const el=$('#shop [data-shop="'+id+'"]');if(el){el.scrollIntoView({block:'center'});el.style.outline='2px solid var(--gold)';setTimeout(()=>el.style.outline='',1600)}},50)}

/* ---------- boutique : pièces ou pubs ---------- */
function paintShop(){const groups=['Équipement','Consommable','Cosmétique'];
  $('#shopBody').innerHTML=`<div class="row" style="justify-content:space-between"><span class="lbl">Tes pièces <b>${fmt(profile.coins)}</b></span><span class="note">Gagne des pièces à chaque partie, ou regarde des pubs.</span></div>`+
  (typeof clawShopCard==='function'?clawShopCard():'')+
  groups.map(gk=>`<div class="grp"><span class="lbl">${gk}s</span><div class="items">${SHOP.filter(s=>s.kind===gk).map(it=>{const got=!it.cons&&owns(it.id),p=profile.adp[it.id]||0;
    return `<div class="shopcard" data-shop="${it.id}"><span class="kind">${it.kind}${it.cons?' · '+(profile.cons[it.id]||0)+' en stock':''}</span><span></span><h4>${it.name}</h4>${got?'<span class="owned">débloqué</span>':'<span></span>'}<p>${it.effect}${!got&&LVL_UNLOCK[it.id]?'<br><small class="note">Gratuit au '+lvlLabel(it.id)+'</small>':''}</p>
    ${got?'':`<div class="adprog"><span class="dots">${Array.from({length:it.ads},(_,i)=>`<i class="${i<p?'on':''}"></i>`).join('')}</span><span class="note">${p}/${it.ads} pub${it.ads>1?'s':''}</span></div>
    <div class="row" style="grid-column:1/-1"><button class="btn small primary" data-ad="${it.id}" ${Ads.available()?'':'disabled'}>Regarder une pub</button><button class="btn small" data-buy="${it.id}" ${profile.coins>=it.price?'':'disabled'}>${fmt(it.price)} pièces</button></div>`}</div>`}).join('')}</div></div>`).join('')+
  (Ads.available()?'':'<p class="note">Les pubs de démonstration sont désactivées dans les réglages.</p>');
  $$('#shopBody [data-ad]').forEach(b=>b.onclick=async()=>{const it=SHOP.find(s=>s.id===b.dataset.ad);b.disabled=true;const ok=await Ads.rewarded('Boutique · '+it.name);
    if(ok){profile.adp[it.id]=(profile.adp[it.id]||0)+1;if(profile.adp[it.id]>=it.ads){grant(it);profile.adp[it.id]=0}saveProfile()}paintShop()});
  {const oc=$('#openClaw');if(oc)oc.onclick=()=>clawModalOpen()}
  $$('#shopBody [data-buy]').forEach(b=>b.onclick=()=>{const it=SHOP.find(s=>s.id===b.dataset.buy);if(profile.coins<it.price)return;profile.coins-=it.price;grant(it);saveProfile();paintShop()})}
function grant(it){if(it.cons){profile.cons[it.id]=(profile.cons[it.id]||0)+1;toastMenu(it.name+' +1')}else{profile.owned[it.id]=true;if(it.slot)profile.look.gear[it.slot]=it.id;toastMenu(it.name+' débloqué')}}
function toastMenu(t){const d=document.createElement('div');d.className='fi';d.textContent=t;Object.assign(d.style,{position:'fixed',right:'16px',top:'16px',zIndex:60});document.body.appendChild(d);setTimeout(()=>d.remove(),2200)}

/* ---------- classement ---------- */
let rTab='wingsuit';
function medalOf(t,target){if(!target)return 'n';return t<=target?'g':t<=target*1.15?'s':t<=target*1.3?'b':'n'}
function paintRanking(){$('#rankTabs').innerHTML=SPORT_IDS.map(k=>`<button class="tab" role="tab" data-t="${k}" aria-selected="${rTab===k}">${SPORTS[k].name}</button>`).join('');
  $$('#rankTabs .tab').forEach(b=>b.onclick=()=>{rTab=b.dataset.t;paintRanking()});
  const m=profile.medals[rTab]||{},free=profile.records[rTab+'|free']||0;
  const hist=profile.history.filter(h=>h.sport===rTab).slice(0,12);
  let h=`<div class="grp"><span class="lbl">Tes records</span>
    <div class="stat-line"><span>Meilleur score en libre</span><b>${free?fmt(free):'—'}</b></div>
    <div class="stat-line"><span>Médailles</span><b><span class="medal g"></span>${m.g||0} &nbsp;<span class="medal s"></span>${m.s||0} &nbsp;<span class="medal b"></span>${m.b||0}</b></div></div>
    <div class="grp"><span class="lbl">Dernières parties</span>${hist.length?`<table class="rtable"><thead><tr><th>Mode</th><th>Monde</th><th>Résultat</th></tr></thead><tbody>${hist.map(x=>`<tr><td>${x.mode==='course'?'<span class="medal '+x.medal+'"></span>Parcours':'Libre'}</td><td>${esc(x.seed.slice(0,14))}</td><td>${x.mode==='course'?(x.dnf?'abandon':fmtT2(x.time)):fmt(x.score)}</td></tr>`).join('')}</tbody></table>`:'<p class="note">Aucune partie pour l\'instant.</p>'}</div>
    <div class="grp"><span class="lbl">Classement en ligne</span><div id="globalBoard"><p class="note">Chargement…</p></div></div>`;
  $('#rankBody').innerHTML=h;Board.render(rTab,$('#globalBoard'))}
const Board=(()=>{let db=null,uid=null,tried=false;
  async function init(){if(tried)return;tried=true;try{if(!window.claude||!claude.use)return;const [d,u]=await Promise.all([claude.use('db'),claude.use('user')]);if(!d||!u)return;uid=await u.id();if(uid)db=d}catch(e){db=null}}
  return {async submit(sport,score){await init();if(!db||!uid)return;try{const ref=db.doc('scores/'+uid);const s=await ref.get();const cur=s.exists?s.data():{};
      if((cur[sport]||0)>=score&&cur.n===profile.look.name)return;await ref.set(Object.assign({},cur,{n:profile.look.name,[sport]:Math.max(score,cur[sport]||0),at:Date.now()}))}catch(e){}},
    async render(sport,el){await init();if(!el)return;if(!db){const loc=profile.history.filter(h=>h.sport===sport&&h.mode==='free').sort((a,b)=>b.score-a.score).slice(0,10);
        el.innerHTML='<p class="note">Classement partagé disponible quand le jeu est ouvert dans Claude. Voici ton top local sur cet appareil.</p>'+(loc.length?`<table class="rtable"><thead><tr><th>#</th><th>Monde</th><th>Score</th></tr></thead><tbody>${loc.map((r,i)=>`<tr><td>${i+1}</td><td>${esc(r.seed.slice(0,14))}</td><td>${fmt(r.score)}</td></tr>`).join('')}</tbody></table>`:'');return}
      try{const q=await db.collection('scores').orderBy(sport,'desc').limit(20).get();const rows=q.docs.map(d=>({id:d.id,...d.data()})).filter(r=>r[sport]>0);
        el.innerHTML=rows.length?`<table class="rtable"><thead><tr><th>#</th><th>Joueur</th><th>Meilleur score</th></tr></thead><tbody>${rows.map((r,i)=>`<tr class="${r.id===uid?'me':''}"><td>${i+1}</td><td>${esc(String(r.n||'Rider').slice(0,16))}</td><td>${fmt(r[sport])}</td></tr>`).join('')}</tbody></table>`:'<p class="note">Personne encore. Sois le premier.</p>'}
      catch(e){el.innerHTML='<p class="note">Classement indisponible pour le moment.</p>'}}}})();

/* ---------- réglages ---------- */
let resetArm=false;
function paintSettings(){const s=S();
  $('#settingsBody').innerHTML=`
  <div class="grp"><span class="lbl">Graphismes</span>${chipRow('quality',['Éco (vieux PC)','Normal','Élevé (ombres)'],['eco','normal','high'].indexOf(s.quality))}</div>
  <div class="grp"><span class="lbl">Volume général <b>${Math.round(s.vol*100)} %</b></span><input type="range" id="setVol" min="0" max="1" step="0.05" value="${s.vol}"></div>
  <div class="grp"><span class="lbl">Effets sonores <b>${Math.round((s.sfxVol??1)*100)} %</b></span><input type="range" id="setSfx" min="0" max="1" step="0.05" value="${s.sfxVol??1}"></div>
  <div class="grp"><span class="lbl">Musique <b>${Math.round((s.musicVol??1)*100)} %</b></span><input type="range" id="setMus" min="0" max="1" step="0.05" value="${s.musicVol??1}"></div>
  <div class="grp"><span class="lbl">Secousses de caméra</span>${chipRow('shake',['Aucune','Réduites','Normales'],[0,.5,1].indexOf(s.shake??1))}</div>
  <div class="grp"><span class="lbl">Flashs d'écran <b>frôlements, overdrive</b></span>${chipRow('flash',['Non','Oui'],s.flash===false?0:1)}</div>
  <div class="grp"><span class="lbl">Wingsuit</span>${chipRow('invert',['↑ = plonger','↑ = cabrer (avion)'],s.invert?1:0)}</div>
  <div class="grp"><span class="lbl">Caméra par défaut</span>${chipRow('cam',['Poursuite','Casque','Drone'],s.cam)}</div>
  <div class="grp"><span class="lbl">Qualité auto <b>passe en Éco si &lt; 40 i/s</b></span>${chipRow('autoQ',['Non','Oui'],s.autoQ!==false?1:0)}</div>
  <div class="grp"><span class="lbl">Figures (tous les sports) <b>assisté = fin de rotation et réception aidées</b></span>${chipRow('sbAssist',['Pro','Assisté'],s.sbAssist!==false?1:0)}</div>
  <div class="grp"><span class="lbl">Vitesse de rotation en l'air</span>${chipRow('spinSens',['Lente','Normale','Rapide'],[.8,1,1.25].indexOf(s.spinSens||1))}</div>
  <div class="grp"><span class="lbl">Astuces en jeu <b>2 premières parties de chaque sport</b></span>${chipRow('tips',['Non','Oui'],s.tips===false?0:1)}</div>
  <div class="grp"><span class="lbl">Ralentis sur les moments forts</span>${chipRow('slowmo',['Non','Oui'],s.slowmo===false?0:1)}</div>
  <div class="grp"><span class="lbl">Fantôme de ton record</span>${chipRow('ghost',['Non','Oui'],s.ghost!==false?1:0)}</div>
  <div class="grp"><span class="lbl">Musique (menus, discrète en course)</span>${chipRow('music',['Non','Oui'],s.music!==false?1:0)}</div>
  <div class="grp"><span class="lbl">Vibrations (mobile)</span>${chipRow('haptics',['Non','Oui'],s.haptics?1:0)}</div>
  <div class="grp"><span class="lbl">Pubs de démonstration</span>${chipRow('ads',['Désactivées','Activées'],s.adsDemo?1:0)}
    <p class="note">Régie actuelle : <b>${ADS_CONFIG.provider}</b>. Pour brancher une vraie régie, change <code>ADS_CONFIG.provider</code> en haut du script publicités.</p></div>
  <div class="grp"><span class="lbl">Commandes</span><div class="ctl-list">
    <kbd>← → ↑ ↓</kbd><span>diriger (ou WASD / ZQSD)</span><kbd>Espace</kbd><span>action du sport : saut, pop, slide…</span><kbd>Shift / F</kbd><span>figure ou grab (selon le sport)</span><kbd>C</kbd><span>changer de caméra</span><kbd>Q / E · V</kbd><span>regarder autour · derrière</span><kbd>R</kbd><span>rejouer</span><kbd>Échap</kbd><span>pause / retour</span><kbd>M</kbd><span>couper le son</span>
    <kbd>Manette</kbd><span>stick gauche, A = action, LT/RT = figure, stick droit = regarder, Y = caméra, X = rejouer, Start = pause</span></div><p class="note">Les commandes de chaque sport sont affichées en jeu (en bas à gauche) et dans le menu Pause.</p></div>
  ${paintAccountBlock()}
  <div class="grp"><span class="lbl">Données</span><div class="row"><button class="btn small" id="setReset">${resetArm?'Confirmer : tout effacer':'Réinitialiser la progression'}</button></div></div>`;
  $$('#settingsBody [data-row]').forEach(row=>row.onclick=e=>{const b=e.target.closest('.chip');if(!b)return;const v=+b.dataset.v,n=row.dataset.row;
    if(n==='quality'){s.quality=['eco','normal','high'][v];resize();if(state==='menu')previewSport(previewId,previewW,true)}else if(n==='invert')s.invert=v===1;else if(n==='cam'){s.cam=v;setCam(v)}else if(n==='haptics')s.haptics=v===1;else if(n==='music')s.music=v===1;else if(n==='ghost')s.ghost=v===1;else if(n==='sbAssist')s.sbAssist=v===1;else if(n==='spinSens')s.spinSens=[.8,1,1.25][v];else if(n==='autoQ'){s.autoQ=v===1;AQ.done=false}else if(n==='ads')s.adsDemo=v===1;else if(n==='shake')s.shake=[0,.5,1][v];else if(n==='tips')s.tips=v===1;else if(n==='slowmo')s.slowmo=v===1;else if(n==='flash')s.flash=v===1;
    saveProfile();paintSettings()});
  const vol=$('#setVol');vol.oninput=()=>{setVolume(+vol.value);vol.previousElementSibling.querySelector('b').textContent=Math.round(vol.value*100)+' %'};
  for(const [id,k] of [['#setSfx','sfxVol'],['#setMus','musicVol']]){const r=$(id);r.oninput=()=>{s[k]=+r.value;saveProfile();r.previousElementSibling.querySelector('b').textContent=Math.round(r.value*100)+' %'}}
  bindAccountBlock(paintSettings);
  $('#setReset').onclick=()=>{if(!resetArm){resetArm=true;paintSettings();setTimeout(()=>{resetArm=false;if(screen==='settings')paintSettings()},4000);return}
    profileFrozen=true;try{localStorage.removeItem(PROFILE_KEY)}catch(e){}location.reload()}}

/* ---------- multijoueur ---------- */
let roomCfg=null,isHost=false,myReady=false,lastGo=0,openGames=[],roomPeers=[],hostSeen=false;
Net.onLobby(list=>{openGames=list.filter(p=>!p.me&&p.st&&p.st.g&&p.st.g.c).map(p=>p.st.g);if(screen==='multi')paintMultiGames()});
Net.onRoom(list=>{roomPeers=list;onRoomPeers()});
function paintMulti(){const k=Net.kind;
  $('#multiBody').innerHTML=`<div class="grp"><span class="lbl">Potes sur ce réseau (local) <b>${k==='ws'?'connecté':'non connecté'}</b></span>
    <p class="note">Même Wi-Fi : un PC lance <code>node server.js</code>, les autres saisissent son adresse ci-dessous (ex. ws://192.168.1.23:8080).</p>
    <div class="row"><input class="txt" id="mWs" placeholder="ws://192.168.1.23:8080" value="${esc(load('ll3_ws','')||S().wsUrl||'')}" style="max-width:260px"><button class="btn small" id="mWsGo">Se connecter</button></div>
    <p class="note" id="mWsMsg">${Net.error?esc(Net.error):''}</p></div>
  <div class="grp"><span class="lbl">Ton pseudo</span><input class="txt" id="mName" maxlength="16" value="${esc(profile.look.name)}"></div>
  ${k?`<div class="grp"><span class="lbl">Créer</span><p class="note">Choisis le sport, le parcours et la météo : tout le salon jouera le même monde.</p><div class="row"><button class="btn primary" id="mCreate">Créer un salon</button></div></div>
  <div class="grp"><span class="lbl">Rejoindre avec un code</span><div class="row"><input class="txt" id="mCode" maxlength="5" placeholder="ex. k7m2p" style="max-width:160px;text-transform:lowercase"><button class="btn" id="mJoin">Rejoindre</button></div></div>
  <div class="grp"><span class="lbl">Salons ouverts</span><div class="glist" id="mGames"></div></div>`:
  `<p class="note">Le multijoueur en direct fonctionne quand le jeu est ouvert dans Claude et partagé avec tes amis (ils doivent pouvoir ouvrir l'artifact), ou avec ton propre serveur WebSocket (fichier <code>server.js</code>, renseigne <code>NET_CONFIG.wsUrl</code>).</p>
   <p class="note">État : ${Net.kind===null?'aucune connexion détectée':'connexion…'}</p>`}`;
  const n=$('#mName');n.oninput=()=>{profile.look.name=n.value.replace(/[\u0000-\u001f]/g,'').slice(0,16)||'Rider';saveProfile()};
  $('#mWsGo').onclick=()=>{const u=$('#mWs').value.trim();const m=$('#mWsMsg');m.textContent='Connexion…';S().wsUrl=u;saveProfile();save('ll3_ws',u);
    Net.connect(u,(ok,err)=>{if(screen!=='multi')return;if(ok){paintMulti();toastMenu('Connecté au serveur local')}else{const mm=$('#mWsMsg');if(mm)mm.textContent=err}})};
  const c=$('#mCreate');if(c)c.onclick=()=>{hostMode=true;setup=loadSetup(profile.last.sport||'longboard');go('setup')};
  const j=$('#mJoin');if(j)j.onclick=()=>{const code=$('#mCode').value.trim().toLowerCase().replace(/[^a-z0-9]/g,'');if(code.length>=4)joinRoom(code)};
  paintMultiGames()}
function paintMultiGames(){const el=$('#mGames');if(!el)return;el.innerHTML=openGames.length?openGames.map(g=>`<button class="gitem" data-code="${esc(String(g.c).slice(0,8))}"><span><b>${esc(String(g.n||'Salon').slice(0,16))}</b><br><small>${esc((SPORTS[g.s]||{}).name||'')} · ${g.m==='course'?'parcours':'libre'}</small></span><small>${esc(String(g.c).slice(0,8))} →</small></button>`).join(''):'<p class="note">Aucun salon ouvert pour l\'instant.</p>';
  $$('#mGames .gitem').forEach(b=>b.onclick=()=>joinRoom(b.dataset.code))}
async function createRoom(cfg){const code=randCode(5);roomCfg=cfg;isHost=true;myReady=true;await Net.join(code);
  Net.lobbyPresence({g:{c:code,s:cfg.sport,m:cfg.mode,n:profile.look.name}});pushLobbyState();go('lobby')}
async function joinRoom(code){roomCfg=null;isHost=false;myReady=false;lastGo=0;hostSeen=false;const ok=await Net.join(code);if(!ok){toastMenu('Connexion impossible');return}pushLobbyState();go('lobby')}
function pushLobbyState(){Net.state({n:profile.look.name,k:packLook(profile.look),host:isHost?1:0,cfg:isHost?roomCfg:null,rd:myReady?1:0,st:'lobby',go:isHost?lastGo:0})}
function hostPeer(){return roomPeers.find(p=>p.st&&p.st.host)}
function onRoomPeers(){const h=hostPeer();
  if(!isHost&&h&&h.st.cfg){roomCfg=sanitizeCfg(h.st.cfg);if(!hostSeen){hostSeen=true;lastGo=h.st.go||0}else if(h.st.go&&h.st.go!==lastGo){lastGo=h.st.go;if(state==='menu'||state==='demo'||state==='over'||state==='garage')startRun(roomCfg,{multi:true});}}
  if(screen==='lobby')paintLobby();if(state==='play'||state==='count'||state==='over')syncGhosts()}
function sanitizeCfg(c){const sp=SPORTS[c.sport]?c.sport:'longboard';const S_=SPORTS[sp];const params={};S_.params.forEach(p=>{const v=c.params&&c.params[p.k];params[p.k]=p.bool?v!==false:clamp(v|0,0,p.opts.length-1)});
  return {sport:sp,mode:c.mode==='free'?'free':'course',len:S_.len.opts.includes(c.len)?c.len:S_.len.opts[1],weather:WEATHER[c.weather]&&!(c.weather==='neige'&&S_.noSnow)?c.weather:'soleil',wind:clamp(c.wind|0,0,3),params,seed:String(c.seed||'salon').slice(0,24),smoke:false}}
function paintLobby(){const code=Net.code||'—',cfg=roomCfg;const sp=cfg&&SPORTS[cfg.sport];
  $('#lobbyBody').innerHTML=`<div class="grp"><span class="lbl">Code du salon</span><div class="code">${esc(code)}</div><p class="note">Donne ce code à tes amis : ils le saisissent dans Multijoueur.</p></div>
  <div class="grp"><span class="lbl">Partie</span>${cfg?`<div class="stat-line"><span>Sport</span><b>${sp.name}</b></div><div class="stat-line"><span>Mode</span><b>${sp.modes[cfg.mode]}${cfg.mode==='course'?' · '+cfg.len+' '+sp.len.unit:''}</b></div>
    <div class="stat-line"><span>Météo / vent</span><b>${WEATHER[cfg.weather].label} · ${WIND[cfg.wind].label}</b></div><div class="stat-line"><span>Monde</span><b>${esc(cfg.seed)}</b></div>`:'<p class="note">En attente de l\'hôte…</p>'}</div>
  <div class="grp"><span class="lbl">Joueurs <b>${roomPeers.length}</b></span><div class="plist">${roomPeers.map(p=>{const lk=p.st.k||{};
    return `<div class="pl"><span class="av" style="background:${hexCss((lk.a>>>0)&0xffffff)}"></span><b>${esc(String(p.st.n||'Rider').slice(0,16))}${p.me?' (toi)':''}</b><small>${p.st.host?'hôte · ':''}<span class="${p.st.rd?'ok':''}">${p.st.rd?'prêt':'pas prêt'}</span></small></div>`}).join('')}</div></div>`;
  const b=$('#btnLobbyGo');if(isHost){const others=roomPeers.filter(p=>!p.me);b.textContent='Lancer la course';b.disabled=false;$('#lobbyNote').textContent=others.length?(others.every(p=>p.st.rd)?'Tout le monde est prêt.':'Certains ne sont pas prêts.'):'Tu peux lancer seul ou attendre tes amis.'}
  else{b.textContent=myReady?'Pas prêt':'Prêt';b.disabled=!cfg;$('#lobbyNote').textContent='L\'hôte lance la course.'}}
$('#btnLobbyGo').onclick=()=>{if(isHost){lastGo=Date.now();pushLobbyState();startRun(roomCfg,{multi:true})}else{myReady=!myReady;pushLobbyState();paintLobby()}};
$('#lobbyBack').onclick=async()=>{await Net.leave();if(isHost)Net.lobbyPresence({g:null});isHost=false;roomCfg=null;go('multi',false)};
