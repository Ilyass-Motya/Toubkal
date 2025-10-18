# Code Style Guide

**Last Updated**: 2025-10-18
**Status**: Active
**Audience**: Developers (Deep Dive - For Learning)

This guide provides **language-specific coding patterns** for Toubkal Browser. For **quick reference rules** (AI agents), see [CODING-RULES.md](../../CODING-RULES.md).

---

## Table of Contents

1. [TypeScript/React Style](#typescriptreact-style)
2. [C++ Style (Chromium)](#c-style-chromium)
3. [Python Style](#python-style)
4. [CSS/Tailwind Style](#csstailwind-style)
5. [File Organization](#file-organization)

---

## TypeScript/React Style

### Component Structure

**Functional Components Only** (No class components):

```typescript
// ✅ CORRECT: Functional component with TypeScript
import React, { useState, useEffect } from 'react'
import type { FC } from 'react'

interface AISidebarProps {
  modelId: string
  onClose: () => void
}

export const AISidebar: FC<AISidebarProps> = ({ modelId, onClose }) => {
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Side effects here
  }, [modelId])

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-lg">
      {/* Component content */}
    </div>
  )
}
```

---

### TypeScript Configuration

**Use Strict Mode** (always enabled):

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

**Never use `any`**:

```typescript
// ❌ WRONG
function process(data: any) { ... }

// ✅ CORRECT
function process(data: unknown) {
  if (typeof data === 'object' && data !== null) {
    // Type guard, then use
  }
}

// ✅ BETTER: Proper typing
interface ProcessData {
  id: string
  timestamp: number
}

function process(data: ProcessData) { ... }
```

---

### Hooks Patterns

**Custom Hooks** (always start with `use`):

```typescript
// ✅ CORRECT: Custom hook in use-consent.ts
import { useState, useEffect } from 'react'
import type { Result } from '@/shared/types'

interface ConsentStatus {
  granted: boolean
  timestamp: number
}

export const useConsent = (actionType: string) => {
  const [status, setStatus] = useState<ConsentStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchConsent = async () => {
      try {
        const result = await toubkal.consent.getStatus(actionType)
        if (result.success) {
          setStatus(result.data)
        } else {
          setError(result.error)
        }
      } catch (e) {
        setError('Failed to fetch consent')
      } finally {
        setLoading(false)
      }
    }

    fetchConsent()
  }, [actionType])

  return { status, loading, error }
}
```

---

### React Context Pattern

```typescript
// ✅ CORRECT: Context with TypeScript
import React, { createContext, useContext, useState, type FC, type ReactNode } from 'react'

interface AIContextValue {
  modelId: string | null
  setModelId: (id: string) => void
}

const AIContext = createContext<AIContextValue | undefined>(undefined)

export const AIProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [modelId, setModelId] = useState<string | null>(null)

  return (
    <AIContext.Provider value={{ modelId, setModelId }}>
      {children}
    </AIContext.Provider>
  )
}

export const useAI = () => {
  const context = useContext(AIContext)
  if (!context) {
    throw new Error('useAI must be used within AIProvider')
  }
  return context
}
```

---

## C++ Style (Chromium)

### Naming Conventions

**Files**:

```
consent_manager.h        // Header
consent_manager.cc       // Implementation
consent_manager_test.cc  // Tests
BUILD.gn                 // Build config
```

**Classes and Members**:

```cpp
// ✅ CORRECT: Chromium naming
class ConsentManager {
 public:
  // PascalCase methods
  bool HasConsent(const std::string& action_type);
  void RequestConsent(ConsentRequest request,
                      RequestConsentCallback callback);

 private:
  // snake_case members with trailing underscore
  std::string user_id_;
  base::flat_map<std::string, ConsentEntry> cache_;

  // PascalCase private methods
  void OnConsentResponse(bool granted);
};
```

---

### Include Order (Chromium Standard)

```cpp
// 1. Own header FIRST
#include "toubkal/browser/consent/consent_manager.h"

// 2. C++ standard library
#include <memory>
#include <string>
#include <vector>

// 3. Chromium base libraries
#include "base/functional/callback.h"
#include "base/logging.h"
#include "base/memory/weak_ptr.h"

// 4. Mojo interfaces
#include "mojo/public/cpp/bindings/receiver.h"
#include "mojo/public/cpp/bindings/remote.h"

// 5. Toubkal headers
#include "toubkal/browser/audit/audit_logger.h"
#include "toubkal/common/consent_types.h"
```

---

### Memory Management

**Use Smart Pointers** (never raw pointers for ownership):

```cpp
// ✅ CORRECT: Smart pointers
class ConsentManager {
 private:
  std::unique_ptr<AuditLogger> audit_logger_;  // Owns logger
  base::WeakPtr<BrowserContext> context_;      // Non-owning reference
};

// ❌ WRONG: Raw pointer (ambiguous ownership)
AuditLogger* audit_logger_;
```

**Chromium Base Types**:

```cpp
// Use Chromium base types
base::flat_map<std::string, int> cache_;  // Not std::map
base::flat_set<std::string> ids_;         // Not std::set
```

---

### Logging (Chromium Macros)

```cpp
// ✅ CORRECT: Chromium logging
LOG(INFO) << "Consent granted for " << action_type;
LOG(WARNING) << "Consent expired for user " << user_id_;
LOG(ERROR) << "Failed to verify signature: " << error;

// Debug-only checks (removed in Release builds)
DCHECK(entry.signature) << "Signature required";
DCHECK_EQ(status, Status::kValid);

// ❌ NEVER use std::cout or printf
std::cout << "Debug message";  // FORBIDDEN
printf("Error: %s\n", error);  // FORBIDDEN
```

---

### Mojo Interface Implementation

```cpp
// ✅ CORRECT: Mojo service implementation
class ConsentManagerImpl : public toubkal::mojom::ConsentManager {
 public:
  explicit ConsentManagerImpl();
  ~ConsentManagerImpl() override;

  // Implement interface methods
  void RequestConsent(
      toubkal::mojom::ConsentRequestPtr request,
      RequestConsentCallback callback) override;

  void HasConsent(
      const std::string& action_type,
      const std::string& user_id,
      HasConsentCallback callback) override;

 private:
  mojo::Receiver<toubkal::mojom::ConsentManager> receiver_{this};
};
```

---

## Python Style

**Follow PEP 8** with Toubkal-specific rules.

### Build Scripts

```python
#!/usr/bin/env python3
"""Build script for Toubkal browser."""

import argparse
import subprocess
import sys
from pathlib import Path


def build_toubkal(target: str, output_dir: Path) -> int:
    """Build Toubkal browser.

    Args:
        target: Build target (Debug or Release)
        output_dir: Output directory for build artifacts

    Returns:
        Exit code (0 = success)
    """
    cmd = [
        'autoninja',
        '-C', str(output_dir),
        'toubkal'
    ]

    try:
        subprocess.check_call(cmd)
        return 0
    except subprocess.CalledProcessError as e:
        print(f'Build failed: {e}', file=sys.stderr)
        return 1


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Build Toubkal')
    parser.add_argument('--target', default='Debug', choices=['Debug', 'Release'])
    args = parser.parse_args()

    sys.exit(build_toubkal(args.target, Path(f'out/{args.target}')))
```

---

## CSS/Tailwind Style

### Tailwind Classes Only

**Never use inline styles**:

```tsx
// ❌ WRONG: Inline styles
<div style={{ color: 'red', fontSize: '14px' }}>Text</div>

// ✅ CORRECT: Tailwind classes
<div className="text-red-500 text-sm">Text</div>
```

### Component-Specific Classes

**Use Tailwind @apply for reusable patterns**:

```css
/* src/components/ConsentBanner/ConsentBanner.module.css */
.banner {
  @apply fixed bottom-0 left-0 right-0 bg-white shadow-lg p-4;
  @apply border-t-2 border-toubkal-primary;
}

.banner-button {
  @apply px-4 py-2 rounded-lg font-medium transition-colors;
  @apply hover:bg-toubkal-primary hover:text-white;
}
```

---

## File Organization

### TypeScript/React Project Structure

```
src/
├── components/              # React components
│   ├── AISidebar/
│   │   ├── AISidebar.tsx
│   │   ├── AISidebar.test.tsx
│   │   └── index.ts
│   └── ConsentBanner/
│       ├── ConsentBanner.tsx
│       ├── ConsentBanner.test.tsx
│       └── index.ts
│
├── hooks/                   # Custom hooks
│   ├── use-consent.ts
│   ├── use-audit-logs.ts
│   └── index.ts
│
├── services/                # Business logic
│   ├── ollama-client.ts
│   ├── audit-logger.ts
│   └── index.ts
│
├── shared/                  # Shared utilities
│   ├── types/
│   │   ├── ConsentTypes.ts
│   │   ├── AuditLogTypes.ts
│   │   └── index.ts
│   └── utils/
│       ├── crypto.ts
│       └── index.ts
│
└── pages/                   # Top-level pages
    ├── SettingsPage.tsx
    └── PrivacyDashboard.tsx
```

---

## Naming Conventions Summary

| Type                 | Convention              | Example               |
| -------------------- | ----------------------- | --------------------- |
| **React Components** | PascalCase              | `AISidebar.tsx`       |
| **Hooks**            | kebab-case (use prefix) | `use-consent.ts`      |
| **Services**         | kebab-case              | `ollama-client.ts`    |
| **Types/Interfaces** | PascalCase              | `ConsentTypes.ts`     |
| **C++ Classes**      | PascalCase              | `ConsentManager`      |
| **C++ Files**        | snake_case              | `consent_manager.cc`  |
| **C++ Members**      | snake*case*             | `user_id_`            |
| **Python Functions** | snake_case              | `def build_toubkal()` |

---

## See Also

- **[CODING-RULES.md](../../CODING-RULES.md)** - Quick reference for AI agents
- **[Testing Strategy](testing-strategy.md)** - Testing patterns
- **[Build Instructions](build-instructions.md)** - Build system details
- **[ARCHITECTURE-OVERVIEW.md](../architecture/ARCHITECTURE-OVERVIEW.md)** - System architecture
- **[PRD](../TOUBKAL-PRD.md)** - Product requirements and technical specifications
- **[Product Roadmap](../PRODUCT-ROADMAP.md)** - Development timeline and milestones

---

**Last Updated**: 2025-10-18
**Questions?** Email: dev@toubkal.app
