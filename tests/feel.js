/* Gameplay et lieux : snowboard sans blocage, réceptions wakeboard justes, décors signature des 3 lieux prioritaires. */
const L=require('./lib');
(async()=>{const {b,p,errs}=await L.open();let ok=0,ko=0;const chk=(c,m)=>{console.log((c?'OK  ':'KO  ')+m);c?ok++:ko++};await p.waitForTimeout(1200);
  /* snowboard : 4 graines, 40 s de pilote auto, jamais bloqué plus de 3 s sous 5 km/h */
  for(const seed of ['A1','B2','C3','F6']){const r=await p.evaluate(seed=>{__ll.startRun({sport:'snowboard',mode:'free',len:12,weather:'soleil',wind:0,params:{},seed},{});__ll.forcePlay();const c=__ll.cur;let slow=0,worst=0;
      for(let i=0;i<60*40;i++){c.update(1/60,c.auto());const s=c._st();if(!s.air&&s.vel.length()<1.4)slow+=1/60;else slow=0;worst=Math.max(worst,slow);if(__ll.state!=='play')__ll.forcePlay()}return worst},seed);
    chk(r<3,`snowboard ${seed} : pas de blocage (arrêt max ${r.toFixed(1)} s)`)}
  /* wakeboard : un wake jump aligné n'est plus « limite » */
  const wk=await p.evaluate(()=>{__ll.startRun({sport:'wakeboard',mode:'free',len:12,weather:'soleil',wind:0,params:{},seed:'A1'},{});__ll.forcePlay();const c=__ll.cur;const n={};const o=sfx.land;sfx.land=(q,k)=>{n[q]=(n[q]||0)+1;o(q,k)};
    for(let i=0;i<60*45;i++){c.update(1/60,c.auto());if(__ll.state!=='play')__ll.forcePlay()}sfx.land=o;return n});
  chk((wk.perfect||0)+(wk.clean||0)>(wk.sketchy||0)&&(wk.perfect||0)>0,'wakeboard : réceptions alignées notées parfaites ('+JSON.stringify(wk)+')');
  /* lieux */
  const pl=await p.evaluate(()=>{const o={};for(const s of ['bmx','wingsuit','snowboard','motocross','wakeboard','parkour','longboard'])o[s]=SPORTS[s].place;return o});
  chk(pl.bmx==='Venice Beach Park'&&pl.wingsuit==='Lauterbrunnen Valley'&&pl.snowboard==='Whistler Blackcomb'&&pl.motocross==='Glen Helen MX'&&pl.wakeboard==='Lake Havasu'&&pl.parkour==='Paris Rooftops'&&pl.longboard==='Mount Tamalpais','noms des 7 lieux');
  const ve=await p.evaluate(()=>{__ll.startRun({sport:'bmx',mode:'free',len:12,weather:'soleil',wind:0,params:{},seed:'P1'},{});__ll.forcePlay();const root=__ll.cur._rig.parent;let palms=0,ring=0,shape=0;root.traverse(n=>{if(n.isInstancedMesh&&n.geometry===_palm)palms+=n.count;if(n.geometry&&n.geometry.type==='RingGeometry')ring++;if(n.geometry&&n.geometry.type==='ShapeGeometry')shape++});return {palms,ring,shape,fog:scene.fog.color.getHexString()}});
  chk(ve.palms>=10&&ve.ring>=1&&ve.shape>=1,`Venice Beach : ${ve.palms} palmiers, plage, montagnes, brume ${ve.fog}`);
  const la=await p.evaluate(()=>{__ll.startRun({sport:'wingsuit',mode:'free',len:12,weather:'soleil',wind:0,params:{},seed:'P1'},{});__ll.forcePlay();const c=__ll.cur;for(let i=0;i<60*6;i++)c.update(1/60,c.auto());
    const root=__ll.cur._rig.parent;let falls=0,chalets=0;root.traverse(n=>{if(n.material&&n.material.map&&FALLS.includes(n.material.map))falls++;if(n.isInstancedMesh&&n.geometry===_chalet)chalets+=n.count});
    const s=c._st?null:null;const z=-200,x=__ll.cur._h?null:null;return {falls,chalets}});
  chk(la.falls>=1&&la.chalets>=2,`Lauterbrunnen : ${la.falls} cascades, ${la.chalets} chalets, falaises`);
  const wh=await p.evaluate(async()=>{await glbLoad('snowpark');__ll.startRun({sport:'snowboard',mode:'free',len:12,weather:'soleil',wind:0,params:{},seed:'P1'},{});__ll.forcePlay();const c=__ll.cur;for(let i=0;i<60*20;i++){c.update(1/60,c.auto());if(__ll.state!=='play')__ll.forcePlay()}
    const root=__ll.cur._rig.parent;let fences=0,mods=0;root.traverse(n=>{if(n.isInstancedMesh&&n.geometry===_fence)fences+=n.count;if(/^sp_/.test(n.name))mods++});return {fences,mods}});
  chk(wh.fences>=3&&wh.mods>=1,`Whistler : ${wh.fences} filets, ${wh.mods} modules de snowpark Blender`);
  chk(errs.length===0,'aucune erreur JS '+errs.slice(0,3).join(' | '));
  console.log(`TOTAL ${ok} / ${ok+ko}`);await b.close();process.exit(ko?1:0)})();
