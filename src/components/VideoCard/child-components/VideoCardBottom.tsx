/**
 * take care of these
 * https://greasyfork.org/zh-CN/scripts/479861-bilibili-%E9%A1%B5%E9%9D%A2%E5%87%80%E5%8C%96%E5%A4%A7%E5%B8%88/discussions/238294
 */

import { css } from '@emotion/react'
import { useRequest } from 'ahooks'
import { Avatar } from 'antd'
import clsx from 'clsx'
import dayjs from 'dayjs'
import { memo, useMemo, type MouseEventHandler, type ReactNode } from 'react'
import { useUnoMerge } from 'unocss-merge/react'
import { useSnapshot } from 'valtio'
import { APP_CLS_CARD_RECOMMEND_REASON } from '$common'
import { appClsDarkSelector } from '$common/css-vars-export.module.scss'
import { appPrimaryColorValue } from '$components/css-vars'
import { isDisplayAsList } from '$components/RecGrid/display-mode'
import { isLive, isPcRecommend, isRank, type RecItemType } from '$define'
import { EApiType } from '$define/index.shared'
import { PcRecGoto } from '$define/pc-recommend'
import { DESC_SEPARATOR, type IVideoCardData } from '$modules/filter/normalize'
import { IconForLive } from '$modules/icon'
import { fetchAppRecommendFollowedPubDate } from '$modules/rec-services/app'
import { formatSpaceUrl } from '$modules/rec-services/dynamic-feed/shared'
import { ELiveStatus } from '$modules/rec-services/live/live-enum'
import { settings } from '$modules/settings'
import { getAvatarSrc } from '$utility/image'
import { showNativeContextMenuWhenAltKeyPressed } from '../context-menus'
import { useLinkTarget } from '../use/useOpenRelated'
import { UnixTsDisplay } from './UnixTsDisplay'
import type { EGridDisplayMode } from '$enums'

const clsRecommendReason = clsx(
  APP_CLS_CARD_RECOMMEND_REASON,
  'max-w-[calc(100%-6px)] w-max cursor-default overflow-hidden text-ellipsis whitespace-nowrap b-1px b-gate-border rounded-9px b-solid px-8px py-0 text-12px color-gate-primary line-height-17px',
)

const clsRecommendReasonInList = clsx('line-clamp-2 mt-10px h-auto whitespace-normal')

/*
  如果你已经有一个 brand color（OKLCH），要生成一个 不突兀、带品牌调性的 Label 背景色，核心原则其实只有一个：
  把品牌色往「背景色」方向移动，但保持一点点 hue，不让它灰掉。

  C 不要 >0.02，不然立刻变成「彩色 badge」，太吵。
  hue 必须保留品牌色方向，否则背景变成无意义的灰。
  light mode 的目标明度可固定为 0.96–0.98。
  dark mode 目标明度适合在 0.30–0.40 区间。

  // original colors
  background-color: var(--Or1);
  color: var(--Or5);
*/
const cssRecommendReason = css`
  background-color: oklch(from ${appPrimaryColorValue} calc(l * 0.1 + 0.88) calc(c * 0.25) h);
  ${appClsDarkSelector} & {
    background-color: oklch(from ${appPrimaryColorValue} calc(l * 0.3 + 0.175) calc(c * 0.25) h);
  }
`

const appBadgeCss = css`
  color: ${appPrimaryColorValue};
  border-radius: 2px;
  border: 1px ${appPrimaryColorValue} solid;
  line-height: 20px;
  padding: 0 10px;
  transform: scale(0.8);
  transform-origin: center left;
`

// .bili-video-card__info--owner
const descOwnerCss = css`
  font-size: var(--subtitle-font-size);
  line-height: var(--subtitle-line-height);
  color: var(--text3);

  a&:visited {
    color: var(--text3);
  }

  display: inline-flex;
  width: max-content;
  max-width: 100%;

  align-items: center;
  justify-content: flex-start;
`

