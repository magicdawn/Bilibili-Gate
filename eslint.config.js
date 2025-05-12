import { GLOB_TS, GLOB_TSX, sxzz } from '@sxzz/eslint-config'

export default sxzz({}, [
  { ignores: ['dist/', '**/*.module.less.d.ts'] },
  {
    files: [GLOB_TS, GLOB_TSX],
    rules: {
      'prefer-const': ['warn', { destructuring: 'all' }],
      'no-constant-condition': 'off',
      'no-void': 'off',
      'no-restricted-syntax': 'off',
      'no-console': 'off',

      'import/no-mutable-exports': 'off',
      'import/no-default-export': 'off',
      'unicorn/filename-case': 'off',
      'node/no-path-concat': 'off',
      'unused-imports/no-unused-vars': 'off',

      // ts
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/prefer-literal-enum-member': 'off',

      // import/export
      'no-duplicate-imports': 'off',
      '@typescript-eslint/consistent-type-imports': ['warn', { fixStyle: 'inline-type-imports' }],
    },
  },
])

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
