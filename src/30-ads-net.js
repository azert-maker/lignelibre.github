/* =====================================================================
   PUBLICITÉS · une seule API pour le jeu, plusieurs régies branchables
   ---------------------------------------------------------------------
   Le jeu n'appelle QUE :  Ads.rewarded(placement) -> Promise<boolean>
                           Ads.interstitial(placement) -> Promise<void>
   Pour intégrer une régie : charge son SDK dans la page, puis mets
   ADS_CONFIG.provider sur 'poki', 'crazygames', 'h5' (Google AdSense H5
   Games) ou 'gamemonetize'. Le mode 'demo' simule une pub de 5 s.
===================================================================== */
const ADS_CONFIG={
  provider:'demo',          // 'demo' | 'poki' | 'crazygames' | 'h5' | 'gamemonetize' | 'none'
  demoSeconds:5,            // durée de la pub simulée
  interstitialEvery:4,      // une pub entre deux parties toutes les N parties (0 = jamais)
  h5:{adClient:'ca-pub-XXXXXXXXXXXXXXXX',testMode:true}, // AdSense H5 : <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js" data-ad-client="..." data-adbreak-test="on">
  gamemonetize:{gameId:'XXXXXXXX'}
};
const Ads=(()=>{
  let busy=false;
  const providers={
    none:{rewarded:async()=>false,interstitial:async()=>{}},
    demo:{
      rewarded:p=>demoAd(p,true),
      interstitial:p=>demoAd(p,false).then(()=>{})},
    // Poki : <script src="https://game-cdn.poki.com/scripts/v2/poki-sdk.js"><\/script> puis PokiSDK.init()
    poki:{
      rewarded:async()=>{if(!window.PokiSDK)return false;try{return !!(await PokiSDK.rewardedBreak())}catch(e){return false}},
      interstitial:async()=>{if(window.PokiSDK)try{await PokiSDK.commercialBreak()}catch(e){}}},
    // CrazyGames : <script src="https://sdk.crazygames.com/crazygames-sdk-v3.js"><\/script> puis await window.CrazyGames.SDK.init()
    crazygames:{
      rewarded:()=>new Promise(res=>{const sdk=window.CrazyGames&&CrazyGames.SDK;if(!sdk)return res(false);
        sdk.ad.requestAd('rewarded',{adStarted(){},adFinished(){res(true)},adError(){res(false)}})}),
      interstitial:()=>new Promise(res=>{const sdk=window.CrazyGames&&CrazyGames.SDK;if(!sdk)return res();
        sdk.ad.requestAd('midgame',{adStarted(){},adFinished(){res()},adError(){res()}})})},
    // Google AdSense H5 Games Ads : window.adBreak / window.adConfig
    h5:{
      rewarded:()=>new Promise(res=>{if(typeof window.adBreak!=='function')return res(false);let ok=false;
        adBreak({type:'reward',name:'reward',beforeReward:show=>show(),adViewed:()=>{ok=true},adDismissed:()=>{ok=false},adBreakDone:()=>res(ok)})}),
      interstitial:()=>new Promise(res=>{if(typeof window.adBreak!=='function')return res();adBreak({type:'next',name:'entre-parties',adBreakDone:()=>res()})})},
    // GameMonetize : window.sdk.showBanner() ; événements SDK_GAME_START / SDK_REWARDED_WATCH_COMPLETE
    gamemonetize:{
      rewarded:()=>new Promise(res=>{if(!window.sdk||!sdk.showBanner)return res(false);const t=setTimeout(()=>res(false),45000);
        window.__gmReward=()=>{clearTimeout(t);res(true)};sdk.showBanner()}),
      interstitial:async()=>{if(window.sdk&&sdk.showBanner)sdk.showBanner()}}
  };
  function demoAd(placement,rewarded){return new Promise(res=>{
    const m=$('#admodal'),cd=$('#adCd'),close=$('#adClose'),skip=$('#adSkip');
    $('#adKind').textContent=(rewarded?'Pub récompensée':'Pub entre deux parties')+' · démonstration';
    $('#adTitle').textContent=placement||'Emplacement publicitaire';
    $('#adNote').textContent=rewarded?'Regarde jusqu\'au bout pour la récompense.':'Tu pourras fermer dans un instant.';
    close.textContent=rewarded?'Récupérer':'Fermer';close.disabled=true;skip.hidden=!rewarded;m.hidden=false;
    let t=ADS_CONFIG.demoSeconds;cd.textContent=t;
    const iv=setInterval(()=>{t--;cd.textContent=Math.max(0,t);if(t<=0){clearInterval(iv);close.disabled=false;cd.textContent='✓';close.focus()}},1000);
    const done=v=>{clearInterval(iv);m.hidden=true;close.onclick=skip.onclick=null;res(v)};
    close.onclick=()=>done(true);skip.onclick=()=>done(false);close.focus()})}
  const prov=()=>providers[S().adsDemo===false&&ADS_CONFIG.provider==='demo'?'none':ADS_CONFIG.provider]||providers.none;
  return {
    async rewarded(placement){if(busy)return false;busy=true;muteAll(true);try{return await prov().rewarded(placement)}finally{muteAll(false);busy=false}},
    async interstitial(placement){if(busy)return;busy=true;muteAll(true);try{await prov().interstitial(placement)}finally{muteAll(false);busy=false}},
    available:()=>ADS_CONFIG.provider!=='none'&&!(ADS_CONFIG.provider==='demo'&&S().adsDemo===false)
  };
})();

