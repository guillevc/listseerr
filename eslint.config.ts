import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import boundaries from 'eslint-plugin-boundaries';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import type { Linter } from 'eslint';

export default [
  { ignores: ['dist'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
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
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  {
    files: ['packages/server/src/**/*.ts'],
    plugins: {
      boundaries,
    },
    settings: {
      'boundaries/elements': [
        { type: 'domain', pattern: 'packages/server/src/domain/*' },
        { type: 'application', pattern: 'packages/server/src/application/*' },
        { type: 'infrastructure', pattern: 'packages/server/src/infrastructure/*' },
        { type: 'presentation', pattern: 'packages/server/src/presentation/*' },
        { type: 'bootstrap', pattern: 'packages/server/src/bootstrap/*' },
        { type: 'shared/domain', pattern: 'packages/shared/src/domain/*' },
        { type: 'shared/application', pattern: 'packages/shared/src/application/*' },
      ],
      'boundaries/ignore': ['**/*.test.ts', '**/*.spec.ts'],
    },
    rules: {
      'boundaries/element-types': [
        'error',
        {
          default: 'disallow',
          rules: [
            { from: 'domain', allow: ['shared/domain'] },
            { from: 'application', allow: ['domain', 'shared/domain'] },
            {
              from: 'infrastructure',
              allow: ['application', 'domain', 'shared/application', 'shared/domain'],
            },
            { from: 'presentation', allow: ['application', 'shared/application'] },
            {
              from: 'bootstrap',
              allow: [
                'application',
                'infrastructure',
                'presentation',
                'domain',
                'shared/domain',
                'shared/application',
              ],
            },
          ],
        },
      ],
    },
  },
] satisfies Linter.Config[];
