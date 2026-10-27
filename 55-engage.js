/* =====================================================================
   ENGAGEMENT (LOT 1) · série de jours, défi du jour, objectif de session,
   bonus de fin de partie, tutoriel léger
   + LOT 2 (stub) : compte local pseudo/PIN, export / import du profil
===================================================================== */
/* ---------- dates ---------- */
const pad2=n=>String(n).padStart(2,'0');
function dayKey(d=new Date()){return d.getFullYear()+'-'+pad2(d.getMonth()+1)+'-'+pad2(d.getDate())}
function yesterdayKey(){const d=new Date();d.setDate(d.getDate()-1);return dayKey(d)}
function touchStreakOnLaunch(){const today=dayKey();if(profile.lastPlayDay===today)return;
  profile.streak=profile.lastPlayDay===yesterdayKey()?(profile.streak|0)+1:1;
  profile.bestStreak=Math.max(profile.bestStreak|0,profile.streak);profile.lastPlayDay=today;saveProfile()}

/* ---------- défi du jour ----------
   check(st, run, medal, score) · stats réellement suivies par les modes :
   wingsuit: rings · longboard: slideTime · snowboard: airs · parapente: climbed · surf: rides · tous: score, time · run.finished */
const DAILY_POOL=[
  {id:'ws_rings',sport:'wingsuit',mode:'free',label:'Wingsuit libre : passe 8 anneaux',check:st=>(st.rings||0)>=8,reward:120},
  {id:'ws_score',sport:'wingsuit',mode:'free',label:'Wingsuit libre : fais 3 000 points',check:(st,r,m,sc)=>sc>=3000,reward:100},
  {id:'lb_slide',sport:'longboard',mode:'free',label:'Downhill libre : 12 s de slide cumulées',check:st=>(st.slideTime||0)>=12,reward:120},
  {id:'lb_score',sport:'longboard',mode:'free',label:'Downhill libre : fais 4 000 points',check:(st,r,m,sc)=>sc>=4000,reward:100},
  {id:'fo_finish',sport:'foil',mode:'course',label:'Foil : termine un slalom de bouées',check:(st,r)=>!!r.finished,reward:120},
  {id:'fo_score',sport:'foil',mode:'free',label:'Foil libre : fais 2 500 points',check:(st,r,m,sc)=>sc>=2500,reward:100},
  {id:'su_score',sport:'surf',mode:'free',label:'Surf foil libre : fais 2 000 points',check:(st,r,m,sc)=>sc>=2000,reward:100},
  {id:'any_medal',sport:'*',mode:'course',label:'N\'importe quel parcours : décroche une médaille',check:(st,r,m)=>m!=='n',reward:150},
  {id:'sb_airs',sport:'snowboard',mode:'free',label:'Snowboard freeride : enchaîne 5 sauts',check:st=>(st.airs||0)>=5,reward:110},
  {id:'pg_climb',sport:'paraglide',mode:'free',label:'Parapente : gagne 150 m en thermique',check:st=>(st.climbed||0)>=150,reward:120},
  {id:'lu_score',sport:'luge',mode:'free',label:'Street luge libre : fais 3 000 points',check:(st,r,m,sc)=>sc>=3000,reward:100}
].filter(c=>c.sport==='*'||MODES[c.sport]);
function dailyChallenge(){const c=DAILY_POOL[strSeed('daily-'+dayKey())%DAILY_POOL.length];return Object.assign({},c,{done:profile.dailyDone===dayKey()})}
const dailyMatches=(c,cfg)=>(c.sport==='*'||c.sport===cfg.sport)&&c.mode===cfg.mode;

