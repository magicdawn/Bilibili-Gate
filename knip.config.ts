import { identity } from 'es-toolkit'
import type { KnipConfig } from 'knip'

export default identity<KnipConfig>({
  entry: ['src/index.ts', 'scripts/*.ts', '*.config.js', '*.config.ts'],
  project: ['src/**/*.{ts,tsx}', 'scripts/*.ts'],
  ignore: ['**/define/**/*.ts', '**/*.d.ts'],
  ignoreDependencies: ['virtual:*', '~icons/'],
  vite: true,
})
