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

<p align="center">
  <strong>Browser-based 3D extreme sports arcade</strong> · 7 sports · 7 locations · one-file web build
</p>

Ligne Libre is a browser-based 3D arcade sports game built around fast action, expressive movement, and strong replayability. It combines multiple extreme sports disciplines into a single playable experience designed to feel immediate, accessible, and fun from the first run.

## Play now

- Live demo: https://azert-maker.github.io/lignelibre.github/
- Works in modern browsers
- Desktop and mobile friendly
- Internet connection required on first load to fetch assets

## Why it stands out

- 7 sports with distinct mechanics and rhythm
- 7 handcrafted locations with their own identity
- coins, progression, upgrade loop, and cosmetic rewards
- physics-based landings, reactions, and crash moments
- replay system, ghost tracking, and score-based runs
- a compact, portable project architecture that is easy to run and expand

## Featured sports

| Sport | Setting | Hook |
|---|---|---|
| Wingsuit | Alpine valley | glide lines, close-to-ground flying, ring runs |
| Downhill longboard | Coastal mountain road | speed, slides, edge control |
| Snowboard | Mountain resort | jumps, rails, rotations |
| BMX | Urban park | balance, tricks, grinds |
| Motocross | Off-road terrain | boosts, landings, whip control |
| Wakeboard | Lake course | traction, pop, wake-to-wake flow |
| Parkour | Rooftop city | chaining moves and wall runs |

## Quick start

### Run the game online

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

## Project structure

```text
.
├── .github/                # workflows, issue templates, repo automation
├── assets/                 # 3D assets, textures, third-party content
├── archive/                # archived builds and legacy output
├── docs/                   # roadmap, publication docs, issue notes
├── server/                 # local multiplayer server
├── tests/                  # automated test suite
├── 01-head.html            # base markup and styles
├── 02-body.html            # HUD and interface elements
├── 10-core.js              # core simulation, rendering, inputs, profile
├── 15-fx.js                # effects, particles, ambience
├── 16-sfx-data.js          # audio and sound data
├── 18-glb.js               # bundled GLB assets
├── 20-gear.js              # gear, upgrades, character logic
├── 30-ads-net.js           # demo ads and local network layer
├── 35-valley.js            # valley and terrain logic
├── 36-places.js            # location-specific world logic
├── 37-coins.js             # coin systems and reward flow
├── 40-wingsuit.js          # wingsuit mode
├── 41-downhill.js          # downhill mode
├── 44-snowboard.js         # snowboard mode
├── 45-park.js              # shared park logic
├── 46-bmx.js               # BMX mode
├── 47-moto.js              # motocross mode
├── 48-wake.js              # wakeboard mode
├── 49-parkour.js           # parkour mode
├── 50-ui.js                # menus and UI systems
├── 52-claw.js              # claw machine system
├── 55-engage.js            # onboarding and engagement systems
├── 57-progress.js          # progression systems
├── 58-replay.js            # replay and ghost systems
├── 60-main.js              # main game loop and flow
├── build.sh                # build pipeline
├── CHANGELOG.md            # project history
├── CODE_OF_CONDUCT.md      # community standards
├── CONTRIBUTING.md         # contribution guide
├── LICENSE                 # MIT license
├── LICENSE-ASSETS.md       # asset restrictions
├── README.md               # repository landing page
├── SECURITY.md             # security reporting policy
├── package.json            # scripts and dependencies
├── .gitignore              # ignore rules
└── .github/                # GitHub automation
```

## Roadmap

| Phase | Status | Focus |
|---|---|---|
| Current | Active | player feedback, economy balancing, mobile optimization |
| Next | Planned | more detailed boards and wingsuit handling, landing animations |
| Later | Planned | online multiplayer, weekly challenges, new cosmetic sets |
| Not a priority | Deferred | new sports, native app, real monetization |

## Documentation

- [CHANGELOG.md](CHANGELOG.md)
- [docs/ROADMAP.md](docs/ROADMAP.md)
- [docs/KNOWN_ISSUES.md](docs/KNOWN_ISSUES.md)
- [docs/PUBLICATION.md](docs/PUBLICATION.md)
- [SECURITY.md](SECURITY.md)
- [CONTRIBUTING.md](CONTRIBUTING.md)

## Contributing

Contributions are welcome. If you want to help shape the game, improve systems, or report issues:

- open an issue with the `Idea` or `Bug` label
- review [CONTRIBUTING.md](CONTRIBUTING.md)
- follow the project code of conduct in [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)

## License

- Code: [MIT](LICENSE)
- Assets: see [LICENSE-ASSETS.md](LICENSE-ASSETS.md)

## Why this repo feels like a real project

Ligne Libre has a strong core identity:
- it is easy to understand
- it is quick to try
- it has a clear visual identity
- it has a clearly defined progression
- it has a public roadmap and structure
- it feels like a playable product, not just a code dump

That combination is what makes a repository feel premium on GitHub: clarity, personality, and momentum.

---

<p align="center">
  <sub>Built with curiosity, arcade energy, and a lot of coffee.</sub>
</p>
