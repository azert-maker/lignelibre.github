# Ligne Libre · sports extrêmes arcade (Three.js)

Jeu de sports extrêmes 3D dans le navigateur, en un seul fichier HTML autonome.
Sept disciplines : Wingsuit, Downhill longboard, Snowboard freestyle, BMX freestyle, Motocross, Wakeboard, Parkour.

## Lancer le jeu

1. Ouvrir `ligne-libre.html` dans un navigateur récent (Chrome, Edge, Firefox, Safari).
   Aucune installation. Une connexion internet est nécessaire au premier chargement : Three.js r128 vient de cdnjs, les polices de Google Fonts. Tout le reste (code, sons) est dans le fichier.
2. Dans Claude (artifact), le jeu ajoute : classement partagé, téléchargement des clips et du profil via la boîte de dialogue de Claude.

## Multijoueur en réseau local (LAN)

- Sur un PC : `node server.js` (port 8080 par défaut, `PORT=xxxx` pour changer).
- Sur chaque joueur : menu Multijoueur, saisir `ws://ADRESSE-DU-PC:8080`, puis créer ou rejoindre un salon (2 à 4 joueurs).
- C'est un serveur LOCAL : il n'y a pas de serveur en ligne public. Sans serveur, le jeu reste entièrement jouable en solo.

## Reconstruire le fichier

```
cd v3
npm install          # Playwright (tests)
npm run build        # dist/ligne-libre.html (artifact), dist/ligne-libre-standalone.html, dist/test.html, dist/bundle.js
npm test             # 61 vérifications de régression + 15 contrôles des modèles Blender
npm run assets       # régénère les modèles Blender (Blender 5.x ou module Python bpy)
```

Les modèles 3D (`assets/glb/*.glb`) sont embarqués en base64 dans le fichier HTML : le jeu reste un fichier unique. Voir `docs/ASSETS.md`.
Documents de suivi : `docs/PROJECT_STATUS.md`, `docs/ROADMAP.md`, `docs/KNOWN_ISSUES.md`, `CHANGELOG.md`, `docs/DISCORD_SETUP.md`.

Ordre des modules :

| Fichier | Rôle |
|---|---|
| 01-head.html, 02-body.html | styles, écrans, HUD |
| 10-core.js | utilitaires, rendu, météo, particules, audio de base, entrées, profil et migration |
| 15-fx.js, 16-sfx-data.js | effets (eau, neige profonde, traînées), couches audio, sons Pixabay intégrés |
| 17-assets.js (généré), 18-glb.js | modèles Blender embarqués, décodage, habillage du rig (personnage, BMX) |
| 20-gear.js | équipement, boutique, rider articulé (`buildHuman`), modèles partagés |
| 30-ads-net.js | pubs de démonstration, réseau (Claude ou WebSocket) |
| 35-valley.js | terrain de montagne (wingsuit, snowboard) |
| 40-wingsuit.js, 41-downhill.js, 44-snowboard.js | sports conservés |
| 45-park.js | modules de parc au relief exact (BMX, motocross, wakeboard), portes, spots |
| 46-bmx.js, 47-moto.js, 48-wake.js, 49-parkour.js | nouveaux sports |
| 50-ui.js, 55-engage.js, 57-progress.js, 58-replay.js | menus, engagement, progression, replay et fantôme |
| 60-main.js | boucle de jeu, score / combo / overdrive centralisés, caméra libre, entrées |

`archive/` contient les anciens modules retirés (foil, surf foil, parapente) pour référence ; ils ne sont plus assemblés.

## Interface d'un sport (module)

`MODES[id]=(cfg, look, ctx)=>({...})` renvoie : `env, stats, name, vScale, target, keys, touch, inst, hudUpdate, prog, auto, update(dt, I), attract, idle, snapshot, restore, netState, ghost, overStats, dispose`, plus `_rig` et `_h` (replay, caméra).
`ctx` fournit : `trick(nom, points, opt)`, `bonus`, `checkpoint`, `crash`, `finish`, `hud`, `cam`, `keep` (prolonger le combo pendant un grind ou un manual), `comboBreak`, `slowmo`.

## Tests automatisés

Prérequis : Node 18+ et Playwright avec Chromium (`npm install`, puis `npx playwright install chromium`). Les tests ouvrent `dist/test.html`.

```
node tests/all.js        # régression 7 sports (61 vérifications)
node tests/glb.js        # modèles Blender dans le moteur (15 contrôles)
node tests/bmx3.js       # figures BMX scénarisées
node tests/pk2.js        # wallrun / walljump parkour
node tests/kb.js         # vraies touches clavier sur 4 sports
node tests/touch.js      # écran tactile (mobile paysage)
node tests/perf.js       # appels de dessin, triangles, i/s (rendu logiciel)
node tests/leak.js       # géométries et textures stables entre les courses
```
