/* 0.23 : lieux (Paris, Havasu, Glen Helen, Tamalpais), reprise gratuite en monde libre, quitter crédite une fois, clip de célébration. */
const L=require('./lib');
(async()=>{const {b,p,errs}=await L.open();let ok=0,ko=0;const chk=(c,m)=>{console.log((c?'OK  ':'KO  ')+m);c?ok++:ko++};await p.waitForTimeout(1200);
  const dec=await p.evaluate(()=>{const r={};const scan=(sp,f)=>{__ll.startRun({sport:sp,mode:'free',len:12,weather:'soleil',wind:0,params:{},seed:'P1'},{});__ll.forcePlay();let n=0;__ll.cur._rig.parent.traverse(o=>{if(f(o))n++});return n};
    r.eiffel=scan('parkour',o=>o.isMesh&&o.geometry.attributes.position&&o.geometry.boundingSphere===null&&(o.geometry.computeBoundingBox(),o.geometry.boundingBox.max.y>140));
    r.bridge=scan('wakeboard',o=>o.isMesh&&(o.geometry.computeBoundingBox(),o.geometry.boundingBox.max.x-o.geometry.boundingBox.min.x>140&&o.geometry.boundingBox.max.y<20&&o.geometry.boundingBox.max.y>12));
    r.palms=scan('wakeboard',o=>o.isInstancedMesh&&o.geometry===_palm);
    r.stand=scan('motocross',o=>o.name==='grandstand');
    r.fog=scan('longboard',o=>o.isMesh&&o.material&&o.material.map===_fogTex);
    r.tints=['parkour','wakeboard','motocross','longboard'].every(s=>!!PLACE_TINT[s]);return r});
  chk(dec.eiffel>=1,'Paris Rooftops : tour Eiffel au loin');chk(dec.bridge>=1&&dec.palms>=1,'Lake Havasu : pont de pierre et palmiers sur la rive');
  chk(dec.stand>=1,'Glen Helen : tribune');chk(dec.fog>=1,'Mount Tamalpais : mer de nuages');chk(dec.tints,'ciel propre aux 4 lieux');
  /* reprise gratuite (monde libre, 1 fois) */
  const rc=await p.evaluate(async()=>{const P=__ll.profile;P.cons.revive=0;__ll.Ads.available=()=>false;__ll.startRun({sport:'bmx',mode:'free',len:12,weather:'soleil',wind:0,params:{},seed:'R1'},{});__ll.forcePlay();const c=__ll.cur;for(let i=0;i<300;i++)c.update(1/60,c.auto());
    __ll.crashNow();await new Promise(r=>setTimeout(r,1700));const btn=document.getElementById('btnContinue');const t1=!btn.hidden&&btn.textContent;btn.click();await new Promise(r=>setTimeout(r,100));const st1=__ll.state;
    __ll.forcePlay();__ll.crashNow();await new Promise(r=>setTimeout(r,1700));const t2=btn.hidden?'caché':btn.textContent;return {t1,st1,t2}});
  chk(/gratuit/.test(rc.t1||'')&&rc.st1!=='over','monde libre : « '+rc.t1+' » relance la partie');chk(rc.t2==='caché','reprise gratuite une seule fois par partie (ensuite : '+rc.t2+')');
  /* quitter depuis la pause : crédit unique */
  const q=await p.evaluate(async()=>{const P=__ll.profile;__ll.startRun({sport:'longboard',mode:'free',len:12,weather:'soleil',wind:0,params:{},seed:'Q1'},{});__ll.forcePlay();const c=__ll.cur;
    for(let i=0;i<60*25;i++){c.update(1/60,c.auto());__ll.coinsTick(1/60)}const v=__ll.COIN.val;const c0=P.coins;document.getElementById('btnQuit').click();const c1=P.coins;__ll.finalizeRun(true);return {v,gain:c1-c0,again:P.coins-c1}});
  chk(q.gain>=q.v&&q.v>0,'quitter crédite les pièces ramassées ('+q.v+' ramassées, +'+q.gain+')');chk(q.again===0,'pas de second crédit après avoir quitté');
  /* célébration : clip Blender sur l'écran de fin avec médaille */
  const cel=await p.evaluate(async()=>{__ll.startRun({sport:'snowboard',mode:'course',len:1,weather:'soleil',wind:0,params:{},seed:'C1'},{});__ll.forcePlay();const c=__ll.cur;let called=null;const hm=c._rig.human;if(!hm||!hm.clip)return 'pas de GLB';const o=hm.clip;hm.clip=n=>{called=n;return o(n)};
    for(let i=0;i<60*120&&!__ll.run.finished;i++){c.update(1/60,c.auto());if(__ll.state==='over'&&!__ll.run.finished)__ll.forcePlay()}const medal=__ll.profile.history[0]&&__ll.profile.history[0].medal;await new Promise(r=>setTimeout(r,900));return {fin:__ll.run.finished,medal,called}});
  chk(cel.fin&&(cel.medal==='n'||cel.called==='celebrate'),'snowboard : clip « celebrate » à l\'arrivée avec médaille '+JSON.stringify(cel));
  chk(errs.length===0,'aucune erreur JS '+errs.slice(0,3).join(' | '));
  console.log(`TOTAL ${ok} / ${ok+ko}`);await b.close();process.exit(ko?1:0)})();
