# Story 1.2: Chromium Fork Setup Documentation

Status: Ready for Development
Priority: P0 (Foundation)
Dependencies: None (can run parallel to Phase 0.5)
Estimated Effort: 5 days
Owner: DevOps/Technical Writer

## Story

As a Toubkal Browser developer,
I want comprehensive documentation and templates for setting up the Chromium fork,
so that I can quickly onboard new developers and ensure consistent build environments across the team.

## Acceptance Criteria

1. **Complete setup guide created** (AC: 1)
   - Comprehensive chromium-fork-setup.md with step-by-step instructions
   - Covers Linux, macOS, and Windows platforms
   - Includes troubleshooting section for common issues
   - Documents all prerequisites and dependencies

2. **Configuration templates provided** (AC: 2)
   - .gclient.template with Toubkal-specific configuration
   - args.gn.template with optimized build arguments
   - Both templates include detailed comments explaining each setting
   - Templates work out-of-the-box for new developers

3. **Build scripts created** (AC: 3)
   - scripts/setup-build.sh for automated environment setup
   - scripts/build.sh for consistent build execution
   - Scripts handle platform differences automatically
   - Include error handling and progress reporting

4. **Documentation quality standards met** (AC: 4)
   - All code examples tested and verified
   - Screenshots included for complex setup steps
   - Links to external resources verified and current
   - Documentation follows Toubkal style guide

5. **Privacy compliance verified** (AC: 5)
   - Setup process respects zero-telemetry-by-default policy
   - No unsanctioned network requests during setup
   - All external downloads explicitly documented and consented
   - Setup guide includes privacy verification steps

## Tasks / Subtasks

- [ ] Task 1: Create comprehensive setup guide (AC: 1)
  - [ ] Research Chromium fork setup requirements across platforms
  - [ ] Document prerequisites (depot_tools, Python, Node.js, etc.)
  - [ ] Write step-by-step setup instructions for Linux
  - [ ] Write step-by-step setup instructions for macOS
  - [ ] Write step-by-step setup instructions for Windows
  - [ ] Add troubleshooting section for common issues
  - [ ] Include verification steps to confirm setup success
  - [ ] Add screenshots for complex configuration steps

- [ ] Task 2: Create configuration templates (AC: 2)
  - [ ] Create .gclient.template with Toubkal repository configuration
  - [ ] Create args.gn.template with optimized build arguments
  - [ ] Add detailed comments explaining each configuration option
  - [ ] Test templates on all target platforms
  - [ ] Document template customization options

- [ ] Task 3: Create build automation scripts (AC: 3)
  - [ ] Create scripts/setup-build.sh for environment setup
  - [ ] Create scripts/build.sh for build execution
  - [ ] Add platform detection and appropriate handling
  - [ ] Implement error handling and user feedback
  - [ ] Add progress reporting and status updates
  - [ ] Test scripts on all target platforms

- [ ] Task 4: Ensure documentation quality (AC: 4)
  - [ ] Verify all code examples work as documented
  - [ ] Test all external links and resources
  - [ ] Review documentation for clarity and completeness
  - [ ] Apply Toubkal documentation style guide
  - [ ] Add table of contents and navigation
  - [ ] Include quick start section for experienced developers

- [ ] Task 5: Verify privacy compliance (AC: 5)
  - [ ] Audit setup process for unsanctioned network requests
  - [ ] Document all external downloads and their purposes
  - [ ] Add privacy verification steps to setup guide
  - [ ] Ensure setup respects zero-telemetry-by-default policy
  - [ ] Document how to verify no data leakage during setup

- [ ] Task 6: Create comprehensive test suite (AC: 1, 2, 3, 4, 5)
  - [ ] Unit tests for build scripts functionality
  - [ ] Integration tests for template configuration
  - [ ] E2E tests for complete setup process
  - [ ] Documentation tests to verify all examples work
  - [ ] Privacy compliance tests for network monitoring
  - [ ] Achieve 80% test coverage minimum

## Dev Notes

- **Relevant architecture patterns and constraints**
  - Follow Chromium build system patterns and conventions
  - Use deterministic build flags for reproducibility
  - Implement proper dependency management
  - Follow Toubkal coding rules for configuration files
  - Respect zero-telemetry-by-default policy throughout setup

- **Source tree components to touch**
  - docs/contributing/chromium-fork-setup.md (main documentation)
  - .gclient.template (Chromium sync configuration template)
  - args.gn.template (GN build arguments template)
  - scripts/setup-build.sh (environment setup script)
  - scripts/build.sh (build execution script)
  - tests/setup/ (setup process test suite)

- **Testing standards summary**
  - Unit tests: Jest + Vitest for build scripts
  - Integration tests: Multi-platform setup verification
  - E2E tests: Complete setup process testing
  - Documentation tests: Verify all examples work
  - Privacy tests: Network monitoring during setup
  - 80% test coverage minimum
  - Mock external dependencies where appropriate

### Project Structure Notes

- **Alignment with unified project structure (paths, modules, naming)**
  - Documentation: kebab-case.md (e.g., chromium-fork-setup.md)
  - Configuration templates: dot-case.template (e.g., .gclient.template)
  - Build scripts: kebab-case.sh (e.g., setup-build.sh)
  - Test files: kebab-case.test.ts (e.g., setup-process.test.ts)

- **Detected conflicts or variances (with rationale)**
  - Chromium build system may require specific GN version
  - Platform differences require careful script handling
  - External dependencies need privacy-compliant handling
  - Setup process must be deterministic and reproducible

### References

- [Source: docs/PRODUCT-ROADMAP.md#Phase-1-Week-5-6] - GN + Siso Build System & Brand Identity requirements
- [Source: docs/TOUBKAL-PRD.md#Build-System] - Build system requirements and constraints
- [Source: docs/contributing/build-instructions.md] - Existing build setup guidelines
- [Source: CODING-RULES.md#Error-Handling] - Result<T> pattern requirements for scripts
- [Source: docs/contributing/testing-strategy.md] - Testing standards and coverage requirements
- [Source: docs/PRIVACY-ETHICS-POLICY.md#Zero-Telemetry-by-Default] - Privacy compliance requirements

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

Claude Sonnet 4 (BMAD SM Agent)

### Debug Log References

### Completion Notes List

### File List
