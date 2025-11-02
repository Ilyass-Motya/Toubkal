# Story 1.7: Project Structure Migration to Feature-First Architecture

Status: Completed

## Story

As a developer,
I want the Toubkal Browser codebase to follow feature-first organization patterns,
so that the code is scalable, maintainable, and follows modern best practices for both React/TypeScript and Chromium C++ development.

## Context

**Current State:**
- React code is organized in a "bad" pattern: `src/components/`, `src/hooks/`, `src/services/` with mixed concerns
- No clear feature boundaries, making it difficult to locate related code
- TypeScript and C++ code are not clearly separated
- Structure doesn't align with documented architecture in `ARCHITECTURE-OVERVIEW.md`

**Desired State:**
- Feature-first organization following React best practices (features/ + shared/)
- Clear separation between React UI (`src/toubkal/app/`) and C++ components (`src/toubkal/components/`)
- Matches Brave's proven patterns while adding modern React/TypeScript organization
- Aligns with documented architecture and supports future scalability

**References:**
- React Best Practices: Feature-first organization pattern
- Brave Browser: `src/brave/components/` modular structure
- Toubkal Architecture: `docs/architecture/ARCHITECTURE-OVERVIEW.md`

## Acceptance Criteria

### 1. React/TypeScript Code Migration
- [ ] All React code is organized under `src/toubkal/app/` following feature-first pattern
- [ ] Features are isolated in `src/toubkal/app/features/[feature-name]/`
- [ ] Each feature contains its own `components/`, `hooks/`, `services/`, `types/` subdirectories
- [ ] Truly shared code is moved to `src/toubkal/app/shared/`
- [ ] No orphaned files remain in old `src/components/`, `src/hooks/`, `src/services/`

### 2. Core Infrastructure Setup
- [ ] Core infrastructure created at `src/toubkal/app/core/`
- [ ] Routing configuration centralized in `src/toubkal/app/core/routing/`
- [ ] Mojo bindings (TypeScript ↔ C++ IPC) organized in `src/toubkal/app/core/mojo-bindings/`
- [ ] Build configuration (`BUILD.gn`) created for React app

### 3. C++ Code Organization
- [ ] C++ feature modules remain in `src/toubkal/components/` (Brave pattern)
- [ ] Browser-level code stays in `src/toubkal/browser/`
- [ ] Clear separation between C++ backend and React frontend

### 4. Documentation and Validation
- [ ] Project structure documentation updated to reflect new organization
- [ ] Migration guide created for developers
- [ ] All import paths updated to reflect new structure
- [ ] TypeScript path aliases configured for clean imports

### 5. Testing and Build System
- [ ] All tests migrated to new structure (`src/toubkal/tests/`)
- [ ] Build system (GN + Vite) works with new structure
- [ ] TypeScript compilation succeeds with new paths
- [ ] All existing tests pass after migration

## Tasks / Subtasks

### Phase 1: Create New Structure (Foundation)

- [ ] Create new directory structure
  - [ ] Create `src/toubkal/app/` root directory
  - [ ] Create `src/toubkal/app/features/` directory
  - [ ] Create `src/toubkal/app/shared/` directory
  - [ ] Create `src/toubkal/app/core/` directory
  - [ ] Create subdirectories: `core/routing/`, `core/mojo-bindings/`

- [ ] Setup build configuration
  - [ ] Create `src/toubkal/app/BUILD.gn` for React app
  - [ ] Configure Vite for new structure
  - [ ] Update TypeScript `tsconfig.json` with path aliases
  - [ ] Configure ESLint for new structure

### Phase 2: Migrate Features (Privacy & Consent)

- [ ] Migrate Privacy feature
  - [ ] Create `src/toubkal/app/features/privacy-settings/`
  - [ ] Move components from `src/components/settings/PrivacySettings.*`
  - [ ] Move hooks from `src/hooks/use-privacy-settings.*`
  - [ ] Move services from `src/services/privacy-manager.*`
  - [ ] Move types from `src/types/PrivacyTypes.*`
  - [ ] Update all import paths

- [ ] Migrate Consent feature
  - [ ] Create `src/toubkal/app/features/consent/`
  - [ ] Move components from `src/components/ConsentPrompt/` and `src/components/ConsentBanner.*`
  - [ ] Move hooks from `src/hooks/use-consent.*`, `src/hooks/use-telemetry-consent.*`
  - [ ] Move services (if any) related to consent
  - [ ] Move types from `src/types/` (ConsentTypes, TelemetryTypes)
  - [ ] Update all import paths

- [ ] Migrate Privacy Dashboard feature
  - [ ] Create `src/toubkal/app/features/privacy-dashboard/`
  - [ ] Move components from `src/components/PrivacyDashboard/`
  - [ ] Move related hooks and services
  - [ ] Update all import paths

