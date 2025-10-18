# Team Implementation Notes — Coding Rules, ESLint, Husky, Testing

**Date**: 2025-10-18
**Audience**: Dev Team, QA Team, Product Owner
**Priority**: 🔴 **CRITICAL - READ BEFORE PHASE 1**

---

## Executive Summary

The CODING-RULES.md and contributing documentation are **ready**, but you need to **implement tooling enforcement** before Phase 1 starts. Without ESLint, Husky, and automated testing, the coding rules will be **ignored**.

**TL;DR**: Rules without enforcement = developers will skip them. Set up automation **NOW**.

---

## 🚨 CRITICAL: Coding Rules Enforcement

### Problem

You have excellent coding rules documented, but **zero enforcement**:

- ❌ No ESLint configuration to catch `any` types
- ❌ No Husky pre-commit hooks to block bad commits
- ❌ No automated test runners (CI/CD)
- ❌ No code formatters (Prettier, clang-format) auto-running

**Result**: Developers will commit code that violates CODING-RULES.md because there's no automated check.

---

### Solution: Pre-Phase 1 Tooling Setup (Week 1)

**Priority**: 🔴 **P0 - Blocking** (must be done before any code is written)

| Tool               | Purpose                                             | Effort  | Status  |
| ------------------ | --------------------------------------------------- | ------- | ------- |
| **ESLint**         | Enforce TypeScript rules (no `any`, no bare throws) | 2 hours | ⚪ TODO |
| **Husky**          | Pre-commit hooks (run lint, tests, format)          | 1 hour  | ⚪ TODO |
| **Prettier**       | Auto-format TypeScript/React code                   | 1 hour  | ⚪ TODO |
| **clang-format**   | Auto-format C++ code (Chromium style)               | 30 min  | ⚪ TODO |
| **Vitest**         | TypeScript/React test runner                        | 2 hours | ⚪ TODO |
| **GitHub Actions** | CI/CD pipeline (lint, test, build)                  | 4 hours | ⚪ TODO |

**Total Effort**: ~11 hours (1.5 days for one developer)

---

## 📝 ESLint Configuration (TypeScript/React)

### Current State

**Missing**: No `.eslintrc.json` in repository

### Required Configuration

Create `.eslintrc.json` at repo root:

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2022,
    "sourceType": "module",
    "project": "./tsconfig.json"
  },
  "plugins": ["@typescript-eslint", "react", "react-hooks"],
  "rules": {
    // CRITICAL: Enforce CODING-RULES.md
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-floating-promises": "error",
    "@typescript-eslint/no-misused-promises": "error",
    "@typescript-eslint/strict-boolean-expressions": "error",
    "@typescript-eslint/no-non-null-assertion": "error",

    // Error handling rules
    "no-throw-literal": "error",
    "@typescript-eslint/only-throw-error": "error",

    // Promise rules
    "@typescript-eslint/no-floating-promises": "error",
    "require-await": "error",

    // React rules
    "react/prop-types": "off",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",

    // Naming conventions (enforce CODING-RULES.md)
    "@typescript-eslint/naming-convention": [
      "error",
      {
        "selector": "default",
        "format": ["camelCase"],
        "leadingUnderscore": "forbid",
        "trailingUnderscore": "forbid"
      },
      {
        "selector": "variable",
        "format": ["camelCase", "UPPER_CASE"]
      },
      {
        "selector": "typeLike",
        "format": ["PascalCase"]
      },
      {
        "selector": "enumMember",
        "format": ["PascalCase"]
      }
    ]
  },
  "settings": {
    "react": {
      "version": "detect"
    }
  }
}
```

### Install Dependencies

```bash
npm install --save-dev \
  eslint \
  @typescript-eslint/parser \
  @typescript-eslint/eslint-plugin \
  eslint-plugin-react \
  eslint-plugin-react-hooks
```

### Add NPM Scripts

Update `package.json`:

```json
{
  "scripts": {
    "lint": "eslint . --ext .ts,.tsx --max-warnings 0",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "lint:ci": "eslint . --ext .ts,.tsx --format json --output-file eslint-report.json"
  }
}
```

---

## 🪝 Husky Pre-Commit Hooks

### Current State

**Missing**: No Husky configuration

### Required Configuration

#### 1. Install Husky

```bash
npm install --save-dev husky lint-staged
npx husky install
npm pkg set scripts.prepare="husky install"
```

#### 2. Create Pre-Commit Hook

`.husky/pre-commit`:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Run lint-staged (only lint changed files)
npx lint-staged

# For C++ files, run clang-format
git diff --cached --name-only --diff-filter=ACM | grep -E '\.(cc|h)$' | xargs clang-format -i

# Re-add formatted files
git diff --cached --name-only --diff-filter=ACM | xargs git add
```

