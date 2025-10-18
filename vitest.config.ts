import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov', 'text-summary'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        '**/__mocks__/**',
        '**/dist/**',
        '**/build/**',
        '**/out/**',
      ],
      // CRITICAL: Enforce 80% coverage (CODING-RULES.md requirement)
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    // Test timeout for async operations
    testTimeout: 10000,
    // Hook timeout for setup/teardown
    hookTimeout: 10000,
  },
  resolve: {
    alias: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      '@': resolve(process.cwd(), './src'),
    },
  },
})