### Phase 3: Extract Shared Code

- [ ] Identify truly shared components
  - [ ] Audit all components to determine if truly shared or feature-specific
  - [ ] Move truly shared UI primitives to `src/toubkal/app/shared/components/`
  - [ ] Document what qualifies as "shared" vs "feature-specific"

- [ ] Extract shared hooks
  - [ ] Move generic hooks (useDebounce, useLocalStorage, etc.) to `src/toubkal/app/shared/hooks/`
  - [ ] Keep feature-specific hooks in their respective features

- [ ] Extract shared utilities
  - [ ] Move generic utilities to `src/toubkal/app/shared/utils/`
  - [ ] Move shared types to `src/toubkal/app/shared/types/`
  - [ ] Move shared constants to `src/toubkal/app/shared/constants/`

- [ ] Extract shared services
  - [ ] Move API clients to `src/toubkal/app/shared/services/`
  - [ ] Move storage adapters to `src/toubkal/app/shared/services/`

### Phase 4: Setup Core Infrastructure

- [ ] Configure routing
  - [ ] Create router configuration in `src/toubkal/app/core/routing/`
  - [ ] Migrate existing routing from `src/components/routing/`
  - [ ] Update ToubkalRouter to use new structure

- [ ] Setup Mojo bindings
  - [ ] Create TypeScript bindings structure in `src/toubkal/app/core/mojo-bindings/`
  - [ ] Document Mojo IPC patterns for React ↔ C++ communication
  - [ ] Create type-safe wrappers for Mojo calls

### Phase 5: Migrate Remaining Features

- [ ] Identify and migrate remaining features
  - [ ] Audit `src/components/pages/` for feature extraction
  - [ ] Create feature directories as needed
  - [ ] Migrate components, hooks, services, types

- [ ] Migrate Toubkal-specific code
  - [ ] Review `src/toubkal/components/` (existing)
  - [ ] Ensure proper separation from `src/toubkal/app/`
  - [ ] Document boundaries between C++ and TypeScript code

### Phase 6: Update Tests

- [ ] Migrate test files
  - [ ] Move unit tests to `src/toubkal/tests/unit/`
  - [ ] Move integration tests to `src/toubkal/tests/integration/`
  - [ ] Update test imports to match new structure

- [ ] Update test configuration
  - [ ] Update Vitest configuration
  - [ ] Update test setup files (`src/test/setup.ts`)
  - [ ] Ensure all tests pass with new structure

### Phase 7: Cleanup and Documentation

- [ ] Remove old directories
  - [ ] Delete `src/components/` (after verifying all files migrated)
  - [ ] Delete `src/hooks/` (after verifying all files migrated)
  - [ ] Delete `src/services/` (after verifying all files migrated)
  - [ ] Delete old `src/types/` files (after verifying all migrated)

- [ ] Update documentation
  - [ ] Update `docs/architecture/ARCHITECTURE-OVERVIEW.md` with actual structure
  - [ ] Create migration guide in `docs/contributing/structure-migration.md`
  - [ ] Update `README.md` with new structure overview
  - [ ] Document feature-first patterns and conventions

- [ ] Validate build system
  - [ ] Run full build: `npm run typecheck`
  - [ ] Run all tests: `npm test -- --run`
  - [ ] Ensure no import errors or missing files
  - [ ] Verify GN build works correctly

## Dev Notes

### Relevant Architecture Patterns and Constraints

- **Feature-First Organization**: Each feature is self-contained with its own components, hooks, services, and types
- **Shared Code Principle**: Only truly reusable code goes in `shared/` - avoid premature abstraction
- **Brave Pattern**: Follow Brave's `components/` structure for C++ modules
- **Monolithic Architecture**: All code under `src/toubkal/` maintains monolithic build approach
- **Clear Boundaries**: React UI (`app/`) vs C++ backend (`components/`, `browser/`)

### Migration Strategy

