/**
 * 我比较了 Tag / Mark / Badge 的语义, 发现其实都可以, 这里统一为 Tag
 */

import { Dropdown } from 'antd'
import clsx from 'clsx'
import { useMemo, type CSSProperties, type Key, type ReactNode } from 'react'
import { useUnoMerge } from 'unocss-merge/react'
import { appPrimaryColorValue } from '$components/css-vars'
import { isDynamicFeed, isFav, isWatchlater, type RankItemExtend, type RecItemType } from '$define'
import { openNewTab } from '$modules/gm'
import { IconForLive } from '$modules/icon'
import { isNormalRankItem } from '$modules/rec-services/hot/rank/rank-tab'
import { useTooltip } from './child-components/VideoCardActions'
import { useLinkNewTab } from './use/useOpenRelated'
import type { NormalRankItem } from '$modules/rec-services/hot/rank/types'

export type CardTag = {
  key: Key
  icon?: ReactNode
  text?: ReactNode
}

export function isCardTagValid(x: CardTag) {
  return !!(x.icon || x.text)
}

export function defineCardTags(items: (CardTag | false | undefined)[]): CardTag[] {
  return items.filter(Boolean).filter(isCardTagValid)
}

export const clsCardTagContainer =
  'pointer-events-none h-19px flex-center whitespace-nowrap rounded-2px bg-gate-primary px-4px text-center text-13px color-white'

export function BaseTag({ children, className }: { children?: ReactNode; className?: string }) {
  return <span className={useUnoMerge(clsCardTagContainer, className)}>{children}</span>
}

export function GeneralCardTag({ tag }: { tag: CardTag }) {
  if (!isCardTagValid(tag)) return
  const { icon, text } = tag
  const hasIcon = !!icon
  return (
    <BaseTag
      className={clsx(
        'min-w-32px',
        hasIcon ? 'pl-4px pr-6px' : 'px-4px', // 有图标左边更显空旷
      )}
    >
      {hasIcon && icon}
      {text}
    </BaseTag>
  )
}

/* https://color.adobe.com/zh/metals-color-theme-18770781/ */
function getColor(no: number) {
  const medalColors = ['#FFD700', '#C0C0C0', '#B36700']
  return medalColors[no - 1] ?? appPrimaryColorValue
}
export function RankNumTag({ item }: { item: RankItemExtend }) {
  const hasMedal = item.rankingNo <= 3
  const medalIcon = <IconPhCrownFill />

  let hasOthers = false
  let others: NormalRankItem[] = []
  if (isNormalRankItem(item) && item.others?.length) {
    hasOthers = true
    others = item.others
  }

  const tooltip = `「${item.rankTab.name}」排行第 ${item.rankingNo} 名`
  const { triggerRef, tooltipEl } = useTooltip({
    inlinePosition: 'left',
    tooltip,
    tooltipClassName: 'left--2px',
  })

  const roundButtonClassName = 'relative size-28px flex-center whitespace-nowrap rounded-full text-14px color-white'
  const roundButtonStyle: CSSProperties = useMemo(
    () => ({ backgroundColor: getColor(item.rankingNo) }),
    [item.rankingNo],
  )

  const newTab = useLinkNewTab()

  return (
    <>
      <div ref={triggerRef} className={roundButtonClassName} style={roundButtonStyle}>
        {hasMedal ? medalIcon : <span style={{ marginLeft: -1 }}>{item.rankingNo}</span>}
        {tooltipEl}
      </div>
      {hasOthers && (
        <Dropdown
          placement='bottomLeft'
          menu={{
            items: [
              {
                type: 'group',
                label: '「其他上榜视频」',
                children: others.map((x) => {
                  return {
                    key: x.bvid,
                    label: x.title,
                    onClick() {
                      const href = new URL(`/video/${x.bvid}`, location.href).href
                      if (newTab) {
                        openNewTab(href)
                      } else {
                        location.href = href
                      }
                    },
                  }
                }),
              },
            ],
          }}
        >
          <div className={roundButtonClassName} style={roundButtonStyle}>
            <IconParkOutlineMore />
          </div>
        </Dropdown>
      )}
    </>
  )
}

export function LiveTag() {
  return (
    <BaseTag>
      <IconForLive active className='size-14px' />
      直播中
    </BaseTag>
  )
}

export function ApiTypeTag({ item }: { item: RecItemType }) {
  const text = useMemo(() => {
    if (isDynamicFeed(item)) return '动态'
    if (isWatchlater(item)) return '稍后再看'
    if (isFav(item)) return item.from === 'fav-folder' ? '收藏夹' : '合集'
    return item.api
  }, [item])

  const tooltip = useMemo(() => {
    if (isFav(item) && item.from === 'fav-collection') return item.volTooltip
  }, [item])

  const { triggerRef, tooltipEl } = useTooltip({
    inlinePosition: 'left',
    tooltip,
  })

  return (
    <span ref={triggerRef} className={useUnoMerge(clsCardTagContainer, 'pointer-events-auto')}>
      {text}
      {tooltipEl}
    </span>
  )
}

export function VolTag({ vol, volTooltip }: { vol: number; volTooltip?: ReactNode }) {
  const { triggerRef, tooltipEl } = useTooltip({
    inlinePosition: 'left',
    tooltip: volTooltip,
    tooltipClassName: 'left--2px',
  })
  return (
    <div
      ref={triggerRef}
      className='relative h-24px min-w-24px flex-center whitespace-nowrap rounded-8px bg-gate-primary px-6px text-center text-14px color-white'
    >
      {vol}
      {tooltipEl}
    </div>
  )
}