/* ---------- objectif de session (non bloquant) ---------- */
function pickSessionGoal(cfg){
  if(profile.runs<=3)return {label:'Survis 30 s',key:'time',target:30,done:false};
  const course=cfg.mode==='course',alt=profile.runs%2;
  if(course){const n=Math.min(3,Math.max(1,(cfg.len|0)-1));return {label:'Passe '+n+' point'+(n>1?'s':'')+' de passage',key:'cp',target:n,done:false}}
  const G={wingsuit:alt?{label:'Passe 5 anneaux',key:'rings',target:5}:{label:'Fais 2 000 points',key:'score',target:2000},
    longboard:alt?{label:'Cumule 6 s de slide',key:'slideTime',target:6}:{label:'Fais 2 000 points',key:'score',target:2000},
    luge:{label:'Fais 2 000 points',key:'score',target:2000},
    snowboard:[{label:'Réussis 3 sauts',key:'airs',target:3},{label:'Fais 1 500 points',key:'score',target:1500},{label:'Réussis 3 figures avec grab',key:'grabs',target:3}][profile.runs%3],
    paraglide:{label:'Gagne 100 m en thermique',key:'climbed',target:100},
    foil:{label:'Fais 2 000 points',key:'score',target:2000},
    surf:[{label:'Surfe 3 vagues',key:'rides',target:3},{label:'Fais 3 aerials',key:'aerials',target:3},{label:'Reste 45 s sur le foil sans toucher',key:'flight',target:45}][profile.runs%3]}[cfg.sport]||{label:'Survis 45 s',key:'time',target:45};
  return Object.assign({done:false},G)}
function goalValue(g){if(!g||!cur)return 0;if(g.key==='cp')return run?run.cp:0;return +cur.stats[g.key]||0}
function goalProgress(){const el=$('#hGoal');if(!el)return;const g=run&&run.goal;if(!g){el.hidden=true;return}el.hidden=false;
  const v=goalValue(g);if(!g.done&&v>=g.target&&state==='play'){g.done=true;cur.stats.score+=25;feed('Objectif atteint · +25');ding(880,.3);(run.engageBits=run.engageBits||[]).push('Objectif de session : '+g.label)}
  const shown=g.key==='time'||g.key==='slideTime'||g.key==='flight'?Math.floor(Math.min(v,g.target))+' / '+g.target+' s':fmt(Math.min(v,g.target))+' / '+fmt(g.target);
  el.classList.toggle('done',g.done);el.innerHTML=(g.done?'✓ ':'Objectif · ')+esc(g.label)+(g.done?'':' <b>'+shown+'</b>')}

/* ---------- bonus de fin de partie (appelé par finalizeRun) ---------- */
function engageFinalize(score,medal){const bits=run.engageBits=run.engageBits||[];let extra=0;
  if(profile.streak>=3){const b=Math.min(50,10*profile.streak);extra+=b;bits.push('Série de '+profile.streak+' jours · +'+b+' pièces')}
  const dc=dailyChallenge();
  if(!dc.done&&dailyMatches(dc,curCfg)&&!run.multi){let ok=false;try{ok=!!dc.check(cur.stats,run,medal,score)}catch(e){ok=false}
    if(ok){extra+=dc.reward;profile.dailyDone=dayKey();bits.push('Défi du jour réussi · +'+dc.reward+' pièces');toast('Défi du jour réussi',true)}}
  if(profile.runs<=3&&score<800){extra+=40;bits.push('Bonus débutant · +40 pièces')}
  if(run.goal&&run.goal.done&&!bits.some(b=>b.startsWith('Objectif')))bits.push('Objectif de session : '+run.goal.label);
  run.coins+=extra;profile.coins+=extra;return extra}
function engageOverHtml(){if(!run)return '';const bits=run.engageBits||[];
  return `<div class="engage-over"><span class="chipline">Série : <b>${profile.streak} jour${profile.streak>1?'s':''}</b> · record ${profile.bestStreak}</span>${bits.map(b=>`<span class="chipline ok">${esc(b)}</span>`).join('')}</div>`}

