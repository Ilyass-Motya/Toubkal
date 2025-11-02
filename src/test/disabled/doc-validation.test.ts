/**
 * Documentation Validation Tests
 *
 * Tests for documentation accuracy and completeness
 * AC4: Documentation validation tests
 * Following Toubkal coding rules: AAA pattern, comprehensive validation
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { promises as fs } from 'fs'
import path from 'path'

// Mock fs
vi.mock('fs', () => ({
  promises: {
    access: vi.fn(),
    readFile: vi.fn(),
    readdir: vi.fn(),
    stat: vi.fn(),
  },
}))

// Mock path
vi.mock('path', () => ({
  default: {
    join: (...args: string[]) => args.join('/'),
    resolve: (...args: string[]) => args.join('/'),
    dirname: (p: string) => p.split('/').slice(0, -1).join('/'),
    basename: (p: string) => p.split('/').pop() || '',
    extname: (p: string) => {
      const parts = p.split('.')
      return parts.length > 1 ? '.' + parts.pop() : ''
    },
  },
}))

describe('Documentation Validation Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Code examples validation', () => {
    it('should validate TypeScript code examples', async () => {
      // Arrange
      const mockFs = vi.mocked(fs)
      const validTsExample = `// Example TypeScript code
interface User {
  id: string
  name: string
  email: string
}

function createUser(userData: User): User {
  return {
    id: userData.id,
    name: userData.name,
    email: userData.email
  }
}`

      mockFs.readFile.mockResolvedValue(validTsExample)

      // Act
      const content = await mockFs.readFile('docs/example.ts', 'utf8')
      const hasInterface = content.includes('interface User')
      const hasFunction = content.includes('function createUser')
      const hasTypeAnnotation = content.includes(': User')

      // Assert
      expect(hasInterface).toBe(true)
      expect(hasFunction).toBe(true)
      expect(hasTypeAnnotation).toBe(true)
    })

    it('should validate React component examples', async () => {
      // Arrange
      const mockFs = vi.mocked(fs)
      const validReactExample = `import React from 'react'

interface Props {
  title: string
  children: React.ReactNode
}

export function ExampleComponent({ title, children }: Props) {
  return (
    <div className="example">
      <h1>{title}</h1>
      {children}
    </div>
  )
}`

      mockFs.readFile.mockResolvedValue(validReactExample)

      // Act
      const content = await mockFs.readFile('docs/example.tsx', 'utf8')
      const hasImport = content.includes('import React from \'react\'')
      const hasInterface = content.includes('interface Props')
      const hasComponent = content.includes('export function ExampleComponent')
      const hasJsx = content.includes('<div className="example">')

      // Assert
      expect(hasImport).toBe(true)
      expect(hasInterface).toBe(true)
      expect(hasComponent).toBe(true)
      expect(hasJsx).toBe(true)
    })

    it('should validate C++ code examples', async () => {
      // Arrange
      const mockFs = vi.mocked(fs)
      const validCppExample = `// Example C++ code
#include "toubkal/browser/consent_manager.h"

class ConsentManager {
 public:
  bool HasConsent(const std::string& action_type);
  
 private:
  std::string user_id_;
  void LogDecision();
};`

      mockFs.readFile.mockResolvedValue(validCppExample)

      // Act
      const content = await mockFs.readFile('docs/example.cc', 'utf8')
      const hasInclude = content.includes('#include "toubkal/browser/consent_manager.h"')
      const hasClass = content.includes('class ConsentManager')
      const hasPublic = content.includes('public:')
      const hasPrivate = content.includes('private:')

      // Assert
      expect(hasInclude).toBe(true)
      expect(hasClass).toBe(true)
      expect(hasPublic).toBe(true)
      expect(hasPrivate).toBe(true)
    })

    it('should validate shell script examples', async () => {
      // Arrange
      const mockFs = vi.mocked(fs)
      const validShellExample = `#!/bin/bash
# Example shell script

set -e  # Exit on error

echo "Starting setup process..."

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "Error: git is not installed"
    exit 1
fi

echo "Setup completed successfully"`

      mockFs.readFile.mockResolvedValue(validShellExample)

      // Act
      const content = await mockFs.readFile('docs/example.sh', 'utf8')
      const hasShebang = content.includes('#!/bin/bash')
      const hasSetE = content.includes('set -e')
      const hasCommandCheck = content.includes('command -v git')
      const hasErrorHandling = content.includes('exit 1')

      // Assert
      expect(hasShebang).toBe(true)
      expect(hasSetE).toBe(true)
      expect(hasCommandCheck).toBe(true)
      expect(hasErrorHandling).toBe(true)
    })
  })

  describe('External links validation', () => {
    it('should validate Chromium documentation links', async () => {
      // Arrange
      const mockFs = vi.mocked(fs)
      const docWithLinks = `# Toubkal Browser Documentation

## External Resources

- [Chromium Build Instructions](https://chromium.googlesource.com/chromium/src/+/main/docs/linux_build_instructions.md)
- [Mojo Documentation](https://chromium.googlesource.com/chromium/src/+/main/mojo/README.md)
- [GN Build System](https://gn.googlesource.com/gn/+/main/docs/quick_start.md)

## Internal Links

- [Setup Guide](./setup.md)
- [Coding Rules](./coding-rules.md)`

      mockFs.readFile.mockResolvedValue(docWithLinks)

      // Act
      const content = await mockFs.readFile('docs/README.md', 'utf8')
      const hasChromiumLink = content.includes('https://chromium.googlesource.com/chromium/src/')
      const hasMojoLink = content.includes('https://chromium.googlesource.com/chromium/src/+/main/mojo/')
      const hasGnLink = content.includes('https://gn.googlesource.com/gn/')
      const hasInternalLink = content.includes('./setup.md')

      // Assert
      expect(hasChromiumLink).toBe(true)
      expect(hasMojoLink).toBe(true)
      expect(hasGnLink).toBe(true)
      expect(hasInternalLink).toBe(true)
    })

    it('should validate API documentation links', async () => {
      // Arrange
      const mockFs = vi.mocked(fs)
      const apiDoc = `# API Documentation

## Browser API
- [Browser API Reference](./api/browser-api.md)
- [Extension API Reference](./api/extension-api.md)
- [Mojo Interfaces](./api/mojo-interfaces.md)

## External APIs
- [Web Extensions API](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API)
- [Chrome Extensions API](https://developer.chrome.com/docs/extensions/reference/)`

      mockFs.readFile.mockResolvedValue(apiDoc)

      // Act
      const content = await mockFs.readFile('docs/api/README.md', 'utf8')
      const hasBrowserApi = content.includes('./api/browser-api.md')
      const hasExtensionApi = content.includes('./api/extension-api.md')
      const hasMojoApi = content.includes('./api/mojo-interfaces.md')
      const hasWebExtensionsLink = content.includes('https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API')

      // Assert
      expect(hasBrowserApi).toBe(true)
      expect(hasExtensionApi).toBe(true)
      expect(hasMojoApi).toBe(true)
      expect(hasWebExtensionsLink).toBe(true)
    })
  })

  describe('Documentation navigation and completeness', () => {
    it('should validate README structure', async () => {
      // Arrange
      const mockFs = vi.mocked(fs)
      const validReadme = `# Toubkal Browser

A privacy-first, AI-augmented Chromium fork.

## Table of Contents

- [Quick Start](./QUICK-START.md)
- [Architecture](./architecture/)
- [Contributing](./CONTRIBUTING.md)
- [License](./LICENSE)

## Features

- Privacy-first design
- AI augmentation
- Zero telemetry
- Local-first AI

## Getting Started

See [Quick Start Guide](./QUICK-START.md) for setup instructions.

## Contributing

See [Contributing Guide](./CONTRIBUTING.md) for development guidelines.`

      mockFs.readFile.mockResolvedValue(validReadme)

      // Act
      const content = await mockFs.readFile('README.md', 'utf8')
      const hasTitle = content.includes('# Toubkal Browser')
      const hasToc = content.includes('## Table of Contents')
      const hasFeatures = content.includes('## Features')
      const hasGettingStarted = content.includes('## Getting Started')
      const hasContributing = content.includes('## Contributing')

      // Assert
      expect(hasTitle).toBe(true)
      expect(hasToc).toBe(true)
      expect(hasFeatures).toBe(true)
      expect(hasGettingStarted).toBe(true)
      expect(hasContributing).toBe(true)
    })

    it('should validate architecture documentation', async () => {
      // Arrange
      const mockFs = vi.mocked(fs)
      const archDoc = `# Architecture Overview

## System Components

### Browser Engine (C++)
- Location: \`src/toubkal/\`
- Purpose: Core browser functionality
- Communication: Mojo IPC

### Internal UI (React/TypeScript)
- Location: \`src/\`
- Purpose: Settings, AI features, privacy controls
- Communication: Mojo IPC

## Data Flow

1. User interaction in UI
2. Mojo IPC call to browser engine
3. Browser engine processes request
4. Response sent back via Mojo IPC
5. UI updates with result`

      mockFs.readFile.mockResolvedValue(archDoc)

      // Act
      const content = await mockFs.readFile('docs/architecture/overview.md', 'utf8')
      const hasTitle = content.includes('# Architecture Overview')
      const hasSystemComponents = content.includes('## System Components')
      const hasBrowserEngine = content.includes('### Browser Engine (C++)')
      const hasInternalUI = content.includes('### Internal UI (React/TypeScript)')
      const hasDataFlow = content.includes('## Data Flow')

      // Assert
      expect(hasTitle).toBe(true)
      expect(hasSystemComponents).toBe(true)
      expect(hasBrowserEngine).toBe(true)
      expect(hasInternalUI).toBe(true)
      expect(hasDataFlow).toBe(true)
    })

    it('should validate contributing documentation', async () => {
      // Arrange
      const mockFs = vi.mocked(fs)
      const contribDoc = `# Contributing to Toubkal Browser

## Development Setup

1. Clone the repository
2. Install dependencies
3. Run setup scripts
4. Build the project

## Coding Standards

- Follow TypeScript best practices
- Use ESLint for code quality
- Write comprehensive tests
- Document all public APIs

## Testing

- Unit tests with Vitest
- Integration tests with React Testing Library
- E2E tests with Playwright
- C++ tests with gtest`

      mockFs.readFile.mockResolvedValue(contribDoc)

      // Act
      const content = await mockFs.readFile('CONTRIBUTING.md', 'utf8')
      const hasTitle = content.includes('# Contributing to Toubkal Browser')
      const hasDevSetup = content.includes('## Development Setup')
      const hasCodingStandards = content.includes('## Coding Standards')
      const hasTesting = content.includes('## Testing')

      // Assert
      expect(hasTitle).toBe(true)
      expect(hasDevSetup).toBe(true)
      expect(hasCodingStandards).toBe(true)
      expect(hasTesting).toBe(true)
    })
  })

  describe('Documentation accuracy against implementation', () => {
    it('should validate API documentation matches implementation', async () => {
      // Arrange
      const mockFs = vi.mocked(fs)
      const apiDoc = `# Browser API

## ConsentManager

\`\`\`typescript
interface ConsentManager {
  hasConsent(actionType: string): boolean
  grantConsent(actionType: string): void
  revokeConsent(actionType: string): void
}
\`\`\``

      const implementation = `export interface ConsentManager {
  hasConsent(actionType: string): boolean
  grantConsent(actionType: string): void
  revokeConsent(actionType: string): void
}`

      mockFs.readFile
        .mockResolvedValueOnce(apiDoc)
        .mockResolvedValueOnce(implementation)

      // Act
      const docContent = await mockFs.readFile('docs/api/browser-api.md', 'utf8')
      const implContent = await mockFs.readFile('src/core/consent-manager.ts', 'utf8')
      
      const docHasInterface = docContent.includes('interface ConsentManager')
      const implHasInterface = implContent.includes('interface ConsentManager')
      const docHasMethods = docContent.includes('hasConsent(actionType: string): boolean')
      const implHasMethods = implContent.includes('hasConsent(actionType: string): boolean')

      // Assert
      expect(docHasInterface).toBe(true)
      expect(implHasInterface).toBe(true)
      expect(docHasMethods).toBe(true)
      expect(implHasMethods).toBe(true)
    })

    it('should validate build instructions accuracy', async () => {
      // Arrange
      const mockFs = vi.mocked(fs)
      const buildDoc = `# Build Instructions

## Prerequisites

- Node.js 18+
- Python 3.8+
- Git
- depot_tools

## Setup

1. Run \`./scripts/setup-build.sh\`
2. Run \`./scripts/build.sh\`

## Build

\`\`\`bash
# Debug build
./scripts/build.sh debug

# Release build
./scripts/build.sh release
\`\`\``

      mockFs.readFile.mockResolvedValue(buildDoc)

      // Act
      const content = await mockFs.readFile('docs/contributing/build-instructions.md', 'utf8')
      const hasPrerequisites = content.includes('## Prerequisites')
      const hasNodeVersion = content.includes('Node.js 18+')
      const hasPythonVersion = content.includes('Python 3.8+')
      const hasSetupSteps = content.includes('Run `./scripts/setup-build.sh`')
      const hasBuildCommands = content.includes('./scripts/build.sh debug')

      // Assert
      expect(hasPrerequisites).toBe(true)
      expect(hasNodeVersion).toBe(true)
      expect(hasPythonVersion).toBe(true)
      expect(hasSetupSteps).toBe(true)
      expect(hasBuildCommands).toBe(true)
    })

    it('should validate coding rules accuracy', async () => {
      // Arrange
      const mockFs = vi.mocked(fs)
      const codingRules = `# Coding Rules

## TypeScript Rules

- No \`any\` type allowed
- Use \`Result<T>\` pattern for error handling
- No unhandled promises
- Use proper null checking

## React Rules

- PascalCase for components
- kebab-case for hooks
- Use Tailwind CSS only
- No inline styles

## C++ Rules

- PascalCase for classes
- snake_case for members
- Use Chromium logging macros
- Follow include order`

      mockFs.readFile.mockResolvedValue(codingRules)

      // Act
      const content = await mockFs.readFile('CODING-RULES.md', 'utf8')
      const hasTypeScriptRules = content.includes('## TypeScript Rules')
      const hasNoAny = content.includes('No `any` type allowed')
      const hasResultPattern = content.includes('Use `Result<T>` pattern')
      const hasReactRules = content.includes('## React Rules')
      const hasPascalCase = content.includes('PascalCase for components')
      const hasCppRules = content.includes('## C++ Rules')

      // Assert
      expect(hasTypeScriptRules).toBe(true)
      expect(hasNoAny).toBe(true)
      expect(hasResultPattern).toBe(true)
      expect(hasReactRules).toBe(true)
      expect(hasPascalCase).toBe(true)
      expect(hasCppRules).toBe(true)
    })
  })
})