#### 3. Configure lint-staged

`package.json`:

```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix --max-warnings 0", "prettier --write"],
    "*.{cc,h}": ["clang-format -i"]
  }
}
```

### What This Does

**Before commit**:

1. ✅ Runs ESLint on changed TypeScript files (blocks commit if errors)
2. ✅ Runs Prettier on changed TypeScript files (auto-formats)
3. ✅ Runs clang-format on changed C++ files (auto-formats)
4. ✅ Re-adds formatted files to commit

**Result**: **Zero badly formatted or rule-violating code gets committed**

---

## 🎨 Prettier Configuration (TypeScript/React)

### Create `.prettierrc.json`

```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

### Add NPM Scripts

```json
{
  "scripts": {
    "format": "prettier --write \"**/*.{ts,tsx,json,md}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,json,md}\""
  }
}
```

---

## 🔧 clang-format Configuration (C++)

### Create `.clang-format`

```yaml
# Chromium C++ style (Google style with modifications)
BasedOnStyle: Chromium
Language: Cpp
IndentWidth: 2
ColumnLimit: 100
AccessModifierOffset: -1
AlignAfterOpenBracket: Align
AllowShortFunctionsOnASingleLine: Inline
AllowShortIfStatementsOnASingleLine: Never
AllowShortLoopsOnASingleLine: false
AlwaysBreakAfterReturnType: None
BreakBeforeBraces: Attach
DerivePointerAlignment: false
PointerAlignment: Left
SpaceAfterCStyleCast: false
SpaceBeforeAssignmentOperators: true
SpaceBeforeParens: ControlStatements
SpacesInAngles: false
Standard: c++17
```

### Add Git Hook (Already in Husky pre-commit)

```bash
# .husky/pre-commit (already added above)
git diff --cached --name-only --diff-filter=ACM | grep -E '\.(cc|h)$' | xargs clang-format -i
```

---

## 🧪 Testing Configuration (Vitest for TypeScript/React)

### Current State

**Missing**: No test runner configured

### Required Configuration

#### 1. Install Vitest

```bash
npm install --save-dev vitest @vitest/ui @testing-library/react @testing-library/user-event jsdom
```

#### 2. Create `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/test/', '**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
      // CRITICAL: Enforce 80% coverage (CODING-RULES.md requirement)
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

#### 3. Create Test Setup File

`src/test/setup.ts`:

```typescript
import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import matchers from '@testing-library/jest-dom/matchers'

// Extend Vitest matchers with jest-dom
expect.extend(matchers)

// Cleanup after each test
afterEach(() => {
  cleanup()
})
```

#### 4. Add NPM Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:ci": "vitest run --coverage --reporter=json --outputFile=test-report.json"
  }
}
```

### What This Does

**During development**:

- `npm test` → Runs tests in watch mode
- `npm run test:ui` → Opens interactive test UI
- `npm run test:coverage` → Generates coverage report (must be ≥80%)

**In CI/CD**:

- `npm run test:ci` → Runs tests once, blocks merge if coverage <80%

---

## 🤖 GitHub Actions CI/CD Pipeline

### Current State

**Missing**: No `.github/workflows/` directory

### Required Configuration

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint TypeScript/React
        run: npm run lint

      - name: Type check
        run: npm run typecheck

      - name: Run tests
        run: npm run test:ci

      - name: Check coverage
        run: |
          COVERAGE=$(jq '.total.lines.pct' coverage/coverage-summary.json)
          if (( $(echo "$COVERAGE < 80" | bc -l) )); then
            echo "Coverage $COVERAGE% is below 80% threshold"
            exit 1
          fi

      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json

  cpp-lint:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Install clang-format
        run: sudo apt-get install -y clang-format

      - name: Check C++ formatting
        run: |
          find . -name '*.cc' -o -name '*.h' | xargs clang-format -n --Werror

  build:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]

    steps:
      - uses: actions/checkout@v4

      - name: Setup depot_tools
        run: |
          git clone https://chromium.googlesource.com/chromium/tools/depot_tools.git
          echo "$PWD/depot_tools" >> $GITHUB_PATH

      - name: Sync Chromium dependencies
        run: gclient sync

      - name: Configure build (GN + Siso)
        run: gn gen out/Release --args='use_siso=true is_official_build=true'

      - name: Build Toubkal
        run: autoninja -C out/Release toubkal
        timeout-minutes: 120

      - name: Run C++ unit tests
        run: |
          ninja -C out/Release unit_tests
          ./out/Release/unit_tests
```

