# ADR-005: Build System (GN + Siso + Ninja)

**Status**: Accepted
**Date**: 2025-10-18
**Deciders**: Ilyass Motya, Engineering Team
**Technical Story**: [Story 1.0: Repository Setup & Build System](../stories/phase1-week1-2/story-000-repository-setup.md)

---

## Context

Toubkal Browser requires a robust, scalable build system capable of compiling a Chromium-based browser with advanced privacy features, AI integration, and MCP server capabilities. The build system must support cross-platform development (Linux, macOS, Windows), modular feature organization, and integration with modern development workflows while maintaining compatibility with Chromium's proven infrastructure.

**Problem**: Browser projects need sophisticated build systems to manage thousands of source files, complex dependencies, and platform-specific optimizations. Toubkal's unique combination of privacy features, AI capabilities, and MCP integration requires build system flexibility beyond standard Chromium configurations.

**Requirements**:
- Support Chromium's GN + Siso build system architecture
- Enable modular feature organization (privacy, AI, MCP, UI)
- Provide cross-platform build capabilities (Linux, macOS, Windows)
- Integrate React/TypeScript UI compilation with GN
- Support reproducible builds for supply chain security
- Enable fast incremental builds for development velocity
- Facilitate automated testing and continuous integration

**Constraints**:
- Must integrate with Chromium's existing GN build infrastructure
- Cannot break upstream Chromium compatibility
- Performance critical: full builds should complete in reasonable time
- Storage critical: build artifacts should be manageable
- Cross-platform compatibility required for all major desktop OSes

---

## Decision Drivers

- **Scalability** (Critical) - Handle Chromium's codebase size and complexity
- **Developer Experience** (High) - Fast incremental builds, clear error messages
- **Cross-Platform** (High) - Consistent builds across all target platforms
- **Modularity** (High) - Support feature-first organization for AI/privacy/MCP
- **Integration** (Medium) - Work with CI/CD, testing, and deployment systems
- **Maintainability** (Medium) - Easy to understand, modify, and extend

---

## Considered Options

### Summary Table

| Option | Scalability | Dev Experience | Cross-Platform | Modularity | Integration | Verdict |
|--------|-------------|----------------|----------------|------------|-------------|---------|
| Option 1: GN + Siso + Ninja | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ **Chosen** |
| Option 2: Bazel | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ❌ Rejected |
| Option 3: CMake + Ninja | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ❌ Rejected |
| Option 4: Pure Ninja | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ❌ Rejected |

---

### Option 1: GN + Siso + Ninja (Chromium's Build Stack)

**Description**: Adopt Chromium's proven GN meta-build system with Siso distributed compiler and Ninja backend, enhanced with Toubkal-specific configurations and modular build targets.

**Pros**:
- ✅ **Proven at Scale**: Successfully builds Chromium (30M+ lines of code)
- ✅ **Distributed Compilation**: Siso enables fast, distributed builds across teams
- ✅ **Cross-Platform Excellence**: Native support for Linux, macOS, Windows, Android
- ✅ **Modular Architecture**: GN templates enable feature-first organization
- ✅ **Incremental Builds**: Ninja provides sub-second rebuilds for development
- ✅ **Rich Tooling**: Extensive debugging, profiling, and analysis tools
- ✅ **CI/CD Integration**: Mature integration with automated build systems
- ✅ **Reproducible Builds**: Deterministic builds with proper configuration
- ✅ **Supply Chain Ready**: Integrates with SLSA and other security frameworks

**Cons**:
- ❌ **Learning Curve**: GN syntax and concepts require training
- ❌ **Build Configuration Complexity**: Extensive args.gn configuration needed
- ❌ **Storage Requirements**: Large build artifacts and intermediate files

**Verdict**: ✅ **Chosen** - Only option proven to scale to Chromium's complexity while supporting Toubkal's requirements

---

### Option 2: Bazel

**Description**: Use Google's Bazel build system, known for scalability and hermetic builds.

**Pros**:
- ✅ **Hermetic Builds**: Perfect isolation prevents build environment issues
- ✅ **Scalability**: Handles massive codebases with distributed caching
- ✅ **Cross-Platform**: Excellent multi-platform support
- ✅ **Modern Features**: Advanced dependency management and testing integration

**Cons**:
- ❌ **Chromium Incompatibility**: Would require complete rewrite of Chromium's build system
- ❌ **Migration Cost**: Massive effort to port existing Chromium infrastructure
- ❌ **Team Familiarity**: GN is Chromium standard, Bazel is different paradigm
- ❌ **Upstream Divergence**: Cannot benefit from Chromium's build system improvements

**Verdict**: ❌ **Rejected** - Too disruptive for Chromium-based project

---

### Option 3: CMake + Ninja

**Description**: Use CMake as meta-build system with Ninja as backend.

