import { Dropdown } from 'antd'
import { useUnoMerge } from 'unocss-merge/react'
import { Picture } from '$components/_base/Picture'
import { primaryColorValue } from '$components/css-vars'
import { isDynamicFeed, isFav, isWatchlater, type RankItemExtend, type RecItemType } from '$define'
import { EApiType } from '$define/index.shared'
import { openNewTab } from '$modules/gm'
import { IconForLive } from '$modules/icon'
import { DynamicFeedBadgeText } from '$modules/rec-services/dynamic-feed/store'
import { isNormalRankItem } from '$modules/rec-services/hot/rank/rank-tab'
import type { NormalRankItem } from '$modules/rec-services/hot/rank/types'
import { useTooltip } from './child-components/VideoCardActions'
import { useLinkNewTab } from './use/useOpenRelated'
import type { CSSProperties, ReactNode } from 'react'

export const clsBadgeContainer =
  'pointer-events-none h-19px flex-center whitespace-nowrap rounded-2px bg-gate-primary px-4px text-center text-12px color-white'

export function SomeBadge({ children, className }: { children?: ReactNode; className?: string }) {
  return <span className={useUnoMerge(clsBadgeContainer, className)}>{children}</span>
}

export function shouldShowDynamicFeedBadge(item: RecItemType) {
  if (item.api !== EApiType.DynamicFeed) return false
  const badge = item.modules?.module_dynamic?.major?.archive?.badge
  if (!badge || !badge.text) return false
  if (badge.text === DynamicFeedBadgeText.Upload) return false
  return true
}

export function DynamicFeedBadgeDisplay({ item }: { item: RecItemType }) {
  if (!shouldShowDynamicFeedBadge(item)) return null
  if (item.api !== EApiType.DynamicFeed) return null
  const badge = item.modules?.module_dynamic?.major?.archive?.badge
  const hasIcon = !!badge.icon_url
  return (
    <SomeBadge
      className={clsx(
        'min-w-32px',
        hasIcon ? 'pl-4px pr-6px' : 'px-4px', // 有图标左边更显空旷
      )}
    >
      {hasIcon && <Picture src={`${badge.icon_url}@!web-dynamic`} className='h-16px w-16px' />}
      {badge.text}
    </SomeBadge>
  )
}

/* https://color.adobe.com/zh/metals-color-theme-18770781/ */
function getColor(no: number) {
  const medalColors = ['#FFD700', '#C0C0C0', '#B36700']
  return medalColors[no - 1] ?? primaryColorValue
}

export function RankNumMark({ item }: { item: RankItemExtend }) {
  const hasMedal = item.rankingNo <= 3
  const medalSymbols = ['🥇', '🥈', '🥉'] // emoji builtin, 可以换, 但是丑
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

  const roundButtonClassName = 'relative size-28px flex-center whitespace-nowrap rounded-full color-white'
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

export function LiveBadge() {
  return (
    <SomeBadge>
      <IconForLive active className='size-14px' />
      直播中
    </SomeBadge>
  )
}

export function ApiTypeTag({ item }: { item: RecItemType }) {
  const text = (() => {
    if (isDynamicFeed(item)) return '动态'
    if (isWatchlater(item)) return '稍后再看'
    if (isFav(item)) return item.from === 'fav-folder' ? '收藏夹' : '合集'
    return item.api
  })()
  return <SomeBadge>{text}</SomeBadge>
}

export function VolMark({ vol }: { vol: number }) {
  return (
    <div className='relative h-24px min-w-24px flex-center whitespace-nowrap rounded-8px bg-gate-primary px-6px color-white'>
      {vol}
    </div>
  )
}
