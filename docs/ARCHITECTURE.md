# Architecture de référence · Ligne Libre

Ce dossier introduit une structure de code propre pour remplacer progressivement le modèle monolithique actuel basé sur des fichiers JavaScript racine.

## Objectif

Séparer :
- bootstrap de l’application
- moteur principal
- logique partagée
- systèmes de jeu
- sports spécifiques
- UI
- données de config
- persistance et progression

## Règles

1. Le moteur ne sait pas comment jouer à un sport spécifique.
2. Les sports ne doivent pas muter l’état global sans passer par un registre ou un state manager.
3. L’UI ne calcule pas la physique.
4. Les configs sont dans des fichiers JSON, pas en dur dans les scripts.
5. Les assets sont gérés par un gestionnaire dédié, pas par des globals implicites.

## Structure cible

- src/app : démarrage, bootstrap, composition de l’application
- src/core : moteur, scène, état, input, timing
- src/game : sports, locations, personnages, collisions
- src/systems : progression, économie, replay, audio, save, effets
- src/ui : HUD, écrans, onboarding
- src/data : config JSON, sauvegardes, traductions

## Migration recommandée

1. Créer la structure `src/` sans changer le build existant.
2. Extraire les valeurs numériques dans `src/data/config/*.json`.
3. Construire une couche de compatibilité qui appelle les modules nouveaux depuis les fichiers de racine.
4. Déplacer progressivement les modules mono-sport vers `src/game/sports/*`.
5. Réduire les globales et les états cachés.
6. Tester chaque migration avec les tests existants.

## Ce qui a été ajouté ici

Une base d’architecture avec :
- moteur de jeu
- état global
- input manager
- progression + save
- replay
- registry de sports
- HUD et onboarding
- config JSON

Cette première étape sert de fondation pour la migration complète sans casser le build actuel.
