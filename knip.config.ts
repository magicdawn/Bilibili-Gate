import type { KnipConfig } from 'knip'
const defineConfig = (config: KnipConfig) => config

export default defineConfig({
  entry: ['src/index.ts', 'scripts/*.ts', '*.config.js', '*.config.ts'],
  project: ['src/**/*.{ts,tsx}', 'scripts/*.ts'],
  ignore: ['**/define/**/*.ts', '**/*.d.ts'],
  ignoreDependencies: ['virtual:*', '~icons/'],
  vite: true,
})