/* ---------- accueil ---------- */
function dailySport(){return SPORT_IDS[strSeed('sport-'+dayKey())%SPORT_IDS.length]}
function paintHomeEngage(){const el=$('#homeEngage');if(!el)return;const dc=dailyChallenge();const sp=dc.sport==='*'?null:SPORTS[dc.sport];
  let h=`<div class="he-row"><span class="he-k">Série</span><b>${profile.streak||0} jour${profile.streak>1?'s':''}</b><small>record ${profile.bestStreak||0}${profile.lastPlayDay===dayKey()?' · joué aujourd\'hui':profile.streak?' · joue aujourd\'hui pour la garder':''}</small></div>
    <div class="he-row"><span class="he-k">Défi du jour</span><b>${esc(dc.label)}</b><small>${dc.done?'<span class="he-done">✓ fait</span>':'+'+dc.reward+' pièces'}</small>${dc.done?'':'<button class="btn small" id="heDaily">Jouer le défi</button>'}</div>`;
  const ds=dailySport(),drec=profile.records['daily|'+dayKey()+'|'+ds];
  h+=`<div class="he-row"><span class="he-k">Parcours du jour · même monde pour tous</span><b>${esc(SPORTS[ds].name)} · ${esc(SPORTS[ds].modes.course)}</b><small>${drec?'ton record '+fmtT2(drec):'pas encore couru'}</small><button class="btn small" id="heCourse">Courir</button></div>`;
  if(!profile.runs)h+=`<div class="he-row first"><span class="he-k">Première glisse</span><b>Commence par le Downhill en libre : deux flèches et c'est parti.</b><button class="btn small primary" id="heFirst">Go</button></div>`;
  el.innerHTML=h;
  const b=$('#heDaily');if(b)b.onclick=()=>{if(!sp){go('play');return}setup=loadSetup(dc.sport);setup.mode=dc.mode;if(dc.mode==='free')setup.use={boost:false,x15:false};go('setup')};
  const hc=$('#heCourse');if(hc)hc.onclick=()=>{setup=loadSetup(dailySport());setup.mode='course';setup.seedMode='daily';go('setup')};
  const f=$('#heFirst');if(f)f.onclick=()=>{setup=loadSetup('longboard');setup.mode='free';setup.params.slope=0;go('setup')}}

/* ---------- tutoriel léger (3 conseils max sur la vie du profil) ---------- */
function maybeTutorial(){if((profile.tutorialStep|0)>=3)return;const i=profile.tutorialStep|0;
  const tips=isTouch?['Dirige avec les boutons ◀ ▶','Le gros bouton rond = action du sport','II en haut à gauche = pause']:['Oriente avec ← → (ou A / D)','Espace = action du sport (slide, pomper, frein…)','C change de caméra · Échap met en pause'];
  setTimeout(()=>{if(state!=='play')return;const t=E.toast;t.classList.add('tip');toast(tips[i],true);setTimeout(()=>t.classList.remove('tip'),1200)},1300);
  profile.tutorialStep=i+1;saveProfile()}

/* ---------- LOT 2 : comptes locaux, export / import ----------
   SÉCURITÉ : ce n'est PAS une vraie authentification. Le PIN est haché (SHA-256 salé
   par l'identifiant du compte, ou repli FNV si crypto.subtle est absent) et stocké dans
   le localStorage du navigateur : il sépare les élèves sur un PC partagé, il ne protège
   pas contre quelqu'un qui ouvre les outils de développement. Une vraie auth passera
   par un serveur (comptes d'école, champ account.syncedAt prévu pour la synchro).
   Le PIN n'est jamais affiché, journalisé ni stocké en clair. */
async function hashSecret(salt,secret){const txt='ligne-libre|'+salt+'|'+secret;
  try{if(window.crypto&&crypto.subtle){const buf=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(txt));return 's2:'+[...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,'0')).join('')}}catch(e){}
  let h=0;for(let r=0;r<64;r++)h=strSeed(h+'|'+txt);return 'f1:'+(h>>>0).toString(16)}
