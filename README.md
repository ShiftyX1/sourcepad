# Shifty's SourcePad

Simple code editor built with Monaco Editor and Electron + TypeScript/Vite.

[![Release](https://img.shields.io/github/v/release/ShiftyX1/sourcepad?color=blue)](https://github.com/ShiftyX1/sourcepad/releases)
[![GitHub downloads](https://img.shields.io/github/downloads/ShiftyX1/sourcepad/total)](https://github.com/ShiftyX1/sourcepad/releases)
[![Build Status](https://img.shields.io/github/actions/workflow/status/ShiftyX1/sourcepad/build.yaml?branch=master)](https://github.com/ShiftyX1/sourcepad/actions)
[![License](https://img.shields.io/github/license/ShiftyX1/sourcepad?label=license)](https://github.com/ShiftyX1/sourcepad/blob/master/LICENSE)
[![Last Commit](https://img.shields.io/github/last-commit/ShiftyX1/sourcepad)](https://github.com/ShiftyX1/sourcepad/commits/master)
[![Electron Version](https://img.shields.io/badge/electron-37.3.1-47848F?logo=electron)](https://www.electronjs.org/)
[![Node Version](https://img.shields.io/badge/node.js-22.16.0-green?logo=node.js)](https://nodejs.org/)

## Download

Download the latest version from [Releases](https://github.com/ShiftyX1/sourcepad/releases):

- **Windows**: `SourcePad-Setup.exe` or `SourcePad-win.exe` (portable)
- **macOS**: `SourcePad.dmg` or `SourcePad-mac.zip`
- **Linux**: `SourcePad.AppImage`, `.deb`, or `.rpm`

## Quick Start

### For Users:
1. Download and install SourcePad for your platform
2. Launch the application
3. Create a new file or open an existing one
4. Start coding with full syntax highlighting and intellisense!

### For Developers:

```bash
git clone https://github.com/yourusername/sourcepad.git
cd sourcepad

# Install dependencies
pnpm install

# Start development
pnpm run dev:full
```

## Development

### Prerequisites
- Node.js v22.16.0
- pnpm or yarn

### Setup
```bash
pnpm install          # Install all dependencies
pnpm run dev:full     # Start in development mode
```

### Building for Production

```bash
# Build for all platforms
pnpm run build

# Build for specific platform
pnpm run build:win     # Windows
pnpm run build:mac     # macOS
pnpm run build:linux   # Linux
```

## Project Structure

```
sourcepad/
├── src/
│   ├── main/           # Backend Electron logic and app entrypoint
│   │   ├── main.ts
│   │   └── preload.ts
│   └── renderer/       # Frontend components and logic
│       ├── editor/
│       ├── start-page/
│       ├── types/
│       └── vite-env.d.ts
├── scripts/              # Build scripts
│   ├── setup-monaco.js   # Monaco setup (Legacy, will be removed)
│   └── kill-processes.sh # Helper script
└── assets/               # App icons and resources
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Release Process

### Automatic Releases

- **Push to master** → Creates nightly build
- **Create tag `v1.0.0`** → Creates stable release

### Manual Release
```bash
# Create and push a tag
git tag v1.0.0
git push origin v1.0.0

# GitHub Actions will automatically:
# 1. Build for all platforms
# 2. Create release with binaries
# 3. Generate changelog
```

## Configuration

### electron-builder
See `package.json` build section for packaging configuration.

### GitHub Actions
Automated building and releasing via `.github/workflows/build.yml`.

## Roadmap

- [ ] **File Explorer** - Sidebar with file tree
- [ ] **Multi-tab editing** - Open multiple files
- [ ] **Find & Replace** - Search functionality
- [ ] **Extensions** - Plugin system
- [ ] **Git integration** - Basic git operations
- [ ] **Terminal** - Integrated terminal
- [ ] **Language servers** - Enhanced intellisense for more languages
- [ ] **Auto-updates** - Automatic application updates

## Bug Reports

Found a bug? Please [create an issue](https://github.com/ShiftyX1/sourcepad/issues) with:
- Operating system and version
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - Microsoft's JavaScript code editor
- [Electron](https://electronjs.org/) - Framework for desktop apps
- [electron-builder](https://electron.build/) - Packaging and distribution
