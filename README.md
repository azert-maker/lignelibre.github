# Ligne Libre

Jeu de sports extrêmes arcade en 3D, jouable directement dans le navigateur. Sept disciplines, sept lieux, un seul fichier HTML.

**▶ Jouer : https://azert-maker.github.io/lignelibre.github/**
(PC et mobile ; une connexion internet est nécessaire au premier chargement.)

![Les sept sports avec leurs pièces à ramasser](docs/images/pieces-7-sports.jpg)

| Sport | Lieu | Ce qui compte |
|---|---|---|
| Wingsuit | Lauterbrunnen Valley | trajectoire, rase-mottes, anneaux |
| Downhill longboard | Mount Tamalpais | vitesse, corde des virages, slides |
| Snowboard | Whistler Blackcomb | sauts, rotations, rails |
| BMX | Venice Beach Park | figures, équilibre, grinds |
| Motocross | Glen Helen MX | impulsions, réceptions, whip |
| Wakeboard | Lake Havasu | traction, pop, wake to wake |
| Parkour | Paris Rooftops | flow, enchaînements, wallruns |

Les noms de lieux situent l'ambiance des cartes ; aucune affiliation avec ces lieux ou leurs exploitants.

Combo ×4 et overdrive, réceptions notées, chutes physiques, replay et fantôme, pièces à ramasser, boutique et machine à skins (cosmétiques uniquement, pièces gagnées en jouant, aucune monnaie réelle), multijoueur en réseau local.

## État du projet

Version **0.23** · en développement actif, par une seule personne.

**Ce qui marche déjà**
- Les 7 sports en monde libre et en parcours chronométré, au clavier, à la manette (non testée) et au tactile.
- Personnage, BMX et moto modélisés dans Blender ; réceptions et chutes physiques.
- Pièces à ramasser, économie équilibrée (une machine à skins toutes les 6 parties environ), boutique, garage, 15 skins.
- Décor et ciel propres à chacun des 7 lieux.
- Sauvegarde dans le navigateur, export et import du profil.

**Limitations actuelles** (détail : [`docs/KNOWN_ISSUES.md`](docs/KNOWN_ISSUES.md))
- Performances mesurées seulement en rendu logiciel : les vrais téléphones d'entrée de gamme peuvent ramer (règle la qualité sur « éco »).
- Le multijoueur ne marche qu'en réseau local avec le fichier téléchargé (la version en ligne en https ne peut pas joindre un serveur `ws://` local).
- Les publicités sont une démonstration (fausse pub de 5 s), aucune régie n'est branchée.
- Planches (longboard, snowboard, wakeboard) et combinaison wingsuit encore simples.
- Le ressenti des commandes n'a pas encore été validé par beaucoup de joueurs : tes retours comptent.

## Feuille de route publique

| | |
|---|---|
| **En cours** | retours des premiers joueurs, équilibrage de l'économie, performances sur mobile |
| **Ensuite** | planches et combinaison wingsuit modélisées, animations de réception et de chute, kits de décor Venice et Paris |
| **Plus tard** | multijoueur en ligne (demande un serveur hébergé), nouveaux skins, défis hebdomadaires |
| **Pas promis** | nouveaux sports, application mobile native, monnaie réelle, concours avec dotation, personnages ou marques sous licence |

La feuille de route détaillée est dans [`docs/ROADMAP.md`](docs/ROADMAP.md).

## Proposer une idée

Ouvre une issue **Idée** : [nouvelle idée](https://github.com/azert-maker/lignelibre.github/issues/new/choose). Le formulaire demande un résumé, le sport ou système concerné, l'intérêt pour le joueur et une référence visuelle si tu en as. Vérifie d'abord que l'idée n'existe pas déjà.

## Signaler un bug

Ouvre une issue **Bug** : [signaler un bug](https://github.com/azert-maker/lignelibre.github/issues/new/choose). Indique ton navigateur et ton appareil, le sport, les étapes pour reproduire, ce que tu attendais et ce qui s'est passé.

Faille de sécurité ou exploit grave (pièces infinies, triche) : **en privé**, voir [`SECURITY.md`](SECURITY.md).

## Contribuer

Tout est expliqué dans [`CONTRIBUTING.md`](CONTRIBUTING.md) (code, assets, messages de commit) et la charte [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md). Les issues `good first issue` sont un bon point de départ.

## Lancer en local

Aucune installation pour jouer : télécharge `ligne-libre-standalone.html` depuis les artefacts de la CI ou construis-le, puis ouvre-le dans Chrome, Edge, Firefox ou Safari.

Construire depuis les sources (Node 18+, `sh` et `base64`, présents sur Linux, macOS et Git Bash sous Windows) :

```
npm run build        # dist/site/index.html (version web), dist/ligne-libre-standalone.html, dist/test.html
npx serve dist/site  # ou n'importe quel serveur statique, puis http://localhost:3000
```

Tests (Playwright + Chromium) :

```
npm install
npx playwright install chromium
npm test             # 7 sports, modèles Blender, réceptions, boutique, machine à skins, lieux, économie
```

Multijoueur en réseau local : sur un PC, `npm install ws` puis `node server/server.js` ; les autres joueurs saisissent `ws://ADRESSE-DU-PC:8080` dans le menu Multijoueur (fichier téléchargé, pas la version en ligne). Ce serveur n'est pas fait pour internet.

## GitHub Pages

Le workflow [`.github/workflows/pages.yml`](.github/workflows/pages.yml) construit `dist/site/` (le jeu en un seul `index.html`, une page 404 qui renvoie vers le jeu, `.nojekyll`) et le publie à chaque push sur `main`. Aucun secret, aucun chemin relatif : le fichier fonctionne à la racine comme dans un sous-dossier.
Procédure détaillée et dépannage : [`docs/PUBLICATION.md`](docs/PUBLICATION.md).

## Organisation du code

Le jeu est assemblé par `build.sh` à partir de modules numérotés :

| Fichier | Rôle |
|---|---|
| `01-head.html`, `02-body.html` | styles, écrans, HUD |
| `10-core.js` | utilitaires, rendu, météo, entrées, profil |
| `15-fx.js`, `16-sfx-data.js` | effets, audio, sons intégrés |
| `17-assets.js` (généré), `18-glb.js` | modèles Blender embarqués, habillage du personnage |
| `20-gear.js` | équipement, boutique, personnage articulé |
| `30-ads-net.js` | pubs (démo), réseau local |
| `35-valley.js`, `36-places.js`, `37-coins.js` | terrain de montagne, décors des lieux, pièces |
| `40` à `49` | un module par sport (`45-park.js` : modules de parc partagés) |
| `50-ui.js`, `52-claw.js`, `55-engage.js`, `57-progress.js`, `58-replay.js` | menus, machine à skins, engagement, progression, replay |
| `60-main.js` | boucle de jeu, score, combo, économie de fin de partie |

Chaque sport expose `MODES[id]=(cfg, look, ctx)=>({...})` : `update`, `auto`, `snapshot`, `restore`, `coins`, etc. Documents de suivi : [`CHANGELOG.md`](CHANGELOG.md), [`docs/`](docs/).

## Licence

- **Code** : [MIT](LICENSE).
- **Assets** (modèles 3D, sons, rendus, nom « Ligne Libre ») : tous droits réservés ou conditions de leurs créateurs, voir [`LICENSE-ASSETS.md`](LICENSE-ASSETS.md).

Crédits : Three.js (MIT), sons Pixabay (Pixabay Content License), modèles de moto, de machine à pinces et de snowpark fournis avec l'accord de leurs créateurs (voir `assets/third_party/`).
