import clsx from 'clsx'
import { memo, useMemo, type ReactNode } from 'react'
import { IconForComment, IconForFav, IconForForward } from '$modules/icon'
import { IconForStatDanmaku, IconForStatPlay } from '$modules/icon/stat-icons'
import { formatCount } from '$utility/video'
import { STAT_NUMBER_FALLBACK } from './index.shared'

export const AllowedStatItemFields = [
  'play',
  'danmaku',
  'like',
  'favorite',
  'coin',
  'bangumi:follow',
  'live:viewed-by', // 直播: 多少人看过
  'dynamic-feed:comment', // 动态: 评论
  'dynamic-feed:forward', // 动态: 转发
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
  'dynamic-feed:comment': <IconForComment className={clsForThirdPartyIcon} />,
  'dynamic-feed:forward': <IconForForward className={clsForThirdPartyIcon} />,
}

/**
 * app 接口返回的 icon 是数字 (id), 映射成 field(play / like ...)
 */
export enum AppRecommendApiIconType {
  Play = 1,
  Like = 2, // 没出现过, 猜的
  Danmaku = 3,
  BangumiFollow = 4, // 追番
  DynamicFeedLike = 20, // 动态点赞
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
    <span data-field={field} className='bili-video-card__stats--item gap-x-2px mr-0!'>
      {icon}
      <span className={clsx('bili-video-card__stats--text line-height-18px')}>{text}</span>
    </span>
  )
})
