/* Machine à pinces et skins : chargement différé, partie complète, gain d'un skin, équipement, rendu, coût en pièces. */
const L=require('./lib');const shots=process.argv.includes('--shots');
(async()=>{const {b,p,errs}=await L.open({vp:{width:1100,height:700}});let ok=0,ko=0;const chk=(c,m)=>{console.log((c?'OK  ':'KO  ')+m);c?ok++:ko++};
  await p.waitForTimeout(1200);
  await p.evaluate(()=>{__ll.profile.coins=5000;go('garage');gTab='claw';paintGarage()});
  await p.waitForFunction(()=>CL.g&&gObj===CL.g.root,null,{timeout:15000}).catch(()=>{});
  const s0=await p.evaluate(()=>({loaded:!!GLB.models.claw,toys:CL.toys.length,rar:CL.toys.map(t=>t.r).join(''),panel:!!document.querySelector('#clawPlay')}));
  chk(s0.loaded&&s0.toys===8&&s0.panel,`machine chargée à la demande, ${s0.toys} peluches (${s0.rar}), bouton Jouer`);
  if(shots)await p.screenshot({path:'test-results/claw_idle.png'});
  /* partie : pièces débitées, déplacement clavier, descente, prise, transport, trappe */
  const c0=await p.evaluate(()=>__ll.profile.coins);await p.click('#clawPlay');
  const [c1,COST]=await p.evaluate(()=>[__ll.profile.coins,CLAW_COST]);chk(c0-c1===COST,'une partie coûte '+COST+' pièces (du jeu)');
  const x0=await p.evaluate(()=>CL.x);await p.keyboard.down('ArrowRight');await p.waitForTimeout(700);await p.keyboard.up('ArrowRight');
  const x1=await p.evaluate(()=>CL.x);chk(x1>x0+.05,'la pince se déplace aux flèches ('+(x1-x0).toFixed(2)+' m)');
  /* viser exactement une peluche puis lâcher (Espace) */
  await p.evaluate(()=>{const t=CL.toys.find(t=>!t.gone);CL.x=t.o.position.x;CL.z=t.o.position.z;window.__target=t;for(const r in RARITY)RARITY[r].__g=RARITY[r].grip;for(const r in RARITY)RARITY[r].grip=1});
  if(shots){await p.waitForTimeout(200);await p.screenshot({path:'test-results/claw_aim.png'})}
  await p.keyboard.press('Space');
  await p.waitForFunction(()=>CL.st==='up'||CL.st==='carry',null,{timeout:15000});
  if(shots)await p.screenshot({path:'test-results/claw_grab.png'});
  const held=await p.evaluate(()=>!!CL.held&&CL.held===window.__target);chk(held,'peluche saisie quand la pince est centrée');
  await p.waitForFunction(()=>CL.st==='idle',null,{timeout:20000});
  const r=await p.evaluate(()=>{for(const r in RARITY)RARITY[r].grip=RARITY[r].__g;return {last:CL.last,owned:skinState().owned.slice(),gone:window.__target.gone}});
  chk(r.gone&&r.last&&(r.last.sk||r.last.dup),'peluche tombée dans la trappe : '+(r.last&&r.last.sk?r.last.sk.name+' ('+r.last.sk.r+')':'doublon'));
  chk(r.owned.length===1,'skin ajouté à la collection');
  if(shots)await p.screenshot({path:'test-results/claw_win.png'});
  /* équiper puis voir le rider avec le skin */
  const eq=await p.evaluate(()=>{const id=skinState().owned[0],s=skinById(id);profile.look.sk[s.k]=id;gTab='skins';paintGarage();
    let mat=null;gObj.traverse(n=>{if(n.isSkinnedMesh&&n.material&&(n.material.customProgramCacheKey&&n.material.customProgramCacheKey().startsWith('sk')||n.material.isMeshMatcapMaterial||(s.k==='h'&&n.material.color&&n.material.color.getHex()===s.c1)||(s.k==='s'&&n.material.color&&n.material.color.getHex()===s.c1)))mat=n.material});
    return {k:s.k,ok:!!mat,cards:document.querySelectorAll('#garageBody .item.skin').length}});
  chk(eq.ok,'skin équipé visible sur le rider Blender ('+(eq.k==='s'?'tenue':'casque')+')');
  chk(eq.cards===15,'collection : 15 skins listés');
  if(shots){await p.waitForTimeout(400);await p.screenshot({path:'test-results/skins_tab.png'})}
  /* tous les skins se compilent sans erreur (motifs, chrome, or, néon, aurore) */
  const all=await p.evaluate(async()=>{const out=[];for(const s of SKINCAT){profile.look.sk={s:s.k==='s'?s.id:'',h:s.k==='h'?s.id:''};const h=buildHuman(profile.look);scene.add(h);h.position.set(0,-500,0);__ll.ren.render(scene,camera);scene.remove(h);disposeTree(h);out.push(s.id)}profile.look.sk={s:'',h:''};return out.length});
  chk(all===15,'les 15 skins se compilent et s\'affichent');
  /* sans pièces : bouton désactivé */
  const poor=await p.evaluate(()=>{__ll.profile.coins=10;gTab='claw';paintGarage();const b=document.querySelector('#clawPlay');return b&&b.disabled});
  chk(poor,'sans assez de pièces, la partie est impossible');
  /* réseau : le skin passe dans le look compact et est validé */
  const net=await p.evaluate(()=>{const L2=Object.assign({},profile.look,{sk:{s:'s_aurore',h:'bidon'}});const u=unpackLook(JSON.parse(JSON.stringify(packLook(L2))));return u.sk.s==='s_aurore'&&u.sk.h===''});
  chk(net,'multijoueur : skin transmis, identifiant inconnu rejeté');
  chk(errs.length===0,'aucune erreur JS '+errs.slice(0,3).join(' | '));
  console.log(`TOTAL ${ok} / ${ok+ko}`);await b.close();process.exit(ko?1:0)})();
