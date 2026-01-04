import { fromSxzz } from '@magicdawn/eslint-config'
import oxlint from 'eslint-plugin-oxlint'

export default fromSxzz()
  .overrideRules({
    '@typescript-eslint/consistent-type-assertions': 'off',
    'unocss/order': [
      'warn',
      { unoFunctions: ['clsx', 'unoMerge', 'useUnoMerge'], unoVariables: ['^cls', 'ClassNames?$', '^C$'] },
    ],
  })
  .append(...oxlint.buildFromOxlintConfigFile(import.meta.dirname + '/.oxlintrc.json'))
