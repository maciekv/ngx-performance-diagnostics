# Getting Started with ngx-performance-diagnostics

Complete guide to publishing and maintaining your npm package.

## 📋 Table of Contents

1. [Setup Repository](#setup-repository)
2. [Install Dependencies](#install-dependencies)
3. [Build the Library](#build-the-library)
4. [Test Locally](#test-locally)
5. [Publish to NPM](#publish-to-npm)
6. [Maintain](#maintain)

---

## 1. Setup Repository

### Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `ngx-performance-diagnostics`
3. Description: "Real-time performance monitoring and diagnostics for Angular applications"
4. Public repository
5. Don't initialize with README (we already have one)

### Initialize Git

```bash
cd ~/Desktop/ngx-performance-diagnostics

# Initialize git
git init

# Add all files
git add .

# First commit
git commit -m "Initial commit: ngx-performance-diagnostics v1.0.0"

# Add remote (replace YOURUSERNAME)
git remote add origin https://github.com/YOURUSERNAME/ngx-performance-diagnostics.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Update package.json

Edit `package.json` and update these fields:

```json
{
  "author": "Your Name <your.email@example.com>",
  "repository": {
    "type": "git",
    "url": "https://github.com/YOURUSERNAME/ngx-performance-diagnostics.git"
  },
  "bugs": {
    "url": "https://github.com/YOURUSERNAME/ngx-performance-diagnostics/issues"
  },
  "homepage": "https://github.com/YOURUSERNAME/ngx-performance-diagnostics#readme"
}
```

---

## 2. Install Dependencies

```bash
cd ~/Desktop/ngx-performance-diagnostics

# Install all dependencies
npm install
```

This will install:
- Angular packages (@angular/core, @angular/common, etc.)
- Build tools (ng-packagr, TypeScript)
- RxJS

---

## 3. Build the Library

```bash
# Build the library
npm run build
```

This creates the `dist/` folder with:
- Compiled JavaScript (ESM modules)
- TypeScript definitions (.d.ts files)
- package.json
- README.md

**Check the output:**

```bash
ls -la dist/
```

You should see:
- `index.d.ts` - TypeScript definitions
- `index.mjs` - Main module
- `package.json` - Package metadata
- Various module folders (esm2022, fesm2022, etc.)

---

## 4. Test Locally

### Option A: Link Locally

```bash
# In ngx-performance-diagnostics directory
cd ~/Desktop/ngx-performance-diagnostics/dist
npm link

# In your test Angular project
cd /path/to/your/angular/project
npm link ngx-performance-diagnostics
```

### Option B: Install from Tarball

```bash
# Create a package tarball
npm run pack

# This creates: dist/ngx-performance-diagnostics-1.0.0.tgz

# In your test project
cd /path/to/your/test/project
npm install /Users/grandsoftware/Desktop/ngx-performance-diagnostics/dist/ngx-performance-diagnostics-1.0.0.tgz
```

### Test in Your Project

```typescript
// app.component.ts
import {
  CdMonitorPanelComponent,
  MemoryLeakPanelComponent
} from 'ngx-performance-diagnostics';

@Component({
  imports: [CdMonitorPanelComponent, MemoryLeakPanelComponent],
  template: `
    <ngx-cd-monitor-panel></ngx-cd-monitor-panel>
    <ngx-memory-leak-panel></ngx-memory-leak-panel>
  `
})
export class AppComponent {}
```

**Run your test app:**

```bash
ng serve
```

**Verify:**
- No build errors
- Panels appear in browser
- Panels are functional

---

## 5. Publish to NPM

### Create NPM Account

If you don't have one:
1. Go to https://www.npmjs.com/signup
2. Create account
3. Verify email

### Login to NPM

```bash
npm login
```

Enter:
- Username
- Password
- Email
- OTP (if 2FA enabled)

**Verify:**

```bash
npm whoami
```

Should show your username.

### Publish

```bash
# Make sure you're in the project root
cd ~/Desktop/ngx-performance-diagnostics

# Build one more time
npm run build

# Publish!
npm run publish:npm
```

This will:
1. Build the library
2. Navigate to dist/
3. Publish to NPM

**Wait a few minutes, then check:**
https://www.npmjs.com/package/ngx-performance-diagnostics

---

## 6. Maintain

### Update Version

When you make changes:

```bash
# For bug fixes (1.0.0 -> 1.0.1)
npm version patch

# For new features (1.0.0 -> 1.1.0)
npm version minor

# For breaking changes (1.0.0 -> 2.0.0)
npm version major
```

### Update CHANGELOG

Edit `CHANGELOG.md`:

```markdown
## [1.0.1] - 2025-12-11

### Fixed
- Fixed memory leak in panel component
- Improved error handling
```

### Commit Changes

```bash
git add .
git commit -m "Version 1.0.1: Bug fixes"
git push
```

### Publish Update

```bash
npm run build
npm run publish:npm
```

### Create GitHub Release

1. Go to: https://github.com/YOURUSERNAME/ngx-performance-diagnostics/releases
2. Click "Create a new release"
3. Tag: `v1.0.1`
4. Title: `Release 1.0.1`
5. Description: Copy from CHANGELOG.md
6. Publish release

---

## Automated Publishing (Optional)

### Setup GitHub Actions

Already configured! Just need to add NPM token:

1. Generate NPM token:
   ```bash
   npm login
   # Visit: https://www.npmjs.com/settings/YOUR_USERNAME/tokens
   # Generate new token (Automation type)
   ```

2. Add to GitHub Secrets:
   - Go to repository Settings → Secrets → Actions
   - Click "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: (paste your token)

3. Now, whenever you push a tag, it auto-publishes:
   ```bash
   git tag v1.0.1
   git push origin v1.0.1
   ```

---

## Troubleshooting

### "Package name already taken"

Someone else published `ngx-performance-diagnostics`. Choose a different name:

```json
{
  "name": "@yourusername/ngx-performance-diagnostics"
}
```

### "You do not have permission"

Make sure you're logged in:

```bash
npm whoami
npm login
```

### Build errors

```bash
rm -rf node_modules package-lock.json dist
npm install
npm run build
```

### "No README"

Make sure README.md is in the root directory (it is).

---

## Next Steps

1. ✅ Publish v1.0.0
2. 📢 Announce on:
   - Twitter
   - Reddit (r/angular)
   - Dev.to
   - Medium
3. 📊 Monitor:
   - NPM downloads
   - GitHub stars
   - Issues
4. 🔄 Iterate based on feedback

---

## Support

Need help?
- Open an issue: https://github.com/YOURUSERNAME/ngx-performance-diagnostics/issues
- Email: your.email@example.com

Good luck! 🚀
