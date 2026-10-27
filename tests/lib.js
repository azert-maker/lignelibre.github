const {chromium}=require('playwright');const path=require('path');
exports.open=async(opt={})=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required']});
  const p=await b.newPage({viewport:opt.vp||{width:1000,height:620}});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push('console:'+m.text())});
  if(opt.init)await p.addInitScript(opt.init);
  await p.goto('file://'+path.resolve(__dirname,'../dist/test.html'));await p.waitForTimeout(1500);
  await p.evaluate(()=>{const s=__ll.profile.settings;s.adsDemo=false;s.autoQ=false});return {b,p,errs}};
/* simulation déterministe : avance le mode courant à 60 Hz avec une politique d'entrée */
exports.sim=async(p,sport,mode,secs,policy,extra)=>p.evaluate(([sport,mode,secs,policy,extra])=>{
  __ll.startRun(Object.assign({sport,mode,len:mode==='course'?(extra&&extra.len)||4:12,weather:'soleil',wind:0,params:{},seed:(extra&&extra.seed)||'T1'},extra&&extra.cfg||{}),{});
  __ll.forcePlay();const c=__ll.cur;const pol=new Function('c','t','St','return ('+policy+')');window.__llLastCrash=null;let t=0,crash=null,fin=false,log=[];const ofin=c;
  // passer le compte à rebours
  const st0=__ll.state;let n=0;
  const snaps=[];while(t<secs){if(c.snapshot&&n%60===0){snaps.push({t,s:c.snapshot()});if(snaps.length>6)snaps.shift()}const I=Object.assign({x:0,y:0,a:false,g:false},pol(c,t,c._st?c._st():null));c.update(1/60,I);t+=1/60;n++;
    if(window.__llLastCrash){crash=window.__llLastCrash;log.push([+t.toFixed(1),'CRASH',crash.title]);const st=c._st&&c._st();window.__llLastCrash=null;if(extra&&extra.stopOnCrash)break;
      /* reprise comme « Continuer » : snapshot d'au moins 2,5 s avant */ let sn=null;for(const x of snaps)if(t-x.t>=2.5)sn=x;if(!sn)sn=snaps[0];if(sn&&c.restore)c.restore(sn.s);__ll.forcePlay()}
    if(__ll.state==='over'&&__ll.run&&__ll.run.finished){fin=true;break}}
  return {t:+t.toFixed(1),crashes:log,score:Math.round(c.stats.score),stats:JSON.parse(JSON.stringify(c.stats,(k,v)=>typeof v==='number'?Math.round(v*100)/100:v)),fin}},[sport,mode,secs,policy,extra]);
