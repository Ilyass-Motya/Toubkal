# Testing Strategy

**Last Updated**: 2025-10-18
**Status**: Active
**Audience**: Developers, QA Engineers

Comprehensive testing guide for Toubkal Browser covering unit tests, integration tests, E2E tests, performance testing, and security testing.

> **Note**: This document focuses on Chromium C++ testing. For quick reference rules, see [CODING-RULES.md](../../CODING-RULES.md).

---

## Table of Contents

1. [Test Pyramid](#test-pyramid)
2. [Unit Testing](#unit-testing)
3. [Integration Testing](#integration-testing)
4. [End-to-End Testing](#end-to-end-testing)
5. [Mocking Strategies](#mocking-strategies)
6. [Performance Testing](#performance-testing)
7. [Security Testing](#security-testing)
8. [Coverage Requirements](#coverage-requirements)
9. [Common Pitfalls](#common-pitfalls)

---

## Test Pyramid

Toubkal follows the **standard test pyramid**:

```
       /\
      /  \     E2E Tests (10%)
     /____\    - Browser automation (Playwright)
    /      \   - User flows (consent, AI, audit)
   /________\
  /          \ Integration Tests (20%)
 /____________\- API integration (Ollama, Mojo IPC)
/______________\
                Unit Tests (70%)
                - Business logic
                - Components
                - Utilities
```

### Test Distribution

| Test Type       | % of Tests | Purpose                              | Speed         |
| --------------- | ---------- | ------------------------------------ | ------------- |
| **Unit**        | 70%        | Test individual functions/components | Fast (<1s)    |
| **Integration** | 20%        | Test module interactions             | Medium (1-5s) |
| **E2E**         | 10%        | Test full user flows                 | Slow (5-30s)  |

---

## Unit Testing

### TypeScript/React Unit Tests

**Framework**: Vitest + React Testing Library

**Test Structure** (AAA Pattern):

```
// src/components/ConsentBanner/ConsentBanner.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ConsentBanner } from './ConsentBanner'

describe('ConsentBanner', () => {
  describe('rendering', () => {
    it('should display consent message', () => {
      // Arrange
      render(<ConsentBanner actionType="AI_QUERY" />)

      // Act (not needed for render test)

      // Assert
      expect(screen.getByText(/AI query requires consent/i)).toBeInTheDocument()
    })
  })

  describe('user interaction', () => {
    it('should call onGrant when user clicks Grant', async () => {
      // Arrange
      const mockOnGrant = vi.fn()
      const user = userEvent.setup()
      render(<ConsentBanner actionType="AI_QUERY" onGrant={mockOnGrant} />)

      // Act
      const grantButton = screen.getByRole('button', { name: /grant/i })
      await user.click(grantButton)

      // Assert
      expect(mockOnGrant).toHaveBeenCalledTimes(1)
    })
  })
})
```

---

### C++ Unit Tests

**Framework**: gtest (Chromium standard)

**Test Structure**:

```
// consent_manager_test.cc
#include "toubkal/browser/consent/consent_manager.h"

#include "base/test/task_environment.h"
#include "testing/gtest/include/gtest/gtest.h"

namespace toubkal {

class ConsentManagerTest : public testing::Test {
 protected:
  void SetUp() override {
    consent_manager_ = std::make_unique<ConsentManager>();
  }

  void TearDown() override {
    consent_manager_.reset();
  }

  base::test::TaskEnvironment task_environment_;
  std::unique_ptr<ConsentManager> consent_manager_;
};

TEST_F(ConsentManagerTest, HasConsentReturnsFalseByDefault) {
  // Arrange
  const std::string action_type = "AI_QUERY";
  const std::string user_id = "test_user";

  // Act
  bool has_consent = consent_manager_->HasConsent(action_type, user_id);

  // Assert
  EXPECT_FALSE(has_consent);
}

TEST_F(ConsentManagerTest, HasConsentReturnsTrueAfterGrant) {
  // Arrange
  const std::string action_type = "AI_QUERY";
  const std::string user_id = "test_user";

  // Act
  consent_manager_->GrantConsent(action_type, user_id);
  bool has_consent = consent_manager_->HasConsent(action_type, user_id);

  // Assert
  EXPECT_TRUE(has_consent);
}

}  // namespace toubkal
```

---

## Integration Testing

### API Integration Tests

**Test External Services** (Ollama, Mojo IPC):

```
// src/services/ollama-client.integration.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { OllamaClient } from './ollama-client'

describe('OllamaClient Integration', () => {
  let client: OllamaClient

  beforeAll(async () => {
    client = new OllamaClient({ baseUrl: 'http://localhost:11434' })
    // Ensure Ollama is running
    const health = await client.health()
    if (!health.success) {
      throw new Error('Ollama not running')
    }
  })

  afterAll(async () => {
    await client.cleanup()
  })

  it('should list available models', async () => {
    // Act
    const result = await client.listModels()

    // Assert
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.length).toBeGreaterThan(0)
      expect(result.data).toHaveProperty('id')
      expect(result.data).toHaveProperty('size')
    }
  })

  it('should query model and return response', async () => {
    // Arrange
    const prompt = 'What is 2+2?'

    // Act
    const result = await client.query({
      model: 'llama3.2',
      prompt,
      stream: false
    })

    // Assert
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.text).toBeTruthy()
      expect(result.data.tokens).toBeGreaterThan(0)
    }
  }, 30000) // 30s timeout for AI query
})
```

---

### Mojo IPC Integration Tests

```
// consent_manager_mojo_test.cc
#include "toubkal/browser/consent/consent_manager.h"
#include "toubkal/common/consent.mojom.h"

#include "base/run_loop.h"
#include "base/test/bind.h"
#include "base/test/task_environment.h"
#include "mojo/public/cpp/bindings/remote.h"
#include "testing/gtest/include/gtest/gtest.h"

namespace toubkal {

class ConsentManagerMojoTest : public testing::Test {
 protected:
  void SetUp() override {
    impl_ = std::make_unique<ConsentManagerImpl>();
    remote_.Bind(impl_->BindNewPipeAndPassRemote());
  }

  base::test::TaskEnvironment task_environment_;
  std::unique_ptr<ConsentManagerImpl> impl_;
  mojo::Remote<mojom::ConsentManager> remote_;
};

TEST_F(ConsentManagerMojoTest, RequestConsentViaIPC) {
  base::RunLoop run_loop;

  auto request = mojom::ConsentRequest::New();
  request->action_type = "AI_QUERY";
  request->user_id = "test_user";

  remote_->RequestConsent(
      std::move(request),
      base::BindLambdaForTesting(
          [&](mojom::ConsentResponsePtr response) {
            EXPECT_TRUE(response->granted);
            EXPECT_GT(response->timestamp, 0);
            run_loop.Quit();
          }));

  run_loop.Run();
}

}  // namespace toubkal
```

---

## End-to-End Testing

### Browser Automation (Playwright)

**Test Full User Flows**:

```
// e2e/consent-flow.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Consent Flow', () => {
  test('should request consent for AI query', async ({ page }) => {
    // Navigate to browser
    await page.goto('toubkal://settings')

    // Click AI settings
    await page.click('text=AI Settings')

    // Trigger AI query (requires consent)
    await page.fill('[data-testid=ai-prompt]', 'What is privacy?')
    await page.click('[data-testid=ai-submit]')

    // Consent banner should appear
    await expect(page.locator('[data-testid=consent-banner]')).toBeVisible()
    await expect(page.locator('text=/AI query requires consent/i')).toBeVisible()

    // Grant consent
    await page.click('button:has-text("Grant")')

    // Consent banner should disappear
    await expect(page.locator('[data-testid=consent-banner]')).toBeHidden()

    // AI response should appear
    await expect(page.locator('[data-testid=ai-response]')).toBeVisible({ timeout: 30000 })
  })

  test('should persist consent across sessions', async ({ page, context }) => {
    // Grant consent in first session
    await page.goto('toubkal://settings')
    await page.click('text=AI Settings')
    await page.fill('[data-testid=ai-prompt]', 'Test query')
    await page.click('[data-testid=ai-submit]')
    await page.click('button:has-text("Grant")')

    // Close and reopen browser
    await page.close()
    const newPage = await context.newPage()

    // Trigger AI query again
    await newPage.goto('toubkal://settings')
    await newPage.click('text=AI Settings')
    await newPage.fill('[data-testid=ai-prompt]', 'Another query')
    await newPage.click('[data-testid=ai-submit]')

    // Consent banner should NOT appear (already granted)
    await expect(newPage.locator('[data-testid=consent-banner]')).toBeHidden()
    await expect(newPage.locator('[data-testid=ai-response]')).toBeVisible({ timeout: 30000 })
  })
})
```

---

## Mocking Strategies

### Mock Ollama Client

```
// src/__mocks__/ollama-client.ts
import { vi } from 'vitest'

export const mockOllamaClient = {
  query: vi.fn().mockResolvedValue({
    success: true,
    data: {
      text: 'Mock AI response',
      tokens: 50,
      latency: 100
    }
  }),

  listModels: vi.fn().mockResolvedValue({
    success: true,
    data: [
      { id: 'llama3.2', size: 2.1e9, parameters: '3B' }
    ]
  }),

  health: vi.fn().mockResolvedValue({
    success: true,
    data: { status: 'healthy' }
  })
}

// Usage in tests
vi.mock('@/services/ollama-client', () => ({
  OllamaClient: vi.fn().mockImplementation(() => mockOllamaClient)
}))
```

---

### Mock Mojo IPC

```
// src/__mocks__/consent-manager.ts
import { vi } from 'vitest'

export const mockConsentManager = {
  requestConsent: vi.fn().mockResolvedValue({
    granted: true,
    timestamp: Date.now(),
    consentId: 'mock-consent-id'
  }),

  hasConsent: vi.fn().mockResolvedValue(true),

  revokeConsent: vi.fn().mockResolvedValue(true)
}

// Usage
vi.mock('@/core/ipc/consent-manager', () => ({
  getConsentManager: () => mockConsentManager
}))
```

---

## Performance Testing

### Bundle Size Testing

```
// scripts/check-bundle-size.ts
import { readFile } from 'fs/promises'
import { gzipSync } from 'zlib'

const MAX_BUNDLE_SIZE = 200 * 1024 // 200KB gzipped

async function checkBundleSize() {
  const bundle = await readFile('dist/toubkal-ui.js')
  const gzipped = gzipSync(bundle)

  console.log(`Bundle size: ${(gzipped.length / 1024).toFixed(2)} KB`)

  if (gzipped.length > MAX_BUNDLE_SIZE) {
    throw new Error(`Bundle too large: ${gzipped.length} bytes (max: ${MAX_BUNDLE_SIZE})`)
  }
}

checkBundleSize().catch(console.error)
```

---

### Lighthouse Performance Testing

```
// e2e/performance.spec.ts
import { test, expect } from '@playwright/test'
import { playAudit } from 'playwright-lighthouse'

test('should meet Lighthouse performance targets', async ({ page }) => {
  await page.goto('toubkal://settings')

  await playAudit({
    page,
    thresholds: {
      performance: 90,
      accessibility: 95,
      'best-practices': 90,
      seo: 80
    }
  })
})
```

---

## Security Testing

### XSS Prevention Tests

```
// src/components/AISidebar/AISidebar.security.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { AISidebar } from './AISidebar'

describe('AISidebar Security', () => {
  it('should sanitize AI responses with script tags', () => {
    // Arrange
    const maliciousResponse = '<script>alert("XSS")</script>Hello'

    // Act
    render(<AISidebar response={maliciousResponse} />)

    // Assert - script should be sanitized
    expect(screen.queryByText(/alert/i)).not.toBeInTheDocument()
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('should sanitize AI responses with event handlers', () => {
    // Arrange
    const maliciousResponse = '<img src=x onerror="alert(1)">'

    // Act
    render(<AISidebar response={maliciousResponse} />)

    // Assert - onerror should be removed
    const img = screen.queryByRole('img')
    expect(img).not.toHaveAttribute('onerror')
  })
})
```

---

## Coverage Requirements

### Minimum Coverage Targets

| Component            | Unit | Integration | E2E |
| -------------------- | ---- | ----------- | --- |
| **Core Logic**       | 80%  | 60%         | N/A |
| **UI Components**    | 70%  | N/A         | 50% |
| **API Services**     | 80%  | 80%         | N/A |
| **Privacy Features** | 90%  | 80%         | 80% |

### Coverage Commands

```
# TypeScript/React coverage
pnpm test --coverage

# C++ coverage
ninja -C out/Debug coverage
genhtml out/Debug/coverage.info -o out/Debug/coverage_html
```

---

## Common Pitfalls

### 1. Flaky Tests (Race Conditions)

**❌ Bad**:

```
it('loads data', () => {
  render(<Component />)
  expect(screen.getByText('Data')).toBeInTheDocument() // Fails intermittently
})
```

**✅ Good**:

```
it('loads data', async () => {
  render(<Component />)
  await waitFor(() => {
    expect(screen.getByText('Data')).toBeInTheDocument()
  })
})
```

---

### 2. Not Cleaning Up Mocks

**❌ Bad**:

```
it('test 1', () => {
  vi.mock('./service')
  // Test logic
}) // Mock persists!

it('test 2', () => {
  // Uses mock from test 1!
})
```

**✅ Good**:

```
describe('Tests', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('test 1', () => { ... })
  it('test 2', () => { ... })
})
```

---

### 3. Testing Implementation Details

**❌ Bad**:

```
it('uses useState', () => {
  const { result } = renderHook(() => useConsent())
  expect(result.current).toBe(initialState) // Testing React internals
})
```

**✅ Good**:

```
it('displays loading state initially', () => {
  render(<ConsentBanner />)
  expect(screen.getByText('Loading...')).toBeInTheDocument()
})
```

---

## See Also

- **[CODING-RULES.md](../../CODING-RULES.md)** - Quick reference for critical rules
- **[Code Style Guide](code-style.md)** - Language-specific coding patterns
- **[Build Instructions](build-instructions.md)** - Chromium build system setup
- **[Architecture Overview](../architecture/ARCHITECTURE-OVERVIEW.md)** - System architecture
- **[PRD](../TOUBKAL-PRD.md)** - Product requirements and specifications
- **[Security Policy](../SECURITY.md)** - Security testing requirements

---

**Last Updated**: 2025-10-18
**Questions?** Email: dev@toubkal.app
