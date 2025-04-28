import { colorPrimaryValue } from '$components/css-vars'
import { isDynamicFeed, isFav, isWatchlater, type RankingItemExtend, type RecItemType } from '$define'
import { EApiType } from '$define/index.shared'
import { openNewTab } from '$modules/gm'
import { IconForLive } from '$modules/icon'
import { RANKING_CATEGORIES_MAP, isNormalRankingItem } from '$modules/rec-services/hot/ranking/category'
import type { NormalRankingItem } from '$modules/rec-services/hot/ranking/types'
import { Dropdown } from 'antd'
import type { CSSProperties, ReactNode } from 'react'
import { useTooltip } from './child-components/VideoCardActions'
import { useLinkNewTab } from './use/useOpenRelated'

export const CHARGE_ONLY_TEXT = '充电专属'

export function isChargeOnlyVideo(item: RecItemType, recommendReason?: string) {
  if (item.api !== EApiType.DynamicFeed) return false
  recommendReason ||= item.modules?.module_dynamic?.major?.archive?.badge?.text as string
  return recommendReason === CHARGE_ONLY_TEXT
}

export function ChargeOnlyTag() {
  return (
    <div
      className={clsx(
        'rounded-2px ml-4px',
        'flex-center py-1px pl-4px pr-6px',
        'bg-gate-primary color-white text-center text-size-10px line-height-[17px] whitespace-nowrap',
      )}
    >
      <svg width='16' height='17' viewBox='0 0 16 17' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <path
          d='M5.00014 14.9839C4.94522 15.1219 5.12392 15.2322 5.22268 15.1212L11.5561 8.00214C11.7084 7.83093 11.5869 7.56014 11.3578 7.56014H9.13662L11.6019 3.57178C11.7112 3.39489 11.584 3.16666 11.376 3.16666H7.4475C7.22576 3.16666 7.02737 3.30444 6.94992 3.51221L4.68362 9.59189C4.61894 9.76539 4.74725 9.95014 4.93241 9.95014H7.00268L5.00014 14.9839Z'
          fill='white'
        />
      </svg>
      {CHARGE_ONLY_TEXT}
    </div>
  )
}

/* https://color.adobe.com/zh/metals-color-theme-18770781/ */
function getColor(no: number) {
  const medalColors = ['#FFD700', '#C0C0C0', '#B36700']
  return medalColors[no - 1] ?? colorPrimaryValue
}

export function RankingNumMark({ item }: { item: RankingItemExtend }) {
  const category = RANKING_CATEGORIES_MAP[item.slug]

  const hasMedal = item.rankingNo <= 3
  const medalSymbols = ['🥇', '🥈', '🥉'] // emoji builtin, 可以换, 但是丑
  const medalIcon = <IconPhCrownFill />

  let hasOthers = false
  let others: NormalRankingItem[] = []
  if (isNormalRankingItem(item) && item.others?.length) {
    hasOthers = true
    others = item.others
  }

  const tooltip = `「${category.name}」排行第 ${item.rankingNo} 名`
  const { triggerRef, tooltipEl } = useTooltip({
    inlinePosition: 'left',
    tooltip,
    tooltipOffset: 2,
  })

  const roundButtonClassName = 'flex-center size-28px rounded-full color-white relative whitespace-nowrap'
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

export function SomeBadge({ icon, label, className }: { icon?: ReactNode; label?: ReactNode; className?: string }) {
  return (
    <span
      className={clsx(
        'h-16px line-height-16px rounded-8px pl-4px pr-6px bg-gate-primary inline-flex items-center justify-center',
        className,
      )}
    >
      {icon}
      {label && typeof label === 'string' ? (
        <>
          <span className='font-normal font-size-11px line-height-[1] color-white relative top-1px'>{label}</span>
        </>
      ) : (
        label
      )}
    </span>
  )
}

export function LiveBadge({ className }: { className?: string }) {
  return <SomeBadge className={className} icon={<IconForLive active className='size-14px' />} label='直播中' />
}

export function ApiTypeTag({ item }: { item: RecItemType }) {
  const text = (() => {
    if (isDynamicFeed(item)) return '动态'
    if (isWatchlater(item)) return '稍后再看'
    if (isFav(item)) return item.from === 'fav-folder' ? '收藏夹' : '合集'
    return item.api
  })()
  return (
    <div className='rounded-2px ml-4px bg-gate-primary flex-center px-6px py-1px text-size-11px line-height-[17px] text-white text-center whitespace-nowrap'>
      {text}
    </div>
  )
}

export function VolMark({ vol }: { vol: number }) {
  return (
    <div className='h-24px min-w-24px rounded-8px relative flex-center bg-gate-primary color-white whitespace-nowrap px-6px'>
      {vol}
    </div>
  )
}
