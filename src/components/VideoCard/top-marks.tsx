import { flexCenterStyle, flexVerticalCenterStyle } from '$common/emotion-css'
import { colorPrimaryValue } from '$components/css-vars'
import {
  isDynamicFeed,
  isFav,
  isWatchlater,
  type RankingItemExtend,
  type RecItemType,
} from '$define'
import { EApiType } from '$define/index.shared'
import { openNewTab } from '$modules/gm'
import { IconForLive } from '$modules/icon'
import {
  RANKING_CATEGORIES_MAP,
  isNormalRankingItem,
} from '$modules/rec-services/hot/ranking/category'
import type { NormalRankingItem } from '$modules/rec-services/hot/ranking/types'
import { css } from '@emotion/react'
import { Dropdown } from 'antd'
import { size } from 'polished'
import type { ReactNode } from 'react'
import IconParkOutlineMore from '~icons/icon-park-outline/more'
import PhCrownFill from '~icons/ph/crown-fill'
import { VideoCardActionStyle, useTooltip } from './child-components/VideoCardActions'
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
      css={[
        VideoCardActionStyle.top('left'),
        flexVerticalCenterStyle,
        css`
          padding: 1px 6px 1px 4px;
          font-size: 10px;
          color: #fff;
          text-align: center;
          line-height: 17px;
          border-radius: 2px;
          margin-left: 4px;
          white-space: nowrap;
          background-color: #f69;
          background-color: ${colorPrimaryValue};
        `,
      ]}
    >
      <svg
        width='16'
        height='17'
        viewBox='0 0 16 17'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
      >
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
  const medalIcon = <PhCrownFill />

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

  const roundButtonCss = [
    flexCenterStyle,
    css`
      position: relative;
      color: #fff;
      border-radius: 50%;
      white-space: nowrap;
      width: 28px;
      height: 28px;
      background-color: ${getColor(item.rankingNo)};
    `,
  ]

  const newTab = useLinkNewTab()

  return (
    <div css={VideoCardActionStyle.topContainer('left')}>
      <div ref={triggerRef} css={roundButtonCss}>
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
          <div css={roundButtonCss}>
            <IconParkOutlineMore />
          </div>
        </Dropdown>
      )}
    </div>
  )
}

export function SomeBadge({
  icon,
  label,
  className,
}: {
  icon?: ReactNode
  label?: ReactNode
  className?: string
}) {
  return (
    <span
      className={className}
      css={[
        VideoCardActionStyle.top('left'),
        css`
          height: 16px;
          line-height: 16px;
          border-radius: 16px;
          padding-inline: 4px 6px;
          background-color: ${colorPrimaryValue};

          display: inline-flex;
          align-items: center;
          justify-content: center;
        `,
      ]}
    >
      {icon}
      {label && typeof label === 'string' ? (
        <>
          <span
            css={css`
              font-weight: normal;
              font-size: 11px;
              color: #fff;
              line-height: 1;
              position: relative;
              top: 1px;
            `}
          >
            {label}
          </span>
        </>
      ) : (
        label
      )}
    </span>
  )
}

export function LiveBadge({ className }: { className?: string }) {
  return (
    <SomeBadge className={className} icon={<IconForLive active {...size(14)} />} label='直播中' />
  )
}

export function ApiTypeTag({ item }: { item: RecItemType }) {
  const text = (() => {
    if (isDynamicFeed(item)) return '动态'
    if (isWatchlater(item)) return '稍后再看'
    if (isFav(item)) return item.from === 'fav-folder' ? '收藏夹' : '合集'
    return item.api
  })()

  return (
    <div
      css={[
        VideoCardActionStyle.top('left'),
        flexVerticalCenterStyle,
        css`
          padding-inline: 6px;
          padding-block: 1px;
          font-size: 11px;
          color: #fff;
          text-align: center;
          line-height: 17px;
          border-radius: 2px;
          margin-left: 4px;
          white-space: nowrap;
          background-color: ${colorPrimaryValue};
        `,
      ]}
    >
      {text}
    </div>
  )
}

export function VolMark({ vol }: { vol: number }) {
  const roundButtonCss = [
    flexCenterStyle,
    css`
      position: relative;
      color: #fff;
      border-radius: 50%;
      white-space: nowrap;
      width: 28px;
      height: 28px;
      background-color: ${colorPrimaryValue};
    `,
  ]

  return (
    <div css={VideoCardActionStyle.topContainer('left')}>
      <div css={roundButtonCss}>
        <span style={{ marginLeft: -1 }}>{vol}</span>
      </div>
    </div>
  )
}
