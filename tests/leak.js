const L=require('./lib');(async()=>{const {b,p,errs}=await L.open();const out=[];
for(const s of ['bmx','bmx','bmx','motocross','motocross','wakeboard','wakeboard','parkour','parkour','bmx']){await p.evaluate((s)=>{__ll.startRun({sport:s,mode:'free',len:12,weather:'soleil',wind:0,params:{},seed:'PF'},{})},s);await p.waitForTimeout(700);
 out.push(s+' '+await p.evaluate(()=>JSON.stringify(__ll.ren.info.memory)))}
console.log(out.join('\n'));await b.close()})();
