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
const rooms = new Map();          // code -> Map(id -> {ws, s})
const wss = new WebSocketServer({ port: PORT });

const clean = v => String(v || '').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 12);

wss.on('connection', ws => {
  ws.room = null; ws.pid = null;
  ws.on('message', buf => {
    if (buf.length > MAX_STATE + 200) return;
    let m; try { m = JSON.parse(buf); } catch { return; }
    if (m.t === 'join') {
      leave(ws);
      const code = clean(m.room), id = clean(m.id) || Math.random().toString(36).slice(2, 10);
      if (!code) return;
      if (!rooms.has(code)) rooms.set(code, new Map());
      const r = rooms.get(code);
      if (r.size >= MAX_PER_ROOM) return ws.send(JSON.stringify({ t: 'full' }));
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