**Pros**:
- ✅ **Familiar Syntax**: Widely known build system syntax
- ✅ **Cross-Platform**: Excellent platform support
- ✅ **Fast Builds**: Ninja backend provides good performance
- ✅ **Flexible Configuration**: Easy to customize for different needs

**Cons**:
- ❌ **Scalability Issues**: Not proven at Chromium's scale (30M+ lines)
- ❌ **Build Time**: Slower than GN + Siso for large projects
- ❌ **Chromium Integration**: Would lose access to Chromium's build optimizations
- ❌ **Maintenance Burden**: Custom build system maintenance vs. using proven solution

**Verdict**: ❌ **Rejected** - Insufficient scalability for browser project

---

### Option 4: Pure Ninja

**Description**: Use Ninja build system directly with manually written build files.

**Pros**:
- ✅ **Maximum Performance**: Direct Ninja usage minimizes overhead
- ✅ **Simple Maintenance**: No meta-build system complexity
- ✅ **Full Control**: Complete control over build process

**Cons**:
- ❌ **Maintenance Nightmare**: Manual maintenance of thousands of build rules
- ❌ **Error-Prone**: Easy to introduce build errors without meta-build validation
- ❌ **Cross-Platform Issues**: Platform-specific logic becomes complex
- ❌ **No Abstraction**: No high-level build target organization
- ❌ **Reproducibility Issues**: Hard to ensure consistent builds across environments

**Verdict**: ❌ **Rejected** - Too low-level for complex browser project

---

## Decision Outcome

