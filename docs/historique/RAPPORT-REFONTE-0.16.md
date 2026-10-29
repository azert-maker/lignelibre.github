# Refonte « Extreme Arcade » · rapport

## 1. État des lieux de départ (audit)

- Projet : 16 modules JS + 2 fichiers HTML assemblés en un seul HTML (Three.js r128 via cdnjs). Serveur `server.js` (WebSocket) pour le LAN.
- Opérationnel avant la refonte : 7 sports (wingsuit, downhill, street luge, snowboard, parapente, foil downwind, surf foil), parcours / libre, combo ×4 + jauge Flow, rider articulé, garage, boutique (pièces ou pubs de démo), XP / niveaux / défis de figures, série + défi du jour + parcours du jour, comptes locaux PIN, export / import, multijoueur (Claude ou WebSocket local), replay + clip 9:16, fantôme, qualité Éco / Normal / Élevé + qualité auto.
- Faiblesses relevées : la jauge Flow pouvait porter le multiplicateur à ×6 (au-delà du ×4 annoncé) ; pas de bonus de variété ; pas d'option de secousses ni de volumes séparés ; `V3()` ignorait ses arguments (bug latent) ; pas de bouton tactile pour les figures.

Point de restauration : archive `backup-pre-extreme-*.tgz` + dépôt git local dans `v3/` (un commit par lot).

## 2. Ce qui a changé

### Lot A · Sports retirés et migration
- Retirés des menus, du code assemblé, des défis, de la boutique, du garage et des objectifs : street luge, parapente, foil downwind, surf foil. Les modules sont archivés dans `v3/archive/`.
- Migration des profils (v4) : le dernier sport choisi est ramené sur un sport existant ; pièces, XP, records, cosmétiques, réglages, comptes et identifiants conservés ; les données des sports retirés restent stockées mais ne sont plus lues. Les déblocages « tous sports » tiennent compte de l'XP déjà gagnée dans les anciens sports.

### Lot B · Score, combo, overdrive (60-main.js)
- Barème central `SCORE` : fenêtre de combo, pas de multiplicateur, plafond ×4 (réel, overdrive compris), mémoire de variété, bonus de réception, bonus de risque.
- `ctx.trick(nom, points, {base, land, risk, hold})` : famille de figure (variété), qualité de réception mesurée par le sport (parfaite / propre / limite), risque, actions tenues (grind, manual, slide) qui prolongent le combo.
- Variété : refaire la même famille parmi les 6 dernières rapporte 100 / 60 / 35 / 20 % ; une famille nouvelle dans le combo : +15 %.
- Overdrive : la jauge se remplit avec les points ; pleine = 8 s où le combo monte deux fois plus vite (toujours plafonné à ×4), HUD et vignette teintés, effets renforcés. La physique ne change pas.
- HUD : badge de combo (×N + minuterie de la fenêtre, animation au changement, « PARFAIT » sur réception parfaite). Les noms de figures ne s'affichent en grand que pour les grosses figures ou en début de combo.
- Record personnel battu en direct (monde libre) : annonce unique.
- Ralentis très courts (BIG AIR moto, grosse figure parfaite BMX / wake) ; le chrono ralentit aussi, l'équité est gardée ; désactivables.
- Accessibilité : secousses de caméra Aucune / Réduites / Normales, flashs d'écran on/off, volume des effets et de la musique séparés, astuces on/off.

