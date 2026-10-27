const L=require('./lib');(async()=>{const {b,p,errs}=await L.open();
for(const [s,len] of [['bmx',4],['bmx',6],['motocross',4],['motocross',6],['wakeboard',8],['parkour',3],['parkour',4]]){
 const r=await L.sim(p,s,'course',240,'c.auto()',{len,stopOnCrash:false});const t=await p.evaluate(()=>({target:+__ll.cur.target.toFixed(1),final:__ll.run&&__ll.run.final?+__ll.run.final.toFixed(1):null}));
 console.log(s,len,'cible or',t.target,'s · autopilote',r.fin?t.final+' s':'pas fini ('+r.t+' s)','· chutes',r.crashes.length)}
await b.close()})();
