import { IconForFav } from '$modules/icon'
import { IconForStatDanmaku, IconForStatPlay } from '$modules/icon/stat-icons'
import { formatCount } from '$utility/video'
import type { ComponentProps, ComponentType, ReactNode } from 'react'
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
export const StatFieldIconConfig: Record<
  StatItemField,
  {
    Component: ComponentType<ComponentProps<'svg'>>
    size?: number
    extraProps?: ComponentProps<'svg'>
    moveTextDown?: boolean
  }
> = {
  'play': { Component: IconForStatPlay }, // or #widget-play-count,
  'danmaku': { Component: IconForStatDanmaku },
  'like': { Component: IconParkOutlineThumbsUp, size: 15 },
  'bangumi:follow': { Component: IconTablerHeartFilled, size: 15 },
  'favorite': { Component: IconForFav, size: 15 },
  'coin': { Component: IconTablerCoinYen, size: 15 },
  'live:viewed-by': { Component: IconParkOutlinePreviewOpen },
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
  const text = value
  const usingText = useMemo(() => {
    if (typeof text === 'number' || (text && /^\d+$/.test(text))) {
      return formatCount(Number(text)) ?? STAT_NUMBER_FALLBACK
    } else {
      return text ?? STAT_NUMBER_FALLBACK
    }
  }, [text])

  const { Component, size, extraProps, moveTextDown = true } = StatFieldIconConfig[field]
  const svgClassName = 'bili-video-card__stats--icon'
  const icon: ReactNode = useMemo(() => {
    const props: ComponentProps<'svg'> = {
      ...extraProps,
      className: clsx(svgClassName, extraProps?.className),
      style: {
        width: size,
        height: size,
        ...extraProps?.style,
      },
    }
    return <Component {...props} />
  }, [field])

  // moveTextDown && 'relative top-0.5px'
  return (
    <span className='bili-video-card__stats--item inline-flex! justify-center items-center! mr-8px!'>
      {icon}
      <span className={clsx('bili-video-card__stats--text')}>{usingText}</span>
    </span>
  )
})
