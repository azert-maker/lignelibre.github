# Serveur Discord · configuration prête à appliquer

Statut : ⛔ **non créé**. Je n'ai aucun accès Discord dans cette session. Ce document est la configuration complète à appliquer à la main (environ 45 minutes) ou par un bot quand tu m'en donneras l'accès.

## 1. Paramètres du serveur

- Nom : **Ligne Libre**
- Mode communauté : activé (salons Règles et Annonces obligatoires)
- Niveau de vérification : **Moyen** (compte Discord de plus de 5 minutes)
- Filtre de contenu explicite : tous les membres
- Notifications par défaut : mentions uniquement
- Onboarding Discord : activé, avec les questions de la section 4

## 2. Rôles (du plus haut au plus bas)

| Rôle | Couleur | Qui | Permissions clés |
|---|---|---|---|
| Fondateur | #ff5a36 | toi | Administrateur |
| Équipe | #ffd23a | développeurs, artistes | gérer messages, fils, événements ; pas d'administration |
| Modération | #2ee6ff | modérateurs bénévoles | expulser, exclure temporairement, gérer messages, voir le journal d'audit |
| Bots | #8a5cff | bots | uniquement ce que chaque bot exige |
| Testeur | #39e07a | testeurs des versions préliminaires | accès à la catégorie TESTS |
| Créateur de contenu | #b26bff | vidéastes, streamers | salon dédié, rôle visible |
| Rider | #c9ced4 | membres vérifiés (règles acceptées) | écrire, réagir, vocal |
| Rôles de sport (7) | aucune | choix à l'onboarding : Wingsuit, Downhill, Snowboard, BMX, Motocross, Wakeboard, Parkour | aucune permission, sert aux mentions et aux filtres |
| Plateforme (3) | aucune | PC, Mobile, Tablette | idem |

`@everyone` : lecture seule dans BIENVENUE, rien d'autre tant que les règles ne sont pas acceptées.

## 3. Catégories et salons

**BIENVENUE**
- `#règles` (lecture seule) · `#annonces` (salon d'annonces, lecture seule) · `#bienvenue` (message du bot de bienvenue) · `#choisis-tes-rôles` (onboarding)

**LE JEU**
- `#général` · `#clips-et-replays` (vidéos et GIF uniquement, mode lent 30 s) · `#scores` (captures de records) · `#idées` (forum, étiquettes : gameplay, sport, interface, audio, multijoueur) · `#faq` (lecture seule)

**SPORTS** (un fil par sport ou 7 salons texte)
- `#wingsuit` · `#downhill` · `#snowboard` · `#bmx` · `#motocross` · `#wakeboard` · `#parkour`

**COMPÉTITIONS**
- `#défis-de-la-semaine` (lecture seule, publié par l'équipe) · `#inscriptions` · `#résultats` (lecture seule)

**SUPPORT**
- `#signaler-un-bug` (forum, gabarit section 7, étiquettes : bloquant, important, mineur, résolu) · `#aide`

**TESTS** (rôle Testeur)
- `#versions-test` · `#retours-test` · `#perf-appareils` (fps par appareil, gabarit section 7)

**VOCAL**
- `Session de ride` · `Compétition` (scène) · `Détente`

**ÉQUIPE** (Équipe et Modération, privé)
- `#modération` · `#journal-mod` (bot) · `#dev` · `#planning`

## 4. Onboarding (questions)

1. « Quels sports tu rides ? » (choix multiples → rôles de sport)
2. « Tu joues sur ? » (PC, Mobile, Tablette)
3. « Tu veux tester les versions en avant-première ? » (oui → candidature, rôle Testeur attribué à la main)

## 5. Règles (texte à coller dans `#règles`)

1. Respect : pas d'insultes, de harcèlement, de discrimination ni de contenu choquant.
2. Pas de spam ni de publicité sans accord de l'équipe.
3. Pas de triche ni de partage d'outils de triche ; les records truqués sont supprimés.
4. Clips et images : uniquement ce que tu as le droit de partager.
5. Pas de données personnelles (les tiennes ou celles des autres).
6. Bugs : utilise `#signaler-un-bug` avec le gabarit.
7. Les modérateurs ont le dernier mot ; contestation en message privé à l'équipe.
8. Conditions d'utilisation et règles de la communauté Discord applicables.
Sanctions : avertissement, exclusion temporaire 24 h, expulsion, bannissement.

## 6. FAQ (`#faq`)

- **Le jeu est gratuit ?** Oui. Pas d'achat réel dans le jeu actuellement.
- **Sur quoi ça tourne ?** Navigateur récent sur PC, Mac, Android, iPhone. Connexion internet au premier lancement.
- **Multijoueur ?** Réseau local pour l'instant (serveur à lancer soi-même) ; en ligne plus tard.
- **Mes progrès sont sauvegardés ?** Oui, dans le navigateur ; export et import du profil dans les réglages.
- **Le jeu rame ?** Réglages, qualité « Éco ». Poste ton appareil et tes i/s dans `#perf-appareils`.

## 7. Gabarits

**Signalement de bug**
```
Sport et mode :
Appareil, système, navigateur :
Ce qui s'est passé :
Ce qui aurait dû se passer :
Étapes pour reproduire :
Capture ou clip :
```

**Retour de performances**
```
Appareil (modèle exact) :
Navigateur :
Qualité (éco / normale / haute) :
Sport :
Images par seconde observées :
Saccades (oui / non, quand) :
```

**Idée**
```
Sport concerné :
L'idée en une phrase :
Pourquoi c'est fun :
```

## 8. Bots recommandés (comparatif)

| Besoin | Option | Points forts | Limites |
|---|---|---|---|
| Modération automatique | **AutoMod natif Discord** | gratuit, intégré, filtres de mots et de spam | règles simples |
| Accueil, rôles, journal | **Carl-bot** | rôles par réaction, journaux détaillés, messages de bienvenue | interface en anglais |
| Alternative tout-en-un | **MEE6** | simple à configurer, niveaux | fonctions avancées payantes |
| Événements et rappels | **Événements natifs Discord** | gratuit, intégré au calendrier | pas de récurrence avancée |
| Annonces de versions | **Webhook GitHub** vers `#versions-test` | automatique à chaque version | nécessite le dépôt GitHub |

Recommandation : AutoMod + Carl-bot, sans option payante. Aucun abonnement sans ton accord.

## 9. Calendrier d'événements (proposition)

| Rythme | Événement | Salon |
|---|---|---|
| Chaque lundi | Défi de la semaine (un sport, un objectif, classement dans le jeu) | `#défis-de-la-semaine` |
| Un vendredi sur deux | Session de ride commune (vocal + multijoueur) | `Session de ride` |
| Mensuel | Concours du meilleur clip (vote par réactions, **sans dotation payante** sauf accord) | `#clips-et-replays` |
| À chaque version | Note de version + appel aux testeurs | `#annonces`, `#versions-test` |

## 10. Mise en route (ordre conseillé)

1. Créer le serveur, activer le mode communauté.
2. Créer les rôles dans l'ordre de la section 2.
3. Créer catégories et salons, régler les permissions de catégorie.
4. Coller règles et FAQ, configurer l'onboarding.
5. Activer AutoMod (spam, mots interdits, mentions de masse).
6. Inviter Carl-bot (rôles, bienvenue, journal dans `#journal-mod`).
7. Tester avec un second compte, puis ouvrir le lien d'invitation (publication publique : à ta décision).
