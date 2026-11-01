# Security Policy

## Supported versions

Only the latest `main` branch (and the GitHub Pages build made from it) receives fixes.

## Reporting a vulnerability

**Do not open a public issue.** Use GitHub private reporting:
**Security** tab → **Report a vulnerability**
(https://github.com/azert-maker/lignelibre.github/security/advisories/new).

Please include the affected component (game, LAN server, build, CI), the impact, steps to reproduce and, if you have one, a suggested fix. Target response time: 7 days. Please keep the details private until a fix is published.

In scope:

- code execution or HTML injection through an imported profile, a multiplayer message or a URL parameter;
- anything that lets one player affect another player's game or data;
- weaknesses in the LAN server (`server/server.js`), the build, or the GitHub Actions workflows;
- an exposed secret or personal data in the repository.

Out of scope: editing your **own** local save (coins, unlocks). Profiles live in your browser, there is no account and nothing to steal; balance problems can be reported as a normal bug.

## How the game handles data

- Everything is stored **in the player's browser** (`localStorage`): nickname, progress, coins, settings. There are no accounts, no project server and no analytics.
- The optional profile PIN is a salted SHA-256 hash. It separates profiles on a shared computer; it is **not** real authentication.
- The online build contains no secret and no API key. It loads Three.js r128 and two of its example modules from cdnjs and jsDelivr, pinned with Subresource Integrity hashes, and fonts from Google Fonts.
- The online build sets a Content-Security-Policy (meta tag, since GitHub Pages cannot send headers): scripts only from the page and those two CDNs, no plugins, no form submission. `'unsafe-inline'` is required because the whole game is one inline script.
- Imported profiles are validated and sanitised; multiplayer names and room codes are escaped before display.
- Ads: demo mode only (no ad network is connected).

## LAN multiplayer server

`server/server.js` is meant for a **local network** (same Wi-Fi). It limits message size (4.5 KB, larger messages close the connection), message rate, clients, rooms and players per room, and refuses a player id already in use. It has **no authentication and no encryption**: do not expose it to the internet. Online play would need a `wss://` server behind TLS, which is not provided.

## For maintainers and contributors

- No secret is needed by CI today. If one ever is, store it in **Settings → Secrets and variables → Actions**, never in a file.
- A secret pushed by mistake must be **revoked at its provider first**: deleting it in a new commit does not remove it from Git history.
- Automated checks: CodeQL (`security-extended`), `npm audit` in CI, Dependabot for npm and Actions.
- Recommended repository settings: secret scanning and push protection on, private vulnerability reporting on, branch protection on `main`.

No scan proves a project is secure; reports are welcome.
