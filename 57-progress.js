/* =====================================================================
   PROGRESSION · XP par sport, niveaux, défis de figures, matériel débloqué en jouant
   - XP gagnée à la fin de chaque partie (score, figures, arrivée, temps de ride)
   - Défis : une fois réussis, ils donnent XP + pièces (événements « figure » envoyés par trickFn)
   - Le matériel de la boutique se débloque aussi au niveau indiqué (en plus des pubs / pièces)
===================================================================== */
const SPORT_SHORT={wingsuit:'wingsuit',longboard:'downhill',luge:'luge',foil:'foil',surf:'surf foil',paraglide:'parapente',snowboard:'snowboard','*':'dans un sport'};
const LVL_XP=l=>Math.round(250*Math.pow(l,1.45));
function lvlOf(xp){let l=1,x=xp||0,need=LVL_XP(1);while(x>=need&&l<60){x-=need;l++;need=LVL_XP(l)}return {l,x,need}}
const LVL_UNLOCK={drop105:['longboard',3],w86:['longboard',4],speed85:['longboard',7],aura:['wingsuit',6],smoke:['wingsuit',4],b52:['foil',3],m90:['foil',5],surf:['surf',5],neon:['*',5],carbon:['*',8]};
function sportLvl(s){return lvlOf((profile.xp||{})[s]||0).l}
function lvlUnlocked(id){const u=LVL_UNLOCK[id];if(!u||!profile||!profile.xp)return false;const lv=u[0]==='*'?Math.max(...SPORT_IDS.map(sportLvl)):sportLvl(u[0]);return lv>=u[1]}
function lvlLabel(id){const u=LVL_UNLOCK[id];return u?'niv. '+u[1]+' '+SPORT_SHORT[u[0]]:''}
/* défis : t = test sur le nom de la figure (et le combo), n = nombre de fois, m = mètres de rail cumulés */
const ACH=[
 {id:'sb_360',s:'snowboard',l:'Rotation 360',t:(n)=>/\b(360|540|720|900|1080)\b/.test(n),xp:200,c:60},
 {id:'sb_540',s:'snowboard',l:'Rotation 540',t:(n)=>/\b(540|720|900|1080)\b/.test(n),xp:320,c:90},
 {id:'sb_flip',s:'snowboard',l:'Réussis un flip',t:(n)=>/flip/i.test(n),xp:250,c:70},
 {id:'sb_bf360',s:'snowboard',l:'Backflip 360',t:(n)=>/backflip/i.test(n)&&/\b(360|540|720)\b/.test(n),xp:450,c:140},
 {id:'sb_method',s:'snowboard',l:'Method (grab tenu)',t:(n)=>/Method/.test(n),xp:180,c:50},
 {id:'sb_rail',s:'snowboard',l:'50 m de rail',m:50,xp:350,c:110},
 {id:'sb_combo',s:'snowboard',l:'Combo ×2,5',t:(n,c)=>c>=4,xp:300,c:90},
 {id:'lb_coleman',s:'longboard',l:'Coleman slide',t:(n)=>/Coleman/.test(n),xp:150,c:40},
 {id:'lb_pend',s:'longboard',l:'Pendulum',t:(n)=>/Pendulum/.test(n),xp:220,c:60},
 {id:'lb_stand',s:'longboard',l:'Stand-up slide',t:(n)=>/Stand-up/.test(n),xp:220,c:60},
 {id:'lb_perfect',s:'longboard',l:'5 virages parfaits',t:(n)=>n==='Virage parfait',n:5,xp:300,c:90},
 {id:'lb_perfslide',s:'longboard',l:'Slide parfait',t:(n)=>/^Slide parfait/.test(n),xp:260,c:80},
 {id:'ws_tree',s:'wingsuit',l:'Frôle-sapin',t:(n)=>n==='Frôle-sapin',xp:260,c:80},
 {id:'lb_frole',s:'longboard',l:'Frôle-glissière',t:(n)=>/^Frôle/.test(n),xp:200,c:60},
 {id:'lu_aero',s:'luge',l:'Aéro parfait',t:(n)=>n==='Aéro parfait',xp:200,c:60},
 {id:'lu_frole',s:'luge',l:'Frôle-glissière',t:(n)=>/^Frôle/.test(n),xp:200,c:60},
 {id:'lu_perfect',s:'luge',l:'3 virages parfaits',t:(n)=>n==='Virage parfait',n:3,xp:260,c:80},
 {id:'ws_roll',s:'wingsuit',l:'Tonneau',t:(n)=>/^Tonneau/.test(n),xp:180,c:50},
 {id:'ws_double',s:'wingsuit',l:'Double tonneau (combo)',t:(n,c)=>/^Tonneau/.test(n)&&c>=2,xp:300,c:90},
 {id:'ws_ress',s:'wingsuit',l:'Ressource',t:(n)=>n==='Ressource',xp:220,c:60},
 {id:'ws_rase',s:'wingsuit',l:'3 rase-mottes',t:(n)=>n==='Rase-mottes',n:3,xp:300,c:90},
 {id:'ws_paroi',s:'wingsuit',l:'Vol de paroi',t:(n)=>n==='Vol de paroi',xp:220,c:60},
 {id:'fo_jibe',s:'foil',l:'Jibe',t:(n)=>n==='Jibe',xp:220,c:60},
 {id:'fo_link',s:'foil',l:'Liaison de houles',t:(n)=>/^Liaison/.test(n),xp:220,c:60},
 {id:'fo_pump',s:'foil',l:'Pompage parfait',t:(n)=>n==='Pompage parfait',xp:200,c:60},
 {id:'su_cut',s:'surf',l:'Cutback',t:(n)=>n==='Cutback',xp:220,c:60},
 {id:'su_aerial',s:'surf',l:'Aerial',t:(n)=>/^Aerial/.test(n),xp:320,c:90},
 {id:'su_360',s:'surf',l:'Aerial 360',t:(n)=>n==='Aerial 360',xp:500,c:150},
 {id:'su_carve',s:'surf',l:'10 carves',t:(n)=>n==='Carve',n:10,xp:220,c:60},
 {id:'pg_wing',s:'paraglide',l:'Wingover',t:(n)=>/^Wingover/.test(n),xp:220,c:60},
 {id:'pg_spiral',s:'paraglide',l:'Spirale',t:(n)=>/^Spirale/.test(n),xp:200,c:60},
 {id:'pg_spiral2',s:'paraglide',l:'Double spirale',t:(n)=>n==='Spirale ×2',xp:320,c:90},
 {id:'pg_rase',s:'paraglide',l:'Rase-cime',t:(n)=>n==='Rase-cime',xp:220,c:60}];
