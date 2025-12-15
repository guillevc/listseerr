import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default [
  {
    ignores: [
      'dist',
      'eslint.config.ts',
      'packages/server/drizzle.config.ts',
      'packages/server/scripts/*.ts',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  prettier,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        {
          allowConstantExport: true,
          allowExportNames: ['buttonVariants', 'badgeVariants', 'cardVariants'],
        },
      ],
      'react-hooks/set-state-in-effect': 'off',
      '@typescript-eslint/no-deprecated': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
  // TanStack Router routes have circular type inference that requires @ts-expect-error,
  // which causes ESLint to see the return as `any`
  {
    files: ['packages/client/src/routes/settings.*.tsx'],
    rules: {
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  },
  // @tanstack/react-table false positive with react-hooks plugin
  {
    files: ['packages/client/src/components/lists/ListsTable.tsx'],
    rules: {
      'react-hooks/incompatible-library': 'off',
    },
  },
];
