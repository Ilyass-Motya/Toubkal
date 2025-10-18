# Build Instructions

**Last Updated**: 2025-10-18
**Status**: Active
**Audience**: Developers (Deep Dive - Chromium Build System)

## Project Paths

**Important**: These are the specific paths used in the Toubkal Browser project:

- **Project Root**: `C:\ToubkalBrowser`
- **Depot Tools**: `C:\depot_tools`
- **Chromium Fork**: `C:\chromium`
- **GitHub Repository**: https://github.com/Ilyass-Motya/Toubkal.git

Comprehensive guide for building Toubkal Browser from source, covering prerequisites, Chromium build system (GN + Siso), and troubleshooting.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Build Configuration (GN)](#build-configuration-gn)
4. [Building Toubkal](#building-toubkal)
5. [Incremental Builds (Siso)](#incremental-builds-siso)
6. [Build Targets](#build-targets)
7. [Platform-Specific Notes](#platform-specific-notes)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### All Platforms

**Required Software**:

- **Git** 2.30+ (version control)
- **Python** 3.8+ (Chromium build scripts)
- **Node.js** 20+ (UI development)
- **pnpm** 8+ (package manager)

**Disk Space**:

- **Full build**: ~100GB
- **Debug build**: ~40GB
- **Release build**: ~15GB

---

### Windows

**Requirements**:

- **Windows 10/11** (64-bit)
- **Visual Studio 2022** (Community Edition or higher)
  - Install "Desktop development with C++"
  - Windows 10 SDK (10.0.19041.0 or later)
- **depot_tools** (Chromium build tools)

**Installation**:

```
# Install Chocolatey (if not installed)
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install prerequisites
choco install git python nodejs visualstudio2022community -y

# Install pnpm
npm install -g pnpm

# Clone depot_tools
git clone https://chromium.googlesource.com/chromium/tools/depot_tools.git C:\depot_tools
$env:PATH += ";C:\depot_tools"
```

---

### macOS

**Requirements**:

- **macOS 12+** (Monterey or later)
- **Xcode** 14+ (from App Store)
- **Command Line Tools**

**Installation**:

```
# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install prerequisites
brew install git python@3.11 node pnpm

# Install Xcode Command Line Tools
xcode-select --install

# Clone depot_tools
git clone https://chromium.googlesource.com/chromium/tools/depot_tools.git ~/depot_tools
export PATH="$HOME/depot_tools:$PATH"
echo 'export PATH="$HOME/depot_tools:$PATH"' >> ~/.zshrc
```

---

### Linux (Ubuntu/Debian)

**Requirements**:

- **Ubuntu 20.04+** or **Debian 11+**
- **Build dependencies** (see below)

**Installation**:

```
# Update system
sudo apt update && sudo apt upgrade -y

# Install build dependencies
sudo apt install -y \
  git python3 python3-pip \
  build-essential ninja-build \
  libglib2.0-dev libgtk-3-dev \
  libx11-dev libxcomposite-dev libxcursor-dev \
  libxdamage-dev libxext-dev libxfixes-dev \
  libxi-dev libxrandr-dev libxrender-dev \
  libxss-dev libxtst-dev

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install pnpm
npm install -g pnpm

# Clone depot_tools
git clone https://chromium.googlesource.com/chromium/tools/depot_tools.git ~/depot_tools
export PATH="$HOME/depot_tools:$PATH"
echo 'export PATH="$HOME/depot_tools:$PATH"' >> ~/.bashrc
```

---

## Initial Setup

### 1. Clone Toubkal Repository

```
# Clone Toubkal (Brave fork)
git clone https://github.com/Ilyass-Motya/Toubkal.git C:\ToubkalBrowser
cd C:\ToubkalBrowser

# Install Node.js dependencies
pnpm install
```

---

### 2. Sync Chromium Dependencies

**This step downloads ~20GB of Chromium source code**:

```
# Initialize gclient config
gclient config --name src --unmanaged https://chromium.googlesource.com/chromium/src.git

# Sync Chromium dependencies (takes 30-60 minutes)
gclient sync

# On first run, you'll be prompted to accept licenses
# Type 'y' to accept
```

**What this does**:

- Downloads Chromium source code
- Downloads prebuilt binaries (toolchains, SDKs)
- Sets up git hooks

---

### 3. Apply Toubkal Patches

```
# Apply Toubkal-specific modifications to Chromium
python3 scripts/apply-patches.py
```

**Patches applied**:

- Remove Brave-specific features (Rewards, Wallet)
- Add Toubkal branding (`toubkal://` URL scheme)
- Add Consent Fabric hooks
- Add Audit Trail integration

---

## Build Configuration (GN)

### Understanding GN

**GN** (Generate Ninja) is Chromium's build configuration system.

**Key concepts**:

- **args.gn** - Build configuration file
- **gn gen** - Generate Ninja build files
- **gn args** - Edit build configuration

---

### Create Build Configuration

```
# Generate Debug build configuration
gn gen out/Debug --args='
  is_toubkal_build = true
  is_debug = true
  enable_toubkal_audit = true
  enable_toubkal_ai = true
  enable_brave_rewards = false
  enable_brave_wallet = false
  symbol_level = 1
'

# Or generate Release build configuration
gn gen out/Release --args='
  is_toubkal_build = true
  is_official_build = true
  is_debug = false
  enable_toubkal_audit = true
  enable_toubkal_ai = true
  enable_brave_rewards = false
  enable_brave_wallet = false
  symbol_level = 0
'
```

---

### Build Configuration Options

| Flag                   | Description                               | Debug | Release |
| ---------------------- | ----------------------------------------- | ----- | ------- |
| `is_toubkal_build`     | Enable Toubkal-specific features          | true  | true    |
| `is_debug`             | Enable debug symbols + assertions         | true  | false   |
| `is_official_build`    | Enable optimizations + branding           | false | true    |
| `enable_toubkal_audit` | Enable Audit Trail                        | true  | true    |
| `enable_toubkal_ai`    | Enable AI integration                     | true  | true    |
| `enable_brave_rewards` | Brave Rewards (remove)                    | false | false   |
| `enable_brave_wallet`  | Brave Wallet (remove)                     | false | false   |
| `symbol_level`         | Debug symbols (0=none, 1=minimal, 2=full) | 1     | 0       |
| `use_jumbo_build`      | Faster builds (experimental)              | false | false   |

---

### Edit Build Configuration

```
# Interactive editor
gn args out/Debug

# Or edit directly
nano out/Debug/args.gn
```

---

## Building Toubkal

### Full Build

```
# Build Toubkal browser (Debug)
autoninja -C out/Debug toubkal

# Build Toubkal browser (Release)
autoninja -C out/Release toubkal
```

**Build times** (approximate, depends on hardware):

- **First build**: 2-4 hours (quad-core) or 1-2 hours (8+ cores)
- **Incremental build**: 2-10 minutes

---

### Component Build (Faster Development)

**Component build** splits Chromium into DLLs for faster incremental builds:

```
# Generate component build
gn gen out/Component --args='
  is_toubkal_build = true
  is_debug = true
  is_component_build = true
  enable_toubkal_audit = true
  enable_toubkal_ai = true
'

# Build
autoninja -C out/Component toubkal
```

**Trade-offs**:

- ✅ **Faster incremental builds** (30-50% faster)
- ❌ **Slower startup** (more DLLs to load)
- ❌ **Larger disk usage** (~60GB vs ~40GB)

---

## Incremental Builds (Siso)

**Siso** is Chromium's incremental build system (replaces Ninja for some tasks).

### Using Siso

```
# Enable Siso in build config
gn args out/Debug
# Add: use_siso = true

# Build with Siso
autoninja -C out/Debug toubkal
```

**Benefits**:

- ✅ Faster incremental builds (caches unchanged files)
- ✅ Parallel compilation (uses all CPU cores)
- ✅ Remote execution support (for CI/CD)

---

## Build Targets

### Common Targets

```
# Build Toubkal browser (full)
autoninja -C out/Debug toubkal

# Build only C++ core (no UI)
autoninja -C out/Debug toubkal_core

# Build unit tests
autoninja -C out/Debug toubkal_unittests

# Build browser tests
autoninja -C out/Debug toubkal_browser_tests

# Build specific component
autoninja -C out/Debug //toubkal/browser/consent:consent_manager
```

---

### Running Tests

```
# Run unit tests
out/Debug/toubkal_unittests

# Run browser tests
out/Debug/toubkal_browser_tests

# Run specific test
out/Debug/toubkal_unittests --gtest_filter=ConsentManagerTest.*
```

---

## Platform-Specific Notes

### Windows

**Visual Studio Integration**:

```
# Generate Visual Studio solution
gn gen out/Debug --ide=vs

# Open in Visual Studio
start out/Debug/all.sln
```

**Common Issues**:

- **Long paths**: Enable long path support (`gpedit.msc` → Computer Configuration → Administrative Templates → System → Filesystem)
- **Antivirus**: Exclude `out/` directory from antivirus scanning (slows builds)

---

### macOS

**Code Signing**:

```
# Disable code signing for development
gn args out/Debug
# Add: is_component_build = true
#      codesign_identity = ""
```

**Common Issues**:

- **Xcode version**: Use Xcode 14+ (older versions incompatible)
- **Disk space**: Ensure 100GB+ free space on SSD (HDD too slow)

---

### Linux

**Missing Libraries**:

```
# Install additional dependencies if build fails
sudo apt install -y \
  libnss3-dev libgconf-2-4 \
  libatk1.0-0 libatk-bridge2.0-0 \
  libcups2-dev libdrm-dev \
  libgbm-dev libasound2-dev
```

**Common Issues**:

- **Out of memory**: Reduce parallel jobs (`ninja -j4` instead of `-j16`)

---

## Troubleshooting

### Build Fails with "Disk Full"

**Solution**:

```
# Clean build artifacts
gn clean out/Debug

# Or remove entire output directory
rm -rf out/Debug
```

---

### Build Fails with "Missing Dependencies"

**Solution**:

```
# Re-sync dependencies
gclient sync --force

# If still failing, clean and re-sync
rm -rf src
gclient sync
```

---

### Incremental Build Not Working

**Solution**:

```
# Force rebuild
gn clean out/Debug
autoninja -C out/Debug toubkal
```

---

### "ninja: error: loading 'build.ninja': No such file or directory"

**Solution**:

```
# Regenerate build files
gn gen out/Debug
```

---

### Build Too Slow

**Solutions**:

1. **Use component build** (faster incremental builds)
2. **Reduce parallel jobs** (`ninja -j4` if running out of RAM)
3. **Use ccache** (caches compiled objects):
   ```
   gn args out/Debug
   # Add: use_ccache = true
   ```

---

## See Also

- **[CODING-RULES.md](../../CODING-RULES.md)** - Critical coding rules
- **[Code Style Guide](code-style.md)** - Language-specific coding patterns
- **[Testing Strategy](testing-strategy.md)** - Running tests after build
- **[Architecture Overview](../architecture/ARCHITECTURE-OVERVIEW.md)** - System architecture and build system details
- **[PRD](../TOUBKAL-PRD.md)** - Build system requirements (GN + Siso with Ninja fallback)
- **[Product Roadmap](../PRODUCT-ROADMAP.md)** - Phase 1 build milestones
- **[Chromium Build Documentation](https://chromium.googlesource.com/chromium/src/+/main/docs/linux/build_instructions.md)** - Official Chromium guide

---

**Last Updated**: 2025-10-18
**Questions?** Email: dev@toubkal.app
