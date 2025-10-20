#!/usr/bin/env node

/**
 * Documentation Template Generator
 *
 * This script generates documentation templates for different types of documents
 * to ensure consistency across the Toubkal Browser project.
 *
 * Usage:
 *   npm run generate-doc-template <type> <filename>
 *   node src/scripts/generate-doc-template.ts <type> <filename>
 *
 * Types:
 *   - prd: Product Requirements Document
 *   - architecture: Architecture document
 *   - contributing: Contributing guide
 *   - api: API documentation
 *   - story: User story
 *   - adr: Architecture Decision Record
 */

import { writeFileSync, existsSync } from 'fs'
import { join } from 'path'
import { program } from 'commander'

interface DocTemplate {
  filename: string
  content: string
}

const TEMPLATES: Record<string, DocTemplate> = {
  prd: {
    filename: 'TOUBKAL-PRD-TEMPLATE.md',
    content: `# **Toubkal Browser — Product Requirements Document (PRD)**

---

**Document Type:** PRD — Strategic & Functional Specification  
**Project:** Toubkal Browser  
**Version:** 1.0
**Owner:** [Your Name]
**Last Updated:** ${new Date().toISOString().split('T')[0]}  
**Audience:** Product, Engineering, QA, Security

---

## **1. Vision & Objectives**

### Vision

[Describe the vision for this feature/component]

### Objectives

**1. [Objective 1]**

- [Specific goal 1]
- [Specific goal 2]
- [Specific goal 3]

**2. [Objective 2]**

- [Specific goal 1]
- [Specific goal 2]
- [Specific goal 3]

---

## **2. Requirements**

### Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-001 | [Requirement description] | High | Pending |
| FR-002 | [Requirement description] | Medium | Pending |
| FR-003 | [Requirement description] | Low | Pending |

### Non-Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| NFR-001 | [Performance requirement] | High | Pending |
| NFR-002 | [Security requirement] | High | Pending |
| NFR-003 | [Usability requirement] | Medium | Pending |

---

## **3. Technical Specifications**

### Architecture

[Describe the technical architecture]

### Dependencies

- [Dependency 1]
- [Dependency 2]
- [Dependency 3]

### Implementation Plan

1. **Phase 1:** [Description]
2. **Phase 2:** [Description]
3. **Phase 3:** [Description]

---

## **4. Acceptance Criteria**

- [ ] [Criterion 1]
- [ ] [Criterion 2]
- [ ] [Criterion 3]

---

## **5. Risks & Mitigation**

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| [Risk 1] | High | Medium | [Mitigation strategy] |
| [Risk 2] | Medium | High | [Mitigation strategy] |

---

## **6. Success Metrics**

- [Metric 1]: [Target value]
- [Metric 2]: [Target value]
- [Metric 3]: [Target value]

---

## **7. References**

- [Reference 1]
- [Reference 2]
- [Reference 3]
`,
  },

  architecture: {
    filename: 'ARCHITECTURE-TEMPLATE.md',
    content: `# [Component Name] Architecture

**Last Updated:** ${new Date().toISOString().split('T')[0]}
**Status:** Draft
**Audience:** Developers, Architects

---

## Overview

[Brief description of the component and its purpose]

## Design Goals

- [Goal 1]
- [Goal 2]
- [Goal 3]

## Architecture

### High-Level Design

\`\`\`
[Architecture diagram or description]
\`\`\`

### Components

| Component | Responsibility | Dependencies |
|-----------|----------------|--------------|
| [Component 1] | [Description] | [Dependencies] |
| [Component 2] | [Description] | [Dependencies] |

### Data Flow

1. [Step 1]
2. [Step 2]
3. [Step 3]

## Implementation

### Prerequisites

- [Prerequisite 1]
- [Prerequisite 2]

### Steps

1. **Step 1:** [Description]
   \`\`\`typescript
   // Code example
   \`\`\`

2. **Step 2:** [Description]
   \`\`\`typescript
   // Code example
   \`\`\`

### Verification

- [ ] [Test 1]
- [ ] [Test 2]
- [ ] [Test 3]

## Security Considerations

- [Security consideration 1]
- [Security consideration 2]

## Performance Considerations

- [Performance consideration 1]
- [Performance consideration 2]

## References

- [Reference 1]
- [Reference 2]
`,
  },

  contributing: {
    filename: 'CONTRIBUTING-TEMPLATE.md',
    content: `# Contributing Guide

**Last Updated:** ${new Date().toISOString().split('T')[0]}
**Status:** Active
**Audience:** Contributors, Developers

---

## Prerequisites

- [Prerequisite 1]
- [Prerequisite 2]
- [Prerequisite 3]

## Getting Started

### 1. Fork and Clone

\`\`\`bash
# Fork the repository on GitHub
# Clone your fork
git clone https://github.com/your-username/Toubkal.git
cd Toubkal
\`\`\`

### 2. Setup Development Environment

\`\`\`bash
# Install dependencies
npm install

# Run tests
npm test

# Run linting
npm run lint
\`\`\`

## Steps

### 1. Create a Branch

\`\`\`bash
git checkout -b feature/your-feature-name
\`\`\`

### 2. Make Changes

- Follow the coding standards in [CODING-RULES.md](../../CODING-RULES.md)
- Write tests for new functionality
- Update documentation as needed

### 3. Test Your Changes

\`\`\`bash
# Run all tests
npm test

# Run specific test file
npm test -- src/test/your-test.test.ts

# Run linting
npm run lint

# Check formatting
npm run format:check
\`\`\`

### 4. Commit Changes

\`\`\`bash
git add .
git commit -m "feat: add your feature description"
\`\`\`

### 5. Push and Create PR

\`\`\`bash
git push origin feature/your-feature-name
\`\`\`

## Verification

- [ ] All tests pass
- [ ] Linting passes
- [ ] Documentation updated
- [ ] Code follows style guidelines

## Code Style

- Use TypeScript for all new code
- Follow the patterns in existing code
- Write comprehensive tests
- Document public APIs

## Pull Request Guidelines

- Use descriptive titles
- Include a detailed description
- Reference related issues
- Include screenshots for UI changes

## References

- [CODING-RULES.md](../../CODING-RULES.md)
- [Testing Strategy](./testing-strategy.md)
- [Architecture Overview](../architecture/ARCHITECTURE-OVERVIEW.md)
`,
  },

  api: {
    filename: 'API-TEMPLATE.md',
    content: `# [API Name] API

**Last Updated:** ${new Date().toISOString().split('T')[0]}
**Version:** 1.0
**Status:** Active

---

## Overview

[Brief description of the API and its purpose]

## Authentication

[Describe authentication requirements]

## Base URL

\`\`\`
https://api.toubkal.com/v1
\`\`\`

## Endpoints

### [Endpoint 1]

**GET** \`/endpoint1\`

[Description of the endpoint]

#### Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| param1 | string | Yes | [Description] |
| param2 | number | No | [Description] |

#### Response

\`\`\`json
{
  "status": "success",
  "data": {
    "field1": "value1",
    "field2": "value2"
  }
}
\`\`\`

#### Example

\`\`\`bash
curl -X GET "https://api.toubkal.com/v1/endpoint1?param1=value1"
\`\`\`

### [Endpoint 2]

**POST** \`/endpoint2\`

[Description of the endpoint]

#### Request Body

\`\`\`json
{
  "field1": "value1",
  "field2": "value2"
}
\`\`\`

#### Response

\`\`\`json
{
  "status": "success",
  "data": {
    "id": "123",
    "created": "2025-01-18T10:00:00Z"
  }
}
\`\`\`

## Examples

### [Example 1]

[Description of the example]

\`\`\`typescript
// TypeScript example
const response = await fetch('/api/endpoint1', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer token'
  }
});
\`\`\`

### [Example 2]

[Description of the example]

\`\`\`javascript
// JavaScript example
fetch('/api/endpoint2', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer token'
  },
  body: JSON.stringify({
    field1: 'value1',
    field2: 'value2'
  })
});
\`\`\`

## Error Handling

| Code | Message | Description |
|------|---------|-------------|
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Invalid or missing authentication |
| 404 | Not Found | Resource not found |
| 500 | Internal Server Error | Server error |

## Rate Limiting

[Describe rate limiting policies]

## References

- [Reference 1]
- [Reference 2]
`,
  },

  story: {
    filename: 'STORY-TEMPLATE.md',
    content: `# Story: [Story Title]

**Status:** Draft
**Priority:** High
**Assignee:** [Your Name]
**Epic:** [Epic Name]
**Sprint:** [Sprint Name]

---

## Story

As a [user type], I want [functionality] so that [benefit].

## Acceptance Criteria

- [ ] [Criterion 1]
- [ ] [Criterion 2]
- [ ] [Criterion 3]

## Tasks

- [ ] [Task 1]
- [ ] [Task 2]
- [ ] [Task 3]

## Technical Notes

[Any technical considerations or implementation details]

## Dependencies

- [Dependency 1]
- [Dependency 2]

## Definition of Done

- [ ] Code implemented
- [ ] Tests written and passing
- [ ] Documentation updated
- [ ] Code reviewed
- [ ] Deployed to staging
- [ ] QA approved

## References

- [Reference 1]
- [Reference 2]
`,
  },

  adr: {
    filename: 'ADR-TEMPLATE.md',
    content: `# ADR-XXX: [Decision Title]

**Status:** Proposed
**Date:** ${new Date().toISOString().split('T')[0]}
**Deciders:** [List of deciders]
**Technical Story:** [Related story or issue]

---

## Context

[Describe the context and problem statement]

## Decision

[Describe the decision that was made]

## Consequences

### Positive

- [Positive consequence 1]
- [Positive consequence 2]

### Negative

- [Negative consequence 1]
- [Negative consequence 2]

### Neutral

- [Neutral consequence 1]
- [Neutral consequence 2]

## Alternatives Considered

### Alternative 1

[Description of alternative 1]

**Pros:**
- [Pro 1]
- [Pro 2]

**Cons:**
- [Con 1]
- [Con 2]

### Alternative 2

[Description of alternative 2]

**Pros:**
- [Pro 1]
- [Pro 2]

**Cons:**
- [Con 1]
- [Con 2]

## Implementation Notes

[Any notes about implementation]

## References

- [Reference 1]
- [Reference 2]
`,
  },
}

