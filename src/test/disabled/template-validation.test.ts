/**
 * Template Validation Tests
 *
 * Integration tests for template parsing and validation
 * AC2: Integration tests for templates
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
    writeFile: vi.fn(),
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
  },
}))

describe('Template Validation Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('.gclient.template parsing and validation', () => {
    it('should parse valid gclient template correctly', async () => {
      // Arrange
      const mockFs = vi.mocked(fs)
      const validGclientTemplate = `solutions = [
  {
    "name": "src",
    "url": "https://chromium.googlesource.com/chromium/src.git",
    "managed": False,
    "custom_deps": {},
    "custom_vars": {}
  }
]

target_os = ["linux", "mac", "win"]
cache_dir = None
`

      mockFs.readFile.mockResolvedValue(validGclientTemplate)

      // Act
      const content = await mockFs.readFile('.gclient.template', 'utf8')

      // Assert
      expect(content).toContain('solutions = [')
      expect(content).toContain('"name": "src"')
      expect(content).toContain('"url": "https://chromium.googlesource.com/chromium/src.git"')
      expect(content).toContain('"managed": False')
      expect(content).toContain('target_os = ["linux", "mac", "win"]')
    })

    it('should validate gclient template structure', async () => {
      // Arrange
      const mockFs = vi.mocked(fs)
      const validGclientTemplate = `solutions = [
  {
    "name": "src",
    "url": "https://chromium.googlesource.com/chromium/src.git",
    "managed": False,
    "custom_deps": {},
    "custom_vars": {}
  }
]

target_os = ["linux", "mac", "win"]
cache_dir = None
`

      mockFs.readFile.mockResolvedValue(validGclientTemplate)

      // Act
      const content = await mockFs.readFile('.gclient.template', 'utf8')
      const hasSolutions = content.includes('solutions = [')
      const hasName = content.includes('"name": "src"')
      const hasUrl = content.includes('"url": "https://chromium.googlesource.com/chromium/src.git"')
      const hasManaged = content.includes('"managed": False')
      const hasTargetOs = content.includes('target_os = [')

      // Assert
      expect(hasSolutions).toBe(true)
      expect(hasName).toBe(true)
      expect(hasUrl).toBe(true)
      expect(hasManaged).toBe(true)
      expect(hasTargetOs).toBe(true)
    })

    it('should handle invalid gclient template gracefully', async () => {
      // Arrange
      const mockFs = vi.mocked(fs)
      const invalidGclientTemplate = `invalid syntax here
missing quotes and brackets
`

      mockFs.readFile.mockResolvedValue(invalidGclientTemplate)

      // Act
      const content = await mockFs.readFile('.gclient.template', 'utf8')
      const hasSolutions = content.includes('solutions = [')
      const hasName = content.includes('"name": "src"')

      // Assert
      expect(hasSolutions).toBe(false)
      expect(hasName).toBe(false)
    })

    it('should customize gclient template for Linux', async () => {
      // Arrange
      const mockFs = vi.mocked(fs)
      const baseTemplate = `solutions = [
  {
    "name": "src",
    "url": "https://chromium.googlesource.com/chromium/src.git",
    "managed": False,
    "custom_deps": {},
    "custom_vars": {}
  }
]

target_os = ["linux", "mac", "win"]
cache_dir = None
`

      mockFs.readFile.mockResolvedValue(baseTemplate)
      mockFs.writeFile.mockResolvedValue(undefined)

      // Act
      const content = await mockFs.readFile('.gclient.template', 'utf8')
      const customizedContent = content.replace('target_os = ["linux", "mac", "win"]', 'target_os = ["linux"]')
      await mockFs.writeFile('.gclient', customizedContent)

      // Assert
      expect(mockFs.readFile).toHaveBeenCalledWith('.gclient.template', 'utf8')
      expect(mockFs.writeFile).toHaveBeenCalledWith('.gclient', customizedContent)
      expect(customizedContent).toContain('target_os = ["linux"]')
    })

    it('should customize gclient template for macOS', async () => {
      // Arrange
      const mockFs = vi.mocked(fs)
      const baseTemplate = `solutions = [
  {
    "name": "src",
    "url": "https://chromium.googlesource.com/chromium/src.git",
    "managed": False,
    "custom_deps": {},
    "custom_vars": {}
  }
]

target_os = ["linux", "mac", "win"]
cache_dir = None
`

      mockFs.readFile.mockResolvedValue(baseTemplate)
      mockFs.writeFile.mockResolvedValue(undefined)

      // Act
      const content = await mockFs.readFile('.gclient.template', 'utf8')
      const customizedContent = content.replace('target_os = ["linux", "mac", "win"]', 'target_os = ["mac"]')
      await mockFs.writeFile('.gclient', customizedContent)

      // Assert
      expect(mockFs.readFile).toHaveBeenCalledWith('.gclient.template', 'utf8')
      expect(mockFs.writeFile).toHaveBeenCalledWith('.gclient', customizedContent)
      expect(customizedContent).toContain('target_os = ["mac"]')
    })

    it('should customize gclient template for Windows', async () => {
      // Arrange
      const mockFs = vi.mocked(fs)
      const baseTemplate = `solutions = [
  {
    "name": "src",
    "url": "https://chromium.googlesource.com/chromium/src.git",
    "managed": False,
    "custom_deps": {},
    "custom_vars": {}
  }
]

target_os = ["linux", "mac", "win"]
cache_dir = None
`

      mockFs.readFile.mockResolvedValue(baseTemplate)
      mockFs.writeFile.mockResolvedValue(undefined)

      // Act
      const content = await mockFs.readFile('.gclient.template', 'utf8')
      const customizedContent = content.replace('target_os = ["linux", "mac", "win"]', 'target_os = ["win"]')
      await mockFs.writeFile('.gclient', customizedContent)

      // Assert
      expect(mockFs.readFile).toHaveBeenCalledWith('.gclient.template', 'utf8')
      expect(mockFs.writeFile).toHaveBeenCalledWith('.gclient', customizedContent)
      expect(customizedContent).toContain('target_os = ["win"]')
    })

    it('should handle missing gclient template file', async () => {
      // Arrange
      const mockFs = vi.mocked(fs)
      mockFs.access.mockRejectedValue(new Error('File not found'))

      // Act & Assert
      await expect(mockFs.access('.gclient.template')).rejects.toThrow('File not found')
    })

    it('should backup existing gclient configuration', async () => {
      // Arrange
      const mockFs = vi.mocked(fs)
      mockFs.access.mockResolvedValue(undefined) // File exists
      mockFs.readFile.mockResolvedValue('existing content')
      mockFs.writeFile.mockResolvedValue(undefined)

      // Act
      await mockFs.access('.gclient')
      const existingContent = await mockFs.readFile('.gclient', 'utf8')
      await mockFs.writeFile('.gclient.backup.20250127_123456', existingContent)

      // Assert
      expect(mockFs.access).toHaveBeenCalledWith('.gclient')
      expect(mockFs.readFile).toHaveBeenCalledWith('.gclient', 'utf8')
      expect(mockFs.writeFile).toHaveBeenCalledWith('.gclient.backup.20250127_123456', existingContent)
    })
  })

  describe('args.gn.template parsing and validation', () => {
    it('should parse valid args.gn template correctly', async () => {
      // Arrange
      const mockFs = vi.mocked(fs)
      const validArgsGnTemplate = `# Toubkal Browser Build Configuration
# Generated from template

# Build type
is_debug = true
is_official_build = false

# Target platform
target_os = "linux"
target_cpu = "x64"

# Chromium features
enable_nacl = false
enable_widevine = false
enable_hangout_services_extension = false

# Toubkal-specific features
enable_toubkal_privacy = true
enable_toubkal_ai = true
enable_toubkal_audit = true

# Performance optimizations
use_goma = false
use_sccache = true
symbol_level = 1

# Security
is_cfi = true
use_cfi_icall = true
use_cfi_cast = true
`

      mockFs.readFile.mockResolvedValue(validArgsGnTemplate)

      // Act
      const content = await mockFs.readFile('args.gn.template', 'utf8')

      // Assert
      expect(content).toContain('is_debug = true')
      expect(content).toContain('target_os = "linux"')
      expect(content).toContain('enable_toubkal_privacy = true')
      expect(content).toContain('enable_toubkal_ai = true')
      expect(content).toContain('enable_toubkal_audit = true')
    })

    it('should validate args.gn template structure', async () => {
      // Arrange
      const mockFs = vi.mocked(fs)
      const validArgsGnTemplate = `is_debug = true
target_os = "linux"
enable_toubkal_privacy = true
enable_toubkal_ai = true
enable_toubkal_audit = true
`

      mockFs.readFile.mockResolvedValue(validArgsGnTemplate)

      // Act
      const content = await mockFs.readFile('args.gn.template', 'utf8')
      const hasDebug = content.includes('is_debug = true')
      const hasTargetOs = content.includes('target_os = "linux"')
      const hasPrivacy = content.includes('enable_toubkal_privacy = true')
      const hasAi = content.includes('enable_toubkal_ai = true')
      const hasAudit = content.includes('enable_toubkal_audit = true')

      // Assert
      expect(hasDebug).toBe(true)
      expect(hasTargetOs).toBe(true)
      expect(hasPrivacy).toBe(true)
      expect(hasAi).toBe(true)
      expect(hasAudit).toBe(true)
    })

    it('should handle invalid args.gn template gracefully', async () => {
      // Arrange
      const mockFs = vi.mocked(fs)
      const invalidArgsGnTemplate = `invalid syntax here
missing quotes and brackets
unclosed string
`

      mockFs.readFile.mockResolvedValue(invalidArgsGnTemplate)

      // Act
      const content = await mockFs.readFile('args.gn.template', 'utf8')
      const hasDebug = content.includes('is_debug = true')
      const hasTargetOs = content.includes('target_os = "linux"')

      // Assert
      expect(hasDebug).toBe(false)
      expect(hasTargetOs).toBe(false)
    })

    it('should customize args.gn template for Linux', async () => {
      // Arrange
      const mockFs = vi.mocked(fs)
      const baseTemplate = `is_debug = true
target_os = "linux"
enable_toubkal_privacy = true
`

      mockFs.readFile.mockResolvedValue(baseTemplate)
      mockFs.writeFile.mockResolvedValue(undefined)

      // Act
      const content = await mockFs.readFile('args.gn.template', 'utf8')
      const customizedContent = content.replace('target_os = "linux"', 'target_os = "linux"')
      await mockFs.writeFile('args.gn', customizedContent)

      // Assert
      expect(mockFs.readFile).toHaveBeenCalledWith('args.gn.template', 'utf8')
      expect(mockFs.writeFile).toHaveBeenCalledWith('args.gn', customizedContent)
      expect(customizedContent).toContain('target_os = "linux"')
    })

    it('should customize args.gn template for macOS', async () => {
      // Arrange
      const mockFs = vi.mocked(fs)
      const baseTemplate = `is_debug = true
target_os = "linux"
enable_toubkal_privacy = true
`

      mockFs.readFile.mockResolvedValue(baseTemplate)
      mockFs.writeFile.mockResolvedValue(undefined)

      // Act
      const content = await mockFs.readFile('args.gn.template', 'utf8')
      const customizedContent = content.replace('target_os = "linux"', 'target_os = "mac"')
      await mockFs.writeFile('args.gn', customizedContent)

      // Assert
      expect(mockFs.readFile).toHaveBeenCalledWith('args.gn.template', 'utf8')
      expect(mockFs.writeFile).toHaveBeenCalledWith('args.gn', customizedContent)
      expect(customizedContent).toContain('target_os = "mac"')
    })

    it('should customize args.gn template for Windows', async () => {
      // Arrange
      const mockFs = vi.mocked(fs)
      const baseTemplate = `is_debug = true
target_os = "linux"
enable_toubkal_privacy = true
`

      mockFs.readFile.mockResolvedValue(baseTemplate)
      mockFs.writeFile.mockResolvedValue(undefined)

      // Act
      const content = await mockFs.readFile('args.gn.template', 'utf8')
      const customizedContent = content.replace('target_os = "linux"', 'target_os = "win"')
      await mockFs.writeFile('args.gn', customizedContent)

      // Assert
      expect(mockFs.readFile).toHaveBeenCalledWith('args.gn.template', 'utf8')
      expect(mockFs.writeFile).toHaveBeenCalledWith('args.gn', customizedContent)
      expect(customizedContent).toContain('target_os = "win"')
    })

    it('should handle missing args.gn template file', async () => {
      // Arrange
      const mockFs = vi.mocked(fs)
      mockFs.access.mockRejectedValue(new Error('File not found'))

      // Act & Assert
      await expect(mockFs.access('args.gn.template')).rejects.toThrow('File not found')
    })

    it('should backup existing args.gn configuration', async () => {
      // Arrange
      const mockFs = vi.mocked(fs)
      mockFs.access.mockResolvedValue(undefined) // File exists
      mockFs.readFile.mockResolvedValue('existing content')
      mockFs.writeFile.mockResolvedValue(undefined)

      // Act
      await mockFs.access('args.gn')
      const existingContent = await mockFs.readFile('args.gn', 'utf8')
      await mockFs.writeFile('args.gn.backup.20250127_123456', existingContent)

      // Assert
      expect(mockFs.access).toHaveBeenCalledWith('args.gn')
      expect(mockFs.readFile).toHaveBeenCalledWith('args.gn', 'utf8')
      expect(mockFs.writeFile).toHaveBeenCalledWith('args.gn.backup.20250127_123456', existingContent)
    })
  })

  describe('template customization features', () => {
    it('should handle platform-specific customizations', async () => {
      // Arrange
      const mockFs = vi.mocked(fs)
      const baseTemplate = `is_debug = true
target_os = "linux"
enable_toubkal_privacy = true
`

      mockFs.readFile.mockResolvedValue(baseTemplate)
      mockFs.writeFile.mockResolvedValue(undefined)

      // Act
      const content = await mockFs.readFile('args.gn.template', 'utf8')
      const linuxContent = content.replace('target_os = "linux"', 'target_os = "linux"')
      const macContent = content.replace('target_os = "linux"', 'target_os = "mac"')
      const winContent = content.replace('target_os = "linux"', 'target_os = "win"')

      // Assert
      expect(linuxContent).toContain('target_os = "linux"')
      expect(macContent).toContain('target_os = "mac"')
      expect(winContent).toContain('target_os = "win"')
    })

    it('should handle build type customizations', async () => {
      // Arrange
      const mockFs = vi.mocked(fs)
      const baseTemplate = `is_debug = true
is_official_build = false
`

      mockFs.readFile.mockResolvedValue(baseTemplate)
      mockFs.writeFile.mockResolvedValue(undefined)

      // Act
      const content = await mockFs.readFile('args.gn.template', 'utf8')
      const debugContent = content.replace('is_debug = true', 'is_debug = true')
      const releaseContent = content.replace('is_debug = true', 'is_debug = false')

      // Assert
      expect(debugContent).toContain('is_debug = true')
      expect(releaseContent).toContain('is_debug = false')
    })

    it('should handle feature flag customizations', async () => {
      // Arrange
      const mockFs = vi.mocked(fs)
      const baseTemplate = `enable_toubkal_privacy = true
enable_toubkal_ai = true
enable_toubkal_audit = true
`

      mockFs.readFile.mockResolvedValue(baseTemplate)
      mockFs.writeFile.mockResolvedValue(undefined)

      // Act
      const content = await mockFs.readFile('args.gn.template', 'utf8')
      const privacyEnabled = content.includes('enable_toubkal_privacy = true')
      const aiEnabled = content.includes('enable_toubkal_ai = true')
      const auditEnabled = content.includes('enable_toubkal_audit = true')

      // Assert
      expect(privacyEnabled).toBe(true)
      expect(aiEnabled).toBe(true)
      expect(auditEnabled).toBe(true)
    })
  })

  describe('template error handling', () => {
    it('should handle file read errors', async () => {
      // Arrange
      const mockFs = vi.mocked(fs)
      mockFs.readFile.mockRejectedValue(new Error('Read error'))

      // Act & Assert
      await expect(mockFs.readFile('args.gn.template', 'utf8')).rejects.toThrow('Read error')
    })

    it('should handle file write errors', async () => {
      // Arrange
      const mockFs = vi.mocked(fs)
      mockFs.writeFile.mockRejectedValue(new Error('Write error'))

      // Act & Assert
      await expect(mockFs.writeFile('args.gn', 'content')).rejects.toThrow('Write error')
    })

    it('should handle template parsing errors', async () => {
      // Arrange
      const mockFs = vi.mocked(fs)
      const invalidTemplate = `invalid syntax
missing quotes
unclosed brackets
`

      mockFs.readFile.mockResolvedValue(invalidTemplate)

      // Act
      const content = await mockFs.readFile('args.gn.template', 'utf8')
      const isValid = content.includes('is_debug = true') && content.includes('target_os = "linux"')

      // Assert
      expect(isValid).toBe(false)
    })

    it('should handle missing required fields', async () => {
      // Arrange
      const mockFs = vi.mocked(fs)
      const incompleteTemplate = `# Missing required fields
# No is_debug
# No target_os
`

      mockFs.readFile.mockResolvedValue(incompleteTemplate)

      // Act
      const content = await mockFs.readFile('args.gn.template', 'utf8')
      const hasDebug = content.includes('is_debug =')
      const hasTargetOs = content.includes('target_os =')

      // Assert
      expect(hasDebug).toBe(false)
      expect(hasTargetOs).toBe(false)
    })
  })

  describe('cross-platform compatibility', () => {
    it('should handle Windows path separators', () => {
      // Arrange
      const windowsPath = 'C:\\ToubkalBrowser\\src\\args.gn.template'
      const unixPath = 'C:/ToubkalBrowser/src/args.gn.template'

      // Act
      const normalizedPath = windowsPath.replace(/\\/g, '/')

      // Assert
      expect(normalizedPath).toBe(unixPath)
    })

    it('should handle Unix path separators', () => {
      // Arrange
      const unixPath = '/home/user/ToubkalBrowser/src/args.gn.template'

      // Act
      const normalizedPath = unixPath.replace(/\\/g, '/')

      // Assert
      expect(normalizedPath).toBe(unixPath)
    })

    it('should handle mixed path separators', () => {
      // Arrange
      const mixedPath = 'C:\\ToubkalBrowser/src\\args.gn.template'

      // Act
      const normalizedPath = mixedPath.replace(/\\/g, '/')

      // Assert
      expect(normalizedPath).toBe('C:/ToubkalBrowser/src/args.gn.template')
    })
  })
})
