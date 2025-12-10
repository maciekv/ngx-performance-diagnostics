# Publishing Guide

## Prerequisites

1. **NPM Account**: Create account at https://www.npmjs.com/signup
2. **NPM Token**: Login locally with `npm login`
3. **GitHub Repository**: Create repo at https://github.com

## Initial Setup

### 1. Update package.json

Edit `package.json` and update:

```json
{
  "name": "ngx-performance-diagnostics",
  "author": "Your Name <your.email@example.com>",
  "repository": {
    "type": "git",
    "url": "https://github.com/YOURUSERNAME/ngx-performance-diagnostics.git"
  }
}
```

### 2. Initialize Git Repository

```bash
cd ngx-performance-diagnostics
git init
git add .
git commit -m "Initial commit"
```

### 3. Create GitHub Repository

```bash
# Create repo on GitHub, then:
git remote add origin https://github.com/YOURUSERNAME/ngx-performance-diagnostics.git
git branch -M main
git push -u origin main
```

## Publishing to NPM

### First Time Publishing

```bash
# 1. Build the library
npm run build

# 2. Test the package locally
npm run pack
# This creates a .tgz file in dist/

# 3. Test in another project
cd /path/to/test-project
npm install /path/to/ngx-performance-diagnostics/dist/ngx-performance-diagnostics-1.0.0.tgz

# 4. If everything works, publish to NPM
cd /path/to/ngx-performance-diagnostics
npm run publish:npm
```

### Updating Versions

```bash
# Patch version (1.0.0 -> 1.0.1)
npm version patch

# Minor version (1.0.0 -> 1.1.0)
npm version minor

# Major version (1.0.0 -> 2.0.0)
npm version major

# Build and publish
npm run build
cd dist
npm publish
```

## Version Strategy

Follow [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes (e.g., 1.0.0 -> 2.0.0)
- **MINOR**: New features, backwards compatible (e.g., 1.0.0 -> 1.1.0)
- **PATCH**: Bug fixes, backwards compatible (e.g., 1.0.0 -> 1.0.1)

## Pre-release Checklist

- [ ] All tests passing
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Version bumped in package.json
- [ ] Built successfully (`npm run build`)
- [ ] Tested locally in another project
- [ ] Git committed and pushed
- [ ] Git tag created (`git tag v1.0.0`)

## Publishing Steps

1. **Update CHANGELOG.md** with new version and changes
2. **Bump version**: `npm version [major|minor|patch]`
3. **Build**: `npm run build`
4. **Test**: Test the dist/ package in another project
5. **Publish**: `cd dist && npm publish`
6. **Tag**: `git push --tags`
7. **GitHub Release**: Create release on GitHub with changelog

## Post-Publishing

1. **Verify on NPM**: Check https://www.npmjs.com/package/ngx-performance-diagnostics
2. **Test installation**: `npm install ngx-performance-diagnostics` in a test project
3. **Update documentation** if needed
4. **Announce**: Share on Twitter, Reddit, etc.

## Troubleshooting

### "You do not have permission to publish"

```bash
npm login
npm whoami  # Verify you're logged in
```

### "Package name already exists"

Choose a different name in package.json

### "No README data"

Ensure README.md exists in the root directory

### Build errors

```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

## Automated Publishing with GitHub Actions

See `.github/workflows/publish.yml` for automated publishing on tag push.

To use:

```bash
# Create and push a tag
git tag v1.0.0
git push origin v1.0.0

# GitHub Actions will automatically build and publish
```
