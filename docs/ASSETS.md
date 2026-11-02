# Catalogue des assets 3D · Ligne Libre

## Pipeline

1. **Source** : script Python Blender (`assets/blender/*.py`), reproductible, versionné. Le `.blend` produit est la source éditable par un artiste.
2. **Génération** : `npm run assets` (Blender 5.1.2 en module Python `bpy`, ou `blender -b -P script.py` avec Blender installé).
3. **Export** : GLB dans `assets/glb/` (Y en haut, sans textures, normales lissées, animations en actions séparées).
4. **Build** : `build.sh` embarque chaque GLB en base64 dans `17-assets.js` (fichier généré, non versionné). Le jeu reste un fichier HTML unique.
5. **Chargement** : `18-glb.js` décode les GLB au démarrage (≈ 60 ms) ; le jeu démarre sans les attendre puis reconstruit la scène de démo.
6. **Intégration** : `dressHuman` (personnage), `dressBmx` (vélo), `dressMoto` et les fonctions d'équipement (`dressLongboard`, `dressSnowboard`, `dressWake`, `dressFlyer`) habillent les rigs du jeu ; repli procédural automatique si un modèle manque.
7. **Vérification** : `node tests/glb.js` (24 contrôles : chargement, 7 sports, squelette unique, synchronisation des os, IK, LOD, clips, équipement, repli).

Conventions : mètres ; dans Blender Z en haut, le personnage regarde +X, son côté « 0 » est en +Y ; matériaux nommés pour être recolorés par le profil du joueur (`skin`, `accent`, `suit`, `helmet`, `shoe`, `frame`, `rim`, `grip`).

## Catalogue

| Asset | Fichier | Triangles | Matériaux | Taille GLB | Rig | Animations | Statut |
|---|---|---|---|---|---|---|---|
| Rider (complet) | `assets/glb/rider.glb` | 23 974 au total ; ≈ 22 600 visibles avec casque intégral (corps 13 508, visage 3 532, casque v2 5 572) | 17 : skin, accent, accent2, suit, helmet, visor, shoe, sole, glove, hair, eye_white, iris, pupil, lip, brow, detail, metal | 765 Ko | 19 os (pelvis, spine, torso, neck, head, clavicle/upperArm/foreArm/hand ×2, upperLeg/lowerLeg/foot ×2), pondération douce aux articulations, 4 influences max | idle, celebrate, run (30 i/s) ; en jeu les os suivent le rig procédural | ✅ v1, testé en jeu |
| Rider (léger, LOD) | `assets/glb/rider_lo.glb` | 9 543 au total ; ≈ 8 700 visibles | idem | 350 Ko | idem | idem | ✅ v1, qualité éco + personnages secondaires |
| Moto motocross (fournie) | `assets/glb/moto.glb` | 13 642 (carrosserie 6 046, avant 2 548, roues 2 020 + 3 028) | 5 : Body (recolorée), Metal, Black Metal, Rubber, Decale (numéro du joueur) | 560 Ko | pièces rigides sur les groupes de 47-moto.js, pivots en extras glTF | animées par le jeu : roues, fourche, direction, whip | ✅ intégrée et testée |
| Machine à pinces (fournie) | `assets/glb/claw.glb` | 22 579 (meuble 10 791, mécanisme 1 034, 15 peluches) | textures 512 px WEBP | 777 Ko | nœuds barre > chariot > tête > 3 doigts | animée par le jeu (déplacement, descente, ouverture) | ✅ intégrée et testée |
| Modules de snowpark (fournis) | `assets/glb/snowpark.glb` | 210 à 2 500 par module (8 modules) | 1 texture « trim » 256×512 | 631 Ko | aucun | statiques | ✅ intégrés (rails du snowboard, décor Whistler) |
| Équipement de glisse et voilure | `assets/glb/gear.glb` | 13 960 au total : plateau 2 152, truck 708, roue 440, snowboard 2 336, fixation 1 436, wakeboard 2 936, chausson 948, palonnier 420, voilure bras 1 840 + jambes 744 (soit ≈ 5 300 par sport de glisse) | 21 nommés et recolorés : deck, grip, ply, bushing, wheel, top, base, edge, strap, board, lace, wing (couleurs par sommet selon le motif)… | 296 Ko | pièces rigides posées sur le rig (`dressLongboard`, `dressSnowboard`, `dressWake`, `dressFlyer`) ; plateau et wakeboard modélisés sur 1 m et étirés à la longueur de la planche | aucune ; battement de la voilure et orientation du palonnier faits par le jeu | ✅ 0.24, testé en jeu |
| Mobilier de Venice Beach | `assets/glb/venice.glb` | 988 : banc 108, poubelle 316, lampadaire 224, mât d'éclairage 200, fontaine 140 | 7 : concrete, wood, metal, bin (teinte par instance), binrim, glass, pole | 35 Ko | aucun | statique, instancié (`glbInstances`) | ✅ 0.25, BMX |
| Toits de Paris | `assets/glb/paris.glb` | 376 : souche de cheminée 272 (même boîte que la collision), lucarne 104 | 6 : plaster, brick, pot, zinc, frame, glass | 18 Ko | aucun | statique, instancié | ✅ 0.25, parkour |
| BMX freestyle | `assets/glb/bmx.glb` | 7 678 (cadre 2 230, avant 1 148, roues 1 868 ×2, pédalier 564) | 7 : frame, chrome, dark, tire, rim, grip, seat | 144 Ko | pièces rigides sur les pivots du jeu (tailwhip, barspin, axes, boîtier) | animées par le jeu : roues, pédalier, tailwhip, barspin, braquage | ✅ v1, testé en jeu |

