# Ligne Libre

<p align="center">
  <img src="docs/images/pieces-7-sports.jpg" alt="Ligne Libre" width="1000" />
</p>

<p align="center">
  <a href="https://azert-maker.github.io/lignelibre.github/">
    <img alt="Play now" src="https://img.shields.io/badge/PLAY%20NOW-4F46E5?style=for-the-badge&logo=github" />
  </a>
  <img alt="Version" src="https://img.shields.io/badge/version-0.23.1-2563eb?style=for-the-badge" />
  <img alt="License" src="https://img.shields.io/badge/license-MIT-16a34a?style=for-the-badge" />
  <img alt="Stack" src="https://img.shields.io/badge/Three.js-WebGL-f59e0b?style=for-the-badge" />
  <img alt="Status" src="https://img.shields.io/badge/status-active-22c55e?style=for-the-badge" />
</p>

Ligne Libre is a browser-based 3D arcade sports game. It combines multiple extreme sports into a single playable experience and is built around fast movement, score-chasing, replayability, and progression.

The project is currently in active development and is already playable in the browser. It is not a mockup or a concept-only repository: it contains working gameplay systems, multiple sports, and a public roadmap for further development.

## Play

- Live demo: https://azert-maker.github.io/lignelibre.github/
- Works in modern browsers
- Desktop and mobile friendly
- Internet connection is required on first load to fetch assets

## What is currently in the game

Ligne Libre includes:

- 7 sports
  - wingsuit
  - downhill longboard
  - snowboard
  - BMX
  - motocross
  - wakeboard
  - parkour
- 7 distinct locations
- coin collection and progression
- shop and cosmetic systems
- score-based gameplay
- replay / ghost-style feedback
- browser save/profile data
- local multiplayer support over LAN

## Project status

The project is actively being developed by a single creator.

It is not a finished commercial game, and it does not pretend to be one. Some systems are already functional, while others are still being refined, balanced, or expanded. The project remains open to iteration based on playtesting and feedback.

## Current limitations

This project is intentionally transparent about what is still incomplete or experimental:

- some sports are still mechanically simple
- performance can vary on lower-end mobile devices
- multiplayer is local-only and not intended for public internet use
- gameplay feel and balancing still need additional player feedback
- some visual and animation work is still being refined
- the project is still evolving and may change significantly over time

## Project structure

```text
.
├── .github/                # workflows, templates, automation
├── assets/                 # 3D models, textures, third-party assets
├── archive/                # archived builds and older versions
├── docs/                   # roadmap, notes, publication info, issues
├── server/                 # local multiplayer server
├── tests/                  # automated gameplay and validation tests
├── 01-head.html            # base HTML and styles
├── 02-body.html            # HUD, menus, game screens
├── 10-core.js              # core rendering, input, world logic
├── 15-fx.js                # effects and ambience
├── 16-sfx-data.js          # audio and sound data
├── 18-glb.js               # bundled GLB assets
├── 20-gear.js              # gear, shop, and character systems
├── 30-ads-net.js           # local networking and demo ads
├── 35-valley.js            # terrain and environment logic
├── 36-places.js            # location-specific world logic
├── 37-coins.js             # coin, reward, and economy systems
├── 40-wingsuit.js          # wingsuit mode
├── 41-downhill.js          # downhill mode
├── 44-snowboard.js         # snowboard mode
├── 45-park.js              # shared park logic
├── 46-bmx.js               # BMX mode
├── 47-moto.js              # motocross mode
├── 48-wake.js              # wakeboard mode
├── 49-parkour.js           # parkour mode
├── 50-ui.js                # UI and menu systems
├── 52-claw.js              # claw machine system
├── 55-engage.js            # onboarding and engagement systems
├── 57-progress.js          # progression systems
├── 58-replay.js            # replay and ghost systems
├── 60-main.js              # main game loop
├── build.sh                # build pipeline
├── CHANGELOG.md            # project history
├── CODE_OF_CONDUCT.md      # community standards
├── CONTRIBUTING.md         # contribution guide
├── LICENSE                 # MIT license
├── LICENSE-ASSETS.md       # asset restrictions
├── README.md               # project landing page
├── SECURITY.md             # security reporting policy
├── package.json            # scripts and dependencies
├── .gitignore              # ignore rules
└── .github/                # automation and workflows
```

## Quick start

### Run online

```text
https://azert-maker.github.io/lignelibre.github/
```

### Build locally

```bash
npm install
npm run build
npx serve dist/site
```

Then open:

```text
http://localhost:3000
```

### Run tests

```bash
npm test
```

## Roadmap

| Phase | Status | Focus |
|---|---|---|
| Current | Active | player feedback, balancing, mobile performance |
| Next | Planned | more detailed sports and animation work |
| Later | Planned | online multiplayer, new cosmetics, community features |
| Not a priority | Deferred | new sports, native mobile app, real monetization |

## Documentation

- [CHANGELOG.md](CHANGELOG.md)
- [docs/ROADMAP.md](docs/ROADMAP.md)
- [docs/KNOWN_ISSUES.md](docs/KNOWN_ISSUES.md)
- [docs/PUBLICATION.md](docs/PUBLICATION.md)
- [SECURITY.md](SECURITY.md)
- [CONTRIBUTING.md](CONTRIBUTING.md)

## Contributing

Contributions are welcome. If you want to help improve the project, please read the contribution guide and open issues with clear descriptions.

- [CONTRIBUTING.md](CONTRIBUTING.md)
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)

## License

- Code: [MIT](LICENSE)
- Assets: see [LICENSE-ASSETS.md](LICENSE-ASSETS.md)

## Final note

Ligne Libre is a real browser game project with actual gameplay systems, active development, and a public roadmap. It is not a fake product pitch and it does not hide its current limitations.

The project is focused on making a playable, fun, and expandable extreme sports arcade in the browser, with a clear identity and room to grow.

---

<p align="center">
  <sub>Built with curiosity, arcade energy, and a lot of coffee.</sub>
</p>
