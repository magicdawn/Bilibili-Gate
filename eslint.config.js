import { GLOB_TS, GLOB_TSX, sxzz } from '@sxzz/eslint-config'
import eslintConfigPrettier from 'eslint-config-prettier'

export default sxzz({ command: false, prettier: false }, [
  eslintConfigPrettier,
  { ignores: ['dist/', '**/*.module.less.d.ts'] },
  {
    files: [GLOB_TS, GLOB_TSX],
    rules: {
      'prefer-arrow-callback': 'off',
      'prefer-const': ['warn', { destructuring: 'all' }],
      'no-constant-condition': 'off',
      'no-void': 'off',
      'no-restricted-syntax': 'off',
      'no-console': 'off',

      // unicorn
      'unicorn/catch-error-name': 'off',
      'unicorn/consistent-function-scoping': 'off',
      'unicorn/filename-case': 'off',
      'unicorn/prefer-array-flat-map': 'off',
      'unicorn/prefer-array-index-of': 'off',
      'unicorn/prefer-array-some': 'off',
      'unicorn/prefer-single-call': 'off',
      'unicorn/prefer-reflect-apply': 'off',
      'unicorn/prefer-query-selector': 'off',
      'unicorn/prefer-dom-node-append': 'off',
      'unicorn/prefer-dom-node-dataset': 'off',
      'unicorn/prefer-modern-dom-apis': 'off', // insertAdjacentElement is so nice & intuitive, but U prefer other !!!
      'unicorn/prefer-add-event-listener': 'off',
      'unicorn/prefer-string-trim-start-end': 'off',

      // ts
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/prefer-literal-enum-member': 'off',

      // import type
      'no-duplicate-imports': 'off',
      '@typescript-eslint/consistent-type-imports': ['warn', { fixStyle: 'inline-type-imports' }],

      // others
      'import/no-mutable-exports': 'off',
      'import/no-default-export': 'off',
    },
  },
])
  .remove('sxzz/node')
  .remove('sxzz/markdown/recommended/processor')
  .removeRules(
    //
    'sxzz/prefer-string-function',
    'unused-imports/no-unused-vars',
    'unused-imports/no-unused-imports',
  )

// import eslint from '@eslint/js'
// import eslintConfigPrettier from 'eslint-config-prettier'
// import { defineConfig } from 'eslint/config'
// import globals from 'globals'
// import tseslint from 'typescript-eslint'

// export default defineConfig([
//   eslint.configs.recommended,
//   tseslint.configs.recommended,
//   eslintConfigPrettier,

//   { ignores: ['dist/', '**/*.module.less.d.ts'] },
//   { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
//   {
//     rules: {
//       'prefer-const': ['warn', { destructuring: 'all' }],
//       'no-constant-condition': 'off',

//       // ts
//       '@typescript-eslint/ban-ts-comment': 'off',
//       '@typescript-eslint/no-unused-vars': 'off',
//       '@typescript-eslint/no-non-null-assertion': 'off',
//       '@typescript-eslint/no-explicit-any': 'off',
//       '@typescript-eslint/no-namespace': 'off',
//       '@typescript-eslint/no-unused-expressions': 'off',

//       // '@typescript-eslint/consistent-type-imports': ['warn', { 'fixStyle': 'inline-type-imports' }],
//       '@typescript-eslint/consistent-type-imports': ['warn', { fixStyle: 'separate-type-imports' }],
//     },
//   },
// ])
