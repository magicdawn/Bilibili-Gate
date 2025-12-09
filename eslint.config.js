import { fromSxzz } from '@magicdawn/eslint-config'

export default fromSxzz().overrideRules({
  'unocss/order': ['warn', { unoFunctions: ['clsx', 'unoMerge', 'useUnoMerge'] }],
  'unicorn/no-array-sort': 'off',
  'unicorn/no-array-reverse': 'off',
})
