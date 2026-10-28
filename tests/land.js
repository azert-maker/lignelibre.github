/* Réceptions et chutes : ressort de compression, qualités distinctes, plongée caméra, chute physique, reprise. */
const L=require('./lib');const shots=process.argv.includes('--shots');
(async()=>{const {b,p,errs}=await L.open({vp:{width:900,height:620}});let ok=0,ko=0;const chk=(c,m)=>{console.log((c?'OK  ':'KO  ')+m);c?ok++:ko++};
  await p.waitForTimeout(1200);
  /* 1. ressort : compression max, retour au repos, différence parfaite / limite */
  const sp=await p.evaluate(()=>{const out={};for(const q of ['perfect','clean','sketchy']){const h=buildHuman(Object.assign({},__ll.profile.look,{proc:true}));h.snapPose({});
      const base=h.bones.pelvis.position.y;let lastT=performance.now();const orig=performance.now.bind(performance);let t=orig();performance.now=()=>t;
      h.pose({crouch:.3});h.land(q,.8);let minY=9,wob=0,end=0;for(let i=0;i<90;i++){t+=1000/60;h.pose({crouch:.3});minY=Math.min(minY,h.bones.pelvis.position.y);wob=Math.max(wob,Math.abs(h.bones.torso.rotation.x));if(i===89)end=h.bones.pelvis.position.y}
      performance.now=orig;h.snapPose({crouch:.3});const rest=h.bones.pelvis.position.y;out[q]={drop:+(rest-minY).toFixed(3),wob:+wob.toFixed(3),settle:+Math.abs(end-rest).toFixed(4)}}return out});
  console.log(JSON.stringify(sp));
  chk(sp.clean.drop>.06&&sp.clean.settle<.01,`ressort : compression ${Math.round(sp.clean.drop*100)} cm puis retour au repos`);
  chk(sp.sketchy.drop>sp.clean.drop&&sp.clean.drop>sp.perfect.drop,'compression : limite > propre > parfaite');
  chk(sp.sketchy.wob>sp.perfect.wob+.05,'déséquilibre seulement en réception limite');
  /* 2. BMX en jeu : les réceptions passent par le système commun (son, caméra, ressort) */
  const bm=await p.evaluate(()=>{__ll.startRun({sport:'bmx',mode:'free',len:12,weather:'soleil',wind:0,params:{},seed:'L1'},{});__ll.forcePlay();const c=__ll.cur;const seen=[];const o=sfx.land;sfx.land=(q,k)=>{seen.push(q);o(q,k)};
      let t=0;for(let i=0;i<60*14;i++){t+=1/60;const st=c._st();const ch=(i%120)<40;c.update(1/60,{x:0,y:1,a:ch&&!st.air,g:false});if(__ll.state!=='play')__ll.forcePlay()}
      sfx.land=o;return {seen,dip:LOOK.dv!==0||LOOK.dx!==0}});
  chk(bm.seen.length>0,'BMX : réceptions remontées au système commun ('+bm.seen.length+' : '+[...new Set(bm.seen)].join(', ')+')');
  /* 3. snowboard : qualité de réception calculée et transmise */
  const sb=await p.evaluate(()=>{__ll.startRun({sport:'snowboard',mode:'free',len:12,weather:'soleil',wind:0,params:{},seed:'L1'},{});__ll.forcePlay();const c=__ll.cur;const seen=[];const o=sfx.land;sfx.land=(q,k)=>{seen.push(q);o(q,k)};
      for(let i=0;i<60*25;i++){const I=c.auto?c.auto():{x:0,y:0,a:false,g:false};c.update(1/60,I);if(__ll.state!=='play')__ll.forcePlay()}sfx.land=o;return seen});
  chk(sb.length>0,'snowboard : réceptions qualifiées ('+sb.length+' : '+[...new Set(sb)].join(', ')+')');
  /* 3b. motocross et parkour : réceptions qualifiées par le système commun (pilote automatique du jeu) */
  for(const sp_ of ['motocross','parkour']){const r=await p.evaluate(sp_=>{__ll.startRun({sport:sp_,mode:'free',len:12,weather:'soleil',wind:0,params:{},seed:'L1'},{});__ll.forcePlay();const c=__ll.cur;const seen=[];const o=sfx.land;sfx.land=(q,k)=>{seen.push(q);o(q,k)};
      for(let i=0;i<60*120&&seen.length<3;i++){const I=c.auto?c.auto():{x:0,y:1,a:(i%90)<10,g:false};c.update(1/60,I);if(__ll.state!=='play')__ll.forcePlay()}sfx.land=o;return seen},sp_);
    chk(r.length>0,sp_+' : réceptions qualifiées ('+r.length+' : '+[...new Set(r)].join(', ')+')')}
  /* 4. chute physique BMX : rider éjecté, au sol, vélo couché, puis reprise propre */
  await p.evaluate(()=>{__ll.startRun({sport:'bmx',mode:'free',len:12,weather:'soleil',wind:0,params:{},seed:'L2'},{});__ll.forcePlay()});
  await p.keyboard.down('ArrowUp');await p.waitForTimeout(2600);
  const before=await p.evaluate(()=>{let h;__ll.cur._rig.traverse(n=>{if(n.isHuman)h=n});return {hp:h.position.toArray(),v:RIGV.length()}});
  await p.evaluate(()=>__ll.crashNow());await p.keyboard.up('ArrowUp');
  if(shots)for(let i=0;i<6;i++){await p.waitForTimeout(220);await p.screenshot({path:`test-results/crash_${i}.png`})}
  await p.waitForFunction(()=>!crashFx||crashFx.simDone,null,{timeout:8000}).catch(()=>{});
  const after=await p.evaluate(()=>{const r=__ll.cur._rig;let h;r.traverse(n=>{if(n.isHuman)h=n});h.updateMatrixWorld(true);const c=h.bones.pelvis.getWorldPosition(new THREE.Vector3()),bk=r.getWorldPosition(new THREE.Vector3());
    const g=__ll.cur._h(c.x,c.z);const up=new THREE.Vector3(0,1,0).applyQuaternion(r.getWorldQuaternion(new THREE.Quaternion()));
    return {sep:Math.hypot(c.x-bk.x,c.z-bk.z),hAbove:c.y-g,bikeUp:up.y,nan:[c.x,c.y,c.z].some(v=>!isFinite(v)),state:__ll.state}});
  console.log(JSON.stringify({before,after}));
  chk(after.state==='over'&&!after.nan,'chute : écran de fin, positions valides');
  chk(after.sep>.8,`chute : rider éjecté à ${after.sep.toFixed(1)} m du vélo`);
  chk(after.hAbove<.6,`chute : rider au sol (bassin à ${after.hAbove.toFixed(2)} m)`);
  chk(after.bikeUp<.6,'chute : vélo couché sur le côté');
  const back=await p.evaluate(()=>{crashUndo();let h;__ll.cur._rig.traverse(n=>{if(n.isHuman)h=n});return {hp:h.position.toArray(),ik:h.ik&&h.ik.w}});
  chk(back.hp.every((v,i)=>Math.abs(v-before.hp[i])<1e-6)&&back.ik===1,'reprise : rider remis sur le vélo, mains sur le guidon');
  /* 5. chute parkour (rider sans véhicule) */
  await p.evaluate(()=>{__ll.startRun({sport:'parkour',mode:'free',len:12,weather:'soleil',wind:0,params:{},seed:'L2'},{});__ll.forcePlay()});
  await p.keyboard.down('ArrowUp');await p.waitForTimeout(1500);await p.evaluate(()=>__ll.crashNow());await p.keyboard.up('ArrowUp');await p.waitForFunction(()=>!crashFx||crashFx.simDone,null,{timeout:8000}).catch(()=>{});
  const pk=await p.evaluate(()=>{const h=__ll.cur._rig;h.updateMatrixWorld(true);const c=h.bones.pelvis.getWorldPosition(new THREE.Vector3());return {h:c.y-__ll.cur._h(c.x,c.z),ok:isFinite(c.y)}});
  chk(pk.ok&&pk.h<.7,`parkour : chute au sol (bassin à ${pk.h.toFixed(2)} m)`);
  chk(errs.length===0,'aucune erreur JS '+errs.slice(0,3).join(' | '));
  console.log(`TOTAL ${ok} / ${ok+ko}`);await b.close();process.exit(ko?1:0)})();
