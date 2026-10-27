# Journal des versions · Ligne Libre

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
