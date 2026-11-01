import pluginJs from '@eslint/js';
import { defineConfig } from 'eslint/config';
import globals from 'globals';

const preferNativeEsmImportPattern = {
  regex: '^(#.*|[.]{1,2})\/(\.\.\/)*[^.]+$',
  message: 'Prefer fully specified imports to support native ESM (include the file extension)'
};

export default defineConfig([
  {
    files: ['**/*.js'],
    ignores: ['bundle/**'],
    plugins: { js: pluginJs },
    extends: [pluginJs.configs.recommended],
    rules: {
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_'
        }
      ],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            preferNativeEsmImportPattern,
            {
              regex: '^(\.\.\/)+lib\/.+$',
              message: 'Prefer using the path alias for the lib/ folder instead.'
            },
            {
              regex: '^(\.\.\/)+templates\/.+$',
              message: 'Prefer using the path alias for the templates/ folder instead.'
            }
          ]
        }
      ]
    }
  },
  {
    files: ['*'],
    languageOptions: {
      globals: globals.nodeBuiltin
    }
  },
  {
    files: ['scripts/**'],
    languageOptions: {
      globals: globals.node
    }
  },
  {
    files: ['src/**', 'templates/**'],
    languageOptions: {
      globals: {
        act: false,
        KeyEvent: false,
        ...globals.browser
      }
    }
  },
  {
    files: ['lib/**'],
    languageOptions: {
      globals: globals.nodeBuiltin
    },
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            { name: 'assert', message: 'Use node:assert/strict instead.' },
            {
              name: 'node:assert',
              message: 'Use node:assert/strict instead.'
            }
          ],
          patterns: [
            preferNativeEsmImportPattern,
            {
              regex: '^#lib\/.+$',
              message: 'Prefer using relative imports within the lib/ folder.'
            }
          ]
        }
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: "CallExpression[callee.name='assert']",
          message: 'Prefer `assert.equal(actual, true)` over `assert(actual)`'
        },
        {
          selector: "CallExpression[callee.object.name='assert'][callee.property.name='ok']",
          message: 'Prefer `assert.equal(actual, true)` over `assert.ok(actual)`'
        },
        {
          selector:
            "CallExpression[callee.object.name='assert'][callee.property.name=/^strict.*$/]",
          message: 'Prefer prefer using methods from `node:assert/strict` without "strict" prefix'
        }
      ]
    }
  },
  {
    files: ['templates/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            preferNativeEsmImportPattern,
            {
              regex: '^#templates\/.+$',
              message: 'Prefer using relative imports within the templates/ folder.'
            }
          ]
        }
      ]
    }
  }
]);
