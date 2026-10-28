/* Boutique « Machine à skins » : carte, chances, débit unique, séquence animée, révélation, sauvegarde, doublon, mobile, repli 2D. */
const L=require('./lib');const shots=process.argv.includes('--shots');
(async()=>{let ok=0,ko=0;const chk=(c,m)=>{console.log((c?'OK  ':'KO  ')+m);c?ok++:ko++};
 for(const mobile of [false,true]){
  const {chromium}=require('playwright');const path=require('path');
  const {b,p,errs}=mobile?await(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});const c=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
      await p.goto('file://'+path.resolve(__dirname,'../dist/test.html'));await p.waitForTimeout(1500);await p.evaluate(()=>{__ll.profile.settings.adsDemo=false});return {b,p,errs}})():await L.open({vp:{width:1100,height:760}});
  const tag=mobile?'[mobile] ':'';
  await p.waitForTimeout(800);await p.evaluate(()=>{__ll.profile.coins=1000;for(const k in __ll.profile.owned)delete __ll.profile.owned[k];go('shop')});
  const card=await p.evaluate(()=>{const c=document.querySelector('[data-shop="claw"]');return c?{txt:c.textContent,odds:c.querySelectorAll('.cm-odds span').length}:null});
  chk(card&&/Machine à skins/.test(card.txt)&&/150 pièces/.test(card.txt)&&card.odds===5,tag+'carte « Machine à skins » visible, coût 150, 5 raretés affichées');
  if(mobile)await p.tap('#openClaw');else await p.click('#openClaw');
  await p.waitForFunction(()=>CM.open&&(CL.g||CM.fallback),null,{timeout:15000});
  if(shots)await p.screenshot({path:`test-results/shopclaw_open${mobile?'_m':''}.png`});
  /* double clic : un seul débit */
  const c0=await p.evaluate(()=>profile.coins);
  if(mobile){await p.tap('#cmTry');await p.tap('#cmTry',{force:true,timeout:1500}).catch(()=>{})}else{await p.click('#cmTry');await p.click('#cmTry',{force:true,timeout:1500}).catch(()=>{})}
  const st=await p.evaluate(()=>({coins:profile.coins,busy:CM.busy,close:document.querySelector('#cmClose').disabled,tryb:document.querySelector('#cmTry').disabled,owned:Object.keys(profile.owned).length}));
  chk(c0-st.coins===150,tag+'débit immédiat et unique malgré le double clic (−'+(c0-st.coins)+')');
  chk(st.busy&&st.close&&st.tryb,tag+'Fermer et Tenter bloqués pendant l\'animation');
  chk(st.owned===1,tag+'objet enregistré dans profile.owned dès le paiement');
  const t0=Date.now();const seen=new Set();
  while(Date.now()-t0<9000){const s=await p.evaluate(()=>({st:CL.st,rev:!document.querySelector('#cmReveal').hidden}));seen.add(s.st);if(s.rev)break;if(shots&&s.st==='close'&&!seen.has('shot')){seen.add('shot');await p.screenshot({path:`test-results/shopclaw_grab${mobile?'_m':''}.png`})}await p.waitForTimeout(60)}
  const dur=(Date.now()-t0)/1000;
  const rv=await p.evaluate(()=>{const r=document.querySelector('#cmReveal');return {vis:!r.hidden,txt:r.textContent,rar:r.querySelector('.cm-rar')&&r.querySelector('.cm-rar').textContent,bc:getComputedStyle(r).borderColor,close:document.querySelector('#cmClose').disabled}});
  chk(['down','close','up','carry','drop'].every(x=>seen.has(x)),tag+'séquence complète : '+[...seen].filter(x=>x!=='shot').join(' → '));
  chk(rv.vis&&dur>=2.2&&dur<=7,tag+'révélation après '+dur.toFixed(1)+' s (rendu logiciel)');
  chk(!!rv.rar&&/Commun|Peu commun|Rare|Épique|Légendaire/.test(rv.rar),tag+'rareté affichée : '+rv.rar+' · '+rv.txt.slice(rv.rar.length,rv.rar.length+40));
  chk(!rv.close,tag+'Fermer réactivé après la révélation');
  if(shots)await p.screenshot({path:`test-results/shopclaw_reveal${mobile?'_m':''}.png`});
  /* la machine ne donne que du cosmétique */
  const pool=await p.evaluate(()=>{const P=rewardPool();return {n:P.length,eq:P.filter(x=>x.shop&&x.shop.kind!=='Cosmétique').length,per:RAR_KEYS.map(k=>P.filter(x=>x.r===k).length).join('/')}});
  chk(pool.eq===0&&pool.per.split('/').every(n=>+n>0),tag+'récompenses 100 % cosmétiques ('+pool.n+' objets, par rareté '+pool.per+')');
  /* doublon : tout est possédé → remboursement 40 % */
  const dup=await p.evaluate(()=>{for(const x of rewardPool())profile.owned[x.id]=true;const c=profile.coins;const r=grantReward('c');return {dup:r.dup,refund:r.refund,d:profile.coins-c}});
  chk(dup.dup&&dup.refund===60&&dup.d===60,tag+'doublon : +60 pièces (40 % de 150), affiché');
  /* pas assez de pièces */
  const poor=await p.evaluate(()=>{profile.coins=20;clawModalSync();return document.querySelector('#cmTry').disabled});chk(poor,tag+'sans 150 pièces, Tenter est désactivé');
  /* fermeture propre, boutique intacte */
  await p.evaluate(()=>{clawModalClose()});const after=await p.evaluate(()=>({modal:!document.querySelector('#clawModal')||document.querySelector('#clawModal').hidden,cards:document.querySelectorAll('#shopBody .shopcard').length}));
  chk(after.modal&&after.cards>=19,tag+'modal fermée, boutique intacte ('+after.cards+' cartes)');
  if(!mobile){/* chances : 20 000 tirages */const h=await p.evaluate(()=>{const S_=skinState();const n={};for(let i=0;i<20000;i++){S_.pity=0;const r=rollRarity();n[r]=(n[r]||0)+1}return n});
    const pct=k=>h[k]/200;chk(Math.abs(pct('c')-50)<2&&Math.abs(pct('u')-28)<2&&Math.abs(pct('r')-14)<1.5&&Math.abs(pct('e')-6)<1&&Math.abs(pct('l')-2)<.6,'chances mesurées : '+['c','u','r','e','l'].map(k=>pct(k).toFixed(1)+' %').join(' / '));
    /* repli 2D si le modèle 3D manque */
    const fb=await p.evaluate(async()=>{profile.coins=1000;const sv=GLB.models.claw;delete GLB.models.claw;delete ASSET_GLB.claw;delete GLB_PEND.claw;clawModalOpen();await new Promise(r=>setTimeout(r,300));const okFb=CM.fallback;clawTry();await new Promise(r=>setTimeout(r,4200));const rev=!document.querySelector('#cmReveal').hidden;CM.busy=false;clawModalClose();GLB.models.claw=sv;return {okFb,rev}});
    chk(fb.okFb&&fb.rev,'repli 2D (sans modèle 3D) : animation et révélation');}
  chk(errs.length===0,tag+'aucune erreur JS '+errs.slice(0,3).join(' | '));
  await b.close()}
 console.log(`TOTAL ${ok} / ${ok+ko}`);process.exit(ko?1:0)})();
