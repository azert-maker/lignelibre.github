# Contribuer à Ligne Libre

Merci de vouloir aider ! Le projet est petit et tenu par une seule personne : les contributions guidées passent beaucoup mieux que les grosses surprises.

## Proposer une idée

1. Regarde la feuille de route publique du `README.md` (ce qui est prévu, ce qui n'est pas promis).
2. Cherche dans les issues si l'idée existe déjà ; si oui, ajoute ton avis ou un 👍 dessus.
3. Sinon, ouvre une issue **Idée** (formulaire guidé) : résumé, sport ou système, intérêt pour le joueur, référence visuelle si tu en as.

Une idée acceptée reçoit le label `accepté`. Une idée refusée reçoit `pas prévu`, avec une explication.

## Signaler un bug

Ouvre une issue **Bug** : navigateur et appareil, sport concerné, étapes pour reproduire, résultat attendu, résultat obtenu. Une capture ou une vidéo courte aide beaucoup.
Vérifie d'abord `docs/KNOWN_ISSUES.md`.

**Faille de sécurité ou exploit grave** (pièces infinies, triche en multijoueur, contournement de sauvegarde) : pas d'issue publique, suis `SECURITY.md`.

## Contribuer du code

1. Pour un changement important, ouvre d'abord une issue pour en parler.
2. Forke le dépôt, crée une branche `fix/<sujet>`, `feat/<sujet>` ou `asset/<sujet>`.
3. Prérequis : Node 18+ ; pour les tests, `npm install` puis `npx playwright install chromium`.
4. Construis et teste :
   ```
   npm run build
   npm test
   ```
5. Ouvre une pull request (le modèle te guide). La CI rejoue la construction et les tests.

Les sources sont des modules numérotés à la racine (`10-core.js`, `46-bmx.js`…), assemblés par `build.sh` en un seul fichier HTML. Le tableau des modules est dans le `README.md`.

### Règles du code

- Le jeu doit rester **jouable sans serveur**, en un seul fichier.
- Pas de nouvelle dépendance externe sans discussion (Three.js r128 seulement, figé avec empreinte SRI).
- Garder les sports différents : on ne « uniformise » pas la physique.
- Un changement visible en jeu = une ligne dans `CHANGELOG.md`.

### Messages de commit

Court, en français, à l'impératif : `type(portée): résumé`.
Types : `feat`, `fix`, `asset`, `perf`, `test`, `docs`, `build`, `refactor`.
Exemples : `fix(wake): vitesse NaN à dt=0`, `asset(bmx): roues à 36 rayons`.

## Contribuer des assets (3D, sons, textures)

- Uniquement ce que **tu as le droit de partager**, avec la source et la licence notées dans `docs/ASSETS.md`.
- Licences acceptées : création personnelle, CC0, CC-BY (crédit noté), ou accord écrit du créateur.
- Refusé : personnages, logos et marques protégés (même modifiés), contenus « trouvés sur internet » sans licence.
- Budget : un modèle de décor < 5 000 triangles, textures 512 ou 1024 px.
- Les assets restent hors de la licence MIT du code (voir `LICENSE-ASSETS.md`).

## Sécurité et vie privée

- Jamais de jeton, mot de passe, clé d'API ou identifiant dans le dépôt, dans une issue ou une pull request.
- Jamais de donnée personnelle de joueur (le profil reste dans le navigateur du joueur).
- Aucune fonction de paiement réel ni de concours à dotation payante.

## Charte

En participant, tu acceptes la charte `CODE_OF_CONDUCT.md`.
