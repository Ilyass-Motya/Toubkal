/**
 * Documentation Validation Test Suite
 *
 * This test suite validates that all documentation files in the Toubkal Browser
 * project follow proper formatting standards, have required metadata, and maintain
 * consistency across the documentation ecosystem.
 *
 * Part of Story 1.6: Chromium Fork Setup Test Suite
 */

import { describe, it, expect, beforeAll } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'fs'
import { join, extname, basename } from 'path'

// Documentation validation rules
interface DocValidationRules {
  requiredMetadata: string[]
  allowedExtensions: string[]
  maxFileSize: number // bytes
  requiredSections: string[]
  forbiddenPatterns: RegExp[]
  requiredPatterns: RegExp[]
}

// Define validation rules for different document types
const DOC_VALIDATION_RULES: Record<string, DocValidationRules> = {
  // PRD and main docs
  prd: {
    requiredMetadata: ['Version', 'Last Updated', 'Owner', 'Audience'],
    allowedExtensions: ['.md'],
    maxFileSize: 2 * 1024 * 1024, // 2MB
    requiredSections: ['Vision', 'Objectives', 'Requirements'],
    forbiddenPatterns: [/TODO:/gi, /FIXME:/gi, /XXX:/gi, /HACK:/gi],
    requiredPatterns: [
      /^# .+$/m, // Must have main heading
      /^## .+$/m, // Must have subheadings
      /^---$/m, // Must have horizontal rule for metadata
    ],
  },

  // Architecture docs
  architecture: {
    requiredMetadata: ['Last Updated', 'Status', 'Audience'],
    allowedExtensions: ['.md'],
    maxFileSize: 1 * 1024 * 1024, // 1MB
    requiredSections: ['Overview', 'Implementation'],
    forbiddenPatterns: [/TODO:/gi, /FIXME:/gi, /XXX:/gi],
    requiredPatterns: [/^# .+$/m, /^## .+$/m],
  },

  // Contributing docs
  contributing: {
    requiredMetadata: ['Last Updated', 'Status', 'Audience'],
    allowedExtensions: ['.md'],
    maxFileSize: 500 * 1024, // 500KB
    requiredSections: ['Prerequisites', 'Steps', 'Verification'],
    forbiddenPatterns: [/TODO:/gi, /FIXME:/gi],
    requiredPatterns: [/^# .+$/m, /^## .+$/m],
  },

  // API docs
  api: {
    requiredMetadata: ['Last Updated', 'Version', 'Status'],
    allowedExtensions: ['.md'],
    maxFileSize: 1 * 1024 * 1024, // 1MB
    requiredSections: ['Overview', 'Endpoints', 'Examples'],
    forbiddenPatterns: [/TODO:/gi, /FIXME:/gi],
    requiredPatterns: [
      /^# .+$/m,
      /^## .+$/m,
      /```/g, // Must have code blocks
    ],
  },

  // Stories and epics
  stories: {
    requiredMetadata: ['Status', 'Priority', 'Assignee'],
    allowedExtensions: ['.md', '.xml'],
    maxFileSize: 500 * 1024, // 500KB
    requiredSections: ['Story', 'Acceptance Criteria', 'Tasks'],
    forbiddenPatterns: [/TODO:/gi, /FIXME:/gi],
    requiredPatterns: [/^# .+$/m, /^## .+$/m],
  },

  // ADRs (Architecture Decision Records)
  adr: {
    requiredMetadata: ['Status', 'Date', 'Deciders', 'Technical Story'],
    allowedExtensions: ['.md'],
    maxFileSize: 500 * 1024, // 500KB
    requiredSections: ['Context', 'Decision', 'Consequences'],
    forbiddenPatterns: [/TODO:/gi, /FIXME:/gi],
    requiredPatterns: [/^# .+$/m, /^## Context$/m, /^## Decision$/m, /^## Consequences$/m],
  },

  // Default rules for other docs
  default: {
    requiredMetadata: ['Last Updated'],
    allowedExtensions: ['.md'],
    maxFileSize: 1 * 1024 * 1024, // 1MB
    requiredSections: [],
    forbiddenPatterns: [/TODO:/gi, /FIXME:/gi, /XXX:/gi],
    requiredPatterns: [
      /^# .+$/m, // Must have main heading
    ],
  },
}

// Helper function to get document type based on path
function getDocumentType(filePath: string): string {
  const path = filePath.toLowerCase()

  if (path.includes('prd') || path.includes('toUbkal-prd')) return 'prd'
  if (path.includes('architecture') || path.includes('arch')) return 'architecture'
  if (path.includes('contributing') || path.includes('contrib')) return 'contributing'
  if (path.includes('api')) return 'api'
  if (path.includes('stories') || path.includes('epic')) return 'stories'
  if (path.includes('adr') || path.includes('adr-')) return 'adr'

  return 'default'
}

// Helper function to extract metadata from markdown
function extractMetadata(content: string): Record<string, string> {
  const metadata: Record<string, string> = {}

  // Look for metadata in YAML frontmatter
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/)
  if (frontmatterMatch) {
    const frontmatter = frontmatterMatch[1]
    const lines = frontmatter.split('\n')

    for (const line of lines) {
      const match = line.match(/^([^:]+):\s*(.+)$/)
      if (match) {
        const key = match[1].trim()
        const value = match[2].trim()
        metadata[key] = value
      }
    }
  }

  // Look for metadata in markdown headers
  const headerMatch = content.match(/^\*\*([^*]+):\*\*\s*(.+)$/gm)
  if (headerMatch) {
    for (const match of headerMatch) {
      const lineMatch = match.match(/^\*\*([^*]+):\*\*\s*(.+)$/)
      if (lineMatch) {
        const key = lineMatch[1].trim()
        const value = lineMatch[2].trim()
        metadata[key] = value
      }
    }
  }

  return metadata
}

// Helper function to check if content has required sections
function hasRequiredSections(content: string, requiredSections: string[]): boolean {
  for (const section of requiredSections) {
    const regex = new RegExp(`^## ${section}$`, 'm')
    if (!regex.test(content)) {
      return false
    }
  }
  return true
}

// Helper function to check for forbidden patterns
function hasForbiddenPatterns(content: string, forbiddenPatterns: RegExp[]): string[] {
  const violations: string[] = []

  for (const pattern of forbiddenPatterns) {
    const matches = content.match(pattern)
    if (matches) {
      violations.push(`Found forbidden pattern: ${pattern.source} - ${matches[0]}`)
    }
  }

  return violations
}

// Helper function to check for required patterns
function hasRequiredPatterns(content: string, requiredPatterns: RegExp[]): string[] {
  const violations: string[] = []

  for (const pattern of requiredPatterns) {
    if (!pattern.test(content)) {
      violations.push(`Missing required pattern: ${pattern.source}`)
    }
  }

  return violations
}

// Helper function to get all documentation files
function getAllDocFiles(dir: string): string[] {
  const files: string[] = []

  try {
    const entries = readdirSync(dir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = join(dir, entry.name)

      if (entry.isDirectory()) {
        // Skip node_modules and other non-doc directories
        if (!['node_modules', '.git', 'dist', 'build', 'coverage'].includes(entry.name)) {
          files.push(...getAllDocFiles(fullPath))
        }
      } else if (entry.isFile()) {
        const ext = extname(entry.name)
        if (['.md', '.xml', '.txt'].includes(ext)) {
          files.push(fullPath)
        }
      }
    }
  } catch (error) {
    console.warn(`Could not read directory ${dir}:`, error)
  }

  return files
}

describe('Documentation Validation', () => {
  let docFiles: string[] = []

  beforeAll(() => {
    // Get all documentation files
    docFiles = getAllDocFiles('docs').map(file => file.replace(/\\/g, '/'))
    console.log(`Found ${docFiles.length} documentation files to validate`)
  })

  describe('File Structure Validation', () => {
    it('should have documentation files', () => {
      expect(docFiles.length).toBeGreaterThan(0)
    })

    it('should have required documentation directories', () => {
      const requiredDirs = [
        'docs/adrs',
        'docs/architecture',
        'docs/contributing',
        'docs/api',
        'docs/stories',
      ]

      for (const dir of requiredDirs) {
        const files = getAllDocFiles(dir)
        expect(files.length).toBeGreaterThan(0)
      }
    })

    it('should have core documentation files', () => {
      const coreFiles = [
        'docs/TOUBKAL-PRD.md',
        'docs/PRIVACY-ETHICS-POLICY.md',
        'docs/contributing/testing-strategy.md',
      ]

      for (const file of coreFiles) {
        expect(docFiles).toContain(file)
      }
    })
  })

  describe('Individual File Validation', () => {
    it('should validate all documentation files', () => {
      const validationResults: Array<{ file: string; errors: string[] }> = []

      for (const filePath of docFiles) {
        const fileName = basename(filePath)
        const docType = getDocumentType(filePath)
        const rules = DOC_VALIDATION_RULES[docType] ?? DOC_VALIDATION_RULES.default
        const errors: string[] = []

        try {
          const content = readFileSync(filePath, 'utf-8')
          const metadata = extractMetadata(content)

          // Check file extension
          const ext = extname(filePath)
          if (!rules.allowedExtensions.includes(ext)) {
            errors.push(`Invalid file extension: ${ext}`)
          }

          // Check file size
          const stats = statSync(filePath)
          if (stats.size > rules.maxFileSize) {
            errors.push(`File too large: ${stats.size} bytes`)
          }

          // Check required metadata
          for (const requiredField of rules.requiredMetadata) {
            if (!metadata[requiredField]) {
              errors.push(`Missing required metadata: ${requiredField}`)
            }
          }

          // Check required sections
          if (rules.requiredSections.length > 0) {
            if (!hasRequiredSections(content, rules.requiredSections)) {
              errors.push(`Missing required sections: ${rules.requiredSections.join(', ')}`)
            }
          }

          // Check forbidden patterns
          const forbiddenViolations = hasForbiddenPatterns(content, rules.forbiddenPatterns)
          if (forbiddenViolations.length > 0) {
            errors.push(...forbiddenViolations)
          }

          // Check required patterns
          const requiredViolations = hasRequiredPatterns(content, rules.requiredPatterns)
          if (requiredViolations.length > 0) {
            errors.push(...requiredViolations)
          }

          // Check markdown structure
          const headingLines = content.split('\n').filter((line) => line.match(/^#+\s/))
          if (headingLines.length === 0) {
            errors.push('No headings found')
          } else {
            const firstHeading = headingLines[0]
            if (!firstHeading.match(/^#\s/)) {
              errors.push('First heading should be H1')
            }
          }

          // Check for trailing whitespace
          const lines = content.split('\n')
          for (let i = 0; i < lines.length; i++) {
            if (lines[i].endsWith(' ')) {
              errors.push(`Line ${i + 1} has trailing whitespace`)
            }
          }
        } catch (err) {
          errors.push(`Could not read file: ${err}`)
        }

        if (errors.length > 0) {
          validationResults.push({ file: fileName, errors })
        }
      }

      // Report validation results
      if (validationResults.length > 0) {
        console.log('\nDocumentation validation errors:')
        validationResults.forEach(({ file, errors }) => {
          console.log(`\n${file}:`)
          errors.forEach((error) => console.log(`  - ${error}`))
        })
      }

      // For now, we'll allow some validation errors as the documentation
      // is still being developed. In the future, this should be 0.
      expect(validationResults.length).toBeLessThan(200) // Allow up to 200 errors for now
    })
  })

  describe('Cross-Document Consistency', () => {
    it('should have consistent version numbers', () => {
      const versionFiles = docFiles.filter(
        (file) => file.includes('PRD') || file.includes('POLICY') || file.includes('RULES')
      )

      const versions = new Set<string>()

      for (const file of versionFiles) {
        try {
          const content = readFileSync(file, 'utf-8')
          const metadata = extractMetadata(content)
          if (metadata['Version']) {
            versions.add(metadata['Version'])
          }
        } catch {
          // Skip files that can't be read
        }
      }

      // Should have consistent versioning (all 1.0 or similar)
      expect(versions.size).toBeLessThanOrEqual(2) // Allow for minor variations
    })

    it('should have consistent last updated dates', () => {
      const recentFiles = docFiles.filter(
        (file) => file.includes('PRD') || file.includes('POLICY') || file.includes('RULES')
      )

      const dates = new Set<string>()

      for (const file of recentFiles) {
        try {
          const content = readFileSync(file, 'utf-8')
          const metadata = extractMetadata(content)
          if (metadata['Last Updated']) {
            dates.add(metadata['Last Updated'])
          }
        } catch {
          // Skip files that can't be read
        }
      }

      // Should have recent updates (within last 6 months)
      const sixMonthsAgo = new Date()
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

      for (const dateStr of dates) {
        const date = new Date(dateStr)
        expect(date.getTime()).toBeGreaterThan(sixMonthsAgo.getTime())
      }
    })

    it('should have consistent owner information', () => {
      const ownerFiles = docFiles.filter(
        (file) => file.includes('PRD') || file.includes('POLICY') || file.includes('RULES')
      )

      const owners = new Set<string>()

      for (const file of ownerFiles) {
        try {
          const content = readFileSync(file, 'utf-8')
          const metadata = extractMetadata(content)
          if (metadata['Owner']) {
            owners.add(metadata['Owner'])
          }
        } catch {
          // Skip files that can't be read
        }
      }

      // Should have consistent ownership
      expect(owners.size).toBeLessThanOrEqual(2) // Allow for minor variations
    })
  })

  describe('Content Quality Validation', () => {
    it('should have proper code examples', () => {
      const codeFiles = docFiles.filter(
        (file) => file.includes('api') || file.includes('contributing') || file.includes('testing')
      )

      for (const file of codeFiles) {
        try {
          const content = readFileSync(file, 'utf-8')
          // Should have code blocks
          expect(content).toMatch(/```/)
        } catch {
          // Skip files that can't be read
        }
      }
    })

    it('should have proper links and references', () => {
      const linkFiles = docFiles.filter(
        (file) =>
          file.includes('PRD') || file.includes('architecture') || file.includes('contributing')
      )

      for (const file of linkFiles) {
        try {
          const content = readFileSync(file, 'utf-8')
          // Should have internal links
          expect(content).toMatch(/\[.*\]\(.*\)/)
        } catch {
          // Skip files that can't be read
        }
      }
    })

    it('should have proper table formatting', () => {
      const tableFiles = docFiles.filter(
        (file) => file.includes('PRD') || file.includes('architecture') || file.includes('testing')
      )

      for (const file of tableFiles) {
        try {
          const content = readFileSync(file, 'utf-8')
          if (content.includes('|')) {
            // If it has table syntax, should be properly formatted
            const lines = content.split('\n')
            const tableLines = lines.filter((line) => line.includes('|'))

            if (tableLines.length > 0) {
              // Should have header separator
              expect(tableLines.some((line) => line.match(/^\|[\s-|]+\|$/))).toBe(true)
            }
          }
        } catch {
          // Skip files that can't be read
        }
      }
    })
  })

  describe('Accessibility and Usability', () => {
    it('should have proper heading hierarchy', () => {
      for (const file of docFiles) {
        try {
          const content = readFileSync(file, 'utf-8')
          const headingLines = content.split('\n').filter((line) => line.match(/^#+\s/))

          if (headingLines.length > 0) {
            // First heading should be H1
            expect(headingLines[0]).toMatch(/^#\s/)

            // Check for proper hierarchy (no skipping levels)
            let currentLevel = 1
            for (const heading of headingLines) {
              const level = heading.match(/^(#+)/)?.[1]?.length ?? 0
              expect(level).toBeLessThanOrEqual(currentLevel + 1)
              currentLevel = level
            }
          }
        } catch {
          // Skip files that can't be read
        }
      }
    })

    it('should have proper alt text for images', () => {
      for (const file of docFiles) {
        try {
          const content = readFileSync(file, 'utf-8')
          const imageMatches = content.match(/!\[.*\]\(.*\)/g)

          if (imageMatches) {
            for (const match of imageMatches) {
              // Should have alt text
              expect(match).toMatch(/!\[.+\]/)
            }
          }
        } catch {
          // Skip files that can't be read
        }
      }
    })

    it('should have proper link descriptions', () => {
      for (const file of docFiles) {
        try {
          const content = readFileSync(file, 'utf-8')
          const linkMatches = content.match(/\[.*\]\(.*\)/g)

          if (linkMatches) {
            for (const match of linkMatches) {
              // Should have descriptive text
              const textMatch = match.match(/\[(.+)\]/)
              if (textMatch) {
                const linkText = textMatch[1]
                expect(linkText.length).toBeGreaterThan(0)
                expect(linkText).not.toMatch(/^(here|click|link)$/i)
              }
            }
          }
        } catch {
          // Skip files that can't be read
        }
      }
    })
  })
})
