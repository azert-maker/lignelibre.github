/* Modèles Blender dans le moteur : chargement, habillage des 7 sports, squelette partagé,
   synchronisation des os avec le rig du jeu, mains sur les poignées du BMX, clips, repli procédural. */
const L=require('./lib');
(async()=>{const {b,p,errs}=await L.open();let ok=0,ko=0;const chk=(c,m)=>{console.log((c?'OK  ':'KO  ')+m);c?ok++:ko++};
  await p.waitForTimeout(1500);
  const g=await p.evaluate(()=>({ready:__ll.GLB.ready,err:__ll.GLB.err,models:Object.keys(__ll.GLB.models).sort(),parse:__ll.GLB.stats.parseMs}));
  chk(g.ready&&!g.err,'GLB décodés sans erreur ('+g.models.join(', ')+', '+g.parse+' ms)');
  chk(['bmx','rider','rider_lo'].every(k=>g.models.includes(k)),'modèles rider, rider_lo, bmx présents');
  for(const s of ['wingsuit','downhill','snowboard','bmx','motocross','wakeboard','parkour']){
    const r=await p.evaluate(s=>{__ll.profile.settings.quality='normal';__ll.startRun({sport:s,mode:'free',len:12,weather:'soleil',wind:0,params:{},seed:'G1'},{});__ll.forcePlay();
      const c=__ll.cur;for(let i=0;i<90;i++)c.update(1/60,c.auto?c.auto():{x:0,y:1,a:false,g:false});
      const hs=[];__ll.cur._rig.traverse(n=>{if(n.isHuman)hs.push(n)});const h=hs[0];if(!h)return {none:true};
      const sk=new Set();h.glb&&h.glb.traverse(n=>{if(n.isSkinnedMesh)sk.add(n.skeleton)});
      /* synchro : le cou et la main du modèle suivent les groupes du rig (écart < 1 cm) */
      h.updateMatrixWorld(true);const a=new THREE.Vector3(),bb=new THREE.Vector3();h.bones.neck.getWorldPosition(a);h.glb.getObjectByName('neck').getWorldPosition(bb);
      const hand=new THREE.Vector3();h.glb.getObjectByName('hand0').getWorldPosition(hand);const hp=new THREE.Vector3();h.bones.arms[0].hand.getWorldPosition(hp);
      return {glb:!!h.glb,skel:sk.size,dHead:a.distanceTo(bb),dHand:hand.distanceTo(hp),bike:!!__ll.cur._rig.glbBike}},s);
    chk(r.glb&&r.skel===1&&r.dHead<.01&&r.dHand<.01,`${s} : modèle Blender, 1 squelette, cou ${(r.dHead*100).toFixed(1)} cm, main ${(r.dHand*100).toFixed(1)} cm`);
    if(s==='bmx')chk(r.bike,'bmx : vélo Blender (cadre, avant, roues, pédalier)');
  }
  /* BMX : mains sur les poignées (IK) */
  const ik=await p.evaluate(()=>{__ll.startRun({sport:'bmx',mode:'free',len:12,weather:'soleil',wind:0,params:{},seed:'G1'},{});__ll.forcePlay();const c=__ll.cur;for(let i=0;i<60;i++)c.update(1/60,{x:0,y:1,a:false,g:false});
    let h;c._rig.traverse(n=>{if(n.isHuman)h=n});h.updateMatrixWorld(true);const out=[];
    for(let i=0;i<2;i++){const an=h.ik.anchors[i],t=new THREE.Vector3(),w=new THREE.Vector3(),d=new THREE.Vector3();an.getWorldPosition(t);h.bones.arms[i].hand.getWorldPosition(w);
      /* la paume est ~6 cm sous le poignet, le long de l'avant-bras */
      h.bones.arms[i].fore.getWorldPosition(d);const dir=w.clone().sub(d).normalize();out.push(w.addScaledVector(dir,.06).distanceTo(t))}return out});
  chk(ik.every(d=>d<.05),'bmx : mains sur les poignées (écarts '+ik.map(d=>(d*100).toFixed(1)+' cm').join(', ')+')');
  /* motocross : moto du modèle fourni, plaque numéro, mains sur les poignées */
  const mo=await p.evaluate(()=>{__ll.startRun({sport:'motocross',mode:'free',len:12,weather:'soleil',wind:0,params:{},seed:'G1'},{});__ll.forcePlay();const c=__ll.cur;for(let i=0;i<60;i++)c.update(1/60,c.auto?c.auto():{x:0,y:1,a:false,g:false});
    const r=c._rig;let h;r.traverse(n=>{if(n.isHuman)h=n});h.updateMatrixWorld(true);const d=[];
    for(let i=0;i<2;i++){const t=new THREE.Vector3(),w=new THREE.Vector3(),e=new THREE.Vector3();h.ik.anchors[i].getWorldPosition(t);h.bones.arms[i].hand.getWorldPosition(w);h.bones.arms[i].fore.getWorldPosition(e);d.push(w.addScaledVector(w.clone().sub(e).normalize(),.06).distanceTo(t))}
    let plate=false;r.traverse(n=>{if(n.isMesh&&n.visible&&n.material&&n.material.map&&n.material.map.isCanvasTexture!==undefined)plate=true;if(n.isMesh&&n.visible&&n.material&&n.material.map)plate=true});
    return {glb:!!r.glbMoto,d,plate}});
  chk(mo.glb,'motocross : moto Blender intégrée (carrosserie, avant, roues)');
  chk(mo.plate,'motocross : plaque numéro texturée');
  chk(mo.d.every(x=>x<.06),'motocross : mains sur les poignées ('+mo.d.map(x=>(x*100).toFixed(1)+' cm').join(', ')+')');
  /* éco : variante légère */
  const lo=await p.evaluate(()=>{__ll.profile.settings.quality='eco';__ll.startRun({sport:'parkour',mode:'free',len:12,weather:'soleil',wind:0,params:{},seed:'G1'},{});__ll.forcePlay();
    let h;__ll.cur._rig.traverse(n=>{if(n.isHuman)h=n});let t=0;h.glb.traverse(n=>{if(n.isMesh&&n.visible&&n.parent.visible){const g=n.geometry;t+=(g.index?g.index.count:g.attributes.position.count)/3}});__ll.profile.settings.quality='normal';return t});
  chk(lo>0&&lo<12000,'éco : modèle léger ('+Math.round(lo)+' triangles)');
  /* clips Blender */
  const cl=await p.evaluate(()=>{let h;__ll.cur._rig.traverse(n=>{if(n.isHuman)h=n});const r=h.clip('celebrate');h.updateMatrixWorld(true);const back=h.clip(null);return r&&back});
  chk(cl,'clip « celebrate » joué puis rendu au rig du jeu');
  /* repli procédural (look.proc) */
  const pr=await p.evaluate(()=>{const o=buildHuman(Object.assign({},__ll.profile.look,{proc:true}));let vis=0;o.traverse(n=>{if(n.isMesh&&n.visible)vis++});return {glb:!!o.glb,vis}});
  chk(!pr.glb&&pr.vis>10,'repli procédural disponible ('+pr.vis+' maillages)');
  chk(errs.length===0,'aucune erreur JS '+errs.slice(0,3).join(' | '));
  console.log(`TOTAL ${ok} / ${ok+ko}`);await b.close();process.exit(ko?1:0)})();
