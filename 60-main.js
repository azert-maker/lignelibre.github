/* =====================================================================
   BOUCLE DE JEU · partie, compte à rebours, chute / continuer, arrivée,
   récompenses, fantômes multijoueur
===================================================================== */
let state='menu',cur=null,curCfg=null,camMode=S().cam|0,runT=0,countT=0,run=null,previewId=null,previewW=null,hudAcc=1;
const DUMMY={trick(){},crash(){},finish(){},bonus(){},checkpoint(){},hud(){},cam:()=>0,boost:false};
function setCam(m){camMode=m;$$('[data-cam]').forEach(b=>b.setAttribute('aria-pressed',+b.dataset.cam===m))}
$$('[data-cam]').forEach(b=>b.onclick=()=>setCam(+b.dataset.cam));
function defaultParams(id){const p={};SPORTS[id].params.forEach(x=>p[x.k]=x.bool?x.def===1:x.def);return p}
/* aperçu en direct : le vrai mode piloté par son pilote automatique */
let demo=null;
function previewSport(id,w,force){w=w||(profile.last[id]&&profile.last[id].weather)||'soleil';
  if(!force&&cur&&!run&&demo&&previewId===id){if(previewW!==w){previewW=w;applyEnv(cur.env,w)}return}
  if(cur)cur.dispose();ghostsClear();run=null;previewId=id;previewW=w;quiet=true;
  const dctx=Object.assign({},DUMMY,{crash(){if(demo)demo.reset=.8},finish(){if(demo)demo.reset=.8}});
  const params=Object.assign(defaultParams(id),{assist:0});
  cur=MODES[id]({sport:id,mode:'free',len:12,weather:w,wind:0,params,seed:'demo-'+id+'-'+Math.floor(Math.random()*9)},profile.look,dctx);applyEnv(cur.env,w);
  demo={sport:id,reset:0};if(state!=='garage')state='demo';if(typeof showDemoTag==='function')showDemoTag()}

/* ---------- HUD de partie ---------- */
function setHud(d,dt){if(d&&d.kmh!=null)hudKmh=d.kmh;if(cur&&d&&d.kmh!=null)vigT=clamp((d.kmh/(cur.vScale||100)-.5)*1.3,0,.55);hudAcc+=dt;if(hudAcc<.066)return;hudAcc=0;if(!cur)return;
  E.score.textContent=fmt(cur.stats.score*(run&&run.use.x15?1.5:1));E.mult.textContent=d.mult||'';E.speed.textContent=Math.round(d.kmh);
  E.vmax.textContent='max '+Math.round(cur.stats.vmax);E.arc.style.strokeDasharray=(66.7*clamp(d.kmh/cur.vScale,0,1)).toFixed(2)+' 100';
  E.time.textContent=fmtT(runT+(run?run.pen:0));const pg=cur.prog?cur.prog():'';E.prog.hidden=!pg;if(pg)E.prog.innerHTML=pg;
  if(cur.hudUpdate)cur.hudUpdate(d);goalProgress();if(run&&run.multi)paintMp()}
function standings(){const me={me:true,n:profile.look.name,c:profile.look.accent,sc:cur?cur.stats.score:0,cp:run?run.cp:0,ft:run&&run.finished?run.final:0,dnf:run&&run.dnf&&!run.finished};
  const list=[me];for(const p of roomPeers){if(p.me)continue;const s=p.st||{};if(s.st==='lobby'||!s.sp||s.sp!==curCfg.sport)continue;
    list.push({me:false,n:String(s.n||'Rider').slice(0,16),c:((s.k||{}).a>>>0)&0xffffff,sc:+s.sc||0,cp:+s.cp||0,ft:+s.ft||0,dnf:!!s.dnf})}
  const course=curCfg.mode==='course';
  list.sort((a,b)=>course?((a.ft&&b.ft)?a.ft-b.ft:a.ft?-1:b.ft?1:(a.dnf-b.dnf)||(b.cp-a.cp)||(b.sc-a.sc)):b.sc-a.sc);return list}
function paintMp(){const course=curCfg.mode==='course';E.mp.innerHTML=standings().slice(0,6).map((r,i)=>`<div class="${r.me?'me':''}"><b>${i+1}</b><i style="background:${hexCss(r.c)}"></i><span>${esc(r.n)}</span><em>${course?(r.ft?fmtT(r.ft):r.dnf?'chute':r.cp+'/'+curCfg.len):fmt(r.sc)}</em></div>`).join('')}

