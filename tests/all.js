/* Suite de régression « 7 sports » : lancement, sports présents/retirés, chaque sport × mode (pilote auto),
   fin de partie, relance, garage, migration d'un ancien profil. Sortie : lignes OK / FAIL. */
const L=require('./lib');const res=[];const ok=(n,c,d)=>{res.push((c?'OK   ':'FAIL ')+n+(d?' · '+d:''));};
(async()=>{
 /* 1. migration : ancien profil avec sports retirés */
 const old={look:{name:'Ancien',gear:{helmet:'full',wing:'proxy',board:'top98',wheel:'w83',fwing:'surf',fboard:'b52',mast:'m90'},fcol:123},coins:1234,xp:{surf:9000,foil:300,longboard:500},owned:{surf:true,b52:true,neon:true},records:{'foil|free':4000,'surf|free':2500,'longboard|free':800},last:{sport:'surf',surf:{mode:'free'}},history:[{sport:'surf',mode:'free',seed:'x',score:2500,time:0,medal:'n',at:1}],settings:{quality:'eco',vol:.5},runs:12};
 {const {b,p,errs}=await L.open({init:`try{localStorage.setItem('ll3_profile',${JSON.stringify(JSON.stringify(old))})}catch(e){}`});
  const r=await p.evaluate(()=>({ids:__ll.SPORT_IDS,last:__ll.profile.last.sport,coins:__ll.profile.coins,neon:__ll.profile.owned.neon,state:__ll.state,v:__ll.profile.v,xp:__ll.profile.xp.surf}));
  ok('migration : ancien profil chargé sans erreur',errs.length===0,errs.join('|'));ok('migration : sport retiré → wingsuit',r.last==='wingsuit',r.last);ok('migration : pièces conservées',r.coins===1234);ok('migration : cosmétiques conservés (néon)',r.neon===true);ok('migration : version 4',r.v===4);
  await p.click('[data-go="play"]');await p.waitForTimeout(900);const cards=await p.$$eval('#playBody .scard',e=>e.map(x=>x.dataset.sport));ok('écran sports : 7 cartes',cards.length===7,cards.join(','));
  await p.click('[data-back]').catch(()=>{});await p.waitForTimeout(300);await p.evaluate(()=>{document.querySelector('[data-go="ranking"]').click()});await p.waitForTimeout(600);ok('classement après migration',errs.length===0,errs.join('|'));
  await b.close()}
 const {b,p,errs}=await L.open();
 const ids=await p.evaluate(()=>__ll.SPORT_IDS);const want=['wingsuit','longboard','snowboard','bmx','motocross','wakeboard','parkour'];
 ok('exactement 7 sports',JSON.stringify(ids)===JSON.stringify(want),ids.join(','));
 const gone=await p.evaluate(()=>['luge','paraglide','foil','surf'].filter(s=>__ll.MODES[s]||__ll.SPORTS[s]));ok('sports retirés absents',gone.length===0,gone.join(','));
 const strip=await p.$$eval('#sportStrip .sstrip',e=>e.length);ok('accueil : bandeau des 7 sports',strip===7);
 /* 2. chaque sport × mode */
 for(const s of want)for(const m of ['course','free']){const e0=errs.length;
  const r=await L.sim(p,s,m,s==='wingsuit'||s==='longboard'||s==='snowboard'?20:30,'c.auto?c.auto():{x:0,y:0,a:false}',{len:s==='longboard'?2:s==='wingsuit'||s==='snowboard'?8:s==='bmx'?4:s==='motocross'?4:s==='wakeboard'?8:3});
  const fine=errs.length===e0;ok(s+' '+m+' : roule 20-30 s sans erreur JS',fine,errs.slice(e0).join('|'));ok(s+' '+m+' : score > 0',r.score>0,'score '+r.score+' · chutes '+r.crashes.length+(r.fin?' · arrivée':''));
  const st=await p.evaluate(()=>{const c=__ll.cur;return {n:c.name,ov:c.overStats().length,hud:!!document.querySelector('#inst .ihead')}});ok(s+' '+m+' : stats de fin + HUD',st.ov>=3&&st.hud)}
 /* 3. fin de partie réelle + relance (touche R) */
 await p.evaluate(()=>{__ll.startRun({sport:'bmx',mode:'free',len:12,weather:'soleil',wind:0,params:{},seed:'R1'},{});__ll.forcePlay()});await p.waitForTimeout(400);
 await p.evaluate(()=>{__ll.cur.update(1/60,{x:0,y:0,a:false});window.__ll.run&&0});await p.keyboard.press('KeyR');await p.waitForTimeout(500);ok('relance avec R',await p.evaluate(()=>__ll.state==='count'||__ll.state==='play'));
 /* 4. garage : tous les onglets s'affichent */
 await p.evaluate(()=>{const s=__ll.state});await p.keyboard.press('Escape');await p.waitForTimeout(300);await p.evaluate(()=>{document.querySelector('#btnQuit').click()});await p.waitForTimeout(500);
 await p.evaluate(()=>document.querySelector('[data-go="garage"]').click());await p.waitForTimeout(600);const tabs=await p.$$eval('#garageTabs .tab',e=>e.map(x=>x.dataset.t));
 for(const t of tabs){const e0=errs.length;await p.click(`#garageTabs [data-t="${t}"]`);await p.waitForTimeout(350);ok('garage onglet '+t,errs.length===e0,errs.slice(e0).join('|'))}
 await p.screenshot({path:'all_garage.png'});
 console.log(res.join('\n'));console.log('TOTAL',res.filter(x=>x.startsWith('OK')).length,'/',res.length);console.log('ERR',errs.slice(0,8));await b.close()})();