function achDone(id){return !!(profile.ach&&profile.ach[id])}
function achProg(a){const p=(profile.achP||{})[a.id]||0;return a.m?Math.min(a.m,Math.floor(p))+' / '+a.m+' m':a.n?Math.min(a.n,p)+' / '+a.n:''}
function addXp(sport,g){profile.xp=profile.xp||{};const before=sportLvl(sport);profile.xp[sport]=(profile.xp[sport]||0)+g;const after=sportLvl(sport);
  if(after>before){const un=Object.keys(LVL_UNLOCK).filter(id=>{const u=LVL_UNLOCK[id];return (u[0]===sport||u[0]==='*')&&u[1]>before&&u[1]<=after});
    profile.coins+=after*25;toast('Niveau '+after+' '+SPORT_SHORT[sport]+' !',true);feed('Niveau '+after+' · +'+after*25+' pièces');
    for(const id of un){const it=SHOP.find(s=>s.id===id);if(it)feed('Débloqué : '+it.name)}if(typeof sfx!=='undefined')sfx.finish()}
  return after>before?after:0}
function achComplete(a){profile.ach=profile.ach||{};profile.ach[a.id]=Date.now();profile.coins+=a.c;addXp(a.s,a.xp);toast('Défi réussi : '+a.l,true);feed('Défi « '+a.l+' » · +'+a.xp+' XP · +'+a.c+' pièces');
  if(run){run.achs=run.achs||[];run.achs.push(a.l)}saveProfile()}
