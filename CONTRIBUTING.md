# Contribuer à Ligne Libre

## Branches
- `main` : toujours jouable. On n'y pousse que du code construit et testé (CI verte).
- `feat/<sujet>`, `fix/<sujet>`, `asset/<sujet>` : une branche par tâche, fusion par pull request.

## Messages de commit
Format court, en français, à l'impératif : `type(portée): résumé`.
Types : `feat`, `fix`, `asset`, `perf`, `test`, `docs`, `build`, `refactor`.
Exemples : `asset(bmx): roues à 36 rayons`, `fix(wake): vitesse NaN à dt=0`.

## Avant chaque commit
1. `npm run build` (construit `dist/` et vérifie la syntaxe).
2. `npm test` (61 vérifications de régression + intégration des modèles Blender).
3. Mettre à jour `CHANGELOG.md` et, si besoin, `docs/KNOWN_ISSUES.md`.

## Assets 3D
Les modèles sont générés par script (Blender 5.x) : `npm run assets`. Voir `docs/ASSETS.md`.
Les fichiers `.blend` sont des sources ; les `.glb` sont ce que le jeu embarque.

## Sécurité
- Jamais de jeton, mot de passe, clé d'API ou identifiant dans le dépôt (voir `.gitignore`).
- Les secrets de CI passent par les « secrets » GitHub du dépôt, jamais en clair.
- Aucune fonction de paiement réel ni de compétition à dotation payante sans accord écrit du propriétaire.

## Audio et contenus tiers
Uniquement des sons et images sous licence compatible (source et licence notées dans `docs/ASSETS.md`).
