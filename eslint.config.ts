import { fromSxzz } from '@magicdawn/eslint-config'
import oxlint from 'eslint-plugin-oxlint'

export default fromSxzz(undefined, ...oxlint.buildFromOxlintConfigFile(import.meta.dirname + '/.oxlintrc.json'), {
  rules: {
    // let eslint handle these:
    'no-debugger': 'error', // Cannot assign to read only property 'no-debugger' of object '#<Object>'
  },
}).overrideRules({
  '@typescript-eslint/consistent-type-assertisons': 'off',
  'unocss/order': [
    'warn',
    { unoFunctions: ['clsx', 'unoMerge', 'useUnoMerge'], unoVariables: ['^cls', 'ClassNames?$', '^C$'] },
  ],
})
