# Chromium Fork Setup Guide

This guide provides comprehensive instructions for setting up a Toubkal Browser development environment with a synchronized Chromium fork.

## Project Paths

**Important**: These are the specific paths used in the Toubkal Browser project:

- **Project Root**: `C:\ToubkalBrowser`
- **Depot Tools**: `C:\depot_tools`
- **Chromium Fork**: `C:\chromium`
- **GitHub Repository**: https://github.com/Ilyass-Motya/Toubkal.git

## Prerequisites

### System Requirements

- **Operating System**: Linux (Ubuntu 20.04+), macOS (10.15+), or Windows 10/11
- **RAM**: Minimum 16GB (32GB recommended for faster builds)
- **Storage**: At least 100GB free space (SSD recommended)
- **CPU**: Multi-core processor (8+ cores recommended)

### Required Software

#### All Platforms
- **Git**: Version 2.25+ with LFS support
- **Python**: Version 3.8+ (3.9+ recommended)
- **Node.js**: Version 18+ (for frontend development)
- **pnpm**: Package manager for Node.js dependencies

#### Linux (Ubuntu/Debian)
```bash
# Install build dependencies
sudo apt-get update
sudo apt-get install -y \
  git python3 python3-pip python3-venv \
  build-essential libnss3-dev libatk-bridge2.0-dev \
  libdrm2 libxcomposite1 libxdamage1 libxrandr2 \
  libgbm1 libxss1 libasound2-dev libxrandr2 \
  libxss1 libgconf-2-4 libxrandr2 libxss1 \
  libasound2-dev libxrandr2 libxss1 libgconf-2-4

# Install depot_tools
git clone https://chromium.googlesource.com/chromium/tools/depot_tools.git
export PATH="$PATH:$(pwd)/depot_tools"
echo 'export PATH="$PATH:$(pwd)/depot_tools"' >> ~/.bashrc
```

## macOS
```bash
# Install Xcode Command Line Tools
xcode-select --install

# Install Homebrew (if not already installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install build dependencies
brew install python@3.9 git node pnpm

# Install depot_tools
git clone https://chromium.googlesource.com/chromium/tools/depot_tools.git
export PATH="$PATH:$(pwd)/depot_tools"
echo 'export PATH="$PATH:$(pwd)/depot_tools"' >> ~/.zshrc
```

## Windows
```powershell
# Install Chocolatey (if not already installed)
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install build dependencies
choco install -y git python nodejs pnpm

# Install depot_tools to C:\depot_tools
git clone https://chromium.googlesource.com/chromium/tools/depot_tools.git C:\depot_tools
$env:PATH += ";C:\depot_tools"
[Environment]::SetEnvironmentVariable("PATH", $env:PATH, [EnvironmentVariableTarget]::User)
```

## Repository Setup

### 1. Clone Toubkal Browser Repository

```bash
# Clone the repository to C:\ToubkalBrowser
git clone https://github.com/Ilyass-Motya/Toubkal.git C:\ToubkalBrowser
cd C:\ToubkalBrowser

# Initialize submodules (if any)
git submodule update --init --recursive
```

## 2. Configure Chromium Synchronization

### Create .gclient Configuration

Copy the provided `.gclient.template` to `.gclient`:

```bash
cp .gclient.template .gclient
```

The `.gclient` file configures the Chromium source synchronization. Key features:
- **Target OS**: Automatically detects your platform
- **Target CPU**: Optimized for your architecture
- **Sync Hooks**: Custom Toubkal Browser integration points
- **Dependency Management**: Handles Chromium dependencies

#### Customize Build Arguments

Copy the provided `args.gn.template` to `args.gn`:

```bash
cp args.gn.template args.gn
```

Edit `args.gn` to customize your build:
- **Debug vs Release**: Toggle `is_debug` flag
- **Target Platform**: Set `target_os` and `target_cpu`
- **Feature Flags**: Enable/disable specific Toubkal features
- **Optimization**: Configure compiler optimizations

### 3. Synchronize Chromium Source

#### Initial Sync

```bash
# Run the setup script (platform-specific)
# Linux/macOS:
./scripts/setup-build.sh

# Windows:
.\scripts\setup-build.bat
```

This will:
1. Initialize the gclient workspace
2. Download and sync Chromium source code (~50GB)
3. Apply Toubkal Browser patches
4. Set up the build environment
5. Verify the setup integrity

## Manual Sync (if needed)

```bash
# Navigate to the src directory
cd src

# Sync Chromium source
gclient sync

# Apply Toubkal patches
gclient runhooks
```

## 4. Verify Setup

### Check Sync Integrity

```bash
# Verify Chromium source is complete
cd src
git status

# Check for any sync errors
gclient status

# Verify build dependencies
gn gen out/Default --args="$(cat ../../args.gn)"
```

## Test Build System

```bash
# Run a test build
./scripts/build.sh --target=Default --test

# Check build artifacts
ls -la out/Default/
```

## Build Configuration

### GN Build Arguments

The `args.gn` file controls the build configuration. Key settings:

```gn
# Build type
is_debug = true          # Debug build (false for release)
is_official_build = false # Official build flag

# Target platform
target_os = "linux"      # "linux", "mac", "win"
target_cpu = "x64"       # "x64", "arm64", "arm"

# Toubkal-specific features
enable_toubkal_ai = true
enable_toubkal_privacy = true
enable_toubkal_audit = true

# Performance optimizations
use_goma = true          # Distributed compilation
use_sccache = true       # Compilation caching
```

