const L=require('./lib');(async()=>{const {b,p,errs}=await L.open({vp:{width:1280,height:720}});const out=[];
for(const q of ['eco','normal','high'])for(const s of ['wingsuit','longboard','snowboard','bmx','motocross','wakeboard','parkour']){
 await p.evaluate(([q,s])=>{const S=__ll.profile.settings;S.quality=q;S.autoQ=false;__ll.startRun({sport:s,mode:'free',len:12,weather:'soleil',wind:0,params:{},seed:'PF'},{});__ll.forcePlay();const c=__ll.cur;const u=c.update.bind(c);c.update=(dt,I)=>u(dt,c.auto?c.auto():I)},[q,s]);
 await p.waitForTimeout(1500);
 const r=await p.evaluate(()=>new Promise(res=>{let n=0,t0=performance.now();const info=__ll.ren.info;function f(){n++;if(n<90)requestAnimationFrame(f);else res({fps:+(n/((performance.now()-t0)/1000)).toFixed(1),calls:info.render.calls,tris:info.render.triangles,geo:info.memory.geometries,tex:info.memory.textures})}requestAnimationFrame(f)}));
 out.push([q,s,r.fps,r.calls,r.tris,r.geo,r.tex].join('\t'))}
console.log('qualité\tsport\tfps(swiftshader)\tdraw calls\ttriangles\tgéométries\ttextures\n'+out.join('\n'));console.log('ERR',errs.slice(0,5));await b.close()})();
