# Project Structure

```
ngx-performance-diagnostics/
├── .github/
│   └── workflows/
│       ├── ci.yml                 # CI workflow
│       └── publish.yml            # NPM publishing workflow
├── src/
│   ├── components/
│   │   ├── cd-monitor-panel.component.ts
│   │   └── memory-leak-panel.component.ts
│   ├── directives/
│   │   └── change-detection-monitor.directive.ts
│   ├── services/
│   │   ├── change-detection-monitor.service.ts
│   │   └── memory-leak-detector.service.ts
│   ├── models/
│   │   └── component-stats.model.ts
│   └── public-api.ts             # Public exports
├── dist/                          # Build output (generated)
├── node_modules/                  # Dependencies (git ignored)
├── .gitignore
├── .npmignore
├── CHANGELOG.md
├── CONTRIBUTING.md
├── LICENSE
├── ng-package.json               # ng-packagr configuration
├── package.json
├── PUBLISHING.md                 # Publishing guide
├── QUICK_START.md               # Quick start guide
├── README.md                    # Main documentation
└── tsconfig.json                # TypeScript configuration
```

## Key Files

### Source Files (`src/`)

- **components/**: UI components for visual panels
- **directives/**: Change detection monitoring directive
- **services/**: Core monitoring services
- **models/**: TypeScript interfaces and types
- **public-api.ts**: Entry point, exports all public APIs

### Configuration Files

- **package.json**: NPM package configuration
- **ng-package.json**: ng-packagr build configuration
- **tsconfig.json**: TypeScript compiler configuration

### Documentation

- **README.md**: Main documentation
- **QUICK_START.md**: 5-minute quick start
- **PUBLISHING.md**: How to publish to NPM
- **CONTRIBUTING.md**: Contribution guidelines
- **CHANGELOG.md**: Version history

### GitHub Actions

- **ci.yml**: Continuous integration (build & test)
- **publish.yml**: Automated NPM publishing on tag push

## Build Output (`dist/`)

After running `npm run build`, the dist/ folder contains:

```
dist/
├── esm2022/               # ES2022 modules
├── esm2020/               # ES2020 modules
├── fesm2022/              # Flat ES2022 modules
├── fesm2020/              # Flat ES2020 modules
├── index.d.ts             # TypeScript definitions
├── index.mjs              # Main module
├── package.json           # Package metadata
└── README.md              # Copied from root
```

This is the package that gets published to NPM.
