/* Skins au garage : plus de mini-jeu de pince ; l'onglet Skins ouvre la machine à skins animée ; équiper ; rendu ; réseau. */
const L=require('./lib');const shots=process.argv.includes('--shots');
(async()=>{const {b,p,errs}=await L.open({vp:{width:1100,height:700}});let ok=0,ko=0;const chk=(c,m)=>{console.log((c?'OK  ':'KO  ')+m);c?ok++:ko++};
  await p.waitForTimeout(1200);
  await p.evaluate(()=>{__ll.profile.coins=1000;for(const k in __ll.profile.owned)delete __ll.profile.owned[k];go('garage');gTab='skins';paintGarage()});
  const tabs=await p.evaluate(()=>[...document.querySelectorAll('#garageTabs .tab')].map(t=>t.dataset.t));
  chk(!tabs.includes('claw')&&tabs.includes('skins'),'garage : plus d\'onglet « Machine » à piloter, onglet Skins présent');
  chk(await p.evaluate(()=>typeof clawPlay==='undefined'&&typeof paintClawPanel==='undefined'),'le mini-jeu d\'adresse est retiré du code');
  /* le bouton de l'onglet Skins ouvre l'animation de récupération */
  await p.click('#toClaw');await p.waitForFunction(()=>CM.open&&(CL.g||CM.fallback),null,{timeout:15000});
  await p.click('#cmTry');await p.waitForFunction(()=>!document.querySelector('#cmReveal').hidden,null,{timeout:12000});
  const won=await p.evaluate(()=>{const it=CM.res.item;return {id:it.id,skin:!!it.skin,owned:!!profile.owned[it.id],coins:profile.coins}});
  chk(won.owned&&won.coins===850,'animation lancée depuis le garage, objet gagné et enregistré ('+won.id+'), −150 pièces');
  /* pendant l'animation, les flèches ne pilotent rien */
  const before=await p.evaluate(()=>CL.x);await p.keyboard.down('ArrowRight');await p.waitForTimeout(300);await p.keyboard.up('ArrowRight');
  chk(await p.evaluate(b=>CL.x===b,before),'les flèches ne déplacent pas la pince');
  await p.evaluate(()=>clawModalClose());
  /* équiper un skin et le voir sur le rider */
  const eq=await p.evaluate(()=>{const id='h_menthe';profile.owned[id]=true;const s=skinById(id);profile.look.sk[s.k]=id;gTab='skins';paintGarage();
    let found=false;gObj.traverse(n=>{if(n.isSkinnedMesh&&n.material&&n.material.color&&n.material.color.getHex()===s.c1)found=true});return {found,cards:document.querySelectorAll('#garageBody .item.skin').length}});
  chk(eq.found,'skin équipé visible sur le rider Blender');chk(eq.cards===15,'collection : 15 skins listés');
  if(shots){await p.waitForTimeout(400);await p.screenshot({path:'test-results/skins_tab.png'})}
  const all=await p.evaluate(()=>{for(const s of SKINCAT){profile.look.sk={s:s.k==='s'?s.id:'',h:s.k==='h'?s.id:''};const h=buildHuman(profile.look);scene.add(h);h.position.set(0,-500,0);__ll.ren.render(scene,camera);scene.remove(h);disposeTree(h)}profile.look.sk={s:'',h:''};return SKINCAT.length});
  chk(all===15,'les 15 skins se compilent et s\'affichent');
  const net=await p.evaluate(()=>{const L2=Object.assign({},profile.look,{sk:{s:'s_aurore',h:'bidon'}});const u=unpackLook(JSON.parse(JSON.stringify(packLook(L2))));return u.sk.s==='s_aurore'&&u.sk.h===''});
  chk(net,'multijoueur : skin transmis, identifiant inconnu rejeté');
  chk(errs.length===0,'aucune erreur JS '+errs.slice(0,3).join(' | '));
  console.log(`TOTAL ${ok} / ${ok+ko}`);await b.close();process.exit(ko?1:0)})();
