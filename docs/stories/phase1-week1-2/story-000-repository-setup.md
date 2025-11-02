# Story 1.0: Repository Setup & Build System

Status: Completed ✅
Priority: P0 (Foundation)
Dependencies: None
Estimated Effort: 5 days (completed)
Owner: DevOps Engineer

## Story

As a Toubkal Browser developer,
I want a working GN/Siso build system with synchronized Chromium fork,
so that I can build and develop Toubkal Browser locally and in CI/CD.

## Acceptance Criteria

1. GN/Siso build system working with Ninja fallback
2. Chromium fork synchronized via gclient
3. Build artifacts reproducible across platforms (Linux, macOS, Windows)
4. CI/CD pipeline functional with automated builds
5. Zero unsanctioned network requests verified via Wireshark during build

## Tasks / Subtasks

- [ ] Task 1: Set up Chromium fork synchronization (AC: 2)
  - [ ] Initialize gclient workspace
  - [ ] Configure .gclient file for Toubkal Browser
  - [ ] Sync Chromium source code
  - [ ] Verify sync integrity and completeness
- [ ] Task 2: Configure GN/Siso build system (AC: 1)
  - [ ] Set up GN build configuration
  - [ ] Configure Siso build system
  - [ ] Implement Ninja fallback for compatibility
  - [ ] Test build system on all target platforms
- [ ] Task 3: Implement reproducible builds (AC: 3)
  - [ ] Configure build environment variables
  - [ ] Set up deterministic build flags
  - [ ] Test build reproducibility across platforms
  - [ ] Document build requirements and dependencies
- [ ] Task 4: Set up CI/CD pipeline (AC: 4)
  - [ ] Configure GitHub Actions workflows
  - [ ] Set up automated build triggers
  - [ ] Implement build artifact storage
  - [ ] Add build status reporting
- [ ] Task 5: Implement network monitoring and verification (AC: 5)
  - [ ] Set up Wireshark monitoring during builds
  - [ ] Verify zero unsanctioned network requests
  - [ ] Document allowed network endpoints
  - [ ] Create network monitoring test suite
- [ ] Task 6: Create comprehensive test suite (AC: 1, 2, 3, 4, 5)
  - [ ] Unit tests for build system components
  - [ ] Integration tests for build reproducibility
  - [ ] E2E tests for CI/CD pipeline
  - [ ] Performance tests for build speed
  - [ ] Achieve 80% test coverage minimum

## Dev Notes

- Relevant architecture patterns and constraints
  - Follow Chromium build system patterns and conventions
  - Use deterministic build flags for reproducibility
  - Implement proper dependency management
  - Follow Toubkal coding rules for configuration files
- Source tree components to touch
  - .gclient (Chromium sync configuration)
  - BUILD.gn files (build configuration)
  - .github/workflows/ (CI/CD configuration)
  - build/ (build system setup)
  - tools/ (build tools and scripts)
- Testing standards summary
  - Unit tests: Jest + Vitest for build scripts
  - Integration tests: Multi-platform build verification
  - E2E tests: Full build pipeline testing
  - 80% test coverage minimum
  - Mock external dependencies where appropriate

### Project Structure Notes

- Alignment with unified project structure (paths, modules, naming)
  - Configuration files: kebab-case (e.g., build-config.yaml)
  - Build scripts: kebab-case.sh (e.g., setup-build.sh)
  - CI/CD workflows: kebab-case.yml (e.g., build-and-test.yml)
  - Documentation: kebab-case.md (e.g., build-instructions.md)
- Detected conflicts or variances (with rationale)
  - Chromium build system may require specific GN version
  - Siso build system may need custom configuration for Toubkal
  - Cross-platform compatibility requires careful dependency management

### References

- [Source: docs/PRODUCT-ROADMAP.md#Phase-1-Week-1] - Week 1 milestone requirements
- [Source: docs/TOUBKAL-PRD.md#Build-System] - Build system requirements
- [Source: docs/contributing/build-instructions.md] - Build setup guidelines
- [Source: CODING-RULES.md#Error-Handling] - Result<T> pattern requirements
- [Source: docs/contributing/testing-strategy.md] - Testing standards

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

Claude Sonnet 4 (BMAD SM Agent)

### Debug Log References

### Completion Notes List

### File List
