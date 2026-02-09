import globals from 'globals'
import tseslint from 'typescript-eslint'
import eslintConfigPrettier from 'eslint-config-prettier/flat'
import pluginJest from 'eslint-plugin-jest'
import { defineConfig } from 'eslint/config'

export default defineConfig([
  {
    ignores: ['**/coverage', '**/dist', '**/node_modules']
  },
  {
    files: ['**/*.spec.js', '**/*.test.js'],
    plugins: {
      jest: pluginJest
    },
    languageOptions: {
      globals: pluginJest.environments.globals.globals
    },
    rules: {
      'jest/no-disabled-tests': 'warn',
      'jest/no-focused-tests': 'error',
      'jest/no-identical-title': 'error',
      'jest/prefer-to-have-length': 'warn',
      'jest/valid-expect': 'error'
    }
  },
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    languageOptions: { globals: globals.browser }
  },
  tseslint.configs.recommended,
  eslintConfigPrettier
])