### Lot C · Rider et modèles
- `buildHuman` : cycle de jambes (course avec balancier des bras, pédalage), conservé dans le replay.
- Modèles procéduraux : BMX (cadre et guidon pivotants pour tailwhip / barspin réels), moto (fourche qui s'enfonce, whip réel), wakeboard + bateau (tour, pilote), coureur de parkour. Chaussures rendues avec la couleur du modèle choisi.

### Lot D · Les quatre nouveaux sports (un module chacun, physique propre)
- **Parc à modules** (`45-park.js`, partagé BMX / moto / wake) : profils échantillonnés par morceaux avec un échantillon pile sur chaque lèvre ; la hauteur et la normale physiques sont celles des triangles affichés. Faces verticales : rebond lisible le long de la face, chute seulement si on la prend vraiment de face.
- **BMX freestyle** : skatepark fermé par des quarters + coins radiaux, lignes générées (gap, table, box, rail, spine, kicker, bank). Pédalage, freins, bunny hop chargé, sortie « vert » sur quarter (demi-tour de base assisté), rotations (180 à 900), flips, tailwhip, barspin, grinds (Double peg, Feeble, Smith, Crooked, Icepick), manual en équilibre, transfert de spine. Parcours : ligne chrono à portes ; libre : session jam + spots.
- **Motocross** : circuit en serpentin (jamais de croisement) avec tables, doubles, triples, whoops, step-ups et berms relevés biseautés ; arène freestyle avec lignes FMX et un grand saut central. Moteur synthétisé (5 rapports), adhérence limitée et roost, suspension visuelle, assiette en l'air, whip, scrub, Superman / Nac-nac / Heel clicker, backflip, BIG AIR. Panneaux « vitesse conseillée » devant chaque saut.
- **Wakeboard** : bateau qui suit vraiment son parcours, rider tenu à 20 m de corde ; sillage en V calculé dans le repère du bateau et affiché avec la même fonction (hauteur exacte du triangle d'eau). Coupe progressive, pop sur la crête, wake to wake, rotations, Tantrum, Backroll, Raley, grabs, kickers et sliders flottants. Parcours : slalom de bouées (+3 s par bouée manquée) ; libre : boucle du lac, défis de sillage, spots.
- **Parkour** : contrôleur cylindre contre boîtes (immeubles et obstacles = ce qui est affiché). Course, saut avec temps coyote, vault (speed / kong), montée et wall pop, wallrun uniquement sur les panneaux cyan marqués, walljump, glissade sous les barres magenta, roulade, sauts de précision, sauts de toit avec bonus de risque, flow continu.
- Wingsuit : ajout « Anneau parfait » (plein centre) avec flash de précision.

### Lot E · Interface, garage, progression
- Accueil : bandeau des 7 sports (accès direct). Cartes de sport : niveau + barre d'XP, boutons directs vers les deux modes.
- Garage en 8 onglets : Corps, Wingsuit, Downhill, BMX, Moto, Wake, Parkour, Teintes ; équipement à effet de jeu (cadres BMX, motos 125 / 250 / 450, planches de wake, chaussures) séparé des couleurs cosmétiques.
- 29 nouveaux défis de figures (28 pour les nouveaux sports + « Anneau parfait » en wingsuit) vérifiés sur de vrais événements, 8 défis du jour, objectifs de session par sport, déblocages par niveau pour le nouveau matériel.
- Astuces pratiques par sport (2 premières parties, non bloquantes). Bouton tactile « Figure » ; mise en page mobile paysage revue.

## 3. Commandes

| Sport | Clavier |
|---|---|
| BMX | ↑ pédaler · ↓ freiner · ← → tourner · Espace maintenu puis relâché = bunny hop · en l'air : ← → rotations, ↑ ↓ flips, Shift/F tailwhip, Espace barspin · au sol : Shift/F maintenu = manual (équilibre ↑ ↓) |
| Motocross | ↑ gaz · ↓ frein · ← → braquer · Espace maintenu = précharge · en l'air : relâcher puis ↓ cabrer (backflip) / ↑ plonger, ← → whip, Shift/F (+ ← → ou ↓) figures freestyle |
| Wakeboard | ← → carre · Espace maintenu puis relâché sur la crête = pop · en l'air : ← → rotations, ↑ Tantrum, ↓ Backroll, Shift/F grab (+ ← = Melon), ré-appui Espace = Raley |
| Parkour | ↑ courir · ← → tourner · Espace sauter / walljump / kong vault · ↓ glissade ou roulade |
| Tous | C caméra · Q / E regarder · V derrière · R rejouer · Échap pause · M son |

Manette : stick gauche, A = action, LT/RT = figure, stick droit = regarder, Y = caméra, X = rejouer, Start = pause. Tactile : flèches, Action, Figure.

## 4. Tests effectués

Moyen : Chromium headless (rendu logiciel SwiftShader) piloté par Playwright, simulation déterministe à 60 Hz pour la physique, vraies touches clavier et écran tactile émulé pour les entrées.

### Vérifié (tests automatisés qui passent)
- Suite `tests/all.js` : **61 / 61**. Migration d'un ancien profil (sports retirés, pièces, cosmétiques, version), exactement 7 sports, sports retirés absents, bandeau d'accueil, chaque sport × chaque mode 20 à 30 s au pilote automatique sans erreur JS avec score, stats de fin et HUD, relance avec R, les 8 onglets du garage.
- BMX scénarisé (`bmx3.js`) : air, 360, tailwhip, barspin, backflip, manual 4 s, sortie vert « Air » et « 540 », grind « Double peg 7 m », grind sur arête de box.
- Parkour (`pk2.js`) : wallrun déclenché sur panneau cyan, walljump, wall pop.
- Moto : calibration des sauts (vitesses d'approche qui passent), parcours complet au pilote automatique.
- Wakeboard : 17 wake to wake sur 17 sauts en 60 s, slalom 8 / 8 bouées.
- Vraies touches (`kb.js`) : BMX pédale + saut, moto accélère, wake traverse, parkour court + saute.
- Tactile (`touch.js`) : boutons visibles, bouton Figure présent selon le sport.
- Non-régression : `smoke`, `t15` (comptes, export / import, invalide refusé, sauvegarde à la fermeture), `t17` (7 sports en parcours), `t19` (garage, chute, relance).
- Replay + export de clip + fantôme sauvegardé et rejoué : BMX, motocross, wakeboard, parkour (et downhill).
- Multijoueur LAN (`server.js`, 2 joueurs) : downhill, parkour, wakeboard.
- Aucune fuite mémoire de géométries ou textures sur 10 lancements successifs.

### Partiellement vérifié
- Temps cibles des médailles : vérifiés contre le pilote automatique (BMX 33 s pour une cible or à 27 s ; moto 33 s pour 31 s), pas contre de vrais joueurs.
- Performances : mesurées en rendu logiciel uniquement (tableau ci-dessous). Les valeurs absolues d'images par seconde ne représentent pas un vrai GPU ; les appels de dessin et triangles, si.

### Non testé
- Manette physique (le mapping est codé, aucun matériel ici).
- Vrai téléphone ou tablette (seulement l'émulation tactile).
- Ressenti de jeu par un humain : réglages de vitesses, tolérances et points à confirmer en jouant.

### Bloqué par l'environnement
- Multijoueur dans Claude (salons partagés) et classement en ligne : nécessitent l'artifact ouvert dans Claude par plusieurs comptes.
- Clip vidéo : enregistré en mp4/VP9 dans Chromium headless ; le format réel dépend du navigateur (MediaRecorder).

### Mesures (Chromium headless, rendu logiciel, 1280×720)

| Qualité | Sport | i/s (logiciel) | Appels de dessin | Triangles |
|---|---|---|---|---|
| Éco | BMX / Moto / Wake / Parkour | 42 / 55 / 40 / 34 | 119 / 105 / 128 / 196 | 15 k / 12 k / 9 k / 4 k |
| Normal | BMX / Moto / Wake / Parkour | 21 / 23 / 11 / 25 | 125 / 112 / 131 / 198 | 25 k / 33 k / 32 k / 6 k |
| Élevé | BMX / Moto / Wake / Parkour | 22 / 26 / 11 / 27 | 125 / 111 / 182 / 257 | 25 k / 33 k / 42 k / 8 k |

Mesures prises avant deux optimisations (obstacles du parkour regroupés en instances, eau du wake allégée) : les appels de dessin du parkour et le coût CPU de l'eau ont baissé depuis. La qualité auto passe en Éco sous 40 i/s pendant 3 s et la résolution s'adapte progressivement (baisse sous ~45 i/s, remontée s'il y a de la marge).

## 5. Limites connues et reste à faire

- Pas de wallride BMX ni de rails en pente sur escaliers ; bowl remplacé par des coins radiaux et une spine.
- Motocross : pas de courses à plusieurs tours ni de pilotes IA ; les virages du circuit sont des arcs (berms) générés.
- Wakeboard : pas de passage de palonnier animé pour les 360 (la rotation est directe) ; le rider ne peut pas lâcher la corde.
- Parkour : pas de double saut (choix de design), pas d'escalade de murs hauts ni de tyrolienne ; les façades ne sont pas éclairées de nuit.
- Les noms « Saut de toit X m » mesurent la distance de vol, pas l'écart exact entre deux bâtiments.
- Pilotes automatiques (aperçus des menus) volontairement simples : ils tombent parfois.
- Remappage des touches et presets de contrôles non faits. Mode « switch » snowboard, flips au swipe sur mobile : non faits.
- Modèles 3D Blend Swap toujours en attente (téléchargement manuel non reçu).
- Le PIN local sépare les profils sur un PC partagé ; ce n'est pas une protection forte.
