![EMU·HUB banner](./static/emuhub-banner.svg)

# EMU·HUB

Browser-native emulator hub, starting with a playable CHIP-8 core and structured to grow into a multi-system frontend.

[![Deploy to GitHub Pages](https://github.com/aaronsnig501/emuhub/actions/workflows/deploy.yml/badge.svg)](https://github.com/aaronsnig501/emuhub/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-00e8b0.svg)](#license)
[![Open issues](https://img.shields.io/github/issues/aaronsnig501/emuhub?color=ff3030)](https://github.com/aaronsnig501/emuhub/issues)

## Features

- Browser-based CHIP-8 player with local ROM loading
- Emulator controls for run, pause, restart, single-step, and speed selection
- In-memory save states with restore and delete actions
- ROM info, keymap reference, live register view, and display theme swatches
- Shared multi-emulator route structure: `/play/chip8`, `/play/[system]`, `/library`, `/saves`
- Theme-ready SvelteKit UI with GitHub Pages deployment support

## Getting Started

### Requirements

- Node.js 20+
- npm

### Local development

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. In development the app runs from `/`. In production on GitHub Pages it runs under `/emuhub`.

### Checks

```sh
npm run check
npm run lint
```

## Self-Hosting

EMU·HUB currently builds to a static SvelteKit site. A simple way to self-host it is to build the app and serve the generated `build/` directory with a containerized web server:

```sh
npm install
npm run build

docker run --rm \
  -p 3000:80 \
  -v "$(pwd)/build:/usr/share/nginx/html:ro" \
  nginx:alpine
```

Then open `http://localhost:3000/emuhub` if you built with the production base path, or adjust the base path for your own deployment target.

## Systems

| System | Status | Notes |
| --- | --- | --- |
| CHIP-8 | Built | Browser-playable player, controls, save states, live debug panels |
| NES | Planned | Future multi-emulator route target |
| Game Boy | Planned | Future multi-emulator route target |
| Game Boy Color | Planned | Future multi-emulator route target |
| GBA | Planned | Future multi-emulator route target |
| SNES | Planned | Future multi-emulator route target |
| PS1 | Planned | Future multi-emulator route target |

## Legal

EMU·HUB does not ship with ROMs. You are responsible for the game files you load into the emulator and for complying with the laws that apply in your jurisdiction.

Patch workflows can be supported without redistributing copyrighted game data, but patch usage still depends on you owning and using ROMs legally.

## Contributing

Contributions are welcome.

1. Fork the repo.
2. Create a feature branch.
3. Run `npm run check` and `npm run lint`.
4. Open a pull request with a clear summary of the change.

Areas that benefit most from contributions right now:

- Additional emulator cores under `src/lib/emulators/`
- Shared player-shell improvements
- Library and saves routes
- Tests for emulator behavior and route flows

## License

MIT
