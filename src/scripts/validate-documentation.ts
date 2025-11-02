#!/usr/bin/env node

/**
 * Documentation Validation Script
 *
 * This script validates all documentation files in the Toubkal Browser project
 * to ensure they follow proper formatting standards and maintain consistency.
 *
 * Usage:
 *   npm run validate-docs
 *   node src/scripts/validate-documentation.ts [options]
 *
 * Options:
 *   --fix: Attempt to fix common formatting issues
 *   --strict: Enable strict validation mode
 *   --verbose: Enable verbose output
 *   --file <path>: Validate specific file
 *   --dir <path>: Validate specific directory
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { join, extname, relative } from 'path'
import { program } from 'commander'

interface ValidationResult {
  file: string
  passed: boolean
  errors: string[]
  warnings: string[]
  fixes: string[]
}

interface DocValidationRules {
  requiredMetadata: string[]
  allowedExtensions: string[]
  maxFileSize: number
  requiredSections: string[]
  forbiddenPatterns: RegExp[]
  requiredPatterns: RegExp[]
}

// Validation rules for different document types
const DOC_VALIDATION_RULES: Record<string, DocValidationRules> = {
  prd: {
    requiredMetadata: ['Version', 'Last Updated', 'Owner', 'Audience'],
    allowedExtensions: ['.md'],
    maxFileSize: 2 * 1024 * 1024,
    requiredSections: ['Vision', 'Objectives', 'Requirements'],
    forbiddenPatterns: [/TODO:/gi, /FIXME:/gi, /XXX:/gi, /HACK:/gi],
    requiredPatterns: [/^# .+$/m, /^## .+$/m, /^---$/m],
  },

  architecture: {
    requiredMetadata: ['Last Updated', 'Status', 'Audience'],
    allowedExtensions: ['.md'],
    maxFileSize: 1 * 1024 * 1024,
    requiredSections: ['Overview', 'Implementation'],
    forbiddenPatterns: [/TODO:/gi, /FIXME:/gi, /XXX:/gi],
    requiredPatterns: [/^# .+$/m, /^## .+$/m],
  },

  contributing: {
    requiredMetadata: ['Last Updated', 'Status', 'Audience'],
    allowedExtensions: ['.md'],
    maxFileSize: 500 * 1024,
    requiredSections: ['Prerequisites', 'Steps', 'Verification'],
    forbiddenPatterns: [/TODO:/gi, /FIXME:/gi],
    requiredPatterns: [/^# .+$/m, /^## .+$/m],
  },

  api: {
    requiredMetadata: ['Last Updated', 'Version', 'Status'],
    allowedExtensions: ['.md'],
    maxFileSize: 1 * 1024 * 1024,
    requiredSections: ['Overview', 'Endpoints', 'Examples'],
    forbiddenPatterns: [/TODO:/gi, /FIXME:/gi],
    requiredPatterns: [/^# .+$/m, /^## .+$/m, /```/g],
  },

  stories: {
    requiredMetadata: ['Status', 'Priority', 'Assignee'],
    allowedExtensions: ['.md', '.xml'],
    maxFileSize: 500 * 1024,
    requiredSections: ['Story', 'Acceptance Criteria', 'Tasks'],
    forbiddenPatterns: [/TODO:/gi, /FIXME:/gi],
    requiredPatterns: [/^# .+$/m, /^## .+$/m],
  },

  adr: {
    requiredMetadata: ['Status', 'Date', 'Deciders', 'Technical Story'],
    allowedExtensions: ['.md'],
    maxFileSize: 500 * 1024,
    requiredSections: ['Context', 'Decision', 'Consequences'],
    forbiddenPatterns: [/TODO:/gi, /FIXME:/gi],
    requiredPatterns: [/^# .+$/m, /^## Context$/m, /^## Decision$/m, /^## Consequences$/m],
  },

  default: {
    requiredMetadata: ['Last Updated'],
    allowedExtensions: ['.md'],
    maxFileSize: 1 * 1024 * 1024,
    requiredSections: [],
    forbiddenPatterns: [/TODO:/gi, /FIXME:/gi, /XXX:/gi],
    requiredPatterns: [/^# .+$/m],
  },
}

class DocumentationValidator {
  private fixMode: boolean
  private strictMode: boolean
  private verbose: boolean
  public results: ValidationResult[] = []

  constructor(options: { fix?: boolean; strict?: boolean; verbose?: boolean } = {}) {
    this.fixMode = options.fix ?? false
    this.strictMode = options.strict ?? false
    this.verbose = options.verbose ?? false
  }

  private getDocumentType(filePath: string): string {
    const path = filePath.toLowerCase()

    if (path.includes('prd') || path.includes('toUbkal-prd')) return 'prd'
    if (path.includes('architecture') || path.includes('arch')) return 'architecture'
    if (path.includes('contributing') || path.includes('contrib')) return 'contributing'
    if (path.includes('api')) return 'api'
    if (path.includes('stories') || path.includes('epic')) return 'stories'
    if (path.includes('adr') || path.includes('adr-')) return 'adr'

    return 'default'
  }

  private extractMetadata(content: string): Record<string, string> {
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

  private hasRequiredSections(content: string, requiredSections: string[]): boolean {
    for (const section of requiredSections) {
      const regex = new RegExp(`^## ${section}$`, 'm')
      if (!regex.test(content)) {
        return false
      }
    }
    return true
  }

  private hasForbiddenPatterns(content: string, forbiddenPatterns: RegExp[]): string[] {
    const violations: string[] = []

    for (const pattern of forbiddenPatterns) {
      const matches = content.match(pattern)
      if (matches) {
        violations.push(`Found forbidden pattern: ${pattern.source} - ${matches[0]}`)
      }
    }

    return violations
  }

  private hasRequiredPatterns(content: string, requiredPatterns: RegExp[]): string[] {
    const violations: string[] = []

    for (const pattern of requiredPatterns) {
      if (!pattern.test(content)) {
        violations.push(`Missing required pattern: ${pattern.source}`)
      }
    }

    return violations
  }

  private fixCommonIssues(content: string): { fixed: string; fixes: string[] } {
    let fixed = content
    const fixes: string[] = []

    // Fix trailing whitespace
    const originalLines = fixed.split('\n')
    const trimmedLines = originalLines.map((line) => line.replace(/\s+$/, ''))
    if (
      originalLines.length !== trimmedLines.length ||
      originalLines.some((line, i) => line !== trimmedLines[i])
    ) {
      fixed = trimmedLines.join('\n')
      fixes.push('Removed trailing whitespace')
    }

    // Fix inconsistent line endings
    if (fixed.includes('\r\n')) {
      fixed = fixed.replace(/\r\n/g, '\n')
      fixes.push('Normalized line endings to Unix style')
    }

    // Fix missing newline at end of file
    if (!fixed.endsWith('\n')) {
      fixed += '\n'
      fixes.push('Added missing newline at end of file')
    }

    // Fix heading hierarchy issues
    const lines = fixed.split('\n')
    let currentLevel = 1
    const fixedLines: string[] = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const headingMatch = line.match(/^(#+)\s/)

      if (headingMatch) {
        const level = headingMatch[1].length
        if (level > currentLevel + 1) {
          // Fix skipped heading levels
          const correctedLevel = currentLevel + 1
          const correctedLine = '#'.repeat(correctedLevel) + line.substring(level)
          fixedLines.push(correctedLine)
          fixes.push(`Fixed heading hierarchy at line ${i + 1}: ${line} -> ${correctedLine}`)
          currentLevel = correctedLevel
        } else {
          fixedLines.push(line)
          currentLevel = level
        }
      } else {
        fixedLines.push(line)
      }
    }

    if (fixedLines.length !== lines.length || fixedLines.some((line, i) => line !== lines[i])) {
      fixed = fixedLines.join('\n')
    }

    return { fixed, fixes }
  }

  private getAllDocFiles(dir: string): string[] {
    const files: string[] = []

    try {
      const entries = readdirSync(dir, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = join(dir, entry.name)

        if (entry.isDirectory()) {
          if (!['node_modules', '.git', 'dist', 'build', 'coverage'].includes(entry.name)) {
            files.push(...this.getAllDocFiles(fullPath))
          }
        } else if (entry.isFile()) {
          const ext = extname(entry.name)
          if (['.md', '.xml', '.txt'].includes(ext)) {
            files.push(fullPath)
          }
        }
      }
    } catch (error) {
      if (this.verbose) {
        console.warn(`Could not read directory ${dir}:`, error)
      }
    }

    return files
  }

  public validateFile(filePath: string): ValidationResult {
    const result: ValidationResult = {
      file: filePath,
      passed: true,
      errors: [],
      warnings: [],
      fixes: [],
    }

    try {
      const content = readFileSync(filePath, 'utf-8')
      const docType = this.getDocumentType(filePath)
      const rules = DOC_VALIDATION_RULES[docType] ?? DOC_VALIDATION_RULES.default
      const metadata = this.extractMetadata(content)

      // Check file extension
      const ext = extname(filePath)
      if (!rules.allowedExtensions.includes(ext)) {
        result.errors.push(
          `Invalid file extension: ${ext}. Allowed: ${rules.allowedExtensions.join(', ')}`
        )
        result.passed = false
      }

      // Check file size
      const stats = statSync(filePath)
      if (stats.size > rules.maxFileSize) {
        result.errors.push(`File too large: ${stats.size} bytes. Max: ${rules.maxFileSize} bytes`)
        result.passed = false
      }

      // Check required metadata
      for (const requiredField of rules.requiredMetadata) {
        if (metadata[requiredField] === undefined || metadata[requiredField] === null) {
          result.errors.push(`Missing required metadata: ${requiredField}`)
          result.passed = false
        }
      }

      // Check required sections
      if (rules.requiredSections.length > 0) {
        if (!this.hasRequiredSections(content, rules.requiredSections)) {
          result.errors.push(`Missing required sections: ${rules.requiredSections.join(', ')}`)
          result.passed = false
        }
      }

      // Check forbidden patterns
      const forbiddenViolations = this.hasForbiddenPatterns(content, rules.forbiddenPatterns)
      if (forbiddenViolations.length > 0) {
        result.errors.push(...forbiddenViolations)
        result.passed = false
      }

      // Check required patterns
      const requiredViolations = this.hasRequiredPatterns(content, rules.requiredPatterns)
      if (requiredViolations.length > 0) {
        result.errors.push(...requiredViolations)
        result.passed = false
      }

      // Check markdown structure
      const headingLines = content.split('\n').filter((line) => line.match(/^#+\s/))
      if (headingLines.length === 0) {
        result.errors.push('No headings found')
        result.passed = false
      } else {
        const firstHeading = headingLines[0]
        if (!firstHeading.match(/^#\s/)) {
          result.errors.push('First heading should be H1')
          result.passed = false
        }
      }

      // Check for common formatting issues
      const lines = content.split('\n')
      for (let i = 0; i < lines.length; i++) {
        if (lines[i]?.endsWith(' ')) {
          result.warnings.push(`Line ${i + 1} has trailing whitespace`)
        }
      }

      // Apply fixes if requested
      if (this.fixMode && (result.errors.length > 0 || result.warnings.length > 0)) {
        const { fixed, fixes } = this.fixCommonIssues(content)
        if (fixes.length > 0) {
          writeFileSync(filePath, fixed, 'utf-8')
          result.fixes.push(...fixes)
          result.passed = true // Assume fixes resolved the issues
        }
      }
    } catch (error) {
      result.errors.push(`Could not read file: ${error}`)
      result.passed = false
    }

    return result
  }

  public validateDirectory(dir: string): ValidationResult[] {
    const files = this.getAllDocFiles(dir)
    const results: ValidationResult[] = []

    for (const file of files) {
      const result = this.validateFile(file)
      results.push(result)

      if (this.verbose) {
        this.printResult(result)
      }
    }

    return results
  }

  public validateAll(): ValidationResult[] {
    return this.validateDirectory('docs')
  }

  public printResult(result: ValidationResult): void {
    const status = result.passed ? '✅' : '❌'
    const file = relative(process.cwd(), result.file)

    console.log(`${status} ${file}`)

    if (result.errors.length > 0) {
      console.log('  Errors:')
      result.errors.forEach((error) => console.log(`    - ${error}`))
    }

    if (result.warnings.length > 0) {
      console.log('  Warnings:')
      result.warnings.forEach((warning) => console.log(`    - ${warning}`))
    }

    if (result.fixes.length > 0) {
      console.log('  Fixes applied:')
      result.fixes.forEach((fix) => console.log(`    - ${fix}`))
    }
  }

  public printSummary(): void {
    const total = this.results.length
    const passed = this.results.filter((r) => r.passed).length
    const failed = total - passed
    const withWarnings = this.results.filter((r) => r.warnings.length > 0).length
    const withFixes = this.results.filter((r) => r.fixes.length > 0).length

    console.log('\n📊 Documentation Validation Summary')
    console.log('=====================================')
    console.log(`Total files: ${total}`)
    console.log(`✅ Passed: ${passed}`)
    console.log(`❌ Failed: ${failed}`)
    console.log(`⚠️  Warnings: ${withWarnings}`)
    console.log(`🔧 Fixes applied: ${withFixes}`)

    if (failed > 0) {
      console.log('\n❌ Failed files:')
      this.results
        .filter((r) => !r.passed)
        .forEach((r) => console.log(`  - ${relative(process.cwd(), r.file)}`))
    }

    if (this.strictMode && (failed > 0 || withWarnings > 0)) {
      process.exit(1)
    } else if (failed > 0) {
      process.exit(1)
    }
  }
}

// CLI setup
program
  .name('validate-documentation')
  .description('Validate Toubkal Browser documentation files')
  .version('1.0.0')

program
  .option('-f, --fix', 'Attempt to fix common formatting issues')
  .option('-s, --strict', 'Enable strict validation mode')
  .option('-v, --verbose', 'Enable verbose output')
  .option('--file <path>', 'Validate specific file')
  .option('--dir <path>', 'Validate specific directory')
  .action((options) => {
    const validator = new DocumentationValidator({
      fix: options.fix,
      strict: options.strict,
      verbose: options.verbose,
    })

    if (options.file !== undefined && options.file !== null) {
      const result = validator.validateFile(options.file)
      validator.results = [result]
      validator.printResult(result)
    } else if (options.dir !== undefined && options.dir !== null) {
      validator.results = validator.validateDirectory(options.dir)
    } else {
      validator.results = validator.validateAll()
    }

    validator.printSummary()
  })

program.parse()

export { DocumentationValidator }