**Incremental Migration:**
1. Create new structure first (don't delete old files yet)
2. Migrate feature-by-feature (not file-by-file)
3. Update imports as you go
4. Validate each feature migration with tests
5. Delete old files only after full validation

**Feature Identification:**
- A "feature" is a cohesive user-facing capability (e.g., privacy-settings, consent, mcp-store)
- Features should be independently testable and deployable
- Features can depend on shared code but not on other features directly

**Import Path Aliases (tsconfig.json):**
```json
{
  "compilerOptions": {
    "paths": {
      "@/features/*": ["./src/toubkal/app/features/*"],
      "@/shared/*": ["./src/toubkal/app/shared/*"],
      "@/core/*": ["./src/toubkal/app/core/*"]
    }
  }
}
```

### New Project Structure

**Complete New Structure:**
```
src/toubkal/
├── app/                              # React/TypeScript UI
│   ├── features/                     # Feature-first organization
│   │   ├── privacy-settings/
│   │   │   ├── components/
│   │   │   │   ├── PrivacySettings.tsx
│   │   │   │   └── PrivacySettings.test.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── use-privacy-settings.ts
│   │   │   │   └── use-privacy-settings.test.ts
│   │   │   ├── services/
│   │   │   │   └── privacy-manager.ts
│   │   │   ├── types/
│   │   │   │   └── PrivacyTypes.ts
│   │   │   └── index.ts              # Public API for feature
│   │   │
│   │   ├── consent/
│   │   │   ├── components/
│   │   │   │   ├── ConsentPrompt.tsx
│   │   │   │   └── ConsentBanner.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── use-consent.ts
│   │   │   │   └── use-telemetry-consent.ts
│   │   │   ├── services/
│   │   │   ├── types/
│   │   │   └── index.ts
│   │   │
│   │   ├── privacy-dashboard/
│   │   │   ├── components/
│   │   │   │   └── PrivacyDashboard.tsx
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   └── index.ts
│   │   │
│   │   └── [future-features]/        # mcp-store, ai-overlay, etc.
│   │
│   ├── shared/                       # Truly shared code
│   │   ├── components/               # UI primitives (Button, Modal, etc.)
│   │   ├── hooks/                    # Generic hooks (useDebounce, etc.)
│   │   ├── utils/                    # Generic utilities
│   │   ├── types/                    # Shared TypeScript types
│   │   ├── services/                 # API clients, storage adapters
│   │   └── constants/                # App-wide constants
│   │
│   ├── core/                         # Core infrastructure
│   │   ├── routing/
│   │   │   ├── ToubkalRouter.tsx
│   │   │   └── routes.ts
│   │   ├── mojo-bindings/            # TypeScript ↔ C++ IPC
│   │   │   ├── audit.ts
│   │   │   ├── consent.ts
│   │   │   └── privacy.ts
│   │   └── state/                    # Global state (if needed)
│   │
│   └── BUILD.gn                      # React app build config
│
├── components/                       # C++ Feature modules (Brave pattern)
│   ├── privacy/
│   ├── ai_platform/
│   ├── mcp_integration/
│   └── transparency/
│
├── browser/                          # Browser-level C++ (Brave pattern)
│   ├── ui/
│   ├── profiles/
│   └── url/
│
└── tests/                            # All tests
    ├── unit/
    ├── integration/
    └── e2e/
```

### Migration Checklist (Per Feature)

For each feature being migrated:
- [ ] Create feature directory structure
- [ ] Move all related components
- [ ] Move all related hooks
- [ ] Move all related services
- [ ] Move all related types
- [ ] Update all imports in moved files
- [ ] Update all imports in files that use this feature
- [ ] Create feature `index.ts` with public API
- [ ] Migrate feature tests
- [ ] Run tests to validate migration
- [ ] Update feature documentation

### Dependencies

**Depends On:**
- Story 1.5: Brand Identity Implementation (React WebUI foundation)
- Story 1.6: Chromium Fork Setup Test Suite (test infrastructure)

**Blocks:**
- Story 1.8: Diagnostics & Scalability Infrastructure (needs clean structure first)
- Future features: All future React features benefit from feature-first structure

### Estimated Effort

**Complexity:** Medium (structural refactoring, no new features)
**Estimated Time:** 3-4 days
- Day 1: Setup new structure, migrate first feature (privacy-settings)
- Day 2: Migrate remaining features (consent, dashboard, etc.)
- Day 3: Extract shared code, setup core infrastructure
- Day 4: Cleanup, documentation, validation

### Success Metrics

- [ ] Zero TypeScript compilation errors
- [ ] All existing tests pass (81/81 URL scheme tests + others)
- [ ] Build time unchanged or improved
- [ ] Import paths are clean and consistent
- [ ] Documentation reflects actual structure
- [ ] Team members can easily find feature code
- [ ] New features can be added following established patterns

## Dev Agent Record

### Context Reference

- docs/stories/story-context-1.7.xml (Comprehensive implementation context for Story 1.7)

### Agent Model Used

Claude Sonnet 4 (BMAD SM Agent)

## References

- React Best Practices: Feature-first organization pattern (Good vs Bad structure)
- Brave Browser: https://github.com/brave/brave-core (components/ pattern)
- `docs/architecture/ARCHITECTURE-OVERVIEW.md` (target structure)
- TypeScript Path Mapping: https://www.typescriptlang.org/docs/handbook/module-resolution.html#path-mapping
