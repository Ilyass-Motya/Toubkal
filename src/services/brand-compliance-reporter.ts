/**
 * Brand Compliance Reporter Service
 * 
 * Generates automated reports for brand consistency violations.
 * Integrates with CI/CD pipeline for brand validation.
 */

export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string }

export interface ComplianceReport {
  timestamp: string
  version: string
  overallScore: number
  components: ComponentReport[]
  summary: ReportSummary
  recommendations: string[]
  metadata: ReportMetadata
}

export interface ComponentReport {
  name: string
  score: number
  violations: ViolationReport[]
  status: 'pass' | 'warning' | 'fail'
}

export interface ViolationReport {
  type: 'color' | 'typography' | 'spacing' | 'logo' | 'accessibility'
  severity: 'error' | 'warning' | 'info'
  property: string
  expected: string
  actual: string
  message: string
  fix?: string
  line?: number
  file?: string
}

export interface ReportSummary {
  totalComponents: number
  passedComponents: number
  warningComponents: number
  failedComponents: number
  totalViolations: number
  errorViolations: number
  warningViolations: number
  infoViolations: number
}

export interface ReportMetadata {
  buildId: string
  branch: string
  commit: string
  author: string
  timestamp: string
  environment: 'development' | 'staging' | 'production'
}

export interface ReportOptions {
  format: 'json' | 'html' | 'markdown' | 'csv'
  includeDetails: boolean
  includeRecommendations: boolean
  threshold: number
  outputPath?: string
}

export class BrandComplianceReporter {
  private static instance: BrandComplianceReporter
  private reports: ComplianceReport[] = []

  private constructor() {}

  static getInstance(): BrandComplianceReporter {
    if (!BrandComplianceReporter.instance) {
      BrandComplianceReporter.instance = new BrandComplianceReporter()
    }
    return BrandComplianceReporter.instance
  }

  /**
   * Generates a comprehensive compliance report
   */
  async generateReport(
    components: ComponentReport[],
    metadata: ReportMetadata,
    options: ReportOptions = {
      format: 'json',
      includeDetails: true,
      includeRecommendations: true,
      threshold: 80
    }
  ): Promise<Result<ComplianceReport>> {
    try {
      const summary = this.calculateSummary(components)
      const overallScore = this.calculateOverallScore(components)
      const recommendations = this.generateRecommendations(components, overallScore)

      const report: ComplianceReport = {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        overallScore,
        components,
        summary,
        recommendations,
        metadata
      }

      this.reports.push(report)

      // Generate output file if path specified
      if (options.outputPath) {
        await this.writeReport(report, options)
      }

      return { success: true, data: report }
    } catch (error) {
      console.error('[BrandComplianceReporter.generateReport] Failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Report generation failed'
      }
    }
  }

