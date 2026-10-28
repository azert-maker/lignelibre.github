# État du projet · Ligne Libre

Mis à jour : 28 octobre 2026 (version 0.20.0 : skins et machine à pinces).

Note d'audit du 28 octobre : le brief annonce un skatepark « Venice Beach », des cartes renommées (Lauterbrunnen, Whistler, Venice Beach, Glen Helen, Lake Havasu, Paris Rooftops, Mount Tamalpais) et une correction des montagnes du snowboard. Rien de cela n'est dans le dépôt : ni sur GitHub (dernier commit `54f1f38`), ni en local. Ces changements ont été faits ailleurs et doivent être envoyés pour être intégrés aux modules.

Note d'audit : le « Skatepark BMX v2 » mentionné dans le dernier brief n'existe pas dans le dépôt (aucun commit, aucun code de béton à joints ni de lampadaires). L'environnement du skatepark reste à faire.

Légende des statuts (utilisée dans tous les documents) :

| Statut | Signification |
|---|---|
| ✅ Terminé et testé | fonctionne, couvert par un test automatisé ou une vérification visuelle documentée |
| 🟡 Implémenté, non validé | le code existe mais n'a pas été validé sur vrais appareils ou par un joueur |
| 🔵 En cours | travail commencé, incomplet |
| ⛔ Bloqué | impossible sans une action ou une décision extérieure |
| ⚪ Non commencé | prévu, rien de fait |

## 1. Audit technique (première mission)

| Élément | Constat | Statut |
|---|---|---|
| Lancement du jeu | `dist/ligne-libre-standalone.html` s'ouvre dans Chromium sans erreur JS ; 7 sports jouables | ✅ |
| Build | `build.sh` assemble 21 modules JS + HTML en un fichier ; embarque les GLB en base64 ; `node --check` OK | ✅ |
| Tests | Playwright + Chromium (rendu logiciel) : 61/61 régression, 15/15 modèles Blender, figures BMX, wallrun parkour, clavier, tactile, fuites mémoire | ✅ |
| Git | dépôt local `v3/` avec historique ; `.gitignore`, `CONTRIBUTING.md`, CI GitHub Actions prêts | ✅ |
| GitHub | dépôt privé `azert-maker/lignelibre.github`, poussé depuis le PC (identifiants de ton poste) | ✅ |
| Blender sur ton PC | l'outil Blender du PC répond « Cannot connect to Blender at localhost:9876 » (Blender non lancé ou extension MCP inactive) | ⛔ contourné |
| Blender dans l'environnement cloud | Blender 5.1.2 installé comme module Python (`bpy`) : modélisation, rig, pondération, animation, export GLB et rendus Cycles fonctionnent | ✅ |
| Discord | aucun accès (pas de connecteur, pas de jeton bot) ; configuration complète préparée dans `docs/DISCORD_SETUP.md` | ⛔ (préparé, non créé) |
| Dépendances | Three.js r128 (cdnjs), GLTFLoader et SkeletonUtils r128 (jsdelivr), Node 22, Playwright 1.63 | ✅ |
| Audio | sons Pixabay (licence Pixabay, usage commercial permis) + synthèse WebAudio ; sources notées dans `16-sfx-data.js` | ✅ |

Bugs bloquants trouvés pendant l'audit : aucun bug bloquant de jeu. Deux défauts corrigés pendant l'intégration des modèles :
1. textures d'os créées en double (une par primitive) et jamais libérées : fuite GPU à chaque course, corrigée (squelette partagé + `disposeTree` libère les squelettes) ;
2. `ghostify` remplaçait les matériaux d'un maillage skinné par un matériau sans skinning (fantôme figé en pose de repos), corrigé.

## 2. Sport de référence : BMX freestyle

Choisi parce que le rider est entièrement visible (pas de combinaison ni de vue lointaine), au sol (lisibilité du contact et des réceptions), avec le plus riche catalogue de figures (airs, flips, 360/540, tailwhip, barspin, grinds, manuals) et un équipement mécanique exigeant (vélo à pièces animées) qui valide toute la chaîne Blender → moteur.

