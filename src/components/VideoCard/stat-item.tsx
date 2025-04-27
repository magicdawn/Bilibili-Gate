import { IconForFav } from '$modules/icon'
import { IconForStatDanmaku, IconForStatPlay } from '$modules/icon/stat-icons'
import { formatCount } from '$utility/video'
import type { ReactNode } from 'react'
import { STAT_NUMBER_FALLBACK } from './index.shared'

export const AllowedStatItemFields = [
  'play',
  'danmaku',
  'like',
  'bangumi:follow',
  'favorite',
  'coin',
  'live:viewed-by', // 直播: 多少人看过
] as const

export type StatItemField = (typeof AllowedStatItemFields)[number]

export type StatItemType = {
  field: StatItemField
  value: number | string | undefined
}
export function defineStatItem(item: StatItemType) {
  return item
}
export function defineStatItems(items: StatItemType[]) {
  return items
}

/**
 * how to render these stat items
 */
const clsForBiliIcon = 'size-18px'
const clsForThirdPartyIcon = 'size-16px'
export const StatFieldIconConfig: Record<StatItemField, ReactNode> = {
  'play': <IconForStatPlay className={clsForBiliIcon} />, // or #widget-play-count,
  'danmaku': <IconForStatDanmaku className={clsForBiliIcon} />,
  'like': <IconParkOutlineThumbsUp className={clsForThirdPartyIcon} />,
  'bangumi:follow': <IconTablerHeartFilled className={clsForThirdPartyIcon} />,
  'favorite': <IconForFav className={clsForThirdPartyIcon} />,
  'coin': <IconTablerCoinYen className={clsForThirdPartyIcon} />,
  'live:viewed-by': <IconParkOutlinePreviewOpen className={clsForThirdPartyIcon} />,
}

/**
 * app 接口返回的 icon 是数字 (id), 映射成 field(play / like ...), field 映射成 svg-icon
 */
export const AppRecStatItemFieldMap: Record<number, StatItemField> = {
  1: 'play',
  2: 'like', // 没出现过, 猜的
  3: 'danmaku',
  4: 'bangumi:follow', // 追番
  20: 'like', // 动态点赞
}
export function getField(id: number) {
  return AppRecStatItemFieldMap[id] || AppRecStatItemFieldMap[1] // 不认识的图标id, 使用 play
}

export const StatItemDisplay = memo(function ({ field, value }: StatItemType) {
  const text = useMemo(() => {
    if (typeof value === 'number' || (value && /^\d+$/.test(value))) {
      return formatCount(Number(value)) ?? STAT_NUMBER_FALLBACK
    } else {
      return value ?? STAT_NUMBER_FALLBACK
    }
  }, [value])

  const icon = StatFieldIconConfig[field]

  // 对齐真难, 不同字体表现不同...
  return (
    <span data-field={field} className='bili-video-card__stats--item mr-0! gap-x-2px'>
      {icon}
      <span className={clsx('bili-video-card__stats--text line-height-18px')}>{text}</span>
    </span>
  )
})
