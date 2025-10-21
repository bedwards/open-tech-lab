// eslint.config.js – flat config that replaces .eslintrc.json
import eslint from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import prettier from 'eslint-plugin-prettier/recommended';

export default [

  {
    ignores: ['dist/**', 'node_modules/**', '**/*.config.js'],
  },
  /* -------------------------------------------------------
   *  ESLint recommended rules
   * ------------------------------------------------------- */
  eslint.configs.recommended,

  /* -------------------------------------------------------
   *  TypeScript configuration
   * ------------------------------------------------------- */
  {
    files: ['src/**/*.ts', 'tests/**/*.ts'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: './tsconfig.json',
      },
      globals: {
        // Browser globals
        document: 'readonly',
        window: 'readonly',
        navigator: 'readonly',
        fetch: 'readonly',
        alert: 'readonly',
        prompt: 'readonly',
        console: 'readonly',
        crypto: 'readonly',
        caches: 'readonly',
        clearInterval: 'readonly',
        // Service Worker globals
        self: 'readonly',
        ExtendableEvent: 'readonly',
        FetchEvent: 'readonly',
        SyncEvent: 'readonly',
        // Cloudflare Workers globals
        KVNamespace: 'readonly',
        DurableObjectState: 'readonly',
        DurableObjectNamespace: 'readonly',
        ScheduledEvent: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },

  /* -------------------------------------------------------
   *  Prettier integration
   * ------------------------------------------------------- */
  prettier,

  /* -------------------------------------------------------
   *  General custom rules
   * ------------------------------------------------------- */
  {
    rules: {
      'no-console': 'off',
    },
  },
];