/* ---------- lancement ---------- */
async function startRun(cfg,opt={}){
  opt=opt||{};if(run&&!run.finalized&&state!=='menu')finalizeRun(true);
  touchStreakOnLaunch();profile.runs++;saveProfile();
  if(ADS_CONFIG.interstitialEvery&&!opt.multi&&profile.runs>1&&profile.runs%ADS_CONFIG.interstitialEvery===0&&Ads.available()){state='ad';await Ads.interstitial('Entre deux parties')}
  initAudio();hideMenus();$('#over').hidden=true;$('#pause').hidden=true;camera.clearViewOffset();
  ghostStop();if(cur)cur.dispose();ghostsClear();previewId=null;demo=null;quiet=false;$('#demoTag').hidden=true;
  curCfg=cfg;run={cfg,use:opt.use||{},multi:!!opt.multi,pen:0,continues:0,snaps:[],snapT:0,finished:false,dnf:false,cp:0,final:0,finalized:false,coins:0,netT:0,doubled:false,engageBits:[]};run.goal=pickSessionGoal(cfg);
  const ctx={boost:!!run.use.boost,crash:onCrash,finish:onFinish,cam:()=>camMode,hud:setHud,
    bonus:(p,l)=>{p=Math.round(p);cur.stats.score+=p;feed('+'+fmt(p)+' '+l)},checkpoint:(i,n)=>{run.cp=i;if(!sfx.trick(3))ding(880,.2)},trick:trickFn,comboBreak};combo.n=0;combo.t=-9;FLOW.v=0;FLOW.t=0;
  cur=MODES[cfg.sport](cfg,profile.look,ctx);flakes.wind((WIND[cfg.wind|0]||{v:0}).v*.35);recStart();ghostStart(cfg);applyEnv(cur.env,cfg.weather);
  $('#hMode').textContent=cur.name;E.inst.innerHTML=cur.inst;E.feed.innerHTML='';E.mp.innerHTML='';
  $('#keys').innerHTML=cur.keys.slice(0,4).map(k=>'<div><kbd>'+k[0]+'</kbd>'+k[1]+'</div>').join('');
  $('#tU span').textContent=cur.touch.u;$('#tD span').textContent=cur.touch.d;$('#tA').textContent=cur.touch.a||'';$('#tA').hidden=!cur.touch.a;
  runT=0;countT=3;state='count';$('#hud').hidden=false;E.touch.hidden=!isTouch;E.count.hidden=false;E.count.textContent='3';
  cur.update(0,NEUTRAL);hudAcc=1;setHud({kmh:0},0);run.cdS=sfx.count();if(!load('ll3_lookTip',0)){save('ll3_lookTip',1);setTimeout(()=>{if(state==='play')toast(isTouch?'Glisse sur l\'écran pour regarder autour':'Souris : regarder autour · molette : zoom · V : derrière',true)},4200)}if(run.use.boost)feed('Départ lancé');if(run.use.x15)feed('Score ×1,5');netPush(true)}
function netPush(force){if(!run||!run.multi||!cur)return;const ns=cur.netState();
  Net.state({n:profile.look.name,k:packLook(profile.look),sp:curCfg.sport,st:run.finalized?'done':state==='over'?'crash':'run',p:ns.p,q:ns.q,sc:Math.round(cur.stats.score),cp:run.cp,
    ft:run.finished?+run.final.toFixed(2):0,dnf:run.finalized&&!run.finished?1:0,host:isHost?1:0,cfg:isHost?roomCfg:null,go:isHost?lastGo:0,rd:1})}

/* ---------- chute / arrivée ---------- */
/* Persos : chute = rotation amortie du rider + secousse caméra + choc sourd (rien de tout ça ne touche aux scores) */
let crashFx=null;
function startCrashFx(){camShake(.7);const r=cur&&cur._rig;const water=curCfg.sport==='foil'||curCfg.sport==='surf';if(!water)sfx.thud(1);
  crashFx={t:0,r,cam:(camBase.ok?camBase.p:camera.position).clone(),w:V3((Math.random()-.5)*6,(Math.random()-.5)*3,(Math.random()<.5?-1:1)*(4+Math.random()*3))};
  const h=r&&(r.human||r);if(h&&h.setPose)h.setPose('crash',1);else if(h&&h.pose)h.pose(POSES.crash)}
