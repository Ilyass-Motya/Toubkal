/**
 * Brand Consistency Tests
 * 
 * Automated tests to validate UI components against Toubkal Browser brand guidelines.
 * Ensures color palette compliance, typography consistency, and accessibility standards.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { brandConsistencyChecker, BRAND_COLORS, TYPOGRAPHY_STANDARDS } from '../services/brand-consistency-checker'

describe('Brand Consistency Checker', () => {
  beforeEach(() => {
    // Reset violations before each test
    vi.clearAllMocks()
  })

  describe('Color Compliance', () => {
    it('should pass validation for brand colors', async () => {
      const styles = {
        color: BRAND_COLORS.primary.toubkalBlue,
        backgroundColor: BRAND_COLORS.neutral.white
      }

      const result = await brandConsistencyChecker.validateComponent('TestComponent', styles)
      
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.violations).toHaveLength(0)
        expect(result.data.overallScore).toBe(100)
      }
    })

    it('should flag non-brand colors as violations', async () => {
      const styles = {
        color: '#FF0000', // Red not in brand palette
        backgroundColor: '#00FF00' // Green not in brand palette
      }

      const result = await brandConsistencyChecker.validateComponent('TestComponent', styles)
      
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.violations.length).toBeGreaterThan(0)
        expect(result.data.violations.some(v => v.type === 'color')).toBe(true)
        expect(result.data.overallScore).toBeLessThan(100)
      }
    })

    it('should validate color contrast ratios', async () => {
      const styles = {
        color: '#FFFFFF', // White text
        backgroundColor: '#FFFFFF' // White background - no contrast
      }

      const result = await brandConsistencyChecker.validateComponent('TestComponent', styles)
      
      expect(result.success).toBe(true)
      if (result.success) {
        const contrastViolations = result.data.violations.filter(v => 
          v.type === 'accessibility' && v.property === 'color contrast'
        )
        expect(contrastViolations.length).toBeGreaterThan(0)
        expect(contrastViolations[0].severity).toBe('error')
      }
    })

    it('should pass validation for high contrast colors', async () => {
      const styles = {
        color: BRAND_COLORS.neutral.gray900, // Dark text
        backgroundColor: BRAND_COLORS.neutral.white // White background
      }

      const result = await brandConsistencyChecker.validateComponent('TestComponent', styles)
      
      expect(result.success).toBe(true)
      if (result.success) {
        const contrastViolations = result.data.violations.filter(v => 
          v.type === 'accessibility' && v.property === 'color contrast'
        )
        expect(contrastViolations).toHaveLength(0)
      }
    })
  })

  describe('Typography Compliance', () => {
    it('should pass validation for Inter font family', async () => {
      const styles = {
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }

      const result = await brandConsistencyChecker.validateComponent('TestComponent', styles)
      
      expect(result.success).toBe(true)
      if (result.success) {
        const typographyViolations = result.data.violations.filter(v => v.type === 'typography')
        expect(typographyViolations).toHaveLength(0)
      }
    })

    it('should flag non-Inter font families as violations', async () => {
      const styles = {
        fontFamily: 'Arial, sans-serif'
      }

      const result = await brandConsistencyChecker.validateComponent('TestComponent', styles)
      
      expect(result.success).toBe(true)
      if (result.success) {
        const typographyViolations = result.data.violations.filter(v => 
          v.type === 'typography' && v.property === 'fontFamily'
        )
        expect(typographyViolations.length).toBeGreaterThan(0)
        expect(typographyViolations[0].severity).toBe('error')
      }
    })

    it('should validate font weights', async () => {
      const styles = {
        fontWeight: 800 // Not in approved weights
      }

      const result = await brandConsistencyChecker.validateComponent('TestComponent', styles)
      
      expect(result.success).toBe(true)
      if (result.success) {
        const weightViolations = result.data.violations.filter(v => 
          v.type === 'typography' && v.property === 'fontWeight'
        )
        expect(weightViolations.length).toBeGreaterThan(0)
        expect(weightViolations[0].severity).toBe('warning')
      }
    })

    it('should pass validation for approved font weights', async () => {
      for (const weight of TYPOGRAPHY_STANDARDS.weights) {
        const styles = {
          fontWeight: weight
        }

        const result = await brandConsistencyChecker.validateComponent('TestComponent', styles)
        
        expect(result.success).toBe(true)
        if (result.success) {
          const weightViolations = result.data.violations.filter(v => 
            v.type === 'typography' && v.property === 'fontWeight'
          )
          expect(weightViolations).toHaveLength(0)
        }
      }
    })
  })

  describe('Spacing Compliance', () => {
    it('should pass validation for 8px grid spacing', async () => {
      const styles = {
        padding: '16px',
        margin: '24px',
        gap: '8px'
      }

      const result = await brandConsistencyChecker.validateComponent('TestComponent', styles)
      
      expect(result.success).toBe(true)
      if (result.success) {
        const spacingViolations = result.data.violations.filter(v => v.type === 'spacing')
        expect(spacingViolations).toHaveLength(0)
      }
    })

    it('should flag non-grid spacing as violations', async () => {
      const styles = {
        padding: '15px', // Not multiple of 8
        margin: '13px'   // Not multiple of 8
      }

      const result = await brandConsistencyChecker.validateComponent('TestComponent', styles)
      
      expect(result.success).toBe(true)
      if (result.success) {
        const spacingViolations = result.data.violations.filter(v => v.type === 'spacing')
        expect(spacingViolations.length).toBeGreaterThan(0)
        expect(spacingViolations[0].severity).toBe('info')
      }
    })
  })

  describe('Accessibility Compliance', () => {
    it('should flag small font sizes as violations', async () => {
      const styles = {
        fontSize: '10px' // Below minimum 12px
      }

      const result = await brandConsistencyChecker.validateComponent('TestComponent', styles)
      
      expect(result.success).toBe(true)
      if (result.success) {
        const accessibilityViolations = result.data.violations.filter(v => 
          v.type === 'accessibility' && v.property === 'fontSize'
        )
        expect(accessibilityViolations.length).toBeGreaterThan(0)
        expect(accessibilityViolations[0].severity).toBe('warning')
      }
    })

    it('should pass validation for accessible font sizes', async () => {
      const styles = {
        fontSize: '14px' // Above minimum 12px
      }

      const result = await brandConsistencyChecker.validateComponent('TestComponent', styles)
      
      expect(result.success).toBe(true)
      if (result.success) {
        const accessibilityViolations = result.data.violations.filter(v => 
          v.type === 'accessibility' && v.property === 'fontSize'
        )
        expect(accessibilityViolations).toHaveLength(0)
      }
    })
  })

  describe('Component Validation', () => {
    it('should validate complete component styles', async () => {
      const styles = {
        color: BRAND_COLORS.primary.toubkalBlue,
        backgroundColor: BRAND_COLORS.neutral.white,
        fontFamily: 'Inter, sans-serif',
        fontSize: '16px',
        fontWeight: 400,
        padding: '16px',
        margin: '8px'
      }

      const result = await brandConsistencyChecker.validateComponent('Button', styles)
      
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.violations).toHaveLength(0)
        expect(result.data.overallScore).toBe(100)
        expect(result.data.summary.total).toBe(0)
      }
    })

    it('should generate comprehensive report for violations', async () => {
      const styles = {
        color: '#FF0000', // Non-brand color
        fontFamily: 'Arial, sans-serif', // Non-Inter font
        fontSize: '10px', // Too small
        padding: '15px' // Non-grid spacing
      }

      const result = await brandConsistencyChecker.validateComponent('BadComponent', styles)
      
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.violations.length).toBeGreaterThan(0)
        expect(result.data.overallScore).toBeLessThan(100)
        expect(result.data.recommendations.length).toBeGreaterThan(0)
        
        // Check violation types
        const violationTypes = result.data.violations.map(v => v.type)
        expect(violationTypes).toContain('color')
        expect(violationTypes).toContain('typography')
        expect(violationTypes).toContain('accessibility')
        expect(violationTypes).toContain('spacing')
      }
    })
  })

  describe('Report Generation', () => {
    it('should generate accurate summary statistics', async () => {
      const styles = {
        color: '#FF0000', // Error
        fontFamily: 'Arial', // Error
        fontSize: '10px', // Warning
        padding: '15px' // Info
      }

      const result = await brandConsistencyChecker.validateComponent('TestComponent', styles)
      
      expect(result.success).toBe(true)
      if (result.success) {
        const { summary } = result.data
        expect(summary.total).toBeGreaterThan(0)
        expect(summary.errors).toBeGreaterThan(0)
        expect(summary.warnings).toBeGreaterThan(0)
        expect(summary.info).toBeGreaterThan(0)
        expect(summary.total).toBe(summary.errors + summary.warnings + summary.info)
      }
    })

    it('should provide helpful recommendations', async () => {
      const styles = {
        color: '#FF0000',
        fontFamily: 'Arial'
      }

      const result = await brandConsistencyChecker.validateComponent('TestComponent', styles)
      
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.recommendations.length).toBeGreaterThan(0)
        expect(result.data.recommendations[0]).toContain('color')
        expect(result.data.recommendations[0]).toContain('brand palette')
      }
    })
  })
})
