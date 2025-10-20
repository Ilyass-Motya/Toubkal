# Chromium Build System Reference

**Last Updated:** 2025-10-20
**Status:** ✅ Verified and Operational
**Build Verification:** 4,175 files compiled successfully

---

## System Overview

Toubkal Browser uses Chromium's GN + Ninja build system to compile the browser from source. This document provides paths, commands, and reference information for the build system.

---

## Chromium Source Location

### Primary Paths

| Component | Path | Status |
|-----------|------|--------|
| **Source Root** | `C:\chromium\src\` | ✅ Verified |
| **GN Build Generator** | `C:\chromium\src\buildtools\win\gn.exe` | ✅ Version 2287 |
| **Ninja Build Tool** | `C:\chromium\src\third_party\ninja\ninja.exe` | ✅ Operational |
| **Build Output** | `C:\chromium\src\out\Default\` | ✅ Created |
| **Configuration File** | `C:\chromium\src\.gn` | ✅ Present |

### Verification Status (2025-10-20)

- ✅ **GN Generation:** 28,110 targets from 4,300 files (15.8 seconds)
- ✅ **Ninja Compilation:** 4,175 files compiled successfully
- ✅ **Test Binary:** `base_unittests.exe` linked successfully
- ✅ **Debug Symbols:** `base_unittests.exe.pdb` generated

---

## Build Commands

### Basic Build Workflow

```powershell
# 1. Navigate to Chromium source directory
cd C:\chromium\src

# 2. Generate build configuration with GN
.\buildtools\win\gn.exe gen out\Default --args="is_debug=true is_component_build=true"

# 3. Build a specific target with Ninja
.\third_party\ninja\ninja.exe -C out\Default <target_name>
```

### Common Build Targets

#### Quick Verification (5-15 minutes)
```powershell
cd C:\chromium\src
.\buildtools\win\gn.exe gen out\Default --args="is_debug=true is_component_build=true"
.\third_party\ninja\ninja.exe -C out\Default base_unittests
```

#### Full Chrome Browser (1-3 hours, ~40GB)
```powershell
cd C:\chromium\src
.\buildtools\win\gn.exe gen out\Default --args="is_debug=true is_component_build=true"
.\third_party\ninja\ninja.exe -C out\Default chrome
```

#### Toubkal Browser Components (Future)
```powershell
cd C:\chromium\src
.\buildtools\win\gn.exe gen out\Toubkal --args="is_debug=true is_component_build=true"
.\third_party\ninja\ninja.exe -C out\Toubkal toubkal_browser
```

---

## Build Configuration (GN Args)

### Debug Build (Recommended for Development)
```gn
is_debug = true              # Enable debug symbols and assertions
is_component_build = true    # Faster incremental builds
```

### Release Build (Production)
```gn
is_debug = false
is_official_build = true
is_component_build = false
```

### Custom Configuration
```powershell
# Generate with custom args
.\buildtools\win\gn.exe gen out\Custom --args="is_debug=true enable_nacl=false"

# Edit args interactively
.\buildtools\win\gn.exe args out\Custom --list
```

---

## Build Output Structure

```
C:\chromium\src\out\Default\
├── base_unittests.exe          # Test binary (verified ✅)
├── base_unittests.exe.pdb      # Debug symbols (verified ✅)
├── chrome.exe                  # Full Chrome browser (if built)
├── obj/                        # Intermediate object files
├── gen/                        # Generated source files
└── args.gn                     # Build configuration
```

---

## GN (Generate Ninja) Reference

### GN Binary
- **Location:** `C:\chromium\src\buildtools\win\gn.exe`
- **Version:** 2287 (07d3c6f4dc29)
- **Size:** 2,421,760 bytes (2.4 MB)
- **Last Modified:** 2025-10-20 19:17:19

### Common GN Commands

```powershell
# Generate build files
.\buildtools\win\gn.exe gen out\Default

# Generate with arguments
.\buildtools\win\gn.exe gen out\Default --args="is_debug=true"

# List all arguments
.\buildtools\win\gn.exe args out\Default --list

# Check build configuration
.\buildtools\win\gn.exe check out\Default

# Describe a target
.\buildtools\win\gn.exe desc out\Default chrome

# Show dependency tree
.\buildtools\win\gn.exe desc out\Default chrome --tree
```

---

## Ninja Reference

### Ninja Binary
- **Location:** `C:\chromium\src\third_party\ninja\ninja.exe`
- **Status:** ✅ Operational
- **Verified Build:** 4,175 files compiled successfully

### Common Ninja Commands

```powershell
# Build a specific target
.\third_party\ninja\ninja.exe -C out\Default <target>

# Build with N parallel jobs
.\third_party\ninja\ninja.exe -C out\Default -j8 chrome

# Dry run (show what would be built)
.\third_party\ninja\ninja.exe -C out\Default -n chrome

# Show build statistics
.\third_party\ninja\ninja.exe -C out\Default -d stats chrome

# Clean build outputs
.\third_party\ninja\ninja.exe -C out\Default -t clean

# List all targets
.\third_party\ninja\ninja.exe -C out\Default -t targets all
```

---

## Troubleshooting

### Common Issues

#### "ERROR Can't find source root"
**Solution:** Ensure you're in `C:\chromium\src` directory
```powershell
cd C:\chromium\src
if (Test-Path ".\.gn") {
    Write-Host "✅ Correct directory"
} else {
    Write-Host "❌ Wrong directory - navigate to C:\chromium\src"
}
```

#### "gn: command not found"
**Solution:** Use full path to GN executable
```powershell
# Correct
.\buildtools\win\gn.exe gen out\Default