function crashFrame(dt){const c=crashFx;if(!c)return;c.t+=dt;const k=Math.exp(-2.6*c.t);
  if(c.r&&c.t<1.6){c.r.rotation.x+=c.w.x*k*dt;c.r.rotation.y+=c.w.y*k*dt;c.r.rotation.z+=c.w.z*k*dt;const h=c.r.human||c.r;if(h.setPose)h.setPose('crash',1,{side:Math.sin(c.t*6)*.3*k})}
  const a=.35*Math.exp(-5*c.t);if(a>.003)camBase.p.set(c.cam.x+(Math.random()-.5)*a,c.cam.y+(Math.random()-.5)*a,c.cam.z+(Math.random()-.5)*a);else{camBase.p.copy(c.cam);if(c.t>1.6)crashFx=null}}
/* FIGURES : point d'entrée commun à tous les sports. Enchaîner des figures à moins de 2,8 s
   fait monter le combo (×1,5, ×2… jusqu'à ×4). Une chute casse le combo. */
const combo={n:0,t:-9};
/* FLOW : chaque figure remplit la jauge ; pleine = 8 s de « Flow » (figures ×1,5). Elle redescend doucement, et de moitié si le combo casse. */
const FLOW={v:0,t:0};
function comboBreak(){if(combo.n>1)feed('Combo cassé');combo.n=0;FLOW.v*=.5}
function flowTick(dt){if(FLOW.t>0){FLOW.t-=dt;if(FLOW.t<=0)FLOW.v=0}else FLOW.v=Math.max(0,FLOW.v-.05*dt);const el=E.flow;if(el){el.style.width=(FLOW.t>0?FLOW.t/8:FLOW.v)*100+'%';el.parentNode.classList.toggle('on',FLOW.t>0)}}
function trickFn(name,pts){if(!run||!cur||state!=='play')return;const now=runT;combo.n=now-combo.t<2.8?combo.n+1:1;combo.t=now;
  const m=Math.min(4,1+(combo.n-1)*.5)*(FLOW.t>0?1.5:1),p=Math.round(pts*m);
  if(FLOW.t<=0){FLOW.v=Math.min(1,FLOW.v+pts/1600);if(FLOW.v>=1){FLOW.t=8;toast('FLOW ! figures ×1,5',true);nearMissFx();sfxPlay('combo',.6,.85)}}cur.stats.score+=p;cur.stats.tricks=(cur.stats.tricks||0)+1;run.tricks=(run.tricks||0)+1;
  const ms=String(m).replace('.',',');feed('+'+fmt(p)+' '+name+(m>1?' · combo ×'+ms:''));toast(m>1?name+' · ×'+ms:name,true);if(!sfx.trick(combo.n))ding(620+Math.min(combo.n,6)*90,.12);progTrick(curCfg.sport,name,combo.n)}
/* ---------- CAMÉRA LIBRE ----------
   Glisser (souris ou doigt) pour regarder autour, molette = zoom, Q / E = regarder sur les côtés,
   V = regarder derrière, stick droit de la manette. La caméra tourne autour du rider (rotation rigide :
   le cadrage du mode est gardé) et revient seule 0,7 s après qu'on lâche. Compte à rebours :
   travelling d'intro autour du rider. Au « Go » : coup de zoom, souffle, vibration. */
