# Contributing to Ligne Libre

Thanks for your interest. Ligne Libre is a browser game maintained by one person, so small, well-scoped contributions are the ones that land.

- [Report a bug](#report-a-bug)
- [Suggest an idea](#suggest-an-idea)
- [Set up the project](#set-up-the-project)
- [Make a change](#make-a-change)
- [Contribute assets](#contribute-assets)
- [Security and privacy](#security-and-privacy)

## Report a bug

Open a **Bug report** issue (guided form): browser and device, sport, steps to reproduce, expected and actual result. Check [`docs/KNOWN_ISSUES.md`](docs/KNOWN_ISSUES.md) first.

Security problems and serious exploits never go in a public issue: see [`SECURITY.md`](SECURITY.md).

## Suggest an idea

1. Read the public roadmap in the [README](README.md#roadmap): what is planned and what is not promised.
2. Search existing issues; if the idea exists, add your use case or a 👍.
3. Otherwise open an **Idea** issue: summary, sport or system, why it is better for players, optional visual reference.

Accepted ideas get the `accepted` label; declined ones get `wontfix` with an explanation.

## Set up the project

Requirements: Node.js 18 or newer, `sh` and `base64` (present on Linux, macOS, and Git Bash on Windows).

```bash
git clone https://github.com/azert-maker/lignelibre.github.git
cd lignelibre.github
npm ci                          # Playwright, ESLint, ws (LAN server)
npx playwright install chromium # browser used by the tests
npm run build                   # writes dist/ (see README)
npm run lint
npm test
```

How the code is organised:

- `src/` holds the game as numbered modules (`10-core.js` … `60-main.js`). `build.sh` concatenates them **in that order** into one inline `<script>`, so modules share globals: there is no import/export.
- Each sport is a factory `MODES[id] = (cfg, look, ctx) => ({ update, auto, snapshot, restore, coins, ... })`; the README lists the main hooks.
- `src/17-assets.js` is generated (3D models embedded as base64): never edit or commit it.
- `tests/` drives the real game in headless Chromium through `window.__ll`.

## Make a change

1. For anything bigger than a small fix, open an issue first so we can agree on the approach.
2. Fork, then branch: `fix/<topic>`, `feat/<topic>`, `asset/<topic>`, `docs/<topic>`.
3. Keep the pull request focused. The template lists the checks: build, lint, tests, manual play of the affected sport.
4. CI runs build, lint, the full test suite and a dependency audit on every pull request.

Ground rules:

- The game must stay playable **without a server**, as a single HTML file.
- No new runtime dependency without discussion (Three.js r128 only, pinned with SRI hashes in `build.sh`).
- Sports are meant to feel different: do not unify their physics.
- A change visible in game gets a line in `CHANGELOG.md`.
- In-game text is French; code comments may be French or English.

Commit messages: short, imperative, `type(scope): summary`. Types: `feat`, `fix`, `asset`, `perf`, `test`, `docs`, `build`, `ci`, `refactor`. Examples: `fix(wake): NaN speed at dt=0`, `asset(bmx): 36-spoke wheels`.

## Contribute assets

- Only what **you have the right to share**, with source and license recorded in `docs/ASSETS.md`.
- Accepted: your own work, CC0, CC-BY (credit recorded), or written permission from the creator.
- Refused: protected characters, logos and brands (even modified), "found on the internet" files without a license.
- Budget: scenery model under 5,000 triangles, 512 or 1024 px textures.
- Assets are outside the MIT license of the code (see [`LICENSE-ASSETS.md`](LICENSE-ASSETS.md)).

## Security and privacy

- Never put tokens, passwords, API keys or credentials in the repository, an issue or a pull request.
- Never commit player data: profiles stay in each player's browser.
- No real-money payments and no paid-entry contests.

## Code of conduct

By participating you agree to [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md).
