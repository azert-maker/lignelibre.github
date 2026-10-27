const L=require('./lib');(async()=>{const {chromium}=require('playwright');const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
const c=await b.newContext({viewport:{width:844,height:390},isMobile:true,hasTouch:true});const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+require('path').resolve(__dirname,'../dist/test.html'));await p.waitForTimeout(1500);await p.evaluate(()=>{__ll.profile.settings.adsDemo=false});
for(const s of ['bmx','parkour']){await p.evaluate((s)=>{__ll.startRun({sport:s,mode:'free',len:4,weather:'soleil',wind:0,params:{},seed:'TC'},{})},s);await p.waitForTimeout(3500);
 const box=await p.$eval('#tU',e=>{const r=e.getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2]});await p.touchscreen.tap(box[0],box[1]);
 await p.screenshot({path:'touch_'+s+'.png'});console.log(s,'touch visible',await p.$eval('#touch',e=>!e.hidden),'fig',await p.$eval('#tG',e=>!e.hidden&&e.innerText.replace(/\n/g,' ')))}
console.log('ERR',errs);await b.close()})();
