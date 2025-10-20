// ESLint v9 Configuration for Toubkal Browser
// Last Updated: 2025-10-18
// Purpose: Enforce CODING-RULES.md and TypeScript strict mode

import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

// Custom rule to prevent Jest usage (we use Vitest)
const noJestUsage = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow Jest usage - use Vitest (vi) instead',
      category: 'Best Practices',
    },
    messages: {
      noJest: 'Use vi.{{method}}() from Vitest, not jest.{{method}}(). We use Vitest, not Jest. See QUICK-START.md',
      noJestImport: 'Do not import from Jest. Use "import { vi } from \'vitest\'" instead.',
    },
    schema: [],
  },
  create(context) {
    return {
      MemberExpression(node) {
        if (node.object.name === 'jest') {
          const method = node.property.name || 'fn';
          context.report({
            node,
            messageId: 'noJest',
            data: { method },
          });
        }
      },
      ImportDeclaration(node) {
        if (node.source.value === '@jest/globals' ||
            node.source.value === 'jest' ||
            node.source.value.includes('jest')) {
          // Allow @testing-library/jest-dom (it works with Vitest)
          if (node.source.value === '@testing-library/jest-dom' ||
              node.source.value === '@testing-library/jest-dom/matchers') {
            return;
          }
          context.report({
            node,
            messageId: 'noJestImport',
          });
        }
      },
    };
  },
};

export default [
  // Base JavaScript configuration
  js.configs.recommended,

  // TypeScript configuration
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: './tsconfig.json',
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        navigator: 'readonly',
        screen: 'readonly',
        performance: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        confirm: 'readonly',
        alert: 'readonly',
        btoa: 'readonly',
        atob: 'readonly',
        getComputedStyle: 'readonly',
        // Node.js globals
        global: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        // Test globals
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        vi: 'readonly',
        vitest: 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': typescript,
      'react': react,
      'react-hooks': reactHooks,
      'toubkal-custom': {
        rules: {
          'no-jest-usage': noJestUsage,
        },
      },
    },
    rules: {
      // CRITICAL: Block Jest usage (we use Vitest)
      'toubkal-custom/no-jest-usage': 'error',

      // CRITICAL: Enforce CODING-RULES.md
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/strict-boolean-expressions': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',

      // Error handling rules
      'no-throw-literal': 'error',
      '@typescript-eslint/only-throw-error': 'error',

      // Promise rules
      'require-await': 'error',

      // React rules
      'react/prop-types': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Naming conventions (enforce CODING-RULES.md)
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'default',
          format: ['camelCase'],
          leadingUnderscore: 'forbid',
          trailingUnderscore: 'forbid'
        },
        {
          selector: 'variable',
          format: ['camelCase', 'UPPER_CASE', 'PascalCase']
        },
        {
          selector: 'function',
          format: ['camelCase', 'PascalCase']
        },
        {
          selector: 'typeLike',
          format: ['PascalCase']
        },
        {
          selector: 'enumMember',
          format: ['PascalCase']
        },
        {
          selector: 'import',
          format: ['camelCase', 'PascalCase']
        },
        {
          selector: 'objectLiteralProperty',
          format: ['camelCase', 'UPPER_CASE']
        }
      ]
    },
    settings: {
      react: {
        version: 'detect'
      }
    }
  },
  
  // Ignore patterns
  {
    ignores: [
      'node_modules/**',
      'out/**',
      'build/**',
      'dist/**',
      'coverage/**',
      '.nyc_output/**'
    ]
  }
];