export const VideoCardBottom = memo(function ({
  item,
  cardData,
  handleVideoLinkClick,
  className,
  gridDisplayMode,
}: {
  item: RecItemType
  cardData: IVideoCardData
  handleVideoLinkClick?: MouseEventHandler
  className?: string
  gridDisplayMode?: EGridDisplayMode
}) {
  const { useBorder } = useSnapshot(settings.style.videoCard)
  const target = useLinkTarget()
  const displayingAsList = isDisplayAsList(gridDisplayMode)

  const {
    // video
    goto,
    href,

    title,
    titleRender,

    pubts,
    pubdateDisplay,
    pubdateDisplayForTitleAttr,
    recommendReason,

    // author
    authorName,
    authorFace,
    authorMid,

    // adpater specific
    appBadge,
    appBadgeDesc,
    rankingDesc,
    liveExtraDesc,
  } = cardData

  const isNormalVideo = goto === 'av'

  // fallback to href
  const authorHref = authorMid ? formatSpaceUrl(authorMid) : href

  const streaming = item.api === EApiType.Live && item.live_status === ELiveStatus.Streaming

  const { data: pubtsFromApi } = useRequest(() => fetchAppRecommendFollowedPubDate(item, cardData), {
    refreshDeps: [item, cardData],
  })

  /**
   * avatar + line1: title
   *          line2: desc
   *                   - when normal video => `author-name + date`
   *          line3: recommend-reason
   */
  const descTitleAttribute: string | undefined = useMemo(() => {
    if (isNormalVideo && (authorName || pubts || pubtsFromApi || pubdateDisplay || pubdateDisplayForTitleAttr)) {
      let datePartForTitleAttribute: string | undefined
      if (pubts || pubtsFromApi) {
        datePartForTitleAttribute = dayjs.unix((pubts || pubtsFromApi)!).format('YYYY年M月D日 HH:mm')
      } else {
        datePartForTitleAttribute = pubdateDisplay
      }
      return [authorName, pubdateDisplayForTitleAttr || datePartForTitleAttribute].filter(Boolean).join(' · ')
    }
  }, [isNormalVideo, authorName, pubts, pubtsFromApi, pubdateDisplay, pubdateDisplayForTitleAttr])

  const _recommendReasonClassName = useUnoMerge(clsRecommendReason, displayingAsList && clsRecommendReasonInList)

  /**
   * 带头像, 更分散(recommend-reason 单独一行)
   */
  return (
    <div
      className={clsx(
        !displayingAsList ? 'pt-15px' : 'pt-5px',
        'flex gap-x-5px overflow-hidden px-5px',
        useBorder ? 'mb-10px' : 'mb-5px',
        className,
      )}
    >
      {/* avatar */}
      {!!authorMid && (
        <a
          href={authorHref}
          target={target}
          className={clsx(
            'relative flex-center self-start rounded-full p-1px ring-1px',
            streaming ? 'ring-gate-primary' : 'ring-gate-border',
          )}
        >
          {authorFace ? (
            <Avatar src={getAvatarSrc(authorFace)} />
          ) : (
            <Avatar>{authorName?.[0] || appBadgeDesc?.[0] || ''}</Avatar>
          )}
          {streaming && (
            <IconForLive active className='absolute bottom-0 right-0 size-12px rounded-full bg-gate-primary' />
          )}
        </a>
      )}

      {/* title + desc */}
      <div
        className='ml-5px flex flex-1 flex-col gap-y-4px overflow-hidden'
        // Q: why not column-gap:10px.
        // A: avatar may hide, margin-left is needed
      >
        {/* title */}
        <h3
          className='bili-video-card__info--tit'
          title={title}
          css={css`
            text-indent: 0 !important;
            .bili-video-card &.bili-video-card__info--tit {
              padding-right: 0;
              height: auto;
              max-height: calc(2 * var(--title-line-height));
            }
          `}
        >
          <a
            onClick={handleVideoLinkClick}
            onContextMenu={showNativeContextMenuWhenAltKeyPressed}
            href={href}
            target={target}
            rel='noopener'
            css={css`
              .bili-video-card .bili-video-card__info--tit > a& {
                font-family: inherit;
                font-weight: initial;
              }
            `}
          >
            {titleRender ?? title}
          </a>
        </h3>

        {/* desc */}
        {renderDesc()}
      </div>
    </div>
  )

  function renderDesc() {
    const recommendReasonEl: ReactNode = !!recommendReason && (
      <div
        title={recommendReason}
        css={cssRecommendReason} // background-color
        className={_recommendReasonClassName}
      >
        {recommendReason}
      </div>
    )

    const defaultRender = () => {
      let date: ReactNode
      if (pubts || pubtsFromApi) {
        date = <UnixTsDisplay ts={pubts || pubtsFromApi} />
      } else if (pubdateDisplay) {
        date = pubdateDisplay
      }
      return (
        <>
          <a
            className='bili-video-card__info--owner'
            href={authorHref}
            target={target}
            title={descTitleAttribute}
            css={descOwnerCss}
            onContextMenu={showNativeContextMenuWhenAltKeyPressed}
          >
            <span className='bili-video-card__info--author'>{authorName}</span>
            {!!date && (
              <span className='bili-video-card__info--date'>
                {DESC_SEPARATOR}
                {date}
              </span>
            )}
          </a>
          {recommendReasonEl}
        </>
      )
    }

    if (isNormalVideo) return defaultRender()

    /**
     * 其他歪瓜
     */
    if (appBadge || appBadgeDesc) {
      return (
        <a
          className='bili-video-card__info--owner'
          css={descOwnerCss}
          href={href}
          target={target}
          onContextMenu={showNativeContextMenuWhenAltKeyPressed}
        >
          {!!appBadge && <span css={appBadgeCss}>{appBadge}</span>}
          {!!appBadgeDesc && <span>{appBadgeDesc}</span>}
        </a>
      )
    }
    if (isRank(item) && rankingDesc) {
      return <div css={descOwnerCss}>{rankingDesc}</div>
    }
    // 直播: 关注的直播 | `PC推荐 & goto=live`
    if (isLive(item) || (isPcRecommend(item) && item.goto === PcRecGoto.Live)) {
      return (
        <>
          <a
            css={[
              descOwnerCss,
              css`
                display: -webkit-box;
                -webkit-box-orient: vertical;
                -webkit-line-clamp: 1;
                overflow: hidden;
                text-overflow: ellipsis;
                max-width: 100%;
              `,
            ]}
            href={authorHref}
            target={target}
            title={(authorName || '') + (liveExtraDesc || '')}
            onContextMenu={showNativeContextMenuWhenAltKeyPressed}
          >
            {authorName}
            {liveExtraDesc && <span className='ml-4px'>{liveExtraDesc}</span>}
          </a>
          {recommendReasonEl}
        </>
      )
    }

    return defaultRender()
  }
})