/* =====================================================================
   RÉSEAU · multijoueur en direct
   - Dans Claude : capacité « room » (salons nommés, présence ~30 Hz)
   - Ailleurs : serveur WebSocket autonome (server.js), NET_CONFIG.wsUrl
   Chaque joueur publie son état (position, score…) ; les autres sont
   affichés en fantômes (pas de collision entre joueurs).
===================================================================== */
/* --- MULTI LOCAL ÉCOLE (même Wi-Fi, 2 à 4 joueurs, sans Claude) -----------------
   Serveur : fichier server.js à côté du jeu (Node 18+).
     1. Sur le PC « serveur » :  npm install ws   puis   node server.js
     2. Il affiche son adresse, ex. ws://192.168.1.23:8080 (IP du PC sur le Wi-Fi).
   Clients (tous les PC, y compris le serveur) :
     3. Ouvrir ligne-libre.html, puis Multijoueur > « Potes sur ce réseau »,
        coller l'adresse ws://… et « Se connecter »  (ou ouvrir le jeu avec
        ?ws=ws://192.168.1.23:8080 dans l'URL). L'adresse est mémorisée sur le PC.
     4. Un joueur « Crée un salon » (choisit sport / météo / monde), les autres
        le rejoignent avec le code à 5 lettres ou dans la liste des salons.
   Protocole : join {room,id} · state {s} · leave ; le serveur rediffuse l'état
   de chaque joueur du salon 15 fois/s (peers) et la liste des salons (lobby).
   Pas de chat : seuls pseudo, couleurs, position et score circulent.
   Échec fréquent : pare-feu Windows du PC serveur (autoriser Node sur réseau
   privé), Wi-Fi d'école qui isole les appareils, ou page ouverte dans Claude.
--------------------------------------------------------------------------------- */
const NET_CONFIG={wsUrl:new URLSearchParams(location.search).get('ws')||load('ll3_ws','')||(profile.settings&&profile.settings.wsUrl)||''};
const Net=(()=>{
  let kind=null,lobby=null,room=null,code=null,ws=null,wsPeers=[],myId=Math.random().toString(36).slice(2,10),lobbyPeersCb=null,roomPeersCb=null,readyCbs=[],lastErr='';
  const api={get kind(){return kind},get code(){return code},get inRoom(){return !!code},get error(){return lastErr},
    onReady(cb){if(done)cb(kind);else readyCbs.push(cb)},
    onLobby(cb){lobbyPeersCb=cb},onRoom(cb){roomPeersCb=cb},
    lobbyPresence(o){if(kind==='claude'&&lobby)lobby.presence(o).catch(()=>{})},
    async join(c){code=c;if(kind==='claude'){room=await lobby.join('ll-'+c);room.onPeers(ch=>{roomPeersCb&&roomPeersCb(norm(ch.peers))});return true}
      if(kind==='ws'){wsSend({t:'join',room:c,id:myId});return true}return false},
    async leave(){if(room){try{await room.leave()}catch(e){}room=null}if(kind==='ws'&&code)wsSend({t:'leave'});code=null;roomPeersCb&&roomPeersCb([])},
    state(o){if(!code)return;if(room)room.presence(o).catch(()=>{});else if(kind==='ws')wsSend({t:'state',s:o})},
    peers(){if(room)return norm(room.peers());if(kind==='ws')return wsPeers;return []},
    /* connexion manuelle à un serveur local : cb(true|false, message) */
    connect(url,cb){url=String(url||'').trim();if(!/^wss?:\/\/[^\s]+$/i.test(url)){lastErr='Adresse invalide : elle doit commencer par ws:// (ex. ws://192.168.1.23:8080).';cb&&cb(false,lastErr);return}
      /* page servie en https (GitHub Pages) : le navigateur bloque ws:// (contenu mixte) ; on l'explique au lieu d'échouer en silence */
      if(location.protocol==='https:'&&/^ws:/i.test(url)){lastErr='La version en ligne (https) ne peut pas joindre un serveur ws:// local. Télécharge le jeu et ouvre le fichier sur ton PC, ou utilise un serveur wss://.';cb&&cb(false,lastErr);return}
      if(room){room.leave().catch(()=>{});room=null}code=null;openWs(url,ok=>{cb&&cb(ok,lastErr)})}};
  function norm(list){return list.filter(p=>p.kind!=='agent').map(p=>({id:p.peer,me:!!p.sameTab,st:p.presence||{},at:p.updatedAt}))}
  let done=false;function ready(k){kind=k;done=true;readyCbs.forEach(f=>f(k));readyCbs=[]}
  function wsSend(o){if(ws&&ws.readyState===1)ws.send(JSON.stringify(o))}
  function openWs(url,cb){let opened=false,settled=false;const fin=ok=>{if(settled)return;settled=true;cb&&cb(ok)};
    try{if(ws){ws.onclose=null;ws.close()}}catch(e){}
    try{ws=new WebSocket(url)}catch(e){lastErr='Connexion refusée par le navigateur (page ouverte dans Claude ou adresse bloquée).';return fin(false)}
    const to=setTimeout(()=>{if(!opened){lastErr='Pas de réponse du serveur. Vérifie que server.js tourne et que le pare-feu (souvent celui du Wi-Fi d\'école) laisse passer le port.';try{ws.close()}catch(e){}fin(false)}},5000);
    ws.onopen=()=>{opened=true;clearTimeout(to);lastErr='';kind='ws';done=true;readyCbs.forEach(f=>f('ws'));readyCbs=[];fin(true)};
    ws.onerror=()=>{if(!opened){clearTimeout(to);lastErr='Impossible de joindre '+url+'. Serveur éteint, mauvaise adresse IP ou réseau filtré (pare-feu de l\'école).';fin(false)}};
    ws.onmessage=e=>{let m;try{m=JSON.parse(e.data)}catch(x){return}
      if(m.t==='peers'){wsPeers=(m.peers||[]).map(p=>({id:p.id,me:p.id===myId,st:p.s||{},at:Date.now()}));roomPeersCb&&roomPeersCb(wsPeers)}
      if(m.t==='lobby'){lobbyPeersCb&&lobbyPeersCb((m.games||[]).map(g=>({id:g.id,me:false,st:{g},at:Date.now()})))}
      if(m.t==='full')lastErr='Salon plein (16 joueurs max).'};
    ws.onclose=()=>{if(kind==='ws'&&opened){kind=null;lastErr='Connexion au serveur perdue.'}}}
  (async()=>{
    try{if(window.claude&&typeof claude.use==='function'){const r=await claude.use('room');
      if(r){lobby=r;lobby.onPeers(ch=>{lobbyPeersCb&&lobbyPeersCb(norm(ch.peers))});return ready('claude')}}}catch(e){}
    if(NET_CONFIG.wsUrl){openWs(NET_CONFIG.wsUrl,ok=>{if(!ok)ready(null)});return}
    ready(null)})();
  return api})();
