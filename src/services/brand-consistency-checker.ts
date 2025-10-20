/**
 * Brand Consistency Checker Service
 *
 * Validates UI components against Toubkal Browser brand guidelines.
 * Ensures color palette compliance, typography consistency, and logo usage.
 */

import { Result } from '@/types/CommonTypes'

export interface BrandViolation {
  type: 'color' | 'typography' | 'spacing' | 'logo' | 'accessibility'
  severity: 'error' | 'warning' | 'info'
  component: string
  property: string
  expected: string
  actual: string
  message: string
  fix?: string
}

export interface BrandComplianceReport {
  overallScore: number // 0-100
  violations: BrandViolation[]
  summary: {
    total: number
    errors: number
    warnings: number
    info: number
  }
  recommendations: string[]
}

export interface ColorContrastResult {
  ratio: number
  level: 'AAA' | 'AA' | 'AA-Large' | 'Fail'
  accessible: boolean
}

// Brand color palette from guidelines
export const BRAND_COLORS = {
  primary: {
    toubkalBlue: '#2563EB',
    deepMountain: '#2C5F8D',
  },
  secondary: {
    mountainGray: '#6B7280',
    privacyGreen: '#10B981',
    warningAmber: '#F59E0B',
    errorRed: '#EF4444',
  },
  neutral: {
    white: '#FFFFFF',
    gray50: '#F9FAFB',
    gray200: '#E5E7EB',
    gray500: '#6B7280',
    gray700: '#374151',
    gray800: '#1F2937',
    gray900: '#111827',
  },
} as const

// Typography standards
export const TYPOGRAPHY_STANDARDS = {
  fontFamily: 'Inter',
  weights: [300, 400, 500, 600, 700],
  sizes: {
    h1: { desktop: 48, mobile: 36 },
    h2: { desktop: 36, mobile: 30 },
    h3: { desktop: 30, mobile: 24 },
    h4: { desktop: 24, mobile: 20 },
    h5: { desktop: 20, mobile: 18 },
    h6: { desktop: 18, mobile: 16 },
    body: { desktop: 16, mobile: 14 },
    small: { desktop: 14, mobile: 12 },
    caption: { desktop: 12, mobile: 10 },
  },
} as const

// Spacing standards (8px grid)
export const SPACING_STANDARDS = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  twoXl: 48,
} as const

export class BrandConsistencyChecker {
  private static instance: BrandConsistencyChecker
  private violations: BrandViolation[] = []

  private constructor() {}

  static getInstance(): BrandConsistencyChecker {
    if (BrandConsistencyChecker.instance == null) {
      BrandConsistencyChecker.instance = new BrandConsistencyChecker()
    }
    return BrandConsistencyChecker.instance
  }

  /**
   * Validates a component against brand guidelines
   */
  async validateComponent(
    componentName: string,
    styles: Record<string, unknown>
  ): Promise<Result<BrandComplianceReport>> {
    try {
      this.violations = []

      // Check color compliance
      this.checkColorCompliance(componentName, styles)

      // Check typography compliance
      this.checkTypographyCompliance(componentName, styles)

      // Check spacing compliance
      this.checkSpacingCompliance(componentName, styles)

      // Check accessibility compliance
      await this.checkAccessibilityCompliance(componentName, styles)

      const report = this.generateReport()
      return { success: true, data: report }
    } catch (error) {
      console.error('[BrandConsistencyChecker.validateComponent] Failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Validation failed',
      }
    }
  }

  /**
   * Checks color palette compliance
   */
  private checkColorCompliance(componentName: string, styles: Record<string, unknown>): void {
    const colorProperties = ['color', 'backgroundColor', 'borderColor', 'fill', 'stroke']

    for (const [property, value] of Object.entries(styles)) {
      if (colorProperties.includes(property) && typeof value === 'string') {
        const color = this.normalizeColor(value)

        if (this.isColorValue(color)) {
          const brandColor = this.findBrandColor(color)

          if (brandColor == null) {
            this.violations.push({
              type: 'color',
              severity: 'warning',
              component: componentName,
              property,
              expected: 'Brand color from palette',
              actual: color,
              message: `Color "${color}" is not in the brand palette`,
              fix: `Use one of: ${Object.values(BRAND_COLORS).flat().join(', ')}`,
            })
          }
        }
      }
    }
  }

