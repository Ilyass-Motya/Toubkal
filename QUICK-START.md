# Quick Start - Toubkal Browser Development

**Last Updated:** 2025-10-18
**Read Time:** 3 minutes
**Audience:** New developers, BMAD agents, AI assistants

> **🚨 READ THIS FIRST before writing any code**

This document contains the **MOST CRITICAL** information you need to start developing for Toubkal Browser. For detailed rules, see [CODING-RULES.md](./CODING-RULES.md).

---

## 🧪 Testing Framework: VITEST (NOT Jest!)

### ✅ CORRECT Usage

```typescript
// Import from Vitest
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Use vi for mocking
const mockFunction = vi.fn()
vi.clearAllMocks()
vi.spyOn(object, 'method')

// Example test
describe('MyComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('should call handler', async () => {
    const handler = vi.fn()
    render(<MyComponent onClick={handler} />)

    await userEvent.click(screen.getByRole('button'))
    expect(handler).toHaveBeenCalled()
  })
})
```

### ❌ WRONG Usage (Will Fail Linting)

```typescript
// ❌ DO NOT IMPORT FROM JEST
import { jest } from '@jest/globals'

// ❌ DO NOT USE jest.fn()
const mockFunction = jest.fn()
jest.clearAllMocks()

// ❌ These will be blocked by pre-commit hooks and ESLint
```

### 🤔 Why "@testing-library/jest-dom"?

**You'll see this package in `package.json` and might think we use Jest. We DON'T.**

```json
{
  "devDependencies": {
    "@testing-library/jest-dom": "^6.0.0"  // ← Works with BOTH Jest and Vitest
  }
}
```

**Explanation:**
- This package provides matchers like `toBeInTheDocument()`, `toHaveAttribute()`
- **Despite the name**, it works with BOTH Jest AND Vitest
- We use it with **Vitest**, not Jest
- The maintainers kept the "jest-dom" name for historical reasons

---

## 📁 File Naming Conventions

### TypeScript/React (camelCase)

```
✅ CORRECT:
src/components/ConsentBanner.tsx       # PascalCase for components
src/components/ConsentBanner.test.tsx  # .test.tsx for tests
src/hooks/use-consent.ts               # kebab-case for hooks
src/services/privacy-manager.ts        # kebab-case for services
src/types/index.ts                     # index for barrel exports

❌ WRONG:
src/components/consent-banner.tsx      # Use PascalCase for components
src/components/ConsentBanner.spec.tsx  # Use .test.tsx not .spec.tsx
src/hooks/useConsent.ts                # Use kebab-case for hooks
```

### C++ (snake_case)

```
✅ CORRECT:
src/toubkal/browser/privacy/consent_manager.h
src/toubkal/browser/privacy/consent_manager.cc
src/toubkal/browser/privacy/consent_manager_test.cc

❌ WRONG:
src/toubkal/browser/privacy/ConsentManager.h   # Use snake_case
src/toubkal/browser/privacy/consent-manager.h  # Use underscore not dash
```

---

## 🚨 Critical Rules (NEVER Violate)

### 1. NO `any` Type

```typescript
// ❌ FORBIDDEN
function process(data: any) { ... }

// ✅ CORRECT
function process(data: unknown) {
  if (typeof data === 'string') {
    // TypeScript knows data is string here
  }
}
```

### 2. NO Unhandled Promises

```typescript
// ❌ FORBIDDEN
someAsyncFunc()  // Fire and forget
apiCall().then(data => process(data))  // No .catch()

// ✅ CORRECT
try {
  await someAsyncFunc()
} catch (error) {
  console.error('Error:', error)
}
```

### 3. NO Silent Error Swallowing

```typescript
// ❌ FORBIDDEN
try {
  dangerousOperation()
} catch (e) {
  // Silent fail
}

// ✅ CORRECT
try {
  dangerousOperation()
} catch (error) {
  console.error('[Context] Error:', error)
  return { success: false, error: 'Operation failed' }
}
```

### 4. NO Bare String Throws

```typescript
// ❌ FORBIDDEN
throw 'Missing consent'

// ✅ CORRECT
throw new Error('Missing consent')
throw new ConsentError('Missing consent', { providerId })
```

---

## 📝 Test File Template

Use this template for new test files:

```typescript
/**
 * [ComponentName] Tests
 *
 * Description of what this test suite validates.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ComponentName } from './ComponentName'

describe('ComponentName', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render without errors', () => {
      // Arrange
      const props = { /* ... */ }

      // Act
      render(<ComponentName {...props} />)

      // Assert
      expect(screen.getByRole('heading')).toBeInTheDocument()
    })
  })

  describe('user interactions', () => {
    it('should handle click events', async () => {
      // Arrange
      const onClick = vi.fn()
      render(<ComponentName onClick={onClick} />)

      // Act
      await userEvent.click(screen.getByRole('button'))

      // Assert
      expect(onClick).toHaveBeenCalledTimes(1)
    })
  })
})
```

**VS Code Snippet:** Type `vitest-test` and press Tab for instant template.

---

## 🏃 Running Tests

```bash
# Run all tests (watch mode)
pnpm test

# Run tests once (CI mode)
pnpm test:ci

# Run with coverage
pnpm test:coverage

# Run specific test file
pnpm test src/components/ConsentBanner.test.tsx

# Run tests matching pattern
pnpm test ConsentBanner
```

---

## 📚 Additional Resources

| Document | Purpose | When to Read |
|----------|---------|--------------|
| **[CODING-RULES.md](./CODING-RULES.md)** | Complete coding standards | When implementing features |
| **[docs/contributing/testing-strategy.md](./docs/contributing/testing-strategy.md)** | Detailed testing guide | When writing complex tests |
| **[CONTRIBUTING.md](./CONTRIBUTING.md)** | Contribution workflow | Before first commit |
| **[README.md](./README.md)** | Project overview | First time setup |

---

## ⚡ Quick Commands

```bash
# Before committing
pnpm run lint              # ESLint
pnpm run typecheck         # TypeScript compiler
pnpm run format            # Prettier
pnpm test                  # Vitest

# All checks at once
pnpm run lint && pnpm run typecheck && pnpm test
```

---

## 🆘 Getting Help

**Found a bug in the codebase?**
- Check [CODING-RULES.md](./CODING-RULES.md) for standards
- Ask in project Slack/Discord
- Open a GitHub Issue

**Confused about testing?**
- Re-read the [Testing Framework](#-testing-framework-vitest-not-jest) section above
- Check [docs/contributing/testing-strategy.md](./docs/contributing/testing-strategy.md)
- Look at existing test files for examples

**Pre-commit hook failing?**
- Check error message (it tells you exactly what's wrong)
- Most common: Using `jest.fn()` instead of `vi.fn()`
- Fix: Replace `jest.` with `vi.` and add `import { vi } from 'vitest'`

---

## 🎯 Summary

**Three things to remember:**

1. ✅ **We use VITEST** - Import `vi` from `'vitest'`, NOT `jest` from anywhere
2. ✅ **Never use `any` type** - Use `unknown` and type guards instead
3. ✅ **Always handle errors** - No silent catches, no unhandled promises

**That's it!** You're ready to start developing. Happy coding! 🚀
