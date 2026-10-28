# Journal des versions · Ligne Libre

## 0.23.0 · 28 octobre 2026 · Économie, pièces à ramasser, 7 lieux

Économie (détail : `docs/ECONOMY.md`)
- Fin de la faille `score / 40` : le wakeboard rapportait jusqu'à 1 101 pièces en 90 s. Les gains viennent maintenant des pièces ramassées (plafond 40) et de bonus plafonnés (performance ramenée au par du sport, arrivée, médaille, objectif).
- Moyenne mesurée : 26 pièces par partie, soit une machine à skins toutes les 6 parties environ.
- Série de jours payée une fois par jour (max 15), défis du jour et de figures, niveaux et prix de la boutique recalibrés (÷3 à ÷4).
- Quitter depuis la pause crédite enfin les pièces acquises, une seule fois.

Pièces à ramasser dans les 7 sports (`37-coins.js`)
- Dorées (1) sur la ligne, cyan (2) à l'écart : couloirs et rase-mottes (wingsuit), corde des virages (downhill), sauts, rails et hors-piste (snowboard), modules et rails (BMX), tables et whoops (motocross), sillage, kickers et sliders (wakeboard), toits, écarts et wallruns (parkour).
- Son, envol, aimant léger pour les dorées, compteur au HUD (PC et mobile), détail des gains en fin de partie.

