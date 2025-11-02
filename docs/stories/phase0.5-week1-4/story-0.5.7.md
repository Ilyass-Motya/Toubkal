# Story 0.5.7: Adblock-rust Integration - Add Dependency to DEPS

Status: Ready for Development
Priority: P0 (Foundation)
Dependencies: None (can run parallel to crypto work)
Estimated Effort: 2 days

## Story

As a Toubkal Browser developer,
I want to add adblock-rust as a dependency in the Chromium DEPS file,
so that the Brave ad blocking engine can be integrated into the Toubkal build system.

## Acceptance Criteria

1. adblock-rust dependency is added to src/toubkal/DEPS
2. Compatible version with Chromium build system is selected
3. Dependency includes all required sub-components
4. Build system integration works on all platforms (Linux/macOS/Windows)
5. DEPS roller automation can update the dependency
6. License compatibility is verified

## Tasks / Subtasks

- [ ] Research adblock-rust versions and compatibility
  - [ ] Review adblock-rust releases and Rust version requirements
  - [ ] Check Chromium's Rust toolchain compatibility
  - [ ] Verify license compatibility (MPL-2.0 vs Chromium requirements)
  - [ ] Test basic compilation on target platforms

- [ ] Add adblock-rust to DEPS file
  - [ ] Create or update src/toubkal/DEPS file
  - [ ] Add git repository URL and revision
  - [ ] Configure dependency fetch parameters
  - [ ] Add conditional compilation flags if needed

- [ ] Update BUILD.gn files for adblock-rust integration
  - [ ] Create rust_library target for adblock-rust
  - [ ] Add C++ bindings generation if needed
  - [ ] Configure include paths and library linking
  - [ ] Add platform-specific build configurations

- [ ] Implement basic adblock-rust wrapper
  - [ ] Create minimal C++ wrapper class
  - [ ] Test basic filter loading and rule matching
  - [ ] Verify memory safety and performance
  - [ ] Add error handling for Rust panics

- [ ] Test build integration
  - [ ] Verify `gn gen out/Debug && autoninja toubkal` works
  - [ ] Test on all supported platforms (Linux, macOS, Windows)
  - [ ] Validate binary size impact
  - [ ] Check for symbol conflicts with existing Chromium code

- [ ] Documentation and maintenance setup
  - [ ] Document dependency update process
  - [ ] Add to build instructions documentation
  - [ ] Set up automated dependency monitoring
  - [ ] Create rollback procedures

## Dev Notes

- Relevant architecture patterns and constraints
  - Follow Chromium's third-party dependency management
  - Ensure Rust/C++ interop follows Chromium patterns
  - Minimize binary size impact on browser footprint
  - Plan for regular security updates of the dependency

- Source tree components to touch
  - src/toubkal/DEPS (new or update)
  - BUILD.gn files for adblock integration
  - Documentation files for build instructions

- Testing standards summary
  - Build system integration tests
  - Cross-platform compatibility testing
  - Performance impact assessment
  - Security dependency scanning

### Project Structure Notes

- Alignment with unified project structure (paths, modules, naming)
  - Follows Chromium DEPS management patterns
  - Proper BUILD.gn integration

- Detected conflicts or variances (with rationale)
  - Adds Rust dependency to C++ codebase (justified for ad blocking performance)

### References

- [Source: docs/PRODUCT-ROADMAP.md#Phase-0-5-Real-Privacy-Implementation]
- [Source: docs/contributing/chromium-fork-setup.md]
- [Source: CODING-RULES.md#Chromium-C++-Rules]

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
