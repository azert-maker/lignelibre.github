# Amélioration prioritaire · Ligne Libre

Ce document fixe le plan d’amélioration le plus utile pour faire passer le projet de « jeu jouable » à « jeu solide, agréable et prêt pour un public plus large ».

Principes directeurs :
- Prioriser la sensation de jeu avant la quantité de contenu.
- Mesurer sur vrais appareils, pas seulement en rendu logiciel.
- Corriger le plus gros blocage, puis répéter.
- Garder les changements testables et documentés.

## Priorité 1 · Ressenti des commandes et gameplay

Objectif : rendre le jeu agréable à jouer et crédible au premier essai.

### Tâches
- Tester la version BMX avec 3 à 5 joueurs réels.
- Documenter les points de friction : caméra, décollage, réception, contrôle au sol, friction de virage.
- Ajuster les valeurs de vitesse, gravité, ressort de réception, inertie, adoucissement des commandes.
- Mettre en place un petit benchmark de ressenti (contrôle, sensation, clarté, frustration).
- Vérifier les 7 sports sur la même base, puis corriger les cas aberrants.

### Critères de validation
- Le joueur comprend immédiatement comment freiner, tourner, sauter et atterrir.
- Les réceptions ne sont ni trop dures ni trop molles.
- Les collisions et chutes restent compréhensibles.
- Les sports partagent un comportement de base cohérent.

## Priorité 2 · Performances et chargement

Objectif : réduire le coût CPU/GPU et améliorer le chargement initial.

### Tâches
- Vérifier les LOD existants et les appliquer à tous les fantômes et modèles secondaires.
- Réduire les modèles trop lourds utilisés en qualité éco.
- Évaluer la compression Draco ou une optimisation équivalente pour les GLB.
- Séparer les assets de base et les assets optionnels.
- Supprimer les dépendances inutiles au premier chargement.
- Mesurer les performances sur 1 téléphone milieu de gamme, 1 iPhone, 1 PC portable.

### Critères de validation
- Temps de chargement initial réduit.
- Le jeu reste fluide sur mobile de milieu de gamme.
- Les modèles lourds ne chargent pas inutilement en qualité basse.
- Les scènes et décorations n’entravent pas les performances.

## Priorité 3 · Polissage visuel et présence du personnage

Objectif : rendre le jeu plus vivant et plus crédible.

### Tâches
- Ajouter clignement des yeux et expressions faciales si le rig le permet.
- Finaliser les animations de réception et les transitions entre roulage / crash / reprise.
- Harmoniser les poses des mains et des bras selon le sport.
- Vérifier les poses de longboard, wakeboard et wingsuit.
- Ajouter des détails de structure sur les personnages et les véhicules.

### Critères de validation
- Le personnage semble vivant même sans regarder les mécaniques.
- Les poses restent cohérentes selon le sport.
- Les animations semblent naturelles et non « figées ».

## Priorité 4 · Environnements et identité des lieux

Objectif : mieux transmettre le style du jeu et la qualité du monde.

### Tâches
- Poursuivre la transformation d’un lieu procédural vers un lieu distingué et soigné.
- Donner à chaque sport un environnement visuellement clair et mémorable.
- Réduire les éléments visuels trop lourds ou répétitifs.
- Harmoniser la palette, l’éclairage et les matériaux.

### Critères de validation
- Chaque sport a un environnement distinct et lisible.
- Les décors restent cohérents même en qualité basse.
- Les lieux ne distraient pas du gameplay.

## Priorité 5 · Progression, récompenses et motivation

Objectif : garder le joueur engagé au-delà de la première session.

### Tâches
- Valider la courbe de récompense sur vrais joueurs.
- Ajuster les gains de pièces, prix des skins et probabilité de rareté.
- Garantir que les récompenses restent motivantes sans devenir faciles ou frustrantes.
- Ajouter un objectif simple à la fin d’une session (score, combo, distance, collection).

### Critères de validation
- Le joueur a une raison de refaire une course.
- La progression est compréhensible.
- Les récompenses ont un sens cohérent.

## Priorité 6 · Onboarding et compréhension du jeu

Objectif : éviter que les joueurs quittent avant de comprendre le jeu.

### Tâches
- Ajouter un tutoriel ultra court au démarrage.
- Expliquer les gestes de base visuellement : rouler, sauter, atterrir, ramasser, gagner des pièces.
- Ajouter des démos ou messages de feedback pendant les premières secondes.
- Rendre les objectifs clairs sur l’écran.

### Critères de validation
- Un nouvel utilisateur comprend le jeu en moins de 2 minutes.
- Le menu et les commandes sont immédiatement lisibles.
- Les erreurs de base sont évitées par la clarté de l’UI.

## Priorité 7 · Outillage et qualité de projet

Objectif : sécuriser les améliorations et éviter les régressions.

### Tâches
- Garder les tests automatisés centrés sur les cas critiques.
- Ajouter des tests pour les points de friction connus.
- Standardiser la génération d’assets et les exports Blender.
- Documenter les changements majeurs et les scénarios de test.

### Critères de validation
- Toute modification de gameplay importante a une validation associée.
- Les changements majeurs sont testés avant publication.
- Le dépôt reste propre, reproductible et compréhensible.

## Plan de mise en œuvre recommandé

### Semaine 1
- Rapport de playtest des 7 sports.
- Mesure de la sensation de contrôle.
- Bascule des réglages de base sur BMX.

### Semaine 2
- Ajustements de performances et LOD.
- Compression et optimisation des assets.
- Révision des scènes plus lourdes.

### Semaine 3
- Polissage visuel : expressions, transitions, mains, poses.
- Équilibrage des récompenses et progression.

### Semaine 4
- Tutoriel, onboarding, aide en jeu.
- Validation finale sur mobile et desktop.

## Résumé exécutif

Le projet est déjà jouable et riche en contenu. Le meilleur investissement n’est ni de rajouter des sports ni de créer plus de systèmes, mais de rendre le jeu meilleur à jouer, plus fluide et plus lisible.

La priorisation la plus rentable est la suivante :
1. ressenti des commandes ;
2. performances ;
3. polissage visuel ;
4. progression ;
5. onboarding.

Si cette feuille de route est suivie, le projet devient beaucoup plus proche d’un produit jouable, stable et agréable, plutôt qu’un prototype technique riche.
