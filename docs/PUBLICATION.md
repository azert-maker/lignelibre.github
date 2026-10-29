# Publication · dépôt public et GitHub Pages

## Audit de sécurité (29 octobre 2026)

Recherche sur **les 30 commits de l'historique** (pas seulement la dernière version) : jetons GitHub, clés AWS / Google / OpenAI / Slack, jetons et webhooks Discord, clés privées, Firebase, fichiers `.env`, mots de passe, adresses e-mail, chemins de poste (`C:\Users\…`).

| Résultat | Détail |
|---|---|
| Aucun secret | aucun jeton, aucune clé, aucun `.env`, aucun webhook dans l'historique |
| Faux positifs vérifiés | « AKIA… » : morceaux de sons encodés en base64 (`16-sfx-data.js`) ; « password » : champ `type="password"` du PIN local ; « 192.168.1.23 » : exemple d'adresse dans l'aide du multijoueur ; « adsense » : commentaire et identifiant fictif `ca-pub-XXXX` |
| Auteurs des commits | adresses neutres (`noreply`) ; aucune adresse personnelle |
| Données personnelles | prénom du propriétaire retiré des fichiers (remplacé par « le propriétaire du projet ») ; il reste dans d'anciennes versions de la documentation (historique Git), sans nom de famille, adresse ni autre donnée |
| Côté client | aucune clé ni URL privée servie ; pas de backend ; profil stocké dans le navigateur |
| Dépendances CDN | Three.js r128, GLTFLoader, SkeletonUtils figés avec empreintes SRI (un fichier modifié sur le CDN est refusé) |

**Secret à révoquer : aucun.** (L'ancienne variable `GH_TOKEN` de l'environnement de travail était déjà invalide et n'a jamais été écrite dans le dépôt.)

## GitHub Pages

- **Méthode** : GitHub Actions (`.github/workflows/pages.yml`), à chaque push sur `main`, sans secret.
- **Contenu publié** : `dist/site/` = `index.html` (le jeu complet, ~5,4 Mo, modèles et sons embarqués), `404.html` (renvoie vers le jeu), `.nojekyll`.
- **URL attendue** : https://azert-maker.github.io/lignelibre.github/
- **Mise à jour** : pousser sur `main` ; le site change 1 à 3 minutes après (onglet Actions > Pages pour suivre).
- **Vérifié en local** : site servi dans un sous-dossier `/lignelibre.github/` (comme sur Pages) : Three.js chargé avec SRI, 7 sports, modèles 3D chargés, une partie démarre, aucune erreur.

### Dépannage « ça marche en local mais pas sur Pages »

| Symptôme | Cause probable | Solution |
|---|---|---|
| Page 404 GitHub | Pages pas activé, ou source « branche » au lieu d'« Actions » | Settings > Pages > Source : GitHub Actions, puis relancer le workflow |
| Le workflow échoue à `configure-pages` | Pages pas encore activé | même solution |
| Écran noir, erreur « integrity » dans la console | le CDN a modifié un fichier (rare) | mettre à jour les empreintes dans `build.sh` |
| Ancienne version affichée | cache du navigateur ou du CDN de GitHub (≈ 10 min) | rechargement forcé (Ctrl+Maj+R) |
| Multijoueur impossible | la page est en https, le serveur local en `ws://` | normal : multijoueur local avec le fichier téléchargé |
| Progression « perdue » | stockage du navigateur propre à chaque adresse : la version en ligne ne voit pas la sauvegarde du fichier local | exporter le profil depuis l'ancienne version, l'importer dans la nouvelle (Réglages) |

## Labels

Définis dans `.github/labels.yml`. Création en une fois (GitHub CLI connecté à ton compte) :

```
gh label create "idée" --color a2eeef --description "Proposition de joueur ou de contributeur" -R azert-maker/lignelibre.github
gh label create "gameplay" --color 1d76db --description "Physique, commandes, figures, ressenti" -R azert-maker/lignelibre.github
gh label create "3d" --color 5319e7 --description "Modèles, animations, Blender" -R azert-maker/lignelibre.github
gh label create "ui" --color fbca04 --description "Menus, HUD, mobile" -R azert-maker/lignelibre.github
gh label create "économie" --color 0e8a16 --description "Pièces, boutique, machine à skins" -R azert-maker/lignelibre.github
gh label create "lieux" --color c2e0c6 --description "Décors et ambiance des cartes" -R azert-maker/lignelibre.github
gh label create "docs" --color 0075ca --description "Documentation" -R azert-maker/lignelibre.github
gh label create "accepté" --color 2ea44f --description "Validé, prêt à être fait" -R azert-maker/lignelibre.github
gh label create "pas prévu" --color e4e669 --description "Lu et réfléchi, mais pas pour ce projet" -R azert-maker/lignelibre.github
```

`bug`, `question` et `good first issue` existent déjà par défaut sur GitHub. Sans GitHub CLI : onglet Issues > Labels > New label.

## Checklist avant passage en public

- [x] Aucun secret dans le code ni dans l'historique (audit ci-dessus)
- [x] `.gitignore` solide (secrets, builds, caches, archives, fichiers système)
- [x] README complet (jouer, état, limitations, feuille de route, idées, bugs, local, Pages, licence)
- [x] Licence : code MIT, assets réservés (`LICENSE`, `LICENSE-ASSETS.md`)
- [x] Workflow Pages prêt, site testé dans un sous-dossier
- [x] Formulaires d'issues (bug, idée, question), modèle de pull request, `CONTRIBUTING.md`, charte, `SECURITY.md`
- [x] Build et tests passés sur cette version
- [ ] Créateurs des modèles tiers renseignés (`assets/third_party/*/README.md`) et accord de **redistribution publique** confirmé (les fichiers sources `.blend` et `.fbx` seront téléchargeables par tous)
- [ ] Dépôt passé en public
- [ ] Pages activé (source : GitHub Actions) et lien de démo vérifié
- [ ] Labels créés
- [ ] Signalement privé des failles activé
- [ ] CI verte dans l'onglet Actions

## Actions à faire par le propriétaire

1. **Confirmer la redistribution des modèles tiers.** « Libre d'utilisation dans le jeu » n'est pas forcément « publiable en téléchargement ». Si un créateur ne veut pas que son fichier source soit public, il faut le retirer **avant** de passer public (et réécrire l'historique, car les anciens commits le contiennent). Compléter aussi le nom et le lien de chaque créateur.
2. **Passer le dépôt en public** : Settings > General > Danger Zone > Change visibility.
3. **Activer Pages** : Settings > Pages > Build and deployment > Source : **GitHub Actions**. Puis onglet Actions > Pages > Run workflow (ou pousser sur `main`).
4. **Vérifier l'URL** https://azert-maker.github.io/lignelibre.github/ sur PC et téléphone.
5. **Activer le signalement privé** : Settings > Code security > Private vulnerability reporting : Enable.
6. **Créer les labels** (commandes ci-dessus).
7. **Protéger `main`** (conseillé) : Settings > Branches > Add rule : pull request obligatoire pour les autres, CI verte.
8. **Facultatif** : renommer le dépôt en `ligne-libre` (l'URL deviendrait `…github.io/ligne-libre/` ; GitHub redirige l'ancien nom du dépôt, pas l'ancienne URL Pages).
