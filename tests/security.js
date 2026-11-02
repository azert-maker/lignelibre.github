/* Sécurité côté client : pollution de prototype, clés de sport, appels de mode, adresses de serveur multijoueur. */
const L=require('./lib');
(async()=>{const {b,p,errs}=await L.open();let ok=0,ko=0;const chk=(c,m)=>{console.log((c?'OK  ':'KO  ')+m);c?ok++:ko++};
  const r=await p.evaluate(()=>{const o={};
    /* deepMerge ignore __proto__, constructor, prototype */
    const evil=JSON.parse('{"__proto__":{"polluted":1},"constructor":{"prototype":{"polluted2":1}},"a":{"__proto__":{"polluted3":1},"b":2}}');
    const m=deepMerge({},evil);o.noPollute=({}).polluted===undefined&&({}).polluted2===undefined&&({}).polluted3===undefined&&m.a.b===2;
    /* clés de sport : liste blanche */
    o.keys=[isSportKey('bmx'),isSportKey('__proto__'),isSportKey('constructor'),isSportKey('toString'),isSportKey('nope')];
    o.mode=[typeof modeOf('bmx'),modeOf('toString'),modeOf('__proto__')];
    /* xp et médailles : clé invalide refusée sans erreur */
    const xp0=JSON.stringify(__ll.profile.xp||{});addXp('__proto__',50);addXp('constructor',50);o.xp=JSON.stringify(__ll.profile.xp||{})===xp0&&({}).polluted===undefined;
    /* adresses de serveur : ws/wss, hôte et port seulement */
    o.ws=['ws://192.168.1.23:8080','wss://example.test','ws://[::1]:9000','http://evil.test','ws://user:pw@host:1','ws://host/path','ws://host?x=1','javascript:alert(1)','ws://bad host'].map(u=>wsAddress(u));
    /* ?ws= ne connecte pas tout seul */
    o.cfg={wsUrl:NET_CONFIG.wsUrl,suggest:NET_CONFIG.suggest};
    /* démarrer un sport inconnu : refusé proprement */
    try{__ll.startRun({sport:'__proto__',mode:'free',len:12,weather:'soleil',wind:0,params:{},seed:'S'},{});o.badStart='ok'}catch(e){o.badStart='err '+e.message}
    return o});
  chk(r.noPollute,'profil importé : aucune pollution de prototype (__proto__, constructor)');
  chk(JSON.stringify(r.keys)==='[true,false,false,false,false]','clés de sport en liste blanche '+JSON.stringify(r.keys));
  chk(r.mode[0]==='function'&&r.mode[1]===null&&r.mode[2]===null,'fabrique de mode validée');
  chk(r.xp,'XP : clé de sport invalide ignorée');
  chk(JSON.stringify(r.ws)===JSON.stringify(['ws://192.168.1.23:8080/','wss://example.test/','ws://[::1]:9000/',null,null,null,null,null,null]),'adresses de serveur filtrées '+JSON.stringify(r.ws));
  chk(r.badStart==='ok','sport inconnu refusé sans plantage');
  /* lien avec ?ws= : pré-remplit, ne se connecte pas */
  const p2=await b.newPage();const e2=[];p2.on('pageerror',e=>e2.push(e.message));
  await p2.goto('file://'+require('path').resolve(__dirname,'../dist/test.html')+'?ws=ws://203.0.113.9:8080');await p2.waitForTimeout(1500);
  const w=await p2.evaluate(()=>({suggest:NET_CONFIG.suggest,wsUrl:NET_CONFIG.wsUrl,kind:typeof Net!=='undefined'&&Net.kind?Net.kind():null}));
  chk(w.suggest==='ws://203.0.113.9:8080'&&w.wsUrl!=='ws://203.0.113.9:8080','?ws= pré-remplit sans connexion automatique');
  chk(errs.length===0&&e2.length===0,'aucune erreur JS '+errs.concat(e2).slice(0,3).join(' | '));
  console.log(`TOTAL ${ok} / ${ok+ko}`);await b.close();process.exit(ko?1:0)})();
