# Toubkal Browser - Week 0 Vitest Setup

**Purpose**: Configure Vitest test framework for Toubkal Browser
**Priority**: P0 - Blocking Phase 1 implementation
**Owner**: QA Agent (Murat - TEA)
**Last Updated**: 2025-10-18
**Status**: Active

---

## Overview

Week 0 tooling requirement for Toubkal Browser. This task creates the Vitest configuration, sample tests, and test infrastructure per `testing-strategy.md` requirements.

**Prerequisites:**
- `package.json` exists
- `tsconfig.json` exists
- `testing-strategy.md` loaded (for requirements)
- `CODING-RULES.md` loaded (for test standards)

**Outputs:**
- `vitest.config.ts` - Vitest configuration with 80% coverage enforcement
- `tests/unit/example.test.ts` - Sample unit test
- `tests/integration/example.integration.test.ts` - Sample integration test
- `tests/e2e/example.e2e.test.ts` - Sample E2E test (Playwright)
- Updated `package.json` scripts

---

## Instructions

### Step 1: Verify Prerequisites

**Check existing setup:**

```bash
# Check if Vitest is already configured
ls vitest.config.ts

# Check if test files exist
find tests/ -name "*.test.ts" 2>/dev/null | wc -l

# Check package.json for test scripts
cat package.json | grep '"test"'
```

**Decision Logic:**

- **If vitest.config.ts exists AND tests/ directory has >3 test files** → HALT: "Vitest already configured. Use *automate or *atdd to add more tests."
- **If vitest.config.ts exists BUT no tests** → Skip to Step 3 (create sample tests only)
- **If vitest.config.ts missing** → Proceed to Step 2

---

### Step 2: Create vitest.config.ts

**Generate configuration based on testing-strategy.md:**

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    // Coverage configuration (testing-strategy.md Section 3.1)
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      lines: 80,
      branches: 80,
      functions: 80,
      statements: 80,
      exclude: [
        'node_modules/',
        'dist/',
        'tests/',
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.config.ts',
        '**/types/**',
      ],
    },

    // Environment configuration (Electron-aware)
    environment: 'jsdom', // Default for renderer process
    environmentOptions: {
      jsdom: {
        resources: 'usable',
      },
    },

    // Test structure (testing-strategy.md Section 2)
    include: [
      'tests/**/*.test.ts',
      'tests/**/*.test.tsx',
      'src/**/__tests__/**/*.test.ts',
      'src/**/__tests__/**/*.test.tsx',
    ],
    exclude: [
      'node_modules/',
      'dist/',
      'tests/e2e/**', // E2E tests use Playwright, not Vitest
    ],

    // Globals (for React Testing Library)
    globals: true,
    setupFiles: ['./tests/setup.ts'],

    // Reporter configuration
    reporters: ['verbose'],

    // Timeout configuration
    testTimeout: 10000,
    hookTimeout: 10000,

    // Watch mode configuration
    watch: false,
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@services': path.resolve(__dirname, './src/services'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@types': path.resolve(__dirname, './src/types'),
    },
  },
});
```

**Rationale:**
- **80% coverage thresholds**: Per testing-strategy.md Section 3.1 (minimum requirement)
- **JSDOM environment**: Default for React/TypeScript renderer process tests
- **Exclude tests/e2e/**: E2E tests use Playwright (testing-strategy.md Section 4.3)
- **setupFiles**: Loads test utilities and mocks
- **Path aliases**: Matches tsconfig.json paths for cleaner imports

---

### Step 3: Create tests/setup.ts

**Test setup file (mocks, globals, utilities):**

```typescript
// tests/setup.ts
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Cleanup after each test (React Testing Library)
afterEach(() => {
  cleanup();
});

// Mock Electron IPC (renderer process tests)
global.window = global.window || {};
(global.window as any).electron = {
  ipcRenderer: {
    send: vi.fn(),
    on: vi.fn(),
    invoke: vi.fn(),
  },
};

// Mock localStorage (privacy testing requirement)
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock as any;

// Privacy testing utilities (PRIVACY-ETHICS-POLICY.md compliance)
export const mockTelemetryConsent = (consented: boolean) => {
  localStorageMock.getItem.mockImplementation((key: string) => {
    if (key === 'telemetry-consent') {
      return JSON.stringify({ consented, timestamp: Date.now() });
    }
    return null;
  });
};

// IPC testing utilities
export const mockIpcInvoke = (channel: string, response: any) => {
  (global.window as any).electron.ipcRenderer.invoke.mockImplementation(
    (ch: string) => {
      if (ch === channel) {
        return Promise.resolve(response);
      }
      return Promise.reject(new Error(`Unhandled IPC channel: ${ch}`));
    }
  );
};
```

**Rationale:**
- **@testing-library/jest-dom**: Provides matchers like `toBeInTheDocument()`
- **Electron IPC mocking**: Required for renderer process tests (testing-strategy.md Section 4.2)
- **Privacy mocking utilities**: Ensures telemetry tests don't violate PRIVACY-ETHICS-POLICY.md
- **localStorage mock**: Prevent actual browser storage access in tests

---

### Step 4: Create Sample Tests

**4a. Unit Test Example (tests/unit/example.test.ts):**

```typescript
// tests/unit/example.test.ts
import { describe, it, expect } from 'vitest';

/**
 * Example unit test for Toubkal Browser
 *
 * Unit tests should:
 * - Test pure functions in isolation
 * - Mock all external dependencies
 * - Focus on business logic
 * - Reference: testing-strategy.md Section 4.1
 */