Gameplay
- Monde libre : une reprise gratuite par partie après une chute (« Reprendre ici »).
- Champ de vision lissé (il sautait à l'impact).
- Clip Blender « celebrate » à l'arrivée avec médaille (parkour, snowboard, downhill).

Lieux
- Paris Rooftops : façades crème, toits en zinc, cheminées en terre cuite, tour Eiffel au loin, lumière de fin de journée.
- Lake Havasu : montagnes de roche rouge, rive de désert, palmiers, pont à arches en pierre.
- Glen Helen MX : herbe sèche, collines brunes, tribune.
- Mount Tamalpais : prairies dorées, mer de nuages sous la route.

Tests
- `tests/econ.js` (21 contrôles) et `tests/v023.js` (11 contrôles) ajoutés à `npm test`.

## 0.22.0 · 28 octobre 2026 · Gameplay et lieux iconiques

Gameplay
- Snowboard : plus de blocage à l'arrêt (des pics rocheux poussaient dans la piste). Piste dégagée et relance automatique après 1,2 s bloqué.
- Wakeboard : les réceptions sont maintenant jugées justes (avant, presque tout était « limite ») et passent par le système de réception commun.

Lieux
- Noms des cartes : Lauterbrunnen Valley (wingsuit), Mount Tamalpais (downhill), Whistler Blackcomb (snowboard), Venice Beach Park (BMX), Glen Helen MX (motocross), Lake Havasu (wakeboard), Paris Rooftops (parkour).
- Venice Beach : béton clair à joints, palmiers, plage, océan, poste de sauveteur, façades colorées, montagnes au loin ; ciel et lumière de bord de mer.
- Lauterbrunnen : falaises verticales, cascades animées, chalets, église, prairies vertes, ciel alpin.
- Whistler : filets et drapeaux de piste, chalets, modules de snowpark sur les bords (hors trajectoire).
- Module `36-places.js` (décor léger fusionné et instancié).

3D
- Modules de snowpark fournis intégrés (`snowpark.glb`, chargé à la demande) : rails du snowboard modélisés.

Tests
- `tests/feel.js` (10 contrôles) ajouté à `npm test`.

## 0.21.2 · 28 octobre 2026 · Pince non jouable

- Retrait du mini-jeu de pince du garage (onglet « Machine », commandes, taux de prise). Récupérer un skin se fait uniquement par l'animation de la machine à skins.
- Le bouton « Machine à skins » de l'onglet Skins ouvre cette animation.
- `tests/claw.js` réécrit (9 contrôles) : plus d'onglet de pince, flèches sans effet, gain depuis le garage.

## 0.21.1 · 28 octobre 2026 · Machine à skins : cosmétiques uniquement

- Les machines (Boutique et garage) ne donnent plus que du cosmétique : 15 skins (tenues, casques) + casque carbone, couleurs néon et fumigènes. Les équipements qui changent la physique s'obtiennent uniquement par la boutique ou la progression.
- Les équipements déjà gagnés avant ce changement sont conservés.

## 0.21.0 · 28 octobre 2026 · Machine à skins de la Boutique

Ajouts
- Carte « Machine à skins » en tête de la Boutique : coût (150 pièces) et chances par rareté visibles avant d'ouvrir.
- Tirage animé dans une fenêtre dédiée : pièce insérée (animation + son), la pince va chercher une peluche de la rareté tirée, descend, ferme les pinces, remonte, revient à la trappe et lâche ; puis révélation (rareté en couleur, nom, type, description). Environ 3,5 à 4 s.
- 5 raretés communes à tout le jeu : Commun 50 % (gris), Peu commun 28 % (vert), Rare 14 % (bleu), Épique 6 % (violet), Légendaire 2 % (or avec halo animé). Fanfare plus forte pour Épique et Légendaire.
- Récompenses : 15 skins + 15 objets non consommables de la boutique (rareté selon le prix), non possédés en priorité ; doublon remboursé 60 pièces (40 %), affiché. Épique ou Légendaire garanti au plus tard au 10e tirage.
- Débit et enregistrement immédiats (profile.coins, profile.owned) avant l'animation : fermer l'onglet en pleine animation ne fait rien perdre.
- Fermer et Tenter bloqués pendant l'animation, Échap ignoré tant qu'elle tourne ; compatible tactile ; repli 2D en CSS si le modèle 3D ne charge pas.
- La scène de fond est mise en pause pendant que la machine est ouverte.

Changements
- Les skins possédés sont maintenant enregistrés dans `profile.owned` (migration automatique depuis `profile.skins.owned`).
- La machine d'adresse du garage utilise les mêmes 5 raretés et les mêmes récompenses ; elle coûte aussi 150 pièces.

Tests
- `tests/shopclaw.js` : 26 contrôles (bureau et mobile, débit unique, séquence, révélation, doublon, chances mesurées sur 20 000 tirages, repli 2D).

## 0.20.0 · 28 octobre 2026 · Skins et machine à pinces

Ajouts
- 15 skins cosmétiques (7 tenues, 8 casques) en 4 raretés : commun, rare, épique, légendaire. Motifs calculés dans le shader (bandes, camouflage, damier, dégradé, chevrons, aurore animée) et finitions (brillant, mat, chrome, or, néon, carbone).
- Machine à pinces jouable au garage (modèle fourni par Jean) : pince pilotable au clavier ou aux boutons tactiles, descente, prise selon le centrage et la rareté, transport jusqu'à la trappe, gain d'un skin.
- Uniquement des pièces gagnées en jouant (120 pièces la partie), aucune monnaie réelle. Composition de la machine et taux de prise affichés ; garantie d'une peluche épique au plus tard toutes les 10 parties ; doublons remboursés en pièces.
- Onglets du garage « Skins » (collection, équiper, retirer) et « Machine ».
- Skins transmis en multijoueur (identifiants validés).
- Modèle de la machine chargé seulement à l'ouverture de l'onglet (pas de ralentissement au démarrage).

Tests
- `tests/claw.js` : 12 contrôles. `tests/all.js` : 63 contrôles (2 onglets de garage en plus).

## 0.19.0 · 28 octobre 2026 · Réceptions motocross et parkour, moto fournie intégrée

Ajouts
- Réceptions qualifiées en motocross (assiette, whip, impact) et en parkour (roulade, grosse chute, précision) via le système commun.
- Moto de motocross fournie par Jean : nettoyée par script (`assets/blender/moto.py`), intégrée sur les groupes animés du jeu (carrosserie recolorée, fourche et direction sur le vrai pivot, roues, plaque au numéro du joueur).
- Mains sur les poignées en motocross (IK) et position d'attaque revue.
- Inventaire et statut de licence de tous les assets reçus (`docs/ASSETS.md`).

Tests
- `tests/glb.js` : 18 contrôles ; `tests/land.js` : 14 contrôles (attend la fin de la chute au lieu d'un délai fixe).

## 0.18.0 · 27 octobre 2026 · Game feel : réceptions, chutes, casque intégral v2

Ajouts
- Système de réception commun à tous les sports (`ctx.land`) : qualité parfaite / propre / limite, ressort de compression du rider, plongée amortie de la caméra, son par qualité, onde au sol sur les réceptions parfaites, message « Réception limite » hors figure.
- Snowboard : la qualité de réception est maintenant calculée (axe de la planche, rotation finie, impact) et compte dans le score.
- Chute physique (BMX, motocross, snowboard, parkour) : le rider est éjecté, culbute, rebondit et bascule au sol ; le véhicule glisse et se couche ; la caméra suit ; le bilan s'affiche après 1,4 s.
- Casque intégral v2 (Blender) : coque modelée par anneaux avec épaisseur, mentonnière intégrée, ouverture de masque arrondie, décors projetés sur la coque (bande, mentonnière), visière ancrée, masque à écran bombé.
- Test `tests/land.js` (12 contrôles).

Corrections
- « Continuer » et le replay remettent le rider sur son véhicule après une chute.

## 0.17.0 · 27 octobre 2026 · Vertical slice BMX, étape 1

Ajouts
- Personnage de référence modélisé dans Blender par script : buste, manches, gants, pantalon cargo, genouillères, baskets, visage (yeux, sourcils, nez, oreilles), cheveux, casque intégral et casque bol ; rig 19 os, pondération, clips idle / celebrate / run ; export GLB.
- Variante légère `rider_lo` (≈ 9 300 triangles visibles) pour la qualité éco et les personnages secondaires.
- BMX modélisé dans Blender : cadre, fourche, cintre deux pièces, poignées, 36 rayons croisés par roue, plateau ajouré, chaîne, pegs, pédales à picots ; pièces posées sur les pivots du jeu.
- `18-glb.js` : décodage des GLB embarqués, habillage du rig du jeu (les os suivent les groupes du rig), recoloration selon le profil, clips Blender, repli procédural.
- IK deux os des bras : les mains tiennent les poignées du BMX (lâcher pendant le barspin).
- Posture BMX revue : genoux fléchis, buste penché, bras pliés.
- Socle de dépôt : `.gitignore`, `package.json`, CI GitHub Actions, `CONTRIBUTING.md`, documents `docs/`.
- Test `tests/glb.js` (15 contrôles).

Corrections
- Fuite de textures d'os (une par primitive, jamais libérées) : squelette partagé, libération dans `disposeTree`.
- Fantômes avec un maillage skinné : matériau fantôme compatible skinning.

Build
- Sorties dans `dist/` ; `17-assets.js` généré à partir de `assets/glb/` ; chargement de GLTFLoader et SkeletonUtils r128 (jsdelivr).

## 0.16 · Refonte « Extreme Arcade »

- 7 sports : Wingsuit, Downhill longboard, Snowboard, BMX, Motocross, Wakeboard, Parkour (street luge, parapente, foil downwind et surf foil retirés, archivés).
- Score, combo ×4, overdrive et figures centralisés ; 61 vérifications automatiques ; replay, clip, fantôme, multijoueur LAN.