const LOOK={yaw:0,pitch:0,zoom:1,drag:null,lastIn:-9,go:0,shake:0};
/* secousse amortie (réceptions, frottements, chutes, frôlements) : camShake(0..1) */
function camShake(a){LOOK.shake=Math.min(1,Math.max(LOOK.shake,a||.3))}const camBase={p:V3(),q:new THREE.Quaternion(),ok:false};let vigT=0;
const _LT=V3(),_LO=V3(),_LA=V3(),_LY=new THREE.Vector3(0,1,0),_Lq1=new THREE.Quaternion(),_Lq2=new THREE.Quaternion();
const lookOn=()=>state==='play'||state==='count'||state==='over'||state==='pause';
renderer.domElement.addEventListener('pointerdown',e=>{if(lookOn())LOOK.drag={x:e.clientX,y:e.clientY,id:e.pointerId}});
addEventListener('pointermove',e=>{const d=LOOK.drag;if(!d||e.pointerId!==d.id)return;LOOK.yaw-=(e.clientX-d.x)*.006;LOOK.pitch=clamp(LOOK.pitch+(e.clientY-d.y)*.005,-.45,.95);d.x=e.clientX;d.y=e.clientY;LOOK.lastIn=performance.now()/1000});
addEventListener('pointerup',e=>{if(LOOK.drag&&e.pointerId===LOOK.drag.id)LOOK.drag=null});addEventListener('pointercancel',()=>{LOOK.drag=null});
renderer.domElement.addEventListener('wheel',e=>{if(!lookOn())return;e.preventDefault();LOOK.zoom=clamp(LOOK.zoom*(e.deltaY>0?1.1:.91),.55,2.3)},{passive:false});
function applyLook(dt){if(!cur||!camBase.ok||state==='replay')return;const t=performance.now()/1000;let held=!!LOOK.drag;
  if(lookOn()){const kq=(keys.KeyQ?1:0)-(keys.KeyE?1:0);if(kq){LOOK.yaw+=kq*2.2*dt;held=true}
    if(Math.abs(pad.rx)>.2||Math.abs(pad.ry)>.2){LOOK.yaw-=pad.rx*2.6*dt;LOOK.pitch=clamp(LOOK.pitch-pad.ry*1.8*dt,-.45,.95);held=true}}
  if(held)LOOK.lastIn=t;else if(t-LOOK.lastIn>.7){const k=1-Math.exp(-3*dt);LOOK.yaw=Math.atan2(Math.sin(LOOK.yaw),Math.cos(LOOK.yaw))*(1-k);LOOK.pitch*=1-k}
  camera.position.copy(camBase.p);camera.quaternion.copy(camBase.q);
  if(state==='menu')return;
  let yaw=LOOK.yaw+(keys.KeyV&&lookOn()?Math.PI:0),pitch=LOOK.pitch,zoom=LOOK.zoom;
  /* aperçu de l'accueil : travelling lent et plus serré autour du rider (cadrage « hero ») */
  if(state==='demo'){const tn=t;yaw=.6*Math.sin(tn*.11)+.3;pitch=.06+.05*Math.sin(tn*.07);zoom=.78}
  if(state==='count'&&camMode!==1){const k=clamp(countT/3,0,1),e=k*k*(3-2*k);yaw+=e*2.3;pitch+=e*.12;zoom*=1-e*.35}
  if(Math.abs(yaw)>1e-3||Math.abs(pitch)>1e-3||Math.abs(zoom-1)>1e-3){
    if(camMode===1){_Lq1.setFromAxisAngle(_LY,yaw);camera.quaternion.premultiply(_Lq1);camera.rotateX(-pitch*.8)}
    else if(cur._rig){cur._rig.getWorldPosition(_LT);_LT.y+=1;_LO.copy(camBase.p).sub(_LT);_Lq1.setFromAxisAngle(_LY,yaw);_LO.applyQuaternion(_Lq1);
      _LA.crossVectors(_LO,_LY);if(_LA.lengthSq()<1e-6)_LA.set(1,0,0);_LA.normalize();_Lq2.setFromAxisAngle(_LA,pitch);_LO.applyQuaternion(_Lq2).multiplyScalar(zoom);
      camera.position.copy(_LT).add(_LO);camera.quaternion.premultiply(_Lq1).premultiply(_Lq2);
      if(cur._h){const gy=cur._h(camera.position.x,camera.position.z);if(isFinite(gy)&&camera.position.y<gy+.7)camera.position.y=gy+.7}}}
  if(state==='play'&&LOOK.go>0){camera.fov+=18*LOOK.go*LOOK.go;camera.updateProjectionMatrix();LOOK.go=Math.max(0,LOOK.go-dt*1.6)}
  if(LOOK.shake>.003&&(state==='play'||state==='over')){const a=LOOK.shake*.3;camera.position.x+=(Math.random()-.5)*a;camera.position.y+=(Math.random()-.5)*a;camera.position.z+=(Math.random()-.5)*a;camera.rotateZ((Math.random()-.5)*a*.12);LOOK.shake*=Math.exp(-6*dt)}}