function recoveryCode(){const a='ABCDEFGHJKMNPQRSTUVWXYZ23456789';let s='';const r=new Uint32Array(8);try{crypto.getRandomValues(r)}catch(e){for(let i=0;i<8;i++)r[i]=Math.random()*1e9}for(let i=0;i<8;i++)s+=a[r[i]%a.length];return 'LL-'+s.slice(0,4)+'-'+s.slice(4)}
const saveAcc=()=>save(ACC_KEY,ACC);
const findAcc=pseudo=>Object.keys(ACC.list).find(id=>ACC.list[id].pseudo.toLowerCase()===String(pseudo).trim().toLowerCase());
const cleanPseudo=v=>String(v||'').replace(/[\u0000-\u001f<>]/g,'').trim().slice(0,16);
function blankProfile(){return JSON.parse(JSON.stringify(PROFILE_DEFAULT))}
function exportProfileJson(){const p=JSON.parse(JSON.stringify(profile));if(p.account){delete p.account.pinHash;delete p.account.recoveryCode}return JSON.stringify({app:'ligne-libre',v:3,at:new Date().toISOString(),profile:p},null,1)}
let lastExportText='';
async function exportProfile(){const data=exportProfileJson(),name='ligne-libre-'+(cleanPseudo(profile.look.name).replace(/[^a-z0-9]/gi,'')||'profil')+'-'+dayKey()+'.json';lastExportText=data;
  try{if(window.claude&&claude.use){const dl=await claude.use('downloads');if(dl){await dl.save({filename:name,data});return 'Fichier '+name+' proposé au téléchargement.'}}}catch(e){}
  let dl=false;try{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([data],{type:'application/json'}));a.download=name;document.body.appendChild(a);a.click();dl=true;setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},800)}catch(e){}
  try{await navigator.clipboard.writeText(data);return (dl?'Téléchargé ('+name+') et copié':'Copié')+' dans le presse-papiers.'}catch(e){return dl?'Téléchargé : '+name+'.':'Téléchargement bloqué : copie le texte ci-dessous.'}}
function validateImport(o){const p=o&&o.app==='ligne-libre'?o.profile:o;
  if(!p||typeof p!=='object')return [null,'Fichier invalide : aucun profil.'];
  if(!p.look||typeof p.look!=='object'||!p.settings||typeof p.settings!=='object')return [null,'Ce fichier n\'est pas un profil Ligne Libre.'];
  if(p.coins!=null&&!Number.isFinite(+p.coins))return [null,'Profil corrompu (pièces).'];
  if(p.records&&typeof p.records!=='object')return [null,'Profil corrompu (records).'];
  const clean=JSON.parse(JSON.stringify(p));clean.coins=Math.max(0,Math.floor(+clean.coins||0));clean.look.name=cleanPseudo(clean.look.name)||'Rider';
  const cur=profile.account||{};clean.account=Object.assign({},clean.account||{},{pseudo:cur.pseudo||'',pinHash:'',recoveryCode:''});
  return [deepMerge(clean,blankProfile()),null]}
function importProfileText(txt){let o;try{o=JSON.parse(txt)}catch(e){return 'Fichier illisible : ce n\'est pas un export Ligne Libre.'}
  const [p,err]=validateImport(o);if(err)return err;clearTimeout(saveT);profileFrozen=true;
  try{localStorage.setItem(PROFILE_KEY,JSON.stringify(p))}catch(e){return 'Import impossible (stockage du navigateur bloqué).'}
  setTimeout(()=>location.reload(),600);return 'Profil importé : '+fmt(p.coins)+' pièces. Rechargement…'}
