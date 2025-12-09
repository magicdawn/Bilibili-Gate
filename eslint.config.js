import { fromSxzz } from '@magicdawn/eslint-config'

export default fromSxzz().overrideRules({
  'unocss/order': ['warn', { unoFunctions: ['clsx', 'unoMerge', 'useUnoMerge'] }],
  'unicorn/no-array-sort': 'off',
  'unicorn/no-array-reverse': 'off',
  'unicorn/prefer-global-this': 'off',
  'unicorn/no-useless-undefined': 'off', // 关键这条规则太蠢... 返回值期望 string|undefined, `return` 会认为是 void
})
