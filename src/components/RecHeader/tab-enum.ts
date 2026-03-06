import { difference } from 'es-toolkit'
import { ETab } from '$enums'

export const ALL_TAB_KEYS = Object.values(ETab)

// 不显示在配置页的 Tab
//  - hidden 有另外的意思, 这里使用 none configurable
export const NONE_CONFIGURABLE_TAB_KEYS = [ETab.SpaceUpload]

export const CONFIGURABLE_TAB_KEYS = difference(ALL_TAB_KEYS, NONE_CONFIGURABLE_TAB_KEYS)
