import defaultConfig from '@commitlint/config-conventional'
import { RuleConfigSeverity } from '@commitlint/types'
import type { UserConfig } from '@commitlint/types'

/**
 * why: 我把 performance perf, 打成了 pref, preference, 直到 release changelog 里没有, 才发现 typo
 * 还是加个 Lint 吧
 * see https://github.com/magicdawn/Bilibili-Gate/commit/7439247
 */

const Configuration: UserConfig = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [RuleConfigSeverity.Error, 'always', [...defaultConfig.rules['type-enum'][2], 'deps', 'changelog']],
    'header-max-length': [RuleConfigSeverity.Disabled],
    'subject-case': [RuleConfigSeverity.Disabled],
  },
}

export default Configuration
