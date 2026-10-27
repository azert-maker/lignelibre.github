# Feuille de route · Ligne Libre

Principe : une priorité à la fois. On ne passe à la production en série (7 sports, collection 3D) qu'après validation de la vertical slice BMX. Chaque étape a des critères de validation mesurables.

## P0 · Socle et protection du travail

| Tâche | Critère de validation | Statut |
|---|---|---|
| Build reproductible un fichier | `npm run build` produit `dist/` sans erreur, `node --check` OK | ✅ |
| Suite de tests automatisés | `npm test` : 61/61 + 15/15 | ✅ |
| Dépôt Git local propre | `.gitignore` (aucun secret, pas de sorties de build), historique lisible | ✅ |
| CI GitHub Actions | workflow `ci.yml` vert sur `main` | 🟡 écrit, jamais exécuté (pas de dépôt distant) |
| Dépôt GitHub privé | dépôt créé, `main` protégée, CI verte | ⛔ attend ton accord + un accès valide |
| Sauvegardes | archive datée avant chaque refonte (déjà pratiqué) | ✅ |

## P1 · Vertical slice BMX (sport de référence)

| Tâche | Critère de validation | Statut |
|---|---|---|
| Personnage Blender riggé, pondéré, animé | GLB < 1 Mo, 19 os, os synchronisés au rig du jeu (écart < 1 cm), 3 clips | ✅ v1 |
| Variante légère (LOD) | < 12 000 triangles visibles, utilisée en qualité éco | ✅ |
| BMX Blender détaillé | pièces séparées sur les pivots du jeu, tailwhip / barspin / roues / pédalier animés | ✅ v1 |
| Mains sur le guidon (IK) | écart main / poignée < 5 cm en roulant, lâcher pendant le barspin | ✅ en roulant (0,0 cm) · 🟡 lâcher au barspin codé, non testé |
| Posture BMX crédible | genoux fléchis, buste penché, bras pliés (revue visuelle) | ✅ v1 |
| Environnement skatepark soigné | béton à joints et taches, coping métal, éclairage chaud, décor de fond cohérent, 60 i/s éco sur téléphone milieu de gamme | 🔵 prochaine tâche |
| Animations de réception et de chute | compression visible, chute en ragdoll simple ou clip Blender | ⚪ |
| Visage et casque v2 | regard vivant (clignement), masque de casque intégré moins « robot » | ⚪ |
| Ressenti des commandes | 3 sessions de test joueur, retours notés, réglages appliqués | ⚪ (il faut des joueurs) |
| Mesure sur vrais appareils | i/s mesurés sur 1 téléphone Android milieu de gamme, 1 iPhone, 1 PC portable | ⚪ (il faut les appareils) |
| Validation finale de la slice | tous les critères ci-dessus verts + ton accord | ⚪ |

## P2 · Généralisation aux 7 sports (après validation P1)

| Tâche | Critère de validation | Statut |
|---|---|---|
| Moto MX Blender | même pipeline que le BMX (pièces sur pivots, suspension animée) | ⚪ |
| Longboard, snowboard, wakeboard Blender | planches, fixations, corde et palonnier | ⚪ |
| Combinaison wingsuit Blender | voilure skinnée sur le même squelette | ⚪ |
| Tenues par sport | casque, protections, vêtements recolorables | ⚪ |
| Environnements | une passe de soin par sport, même grille de critères que le skatepark | ⚪ |

## P3 · Collection, progression, multijoueur en ligne

| Tâche | Critère de validation | Statut |
|---|---|---|
| Collection 3D (tenues, vélos, planches) | catalogue `docs/ASSETS.md` à jour, chaque objet testé en jeu | ⚪ |
| Boutique cosmétique sans paiement réel | monnaie du jeu uniquement | 🟡 existe (pièces) |
| Paiement réel | **interdit sans ton autorisation écrite** | ⚪ |
| Multijoueur en ligne | serveur hébergé (dépense : ton accord requis), solo jouable si le serveur tombe | 🟡 LAN seulement |
| Classements | partagés dans l'artifact Claude ; serveur dédié plus tard | 🟡 |

## P4 · Communauté et lancement

| Tâche | Critère de validation | Statut |
|---|---|---|
| Serveur Discord | configuration `docs/DISCORD_SETUP.md` appliquée | ⛔ préparé, pas d'accès |
| Compétitions | règlement publié ; aucune dotation payante sans ton accord | ⚪ |
| Page de lancement, bande-annonce | publication publique uniquement avec ton accord | ⚪ |