Variantes de casque dans `rider.glb` : `helmet_full` (intégral, aussi utilisé pour « Carbone » avec une teinte sombre brillante) et `helmet_open` (bol, cheveux visibles).

## Rendus de contrôle

`assets/renders/` : `helmet_front.jpg` et `helmet_34.jpg` (casque intégral v2), `rider_34.jpg` (trois-quarts), `rider_face.jpg` (visage sans casque), `rider_celebrate.jpg` (clip), `bmx_side.jpg`, `bmx_34.jpg`, `gear_34.jpg` (longboard, snowboard, wakeboard et palonnier, voilure), `venice_props.jpg`, `paris_props.jpg`.

## Licences

- Modèles 3D : créés pour le projet par script, propriété du projet.
- Sons : Pixabay (licence Pixabay, usage commercial permis sans attribution), détail dans `16-sfx-data.js`.
- Bibliothèques : Three.js r128 et ses exemples (licence MIT).

## Assets reçus le 28 octobre 2026 : inventaire et décision

Le 28 octobre, le propriétaire du projet a confirmé que ces modèles sont libres d'utilisation (accord des créateurs). Deux exceptions restent exclues pour une raison qui ne dépend pas des créateurs du fichier : un personnage protégé (Alucard) et des marques déposées (Troy Lee Designs, 6D).

| Fichier | Contenu vérifié | Décision |
|---|---|---|
| `DirtBike.blend` | moto de motocross riggée, 17 778 triangles, sans marque | ✅ intégrée (moto du motocross) |
| `rails.rar` | 8 modules de snowpark en FBX (rail S, rail droit, press droite, A-frame, A-frame plat, bonk, fat kink, rainbow press), 210 à 2 500 triangles chacun, textures « trim » 4K (base, masque, normales) non reliées | ✅ intégré (0.22) : `assets/blender/snowpark.py` → `assets/glb/snowpark.glb` (631 Ko, texture réduite à 256×512, chargé à la demande) ; rails du snowboard et modules posés au bord de la piste de Whistler |
| `3d-model.3ds` (×2) | (a) remontée mécanique complète (pylônes, câble, gares), 4 606 faces ; (b) sapins enneigés et chalets, 178 faces ; unités en millimètres ; textures JPG/PNG référencées mais absentes | 🟡 utilisable pour le décor du snowboard après retexturage maison |
| `Mountain_Snow.rar` | une montagne sculptée en FBX, 7,99 millions de triangles, 40 × 40 × 8,8 unités, sans matériau | 🟡 trop lourde telle quelle ; à convertir en carte de hauteur pour le fond de Whistler ou Lauterbrunnen |
| `stadiodentro.rar` | uniquement des textures 4K (sol, métal, rambarde, tribunes, bordure de piste), sans maillage | ⚪ inutilisable sans le modèle ; peut servir de matière pour une arène de supercross |
| `tex.rar` | textures d'un masque et d'un casque de marque (6D, Troy Lee SE5) sans maillage | ⛔ non intégré : marques déposées, et pas de modèle |
| `Realistic man.blend` | personnage photoréaliste exporté de Character Creator (CC_Base), 345 499 triangles, 124 images, 3 armatures | 🟡 utilisable côté licence ; reste hors direction artistique et 15 fois trop lourd : à réserver à une éventuelle tenue spéciale après décimation et adaptation du squelette |
| `alucardhellsingrigged.rar` | Alucard (Hellsing), personnage riggé | ⛔ non intégré : personnage protégé par le droit d'auteur |
| `Claw_Machine_Free.blend` | machine à pinces avec peluches, 36 841 triangles, 12 images | ✅ intégrée : machine à pinces du garage pour gagner des skins (`assets/glb/claw.glb`, 22 579 triangles, 777 Ko, chargée à la demande) |
| `blenderkit-v3.21.3.zip` | archive vide (22 octets) | ⛔ fichier corrompu ou incomplet ; c'est un module complémentaire de Blender, pas un asset |

