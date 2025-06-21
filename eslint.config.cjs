const js = require('@eslint/js')
const tsPlugin = require('@typescript-eslint/eslint-plugin')
const tsParser = require('@typescript-eslint/parser')
const prettierPlugin = require('eslint-plugin-prettier')
const prettierConfig = require('eslint-config-prettier')
const jestPlugin = require('eslint-plugin-jest')

module.exports = [
  js.configs.recommended,

  {
    files: ['src/**/*.{js,ts}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
      },
      globals: {
        process: 'readonly',
        console: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      'prettier/prettier': 'error',

      // Regras do TypeScript - mais flexíveis
      '@typescript-eslint/no-unused-vars': 'off', 
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@/prefer-const': 'error',
      '@typescript-eslint/no-unused-imports': 'off',

      // Desabilita regras nativas que conflitam com TypeScript
      'no-unused-vars': 'off',

      'no-console': 'off',
      'no-debugger': 'warn',
    },
  },

  // Configuração mais flexível para arquivos de tipos/interfaces
  {
    files: ['src/**/*.d.ts', 'src/**/types.ts', 'src/**/interfaces.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },

  // Configuração específica para testes (Jest)
  {
    files: ['**/*.test.{js,ts}', '**/*.spec.{js,ts}', '**/tests/**/*.{js,ts}'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        jest: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      'no-console': 'off',
    },
  },

  {
    files: ['**/*.test.{js,ts}', '**/*.spec.{js,ts}', '**/tests/**/*.{js,ts}'],
    plugins: {
      jest: jestPlugin,
    },
    languageOptions: {
      globals: {
        ...jestPlugin.environments.globals.globals,
      },
    },
    rules: {
      ...jestPlugin.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': 'off',
      'no-console': 'off',
    },
  },

  prettierConfig,

  {
    ignores: ['node_modules/**', 'dist/**', 'build/**', '*.js', 'coverage/**'],
  },
]
