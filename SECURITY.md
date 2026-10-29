# Sécurité

## Signaler une faille ou un exploit grave

**Pas d'issue publique.** Utilise le signalement privé de GitHub :
onglet **Security** du dépôt > **Report a vulnerability**
(https://github.com/azert-maker/lignelibre.github/security/advisories/new).

Exemples à signaler en privé : exécution de code via un profil importé ou un message réseau, contournement du PIN local, pièces ou objets infinis, triche en multijoueur, fuite de données.
Réponse visée : sous 7 jours. Merci de laisser le temps de corriger avant d'en parler publiquement.

## Ce que le jeu stocke

- Tout reste **dans le navigateur du joueur** (`localStorage`) : pseudo, progression, pièces, réglages. Aucun compte en ligne, aucun serveur du projet.
- Le PIN de profil local est haché (SHA-256 salé). Ce n'est **pas** une vraie authentification : il sépare des profils sur un ordinateur partagé, rien de plus.
- La version en ligne (GitHub Pages) ne contient aucun secret, aucune clé d'API et n'envoie aucune donnée à un serveur du projet. Elle charge Three.js depuis cdnjs et jsDelivr (empreintes SRI vérifiées) et les polices depuis Google Fonts.
- Publicités : mode démonstration seulement (fausse pub de 5 s, aucune régie réelle branchée).

## Multijoueur local (`server/server.js`)

Serveur WebSocket prévu pour un **réseau local** (même Wi-Fi). Il n'a ni authentification ni chiffrement : ne l'expose pas sur internet. Pour un usage en ligne, il faudrait un serveur `wss://` derrière un proxy TLS, avec limites de débit (non fourni).

## Pour les contributeurs

- Jamais de secret dans le code, les issues ou les pull requests. Les secrets de CI passent par **Settings > Secrets** du dépôt (aucun n'est nécessaire aujourd'hui).
- Un secret publié par erreur doit être **révoqué immédiatement** chez le service concerné, puis signalé : le retirer d'un commit ne suffit pas, l'historique Git est public.