## Build Targets

Available build targets:

- **Default**: Standard browser build
- **Debug**: Debug build with symbols
- **Release**: Optimized release build
- **Test**: Build with test framework
- **Package**: Create distributable packages

## Development Workflow

### Daily Development

1. **Start Development Session**:
   ```bash
   cd toubkal-browser
   ./scripts/setup-build.sh --quick
   ```

2. **Make Code Changes**:
   - Edit source files in `src/`
   - Modify Toubkal-specific code in `src/toubkal/`
   - Update build configuration as needed

3. **Build and Test**:
   ```bash
   ./scripts/build.sh --target=Default
   ./scripts/build.sh --test
   ```

4. **Sync Updates** (daily):
   ```bash
   gclient sync
   ```

### Code Synchronization

#### Updating Chromium Base

```bash
# Check for Chromium updates
gclient sync --nohooks

# Review changes
git log --oneline HEAD~10..HEAD

# Apply Toubkal patches
gclient runhooks

# Test build
./scripts/build.sh --target=Default
```

## Handling Merge Conflicts

When Chromium updates conflict with Toubkal changes:

1. **Identify Conflicts**:
   ```bash
   gclient status
   ```

2. **Resolve Conflicts**:
   ```bash
   # Edit conflicted files
   git mergetool

   # Test resolution
   ./scripts/build.sh --target=Default
   ```

3. **Update Patches**:
   ```bash
   # Regenerate patch files
   gclient runhooks
   ```

## Troubleshooting

### Common Issues

#### Sync Failures

**Problem**: `gclient sync` fails with network errors
**Solution**:
```bash
# Retry with different approach
gclient sync --force
# Or
gclient sync --jobs=1
```

## Build Failures

**Problem**: Build fails with missing dependencies
**Solution**:
```bash
# Reinstall dependencies
./scripts/setup-build.sh --clean
```

## Permission Issues

**Problem**: Permission denied errors on Linux/macOS
**Solution**:
```bash
# Fix permissions
sudo chown -R $(whoami) .
chmod +x scripts/*.sh
```

## Network Monitoring

### Verify Zero Unsanctioned Requests

```bash
# Monitor network during build (Linux/macOS)
sudo tcpdump -i any -w build-traffic.pcap &
./scripts/build.sh --target=Default
sudo pkill tcpdump

# Analyze captured traffic
tcpdump -r build-traffic.pcap | grep -v "allowed-domains"
```

## Allowed Network Endpoints

The build system is configured to only access:
- `chromium.googlesource.com` - Chromium source code
- `storage.googleapis.com` - Build artifacts
- `commondatastorage.googleapis.com` - Common data
- `dl.google.com` - Google tools and dependencies

## CI/CD Integration

### GitHub Actions

The repository includes GitHub Actions workflows for:
- **Build Verification**: Automated builds on PRs
- **Cross-Platform Testing**: Linux, macOS, Windows
- **Release Building**: Automated release builds
- **Security Scanning**: Dependency and code scanning

### Local CI Testing

```bash
# Test CI pipeline locally
./scripts/ci-test.sh

# Run specific CI job
./scripts/ci-test.sh --job=build-linux
```

## Security Considerations

### Privacy-First Build

- **No Telemetry**: All telemetry disabled in build
- **No Crash Reporting**: Crash reporting disabled
- **No Usage Statistics**: Usage tracking disabled
- **Network Monitoring**: All network requests logged and verified

### Build Integrity

- **Deterministic Builds**: Reproducible across platforms
- **Dependency Verification**: All dependencies verified
- **Source Integrity**: Chromium source verified via git
- **Artifact Signing**: Build artifacts cryptographically signed

## Performance Optimization

### Build Speed

- **Parallel Compilation**: Use all available CPU cores
- **Incremental Builds**: Only rebuild changed components
- **Caching**: Use ccache/sccache for compilation caching
- **Distributed Builds**: Use goma for distributed compilation

### Memory Usage

- **Build Targets**: Build only necessary components
- **Clean Builds**: Regular clean builds to free memory
- **Resource Monitoring**: Monitor system resources during builds

## Support and Resources

### Documentation

- [Chromium Build Documentation](https://chromium.googlesource.com/chromium/src/+/main/docs/linux_build_instructions.md)
- [GN Build System](https://gn.googlesource.com/gn/+/main/docs/)
- [Toubkal Browser Architecture](docs/architecture/)

### Community

- **Issues**: [GitHub Issues](https://github.com/your-org/toubkal-browser/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/toubkal-browser/discussions)
- **Discord**: [Toubkal Browser Discord](https://discord.gg/toubkal-browser)

### Getting Help

1. **Check Documentation**: Review this guide and linked resources
2. **Search Issues**: Look for similar issues in GitHub
3. **Create Issue**: Provide detailed information about your problem
4. **Join Discord**: Get real-time help from the community

## Changelog

- **v1.0.0**: Initial setup guide
- **v1.1.0**: Added Windows support
- **v1.2.0**: Added CI/CD integration
- **v1.3.0**: Added security considerations
- **v1.4.0**: Added performance optimization

---

**Last Updated**: 2024-01-15
**Maintainer**: Toubkal Browser Team
**Version**: 1.4.0
