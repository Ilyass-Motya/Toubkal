# Epic 1.1: GN Build System & Cross-Platform Builds

**Epic ID**: 1.1
**Phase**: Phase 1 - Privacy Foundation
**Timeline**: Week 5-6 (2025-11-16 to 2025-11-29)
**Owner**: Team
**Status**: ⚪ Planned
**Priority**: P0 - Critical (Blocking all Phase 1 development)

---

## Overview

Configure Chromium's GN meta-build system with Siso distributed compilation for Toubkal Browser. Establish modular build targets for privacy, AI, MCP, and UI components. Enable reproducible cross-platform builds (Linux, macOS, Windows) as foundation for SLSA Level 3 supply chain security.

---

## Business Value

**Why This Matters:**
- **Development Velocity**: Fast incremental builds enable rapid iteration during Phase 1
- **Cross-Platform Support**: Identical build process across Linux, macOS, Windows
- **Modular Architecture**: Clean separation of privacy/AI/MCP components
- **Supply Chain Ready**: Reproducible builds foundation for SLSA Level 3 (Epic 1.4)

**Success Metrics:**
- Full release build <30 minutes on modern hardware (8-core, SSD)
- Incremental rebuild <10 seconds after single file change
- 100% reproducible builds (identical checksums across platforms)
- Build success rate >99% in CI/CD pipeline

---

## Related ADRs

- **[ADR-005: Build System](../adrs/ADR-005-build-system.md)** - GN + Siso architecture decision
- **[ADR-002: Browser Engine](../adrs/ADR-002-browser-engine.md)** - Chromium fork build requirements
- **[ADR-006: Supply Chain Security](../adrs/ADR-006-supply-chain.md)** - Reproducible builds for supply chain

---

## Related Epics

**Prerequisites:**
- **Epic 0.5.1: Real Audit Trail** ✅ Complete - Provides audit components to build
- **Epic 0.5.2: Ad Blocking MVP** ✅ Complete - Provides ad blocking components to build

**Parallel Epics:**
- **Epic 1.2: Brand Identity** - Runs parallel (Week 5-6), uses build system for React UI compilation

**Downstream Epics:**
- **Epic 1.3: Privacy Controls** - Requires working build system
- **Epic 1.4: SLSA Level 3 Builds** - Extends build system with provenance generation

---

## Technical Architecture

### Components

**1. Root Build Configuration** (`BUILD.gn`)
- Top-level build targets (toubkal, toubkal_tests, toubkal_ui)
- Modular component dependencies
- Cross-platform build settings

**2. Toubkal-Specific Build Targets** (`src/toubkal/BUILD.gn`)
- Privacy module: audit trail, ad blocking, fingerprinting protection
- AI module: inference engines, MCP client (Phase 2 prep)
- Common module: shared utilities and IPC interfaces

**3. Siso Configuration** (`tools/siso/`)
- Distributed compilation setup
- Remote execution configuration
- Build cache management

**4. React/TypeScript UI Integration** (`app/BUILD.gn`)
- Vite build integration with GN
- TypeScript compilation
- Internal page bundling (settings, audit, consent)

### Build Targets Structure
```
toubkal (executable)
├── //toubkal/browser          # Browser process components
│   ├── //toubkal/browser/privacy
│   │   ├── audit_logger
│   │   ├── ad_blocking
│   │   └── fingerprinting_protection
│   ├── //toubkal/browser/ui   # Internal UI pages
│   └── //toubkal/browser/main
├── //toubkal/common           # Shared components
│   ├── //toubkal/common/privacy.mojom
│   └── //toubkal/common/utils
├── //toubkal/renderer         # Renderer process
└── //toubkal/app              # React UI (Vite integration)
```

---

## Stories

### Week 5 Stories
- **Story 1.1.1**: Root BUILD.gn Configuration (P0)
- **Story 1.1.2**: Toubkal Modular Build Targets (P0)
- **Story 1.1.3**: Siso Distributed Compilation Setup (P1)

### Week 6 Stories
- **Story 1.1.4**: React/TypeScript UI Build Integration (P0)
- **Story 1.1.5**: Cross-Platform Build Verification (P0)
- **Story 1.1.6**: Build Documentation & CI/CD Integration (P1)

**Total Stories**: 6
**Completed**: 0
**Completion**: 0%

---

## Success Criteria

### Week 5 Deliverables
- [  ] Root `BUILD.gn` and `src/toubkal/BUILD.gn` created
- [  ] Modular build targets for privacy/audit/ad-blocking components
- [  ] `gn gen out/Release && autoninja -C out/Release toubkal` produces launchable browser
- [  ] Siso distributed compilation configured (optional, Ninja fallback works)
- [  ] Build tested on Linux (primary platform)

