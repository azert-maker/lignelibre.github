# Problèmes connus · Ligne Libre

Gravité : 🔴 bloquant · 🟠 important · 🟡 mineur · ⚪ cosmétique

| # | Gravité | Problème | Contournement / plan |
|---|---|---|---|
| 1 | 🟠 | Performances avec les modèles Blender mesurées seulement en rendu logiciel (i/s en baisse de 2 à 30 % en éco, 25 à 45 % en haute) | mesurer sur vrais appareils ; si besoin, bascule automatique vers `rider_lo` puis vers le procédural quand la qualité auto descend |
| 2 | 🟡 | Skatepark : ambiance Venice Beach en place (0.22), mais modules du parc encore procéduraux | kit Blender Venice (voir ASSETS.md) |
| 3 | 🟡 | Le jeu a besoin d'internet au premier chargement (Three.js, GLTFLoader, SkeletonUtils, polices) | si GLTFLoader ne charge pas, le jeu reste jouable avec les modèles procéduraux ; option future : tout embarquer |
| 4 | 🟡 | Fichier HTML : 5,8 Mo (GLB embarqués : rider, rider léger, BMX, moto, machine à pinces, snowpark, équipement) | compression Draco ou quantification des sommets à évaluer |
| 5 | 🟡 | Les fantômes réseau et les autres joueurs utilisent le modèle complet (pas forcément le LOD léger) | passer `lod:'lo'` aux constructeurs de fantômes |
| 6 | ⚪ | Clip « celebrate » branché à l'arrivée avec médaille en parkour, snowboard et downhill (0.23) ; pas en BMX, motocross, wakeboard (rider assis ou tenu par la corde) | clip dédié sur véhicule |
| 7 | 🟡 | IK des mains sur BMX et motocross seulement (wake, longboard gardent la pose d'origine) | généraliser l'ancrage des mains |
| 8 | ⚪ | Réceptions : le downhill n'a pas de sauts et le wingsuit pas de réception (seulement la chute) ; les 5 autres sports sont branchés | à traiter si on ajoute des sauts au downhill |
| 18 | 🟡 | Moto fournie : pas de variante légère (≈ 13 600 triangles aussi en éco, i/s en éco 41 → 33-38 en rendu logiciel) | confirmer la provenance ; décimer une variante éco si besoin |
| 17 | ⚪ | Downhill longboard, wakeboard et wingsuit gardent l'ancienne chute (pas de fonction de relief exportée pour le longboard ; eau et vol traités à part) | exporter `_h` dans le longboard |
| 15 | 🟡 | Chute physique : corps rigide (pas de vrai ragdoll membre par membre) ; le rider peut traverser un mur ou un module vertical | v2 : collisions avec les boîtes du parc |
| 16 | ⚪ | Le replay ne rejoue pas la compression de réception (pose enregistrée sans le ressort) | enregistrer `landState` dans les images du replay |
| 19 | ⚪ | Skins : sur le modèle procédural de repli, seules les couleurs s'appliquent (pas les motifs ni les finitions) | sans impact tant que les GLB chargent |
| 20 | 🟡 | Machines à skins : prix (150 pièces) et chances à valider avec des joueurs (récompenses 100 % cosmétiques) | ajuster `CLAW_COST` et `RARITY` |
| 9 | ⚪ | Pas de clignement des yeux ni d'expressions | P1, visage v2 |
| 10 | 🟡 | Ressenti des commandes jamais validé par un joueur humain | sessions de test |
| 11 | ✅ | Dépôt GitHub : résolu, dépôt privé `azert-maker/lignelibre.github`, poussé depuis le PC | CI à vérifier dans l'onglet Actions |
| 12 | ⛔ | Pas de serveur Discord (aucun accès) | configuration prête dans `DISCORD_SETUP.md` |
| 13 | 🟡 | Multijoueur limité au réseau local (serveur Node à lancer soi-même) | serveur hébergé en P3, dépense soumise à ton accord |
| 14 | ⚪ | Les rendus Blender sont écrits en PNG puis convertis à la main en JPG pour le dépôt | automatiser la conversion dans `common.render` |
| 21 | 🟡 | Décor des lieux : coût mesuré en rendu logiciel éco de 5 à 12 % d'i/s (BMX, wingsuit, snowboard) | mesurer sur vrai GPU ; réduire palmiers ou chalets en éco si besoin |
| 22 | ⚪ | Glen Helen, Lake Havasu, Paris Rooftops, Mount Tamalpais : décor signature procédural (0.23), pas encore de modèles Blender dédiés | kits listés dans ASSETS.md |
| 23 | ⚪ | Noms de lieux réels (Whistler Blackcomb, Glen Helen) : ce sont aussi des marques ; à vérifier avant une sortie commerciale | renommer en version fictive si besoin |
| 24 | 🟡 | Économie 0.23 calibrée avec le pilote automatique (qui ignore les pièces) : gains d'un vrai joueur non mesurés | suivre `run.pay` sur les premières sessions, ajuster `ECO` et `COIN_CAP` |
| 25 | ⚪ | Wingsuit : le pilote automatique vole souvent trop haut pour les couloirs de pièces (1 ramassée en 60 s) | sans impact joueur ; à revoir si on veut une démo qui ramasse |
| 26 | ⚪ | Profils existants : les pièces gagnées avec l'ancienne économie (bien plus généreuse) sont conservées | décision volontaire : rien n'est retiré au joueur |
| 27 | ⚪ | Accueil : sur un écran très bas (moins de 390 px de haut), les boutons secondaires (Multijoueur, Garage…) demandent de faire défiler ; Jouer reste visible | mise en page dédiée si besoin |
| 28 | ⚪ | Les choix de l'écran « Personnaliser » (météo, vent, longueur, monde) sont mémorisés par sport et repris par Jouer : penser à les remettre si on veut revenir aux réglages par défaut | bouton « par défaut » à ajouter si les joueurs s'y perdent |
| 29 | ⚪ | Voilure du wingsuit rigide (0.24) : elle suit le corps mais ne se plie pas avec les bras quand le rider tourne ; les rayures sont adoucies par l'interpolation des couleurs par sommet | voilure skinnée sur le squelette du rider |
| 30 | ⚪ | Snowboard en poudreuse : la planche disparaît dans la neige fraîche (voulu, comme avant 0.24) ; visible sur piste damée et en l'air | aucun |
| 31 | 🟡 | Équipement : ≈ 5 300 triangles par sport de glisse, sans variante éco | décimer une variante éco si les mesures sur vrais appareils le demandent |