### What This Does

**On every PR**:

1. ✅ Lints TypeScript/React (fails PR if ESLint errors)
2. ✅ Runs type check (fails PR if TypeScript errors)
3. ✅ Runs tests (fails PR if tests fail or coverage <80%)
4. ✅ Checks C++ formatting (fails PR if not formatted)
5. ✅ Builds on Linux, macOS, Windows (fails PR if build fails)
6. ✅ Runs C++ unit tests (fails PR if tests fail)

**Result**: **Zero broken code gets merged**

---

## 📊 Testing Strategy: Critical Gaps

### Current State

**Problem**: CODING-RULES.md says "80% coverage required" but:

- ❌ No test runner configured
- ❌ No coverage enforcement
- ❌ No example test files in repo
- ❌ No mocking strategy for Ollama, MCP, Chromium APIs

### Required: Test Examples

Create example test files so devs know the pattern:

#### Example 1: Component Test

`src/components/ConsentBanner/ConsentBanner.test.tsx`:

```typescript
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ConsentBanner } from './ConsentBanner'

describe('ConsentBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('displays consent message with action type', () => {
      // Arrange
      render(<ConsentBanner actionType="AI_QUERY_CLOUD" />)

      // Assert
      expect(screen.getByText(/AI cloud query requires consent/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /grant/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /deny/i })).toBeInTheDocument()
    })
  })

  describe('user interaction', () => {
    it('calls onGrant when user clicks Grant button', async () => {
      // Arrange
      const mockOnGrant = vi.fn()
      const user = userEvent.setup()
      render(<ConsentBanner actionType="AI_QUERY_CLOUD" onGrant={mockOnGrant} />)

      // Act
      const grantButton = screen.getByRole('button', { name: /grant/i })
      await user.click(grantButton)

      // Assert
      expect(mockOnGrant).toHaveBeenCalledTimes(1)
      expect(mockOnGrant).toHaveBeenCalledWith({ actionType: 'AI_QUERY_CLOUD' })
    })

    it('calls onDeny when user clicks Deny button', async () => {
      // Arrange
      const mockOnDeny = vi.fn()
      const user = userEvent.setup()
      render(<ConsentBanner actionType="AI_QUERY_CLOUD" onDeny={mockOnDeny} />)

      // Act
      const denyButton = screen.getByRole('button', { name: /deny/i })
      await user.click(denyButton)

      // Assert
      expect(mockOnDeny).toHaveBeenCalledTimes(1)
    })
  })

  describe('async operations', () => {
    it('shows loading state during consent request', async () => {
      // Arrange
      const mockOnGrant = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)))
      const user = userEvent.setup()
      render(<ConsentBanner actionType="AI_QUERY_CLOUD" onGrant={mockOnGrant} />)

      // Act
      const grantButton = screen.getByRole('button', { name: /grant/i })
      await user.click(grantButton)

      // Assert - loading state
      expect(grantButton).toBeDisabled()
      expect(screen.getByText(/processing/i)).toBeInTheDocument()

      // Wait for completion
      await waitFor(() => {
        expect(grantButton).not.toBeDisabled()
      })
    })
  })

  describe('error handling', () => {
    it('displays error message if consent request fails', async () => {
      // Arrange
      const mockOnGrant = vi.fn(() => Promise.reject(new Error('Network error')))
      const user = userEvent.setup()
      render(<ConsentBanner actionType="AI_QUERY_CLOUD" onGrant={mockOnGrant} />)

      // Act
      const grantButton = screen.getByRole('button', { name: /grant/i })
      await user.click(grantButton)

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/failed to grant consent/i)).toBeInTheDocument()
      })
    })
  })
})
```

#### Example 2: Service/Hook Test

`src/hooks/use-consent.test.ts`:

```typescript
import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useConsent } from './use-consent'

// Mock the Toubkal API
vi.mock('@/api/toubkal', () => ({
  toubkal: {
    consent: {
      getStatus: vi.fn(),
      requestConsent: vi.fn(),
    },
  },
}))

import { toubkal } from '@/api/toubkal'

describe('useConsent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches consent status on mount', async () => {
    // Arrange
    const mockStatus = { granted: true, timestamp: Date.now() }
    vi.mocked(toubkal.consent.getStatus).mockResolvedValue({
      success: true,
      data: mockStatus,
    })

    // Act
    const { result } = renderHook(() => useConsent('AI_QUERY_LOCAL'))

    // Assert - initial state
    expect(result.current.loading).toBe(true)
    expect(result.current.status).toBeNull()

    // Wait for fetch
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.status).toEqual(mockStatus)
    expect(result.current.error).toBeNull()
  })

  it('handles fetch errors gracefully', async () => {
    // Arrange
    vi.mocked(toubkal.consent.getStatus).mockResolvedValue({
      success: false,
      error: 'Database unavailable',
    })

    // Act
    const { result } = renderHook(() => useConsent('AI_QUERY_LOCAL'))

    // Wait for fetch
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Assert
    expect(result.current.status).toBeNull()
    expect(result.current.error).toBe('Database unavailable')
  })
})
```

---

## 🎯 QA Team: Test Coverage Requirements

### Current State

**Problem**: testing-strategy.md says "80% coverage" but QA doesn't have:

- ❌ Test plan templates
- ❌ Coverage tracking dashboard
- ❌ Acceptance criteria checklists

### Required: QA Test Plan Template

Create `docs/qa/TEST-PLAN-TEMPLATE.md`:

```markdown
# Test Plan: [Feature Name]

**Feature**: [Feature name from PRD]
**Sprint**: [Sprint number]
**QA Owner**: [Name]
**Status**: ⚪ Draft / 🟡 In Progress / ✅ Complete

---

## 1. Scope

**In Scope**:

- [ ] Unit tests (80% coverage)
- [ ] Integration tests (API contracts)
- [ ] E2E tests (user flows)
- [ ] Security tests (XSS, CSRF, consent bypass)

**Out of Scope**:

- [ ] Performance tests (separate plan)
- [ ] Accessibility tests (separate plan)

---

## 2. Test Cases

### 2.1 Unit Tests (Developer Responsibility)

| Test ID | Description                      | Expected Coverage   |
| ------- | -------------------------------- | ------------------- |
| UT-001  | ConsentBanner component renders  | Component rendering |
| UT-002  | ConsentBanner handles user click | Event handlers      |
| UT-003  | useConsent hook fetches status   | API integration     |

**Coverage Requirement**: ≥80% line coverage (enforced by CI/CD)

---

### 2.2 Integration Tests (QA + Developer)

| Test ID | Description                               | API Endpoints          | Status  |
| ------- | ----------------------------------------- | ---------------------- | ------- |
| IT-001  | Consent request flows through full stack  | `/api/consent/request` | ⚪ TODO |
| IT-002  | Audit log stores consent decision         | `/api/audit/log`       | ⚪ TODO |
| IT-003  | Consent decision persists across sessions | LevelDB                | ⚪ TODO |

---

### 2.3 E2E Tests (QA Responsibility)

| Test ID | User Flow                                | Tools      | Status  |
| ------- | ---------------------------------------- | ---------- | ------- |
| E2E-001 | User grants consent for AI query         | Playwright | ⚪ TODO |
| E2E-002 | User denies consent for AI query         | Playwright | ⚪ TODO |
| E2E-003 | Consent banner shows on cloud AI request | Playwright | ⚪ TODO |

---

### 2.4 Security Tests (Security + QA)

| Test ID | Attack Vector               | Expected Behavior      | Status  |
| ------- | --------------------------- | ---------------------- | ------- |
| SEC-001 | XSS in AI response          | Sanitized output       | ⚪ TODO |
| SEC-002 | CSRF on consent endpoint    | Token validation       | ⚪ TODO |
| SEC-003 | Consent bypass via DevTools | Server-side validation | ⚪ TODO |

---

## 3. Acceptance Criteria

- [ ] All unit tests pass (80%+ coverage)
- [ ] All integration tests pass
- [ ] All E2E tests pass on Chrome, Firefox, Safari
- [ ] All security tests pass
- [ ] No P0/P1 bugs open
- [ ] Performance benchmarks met (see performance plan)
- [ ] Accessibility audit passed (WCAG AA)

---

## 4. Test Execution

**Environment**: QA staging (toubkal-qa.internal)
**Test Data**: [Link to test data seed script]
**Test Run**: [Link to test run in CI/CD]

---

## 5. Bugs Found

| Bug ID  | Severity | Description                               | Status         |
| ------- | -------- | ----------------------------------------- | -------------- |
| BUG-001 | P1       | Consent banner doesn't show on first load | ✅ Fixed       |
| BUG-002 | P2       | Loading spinner never disappears          | 🟡 In Progress |

---

## 6. Sign-Off

- [ ] **QA Lead**: [Name] - Date: [YYYY-MM-DD]
- [ ] **Product Owner**: [Name] - Date: [YYYY-MM-DD]
- [ ] **Engineering Lead**: [Name] - Date: [YYYY-MM-DD]
```