**Chosen Option**: **Option 1 - GN + Siso + Ninja (Chromium's Build Stack)**

**Rationale**:
1. **Proven Chromium Compatibility**: GN + Siso is the only build system that can handle Chromium's complexity
2. **Scalability Guarantee**: Successfully builds 30M+ lines of code with thousands of dependencies
3. **Developer Productivity**: Siso distributed compilation + Ninja incremental builds = fast iteration
4. **Cross-Platform Excellence**: Native support for all target platforms (Linux, macOS, Windows)
5. **Modular Architecture**: GN templates enable Toubkal's feature-first organization
6. **Future-Proof**: Benefits from ongoing Chromium build system improvements
7. **Supply Chain Ready**: Integrates perfectly with SLSA reproducible builds

---

## Consequences

### Positive Consequences
- ✅ **Scalable Builds**: Handle Chromium's massive codebase with confidence
- ✅ **Fast Development**: Incremental builds enable rapid iteration during MVP phases
- ✅ **Cross-Platform Consistency**: Identical build process across all supported platforms
- ✅ **Modular Organization**: Clean separation of privacy, AI, MCP, and UI components
- ✅ **CI/CD Ready**: Mature integration with automated build and test systems
- ✅ **Security Integration**: Built-in support for reproducible builds and supply chain security

### Negative Consequences
- ❌ **Configuration Complexity**: Extensive args.gn configuration required for different build types
- ❌ **Learning Investment**: Team must learn GN syntax and Chromium build patterns
- ❌ **Storage Overhead**: Large build directories and intermediate artifacts
- ❌ **Debugging Challenges**: Build system debugging can be complex

### Neutral Consequences
- 🔹 **Build Infrastructure**: Requires dedicated build machines with sufficient resources
- 🔹 **Documentation**: Comprehensive build documentation essential for onboarding
- 🔹 **Tooling Investment**: Custom GN templates and build tools development needed

### Build System Architecture

**GN Meta-Build System**:
- Declarative build configuration with Python-like syntax
- Template system for reusable build rules
- Dependency graph analysis and optimization
- Cross-platform abstraction layer

**Siso Distributed Compiler**:
- Remote execution of compilation tasks
- Shared compilation cache across team members
- Bandwidth-efficient artifact distribution
- Automatic fallback to local compilation

**Ninja Build Backend**:
- High-performance build execution
- Precise dependency tracking
- Parallel job execution
- Minimal rebuilds on source changes

---

## Implementation

### Timeline
- **Phase 1, Week 5-6**: GN + Siso configuration and cross-platform testing
- **Phase 1, Week 7-8**: Modular build targets for privacy/AI/MCP features
- **Phase 1, Week 9-10**: React/TypeScript UI integration with GN
- **Phase 1, Week 11-12**: Reproducible builds and supply chain integration

### File Locations
```
/src/toubkal/
├── BUILD.gn                          # Root GN build file
├── .gn                               # GN configuration
├── args.gn.template                  # Build configuration template
├── build/
│   ├── config/                       # GN build configuration
│   ├── templates/                    # Custom GN templates
│   └── scripts/                      # Build scripts
├── browser/                          # Browser-specific components
│   ├── privacy/BUILD.gn             # Privacy features
│   ├── ai/BUILD.gn                  # AI integration
│   ├── mcp/BUILD.gn                 # MCP server
│   └── ui/BUILD.gn                  # Internal UI
├── common/BUILD.gn                  # Shared components
├── tools/
│   ├── gn/                          # GN bootstrap and tools
│   └── siso/                        # Siso configuration
└── app/BUILD.gn                     # React/TypeScript UI
```

### Key Classes/Functions

**GN Build Configuration** (`args.gn.template`):
```python
# Toubkal-specific build configuration
enable_toubkal_ai = true
enable_toubkal_privacy = true
enable_toubkal_audit = true
enable_toubkal_mcp = true
enable_toubkal_consent = true
enable_toubkal_brand = true

# Privacy and security defaults
disable_telemetry = true
disable_crash_reporting = true
disable_usage_statistics = true
disable_google_services = true
disable_third_party_telemetry = true

# Build optimization
use_lld = true
use_lto = true
use_thin_lto = true
enable_parallel_builds = true

# Testing and validation
enable_unit_tests = true
enable_integration_tests = true
enable_security_tests = true
enable_test_coverage = true
```

**Modular Build Target** (`browser/privacy/BUILD.gn`):
```python
import("//build/config/features.gni")
import("//mojo/public/tools/bindings/mojom.gni")

# Mojo interface generation
mojom("privacy") {
  sources = [ "//toubkal/common/privacy.mojom" ]
  public_deps = [ "//mojo/public/mojom/base" ]
}

# Privacy manager component
source_set("privacy_manager") {
  sources = [
    "privacy_manager.cc",
    "privacy_manager.h",
  ]

  deps = [
    ":fingerprinting_protection",
    ":tracker_blocker",
    ":brave_shields_manager",
    "//base",
    "//crypto",
    "//mojo/public/cpp/bindings",
    "//net/base",
    "//toubkal/common/privacy",
  ]

  public_deps = [
    "//toubkal/common/privacy",
  ]
}

# Main privacy module
source_set("privacy") {
  deps = [
    ":privacy_manager",
    ":fingerprinting_protection",
    ":tracker_blocker",
    ":brave_shields_manager",
  ]

  public_deps = [
    "//toubkal/common/privacy",
  ]
}
```

**React UI Integration** (`app/BUILD.gn`):
```python
import("//build/config/features.gni")

# React/TypeScript UI build action
action("build_ui") {
  script = "//toubkal/tools/build_ui.py"

  inputs = [
    "package.json",
    "tsconfig.json",
    "vite.config.ts",
    "src/",
  ]

  outputs = [
    "$target_gen_dir/built/settings.js",
    "$target_gen_dir/built/privacy_dashboard.js",
    "$target_gen_dir/built/ai_management.js",
    "$target_gen_dir/built/mcp_store.js",
  ]

  args = [
    "--config", rebase_path("vite.config.ts", root_build_dir),
    "--outdir", rebase_path("$target_gen_dir/built", root_build_dir),
  ]

  deps = [
    "//toubkal/mojo/public:interfaces",
  ]
}
```

**Cross-Platform Build Script** (`tools/build.sh`):
```bash
#!/bin/bash
# Cross-platform Toubkal build script

set -e

# Detect platform
case "$(uname -s)" in
    Linux*)     platform=linux;;
    Darwin*)    platform=mac;;
    CYGWIN*|MINGW32*|MSYS*|MINGW*) platform=win;;
    *)          echo "Unsupported platform"; exit 1;;
esac

# Set platform-specific variables
case "$platform" in
    linux)
        export CC=clang
        export CXX=clang++
        export AR=llvm-ar
        export NM=llvm-nm
        ;;
    mac)
        export CC=clang
        export CXX=clang++
        # Use system compiler on macOS
        ;;
    win)
        export CC=clang-cl
        export CXX=clang-cl
        export AR=llvm-lib
        ;;
esac

# Configure build
gn gen out/Release --args="
target_os=\"$platform\"
target_cpu=\"x64\"
is_official_build=true
enable_toubkal_ai=true
enable_toubkal_privacy=true
enable_toubkal_audit=true
enable_toubkal_mcp=true
enable_toubkal_consent=true
enable_toubkal_brand=true
disable_telemetry=true
disable_crash_reporting=true
disable_usage_statistics=true
disable_google_services=true
use_lld=true
use_lto=true
enable_parallel_builds=true
"

# Build with Ninja
ninja -C out/Release toubkal
```

## Dependencies
- **GN**: Meta-build system (part of Chromium depot_tools)
- **Ninja**: Build execution backend
- **Siso**: Distributed compilation system (Google internal, open-source alternative available)
- **Clang/LLVM**: Cross-platform compiler toolchain
- **lld**: Fast linker for optimized builds
- **Vite**: React/TypeScript build integration
- **Python**: GN scripting and build automation

---

## Validation

### How to Verify This Decision

**Manual Tests**:
1. Full build on clean environment: `gn gen out/Release && ninja -C out/Release toubkal`
2. Incremental build verification: Modify one file, verify only affected targets rebuild
3. Cross-platform consistency: Compare build artifacts across Linux/macOS/Windows
4. Feature toggle verification: Build with different Toubkal feature combinations

**Automated Tests**:
```bash
# Build system validation
./tools/validate_build.py --check-gn-config
./tools/validate_build.py --check-dependencies
./tools/validate_build.py --check-cross-platform

# Build performance testing
time ninja -C out/Release toubkal
# Expected: <30 minutes for full build on modern hardware

# GN configuration validation
./tools/validate_gn.py --check-args-template
./tools/validate_gn.py --check-target-dependencies
./tools/validate_gn.py --check-circular-dependencies

# Reproducible build verification
./tools/verify_reproducible_build.sh
# Expected: Identical checksums across build environments
```

**Integration Tests**:
```python
# Build system integration test
def test_modular_builds():
    # Test that privacy module builds independently
    assert gn_build_target("toubkal/browser/privacy")
    assert gn_build_target("toubkal/browser/ai")
    assert gn_build_target("toubkal/browser/mcp")

    # Test that main build includes all modules
    assert gn_build_target("toubkal")
    assert file_exists("out/Release/toubkal")

def test_cross_platform_consistency():
    # Build on multiple platforms
    linux_checksum = build_and_checksum("linux")
    mac_checksum = build_and_checksum("mac")
    win_checksum = build_and_checksum("win")

    # All checksums should be identical for reproducible builds
    assert linux_checksum == mac_checksum == win_checksum
```

**Performance Tests**:
```bash
# Incremental build performance
touch src/toubkal/browser/privacy/privacy_manager.cc
time ninja -C out/Release toubkal
# Expected: <10 seconds for incremental rebuild

# Clean build performance
rm -rf out/Release
time gn gen out/Release && ninja -C out/Release toubkal
# Expected: <30 minutes on 8-core machine with SSD

# Memory usage validation
/usr/bin/time -v ninja -C out/Release toubkal
# Expected: <16GB RAM usage
```

**Metrics**:
- **Build Time**: Full release build <30 minutes on modern hardware
- **Incremental Build**: Source file change rebuilds in <10 seconds
- **Cross-Platform Consistency**: 100% reproducible builds across supported platforms
- **Storage Usage**: Build directory <50GB for full Chromium + Toubkal build
- **Success Rate**: >99% successful builds in CI/CD pipeline
- **Memory Usage**: <16GB peak RAM usage during builds

---

## Related ADRs

- [ADR-006: Supply Chain Security](ADR-006-supply-chain.md) - GN + Siso provides foundation for reproducible builds
- [ADR-001: UI Framework](ADR-001-ui-framework.md) - GN integrates React/TypeScript UI compilation
- [ADR-003: IPC Framework](ADR-003-ipc-framework.md) - GN builds Mojo interfaces for browser ↔ UI communication

---

## Related Epics

This ADR is implemented by the following epics:

- **[Epic 1.1: GN Build System & Cross-Platform Builds](../epics/epic-1.1-gn-build-system.md)** (Week 5-6)
  - Implements root BUILD.gn configuration with modular targets
  - Sets up Siso distributed compilation
  - Integrates Vite build system for React UI compilation
  - Establishes cross-platform build verification (Linux, macOS, Windows)

- **[Epic 1.2: Brand Identity & Internal Pages](../epics/epic-1.2-brand-identity.md)** (Week 5-6)
  - Extends GN build system with React app compilation targets
  - Integrates Vite custom actions into GN build process
  - Creates build targets for `toubkal://` internal pages

- **[Epic 1.4: SLSA Level 3 Builds](../epics/epic-1.4-slsa-level-3-builds.md)** (Week 11-12)
  - Extends GN build system with SLSA provenance generation
  - Implements hermetic build environments
  - Creates reproducible build configuration for supply chain security

---

## References

- [PRD: Technical Architecture](../TOUBKAL-PRD.md#technical-architecture-overview)
- [PRD: Build System Requirements](../TOUBKAL-PRD.md#build-system-requirements)
- [Chromium Build Documentation](https://www.chromium.org/developers/how-tos/get-the-code/)
- [GN Build System](https://gn.googlesource.com/gn/)
- [Siso Distributed Compiler](https://github.com/google/siso)
- [Ninja Build System](https://ninja-build.org/)
- [Brave Browser Build System](https://github.com/brave/brave-browser/wiki/Build-instructions)

---

## Changelog

| Date       | Change          | Author       |
| ---------- | --------------- | ------------ |
| 2025-10-18 | Initial version | Ilyass Motya |

***
