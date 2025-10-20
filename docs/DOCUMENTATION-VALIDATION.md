# Documentation Validation System

**Last Updated:** 2025-01-18
**Status:** Active
**Audience:** Developers, Contributors, CI/CD

This document describes the comprehensive documentation validation system for Toubkal Browser, ensuring all documentation follows consistent formatting standards and maintains high quality.

---

## Overview

The documentation validation system consists of:

1. **Automated Tests** - Vitest-based validation tests
2. **CLI Tools** - Command-line validation and fixing tools
3. **CI/CD Integration** - GitHub Actions workflows
4. **Template Generator** - Consistent document templates
5. **Quality Standards** - Defined formatting and content rules

---

## Quick Start

### Validate All Documentation

```bash
# Run validation tests
npm test -- --run src/test/documentation-validation.test.ts

# Run CLI validation
npm run validate-docs

# Fix common issues automatically
npm run validate-docs:fix

# Strict validation (fails on warnings)
npm run validate-docs:strict
```

### Generate Document Templates

```bash
# List available templates
npm run generate-doc-template list

# Generate a specific template
npm run generate-doc-template prd my-new-prd.md
npm run generate-doc-template architecture my-component-arch.md
npm run generate-doc-template contributing my-contrib-guide.md
```

---

## Validation Rules

### File Structure Requirements

| Document Type | Required Metadata | Required Sections | Max Size |
|---------------|-------------------|-------------------|----------|
| **PRD** | Version, Last Updated, Owner, Audience | Vision, Objectives, Requirements | 2MB |
| **Architecture** | Last Updated, Status, Audience | Overview, Implementation | 1MB |
| **Contributing** | Last Updated, Status, Audience | Prerequisites, Steps, Verification | 500KB |
| **API** | Last Updated, Version, Status | Overview, Endpoints, Examples | 1MB |
| **Stories** | Status, Priority, Assignee | Story, Acceptance Criteria, Tasks | 500KB |
| **ADR** | Status, Date, Deciders, Technical Story | Context, Decision, Consequences | 500KB |

### Content Quality Standards

#### Required Patterns
- ✅ Main heading (`# Title`)
- ✅ Subheadings (`## Section`)
- ✅ Proper markdown structure
- ✅ Consistent formatting

#### Forbidden Patterns
- ❌ `TODO:` comments
- ❌ `FIXME:` comments
- ❌ `XXX:` comments
- ❌ `HACK:` comments

#### Formatting Standards
- ✅ Consistent line endings (Unix style)
- ✅ No trailing whitespace
- ✅ Proper heading hierarchy
- ✅ Descriptive link text
- ✅ Alt text for images

---

## Validation Tools

### 1. Test Suite (`src/test/documentation-validation.test.ts`)

Comprehensive test suite that validates:

- **File Structure**: Extensions, sizes, metadata
- **Content Quality**: Sections, patterns, formatting
- **Cross-Document Consistency**: Versions, dates, ownership
- **Accessibility**: Heading hierarchy, alt text, link descriptions

```typescript
// Example test usage
describe('Documentation Validation', () => {
  it('should validate all documentation files', () => {
    // Tests run automatically
  })
})
```

### 2. CLI Tool (`src/scripts/validate-documentation.ts`)

Command-line tool with options:

```bash
# Basic validation
tsx src/scripts/validate-documentation.ts

# Validate specific file
tsx src/scripts/validate-documentation.ts --file docs/TOUBKAL-PRD.md

# Validate specific directory
tsx src/scripts/validate-documentation.ts --dir docs/architecture

# Fix common issues
tsx src/scripts/validate-documentation.ts --fix

# Strict mode (fails on warnings)
tsx src/scripts/validate-documentation.ts --strict

# Verbose output
tsx src/scripts/validate-documentation.ts --verbose
```

### 3. Template Generator (`src/scripts/generate-doc-template.ts`)

Generate consistent document templates:

```bash
# List available templates
tsx src/scripts/generate-doc-template.ts list

# Generate PRD template
tsx src/scripts/generate-doc-template.ts prd my-prd.md

# Generate architecture template
tsx src/scripts/generate-doc-template.ts architecture my-arch.md

# Generate contributing guide
tsx src/scripts/generate-doc-template.ts contributing my-guide.md
```

---

## CI/CD Integration

### GitHub Actions Workflow

The validation system is integrated with GitHub Actions via `.github/workflows/validate-documentation.yml`:

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests targeting `main` or `develop`
- Changes to documentation files

**Actions:**
1. Run documentation validation tests
2. Execute CLI validation in strict mode
3. Check formatting with Prettier
4. Upload validation reports as artifacts

### Pre-commit Hooks

Documentation validation is integrated with Husky pre-commit hooks:

```json
{
  "lint-staged": {
    "*.md": [
      "prettier --write",
      "tsx src/scripts/validate-documentation.ts --file"
    ]
  }
}
```

---

## Document Types and Templates

### 1. Product Requirements Document (PRD)

**Template:** `prd`
**Location:** `docs/TOUBKAL-PRD.md`
**Purpose:** Strategic and functional specifications

