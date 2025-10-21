// eslint.config.js – flat config that replaces .eslintrc.json
import eslint from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import prettier from 'eslint-plugin-prettier/recommended';

export default [
    /* -------------------------------------------------------
     *  ESLint recommended rules
     * ------------------------------------------------------- */
    eslint.configs.recommended,

    /* -------------------------------------------------------
     *  TypeScript configuration
     * ------------------------------------------------------- */
    {
        files: ['**/*.ts', '**/*.tsx'],
        languageOptions: {
            parser: tsparser,
            parserOptions: {
                ecmaVersion: 2022,
                sourceType: 'module',
                project: './tsconfig.json',   // enables type‑aware linting
            },
            globals: {
                browser: true,
                node: true,
                es2022: true,
            },
        },
        plugins: {
            '@typescript-eslint': tseslint,
        },
        rules: {
            ...tseslint.configs.recommended.rules,
            // Custom TypeScript rules
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-unused-vars': [
                'error',
                { argsIgnorePattern: '^_' },
            ],
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
            'no-console': 'off',            // allow console.log, warn on warn/error
        },
    },
];