## Audit 3D du 28 octobre 2026 (0.22)

| Catégorie | Assets | Commentaire |
|---|---|---|
| Utilisé et bon | rider, rider_lo, BMX, moto, machine à skins, modules de snowpark | testés en jeu (`tests/glb.js`, `tests/feel.js`) |
| Branché pendant cet audit | modules de snowpark | rails du snowboard (géométrie Blender à la place du cylindre) + 5 modules décoratifs par tronçon à Whistler |
| Pauvre ou à améliorer | remontée mécanique et sapins `3d-model.3ds` (pas de textures), `Mountain_Snow` (8 M de triangles), `Realistic man` (345 000 triangles) | retexturer ; convertir la montagne en carte de hauteur ; décimer le personnage |
| Décor procédural (pas de modèle) | palmiers, poste de sauveteur, façades de Venice ; chalets, église, cascades de Lauterbrunnen ; filets, drapeaux, chalets de Whistler ; tour Eiffel, toits en zinc (Paris) ; pont de pierre, palmiers (Havasu) ; tribune (Glen Helen) ; mer de nuages (Tamalpais) (`36-places.js`) | légers (fusion des sommets, instanciation), à remplacer par des modèles Blender si besoin |
| Branché en 0.23 | clip `celebrate` du rider (écran d'arrivée) ; pièces à ramasser (un seul InstancedMesh) | `tests/v023.js`, `tests/econ.js` |

### Assets manquants, par priorité

| # | Asset | Sport | Pourquoi | Contraintes | Remplaçant actuel |
|---|---|---|---|---|---|
| 1 | ~~Planches (longboard, snowboard, wakeboard) + palonnier~~ | Downhill, Snowboard, Wakeboard | fait en 0.24 (`gear.glb`) | | |
| 2 | Clips Blender de réception et de chute | tous | rendre la compression et la chute plus organiques | 19 os du rig, 0,3 à 1 s, en place | ressort procédural + corps rigide |
| 3 | Combinaison wingsuit skinnée | Wingsuit | utile seulement si les poses deviennent plus amples | même squelette | voilure `ws_arms` / `ws_legs` qui suit les membres (0.25) |
| 4 | Kit Venice Beach : reste un vrai bowl en béton (coping, mobilier et tags faits en 0.25) | BMX | identité du lieu au sol | doit suivre le relief exact du parc | parc procédural habillé (0.25) |
| 5 | ~~Kit toits de Paris (lucarnes, mansardes, cheminées à mitrons)~~ | Parkour | fait en 0.25 (`paris.glb` + brisis procédural) | | |
| 6 | Bouées, ponton, phare | Wakeboard (Lake Havasu) | montagnes rouges, palmiers et pont en place | légers, eau existante | décor 0.23 |
| 7 | Bottes de paille, bâches publicitaires sans marque, tour de chronométrage | Motocross (Glen Helen) | tribune et couleurs en place | instanciation | décor 0.23 |

## À produire (P2)

| Asset | Priorité | Statut |
|---|---|---|
| Moto MX (cadre, fourche télescopique, bras oscillant, moteur) | haute | ⚪ |
| Longboard, snowboard, wakeboard (+ palonnier) | haute | ✅ 0.24 |
| Combinaison wingsuit skinnée | moyenne | ⚪ |
| Tenues et protections par sport | moyenne | ⚪ |
| Décors modulaires du skatepark (coping, bancs, rampes, graffitis sous licence) | haute (P1) | ⚪ |
