/* =====================================================================
   PROGRESSION · XP par sport, niveaux, défis de figures, matériel débloqué en jouant
   - XP gagnée à la fin de chaque partie (score, figures, arrivée, temps de ride)
   - Défis : une fois réussis, ils donnent XP + pièces (événements « figure » envoyés par trickFn)
   - Le matériel de la boutique se débloque aussi au niveau indiqué (en plus des pubs / pièces)
===================================================================== */
const SPORT_SHORT={wingsuit:'wingsuit',longboard:'downhill',snowboard:'snowboard',bmx:'BMX',motocross:'motocross',wakeboard:'wakeboard',parkour:'parkour','*':'dans un sport'};
const LVL_XP=l=>Math.round(250*Math.pow(l,1.45));
function lvlOf(xp){let l=1,x=xp||0,need=LVL_XP(1);while(x>=need&&l<60){x-=need;l++;need=LVL_XP(l)}return {l,x,need}}
const LVL_UNLOCK={park:['bmx',3],flat:['bmx',6],'125':['motocross',3],'450f':['motocross',6],stiff:['wakeboard',3],parkw:['wakeboard',6],grip:['parkour',3],light:['parkour',6],drop105:['longboard',3],w86:['longboard',4],speed85:['longboard',7],aura:['wingsuit',6],smoke:['wingsuit',4],neon:['*',5],carbon:['*',8]};
function sportLvl(s){return lvlOf((profile.xp||{})[s]||0).l}
function lvlUnlocked(id){const u=LVL_UNLOCK[id];if(!u||!profile||!profile.xp)return false;const lv=u[0]==='*'?Math.max(1,...SPORT_IDS.map(sportLvl),...Object.keys(profile.xp).map(sportLvl)):sportLvl(u[0]);/* '*' : tous sports, y compris l'XP des anciens sports retirés (niveaux déjà gagnés conservés) */return lv>=u[1]}
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
 {id:'ws_roll',s:'wingsuit',l:'Tonneau',t:(n)=>/^Tonneau/.test(n),xp:180,c:50},
 {id:'ws_double',s:'wingsuit',l:'Double tonneau (combo)',t:(n,c)=>/^Tonneau/.test(n)&&c>=2,xp:300,c:90},
 {id:'ws_ress',s:'wingsuit',l:'Ressource',t:(n)=>n==='Ressource',xp:220,c:60},
 {id:'ws_rase',s:'wingsuit',l:'3 rase-mottes',t:(n)=>n==='Rase-mottes',n:3,xp:300,c:90},
 {id:'ws_perfect',s:'wingsuit',l:'Anneau parfait (plein centre)',t:(n)=>n==='Anneau parfait',xp:220,c:60},
 {id:'ws_paroi',s:'wingsuit',l:'Vol de paroi',t:(n)=>n==='Vol de paroi',xp:220,c:60},
 {id:'bx_360',s:'bmx',l:'Rotation 360',t:(n)=>/\b(360|540|720)\b/.test(n),xp:200,c:60},
 {id:'bx_whip',s:'bmx',l:'Tailwhip',t:(n)=>/Tailwhip/.test(n),xp:220,c:60},
 {id:'bx_bar',s:'bmx',l:'Barspin',t:(n)=>/Barspin/.test(n),xp:180,c:50},
 {id:'bx_flip',s:'bmx',l:'Backflip',t:(n)=>/Backflip/.test(n),xp:320,c:90},
 {id:'bx_man',s:'bmx',l:'Manual de 3 s',t:(n)=>{const m=/^Manual (\d+)/.exec(n);return !!m&&+m[1]>=3},xp:200,c:60},
 {id:'bx_grind',s:'bmx',l:'20 m de grind',m:20,mre:/Peg|Feeble|Smith|Crooked|Icepick/,xp:300,c:90},
 {id:'bx_spine',s:'bmx',l:'Transfert de spine',t:(n)=>/Transfert/.test(n),xp:260,c:80},
 {id:'bx_combo',s:'bmx',l:'Combo ×4',t:(n,c)=>c>=7,xp:400,c:120},
 {id:'mx_whip',s:'motocross',l:'Whip',t:(n)=>/Whip/.test(n),xp:180,c:50},
 {id:'mx_scrub',s:'motocross',l:'Scrub',t:(n)=>/Scrub/.test(n),xp:200,c:60},
 {id:'mx_super',s:'motocross',l:'Superman',t:(n)=>/Superman/.test(n),xp:240,c:70},
 {id:'mx_nac',s:'motocross',l:'Nac-nac',t:(n)=>/Nac/.test(n),xp:220,c:60},
 {id:'mx_flip',s:'motocross',l:'Backflip moto',t:(n)=>/Backflip/.test(n),xp:450,c:140},
 {id:'mx_big',s:'motocross',l:'3 big airs',t:(n,c,o)=>!!(o&&o.big),n:3,xp:300,c:90},
 {id:'mx_whoops',s:'motocross',l:'Whoops à fond',t:(n)=>/^Whoops/.test(n),xp:200,c:60},
 {id:'wk_w2w',s:'wakeboard',l:'Wake to wake',t:(n)=>/Wake to wake/.test(n),xp:180,c:50},
 {id:'wk_roll',s:'wakeboard',l:'Backroll',t:(n)=>/Backroll/.test(n),xp:260,c:80},
 {id:'wk_tan',s:'wakeboard',l:'Tantrum',t:(n)=>/Tantrum/.test(n),xp:280,c:80},
 {id:'wk_360',s:'wakeboard',l:'360 sur le sillage',t:(n)=>/\b(360|540|720)\b/.test(n),xp:240,c:70},
 {id:'wk_raley',s:'wakeboard',l:'Raley',t:(n)=>/Raley/.test(n),xp:240,c:70},
 {id:'wk_slide',s:'wakeboard',l:'30 m de slide',m:30,mre:/^Slide/,xp:280,c:80},
 {id:'pk_kong',s:'parkour',l:'Kong vault',t:(n)=>/Kong/.test(n),xp:180,c:50},
 {id:'pk_wall',s:'parkour',l:'Wallrun',t:(n)=>/^Wallrun/.test(n),xp:200,c:60},
 {id:'pk_wj',s:'parkour',l:'Wall jump',t:(n)=>/Wall jump/.test(n),xp:260,c:80},
 {id:'pk_prec',s:'parkour',l:'Saut de précision',t:(n)=>/^Précision/.test(n),xp:240,c:70},
 {id:'pk_roll',s:'parkour',l:'Roulade',t:(n)=>/^Roulade/.test(n),xp:160,c:50},
 {id:'pk_gap',s:'parkour',l:'Saut de toit de 6 m',t:(n)=>{const m=/Saut de toit (\d+)/.exec(n);return !!m&&+m[1]>=6},xp:260,c:80},
 {id:'pk_combo',s:'parkour',l:'Combo ×4',t:(n,c)=>c>=7,xp:400,c:120}];
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
function progTrick(sport,name,comboN,opt){profile.achP=profile.achP||{};opt=opt||{};
  for(const a of ACH){if(a.s!==sport||achDone(a.id))continue;
    if(a.m){const mm=/(\d+) m$/.exec(name);if(mm&&(a.mre||/50-50|Boardslide/).test(name)){profile.achP[a.id]=(profile.achP[a.id]||0)+(+mm[1]);if(profile.achP[a.id]>=a.m)achComplete(a)}continue}
    if(!a.t(name,comboN,opt))continue;if(a.n){profile.achP[a.id]=(profile.achP[a.id]||0)+1;if(profile.achP[a.id]>=a.n)achComplete(a)}else achComplete(a)}}
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
