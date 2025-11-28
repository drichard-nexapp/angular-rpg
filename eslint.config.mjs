// eslint.config.js
import js from '@eslint/js'
import globals from 'globals'
import ts from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'
import angular from 'angular-eslint'

export default defineConfig(
  globalIgnores([
    '**/sdk/**', // Your SDK folder ignore
    'dist/', // Common build output ignore
    'node_modules/', // Common node_modules ignore
    '.angular/', // Common node_modules ignore
  ]),
  js.configs.recommended,
  {
    files: ['**/*.ts'],
    extends: [
      ...ts.configs.strictTypeChecked, // Strict type checking rules
      ...ts.configs.stylisticTypeChecked, // Stylistic type checking rules
      ...angular.configs.tsRecommended, // Angular specific TypeScript rules
    ],
    languageOptions: {
      parser: ts.parser, // **Crucial: Use TypeScript parser for .ts files**
      parserOptions: {
        projectService: true, // Use project service for better performance/reliability
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: { ...globals.browser, ...globals.jasmine }, // Apply globals here for TS files
    },
    plugins: {
      '@typescript-eslint': ts.plugin, // Ensure TS plugin is available for rules
      '@angular': angular.tsPlugin, // Angular plugin for TS files
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-unnecessary-condition': 'warn',
      '@typescript-eslint/prefer-nullish-coalescing': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn', // test only
      '@typescript-eslint/restrict-template-expressions': 'off', // maybe not
      '@typescript-eslint/require-await': 'warn', // maybe not
      '@typescript-eslint/no-extraneous-class': 'warn', // maybe not
      '@typescript-eslint/no-unsafe-assignment': 'warn', // maybe not
      '@typescript-eslint/no-redundant-type-constituents': 'warn', // maybe not
      '@typescript-eslint/no-dynamic-delete': 'warn', // maybe not
      '@typescript-eslint/prefer-optional-chain': 'warn', // maybe not
      '@typescript-eslint/unbound-method': 'warn', // maybe not
    },
  },

  // 3. Configuration for Angular HTML template files
  {
    files: ['**/*.html'],
    extends: [...angular.configs.templateRecommended, ...angular.configs.templateAccessibility],
    languageOptions: {
      parser: angular.templateParser, // **Crucial: Use Angular HTML parser for .html files**
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@angular': angular.templatePlugin, // Ensure Angular plugin is available for template rules
    },
    rules: {
      '@angular-eslint/template/attributes-order': [
        'error',
        {
          alphabetical: true,
          order: [
            'STRUCTURAL_DIRECTIVE',
            'TEMPLATE_REFERENCE',
            'ATTRIBUTE_BINDING',
            'INPUT_BINDING',
            'TWO_WAY_BINDING',
            'OUTPUT_BINDING',
          ],
        },
      ],
      '@angular-eslint/template/button-has-type': 'warn',
      '@angular-eslint/template/cyclomatic-complexity': 'off', // maybe not
      '@typescript-eslint/restrict-template-expressions': 'off', // maybe not
      '@angular-eslint/template/eqeqeq': 'error',
      '@angular-eslint/template/prefer-control-flow': 'error',
      '@angular-eslint/template/prefer-ngsrc': 'warn',
      '@angular-eslint/template/prefer-self-closing-tags': 'warn',
      '@angular-eslint/template/use-track-by-function': 'warn',
    },
  },
)