function onCrash(title,text){window.__llLastCrash={title,text};combo.n=0;FLOW.v=0;FLOW.t=0;if(state!=='play')return;state='over';startCrashFx();run.dnf=true;speedLines(0,0);showOver('crash',title,text);netPush(true)}
function onFinish(time){if(state!=='play')return;state='over';sfx.finish();run.finished=true;run.final=time+run.pen;finalizeRun();speedLines(0,0);
  const medal=medalOf(run.final,cur.target);const mtxt={g:'Médaille d\'or',s:'Médaille d\'argent',b:'Médaille de bronze',n:'Arrivée'}[medal];
  showOver('finish',mtxt,'Temps '+fmtT2(run.final)+(run.pen?' dont '+run.pen+' s de pénalités':'')+' · objectif or '+fmtT(cur.target)+'.',medal);netPush(true)}
function finalizeRun(silent){if(!run||run.finalized)return;run.finalized=true;const st=cur.stats,cfg=curCfg,course=cfg.mode==='course';
  const score=Math.round(st.score*(run.use.x15?1.5:1));let medal='n';
  if(course&&run.finished){medal=medalOf(run.final,cur.target);const key=cfg.sport+'|course|'+cfg.len+'|'+cfg.seed+'|'+JSON.stringify(cfg.params);
    if(!profile.records[key]||run.final<profile.records[key])profile.records[key]=+run.final.toFixed(2);
    if(medal!=='n'){const m=profile.medals[cfg.sport]=profile.medals[cfg.sport]||{};m[medal]=(m[medal]||0)+1}}
  if(!course){const k=cfg.sport+'|free';if(score>(profile.records[k]||0)){profile.records[k]=score;run.rec=true}Board.submit(cfg.sport,score)}
  if(cfg.seed===dailySeed()+cfg.sport){const dk='daily|'+dayKey()+'|'+cfg.sport,old=profile.records[dk];
    if(course&&run.finished){if(!old||run.final<old){profile.records[dk]=+run.final.toFixed(2);run.engageBits=run.engageBits||[];run.engageBits.push('Record du parcours du jour')}}else if(!course&&score>(old||0))profile.records[dk]=score}
  if(course&&run.finished){if(ghostSave(cfg,run.final,(a,b)=>a<b))run.engageBits.push('Nouveau fantôme : ton record')}else if(!course&&ghostSave(cfg,score,(a,b)=>a>b))run.engageBits.push('Nouveau fantôme : ton record');
  run.xpGain=xpFor(st,run);addXp(cfg.sport,run.xpGain);
  run.coins=Math.floor(score/40)+(run.finished?40+({g:150,s:90,b:50}[medal]||0):0);profile.coins+=run.coins;engageFinalize(score,medal);
  profile.history.unshift({sport:cfg.sport,mode:cfg.mode,seed:cfg.seed,score,time:run.final||0,medal,dnf:course&&!run.finished,at:Date.now()});profile.history=profile.history.slice(0,40);
  saveProfile();netPush(true)}
function showOver(kind,title,text,medal){const cfg=curCfg,course=cfg.mode==='course';
  $('#oMode').textContent=cur.name+' · '+(course?SPORTS[cfg.sport].modes.course:SPORTS[cfg.sport].modes.free)+(run.multi?' · multijoueur':'');
  $('#oTitle').innerHTML=(medal&&medal!=='n'?'<span class="medal '+medal+'"></span>':'')+esc(title);$('#oText').textContent=text;
  paintOverStats(kind);
  const c=$('#btnContinue');const canCont=kind==='crash'&&run.continues<2&&!run.finalized&&(profile.cons.revive>0||Ads.available());c.hidden=!canCont;
  if(canCont)c.textContent=profile.cons.revive>0?'Second souffle ('+profile.cons.revive+')':'Continuer · 1 pub';
  $('#btnAgain').innerHTML=run.multi?'Retour au salon':'Encore une<kbd>R</kbd>';
  $('#over').hidden=false;E.touch.hidden=true;(canCont?c:$('#btnAgain')).focus()}
