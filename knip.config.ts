import { identity } from 'es-toolkit'
import type { KnipConfig } from 'knip'

export default identity<KnipConfig>({
  entry: ['src/index.ts', '*.config.?([cm])[jt]s'],
  project: ['src/**/*.?([cm])[jt]s?(x)', '*.config.?([cm])[jt]s'],
  ignore: ['**/define/**/*.ts', '**/types/**/*.ts', '**/*-types.ts', '**/*.d.ts'],
  ignoreDependencies: ['@iconify/json', '@svgr/plugin-jsx', '@commitlint/prompt-cli'],
  ignoreUnresolved: ['~icons/*'],
  vite: true,
})
