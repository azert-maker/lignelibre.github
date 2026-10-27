const L=require('./lib');(async()=>{const {b,p,errs}=await L.open();
for(const sc of ['air','360','whip','bar','backflip','flipfail','manual','vert','vert360','rail','box']){
 const r=await p.evaluate((sc)=>{__ll.startRun({sport:'bmx',mode:'free',len:12,weather:'soleil',wind:0,params:{},seed:sc==='box'?'BOX7':'T1'},{});__ll.forcePlay();const c=__ll.cur,St=c._st(),park=c._park();window.__llLastCrash=null;
  const feed=[];const of=__ll.cur;let target;
  if(sc==='vert'||sc==='vert360'){const m=park.mods.find(m=>m.tag==='quarter'&&!m.radial);target=m;St.pos.set(m.x-m.fx*9+m.rx*0,0,m.z-m.fz*9);St.yaw=Math.atan2(m.fx,-m.fz);St.vel.set(m.fx*9.5,0,m.fz*9.5)}
  else if(sc==='rail'){const r=park.rails.find(r=>r.kind==='rail'&&r.y0<1.2);if(!r)return 'no rail';St.pos.set(r.x0-r.fx*7,0,r.z0-r.fz*7);St.yaw=r.yaw;St.vel.set(r.fx*8,0,r.fz*8);target=r}
  else if(sc==='box'){const m=park.mods.find(m=>m.tag==='box');if(!m)return 'no box';St.pos.set(m.x-m.fx*8+m.rx*(m.W/2-.1),0,m.z-m.fz*8+m.rz*(m.W/2-.1));St.yaw=Math.atan2(m.fx,-m.fz);St.vel.set(m.fx*8,0,m.fz*8);target=m}
  else if(sc==='manual'){St.pos.set(0,0,40);St.yaw=0;St.vel.set(0,0,-7)}
  else{const m=park.mods.find(m=>m.tag==='kicker');St.pos.set(m.x-m.fx*10,0,m.z-m.fz*10);St.yaw=Math.atan2(m.fx,-m.fz);St.vel.set(m.fx*9,0,m.fz*9);target=m}
  St.pos.y=c._h(St.pos.x,St.pos.z);St.air=false;
  let t=0,maxAir=0,grind=0,manT=0,hmax=0,crash=null;const s0=c.stats.score;
  while(t<7){let I={x:0,y:0,a:false,g:false};
   if(sc==='manual'){I.g=t<4;I.y=St.man?(St.man.b>.25?1:St.man.b<-.25?-1:0):0}
   else if(sc==='rail'){if(!St.air&&!St.grind){const d=(target.x0-St.pos.x)*target.fx+(target.z0-St.pos.z)*target.fz;if(d>1.6&&d<2.3)I.a=true}}
   else if(!St.air&&!sc.startsWith('vert')&&sc!=='box'){const m=target;const d=(m.x+m.fx*m.L-St.pos.x)*m.fx+(m.z+m.fz*m.L-St.pos.z)*m.fz;if(d>.3&&d<3.5)I.a=true}
   if(St.air&&St.airT>.05){if(sc==='360'||sc==='vert360')I.x=St.airT<.75?1:0;if(sc==='whip')I.g=St.airT<.15;if(sc==='bar')I.a=St.airT>.1&&St.airT<.2;if(sc==='backflip')I.y=St.airT<.75?-1:0;if(sc==='flipfail')I.y=-1}
   c.update(1/60,I);t+=1/60;if(St.air){maxAir=Math.max(maxAir,St.airT);hmax=Math.max(hmax,St.hmax)}if(St.grind)grind++;if(St.man)manT=St.man.t;
   if(window.__llLastCrash){crash=window.__llLastCrash.title;break}}
  return {sc,crash,best:c.stats.best,tricks:c.stats.tricks,airs:c.stats.airs,maxAir:+maxAir.toFixed(2),hmax:+hmax.toFixed(1),grind,manT:+manT.toFixed(1),grinds:c.stats.grinds,manualMax:c.stats.maxManual,score:Math.round(c.stats.score-s0)}},sc);
 const feed=await p.evaluate(()=>[...document.querySelectorAll('#feed .fi')].map(e=>e.textContent).slice(0,3).join(' | '));
 console.log(JSON.stringify(r),'::',feed)}
console.log('ERR',errs.slice(0,10));await b.close()})();
