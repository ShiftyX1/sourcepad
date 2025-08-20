import js from '@eslint/js'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsparser from '@typescript-eslint/parser'
import globals from 'globals'

export default [
    {
        ignores: [
            'dist/**',
            'node_modules/**',
            '*.js'
        ]
    },

    {
        files: ['**/*.ts', '**/*.tsx'],
        languageOptions: {
            parser: tsparser,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module'
            },
            globals: {
                ...globals.browser,
                ...globals.es2021,
                ...globals.node
            }
        },
        plugins: {
            '@typescript-eslint': tseslint
        },
        rules: {
            ...js.configs.recommended.rules,
            ...tseslint.configs.recommended.rules,
            '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-inferrable-types': 'off',
            'prefer-const': 'error',
            'no-var': 'error',
            'semi': ['error', 'never'],
            'quotes': ['error', 'single'],
            'comma-dangle': ['error', 'never']
        }
    }
]