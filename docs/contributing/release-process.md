# Release Process

**Last Updated**: 2025-10-18  
**Status**: Active  
**Audience**: Release Managers, Core Team

Comprehensive guide for shipping Toubkal Browser releases, covering versioning, QA, code signing, SLSA provenance, and distribution.

---

## Table of Contents

1. [Release Channels](#release-channels)
2. [Versioning Strategy](#versioning-strategy)
3. [Pre-Release Checklist](#pre-release-checklist)
4. [Release Steps](#release-steps)
5. [Code Signing](#code-signing)
6. [SLSA Provenance](#slsa-provenance)
7. [Distribution](#distribution)
8. [Hotfix Process](#hotfix-process)
9. [Rollback Procedure](#rollback-procedure)

---

## Release Channels

Toubkal uses **three release channels** aligned with Chromium's schedule:

### Channel Strategy

| Channel    | Purpose                 | Update Frequency | Target Audience            |
| ---------- | ----------------------- | ---------------- | -------------------------- |
| **Alpha**  | Early testing, unstable | Weekly           | Developers, early adopters |
| **Beta**   | Pre-release testing     | Every 2 weeks    | Power users, testers       |
| **Stable** | Production-ready        | Every 4 weeks    | General users              |

---

### Channel Lifecycle

```
Alpha (Week 1)
  ↓
Beta (Week 3)
  ↓
Stable (Week 7)
```

**Example Timeline**:

- **Week 1**: Release Alpha 1.2.0-alpha.1
- **Week 3**: Promote to Beta 1.2.0-beta.1
- **Week 5**: Promote to Beta 1.2.0-beta.2 (fixes)
- **Week 7**: Promote to Stable 1.2.0

---

## Versioning Strategy

### Semantic Versioning (SemVer)

Format: `MAJOR.MINOR.PATCH[-PRERELEASE]`

**Examples**:

- `1.0.0` - Stable release
- `1.2.0-alpha.1` - Alpha release
- `1.2.0-beta.2` - Beta release (second iteration)
- `1.2.1` - Hotfix release

---

### Version Increment Rules

| Change Type                                             | Version Increment | Example       |
| ------------------------------------------------------- | ----------------- | ------------- |
| **Breaking change** (API removal, major redesign)       | MAJOR             | 1.5.0 → 2.0.0 |
| **New feature** (new AI model support, MCP integration) | MINOR             | 1.5.0 → 1.6.0 |
| **Bug fix** (crash fix, security patch)                 | PATCH             | 1.5.0 → 1.5.1 |

---

### Version File Locations

Update version in these files:

```
/package.json                          # Node.js version
/src/toubkal/common/version.h          # C++ version
/src/toubkal/browser/resources/manifest.json  # Extension version
```

**Version Update Script**:

```
# scripts/bump-version.sh
#!/bin/bash
NEW_VERSION=$1

# Update package.json
npm version $NEW_VERSION --no-git-tag-version

# Update C++ version
sed -i "s/#define TOUBKAL_VERSION \".*\"/#define TOUBKAL_VERSION \"$NEW_VERSION\"/" src/toubkal/common/version.h

# Update manifest
jq ".version = \"$NEW_VERSION\"" src/toubkal/browser/resources/manifest.json > tmp.json && mv tmp.json src/toubkal/browser/resources/manifest.json

echo "Version bumped to $NEW_VERSION"
```

---

## Pre-Release Checklist

### Phase 1: QA Testing (Week 1-6)

- [ ] **All CI/CD tests pass** (unit, integration, E2E)
- [ ] **Security audit complete** (no critical vulnerabilities)
- [ ] **Performance benchmarks met**:
  - [ ] Lighthouse score > 90
  - [ ] Bundle size < 200KB (gzipped)
  - [ ] Startup time < 2s (cold start)
- [ ] **Privacy features validated**:
  - [ ] Consent prompts work correctly
  - [ ] Audit trail logs all operations
  - [ ] No telemetry leaks
- [ ] **AI features validated**:
  - [ ] Ollama integration works
  - [ ] Local inference performs well
  - [ ] Error handling robust

---

### Phase 2: Documentation (Week 6)

- [ ] **Release notes drafted** (features, fixes, breaking changes)
- [ ] **Changelog updated** (CHANGELOG.md)
- [ ] **Documentation updated** (API changes, new features)
- [ ] **Migration guide prepared** (if breaking changes)
- [ ] **Blog post drafted** (announce features)

---

### Phase 3: Final Validation (Week 6-7)

- [ ] **Manual testing completed**:
  - [ ] Windows 10/11 (x64, ARM64)
  - [ ] macOS 12+ (Intel, Apple Silicon)
  - [ ] Linux (Ubuntu 20.04+, Debian 11+)
- [ ] **Upgrade testing** (existing users can upgrade smoothly)
- [ ] **Localization complete** (all strings translated)
- [ ] **Legal review** (licenses, trademarks, compliance)

---

## Release Steps

### Step 1: Version Bump

```
# Create release branch
git checkout -b release/v1.2.0

# Bump version
./scripts/bump-version.sh 1.2.0

# Commit version bump
git add .
git commit -m "chore: bump version to 1.2.0"
git push origin release/v1.2.0
```

---

### Step 2: Build Release Artifacts

```
# Build Release for all platforms
./scripts/build-release.sh

# This generates:
# - out/Release/toubkal.exe (Windows)
# - out/Release/Toubkal.app (macOS)
# - out/Release/toubkal (Linux)
```

**Build script** (`scripts/build-release.sh`):

```
#!/bin/bash
set -e

# Clean previous builds
rm -rf out/Release

# Generate Release build
gn gen out/Release --args='
  is_toubkal_build = true
  is_official_build = true
  is_debug = false
  enable_toubkal_audit = true
  enable_toubkal_ai = true
  symbol_level = 0
'

# Build Toubkal
autoninja -C out/Release toubkal

echo "Release build complete: out/Release/"
```

---

### Step 3: Code Signing

**Windows** (Authenticode):

```
# Sign Windows executable
signtool sign /f toubkal-cert.pfx /p $env:CERT_PASSWORD /t http://timestamp.digicert.com out/Release/toubkal.exe

# Verify signature
signtool verify /pa out/Release/toubkal.exe
```

**macOS** (Apple Developer ID):

```
# Sign macOS app
codesign --deep --force --verify --verbose \
  --sign "Developer ID Application: Inopsio (TEAM_ID)" \
  out/Release/Toubkal.app

# Notarize with Apple
xcrun notarytool submit out/Release/Toubkal.app.zip \
  --apple-id developer@inopsio.com \
  --password $APPLE_PASSWORD \
  --team-id TEAM_ID

# Staple notarization ticket
xcrun stapler staple out/Release/Toubkal.app
```

**Linux** (GPG):

```
# Sign Linux binary
gpg --armor --detach-sign out/Release/toubkal

# Generates: out/Release/toubkal.asc
```

---

### Step 4: Generate SLSA Provenance

**SLSA Level 3** (Supply Chain Levels for Software Artifacts):

```
# Generate provenance
./scripts/generate-provenance.sh 1.2.0

# This creates:
# - out/Release/toubkal.intoto.jsonl (provenance)
# - out/Release/toubkal.intoto.jsonl.sig (signature)
```

**Provenance script** (`scripts/generate-provenance.sh`):

```
#!/bin/bash
VERSION=$1

# Generate provenance using slsa-framework/slsa-github-generator
slsa-generator generate \
  --artifact out/Release/toubkal \
  --version $VERSION \
  --source github.com/Ilyass-Motya/Toubkal \
  --output out/Release/toubkal.intoto.jsonl

# Sign provenance
gpg --armor --detach-sign out/Release/toubkal.intoto.jsonl
```

**Provenance contents** (example):

```
{
  "_type": "https://in-toto.io/Statement/v0.1",
  "subject": [
    {
      "name": "toubkal",
      "digest": { "sha256": "abc123..." }
    }
  ],
  "predicateType": "https://slsa.dev/provenance/v0.2",
  "predicate": {
    "builder": { "id": "https://github.com/Ilyass-Motya/Toubkal/actions/workflows/release.yml" },
    "buildType": "https://github.com/Ilyass-Motya/Toubkal/build/gn",
    "materials": [
      { "uri": "git+https://github.com/Ilyass-Motya/Toubkal@v1.2.0" }
    ]
  }
}
```

---

### Step 5: Create GitHub Release

```
# Tag release
git tag -a v1.2.0 -m "Release 1.2.0"
git push origin v1.2.0

# Create GitHub release (via CLI)
gh release create v1.2.0 \
  --title "Toubkal Browser 1.2.0" \
  --notes-file RELEASE_NOTES.md \
  out/Release/toubkal.exe \
  out/Release/Toubkal.app.zip \
  out/Release/toubkal \
  out/Release/*.intoto.jsonl \
  out/Release/*.asc
```

---

## Distribution

### Auto-Update System

Toubkal uses **Omaha protocol** (Chromium's update system):

**Update manifest** (`updates/manifest.xml`):

```
<?xml version="1.0" encoding="UTF-8"?>
<response protocol="3.0">
  <app appid="{TOUBKAL_APP_ID}">
    <updatecheck status="ok">
      <urls>
        <url codebase="https://releases.toubkal.app/stable/1.2.0/"/>
      </urls>
      <manifest version="1.2.0">
        <packages>
          <package name="toubkal_1.2.0_windows_x64.exe" hash_sha256="abc123..." size="125829120" required="true"/>
        </packages>
      </manifest>
    </updatecheck>
  </app>
</response>
```

---

### Download Statistics

Track downloads via CDN logs:

```
# Query download stats
aws s3api list-objects-v2 \
  --bucket toubkal-releases \
  --prefix stable/1.2.0/ \
  --query 'sum(Contents[].Size)'
```

---

## Hotfix Process

### When to Hotfix

**Critical issues** requiring immediate release:

- Security vulnerabilities (CVE)
- Data loss bugs
- Crash on startup
- Privacy leaks

---

### Hotfix Steps

```
# 1. Create hotfix branch from stable
git checkout v1.2.0
git checkout -b hotfix/v1.2.1

# 2. Apply fix
git cherry-pick <commit-hash>

# 3. Bump patch version
./scripts/bump-version.sh 1.2.1

# 4. Build and sign
./scripts/build-release.sh
./scripts/sign-release.sh

# 5. Release immediately (skip Beta)
gh release create v1.2.1 --notes "Hotfix: [issue description]"

# 6. Merge back to main
git checkout main
git merge hotfix/v1.2.1
```

---

## Rollback Procedure

### Automatic Rollback (CI/CD)

If **post-release tests fail**:

```
# .github/workflows/release.yml
post-release-validation:
  runs-on: ubuntu-latest
  steps:
    - name: Run smoke tests
      run: ./scripts/smoke-test.sh

    - name: Rollback if tests fail
      if: failure()
      run: |
        gh release delete v${{ github.ref_name }} --yes
        aws s3 rm s3://toubkal-releases/stable/${{ github.ref_name }} --recursive
```

---

### Manual Rollback

```
# 1. Delete GitHub release
gh release delete v1.2.0 --yes

# 2. Revert update manifest
git checkout v1.1.0 updates/manifest.xml
git commit -m "Rollback to 1.1.0"
git push

# 3. Notify users
# - Post on blog
# - Send email to users
# - Update status page
```

---

## Release Checklist Template

```
# Release 1.2.0 Checklist

## Pre-Release (Week 1-6)
- [ ] Alpha 1.2.0-alpha.1 released (Week 1)
- [ ] Beta 1.2.0-beta.1 released (Week 3)
- [ ] All CI/CD tests pass
- [ ] Security audit complete
- [ ] Performance benchmarks met
- [ ] Privacy features validated

## Release Week (Week 7)
- [ ] Version bumped to 1.2.0
- [ ] Release notes drafted
- [ ] Changelog updated
- [ ] Documentation updated
- [ ] Manual testing completed (Windows, macOS, Linux)

## Release Day
- [ ] Release artifacts built
- [ ] Code signing complete (Windows, macOS, Linux)
- [ ] SLSA provenance generated
- [ ] GitHub release created
- [ ] Update manifest deployed
- [ ] Blog post published
- [ ] Social media announcement

## Post-Release (Day 1-7)
- [ ] Monitor crash reports
- [ ] Monitor download stats
- [ ] Monitor user feedback
- [ ] Address critical issues (hotfix if needed)
```

---

## See Also

- **[Product Roadmap](../PRODUCT-ROADMAP.md)** - Release timeline and milestones
- **[Build Instructions](build-instructions.md)** - Build system for releases
- **[Testing Strategy](testing-strategy.md)** - QA process and coverage requirements
- **[PRD](../TOUBKAL-PRD.md)** - SLSA Level 3 requirements
- **[Architecture Overview](../architecture/ARCHITECTURE-OVERVIEW.md)** - Reproducible builds architecture
- **[Security Policy](../SECURITY.md)** - Security release process
- **[SLSA Framework](https://slsa.dev)** - Supply chain security standard

---

**Last Updated**: 2025-10-18
**Questions?** Email: release@toubkal.app
