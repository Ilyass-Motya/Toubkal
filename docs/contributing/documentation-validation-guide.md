# Documentation Validation Guide

**Version:** 1.0  
**Last Updated:** 2025-10-18  
**Audience:** All Contributors  
**Status:** Active  

---

## Overview

Toubkal Browser uses automated documentation validation to maintain consistent, high-quality documentation across the project. This guide explains how to use the validation system and fix common issues.

## Prerequisites

- Node.js 18+ installed
- npm/pnpm package manager
- Git repository access
- Basic markdown knowledge

## Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Validation
```bash
npm run validate-docs
```

### 3. Fix Issues
```bash
npm run validate-docs:fix
```

## Verification

Run the following commands to verify the setup:

```bash
# Check validation works
npm run validate-docs

# Check auto-fix works  
npm run validate-docs:fix

# Check strict mode works
npm run validate-docs:strict
```

## Quick Start

### Basic Commands

```bash
# Validate all documentation
npm run validate-docs

# Auto-fix common issues
npm run validate-docs:fix

# Strict validation (used in CI/CD)
npm run validate-docs:strict

# Validate specific file
npm run validate-docs -- --file docs/README.md

# Validate specific directory
npm run validate-docs -- --dir docs/architecture

# Verbose output (see detailed errors)
npm run validate-docs -- --verbose
```

### Pre-Commit Integration

Documentation validation runs automatically when you commit changes to `.md`, `.xml`, or `.txt` files:

```bash
git add docs/new-feature.md
git commit -m "Add new feature documentation"
# ✅ Documentation validation runs automatically
# ❌ If validation fails, commit is blocked
```

---

## Document Types & Requirements

### PRD Documents (`*PRD*.md`)

**Required Metadata:**
- Version
- Last Updated  
- Owner
- Audience

**Required Sections:**
- Vision
- Objectives
- Requirements

**Example:**
```markdown
# Toubkal Browser PRD

**Version:** 1.0  
**Last Updated:** 2025-10-18  
**Owner:** Ilyass Motya  
**Audience:** Development Team  

## Vision
...

## Objectives
...

## Requirements
...
```

### ADRs (`*ADR*.md`)

**Required Metadata:**
- Status
- Date
- Deciders
- Technical Story

**Required Sections:**
- Context
- Decision
- Consequences

**Example:**
```markdown
# ADR-001: UI Framework Selection

**Status:** Accepted  
**Date:** 2025-10-18  
**Deciders:** Ilyass Motya, Hassan  
**Technical Story:** [Story-001](link)  

## Context
...

## Decision
...

## Consequences
...
```

### Architecture Docs (`docs/architecture/*.md`)

**Required Metadata:**
- Last Updated
- Status
- Audience

**Required Sections:**
- Overview
- Implementation

### API Docs (`docs/api/*.md`)

**Required Metadata:**
- Last Updated
- Version
- Status

**Required Sections:**
- Overview
- Endpoints
- Examples