function paintOverStats(kind){const st=cur.stats,course=curCfg.mode==='course';const score=Math.round(st.score*(run.use.x15?1.5:1));
  const rows=[[course?'Temps':'Score',course?(run.finished?fmtT2(run.final):'—'):fmt(score),run.rec],[course?'Record parcours':'Record',course?fmtT2(profile.records[curCfg.sport+'|course|'+curCfg.len+'|'+curCfg.seed+'|'+JSON.stringify(curCfg.params)]||Infinity):fmt(profile.records[curCfg.sport+'|free']||0)]].concat(cur.overStats());
  let h=rows.map(r=>`<div class="stat"><div class="l">${r[0]}</div><div class="v${r[2]?' rec':''}">${r[1]}</div></div>`).join('');
  if(run.finalized)h+=`<div class="stat"><div class="l">Pièces gagnées</div><div class="v rec">+${fmt(run.coins)}</div></div>`;
  $('#oStats').innerHTML=h;
  let extra=progOverHtml()+engageOverHtml();if(run.finalized&&run.coins>0&&!run.doubled&&Ads.available())extra+=`<div class="row"><button class="btn small" id="btnDouble">Doubler les pièces · 1 pub</button></div>`;
  if(run.multi){const course=curCfg.mode==='course';extra+=`<table class="rtable"><thead><tr><th>#</th><th>Joueur</th><th>${course?'Temps':'Score'}</th></tr></thead><tbody>${standings().map((r,i)=>`<tr class="${r.me?'me':''}"><td>${i+1}</td><td>${esc(r.n)}</td><td>${course?(r.ft?fmtT2(r.ft):r.dnf?'abandon':'en course · '+r.cp+'/'+curCfg.len):fmt(r.sc)}</td></tr>`).join('')}</tbody></table>`}
  $('#oMulti').innerHTML=extra;const d=$('#btnDouble');if(d)d.onclick=async()=>{d.disabled=true;if(await Ads.rewarded('Doubler les pièces')){profile.coins+=run.coins;run.coins*=2;run.doubled=true;saveProfile()}paintOverStats(kind)}}
$('#btnContinue').onclick=async()=>{if(!run||run.finalized)return;let ok=false;
  if(profile.cons.revive>0){profile.cons.revive--;saveProfile();ok=true}else ok=await Ads.rewarded('Continuer la partie');
  if(!ok){showOver('crash',$('#oTitle').textContent,$('#oText').textContent);return}
  const now=runT;let s=null;for(const x of run.snaps)if(now-x.t>=2.5)s=x;if(!s)s=run.snaps[0];if(s)cur.restore(s.s);
  run.continues++;run.dnf=false;if(curCfg.mode==='course')run.pen+=3;$('#over').hidden=true;E.touch.hidden=!isTouch;
  countT=2;state='count';E.count.hidden=false;E.count.textContent='2';cur.update(0,NEUTRAL);feed(curCfg.mode==='course'?'Reprise · +3 s':'Reprise')};
$('#btnReplay').onclick=()=>replayOpen();$('#rpExp').onclick=()=>exportStart();$('#rpClose').onclick=()=>replayClose();
$('#btnAgain').onclick=()=>{finalizeRun();if(run&&run.multi){backToLobby();return}startRun(curCfg,{})};
$('#btnMenu2').onclick=()=>{finalizeRun();toMenu()};

/* ---------- pause / menu ---------- */
function pause(){if(state!=='play')return;state='pause';$('#pMode').textContent='Pause · '+cur.name;
  $('#pCtl').innerHTML=cur.keys.map(k=>'<kbd>'+k[0]+'</kbd><span>'+k[1]+'</span>').join('');$('#pause').hidden=false;$('#btnResume').focus();sound(0,300,.8)}
function resume(){if(state!=='pause')return;state='play';$('#pause').hidden=true;if(document.activeElement)document.activeElement.blur()}
$('#btnPause').onclick=pause;$('#btnResume').onclick=resume;$('#btnRestart').onclick=()=>{if(run&&run.multi)return;startRun(curCfg,{})};
$('#btnQuit').onclick=()=>{$('#pause').hidden=true;if(run)run.finalized=true;toMenu()};
function toMenu(){$('#hud').hidden=true;E.touch.hidden=true;$('#over').hidden=true;E.count.hidden=true;speedLines(0,0);
  if(run&&run.multi){backToLobby();return}const sp=curCfg?curCfg.sport:'wingsuit',w=curCfg?curCfg.weather:'soleil';run=null;previewSport(sp,w,true);navStack.length=0;go('home',false)}