---

## 📋 Product Owner: Acceptance Criteria Checklist

### Current State

**Problem**: PRD has features but no acceptance criteria templates for PO to verify

### Required: Acceptance Criteria Template

Create `docs/product/ACCEPTANCE-CRITERIA-TEMPLATE.md`:

```markdown
# Acceptance Criteria: [Feature Name]

**Feature**: [Feature name from PRD Section X.Y]
**User Story**: As a [user type], I want to [action] so that [benefit]
**Priority**: P0 / P1 / P2
**Sprint**: [Sprint number]

---

## Functional Requirements

### Must Have (P0)

- [ ] **Requirement 1**: [Clear, testable requirement]
  - **Acceptance**: [How to verify - manual test or automated test ID]
  - **Example**: "When user clicks Grant button, consent record is saved to LevelDB"

- [ ] **Requirement 2**: [Clear, testable requirement]
  - **Acceptance**: [How to verify]
  - **Example**: "Consent banner shows within 200ms of cloud AI request"

### Should Have (P1)

- [ ] **Requirement 3**: [Nice-to-have requirement]
  - **Acceptance**: [How to verify]

### Could Have (P2)

- [ ] **Requirement 4**: [Optional enhancement]
  - **Acceptance**: [How to verify]

---

## Non-Functional Requirements

### Performance

- [ ] Consent banner renders in <200ms
- [ ] Consent decision persists in <100ms
- [ ] No UI jank (60fps maintained)

### Security

- [ ] Consent decision is cryptographically signed (Ed25519)
- [ ] Consent log is tamper-proof (Merkle tree)
- [ ] No XSS vulnerabilities (DOMPurify sanitization)

### Accessibility

- [ ] Keyboard navigable (Tab, Enter, Esc)
- [ ] Screen reader announces consent request
- [ ] WCAG AA contrast ratio (4.5:1)

### Privacy

- [ ] Zero telemetry (no external requests without consent)
- [ ] Consent decision auditable (export to JSON/CSV)
- [ ] User can revoke consent at any time

---

## Edge Cases

- [ ] **No internet**: Consent banner works offline
- [ ] **Slow network**: Loading state shows, timeout after 5s
- [ ] **Database failure**: Error message shown, no silent failure

---

## Testing

- [ ] Unit tests written (≥80% coverage)
- [ ] Integration tests written (API contracts)
- [ ] E2E tests written (user flows)
- [ ] Manual testing completed (QA sign-off)

---

## Documentation

- [ ] User-facing docs updated (help.toubkal.app)
- [ ] API docs updated (if API changes)
- [ ] Release notes written (CHANGELOG.md)

---

## Definition of Done

- [ ] Code reviewed (1+ approvals)
- [ ] Tests pass (CI/CD green)
- [ ] Coverage ≥80%
- [ ] No P0/P1 bugs
- [ ] QA sign-off
- [ ] PO sign-off
- [ ] Merged to `main`

---

**Sign-Off**:

- [ ] **Product Owner**: [Name] - Date: [YYYY-MM-DD]
- [ ] **QA Lead**: [Name] - Date: [YYYY-MM-DD]
```

---

## 🚀 Implementation Timeline (Pre-Phase 1)

### Week 0 (Before Phase 1 Starts)

| Day       | Task                                                     | Owner    | Status  |
| --------- | -------------------------------------------------------- | -------- | ------- |
| **Day 1** | Install ESLint + Prettier + Husky                        | Dev Lead | ⚪ TODO |
| **Day 2** | Configure Vitest + write 3 example tests                 | QA Lead  | ⚪ TODO |
| **Day 3** | Set up GitHub Actions CI/CD                              | DevOps   | ⚪ TODO |
| **Day 4** | Create test plan template + acceptance criteria template | PO + QA  | ⚪ TODO |
| **Day 5** | Run team training (ESLint, Husky, testing)               | Dev Lead | ⚪ TODO |

