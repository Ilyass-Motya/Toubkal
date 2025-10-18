# Story 1.3: Rebrand URL Scheme (chrome:// → toubkal://)

Status: Ready for Development
Priority: P1 (Enhancement)
Dependencies: Phase 0.5 crypto foundation complete
Estimated Effort: 3 days
Owner: Frontend Engineer

## Story

As a Toubkal Browser user,
I want all internal pages to use toubkal:// URLs instead of chrome:// URLs,
so that Toubkal has a distinct brand identity.

## Acceptance Criteria

1. All chrome:// URLs changed to toubkal:// throughout codebase
2. Internal pages accessible via toubkal:// (e.g., toubkal://settings, toubkal://newtab)
3. Brave-specific URLs rebranded (brave://rewards → removed, brave://wallet → removed)
4. Help documentation updated with new URL scheme
5. Error pages show toubkal:// URLs in examples
6. Chrome:// URLs auto-redirect to toubkal:// for backward compatibility
7. All internal navigation uses toubkal:// scheme consistently
8. URL scheme changes don't impact page load performance (>5% degradation)

## Tasks / Subtasks

- [ ] Task 1: Audit and catalog existing URL schemes (AC: 1, 3)
  - [ ] Search codebase for chrome:// URLs
  - [ ] Identify Brave-specific URLs (rewards, wallet, referrals)
  - [ ] Document URL scheme usage patterns
- [ ] Task 2: Implement toubkal:// URL scheme registration (AC: 1, 2)
  - [ ] Update Chromium URL scheme registration
  - [ ] Replace chrome:// with toubkal:// in C++ code
  - [ ] Update TypeScript/JavaScript references
- [ ] Task 3: Remove Brave-specific URLs (AC: 3)
  - [ ] Remove brave://rewards functionality
  - [ ] Remove brave://wallet functionality
  - [ ] Remove brave://referrals functionality
  - [ ] Update navigation and routing logic
- [ ] Task 4: Update user-facing strings and documentation (AC: 4, 5)
  - [ ] Update help documentation with toubkal:// URLs
  - [ ] Update error pages to show toubkal:// examples
  - [ ] Update user interface strings
  - [ ] Update developer documentation
- [ ] Task 5: Create comprehensive test suite (AC: 2, 6, 7, 8)
  - [ ] Unit tests for URL scheme handling
  - [ ] Integration tests for toubkal:// navigation
  - [ ] E2E tests for internal page access
  - [ ] Backward compatibility tests for chrome:// redirects
  - [ ] Performance tests for URL scheme impact
  - [ ] Navigation consistency tests
  - [ ] Achieve 80% test coverage minimum

## Dev Notes

- Relevant architecture patterns and constraints
  - Follow Chromium C++ style guide for URL scheme modifications
  - Use TypeScript strict mode (no 'any' types)
  - Implement Result<T> pattern for error handling
  - Follow Toubkal coding rules for file naming and structure
- Source tree components to touch
  - chrome/browser/ (URL scheme registration)
  - content/browser/ (navigation handling)
  - src/components/ (UI updates)
  - docs/ (documentation updates)
- Testing standards summary
  - Unit tests: Jest + Vitest
  - Integration tests: Playwright
  - E2E tests: Custom test framework
  - 80% test coverage minimum
  - Mock all external dependencies

### Project Structure Notes

- Alignment with unified project structure (paths, modules, naming)
  - Components: PascalCase.tsx (e.g., ErrorPage.tsx)
  - Services: kebab-case.ts (e.g., url-scheme-manager.ts)
  - Types: PascalCase.ts (e.g., UrlSchemeTypes.ts)
  - Documentation: kebab-case.md (e.g., url-scheme-guide.md)
- Detected conflicts or variances (with rationale)
  - Chromium URL scheme system may require careful modification
  - Need to maintain compatibility with existing web standards
  - Brave-specific URLs removal may affect existing functionality

### References

- [Source: docs/TOUBKAL-PRD.md#URL-Scheme-Rebrand] - URL scheme requirements
- [Source: docs/PRODUCT-ROADMAP.md#Phase-1-Week-1-2] - Phase 1 deliverables
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
