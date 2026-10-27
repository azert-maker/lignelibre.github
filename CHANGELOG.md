# Journal des versions · Ligne Libre

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
