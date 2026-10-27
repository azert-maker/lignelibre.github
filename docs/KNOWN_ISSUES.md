# Problèmes connus · Ligne Libre

Gravité : 🔴 bloquant · 🟠 important · 🟡 mineur · ⚪ cosmétique

| # | Gravité | Problème | Contournement / plan |
|---|---|---|---|
| 1 | 🟠 | Performances avec les modèles Blender mesurées seulement en rendu logiciel (i/s en baisse de 2 à 30 % en éco, 25 à 45 % en haute) | mesurer sur vrais appareils ; si besoin, bascule automatique vers `rider_lo` puis vers le procédural quand la qualité auto descend |
| 2 | 🟠 | Skatepark visuellement brut (sol uni, immeubles en blocs violets) | prochaine tâche de la vertical slice |
| 3 | 🟡 | Le jeu a besoin d'internet au premier chargement (Three.js, GLTFLoader, SkeletonUtils, polices) | si GLTFLoader ne charge pas, le jeu reste jouable avec les modèles procéduraux ; option future : tout embarquer |
| 4 | 🟡 | Fichier HTML passé de 2,1 Mo à 2,6 Mo (GLB en base64) | compression Draco ou quantification des sommets à évaluer |
| 5 | 🟡 | Les fantômes réseau et les autres joueurs utilisent le modèle complet (pas forcément le LOD léger) | passer `lod:'lo'` aux constructeurs de fantômes |
| 6 | 🟡 | Clip « celebrate » disponible mais pas encore branché sur l'écran de fin | brancher `human.clip('celebrate')` sur l'écran de résultats |
| 7 | 🟡 | IK des mains seulement sur le BMX (moto, wake, longboard gardent la pose d'origine) | généraliser l'ancrage des mains en P2 |
| 8 | ⚪ | Casque intégral : le masque et la mentonnière font un peu « robot » vus de face | casque v2 (P1) |
| 9 | ⚪ | Pas de clignement des yeux ni d'expressions | P1, visage v2 |
| 10 | 🟡 | Ressenti des commandes jamais validé par un joueur humain | sessions de test |
| 11 | ⛔ | Pas de dépôt GitHub distant (jeton invalide, accord requis) | voir `PROJECT_STATUS.md` §5 |
| 12 | ⛔ | Pas de serveur Discord (aucun accès) | configuration prête dans `DISCORD_SETUP.md` |
| 13 | 🟡 | Multijoueur limité au réseau local (serveur Node à lancer soi-même) | serveur hébergé en P3, dépense soumise à ton accord |
| 14 | ⚪ | Les rendus Blender sont écrits en PNG puis convertis à la main en JPG pour le dépôt | automatiser la conversion dans `common.render` |
