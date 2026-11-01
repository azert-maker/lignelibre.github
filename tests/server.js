const {spawn}=require('child_process');/* Serveur multijoueur local : messages trop gros refusés, identifiant non usurpable, débit limité sans planter. */
const path=require('path');const WebSocket=require('ws');
const srv=spawn(process.execPath,[path.resolve(__dirname,'../server/server.js')],{env:{...process.env,PORT:'9123'}});let out='';srv.stdout.on('data',d=>out+=d);
const wait=ms=>new Promise(r=>setTimeout(r,ms));const res={};
(async()=>{await wait(600);
 const a=new WebSocket('ws://127.0.0.1:9123');await new Promise(r=>a.on('open',r));a.send(JSON.stringify({t:'join',room:'abcde',id:'p1'}));await wait(100);
 const b=new WebSocket('ws://127.0.0.1:9123');await new Promise(r=>b.on('open',r));let bmsg=[];b.on('message',m=>bmsg.push(String(m).slice(0,30)));b.send(JSON.stringify({t:'join',room:'abcde',id:'p1'}));await wait(200);res.usurpation=bmsg.some(m=>m.includes('full'));
 const c=new WebSocket('ws://127.0.0.1:9123');await new Promise(r=>c.on('open',r));let closed=null;c.on('close',code=>closed=code);c.send('x'.repeat(200000));await wait(300);res.gros_message_ferme=closed;
 let peers=0;a.on('message',m=>{if(String(m).includes('"peers"'))peers++});for(let i=0;i<200;i++)a.send(JSON.stringify({t:'state',s:{n:'A',i}}));await wait(500);res.serveur_vivant=a.readyState===1&&peers>0;
 const ok=res.usurpation&&res.gros_message_ferme===1009&&res.serveur_vivant;console.log((res.usurpation?'OK  ':'KO  ')+'identifiant déjà pris refusé');console.log((res.gros_message_ferme===1009?'OK  ':'KO  ')+'message de 200 ko refusé (code '+res.gros_message_ferme+')');console.log((res.serveur_vivant?'OK  ':'KO  ')+'rafale de 200 messages : serveur toujours en service');console.log('TOTAL '+[res.usurpation,res.gros_message_ferme===1009,res.serveur_vivant].filter(Boolean).length+' / 3');srv.kill();process.exit(ok?0:1)})();