### Week 6 Deliverables
- [  ] React UI build integrated with GN (Vite custom action)
- [  ] Cross-platform builds verified (Linux, macOS, Windows)
- [  ] Build instructions documented (`docs/contributing/build-instructions.md`)
- [  ] CI/CD pipeline building on all platforms (GitHub Actions)
- [  ] Reproducible builds validated (identical checksums across platforms)

### Performance Targets
- [  ] Full release build: <30 minutes (8-core machine, SSD)
- [  ] Incremental rebuild: <10 seconds (single file change)
- [  ] Build artifact size: <500MB compressed distribution
- [  ] Build success rate: >99% in CI/CD

---

## Dependencies

**Prerequisites:**
- ✅ Chromium fork synchronized and buildable (user-managed)
- ✅ GN meta-build system (included in Chromium depot_tools)
- ✅ Ninja build backend (included in depot_tools)
- ✅ Clang/LLVM toolchain (Chromium requirement)

**Blockers:**
- None (all tools available in Chromium)

**Downstream Dependencies:**
- **Epic 1.2**: Brand Identity (uses build system for UI compilation)
- **Epic 1.3**: Privacy Controls (uses build system for new components)
- **Epic 1.4**: SLSA Level 3 (extends build system with provenance generation)

---

## Testing Strategy

### Build Validation Tests
```bash
# Clean build test
rm -rf out/Release
gn gen out/Release --args="is_official_build=true enable_toubkal_privacy=true"
autoninja -C out/Release toubkal
# Expected: Successful build, launchable browser

# Incremental build test
touch src/toubkal/browser/privacy/audit_logger.cc
time autoninja -C out/Release toubkal
# Expected: <10 seconds

# Cross-platform reproducibility test
./tools/reproducible_build_test.sh
# Expected: Identical checksums on Linux, macOS, Windows
```

## GN Configuration Validation
```bash
# Dependency graph validation
gn desc out/Release //toubkal:toubkal deps --tree
# Expected: Clean dependency tree, no circular dependencies

# Target validation
gn ls out/Release //toubkal/...
# Expected: All Toubkal targets listed
```

---

## Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **GN Learning Curve** | Medium | High | Comprehensive documentation, team training, reference Brave's BUILD.gn files |
| **Siso Setup Complexity** | Low | Medium | Use Ninja fallback initially, add Siso optimization later |
| **Cross-Platform Build Failures** | High | Medium | Test on all platforms early, use GitHub Actions matrix builds |
| **Build Time Overhead** | Medium | Low | Optimize GN targets, use ccache/sccache for distributed caching |
| **React UI Build Integration** | Medium | Medium | Use proven Vite integration pattern, GN custom actions |

---

## Out of Scope

- ❌ Android/iOS builds (desktop only in Phase 1)
- ❌ Bazel build system (GN only, per ADR-005)
- ❌ Custom build optimization tools (use Chromium defaults)
- ❌ Advanced Siso features (basic distributed compilation only)

---

## Documentation

- [ ] `docs/contributing/build-instructions.md` - Complete build guide
- [ ] `docs/architecture/build-system.md` - GN architecture overview
- [ ] `BUILD.gn` inline comments for all custom targets
- [ ] `args.gn.template` - Template for build configuration

---

## Timeline

| Week | Milestone | Deliverable |
|------|-----------|-------------|
| **Week 5** | GN Configuration | Root BUILD.gn, modular targets, Linux builds working |
| **Week 6** | Cross-Platform Builds | macOS/Windows builds, React UI integration, CI/CD pipeline |

**Start Date**: 2025-11-16 (Week 5)
**End Date**: 2025-11-29 (Week 6)
**Duration**: 2 weeks

---

## References

- [PRODUCT-ROADMAP.md - Phase 1](../PRODUCT-ROADMAP.md#phase-1-privacy-foundation-weeks-5-12)
- [ADR-005: Build System](../adrs/ADR-005-build-system.md)
- [GN Build System Documentation](https://gn.googlesource.com/gn/)
- [Brave Browser BUILD.gn](https://github.com/brave/brave-browser/blob/master/BUILD.gn)
- [Chromium Build Documentation](https://www.chromium.org/developers/how-tos/get-the-code/)

---

**Epic Owner**: Team
**Last Updated**: 2025-10-18
**Status**: ⚪ Planned (starts Week 5)
