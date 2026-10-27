# Catalogue des assets 3D · Ligne Libre

## Pipeline

1. **Source** : script Python Blender (`assets/blender/*.py`), reproductible, versionné. Le `.blend` produit est la source éditable par un artiste.
2. **Génération** : `npm run assets` (Blender 5.1.2 en module Python `bpy`, ou `blender -b -P script.py` avec Blender installé).
3. **Export** : GLB dans `assets/glb/` (Y en haut, sans textures, normales lissées, animations en actions séparées).
4. **Build** : `build.sh` embarque chaque GLB en base64 dans `17-assets.js` (fichier généré, non versionné). Le jeu reste un fichier HTML unique.
5. **Chargement** : `18-glb.js` décode les GLB au démarrage (≈ 60 ms) ; le jeu démarre sans les attendre puis reconstruit la scène de démo.
6. **Intégration** : `dressHuman` (personnage) et `dressBmx` (vélo) habillent les rigs du jeu ; repli procédural automatique si un modèle manque.
7. **Vérification** : `node tests/glb.js` (15 contrôles : chargement, 7 sports, squelette unique, synchronisation des os, IK, LOD, clips, repli).

Conventions : mètres ; dans Blender Z en haut, le personnage regarde +X, son côté « 0 » est en +Y ; matériaux nommés pour être recolorés par le profil du joueur (`skin`, `accent`, `suit`, `helmet`, `shoe`, `frame`, `rim`, `grip`).

## Catalogue

| Asset | Fichier | Triangles | Matériaux | Taille GLB | Rig | Animations | Statut |
|---|---|---|---|---|---|---|---|
| Rider (complet) | `assets/glb/rider.glb` | 21 484 au total ; ≈ 20 100 visibles avec casque intégral (corps 13 508, visage 3 532, casque 3 082) | 17 : skin, accent, accent2, suit, helmet, visor, shoe, sole, glove, hair, eye_white, iris, pupil, lip, brow, detail, metal | 689 Ko | 19 os (pelvis, spine, torso, neck, head, clavicle/upperArm/foreArm/hand ×2, upperLeg/lowerLeg/foot ×2), pondération douce aux articulations, 4 influences max | idle, celebrate, run (30 i/s) ; en jeu les os suivent le rig procédural | ✅ v1, testé en jeu |
| Rider (léger, LOD) | `assets/glb/rider_lo.glb` | 10 131 au total ; ≈ 9 300 visibles | idem | 361 Ko | idem | idem | ✅ v1, qualité éco + personnages secondaires |
| BMX freestyle | `assets/glb/bmx.glb` | 7 678 (cadre 2 230, avant 1 148, roues 1 868 ×2, pédalier 564) | 7 : frame, chrome, dark, tire, rim, grip, seat | 144 Ko | pièces rigides sur les pivots du jeu (tailwhip, barspin, axes, boîtier) | animées par le jeu : roues, pédalier, tailwhip, barspin, braquage | ✅ v1, testé en jeu |

Variantes de casque dans `rider.glb` : `helmet_full` (intégral, aussi utilisé pour « Carbone » avec une teinte sombre brillante) et `helmet_open` (bol, cheveux visibles).

## Rendus de contrôle

`assets/renders/` : `rider_34.jpg` (trois-quarts), `rider_face.jpg` (visage sans casque), `rider_celebrate.jpg` (clip), `bmx_side.jpg`, `bmx_34.jpg`.

## Licences

- Modèles 3D : créés pour le projet par script, propriété du projet.
- Sons : Pixabay (licence Pixabay, usage commercial permis sans attribution), détail dans `16-sfx-data.js`.
- Bibliothèques : Three.js r128 et ses exemples (licence MIT).

## À produire (P2)

| Asset | Priorité | Statut |
|---|---|---|
| Moto MX (cadre, fourche télescopique, bras oscillant, moteur) | haute | ⚪ |
| Longboard, snowboard, wakeboard (+ corde et palonnier) | haute | ⚪ |
| Combinaison wingsuit skinnée | moyenne | ⚪ |
| Tenues et protections par sport | moyenne | ⚪ |
| Décors modulaires du skatepark (coping, bancs, rampes, graffitis sous licence) | haute (P1) | ⚪ |