# Incorrect
gn gen out\Default
```

#### Build Failures
**Solution:** Clean and rebuild
```powershell
# Clean build outputs
.\third_party\ninja\ninja.exe -C out\Default -t clean

# Regenerate build files
.\buildtools\win\gn.exe gen out\Default

# Rebuild
.\third_party\ninja\ninja.exe -C out\Default base_unittests
```

---

## Development Workflow

### Initial Setup (One-time)
```powershell
# 1. Clone Chromium (already done ✅)
cd C:\chromium\src

# 2. Verify tools
.\buildtools\win\gn.exe --version
if (Test-Path ".\third_party\ninja\ninja.exe") {
    Write-Host "✅ Ninja found"
}

# 3. Generate initial build
.\buildtools\win\gn.exe gen out\Default --args="is_debug=true is_component_build=true"

# 4. Test build system
.\third_party\ninja\ninja.exe -C out\Default base_unittests
```

### Daily Development Workflow
```powershell
# 1. Navigate to source
cd C:\chromium\src

# 2. Make code changes in your editor
# (Modify files in src/toubkal/ or src/chromium/)

# 3. Rebuild changed components
.\third_party\ninja\ninja.exe -C out\Default toubkal_browser

# 4. Run tests
.\third_party\ninja\ninja.exe -C out\Default toubkal_tests
.\out\Default\toubkal_tests.exe

# 5. Test in browser
.\out\Default\chrome.exe
```

---

## Toubkal-Specific Build Targets (Future)

Once Toubkal Browser components are integrated, you'll use these targets:

```powershell
# Toubkal components
.\third_party\ninja\ninja.exe -C out\Default toubkal_components

# Toubkal privacy features
.\third_party\ninja\ninja.exe -C out\Default toubkal_privacy

# Toubkal AI platform
.\third_party\ninja\ninja.exe -C out\Default toubkal_ai_platform

# Toubkal MCP integration
.\third_party\ninja\ninja.exe -C out\Default toubkal_mcp

# Full Toubkal browser
.\third_party\ninja\ninja.exe -C out\Default toubkal_browser
```

---

## Performance Tips

### Faster Builds
1. **Use Component Builds:** `is_component_build=true` (faster linking)
2. **Increase Parallelism:** `-j8` or `-j16` based on CPU cores
3. **Use ccache:** Cache compiled objects (requires setup)
4. **Incremental Builds:** Only modified files are rebuilt

### Example: Fast Incremental Build
```powershell
# Generate with component build (one-time)
.\buildtools\win\gn.exe gen out\Fast --args="is_debug=true is_component_build=true"

# Build with maximum parallelism
.\third_party\ninja\ninja.exe -C out\Fast -j16 chrome

# Subsequent builds are much faster (minutes instead of hours)
.\third_party\ninja\ninja.exe -C out\Fast -j16 chrome
```

---

## Build System Architecture

### How GN Works
1. Reads `.gn` file to find build root
2. Parses `BUILD.gn` files throughout source tree
3. Generates Ninja build files in `out/<config>/`
4. Ninja uses generated `.ninja` files to build

### Build File Hierarchy
```
C:\chromium\src\
├── .gn                          # Root config (defines buildconfig)
├── BUILD.gn                     # Root build file
├── build/
│   └── config/
│       └── BUILDCONFIG.gn       # Default build configuration
├── chrome/
│   └── BUILD.gn                 # Chrome-specific builds
├── content/
│   └── BUILD.gn                 # Content layer builds
└── toubkal/ (future)
    └── BUILD.gn                 # Toubkal browser builds
```

---

## References

### Official Documentation
- **Chromium Build Docs:** https://chromium.googlesource.com/chromium/src/+/main/docs/windows_build_instructions.md
- **GN Reference:** https://gn.googlesource.com/gn/+/main/docs/reference.md
- **Ninja Manual:** https://ninja-build.org/manual.html

### Toubkal Documentation
- **Architecture Overview:** `docs/architecture/ARCHITECTURE-OVERVIEW.md`
- **Development Roadmap:** `docs/PRODUCT-ROADMAP.md`
- **Workflow Status:** `docs/bmm-workflow-status.md`

### Build Verification
- **Date:** 2025-10-20
- **GN Version:** 2287
- **Ninja Build:** ✅ 4,175 files compiled
- **Test Binary:** ✅ `base_unittests.exe` created
- **Status:** 100% Operational

---

## Quick Reference Card

| Task | Command |
|------|---------|
| **Navigate to source** | `cd C:\chromium\src` |
| **Generate build** | `.\buildtools\win\gn.exe gen out\Default` |
| **Build test target** | `.\third_party\ninja\ninja.exe -C out\Default base_unittests` |
| **Build Chrome** | `.\third_party\ninja\ninja.exe -C out\Default chrome` |
| **Clean build** | `.\third_party\ninja\ninja.exe -C out\Default -t clean` |
| **List targets** | `.\third_party\ninja\ninja.exe -C out\Default -t targets all` |
| **Check GN version** | `.\buildtools\win\gn.exe --version` |

---

**Build System Status:** ✅ FULLY OPERATIONAL
**Last Verified:** 2025-10-20
**Ready for:** Toubkal Browser C++ Development
