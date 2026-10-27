const L=require('./lib');(async()=>{const {b,p,errs}=await L.open();
for(const seed of ['T1','W2','W3','W4']){
const r=await p.evaluate((seed)=>{__ll.startRun({sport:'parkour',mode:'course',len:4,weather:'soleil',wind:0,params:{},seed},{});__ll.forcePlay();const c=__ll.cur,St=c._st(),bx=c._boxes();window.__llLastCrash=null;
 const w=bx.find(b=>b.wr);if(!w)return seed+' no wall';
 // départ sur le toit avant l'écart, le long du mur, en courant vers le nord
 const zStart=w.z1+5,x=w.face>0?w.x1+.9:w.x0-.9;St.pos.set(x,0,zStart);St.pos.y=c._h(x,zStart);St.h=0;St.sp=7.5;St.mode='run';const out=[];let jumped=false,wr=0,did=false;
 for(let i=0;i<240;i++){const I={x:0,y:1,a:false,g:false};if(!jumped&&St.pos.z<w.z1+1.2){I.a=true;jumped=true}if(St.mode==='wallrun')did=true;if(St.mode==='air'&&St.airT>.2&&!did)I.x=w.face>0?-.5:.5;if(St.mode==='wallrun'){wr++;I.x=0;if(St.wr.t>.35&&seed>'W2')I.a=true}
  c.update(1/60,I);if(window.__llLastCrash){out.push('CRASH '+window.__llLastCrash.title);break}}
 return seed+' wall face '+w.face+' wallrun frames '+wr+' tricks '+c.stats.tricks+' :: '+[...document.querySelectorAll('#feed .fi')].map(e=>e.textContent).slice(0,3).join(' | ')+' '+out.join(',')},seed);console.log(r)}
console.log('ERR',errs.slice(0,5));await b.close()})();