async function createAccount(pseudo,pin){pseudo=cleanPseudo(pseudo);
  if(pseudo.length<3)return {err:'Pseudo : 3 à 16 caractères.'};if(!/^\d{4}$/.test(pin))return {err:'Le PIN doit faire exactement 4 chiffres.'};
  if(findAcc(pseudo))return {err:'Ce pseudo existe déjà sur ce PC : connecte-toi.'};
  const id=randCode(8),rec=recoveryCode();
  ACC.list[id]={pseudo,pinHash:await hashSecret(id,pin),recHash:await hashSecret(id,rec.toUpperCase()),created:Date.now()};
  // la progression actuelle (invité) devient celle du nouveau compte
  const p=JSON.parse(JSON.stringify(profile));p.look.name=pseudo;p.account={pseudo,pinHash:'',syncedAt:0,recoveryCode:''};
  save('ll3_profile_'+id,p);if(!ACC.active)save('ll3_profile',blankProfile());ACC.active=id;saveAcc();return {ok:true,rec}}
async function loginAccount(pseudo,pin){if(profileFrozen)return {err:'Recharge la page d\'abord.'};const id=findAcc(pseudo);if(!id)return {err:'Aucun compte « '+cleanPseudo(pseudo)+' » sur ce PC.'};
  if(await hashSecret(id,pin)!==ACC.list[id].pinHash)return {err:'PIN incorrect.'};flushProfile();profileFrozen=true;ACC.active=id;saveAcc();return {ok:true}}
async function resetPin(pseudo,rec,pin){const id=findAcc(pseudo);if(!id)return {err:'Compte introuvable.'};if(!/^\d{4}$/.test(pin))return {err:'Nouveau PIN : 4 chiffres.'};
  if(await hashSecret(id,String(rec).trim().toUpperCase())!==ACC.list[id].recHash)return {err:'Code de récupération incorrect.'};ACC.list[id].pinHash=await hashSecret(id,pin);saveAcc();return {ok:true}}
function logoutAccount(){flushProfile();profileFrozen=true;ACC.active='';saveAcc();save('ll3_profile',blankProfile())}

let acc={mode:'login',arm:0,rec:'',msg:''};
function paintAccountBlock(){const me=ACC.active&&ACC.list[ACC.active];const n=Object.keys(ACC.list).length;
  let h=`<div class="grp"><span class="lbl">Compte <b>${me?'connecté : '+esc(me.pseudo):'invité (non connecté)'}</b></span>
  <p class="note">Comptes locaux à ce navigateur : idéal sur un PC partagé du lycée. Ce n'est pas un compte en ligne : exporte ton profil pour changer de PC.</p>`;
  if(acc.rec)h+=`<div class="pace" style="border-color:var(--gold)"><div><div class="pn">Code de récupération : ${esc(acc.rec)}</div><div class="pd">Note-le maintenant : il ne sera plus affiché. Il sert à changer ton PIN si tu l'oublies.</div></div></div><div class="row"><button class="btn small" id="acRecOk">C'est noté</button></div>`;
  if(!me){h+=`<div class="chips">${['login','create','reset'].map(m=>`<button class="chip" data-acm="${m}" aria-pressed="${acc.mode===m}">${{login:'Se connecter',create:'Créer un compte',reset:'PIN oublié'}[m]}</button>`).join('')}</div>
    <div class="row"><input class="txt" id="acPseudo" maxlength="16" autocomplete="off" placeholder="Pseudo (3-16)" style="max-width:170px"><input class="txt" id="acPin" type="password" maxlength="4" inputmode="numeric" autocomplete="off" placeholder="${acc.mode==='reset'?'Nouveau PIN':'PIN (4 chiffres)'}" style="max-width:150px">
    ${acc.mode==='reset'?'<input class="txt" id="acRec" maxlength="12" autocomplete="off" placeholder="LL-XXXX-XXXX" style="max-width:170px;text-transform:uppercase">':''}
    <button class="btn small primary" id="acGo">${{login:'Connexion',create:'Créer',reset:'Changer le PIN'}[acc.mode]}</button></div>
    ${acc.mode==='create'?'<p class="note">Ta progression actuelle sera rattachée au nouveau compte.</p>':''}${n?`<p class="note">${n} compte${n>1?'s':''} sur ce PC.</p>`:''}`}
  else h+=`<div class="row"><button class="btn small" id="acLogout">Se déconnecter</button></div>`;
  h+=`<div class="row"><input class="txt" id="acClass" maxlength="6" placeholder="Code classe (6)" value="${esc(profile.classCode)}" style="max-width:170px;text-transform:uppercase"></div>
    <div class="row"><button class="btn small" id="acExport">Exporter mon profil</button><label class="btn small" style="cursor:pointer">Importer un profil<input type="file" id="acImport" accept=".json,application/json" hidden></label>
      <button class="btn small" id="acSwitch">${['Changer de compte','Exporter puis effacer ?','Dernière confirmation'][acc.arm]}</button></div>
    <p class="note" id="acMsg" role="status">${esc(acc.msg)}</p>${lastExportText&&acc.showText?`<textarea class="txt" rows="4" readonly id="acText">${esc(lastExportText)}</textarea>`:''}</div>`;
  return h}
