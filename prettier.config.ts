// @ts-expect-error
import defaultConfig from '@magicdawn/prettier-config'
import { identity } from 'es-toolkit'
import type { Config } from 'prettier'

export default identity<Config>({
  ...defaultConfig,
  printWidth: 120,
  htmlWhitespaceSensitivity: 'css',
  plugins: ['@prettier/plugin-oxc'],
})