describe('Example Unit Test', () => {
  it('should demonstrate basic test structure', () => {
    const add = (a: number, b: number) => a + b;
    expect(add(2, 3)).toBe(5);
  });

  it('should demonstrate error handling pattern', () => {
    // Per CODING-RULES.md: Use Result<T> pattern, not throw
    type Result<T> = { ok: true; value: T } | { ok: false; error: string };

    const safeDivide = (a: number, b: number): Result<number> => {
      if (b === 0) {
        return { ok: false, error: 'Division by zero' };
      }
      return { ok: true, value: a / b };
    };

    const result = safeDivide(10, 2);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe(5);
    }

    const errorResult = safeDivide(10, 0);
    expect(errorResult.ok).toBe(false);
    if (!errorResult.ok) {
      expect(errorResult.error).toBe('Division by zero');
    }
  });
});
```

**4b. Integration Test Example (tests/integration/example.integration.test.ts):**

```typescript
// tests/integration/example.integration.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { mockIpcInvoke, mockTelemetryConsent } from '../setup';

/**
 * Example integration test for Toubkal Browser
 *
 * Integration tests should:
 * - Test component interactions
 * - Test IPC communication
 * - Test state management
 * - Reference: testing-strategy.md Section 4.2
 */

// Example component (placeholder)
const ExampleComponent = () => {
  const [count, setCount] = React.useState(0);
  return (
    <div>
      <span data-testid="count">{count}</span>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
};

describe('Example Integration Test', () => {
  beforeEach(() => {
    // Setup: Mock privacy consent to prevent telemetry collection
    mockTelemetryConsent(false); // Per PRIVACY-ETHICS-POLICY.md: default disabled
  });

  it('should demonstrate component integration testing', () => {
    render(<ExampleComponent />);

    const countElement = screen.getByTestId('count');
    expect(countElement).toHaveTextContent('0');

    const button = screen.getByText('Increment');
    fireEvent.click(button);

    expect(countElement).toHaveTextContent('1');
  });

  it('should demonstrate IPC mocking pattern', async () => {
    // Mock IPC response
    mockIpcInvoke('get-app-version', '1.0.0');

    const version = await (window as any).electron.ipcRenderer.invoke('get-app-version');
    expect(version).toBe('1.0.0');
  });
});
```

**4c. E2E Test Example (tests/e2e/example.e2e.test.ts):**

```typescript
// tests/e2e/example.e2e.test.ts
import { test, expect, _electron as electron } from '@playwright/test';

/**
 * Example E2E test for Toubkal Browser (Electron)
 *
 * E2E tests should:
 * - Test full user workflows
 * - Test main process + renderer process integration
 * - Test critical paths only (expensive)
 * - Reference: testing-strategy.md Section 4.3
 */

test.describe('Toubkal Browser E2E', () => {
  test('should launch Electron app', async () => {
    // Launch Electron app
    const app = await electron.launch({
      args: ['.'], // Path to Electron app
    });

    // Get first window
    const window = await app.firstWindow();

    // Verify window loaded
    await expect(window).toHaveTitle(/Toubkal/);

    // Close app
    await app.close();
  });

  test('should display consent prompt on first run', async () => {
    // Per PRIVACY-ETHICS-POLICY.md: First run must show consent prompt
    const app = await electron.launch({ args: ['.'] });
    const window = await app.firstWindow();

    // Verify consent prompt visible
    const consentPrompt = await window.locator('[data-testid="consent-prompt"]');
    await expect(consentPrompt).toBeVisible();

    await app.close();
  });
});
```

---

### Step 5: Update package.json Scripts

**Add test scripts:**

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:all": "npm run test && npm run test:e2e"
  }
}
```

**Install dependencies (if missing):**

```bash
npm install --save-dev vitest @vitest/ui @vitest/coverage-v8 @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

---

### Step 6: Verify Setup

**Run tests to verify configuration:**

```bash
# Run unit and integration tests
npm run test

# Check coverage (should pass 80% threshold with examples)
npm run test:coverage

# Verify E2E tests (Playwright)
npm run test:e2e
```

**Expected Results:**
- ✅ All 5 example tests pass (3 unit + 2 integration)
- ✅ Coverage report generated (HTML in `coverage/` directory)
- ✅ 80% thresholds met (with examples)
- ✅ E2E test launches Electron app successfully

**If any test fails:**
- Check console output for errors
- Verify dependencies installed
- Confirm tsconfig.json paths match vitest.config.ts aliases
- Check Electron app builds successfully (`npm run build`)

---

## Success Criteria

- [ ] `vitest.config.ts` created with 80% coverage enforcement
- [ ] `tests/setup.ts` created with Electron/privacy mocks
- [ ] 3 sample tests created (unit, integration, E2E)
- [ ] `package.json` scripts updated
- [ ] `npm test` runs successfully
- [ ] `npm run test:coverage` passes 80% thresholds
- [ ] `npm run test:e2e` launches Electron app
- [ ] No TypeScript errors in test files

---

## Next Steps After Completion

1. **Update toubkal-status-checker.md**: Mark "Vitest Configuration" as ✅ COMPLETE
2. **Proceed to Week 0 remaining tasks**: ESLint, Husky, GitHub Actions CI/CD
3. **Phase 1 ready when**: All Week 0 tasks complete + engineers hired

**Reference Documentation:**
- `testing-strategy.md` - Full testing requirements
- `CODING-RULES.md` - Test code standards (no `any`, Result<T> pattern)
- `PRIVACY-ETHICS-POLICY.md` - Privacy testing requirements
- `TEAM-IMPLEMENTATION-NOTES.md` - Week 0 priorities

---

**Status**: Ready for execution
**Estimated Time**: 2-3 hours
**Blocking**: Phase 1 implementation cannot start without this
