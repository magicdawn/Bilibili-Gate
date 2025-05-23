/**
 * take care of these
 * https://greasyfork.org/zh-CN/scripts/479861-bilibili-%E9%A1%B5%E9%9D%A2%E5%87%80%E5%8C%96%E5%A4%A7%E5%B8%88/discussions/238294
 */

import { css } from '@emotion/react'
import { useRequest } from 'ahooks'
import { Avatar } from 'antd'
import { useSnapshot } from 'valtio'
import { colorPrimaryValue } from '$components/css-vars'
import { isAppRecommend, isLive, isPcRecommend, isRank, type RecItemType } from '$define'
import { EApiType, EAppApiDevice } from '$define/index.shared'
import { PcRecGoto } from '$define/pc-recommend'
import { IconForLive } from '$modules/icon'
import { fetchAppRecommendFollowedPubDate } from '$modules/rec-services/app'
import { formatSpaceUrl } from '$modules/rec-services/dynamic-feed/shared'
import { ELiveStatus } from '$modules/rec-services/live/live-enum'
import { settings } from '$modules/settings'
import { getAvatarSrc } from '$utility/image'
import { DESC_SEPARATOR } from '../process/normalize'
import { useLinkTarget } from '../use/useOpenRelated'
import type { IVideoCardData } from '../process/normalize'
import type { MouseEventHandler } from 'react'

const S = {
  recommendReason: css`
    display: inline-block;
    cursor: default;
    color: var(--Or5);
    background-color: var(--Or1);
    border-radius: 4px;

    font-size: var(--follow-icon-font-size);
    line-height: var(--follow-icon-line-height);
    height: var(--follow-icon-line-height);

    width: max-content;
    max-width: calc(100% - 6px);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    padding-block: 0;
    padding-inline: 2px;
    /* margin-left: -4px; */
  `,

  appBadge: css`
    color: #fa6a9d;
    border-radius: 2px;
    border: 1px #fa6a9d solid;
    line-height: 20px;
    padding: 0 10px;
    transform: scale(0.8);
    transform-origin: center left;
  `,
}

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

const subtitleLineHeightCss = css`
  line-height: var(--subtitle-line-height);
`

export const VideoCardBottom = memo(function ({
  item,
  cardData,
  handleVideoLinkClick,
  className,
}: {
  item: RecItemType
  cardData: IVideoCardData
  handleVideoLinkClick?: MouseEventHandler
  className?: string
}) {
  const { useBorder } = useSnapshot(settings.style.videoCard)
  const target = useLinkTarget()

  const {
    // video
    goto,
    href,

    title,
    titleRender,

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

  const { data: pubDateDisplayFromApi } = useRequest(() => fetchAppRecommendFollowedPubDate(item, cardData), {
    refreshDeps: [item, cardData],
  })

  /**
   * avatar + line1: title
   *          line2: desc =
   *                      when normal video => `author-name + date`
   *          line3: recommend-reason
   */

  let descTitleAttr: string | undefined
  if (isNormalVideo && (authorName || pubdateDisplay || pubdateDisplayForTitleAttr || pubDateDisplayFromApi)) {
    descTitleAttr = [
      //
      authorName,
      pubdateDisplayForTitleAttr || pubdateDisplay || pubDateDisplayFromApi,
    ]
      .filter(Boolean)
      .join(' · ')
  }

  /**
   * https://github.com/magicdawn/bilibili-gate/issues/110
   */
  const ENABLE_HIDE_AVATAR = false
  let hideAvatar = false
  if (ENABLE_HIDE_AVATAR && isAppRecommend(item) && item.device === EAppApiDevice.android) {
    hideAvatar = true
  }

  /**
   * 带头像, 更分散(recommend-reason 单独一行)
   */
  return (
    <div className={clsx('mt-15px px-5px flex gap-x-5px overflow-hidden', useBorder ? 'mb-10px' : 'mb-5px', className)}>
      {/* avatar */}
      {!!authorMid && !hideAvatar && (
        <a href={authorHref} target={target}>
          <span
            className={clsx(
              'flex-center p-1px b-1px b-solid rounded-full relative',
              streaming ? 'b-gate-primary' : 'b-transparent',
            )}
          >
            {authorFace ? (
              <Avatar src={getAvatarSrc(authorFace)} />
            ) : (
              <Avatar>{authorName?.[0] || appBadgeDesc?.[0] || ''}</Avatar>
            )}
            {streaming && (
              <IconForLive
                className='absolute bottom-0 right-0 size-12px rounded-full'
                active
                css={css`
                  background-color: ${colorPrimaryValue};
                `}
              />
            )}
          </span>
        </a>
      )}

      {/* title + desc */}
      <div
        css={css`
          /* as item */
          flex: 1;
          margin-left: 5px; // Q: why not column-gap:10px. A: avatar may hide, margin-left is needed

          /* as container */
          display: flex;
          flex-direction: column;
          row-gap: 4px;
          overflow: hidden;
        `}
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
    if (isNormalVideo) {
      const date = pubdateDisplay || pubDateDisplayFromApi
      return (
        <>
          <a
            className='bili-video-card__info--owner'
            href={authorHref}
            target={target}
            title={descTitleAttr}
            css={descOwnerCss}
          >
            <span className='bili-video-card__info--author'>{authorName}</span>
            {date && <span className='bili-video-card__info--date'>{DESC_SEPARATOR + date}</span>}
          </a>
          {!!recommendReason && (
            <span css={S.recommendReason} title={recommendReason}>
              {recommendReason}
            </span>
          )}
        </>
      )
    }

    // 其他歪瓜
    if (appBadge || appBadgeDesc) {
      return (
        <a className='bili-video-card__info--owner' css={descOwnerCss} href={href} target={target}>
          {!!appBadge && <span css={S.appBadge}>{appBadge}</span>}
          {!!appBadgeDesc && <span>{appBadgeDesc}</span>}
        </a>
      )
    }
    if (isRank(item) && rankingDesc) {
      return <div css={descOwnerCss}>{rankingDesc}</div>
    }
    // 关注的直播 | `PC推荐 & goto=live`
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
          >
            {authorName}
            {liveExtraDesc && <span className='ml-4px'>{liveExtraDesc}</span>}
          </a>
          {!!recommendReason && (
            <span css={S.recommendReason} title={recommendReason}>
              {recommendReason}
            </span>
          )}
        </>
      )
    }
  }
})
