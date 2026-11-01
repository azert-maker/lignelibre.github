/* Ligne Libre · serveur multijoueur local (école, même Wi-Fi)
 * ------------------------------------------------------------
 * Prérequis : Node.js 18+ sur UN des PC.
 * Installation (une fois, dans le dossier de ce fichier) :  npm install ws
 * Lancement :  node server.js        (PORT=9000 node server.js pour changer de port)
 * Le serveur affiche les adresses à donner aux autres : ws://IP-DU-PC:8080
 * Côté jeu : Multijoueur > « Potes sur ce réseau » > coller l'adresse > Se connecter
 *            ou ouvrir ligne-libre.html?ws=ws://IP-DU-PC:8080
 * Salons : un joueur crée un salon (code à 5 lettres), les autres le rejoignent.
 * 2 à 4 joueurs par salon. Pas de chat : le serveur relaie seulement l'état
 * de chaque joueur (pseudo, couleurs, position, score) 15 fois par seconde.
 * Windows : accepter la fenêtre du pare-feu pour Node sur « Réseau privé ».
 *
 * Protocole (JSON) :
 *   client -> serveur : {t:'join', room, id} | {t:'state', s:{...}} | {t:'leave'}
 *   serveur -> client : {t:'peers', peers:[{id, s}]}   (15/s, par salon)
 *                       {t:'lobby', games:[{id,c,s,m,n}]} (toutes les 2 s)
 *                       {t:'full'} si le salon est complet
 */
const { WebSocketServer } = require('ws');
const PORT = +process.env.PORT || 8080;
const MAX_STATE = 4096;           // octets max par état de joueur
const MAX_PER_ROOM = 4;            // 2 à 4 joueurs (mode école)
const MAX_CLIENTS = 64;            // connexions simultanées (réseau local)
const MAX_ROOMS = 32;
const MAX_MSG_PER_SEC = 40;        // le jeu envoie ~15 états/s ; au-delà : message ignoré
const MAX_PAYLOAD = MAX_STATE + 512;
const rooms = new Map();          // code -> Map(id -> {ws, s})
// maxPayload : ws refuse (et ferme) un message plus gros AVANT de le garder en mémoire (défaut de ws : 100 Mio)
const wss = new WebSocketServer({ port: PORT, maxPayload: MAX_PAYLOAD });

const clean = v => String(v || '').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 12);

wss.on('connection', ws => {
  if (wss.clients.size > MAX_CLIENTS) { ws.close(1013, 'serveur plein'); return; }
  ws.room = null; ws.pid = null; ws.win = 0; ws.n = 0;
  ws.on('error', () => {});
  ws.on('message', (buf, isBinary) => {
    if (isBinary || buf.length > MAX_STATE + 200) return;
    const now = Date.now(); if (now - ws.win > 1000) { ws.win = now; ws.n = 0; } if (++ws.n > MAX_MSG_PER_SEC) return;
    let m; try { m = JSON.parse(buf); } catch { return; }
    if (!m || typeof m !== 'object') return;
    if (m.t === 'join') {
      leave(ws);
      const code = clean(m.room), id = clean(m.id) || Math.random().toString(36).slice(2, 10);
      if (!code) return;
      if (!rooms.has(code)) { if (rooms.size >= MAX_ROOMS) return ws.send(JSON.stringify({ t: 'full' })); rooms.set(code, new Map()); }
      const r = rooms.get(code);
      if (r.size >= MAX_PER_ROOM) return ws.send(JSON.stringify({ t: 'full' }));
      if (r.has(id)) return ws.send(JSON.stringify({ t: 'full' })); // identifiant déjà pris : pas d'usurpation d'un autre joueur
      ws.room = code; ws.pid = id; r.set(id, { ws, s: {} });
    } else if (m.t === 'state' && ws.room) {
      const r = rooms.get(ws.room); const me = r && r.get(ws.pid);
      if (me && m.s && typeof m.s === 'object' && JSON.stringify(m.s).length <= MAX_STATE) me.s = m.s;
    } else if (m.t === 'leave') leave(ws);
  });
  ws.on('close', () => leave(ws));
});

function leave(ws) {
  if (!ws.room) return;
  const r = rooms.get(ws.room);
  if (r) { r.delete(ws.pid); if (!r.size) rooms.delete(ws.room); }
  ws.room = null;
}

// diffusion de l'état des joueurs de chaque salon
setInterval(() => {
  for (const r of rooms.values()) {
    const msg = JSON.stringify({ t: 'peers', peers: [...r.entries()].map(([id, p]) => ({ id, s: p.s })) });
    for (const p of r.values()) if (p.ws.readyState === 1) p.ws.send(msg);
  }
}, 66);

// liste des salons ouverts (hôte encore au salon)
setInterval(() => {
  const games = [];
  for (const [code, r] of rooms) for (const [id, p] of r) {
    const s = p.s || {};
    if (s.host && s.st === 'lobby' && s.cfg) games.push({ id, c: code, s: s.cfg.sport, m: s.cfg.mode, n: String(s.n || 'Salon').slice(0, 16) });
  }
  const msg = JSON.stringify({ t: 'lobby', games: games.slice(0, 30) });
  for (const ws of wss.clients) if (ws.readyState === 1) ws.send(msg);
}, 2000);

const ips = Object.values(require('os').networkInterfaces()).flat().filter(i => i && i.family === 'IPv4' && !i.internal).map(i => i.address);
console.log('Ligne Libre · serveur multijoueur prêt (port ' + PORT + ')');
console.log('Adresse à donner aux autres joueurs :');
for (const ip of ips.length ? ips : ['localhost']) console.log('   ws://' + ip + ':' + PORT);
