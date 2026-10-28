# Économie · Ligne Libre (0.23)

Aucune monnaie réelle. Les pièces ne servent qu'à la Boutique et à la machine à skins.

## Sources de pièces

| Source | Valeur | Règle |
|---|---|---|
| Pièce dorée ramassée | 1 | sur la ligne principale, aimant léger (facile, lisible sur mobile) |
| Pièce cyan ramassée | 2 | à l'écart : en l'air au-dessus d'un saut, sur un rail, corde serrée, rase-mottes, wake to wake, écart entre deux toits |
| Plafond par partie | 40 | au-delà, plus aucune pièce n'apparaît (« 40 max » au HUD) |
| Bonus de performance | 0 à 10 | score ramené au « par » du sport (`SCORE_PAR`) : 10 = deux fois le par ; seulement si la partie dure ≥ 15 s ou est finie |
| Arrivée (parcours) | 5 | |
| Médaille bronze / argent / or | 4 / 8 / 12 | |
| Objectif de session réussi | 3 | |
| Série de jours (≥ 2) | 3 × jours, max 15 | une fois par jour (avant : à chaque partie, jusqu'à 50) |
| Défi du jour | 15 à 40 | une fois par jour (avant : 100 à 150) |
| Défis de figures | 10 à 45 | une fois (avant : 50 à 140) |
| Passage de niveau | 8 × niveau, max 80 | (avant : 25 × niveau) |
| Bonus débutant | 40 | 3 premières parties de plus de 10 s |
| Pub « doubler » | ×2 de la partie | une fois par partie |

Avant 0.23, la fin de partie donnait `score / 40` : le wakeboard rapportait 382 pièces en 30 s et 1 101 en 90 s (une machine toutes les 12 s), le downhill 207 en 90 s, une médaille d'or 190. C'était la faille principale.

## Gains mesurés (pilote automatique, qui ignore les pièces : borne basse)

| Type de partie | Pièces |
|---|---|
| Chute rapide (6 s) | 0 (mesuré) ; 0 à 8 selon les pièces déjà prises |
| Partie libre de 60 s | 4 à 32, moyenne ≈ 20 |
| Parcours fini avec médaille | 19 à 47 ; 66 pour les 4 km de downhill (plafond atteint) |
| Moyenne sur 13 parties de plus de 20 s | 26,2 |
| Maximum théorique d'une partie | 70 (40 + 10 + 5 + 12 + 3) |

## Rythme

| | Parties normales nécessaires |
|---|---|
| 1 tirage de la machine (150) | ≈ 6 (mesuré : 5,7) |
| Cosmétique boutique (150 à 180) | 6 à 7 |
| Équipement d'entrée (240 à 300) | 10 à 12 |
| Équipement haut de gamme (750 à 800) | 30 environ |
| Consommable (60 à 150) | 2 à 6 |

## Rôles

- **Machine à skins** : cosmétiques uniquement (tenues, casques, couleurs, fumigènes), hasard affiché, doublon remboursé 60.
- **Boutique** : achat direct, y compris les équipements qui changent la physique (jamais dans la machine).
- **Prix boutique** divisés par 3 environ en 0.23 pour suivre les nouveaux gains. La rareté des cosmétiques dans la machine est figée (`rar`), elle ne dépend plus du prix.

## Anti-inflation et anti-doublon

- Crédit unique par partie (`run.finalized`) : fin, « Encore une », touche R, quitter depuis la pause, changer d'onglet.
- Quitter depuis la pause crédite maintenant ce qui est acquis (avant : perdu).
- Aucun ramassage hors du jeu : compte à rebours, écran de chute, pause, replay, menu.
- Reprise après chute : les pièces déjà prises ne réapparaissent pas.
- Recommencer en boucle ne rapporte rien : pas de bonus de performance sous 15 s, pièces seulement si ramassées.

## Valeurs dans le code

`37-coins.js` : `COIN_CAP=40`, `COIN_MAX=48` (à l'écran). `60-main.js` : `ECO`, `SCORE_PAR`, `runPayout`. `55-engage.js` : série, défi du jour, débutant. `57-progress.js` : niveaux, défis. `20-gear.js` : prix.

## Risques restants

- Les gains réels d'un joueur humain ne sont pas mesurés : à suivre sur les premières sessions (`profile.history` + `run.pay`).
- Le wingsuit est le sport où le pilote automatique ramasse le moins (vol trop haut) : un humain qui vise les couloirs gagnera plus.
- Les profils existants gardent leurs pièces accumulées avec l'ancienne économie (rien n'est retiré).