  /**
   * Checks typography compliance
   */
  private checkTypographyCompliance(componentName: string, styles: Record<string, unknown>): void {
    // Check font family
    if (
      styles.fontFamily !== null &&
      styles.fontFamily !== undefined &&
      typeof styles.fontFamily === 'string' &&
      !styles.fontFamily.includes('Inter')
    ) {
      this.violations.push({
        type: 'typography',
        severity: 'error',
        component: componentName,
        property: 'fontFamily',
        expected: 'Inter',
        actual: styles.fontFamily,
        message: 'Font family must be Inter',
        fix: "fontFamily: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      })
    }

    // Check font weight
    if (
      styles.fontWeight !== null &&
      styles.fontWeight !== undefined &&
      !TYPOGRAPHY_STANDARDS.weights.includes(styles.fontWeight)
    ) {
      this.violations.push({
        type: 'typography',
        severity: 'warning',
        component: componentName,
        property: 'fontWeight',
        expected: TYPOGRAPHY_STANDARDS.weights.join(' | '),
        actual: styles.fontWeight.toString(),
        message: 'Font weight should be from approved weights',
        fix: `Use one of: ${TYPOGRAPHY_STANDARDS.weights.join(', ')}`,
      })
    }

    // Check font size
    if (styles.fontSize !== null && styles.fontSize !== undefined) {
      const fontSize = this.parseFontSize(styles.fontSize)
      if (fontSize !== null && fontSize !== undefined && !this.isValidFontSize(fontSize)) {
        this.violations.push({
          type: 'typography',
          severity: 'info',
          component: componentName,
          property: 'fontSize',
          expected: 'Standard font size from guidelines',
          actual: styles.fontSize,
          message: 'Font size should follow typography scale',
          fix: 'Use sizes from typography guidelines',
        })
      }
    }
  }

  /**
   * Checks spacing compliance (8px grid)
   */
  private checkSpacingCompliance(componentName: string, styles: Record<string, unknown>): void {
    const spacingProperties = ['padding', 'margin', 'gap', 'top', 'right', 'bottom', 'left']

    for (const [property, value] of Object.entries(styles)) {
      if (spacingProperties.some((prop) => property.includes(prop)) && typeof value === 'string') {
        const spacing = this.parseSpacing(value)

        if (spacing !== null && spacing !== undefined && !this.isValidSpacing(spacing)) {
          this.violations.push({
            type: 'spacing',
            severity: 'info',
            component: componentName,
            property,
            expected: 'Multiple of 8px',
            actual: value,
            message: 'Spacing should follow 8px grid system',
            fix: 'Use values that are multiples of 8px (4, 8, 16, 24, 32, 48)',
          })
        }
      }
    }
  }

  /**
   * Checks accessibility compliance
   */
  private checkAccessibilityCompliance(
    componentName: string,
    styles: Record<string, unknown>
  ): Promise<void> {
    // Check color contrast
    if (
      styles.color !== null &&
      styles.color !== undefined &&
      styles.backgroundColor !== null &&
      styles.backgroundColor !== undefined
    ) {
      const contrast = this.calculateColorContrast(styles.color, styles.backgroundColor)

      if (contrast.ratio < 4.5) {
        this.violations.push({
          type: 'accessibility',
          severity: 'error',
          component: componentName,
          property: 'color contrast',
          expected: '≥ 4.5:1 (WCAG AA)',
          actual: `${contrast.ratio.toFixed(2)}:1`,
          message: 'Color contrast does not meet WCAG AA standards',
          fix: 'Increase contrast between text and background colors',
        })
      }
    }

    // Check minimum font size
    if (styles.fontSize !== null && styles.fontSize !== undefined) {
      const fontSize = this.parseFontSize(styles.fontSize)
      if (fontSize !== null && fontSize !== undefined && fontSize < 12) {
        this.violations.push({
          type: 'accessibility',
          severity: 'warning',
          component: componentName,
          property: 'fontSize',
          expected: '≥ 12px',
          actual: `${fontSize}px`,
          message: 'Font size is too small for accessibility',
          fix: 'Use minimum 12px font size for body text',
        })
      }
    }
  }

  /**
   * Calculates color contrast ratio
   */
  private calculateColorContrast(color1: string, color2: string): ColorContrastResult {
    const rgb1 = this.hexToRgb(this.normalizeColor(color1))
    const rgb2 = this.hexToRgb(this.normalizeColor(color2))

    if (!rgb1 || !rgb2) {
      return { ratio: 0, level: 'Fail', accessible: false }
    }

    const lum1 = this.getLuminance(rgb1)
    const lum2 = this.getLuminance(rgb2)

    const ratio = (Math.max(lum1, lum2) + 0.05) / (Math.min(lum1, lum2) + 0.05)

    let level: 'AAA' | 'AA' | 'AA-Large' | 'Fail'
    if (ratio >= 7) level = 'AAA'
    else if (ratio >= 4.5) level = 'AA'
    else if (ratio >= 3) level = 'AA-Large'
    else level = 'Fail'

    return {
      ratio: Math.round(ratio * 100) / 100,
      level,
      accessible: ratio >= 4.5,
    }
  }

  /**
   * Generates compliance report
   */
  private generateReport(): BrandComplianceReport {
    const errors = this.violations.filter((v) => v.severity === 'error').length
    const warnings = this.violations.filter((v) => v.severity === 'warning').length
    const info = this.violations.filter((v) => v.severity === 'info').length

    const total = this.violations.length
    const score = total === 0 ? 100 : Math.max(0, 100 - errors * 10 - warnings * 5 - info * 2)

    const recommendations = this.generateRecommendations()

    return {
      overallScore: Math.round(score),
      violations: [...this.violations],
      summary: {
        total,
        errors,
        warnings,
        info,
      },
      recommendations,
    }
  }

  /**
   * Generates recommendations based on violations
   */
  private generateRecommendations(): string[] {
    const recommendations: string[] = []

    const colorViolations = this.violations.filter((v) => v.type === 'color')
    if (colorViolations.length > 0) {
      recommendations.push('Review color usage and ensure all colors are from the brand palette')
    }

    const typographyViolations = this.violations.filter((v) => v.type === 'typography')
    if (typographyViolations.length > 0) {
      recommendations.push('Update typography to use Inter font family and approved weights')
    }

    const spacingViolations = this.violations.filter((v) => v.type === 'spacing')
    if (spacingViolations.length > 0) {
      recommendations.push('Adjust spacing to follow the 8px grid system')
    }

    const accessibilityViolations = this.violations.filter((v) => v.type === 'accessibility')
    if (accessibilityViolations.length > 0) {
      recommendations.push('Improve accessibility by increasing color contrast and font sizes')
    }

    if (recommendations.length === 0) {
      recommendations.push('Great job! Component follows all brand guidelines')
    }

    return recommendations
  }

  // Helper methods
  private normalizeColor(color: string): string {
    // Convert various color formats to hex
    if (color.startsWith('#')) return color.toUpperCase()
    if (color.startsWith('rgb')) return this.rgbToHex(color)
    if (color.startsWith('hsl')) return this.hslToHex(color)
    return color
  }

  private isColorValue(value: string): boolean {
    return (
      /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value) ||
      /^rgb\(/.test(value) ||
      /^hsl\(/.test(value)
    )
  }

  private findBrandColor(color: string): string | null {
    const allColors = Object.values(BRAND_COLORS).flatMap((group) =>
      typeof group === 'string' ? [group] : Object.values(group)
    )
    return allColors.find((c) => c.toUpperCase() === color.toUpperCase()) || null
  }

  private parseFontSize(value: string): number | null {
    const match = value.match(/(\d+(?:\.\d+)?)px/)
    return match ? parseFloat(match[1]) : null
  }

  private isValidFontSize(size: number): boolean {
    const validSizes = Object.values(TYPOGRAPHY_STANDARDS.sizes).flatMap((s) => [
      s.desktop,
      s.mobile,
    ])
    return (validSizes as number[]).includes(size)
  }

  private parseSpacing(value: string): number | null {
    const match = value.match(/(\d+(?:\.\d+)?)px/)
    return match ? parseFloat(match[1]) : null
  }

  private isValidSpacing(spacing: number): boolean {
    return (
      Object.values(SPACING_STANDARDS).includes(spacing as keyof typeof SPACING_STANDARDS) ||
      spacing % 8 === 0
    )
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null
  }

  private getLuminance(rgb: { r: number; g: number; b: number }): number {
    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((c) => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }

  private rgbToHex(): string {
    // Implementation for rgb to hex conversion
    return '#000000' // Placeholder
  }

  private hslToHex(): string {
    // Implementation for hsl to hex conversion
    return '#000000' // Placeholder
  }
}

// Export singleton instance
export const brandConsistencyChecker = BrandConsistencyChecker.getInstance()
