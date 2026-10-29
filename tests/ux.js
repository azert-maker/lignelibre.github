/* Parcours de lancement (0.23.2) : départ en 1 clic, choix mémorisés, pas de choix redemandé, pièces jamais bleues. */
const {chromium}=require('playwright');const path=require('path');
const FILE='file://'+path.resolve(__dirname,'../dist/test.html');
async function open(vp,touch){const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});const ctx=await b.newContext(touch?{viewport:vp,isMobile:true,hasTouch:true}:{viewport:vp});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
  await p.goto(FILE);await p.waitForTimeout(2200);await p.evaluate(()=>{__ll.profile.settings.adsDemo=false});return {b,p,errs}}
const st=p=>p.evaluate(()=>({state:__ll.state,sport:__ll.run&&__ll.run.cfg.sport,mode:__ll.run&&__ll.run.cfg.mode,weather:__ll.run&&__ll.run.cfg.weather}));
const inView=(p,sel)=>p.evaluate(s=>{const e=document.querySelector(s);if(!e||e.offsetParent===null)return false;const r=e.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight&&r.left>=0&&r.right<=innerWidth},sel);
const menu=p=>p.evaluate(()=>{document.getElementById('btnPause').click();document.getElementById('btnQuit').click()});
(async()=>{let ok=0,ko=0;const chk=(c,m)=>{console.log((c?'OK  ':'KO  ')+m);c?ok++:ko++};
  for(const [name,vp,touch] of [['bureau 1280×720',{width:1280,height:720},false],['mobile 844×390',{width:844,height:390},true]]){
    const {b,p,errs}=await open(vp,touch);
    chk(await inView(p,'#qGo'),`[${name}] bouton Jouer visible sans défiler`);
    chk(await inView(p,'#sportStrip'),`[${name}] choix du sport visible sans défiler`);
    /* 1 clic : premier lancement = Downhill monde libre */
    await p.click('#qGo',{timeout:5000});await p.waitForTimeout(300);let s=await st(p);/* vrai clic : rien ne recouvre le bouton */
    chk(s.state==='count'||s.state==='play',`[${name}] 1 clic suffit pour lancer (${s.sport} · ${s.mode})`);chk(s.sport==='longboard'&&s.mode==='free',`[${name}] défaut premier lancement : Downhill, monde libre`);
    await menu(p);await p.waitForTimeout(400);
    /* choisir BMX + Parcours : 3 clics, mémorisés au retour */
    await p.click('#sportStrip [data-s="bmx"]',{timeout:5000});await p.click('#qMode [data-m="course"]',{timeout:5000});
    const sub=await p.textContent('#qGoSub');chk(/BMX/.test(sub)&&/chrono/i.test(sub),`[${name}] le bouton annonce le choix (« ${sub} »)`);
    await p.click('#qGo',{force:true});await p.waitForTimeout(300);s=await st(p);chk(s.sport==='bmx'&&s.mode==='course',`[${name}] sport + mode + Jouer = BMX parcours`);
    await menu(p);await p.waitForTimeout(400);
    const kept=await p.evaluate(()=>({sp:document.querySelector('#sportStrip [aria-checked="true"]').dataset.s,m:document.querySelector('#qMode [aria-checked="true"]').dataset.m,prev:__ll.state}));
    chk(kept.sp==='bmx'&&kept.m==='course',`[${name}] retour au menu : BMX et parcours toujours sélectionnés`);
    /* Personnaliser : le mode n'est pas redemandé, réglages appliqués, retour sans perte */
    await p.click('#qCustom',{force:true});await p.waitForTimeout(200);
    const su=await p.evaluate(()=>({title:document.getElementById('setupTitle').textContent,modeRow:!!document.querySelector('#setupBody [data-row="mode"]'),screen:!document.getElementById('setup').hidden}));
    chk(su.screen&&!su.modeRow&&/BMX/.test(su.title),`[${name}] Personnaliser : pas de second choix du mode (« ${su.title} »)`);
    await p.click('#setupBody [data-row="weather"] .chip:nth-child(2)',{force:true});await p.click('#setup [data-back]',{force:true});await p.waitForTimeout(200);
    const back=await p.evaluate(()=>({home:!document.getElementById('home').hidden,sp:document.querySelector('#sportStrip [aria-checked="true"]').dataset.s}));chk(back.home&&back.sp==='bmx',`[${name}] retour depuis Personnaliser : accueil, sélection conservée`);
    await p.click('#qCustom',{force:true});await p.waitForTimeout(150);await p.click('#setupBody [data-row="weather"] .chip:nth-child(2)',{force:true});await p.click('#btnLaunch',{force:true});await p.waitForTimeout(300);s=await st(p);
    const w2=await p.evaluate(()=>Object.keys(WEATHER)[1]);chk(s.sport==='bmx'&&s.mode==='course'&&s.weather===w2,`[${name}] Personnaliser puis Lancer : réglage appliqué (${s.weather})`);
    /* parties successives (touche Encore une) sans pub de démonstration */
    let ad=false;for(let i=0;i<5;i++){await p.evaluate(()=>{document.getElementById('btnPause').click()});await p.evaluate(()=>{document.getElementById('pause').hidden=true;__ll.finalizeRun(true)});
      await p.evaluate(()=>__ll.startRun(__ll.run.cfg,{}));await p.waitForTimeout(80);if((await st(p)).state==='ad')ad=true}
    chk(!ad,`[${name}] 5 parties d'affilée sans attente de pub de démonstration`);
    await menu(p);await p.waitForTimeout(300);
    /* Découvrir : le bouton de mode lance directement */
    await p.click('#quick [data-go="play"]',{force:true});await p.waitForTimeout(400);await p.click('.scard[data-sport="wakeboard"]',{force:true});await p.waitForTimeout(300);
    await p.click('.scard[data-sport="wakeboard"] [data-mode="free"]',{force:true});await p.waitForTimeout(300);s=await st(p);
    chk(s.sport==='wakeboard'&&s.mode==='free'&&(s.state==='count'||s.state==='play'),`[${name}] Découvrir : carte + mode = partie lancée, sans écran de réglages`);
    await menu(p);await p.waitForTimeout(300);
    /* défi du jour / parcours du jour : lancement direct */
    await p.click('#heCourse',{force:true});await p.waitForTimeout(300);s=await st(p);chk((s.state==='count'||s.state==='play')&&s.mode==='course',`[${name}] « Courir » le parcours du jour lance directement (${s.sport})`);
    await menu(p);await p.waitForTimeout(300);
    /* salon multijoueur : là, le mode est demandé (aucun choix préalable) */
    const host=await p.evaluate(()=>{setup=loadSetup('bmx');hostMode=true;go('setup');const r=!!document.querySelector('#setupBody [data-row="mode"]');hostMode=false;go('home');return r});chk(host,`[${name}] création de salon : le mode reste proposé`);
    chk(errs.length===0,`[${name}] aucune erreur JS `+errs.slice(0,3).join(' | '));await b.close()}
  /* pièces : jamais bleues (bonus dorés à anneau, pas de teinte de brouillard), mesuré à l'écran */
  {const {b,p,errs}=await open({width:960,height:540});
    const r=await p.evaluate(async()=>{__ll.startRun({sport:'snowboard',mode:'free',len:12,weather:'soleil',wind:0,params:{},seed:'C1'},{});__ll.forcePlay();const C=__ll.COIN,c=__ll.cur;for(let i=0;i<30;i++){c.update(1/60,{x:0,y:0,a:false,g:false})}
      C.list.length=0;const P=new THREE.Vector3();camera.getWorldDirection(P);const out=[];
      for(const [d,risk] of [[12,false],[14,true],[160,false],[190,true]]){const q=camera.position.clone().addScaledVector(P,d);C.list.push({x:q.x,y:q.y,z:q.z,v:risk?2:1,risk,t:0,life:99,pick:-1,ph:0})}
      window.__frzCoins=true;const st0=__ll.state;__ll.coinsTick(0);
      return {fogOff:C.inst.material.fog===false&&C.ring.material.fog===false,ringN:C.ring.count,cols:[0,1,2,3].map(i=>{const a=C.inst.instanceColor.array;return [a[i*3],a[i*3+1],a[i*3+2]].map(v=>+v.toFixed(2))})}});
    chk(r.fogOff,'pièces et anneaux hors brouillard (plus de pièces lointaines teintées de bleu)');chk(r.ringN===2,'un anneau par pièce bonus, aucun sur les pièces normales');
    chk(r.cols.every(c=>c[0]>=c[2]+.5&&c[1]>=c[2]+.3),'toutes les teintes de pièces sont dorées '+JSON.stringify(r.cols));
    chk(errs.length===0,'aucune erreur JS '+errs.slice(0,3).join(' | '));await b.close()}
  console.log(`TOTAL ${ok} / ${ok+ko}`);process.exit(ko?1:0)})();