**Must Include:**
- Code blocks (```)

### Stories (`docs/stories/*.md`)

**Required Metadata:**
- Status
- Priority
- Assignee

**Required Sections:**
- Story
- Acceptance Criteria
- Tasks

---

## Common Issues & Fixes

### 1. Missing Metadata

**Error:** `Missing required metadata: Last Updated`

**Fix:** Add metadata to document header:
```markdown
**Last Updated:** 2025-10-18
```

### 2. Missing Required Sections

**Error:** `Missing required sections: Overview, Implementation`

**Fix:** Add the required sections:
```markdown
## Overview
...

## Implementation
...
```

### 3. Forbidden Patterns

**Error:** `Found forbidden pattern: TODO`

**Fix:** Remove or replace TODO comments:
```markdown
<!-- ❌ Bad -->
**Note:** This feature will be implemented in Phase 2

<!-- ✅ Good -->
**Note:** This feature will be implemented in Phase 2
```

### 4. Trailing Whitespace

**Error:** `Line 15 has trailing whitespace`

**Fix:** Run auto-fix:
```bash
npm run validate-docs:fix
```

### 5. Heading Hierarchy

**Error:** `First heading should be H1`

**Fix:** Ensure first heading is H1:
```markdown
# Main Title (H1)
## Section (H2)
### Subsection (H3)
```

---

## Auto-Fix Capabilities

The validation system can automatically fix:

- ✅ **Trailing whitespace** removal
- ✅ **Line ending normalization** (Unix style)
- ✅ **Missing newlines** at end of files
- ✅ **Heading hierarchy** corrections
- ✅ **Consistent formatting**

**Note:** Auto-fix cannot resolve:
- ❌ Missing metadata (requires manual addition)
- ❌ Missing required sections (requires manual addition)
- ❌ Forbidden patterns (requires manual removal)

---

## CI/CD Integration

### Pre-Commit Hook

Documentation validation runs automatically on commits:

```bash
# When you commit documentation changes
git add docs/new-feature.md
git commit -m "Add feature docs"
# 📚 Checking documentation changes...
# 📝 Found documentation changes, validating...
# ✅ Documentation validation passed
```

### GitHub Actions

Documentation validation runs in CI/CD:

```yaml
- name: Validate documentation
  run: npm run validate-docs:strict
```

**If validation fails:**
- ❌ PR cannot be merged
- 🔧 Fix locally with `npm run validate-docs:fix`
- 📝 Add missing metadata/sections manually

---

## Best Practices

### 1. Document Structure

```markdown
# Document Title

**Version:** 1.0  
**Last Updated:** 2025-10-18  
**Owner:** Your Name  
**Audience:** Target Audience  

## Overview
Brief description of what this document covers.

## Implementation
Technical details and implementation notes.

## Examples
Code examples and usage patterns.
```

### 2. Metadata Consistency

- Use consistent date format: `2025-10-18`
- Use consistent version format: `1.0`, `2.1`, etc.
- Use consistent owner names
- Specify target audience clearly

### 3. Content Quality

- Include code examples for technical docs
- Use descriptive link text (not "click here")
- Include alt text for images
- Use proper table formatting
- Avoid TODO/FIXME comments in production docs

### 4. File Organization

```
docs/
├── adrs/           # Architecture Decision Records
├── api/            # API documentation
├── architecture/   # System architecture
├── contributing/   # Contributor guides
├── stories/        # User stories and epics
└── *.md           # Main project docs
```

---

## Troubleshooting

### Validation Fails on Commit

```bash
❌ Documentation validation failed
💡 Fix issues with: npm run validate-docs:fix
📖 See src/scripts/validate-documentation.ts for details
```

**Solution:**
1. Run `npm run validate-docs:fix` to auto-fix issues
2. Check remaining errors with `npm run validate-docs -- --verbose`
3. Add missing metadata/sections manually
4. Commit again

### CI/CD Fails

If GitHub Actions fails on documentation validation:

1. **Check the logs** for specific error messages
2. **Run locally** with the same command:
   ```bash
   npm run validate-docs:strict
   ```
3. **Fix issues** using the guide above
4. **Push fixes** to your branch

### Performance Issues

If validation is slow:

- Use `--file` flag to validate specific files
- Use `--dir` flag to validate specific directories
- Pre-commit hook only validates changed files

---

## Advanced Usage

### Custom Validation Rules

The validation rules are defined in `src/scripts/validate-documentation.ts`:

```typescript
const DOC_VALIDATION_RULES = {
  prd: {
    requiredMetadata: ['Version', 'Last Updated', 'Owner', 'Audience'],
    requiredSections: ['Vision', 'Objectives', 'Requirements'],
    // ... more rules
  }
}
```

### Excluding Files

To exclude files from validation, modify the `getAllDocFiles` function in the validation script.

### Custom Document Types

Add new document types by extending `DOC_VALIDATION_RULES` in the validation script.

---

## Support

### Getting Help

- **Documentation issues:** Check this guide first
- **Validation script bugs:** Create issue in repository
- **Rule changes:** Discuss in team meetings

### Team Training

New team members should:

1. **Read this guide** completely
2. **Run validation** on their first documentation change
3. **Ask questions** in team chat if unsure
4. **Practice** with test files before real changes

---

## Examples

### Good Documentation

```markdown
# API Reference: Consent Manager

**Version:** 1.2  
**Last Updated:** 2025-10-18  
**Owner:** Development Team  
**Audience:** API Consumers  

## Overview
The Consent Manager API provides endpoints for managing user consent decisions.

## Endpoints

### POST /api/consent/request
Request user consent for a specific action.

**Request Body:**
```json
{
  "actionType": "AI_QUERY_CLOUD",
  "dataDisclosure": "Prompt and page content will be sent to OpenAI"
}
```

**Response:**
```json
{
  "success": true,
  "consentId": "uuid",
  "decision": "granted"
}
```

## Examples

### JavaScript
```javascript
const response = await fetch('/api/consent/request', {
  method: 'POST',
  body: JSON.stringify({
    actionType: 'AI_QUERY_CLOUD',
    dataDisclosure: 'Prompt and page content will be sent to OpenAI'
  })
});
```

### Python
```python
import requests

response = requests.post('/api/consent/request', json={
    'actionType': 'AI_QUERY_CLOUD',
    'dataDisclosure': 'Prompt and page content will be sent to OpenAI'
})
```
```

### Bad Documentation

```markdown
# API Docs

**Note:** Add more examples

## Endpoints
POST /api/consent/request

<!-- Missing metadata, sections, and proper formatting -->
```

---

**Last Updated:** 2025-10-18  
**Next Review:** 2025-11-18