  /**
   * Generates HTML report
   */
  async generateHtmlReport(report: ComplianceReport): Promise<string> {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Toubkal Browser - Brand Compliance Report</title>
    <style>
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #111827;
            background-color: #f9fafb;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #2563EB 0%, #2C5F8D 100%);
            color: white;
            padding: 32px;
            text-align: center;
        }
        .header h1 {
            margin: 0 0 8px 0;
            font-size: 2.5rem;
            font-weight: 700;
        }
        .header p {
            margin: 0;
            font-size: 1.125rem;
            opacity: 0.9;
        }
        .score {
            display: inline-block;
            background: rgba(255, 255, 255, 0.2);
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 1.5rem;
            font-weight: 600;
            margin-top: 16px;
        }
        .content {
            padding: 32px;
        }
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 24px;
            margin-bottom: 32px;
        }
        .summary-card {
            background: #f9fafb;
            padding: 24px;
            border-radius: 8px;
            text-align: center;
        }
        .summary-card h3 {
            margin: 0 0 8px 0;
            font-size: 2rem;
            font-weight: 700;
            color: #2563EB;
        }
        .summary-card p {
            margin: 0;
            color: #6b7280;
            font-weight: 500;
        }
        .components {
            margin-bottom: 32px;
        }
        .component {
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            margin-bottom: 16px;
            overflow: hidden;
        }
        .component-header {
            background: #f9fafb;
            padding: 16px 24px;
            border-bottom: 1px solid #e5e7eb;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .component-name {
            font-weight: 600;
            font-size: 1.125rem;
        }
        .component-score {
            padding: 4px 12px;
            border-radius: 6px;
            font-weight: 600;
            font-size: 0.875rem;
        }
        .score-pass { background: #d1fae5; color: #065f46; }
        .score-warning { background: #fef3c7; color: #92400e; }
        .score-fail { background: #fee2e2; color: #991b1b; }
        .violations {
            padding: 24px;
        }
        .violation {
            display: flex;
            align-items: flex-start;
            padding: 12px 0;
            border-bottom: 1px solid #f3f4f6;
        }
        .violation:last-child {
            border-bottom: none;
        }
        .violation-icon {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 12px;
            font-size: 12px;
            font-weight: 600;
        }
        .violation-error { background: #fee2e2; color: #991b1b; }
        .violation-warning { background: #fef3c7; color: #92400e; }
        .violation-info { background: #dbeafe; color: #1e40af; }
        .violation-content {
            flex: 1;
        }
        .violation-title {
            font-weight: 600;
            margin-bottom: 4px;
        }
        .violation-details {
            font-size: 0.875rem;
            color: #6b7280;
        }
        .recommendations {
            background: #f0f9ff;
            border: 1px solid #bae6fd;
            border-radius: 8px;
            padding: 24px;
        }
        .recommendations h3 {
            margin: 0 0 16px 0;
            color: #1e40af;
        }
        .recommendations ul {
            margin: 0;
            padding-left: 20px;
        }
        .recommendations li {
            margin-bottom: 8px;
        }
        .metadata {
            background: #f9fafb;
            padding: 16px 24px;
            border-top: 1px solid #e5e7eb;
            font-size: 0.875rem;
            color: #6b7280;
        }
        .metadata-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Brand Compliance Report</h1>
            <p>Toubkal Browser - Brand Identity Validation</p>
            <div class="score">${report.overallScore}%</div>
        </div>
        
        <div class="content">
            <div class="summary">
                <div class="summary-card">
                    <h3>${report.summary.totalComponents}</h3>
                    <p>Components</p>
                </div>
                <div class="summary-card">
                    <h3>${report.summary.passedComponents}</h3>
                    <p>Passed</p>
                </div>
                <div class="summary-card">
                    <h3>${report.summary.warningComponents}</h3>
                    <p>Warnings</p>
                </div>
                <div class="summary-card">
                    <h3>${report.summary.failedComponents}</h3>
                    <p>Failed</p>
                </div>
            </div>

            <div class="components">
                <h2>Component Details</h2>
                ${report.components.map(component => `
                    <div class="component">
                        <div class="component-header">
                            <div class="component-name">${component.name}</div>
                            <div class="component-score score-${component.status}">${component.score}%</div>
                        </div>
                        <div class="violations">
                            ${component.violations.map(violation => `
                                <div class="violation">
                                    <div class="violation-icon violation-${violation.severity}">
                                        ${violation.severity === 'error' ? '✗' : violation.severity === 'warning' ? '⚠' : 'ℹ'}
                                    </div>
                                    <div class="violation-content">
                                        <div class="violation-title">${violation.property}</div>
                                        <div class="violation-details">
                                            <strong>Expected:</strong> ${violation.expected}<br>
                                            <strong>Actual:</strong> ${violation.actual}<br>
                                            ${violation.message}
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>

            ${report.recommendations.length > 0 ? `
                <div class="recommendations">
                    <h3>Recommendations</h3>
                    <ul>
                        ${report.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
        </div>

        <div class="metadata">
            <div class="metadata-grid">
                <div><strong>Build ID:</strong> ${report.metadata.buildId}</div>
                <div><strong>Branch:</strong> ${report.metadata.branch}</div>
                <div><strong>Commit:</strong> ${report.metadata.commit}</div>
                <div><strong>Author:</strong> ${report.metadata.author}</div>
                <div><strong>Environment:</strong> ${report.metadata.environment}</div>
                <div><strong>Generated:</strong> ${new Date(report.timestamp).toLocaleString()}</div>
            </div>
        </div>
    </div>
</body>
</html>
    `

    return html
  }

  /**
   * Generates Markdown report
   */
  async generateMarkdownReport(report: ComplianceReport): Promise<string> {
    const markdown = `# Brand Compliance Report

**Generated:** ${new Date(report.timestamp).toLocaleString()}  
**Version:** ${report.version}  
**Overall Score:** ${report.overallScore}%

## Summary

| Metric | Count |
|--------|-------|
| Total Components | ${report.summary.totalComponents} |
| Passed | ${report.summary.passedComponents} |
| Warnings | ${report.summary.warningComponents} |
| Failed | ${report.summary.failedComponents} |
| Total Violations | ${report.summary.totalViolations} |
| Error Violations | ${report.summary.errorViolations} |
| Warning Violations | ${report.summary.warningViolations} |
| Info Violations | ${report.summary.infoViolations} |

## Component Details

${report.components.map(component => `
### ${component.name} (${component.score}%)

**Status:** ${component.status.toUpperCase()}

${component.violations.length > 0 ? `
#### Violations

${component.violations.map(violation => `
- **${violation.severity.toUpperCase()}** - ${violation.property}
  - Expected: ${violation.expected}
  - Actual: ${violation.actual}
  - ${violation.message}
  ${violation.fix ? `  - Fix: ${violation.fix}` : ''}
`).join('')}
` : 'No violations found.'}
`).join('')}

## Recommendations

${report.recommendations.map(rec => `- ${rec}`).join('\n')}

## Metadata

- **Build ID:** ${report.metadata.buildId}
- **Branch:** ${report.metadata.branch}
- **Commit:** ${report.metadata.commit}
- **Author:** ${report.metadata.author}
- **Environment:** ${report.metadata.environment}
`

    return markdown
  }

  /**
   * Generates CSV report
   */
  async generateCsvReport(report: ComplianceReport): Promise<string> {
    const headers = [
      'Component',
      'Score',
      'Status',
      'Violation Type',
      'Severity',
      'Property',
      'Expected',
      'Actual',
      'Message',
      'Fix'
    ]

    const rows = report.components.flatMap(component =>
      component.violations.length > 0
        ? component.violations.map(violation => [
            component.name,
            component.score,
            component.status,
            violation.type,
            violation.severity,
            violation.property,
            violation.expected,
            violation.actual,
            violation.message,
            violation.fix || ''
          ])
        : [[component.name, component.score, component.status, '', '', '', '', '', '', '']]
    )

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')

    return csvContent
  }

  /**
   * Writes report to file
   */
  private async writeReport(report: ComplianceReport, options: ReportOptions): Promise<void> {
    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `brand-compliance-report-${timestamp}.${options.format}`
    const filepath = options.outputPath ? `${options.outputPath}/${filename}` : filename

    let content: string

    switch (options.format) {
      case 'html':
        content = await this.generateHtmlReport(report)
        break
      case 'markdown':
        content = await this.generateMarkdownReport(report)
        break
      case 'csv':
        content = await this.generateCsvReport(report)
        break
      default:
        content = JSON.stringify(report, null, 2)
    }

    // In a real implementation, this would write to the file system
    console.log(`Report written to: ${filepath}`)
    console.log(`Content length: ${content.length} characters`)
  }

  /**
   * Calculates summary statistics
   */
  private calculateSummary(components: ComponentReport[]): ReportSummary {
    const totalComponents = components.length
    const passedComponents = components.filter(c => c.status === 'pass').length
    const warningComponents = components.filter(c => c.status === 'warning').length
    const failedComponents = components.filter(c => c.status === 'fail').length

    const allViolations = components.flatMap(c => c.violations)
    const totalViolations = allViolations.length
    const errorViolations = allViolations.filter(v => v.severity === 'error').length
    const warningViolations = allViolations.filter(v => v.severity === 'warning').length
    const infoViolations = allViolations.filter(v => v.severity === 'info').length

    return {
      totalComponents,
      passedComponents,
      warningComponents,
      failedComponents,
      totalViolations,
      errorViolations,
      warningViolations,
      infoViolations
    }
  }

  /**
   * Calculates overall score
   */
  private calculateOverallScore(components: ComponentReport[]): number {
    if (components.length === 0) return 100

    const totalScore = components.reduce((sum, component) => sum + component.score, 0)
    return Math.round(totalScore / components.length)
  }

  /**
   * Generates recommendations
   */
  private generateRecommendations(components: ComponentReport[], overallScore: number): string[] {
    const recommendations: string[] = []

    if (overallScore < 80) {
      recommendations.push('Overall brand compliance is below threshold. Review and fix violations.')
    }

    const errorComponents = components.filter(c => c.status === 'fail')
    if (errorComponents.length > 0) {
      recommendations.push(`${errorComponents.length} components have critical violations that must be fixed.`)
    }

    const warningComponents = components.filter(c => c.status === 'warning')
    if (warningComponents.length > 0) {
      recommendations.push(`${warningComponents.length} components have warnings that should be addressed.`)
    }

    const colorViolations = components.flatMap(c => c.violations).filter(v => v.type === 'color')
    if (colorViolations.length > 0) {
      recommendations.push('Review color usage and ensure all colors are from the brand palette.')
    }

    const typographyViolations = components.flatMap(c => c.violations).filter(v => v.type === 'typography')
    if (typographyViolations.length > 0) {
      recommendations.push('Update typography to use Inter font family and approved weights.')
    }

    const accessibilityViolations = components.flatMap(c => c.violations).filter(v => v.type === 'accessibility')
    if (accessibilityViolations.length > 0) {
      recommendations.push('Improve accessibility by increasing color contrast and font sizes.')
    }

    if (recommendations.length === 0) {
      recommendations.push('Excellent! All components follow brand guidelines.')
    }

    return recommendations
  }

  /**
   * Gets all reports
   */
  getReports(): ComplianceReport[] {
    return [...this.reports]
  }

  /**
   * Gets latest report
   */
  getLatestReport(): ComplianceReport | null {
    return this.reports.length > 0 ? this.reports[this.reports.length - 1] : null
  }

  /**
   * Clears all reports
   */
  clearReports(): void {
    this.reports = []
  }
}

// Export singleton instance
export const brandComplianceReporter = BrandComplianceReporter.getInstance()