function backToLobby(){$('#hud').hidden=true;E.touch.hidden=true;$('#over').hidden=true;$('#pause').hidden=true;const sp=curCfg.sport,w=curCfg.weather;run=null;previewSport(sp,w,true);
  myReady=isHost;pushLobbyState();navStack.length=0;navStack.push('multi');go('lobby',false)}

/* ---------- fantômes ---------- */
const ghosts=new Map();const gq=new THREE.Quaternion();
function ghostsClear(){ghosts.clear()}
function syncGhosts(){if(!run||!run.multi||!cur)return;const seen=new Set();
  for(const p of roomPeers){if(p.me)continue;const s=p.st;if(!s||s.st==='lobby'||s.sp!==curCfg.sport||!Array.isArray(s.p)||s.p.length!==3||!s.p.every(Number.isFinite))continue;seen.add(p.id);
    let g=ghosts.get(p.id);if(!g){const lk=unpackLook(s.k),obj=ghostify(cur.ghost(lk),lk.accent,.5);obj.position.fromArray(s.p);g={obj};ghosts.set(p.id,g)}g.tp=s.p;g.tq=Array.isArray(s.q)&&s.q.length===4&&s.q.every(Number.isFinite)?s.q:null}
  for(const [id,g] of ghosts)if(!seen.has(id)){g.obj.parent&&g.obj.parent.remove(g.obj);disposeTree(g.obj);ghosts.delete(id)}}
function updateGhosts(dt){const k=1-Math.exp(-10*dt);for(const g of ghosts.values()){if(!g.tp)continue;g.obj.position.x+= (g.tp[0]-g.obj.position.x)*k;g.obj.position.y+=(g.tp[1]-g.obj.position.y)*k;g.obj.position.z+=(g.tp[2]-g.obj.position.z)*k;
  if(g.tq){gq.fromArray(g.tq).normalize();g.obj.quaternion.slerp(gq,k)}}}

/* ---------- entrées ---------- */
function press(code){
  if(state==='replay'){if(code==='Escape'||code==='KeyR')replayClose();return}
  if(code==='Escape'){if(state==='play')pause();else if(state==='pause')resume();else if(state==='over')$('#btnMenu2').click();else if((state==='menu'||state==='garage'||state==='demo')&&screen!=='home'&&screen!=='lobby')back();return}
  if(code==='KeyR'&&run&&!run.multi&&(state==='play'||state==='over'||state==='pause')){finalizeRun();startRun(curCfg,{});return}
  if(code==='KeyC'&&(state==='play'||state==='count')){setCam((camMode+1)%3);toast(['Poursuite','Casque','Drone'][camMode],true);return}
  if(code==='KeyM'){muteAll(!audioMuted);return}
  if(state==='play'&&cur&&cur.press)cur.press(code)}
addEventListener('keydown',e=>{if(e.target&&(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA'))return;
  if((state==='play'||state==='count')&&['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();
  if(!keys[e.code])press(e.code);keys[e.code]=true});
addEventListener('keyup',e=>{keys[e.code]=false});
/* son : l'audio démarre au premier geste (règle des navigateurs) ; clic UI */
addEventListener('pointerdown',()=>initAudio(),{capture:true});addEventListener('keydown',()=>initAudio(),{capture:true,once:true});
document.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('button,.chip,.tab,.navbtn,.sw,.item'))sfx.click()},true);
addEventListener('blur',()=>{for(const k in keys)keys[k]=false;if(state==='play')pause()});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&state==='play')pause();if(document.hidden)flushProfile()});
/* filet : onglet fermé sur l'écran de fin → on crédite pièces / défi / série (jamais en pleine partie : le joueur peut encore continuer) */
function saveOnLeave(){try{if(run&&!run.finalized&&state==='over')finalizeRun(true);flushProfile()}catch(e){}}
addEventListener('pagehide',saveOnLeave);addEventListener('beforeunload',saveOnLeave);
$$('#touch .tb').forEach(b=>{const k=b.dataset.k;const on=e=>{e.preventDefault();tch[k]=1;b.classList.add('on');if(k==='a')press('Space');else press({l:'ArrowLeft',r:'ArrowRight',u:'ArrowUp',d:'ArrowDown'}[k])};const off=()=>{tch[k]=0;b.classList.remove('on')};
  b.addEventListener('pointerdown',on);b.addEventListener('pointerup',off);b.addEventListener('pointercancel',off);b.addEventListener('pointerleave',off)});

