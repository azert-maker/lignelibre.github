/* Économie et pièces à ramasser : apparition dans les 7 sports, ramassage par le pilote auto, plafond,
   gains par type de partie, aucun double crédit (fin, recommencer, quitter, replay). */
const L=require('./lib');const SECS=+process.env.ECON_SECS||60;
(async()=>{const {b,p,errs}=await L.open();let ok=0,ko=0;const chk=(c,m)=>{console.log((c?'OK  ':'KO  ')+m);c?ok++:ko++};await p.waitForTimeout(1200);
  const res=await p.evaluate((SECS)=>{const P=__ll.profile,out={};
    function play(sp,mode,secs,seed){P.streak=0;P.runs=50;P.dailyDone=__ll.dayKey();
      __ll.startRun({sport:sp,mode,len:mode==='course'?4:12,weather:'soleil',wind:0,params:{},seed},{});__ll.forcePlay();const c=__ll.cur;let t=0,cr=0,snaps=[],n=0,maxV=0;
      while(t<secs){if(n%60===0){snaps.push({t,s:c.snapshot()});if(snaps.length>6)snaps.shift()}c.update(1/60,c.auto());__ll.coinsTick(1/60);t+=1/60;n++;maxV=Math.max(maxV,__ll.COIN.val);
        if(__ll.state==='over'){if(__ll.run.finished)break;cr++;let sn=null;for(const x of snaps)if(t-x.t>=2.5)sn=x;sn=sn||snaps[0];if(sn&&c.restore)c.restore(sn.s);__ll.forcePlay()}}
      const C=__ll.COIN;const r={t:Math.round(t),score:Math.round(c.stats.score),spawnedV:C.spawnedV,val:C.val,got:C.got,risk:C.riskGot,maxV,cr,fin:__ll.run.finished};
      const before=P.coins;if(!__ll.run.finalized)__ll.finalizeRun(true);r.pay=__ll.run.pay;r.coins=__ll.run.coins;return r}
    for(const sp of __ll.SPORT_IDS){out[sp]={free:play(sp,'free',SECS,'E1'),course:play(sp,'course',240,'E2')}}
    /* chute rapide : 6 s puis crash */
    P.runs=50;__ll.startRun({sport:'bmx',mode:'free',len:12,weather:'soleil',wind:0,params:{},seed:'E3'},{});__ll.forcePlay();{const c=__ll.cur;for(let i=0;i<360;i++){c.update(1/60,c.auto());__ll.coinsTick(1/60)}}
    __ll.crashNow();const c0=P.coins;__ll.finalizeRun(true);const quick=__ll.run.coins;__ll.finalizeRun(true);const dbl=P.coins-c0;
    /* plafond : on force 60 pièces cyan sur le rider */
    __ll.startRun({sport:'parkour',mode:'free',len:12,weather:'soleil',wind:0,params:{},seed:'E4'},{});__ll.forcePlay();const C=__ll.COIN;
    for(let k=0;k<4;k++){const q=__ll.cur.netState().p;for(let i=0;i<12;i++)C.list.push({x:q[0],y:q[1]+.95,z:q[2],v:2,risk:true,t:0,life:9,pick:-1,ph:0});__ll.coinsTick(1/60)}
    const cap=C.val;
    /* replay : pas de ramassage hors du jeu */
    const q=__ll.cur.netState().p;C.list.push({x:q[0],y:q[1]+.95,z:q[2],v:1,risk:false,t:0,life:9,pick:-1,ph:0});const v0=C.val;
    return {out,quick,dbl,cap,capLim:40,v0};},SECS);
  /* état « over » : aucun ramassage */
  const over=await p.evaluate(()=>{__ll.startRun({sport:'bmx',mode:'free',len:12,weather:'soleil',wind:0,params:{},seed:'E5'},{});__ll.forcePlay();__ll.crashNow();const C=__ll.COIN;const q=__ll.cur.netState().p;C.val=0;C.list.length=0;C.list.push({x:q[0],y:q[1]+.9,z:q[2],v:1,risk:false,t:0,life:9,pick:-1,ph:0});__ll.coinsTick(1/60);return C.val});
  const T=res.out;console.log('sport       | libre '+SECS+' s : apparues / ramassées (cyan) · paie | parcours : temps · ramassées · paie');
  for(const s in T){const f=T[s].free,c=T[s].course;console.log(s.padEnd(11)+' | '+String(f.spawnedV).padStart(3)+' / '+String(f.val).padStart(2)+' ('+f.risk+') · '+f.coins+' '+JSON.stringify(f.pay)+' | '+c.t+' s'+(c.fin?'':' (non fini)')+' · '+c.val+' · '+c.coins+' '+JSON.stringify(c.pay))}
  for(const s in T){chk(T[s].free.spawnedV>=8,s+' : des pièces apparaissent ('+T[s].free.spawnedV+' en '+SECS+' s)');chk(T[s].free.val+T[s].course.val>=1,s+' : ramassage vérifié avec le pilote auto, qui ignore les pièces ('+T[s].free.val+' en libre, '+T[s].course.val+' en parcours)')}
  const all=Object.values(T).flatMap(x=>[x.free,x.course]);
  chk(all.every(r=>r.maxV<=40),'plafond de 40 pièces respecté en jeu');chk(res.cap===40,'plafond forcé : '+res.cap+' / 40');
  chk(all.every(r=>r.coins<=40+10+5+12+3),'aucune partie au-delà de 70 pièces (max théorique)');
  chk(res.quick<=8,'chute rapide (6 s) : '+res.quick+' pièces (cible 0 à 8)');chk(res.dbl===res.quick,'pas de double crédit (finalize ×2) : +'+res.dbl);
  chk(over===0,'aucun ramassage pendant l\'écran de chute');
  const mean=all.filter(r=>r.t>=20).reduce((a,r)=>a+r.coins,0)/all.filter(r=>r.t>=20).length;console.log('moyenne par partie (pilote auto, ≥ 20 s) : '+mean.toFixed(1)+' → 1 machine toutes les '+(150/mean).toFixed(1)+' parties');
  chk(errs.length===0,'aucune erreur JS '+errs.slice(0,3).join(' | '));
  console.log(`TOTAL ${ok} / ${ok+ko}`);await b.close();process.exit(ko?1:0)})();