function bindAccountBlock(repaint){const msg=t=>{acc.msg=t;const m=$('#acMsg');if(m)m.textContent=t};
  $$('[data-acm]').forEach(b=>b.onclick=()=>{acc.mode=b.dataset.acm;acc.msg='';repaint()});
  const ok=$('#acRecOk');if(ok)ok.onclick=()=>{acc.rec='';location.reload()};
  const go=$('#acGo');if(go)go.onclick=async()=>{const ps=$('#acPseudo').value,pin=$('#acPin').value.trim();$('#acPin').value='';go.disabled=true;let r;
    if(acc.mode==='create'){r=await createAccount(ps,pin);if(r.ok){profileFrozen=true;acc.rec=r.rec;acc.msg='Compte créé. Note ton code puis clique « C\'est noté ».';repaint();toastMenu('Compte créé · note ton code');return}}
    else if(acc.mode==='login'){r=await loginAccount(ps,pin);if(r.ok){msg('Connecté. Rechargement…');setTimeout(()=>location.reload(),400);return}}
    else{r=await resetPin(ps,$('#acRec').value,pin);if(r.ok){acc.mode='login';acc.msg='PIN changé. Connecte-toi.';repaint();return}}
    go.disabled=false;msg(r.err)};
  const lo=$('#acLogout');if(lo)lo.onclick=()=>{logoutAccount();msg('Déconnecté. Rechargement…');setTimeout(()=>location.reload(),300)};
  const cl=$('#acClass');if(cl)cl.oninput=()=>{profile.classCode=cl.value.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,6);cl.value=profile.classCode;saveProfile()};
  $('#acExport').onclick=async()=>{const t=await exportProfile();acc.showText=/copie le texte/.test(t);msg(t);if(acc.showText)repaint()};
  $('#acImport').onchange=e=>{const f=e.target.files&&e.target.files[0];if(!f)return;if(f.size>2e6){msg('Fichier trop gros.');return}const r=new FileReader();r.onload=()=>msg(importProfileText(String(r.result)));r.readAsText(f)};
  $('#acSwitch').onclick=async()=>{if(acc.arm<2){acc.arm++;acc.msg=acc.arm===1?'Ton profil va être exporté puis la session effacée de ce PC.':'Clique une dernière fois pour confirmer.';repaint();clearTimeout(acc.t);acc.t=setTimeout(()=>{acc.arm=0;if(screen==='settings')repaint()},6000);return}
    acc.arm=0;msg('Export…');await exportProfile();clearTimeout(saveT);profileFrozen=true;
    if(ACC.active){try{localStorage.removeItem('ll3_profile_'+ACC.active)}catch(e){}delete ACC.list[ACC.active];ACC.active='';saveAcc()}
    save('ll3_profile',blankProfile());msg('Session effacée. Rechargement…');setTimeout(()=>location.reload(),900)}}