**Required Sections:**
- Vision & Objectives
- Requirements (Functional & Non-Functional)
- Technical Specifications
- Acceptance Criteria
- Risks & Mitigation
- Success Metrics

### 2. Architecture Documents

**Template:** `architecture`
**Location:** `docs/architecture/`
**Purpose:** Technical architecture and design

**Required Sections:**
- Overview
- Design Goals
- Architecture (High-Level Design, Components, Data Flow)
- Implementation (Prerequisites, Steps, Verification)
- Security Considerations
- Performance Considerations

### 3. Contributing Guides

**Template:** `contributing`
**Location:** `docs/contributing/`
**Purpose:** Developer onboarding and contribution guidelines

**Required Sections:**
- Prerequisites
- Getting Started
- Steps (Branch, Changes, Tests, Commit, PR)
- Verification
- Code Style
- Pull Request Guidelines

### 4. API Documentation

**Template:** `api`
**Location:** `docs/api/`
**Purpose:** API reference and usage examples

**Required Sections:**
- Overview
- Authentication
- Base URL
- Endpoints (with examples)
- Error Handling
- Rate Limiting

### 5. User Stories

**Template:** `story`
**Location:** `docs/stories/`
**Purpose:** Feature development and tracking

**Required Sections:**
- Story (As a... I want... So that...)
- Acceptance Criteria
- Tasks
- Technical Notes
- Dependencies
- Definition of Done

### 6. Architecture Decision Records (ADR)

**Template:** `adr`
**Location:** `docs/adrs/`
**Purpose:** Document architectural decisions

**Required Sections:**
- Context
- Decision
- Consequences (Positive, Negative, Neutral)
- Alternatives Considered
- Implementation Notes

---

## Common Issues and Fixes

### 1. Missing Metadata

**Issue:** Document missing required metadata fields
**Fix:** Add metadata section at the top of the document

```markdown
---
**Last Updated:** 2025-01-18
**Status:** Active
**Audience:** Developers
---
```

### 2. Improper Heading Hierarchy

**Issue:** Skipped heading levels (H1 → H3)
**Fix:** Use proper hierarchy (H1 → H2 → H3)

```markdown
# Main Title
## Section
### Subsection
```

### 3. Trailing Whitespace

**Issue:** Lines ending with spaces
**Fix:** Remove trailing whitespace

```bash
# Fix automatically
npm run validate-docs:fix
```

### 4. Inconsistent Line Endings

**Issue:** Mixed Windows (`\r\n`) and Unix (`\n`) line endings
**Fix:** Normalize to Unix style

```bash
# Fix automatically
npm run validate-docs:fix
```

### 5. Missing Required Sections

**Issue:** Document missing required sections for its type
**Fix:** Add missing sections or use template generator

```bash
# Generate template with required sections
npm run generate-doc-template [type] [filename]
```

---

## Best Practices

### 1. Document Structure

- Start with metadata section
- Use consistent heading hierarchy
- Include table of contents for long documents
- End with references section

### 2. Content Quality

- Write clear, concise descriptions
- Use bullet points for lists
- Include code examples where relevant
- Add diagrams for complex concepts

### 3. Maintenance

- Update "Last Updated" date when making changes
- Review and update metadata regularly
- Keep content current and accurate
- Remove outdated information

### 4. Collaboration

- Use descriptive commit messages
- Reference related issues and PRs
- Request reviews for significant changes
- Follow the established templates

---

## Troubleshooting

### Common Error Messages

#### "Missing required metadata: [field]"
**Solution:** Add the missing metadata field to the document header

#### "File too large: [size] bytes"
**Solution:** Split the document into smaller files or remove unnecessary content

#### "Missing required sections: [sections]"
**Solution:** Add the missing sections or use the appropriate template

#### "Found forbidden pattern: TODO:"
**Solution:** Remove TODO comments or replace with proper issues/tasks

### Getting Help

1. **Check the logs:** Use `--verbose` flag for detailed output
2. **Review templates:** Use `npm run generate-doc-template list`
3. **Fix automatically:** Use `npm run validate-docs:fix`
4. **Check CI/CD:** Review GitHub Actions logs for detailed error information

---

## Contributing to Validation System

### Adding New Document Types

1. Add validation rules to `DOC_VALIDATION_RULES` in both test and CLI files
2. Create template in `TEMPLATES` object
3. Update this documentation
4. Add tests for the new document type

### Modifying Validation Rules

1. Update rules in both test and CLI files
2. Update templates if needed
3. Run tests to ensure changes work
4. Update this documentation

### Adding New Validation Checks

1. Add check to both test suite and CLI tool
2. Add appropriate error messages
3. Update documentation
4. Test with existing documents

---

## References

- [CODING-RULES.md](../CODING-RULES.md) - General coding standards
- [Testing Strategy](./contributing/testing-strategy.md) - Testing guidelines
- [Architecture Overview](./architecture/ARCHITECTURE-OVERVIEW.md) - System architecture
- [Contributing Guide](./contributing/onboarding.md) - How to contribute