## 3. Vertical slice BMX : avancement

| Critère de la vertical slice | Statut | Preuve |
|---|---|---|
| Un sport jouable de bout en bout | ✅ | course libre + parcours, combo, overdrive, fin de course, replay, fantôme |
| Personnage 3D de qualité (Blender) | ✅ v1 | `assets/glb/rider.glb`, rendus `assets/renders/rider_*.jpg` ; rig 19 os, pondéré, 3 clips |
| Équipement complet (Blender) | ✅ v1 | `assets/glb/bmx.glb` : cadre, fourche, cintre 2 pièces, 36 rayons par roue, plateau ajouré, chaîne, pegs, pédales à picots |
| Réceptions qualifiées et chutes physiques | ✅ | `tests/land.js` 12/12 ; compression 6 à 11 cm selon la qualité, rider éjecté à 3-4 m puis au sol, vélo couché, reprise propre |
| Animations fonctionnelles | ✅ | les os du modèle suivent le rig du jeu (écart mesuré 0,0 cm) ; mains sur les poignées par IK (écart 0,0 cm) ; tailwhip, barspin, pédalage, roues animés sur les pièces Blender |
| Environnement soigné | 🔵 | skatepark fonctionnel mais visuellement brut (sol uni, immeubles en blocs) : prochaine tâche |
| Bonnes commandes | 🟡 | clavier et tactile testés automatiquement (manette non testée) ; ressenti à valider par un joueur |
| Figures et score | ✅ | `tests/bmx3.js` : manual, air, 540, grind validés |
| Interface cohérente | 🟡 | HUD BMX dédié ; pas encore de passe de design globale |
| Performances mesurées | 🟡 | mesurées en rendu logiciel seulement (voir §4) ; à mesurer sur vrais téléphones |

## 4. Performances (rendu logiciel SwiftShader, 1280×720, pas un GPU réel)

| Qualité | Sport | i/s avant | i/s après | Triangles avant | Triangles après |
|---|---|---|---|---|---|
| éco | BMX | 59,6 | 48,6 | 15 130 | 29 737 |
| éco | parkour | 59,1 | 47,4 | 4 842 | 12 989 |
| éco | motocross | 60,7 | 59,9 | 12 240 | 20 060 |
| éco | wakeboard (2 humains) | 59,3 | 42,8 | 9 418 | 25 706 |
| haute | BMX | 44,4 | 26,3 | 25 410 | 48 896 |
| haute | snowboard | 20,1 | 15,5 | 68 494 | 86 322 |

Lecture honnête : le rendu logiciel fait le skinning sur le processeur, il exagère le coût des personnages. Les appels de dessin ont baissé (BMX : 132 → 73-78). Un GPU de téléphone récent traite 50 000 triangles sans difficulté, mais ce n'est **pas encore mesuré** sur appareil réel. Garde-fou en place : en qualité éco le jeu charge le modèle léger `rider_lo` (≈ 9 300 triangles visibles), et `look.proc` permet de revenir au modèle procédural.

## 5. Ce qui attend une décision ou une action de ta part

1. **GitHub** : créer le dépôt **privé** `ligne-libre` (je ne l'ai pas fait : ta validation est requise et le jeton disponible est invalide). Deux options : tu me fournis un accès valide via le connecteur GitHub, ou tu crées le dépôt vide et je te donne les 3 commandes de push (le dépôt local est prêt et commité).
2. **Blender sur ton PC** (facultatif) : lancer Blender avec l'extension MCP active si tu veux que je travaille directement dans ta scène. Sinon je continue avec Blender dans l'environnement cloud (résultats identiques, fichiers `.blend` fournis).
3. **Discord** : créer le serveur à partir de `docs/DISCORD_SETUP.md`, ou me donner un accès (bot avec permissions d'administration sur un serveur vide).