/* appelée par trickFn à chaque figure */
function progTrick(sport,name,comboN){profile.achP=profile.achP||{};
  for(const a of ACH){if(a.s!==sport||achDone(a.id))continue;
    if(a.m){const mm=/(\d+) m$/.exec(name);if(mm&&/50-50|Boardslide/.test(name)){profile.achP[a.id]=(profile.achP[a.id]||0)+(+mm[1]);if(profile.achP[a.id]>=a.m)achComplete(a)}continue}
    if(!a.t(name,comboN))continue;if(a.n){profile.achP[a.id]=(profile.achP[a.id]||0)+1;if(profile.achP[a.id]>=a.n)achComplete(a)}else achComplete(a)}}
function xpFor(st,r){return clamp(Math.round((st.score||0)/12+(st.tricks||0)*8+(r.finished?60:0)+(st.time||0)*1.2),5,3000)}
function progOverHtml(){if(!run||!cur)return '';const sp=curCfg.sport,g=run.xpGain!=null?run.xpGain:xpFor(cur.stats,run),L=lvlOf((profile.xp||{})[sp]||0);
  const pct=Math.round(L.x/L.need*100);return `<div class="xpline"><span>+${g} XP${run.xpGain==null?' (à la fin)':''}</span><div class="bt"><i style="width:${pct}%"></i></div><b>Niv. ${L.l} ${SPORT_SHORT[sp]}</b></div>`+
    (run.achs&&run.achs.length?`<p class="note">Défis réussis : ${run.achs.map(esc).join(', ')}</p>`:'')}
/* écran Progression */
function paintProg(){const sel=paintProg.sel||profile.last.sport||'snowboard';
  $('#progTabs').innerHTML=SPORT_IDS.map(s=>`<button class="tab" data-s="${s}" aria-selected="${s===sel}">${SPORTS[s]?SPORTS[s].name:s} <small>${sportLvl(s)}</small></button>`).join('');
  $$('#progTabs .tab').forEach(b=>b.onclick=()=>{paintProg.sel=b.dataset.s;paintProg()});
  const L=lvlOf((profile.xp||{})[sel]||0),pct=Math.round(L.x/L.need*100);
  const unl=Object.keys(LVL_UNLOCK).filter(id=>LVL_UNLOCK[id][0]===sel||LVL_UNLOCK[id][0]==='*').map(id=>{const it=SHOP.find(s=>s.id===id),u=LVL_UNLOCK[id],ok=lvlUnlocked(id)||profile.owned[id];
    return `<div class="stat-line"><span>${it?it.name:id}</span><b>${ok?'débloqué':'niveau '+u[1]+(u[0]==='*'?' (tous sports)':'')}</b></div>`}).join('');
  $('#progBody').innerHTML=`<div class="grp"><span class="lbl">Niveau <b>${L.l}</b></span><div class="xpline big"><div class="bt"><i style="width:${pct}%"></i></div><b>${fmt(L.x)} / ${fmt(L.need)} XP</b></div></div>
    <div class="grp"><span class="lbl">Défis de figures</span>${ACH.filter(a=>a.s===sel).map(a=>{const d=achDone(a.id);return `<div class="ach${d?' done':''}"><i>${d?'✓':''}</i><div><b>${a.l}</b><small>${d?'réussi':achProg(a)||'à faire'} · +${a.xp} XP · +${a.c} pièces</small></div></div>`}).join('')}</div>
    <div class="grp"><span class="lbl">Matériel débloqué en jouant</span>${unl||'<p class="note">Rien à débloquer ici.</p>'}</div>`}
