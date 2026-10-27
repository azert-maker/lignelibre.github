const L=require('./lib');(async()=>{const {b,p,errs}=await L.open();const out=[];
async function start(s,m){await p.evaluate(([s,m])=>{__ll.startRun({sport:s,mode:m,len:4,weather:'soleil',wind:0,params:{},seed:'KB'},{})},[s,m]);await p.waitForTimeout(3400)}
const st=()=>p.evaluate(()=>{const c=__ll.cur,S=c._st?c._st():{};return {state:__ll.state,sp:+(S.sp??(S.vel?S.vel.length():0)).toFixed?.(1)||0,air:!!(S.air||S.mode==='air'),X:S.X!=null?+S.X.toFixed(1):null,mode:S.mode||'',score:Math.round(c.stats.score)}});
// BMX : pédaler puis bunny hop
await start('bmx','free');await p.keyboard.down('ArrowUp');await p.waitForTimeout(1500);let a=await st();await p.keyboard.down('Space');await p.waitForTimeout(400);await p.keyboard.up('Space');await p.waitForTimeout(120);let b2=await st();await p.keyboard.up('ArrowUp');
out.push('BMX ↑ vitesse '+a.sp+' · saut après Espace : '+(b2.air?'oui':'non'));
await start('motocross','free');await p.keyboard.down('ArrowUp');await p.waitForTimeout(2000);a=await st();await p.keyboard.up('ArrowUp');out.push('Moto ↑ vitesse '+a.sp+' m/s');
await start('wakeboard','free');const x0=(await st()).X;await p.keyboard.down('ArrowRight');await p.waitForTimeout(1200);a=await st();await p.keyboard.up('ArrowRight');out.push('Wake → X '+x0+' → '+a.X);
await start('parkour','free');await p.keyboard.down('ArrowUp');await p.waitForTimeout(1200);a=await st();await p.keyboard.press('Space');await p.waitForTimeout(150);b2=await st();await p.keyboard.up('ArrowUp');out.push('Parkour ↑ vitesse '+a.sp+' · saut : '+(b2.air?'oui':b2.mode));
// manette simulée : pad.a via evaluate n'est pas accessible ; touches tactiles : bouton action
console.log(out.join('\n'));console.log('ERR',errs);await b.close()})();