/* ---------- boucle ---------- */
let last=performance.now(),last0=performance.now();
/* qualité auto : si la moyenne passe sous 40 i/s pendant 3 s de course, on bascule une fois en Éco (réglage « Qualité auto ») */
const AQ={t:0,n:0,warm:0,done:false};
function autoQuality(raw){if(AQ.done||S().autoQ===false||S().quality==='eco'){return}AQ.warm+=raw;if(AQ.warm<2)return;AQ.t+=raw;AQ.n++;if(AQ.t<3)return;const fps=AQ.n/AQ.t;AQ.t=0;AQ.n=0;
  if(fps<40){AQ.done=true;S().quality='eco';saveProfile();resize();flakes.set(curCfg&&WEATHER[curCfg.weather]&&WEATHER[curCfg.weather].flakes);toast('Qualité Éco activée pour garder la fluidité ('+Math.round(fps)+' i/s)',true);feed('Éco complet à la prochaine partie · Réglages pour revenir')}}
function frame(now){requestAnimationFrame(frame);const rawDt=(now-last)/1000;const dt=Math.min(.05,rawDt);if(state==='play'&&rawDt<1)autoQuality(rawDt);last=now;pollPad(press);if(state==='play'||state==='menu'||state==='demo')perfTick((now-last0)/1000);last0=now;
  if(toastT>0){toastT-=dt;if(toastT<=0)lastToast=''}
  if(state==='garage'){garageFrame(dt);renderer.render(gScene,gCam);return}
  if(!cur)return;
  if(state==='play'){runT+=dt;flowTick(dt);cur.update(dt,inp());if(state==='play'){recFrame(runT);ghostFrame(runT)}if(run&&state==='play'){run.snapT+=dt;if(run.snapT>1){run.snapT=0;run.snaps.push({t:runT,s:cur.snapshot()});if(run.snaps.length>8)run.snaps.shift()}
      run.netT+=dt;if(run.netT>.066){run.netT=0;netPush()}}updateGhosts(dt)}
  else if(state==='count'){countT-=dt;cur.update(0,NEUTRAL);ghostFrame(0);const n=Math.ceil(countT);if(countT<=0){E.count.hidden=true;state='play';LOOK.go=1;sfx.whoosh();buzz([30]);toast('Go !',true);if(!run.cdS)ding(990,.25);maybeTutorial()}else if(E.count.textContent!==String(n)){E.count.textContent=n;if(!run.cdS)ding(440,.15)}updateGhosts(dt)}
  else if(state==='demo'&&demo){if(demo.reset>0){demo.reset-=dt;if(demo.reset<=0){previewSport(demo.sport,previewW,true);return}}else cur.update(dt,cur.auto?cur.auto():NEUTRAL)}
  else if(state==='replay')replayFrame(dt);
  else if(state==='menu')cur.attract(dt);else if(state!=='ad'){if(cur.idle)cur.idle(dt);updateGhosts(dt)}
  if(state==='play'||state==='count'||state==='demo'||state==='menu'){camBase.p.copy(camera.position);camBase.q.copy(camera.quaternion);camBase.ok=true}
  if(state==='over')crashFrame(dt);else if(crashFx&&state!=='pause')crashFx=null;
  applyLook(dt);E.vig.style.opacity=state==='play'?vigT:0;
  waterUniforms.uTime.value+=dt;musicTick(state);if(state==='play'&&cur)wind(hudKmh/(cur.vScale||100),curCfg.sport==='wingsuit'||curCfg.sport==='paraglide');else wind(0,false);flakes.update(dt,camera.position);
  sky.position.copy(camera.position);sunSprite.position.copy(camera.position).addScaledVector(sunDir,1000);stars.position.copy(camera.position);clouds.update(camera.position);
  renderer.render(scene,camera);if(RP.exp)exportDraw()}

/* ---------- démarrage ---------- */
resize();setCam(S().cam|0);previewSport(profile.last.sport||'wingsuit');go('home',false);requestAnimationFrame(frame);
window.__ll={get acc(){return ACC},exportProfileJson,importProfileText,finalizeRun,dailyChallenge,dayKey,ren:renderer,get state(){return state},get cur(){return cur},get run(){return run},startRun,profile,Net,Ads};