**Total Effort**: 1 week (before any Phase 1 code is written)

---

## ❌ Common Mistakes to Avoid

### Mistake 1: "We'll add tests later"

**Problem**: Teams never "add tests later". Coverage stays at 0%.

**Solution**: **BLOCK ALL MERGES** without tests:

```yaml
# .github/workflows/ci.yml
- name: Check coverage
  run: |
    COVERAGE=$(jq '.total.lines.pct' coverage/coverage-summary.json)
    if (( $(echo "$COVERAGE < 80" | bc -l) )); then
      echo "❌ Coverage $COVERAGE% is below 80% threshold"
      exit 1
    fi
```

---

### Mistake 2: "ESLint warnings are fine"

**Problem**: Developers ignore warnings. Warnings become 100s of violations.

**Solution**: **ZERO warnings allowed**:

```json
{
  "scripts": {
    "lint": "eslint . --ext .ts,.tsx --max-warnings 0"
  }
}
```

---

### Mistake 3: "Husky is too strict, let's disable it"

**Problem**: Devs commit broken code, CI fails, dev "I'll fix it later" (never fixes).

**Solution**: **NEVER disable Husky**. If hook takes too long, optimize it:

```bash
# .husky/pre-commit
# Only lint staged files (fast)
npx lint-staged

# Don't run full test suite (run in CI instead)
```

---

### Mistake 4: "Manual testing is enough"

**Problem**: Manual testing doesn't scale. QA becomes bottleneck.

**Solution**: **Automated tests ARE the spec**:

- Unit tests = "How does this function work?"
- Integration tests = "How do modules interact?"
- E2E tests = "How do users use this?"

---

## 🎯 Success Metrics

After implementing tooling, you should see:

| Metric                    | Target     | How to Measure           |
| ------------------------- | ---------- | ------------------------ |
| **ESLint Errors**         | 0 (always) | CI/CD pipeline           |
| **Test Coverage**         | ≥80%       | Vitest coverage report   |
| **Pre-Commit Time**       | <10s       | Developer feedback       |
| **CI/CD Pass Rate**       | ≥95%       | GitHub Actions dashboard |
| **Bugs Caught Pre-Merge** | ≥70%       | Bug tracker              |
| **Reverted Commits**      | <5%        | Git history              |

---

## 📞 Questions & Support

| Question                        | Contact                        |
| ------------------------------- | ------------------------------ |
| **ESLint/Prettier setup**       | Dev Lead (dev@toubkal.app)     |
| **Husky not working**           | DevOps (devops@toubkal.app)    |
| **Test coverage too low**       | QA Lead (qa@toubkal.app)       |
| **CI/CD pipeline failing**      | DevOps (devops@toubkal.app)    |
| **Acceptance criteria unclear** | Product Owner (po@toubkal.app) |

---

## ✅ Final Checklist (Before Writing Any Code)

**Dev Team**:

- [ ] ESLint configured (`.eslintrc.json`)
- [ ] Prettier configured (`.prettierrc.json`)
- [ ] Husky installed (`.husky/pre-commit`)
- [ ] Vitest configured (`vitest.config.ts`)
- [ ] Example tests written (3+ examples in repo)
- [ ] GitHub Actions CI/CD configured (`.github/workflows/ci.yml`)

**QA Team**:

- [ ] Test plan template created (`docs/qa/TEST-PLAN-TEMPLATE.md`)
- [ ] Coverage dashboard set up (Codecov or similar)
- [ ] E2E framework chosen (Playwright recommended)
- [ ] Test data seed scripts created

**Product Owner**:

- [ ] Acceptance criteria template created (`docs/product/ACCEPTANCE-CRITERIA-TEMPLATE.md`)
- [ ] Definition of Done documented
- [ ] Sign-off process defined

---

**Status**: ⚪ **NOT STARTED - BLOCKING PHASE 1**

**Next Action**: Schedule 2-hour kickoff meeting with Dev Lead + QA Lead + PO to implement tooling (Week 0, before Phase 1 starts)

---

**Document Version**: 1.0
**Last Updated**: 2025-10-18
**Urgency**: 🔴 **CRITICAL - IMPLEMENT BEFORE PHASE 1**
