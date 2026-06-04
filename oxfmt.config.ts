import { defineConfig } from 'oxfmt'

export default defineConfig({
  ignorePatterns: ['auto-imports.d.ts'],
  printWidth: 120,
  tabWidth: 2,
  useTabs: false,
  semi: false,
  singleQuote: true,
  quoteProps: 'consistent',
  jsxSingleQuote: true,
  htmlWhitespaceSensitivity: 'css',
  sortPackageJson: false,
})
