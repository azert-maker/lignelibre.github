const L=require('./lib');(async()=>{const {b,p,errs}=await L.open();
const sport=process.argv[2]||'motocross',mode=process.argv[3]||'free';
const res=await p.evaluate(([sport,mode])=>{const out=[];__ll.startRun({sport,mode,len:4,weather:'soleil',wind:0,params:{},seed:'T1'},{});const park=__ll.cur._park();const kick=park.mods.filter(m=>m.type==='kicker'||m.type==='table'&&m.tag!=='landing');
 for(let ki=0;ki<kick.length;ki++){const res=[];for(let v=8;v<=26;v+=1.5){__ll.startRun({sport,mode,len:4,weather:'soleil',wind:0,params:{},seed:'T1'},{});__ll.forcePlay();const c=__ll.cur,St=c._st();const m=c._park().mods.filter(m=>m.type==='kicker'||m.type==='table'&&m.tag!=='landing')[ki];window.__llLastCrash=null;
   St.pos.set(m.x-m.fx*25,0,m.z-m.fz*25);St.yaw=Math.atan2(m.fx,-m.fz);St.vel.set(m.fx*v,0,m.fz*v);St.pos.y=0;let air=0,r='-',mx=0;
   for(let i=0;i<500;i++){c.update(1/60,{x:0,y:0,a:false,g:false});if(St.air){air+=1/60;mx=Math.max(mx,air)}else if(air>.3){r=air.toFixed(1)+'s';break}else air=0;if(window.__llLastCrash){r='X'+(window.__llLastCrash.title[0]);break}}res.push(r)}
  out.push(kick[ki].tag+' H'+kick[ki].H.toFixed(1)+' : '+res.join(' '))}return out.join('\n')},[sport,mode]);
console.log('v=8..26 step 1.5\n'+res);await b.close()})();