class DocTemplateGenerator {
  private outputDir: string

  constructor(outputDir: string = 'docs') {
    this.outputDir = outputDir
  }

  public generateTemplate(type: string, filename?: string): void {
    const template = TEMPLATES[type.toLowerCase()]

    if (template === undefined) {
      console.error(`❌ Unknown template type: ${type}`)
      console.log('Available types:', Object.keys(TEMPLATES).join(', '))
      process.exit(1)
    }

    const finalFilename = filename ?? template.filename
    const filePath = join(this.outputDir, finalFilename)

    if (existsSync(filePath)) {
      console.error(`❌ File already exists: ${filePath}`)
      process.exit(1)
    }

    try {
      writeFileSync(filePath, template.content, 'utf-8')
      console.log(`✅ Generated template: ${filePath}`)
      console.log(`📝 Template type: ${type}`)
      console.log(`📁 Output directory: ${this.outputDir}`)
    } catch (error) {
      console.error(`❌ Failed to generate template: ${error}`)
      process.exit(1)
    }
  }

  public listTemplates(): void {
    console.log('📋 Available Documentation Templates')
    console.log('=====================================')

    Object.entries(TEMPLATES).forEach(([type, template]) => {
      console.log(`\n${type.toUpperCase()}`)
      console.log(`  Filename: ${template.filename}`)
      console.log(`  Description: ${this.getTemplateDescription(type)}`)
    })
  }

  private getTemplateDescription(type: string): string {
    const descriptions: Record<string, string> = {
      prd: 'Product Requirements Document template',
      architecture: 'Architecture document template',
      contributing: 'Contributing guide template',
      api: 'API documentation template',
      story: 'User story template',
      adr: 'Architecture Decision Record template',
    }

    return descriptions[type] || 'Unknown template type'
  }
}

// CLI setup
program
  .name('generate-doc-template')
  .description('Generate documentation templates for Toubkal Browser')
  .version('1.0.0')

program
  .argument('<type>', 'Template type (prd, architecture, contributing, api, story, adr)')
  .argument('[filename]', 'Output filename (optional)')
  .option('-o, --output <dir>', 'Output directory', 'docs')
  .action((type, filename, options) => {
    const generator = new DocTemplateGenerator(options.output)
    generator.generateTemplate(type, filename)
  })

program
  .command('list')
  .description('List available templates')
  .action(() => {
    const generator = new DocTemplateGenerator()
    generator.listTemplates()
  })

program.parse()

export { DocTemplateGenerator }
