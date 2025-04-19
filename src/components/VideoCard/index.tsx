import { APP_CLS_CARD, APP_CLS_CARD_COVER, APP_CLS_ROOT, APP_KEY_PREFIX, appWarn } from '$common'
import { zIndexVideoCardContextMenu } from '$common/css-vars-export.module.scss'
import { useLessFrequentFn } from '$common/hooks/useLessFrequentFn'
import { useMittOn } from '$common/hooks/useMitt'
import { useRefStateBox } from '$common/hooks/useRefState'
import { useDislikedReason } from '$components/ModalDislike'
import { setGlobalValue } from '$components/RecGrid/unsafe-window-export'
import type { OnRefresh } from '$components/RecGrid/useRefresh'
import { ETab } from '$components/RecHeader/tab-enum'
import { Picture } from '$components/_base/Picture'
import { borderColorValue } from '$components/css-vars'
import {
  isAppRecommend,
  isLive,
  isPcRecommend,
  isRanking,
  isSpaceUpload,
  isWatchlater,
  type AppRecItemExtend,
  type PvideoJson,
  type RecItemType,
} from '$define'
import { EApiType } from '$define/index.shared'
import { PcRecGoto } from '$define/pc-recommend'
import { antNotification } from '$modules/antd'
import { useInBlacklist } from '$modules/bilibili/me/relations/blacklist'
import { useIsDarkMode } from '$modules/dark-mode'
import { useMultiSelectState } from '$modules/rec-services/_shared/copy-bvid-buttons'
import { UserFavService } from '$modules/rec-services/fav/user-fav-service'
import { ELiveStatus } from '$modules/rec-services/live/live-enum'
import { useWatchlaterState } from '$modules/rec-services/watchlater'
import { settings, useSettingsSnapshot } from '$modules/settings'
import { isWebApiSuccess } from '$request'
import { isFirefox, isSafari } from '$ua'
import type { CssProp } from '$utility/type'
import { css } from '@emotion/react'
import { useLockFn } from 'ahooks'
import { Dropdown } from 'antd'
import type { ComponentRef, CSSProperties, MouseEventHandler, ReactNode } from 'react'
import { videoCardBorderRadiusValue } from '../css-vars'
import { useBlockedCardCss } from './card-border-css'
import { SimplePregressBar } from './child-components/PreviewImage'
import { VideoCardActionStyle } from './child-components/VideoCardActions'
import { VideoCardBottom } from './child-components/VideoCardBottom'
import { BlacklistCard, DislikedCard, SkeletonCard } from './child-components/other-type-cards'
import { useContextMenus } from './context-menus'
import styles, { zIndexWatchlaterProgressBar } from './index.module.scss'
import type { ECardDisplay, SharedEmitter, VideoCardEmitter } from './index.shared'
import {
  defaultEmitter,
  defaultSharedEmitter,
  displayAsListCss,
  isDisplayAsList,
} from './index.shared'
import type { IVideoCardData } from './process/normalize'
import { normalizeCardData } from './process/normalize'
import type { ImagePreviewData, VideoPreviewData } from './services'
import {
  fetchImagePreviewData,
  fetchVideoPreviewData,
  isImagePreviewDataValid,
  isVideoPreviewDataValid,
} from './services'
import { StatItemDisplay } from './stat-item'
import {
  ApiTypeTag,
  ChargeOnlyTag,
  isChargeOnlyVideo,
  LiveBadge,
  RankingNumMark,
  VolMark,
} from './top-marks'
import { useDislikeRelated } from './use/useDislikeRelated'
import { useLargePreviewRelated } from './use/useLargePreview'
import { useMultiSelectRelated } from './use/useMultiSelect'
import { getRecItemDimension, useLinkTarget, useOpenRelated } from './use/useOpenRelated'
import { usePreviewRelated } from './use/usePreviewRelated'
import { useWatchlaterRelated } from './use/useWatchlaterRelated'

export type VideoCardProps = {
  style?: CSSProperties
  className?: string
  loading?: boolean
  active?: boolean // 键盘 active
  item?: RecItemType
  onRemoveCurrent?: (item: RecItemType, data: IVideoCardData) => void | Promise<void>
  onMoveToFirst?: (item: RecItemType, data: IVideoCardData) => void | Promise<void>
  onRefresh?: OnRefresh
  emitter?: VideoCardEmitter
  sharedEmitter?: SharedEmitter
  tab: ETab
  baseCss?: CssProp
  cardDisplay?: ECardDisplay
  multiSelecting?: boolean
} & ComponentProps<'div'>

export const VideoCard = memo(function VideoCard({
  style,
  className,
  item,
  loading,
  active,
  onRemoveCurrent,
  onMoveToFirst,
  onRefresh,
  emitter,
  sharedEmitter,
  tab,
  baseCss,
  cardDisplay,
  multiSelecting,
  ...restProps
}: VideoCardProps) {
  // loading defaults to
  // `true`   => when item is not provided
  // `false`  => when item provided
  loading = loading ?? !item

  const dislikedReason = useDislikedReason(item?.api === EApiType.AppRecommend && item.param)
  const cardData = useMemo(() => item && normalizeCardData(item), [item])

  // state
  const blacklisted = useInBlacklist(cardData?.authorMid)
  const watchlaterAdded = useWatchlaterState(cardData?.bvid)
  const multiSelected = useMultiSelectState(item?.uniqId)

  const showingDislikeCard = !!dislikedReason
  const showingBlacklistCard = blacklisted
  const isBlockedCard = showingDislikeCard || showingBlacklistCard
  const inNormalCardCss = useBlockedCardCss(isBlockedCard)

  return (
    <div
      style={style}
      data-bvid={cardData?.bvid}
      className={clsx('bili-video-card', styles.biliVideoCard, className)}
      css={[baseCss, inNormalCardCss, isDisplayAsList(cardDisplay) && displayAsListCss.card]}
      {...restProps}
    >
      {loading ? (
        <SkeletonCard loading={loading} />
      ) : (
        item &&
        cardData &&
        (showingDislikeCard ? (
          <DislikedCard
            item={item as AppRecItemExtend}
            cardData={cardData}
            emitter={emitter}
            dislikedReason={dislikedReason!}
          />
        ) : showingBlacklistCard ? (
          <BlacklistCard item={item} cardData={cardData} />
        ) : (
          <VideoCardInner
            item={item}
            cardData={cardData}
            active={active}
            emitter={emitter}
            sharedEmitter={sharedEmitter}
            tab={tab}
            onRemoveCurrent={onRemoveCurrent}
            onMoveToFirst={onMoveToFirst}
            onRefresh={onRefresh}
            watchlaterAdded={watchlaterAdded}
            cardDisplay={cardDisplay}
            multiSelecting={multiSelecting}
            multiSelected={multiSelected}
          />
        ))
      )}
    </div>
  )
})

export type VideoCardInnerProps = {
  item: RecItemType
  cardData: IVideoCardData
  active?: boolean
  onRemoveCurrent?: (item: RecItemType, data: IVideoCardData) => void | Promise<void>
  onMoveToFirst?: (item: RecItemType, data: IVideoCardData) => void | Promise<void>
  onRefresh?: OnRefresh
  emitter?: VideoCardEmitter
  sharedEmitter?: SharedEmitter
  watchlaterAdded: boolean
  tab: ETab
  cardDisplay?: ECardDisplay
  multiSelecting?: boolean
  multiSelected: boolean
}
const VideoCardInner = memo(function VideoCardInner({
  item,
  cardData,
  tab,
  active = false,
  onRemoveCurrent,
  onMoveToFirst,
  onRefresh,
  emitter = defaultEmitter,
  sharedEmitter = defaultSharedEmitter,
  watchlaterAdded,
  cardDisplay,
  multiSelecting = false,
  multiSelected,
}: VideoCardInnerProps) {
  const {
    autoPreviewWhenHover,
    accessKey,
    style: {
      videoCard: { useBorder: cardUseBorder, useBorderOnlyOnHover: cardUseBorderOnlyOnHover },
    },
    videoCard: {
      actions: videoCardActions,
      videoPreview: {
        useMp4,
        __internal: { preferNormalCdn },
      },
    },
    spaceUpload: { showVol },
  } = useSettingsSnapshot()
  const authed = !!accessKey

  const {
    // video
    avid,
    bvid,
    cid,
    goto,
    href,
    title,
    cover,
    duration,
    durationStr,
    recommendReason,

    // stat
    statItems,

    // author
    authorName,
    authorMid,
  } = cardData

  const isNormalVideo = goto === 'av'
  const allowed = ['av', 'bangumi', 'picture', 'live']
  if (!allowed.includes(goto)) {
    appWarn(`none (${allowed.join(',')}) goto type %s`, goto, item)
  }

  const imagePreviewDataBox = useRefStateBox<ImagePreviewData | undefined>(undefined)
  const videoPreviewDataBox = useRefStateBox<VideoPreviewData | undefined>(undefined)

  const shouldFetchPreviewData = useMemo(() => {
    if (!bvid) return false // no bvid
    if (!bvid.startsWith('BV')) return false // bvid invalid
    if (goto !== 'av') return false // scrrenshot only for video
    return true
  }, [bvid, goto])
  const tryFetchImagePreviewData = useLockFn(async () => {
    if (!shouldFetchPreviewData) return
    if (multiSelecting) return
    if (isImagePreviewDataValid(imagePreviewDataBox.val)) return // already fetched
    const data = await fetchImagePreviewData(bvid!)
    imagePreviewDataBox.set(data)
    if (!isWebApiSuccess(data.videoshotJson)) {
      warnNoPreview(data.videoshotJson!)
    }
  })
  const tryFetchVideoPreviewData = useLockFn(async () => {
    if (!shouldFetchPreviewData) return
    if (isVideoPreviewDataValid(videoPreviewDataBox.val)) return // already fetched
    const data = await fetchVideoPreviewData({
      bvid: bvid!,
      cid,
      useMp4,
      preferNormalCdn,
      aspectRatioFromItem: getRecItemDimension(item)?.aspectRatio,
    })
    videoPreviewDataBox.set(data)
  })
  useUpdateEffect(() => {
    videoPreviewDataBox.set(undefined)
  }, [useMp4, preferNormalCdn])

  // 3,false: 每三次触发一次
  const warnNoPreview = useLessFrequentFn(
    (json: PvideoJson) => {
      antNotification.warning({
        message: `${json.message} (code: ${json.code})`,
        description: `${title} (${bvid})`,
        duration: 2,
      })
    },
    3,
    false,
  )

  /**
   * 预览 hover state
   */

  // single ref 与 useEventListener 配合不是很好, 故使用两个 ref
  const cardRef = useRef<ComponentRef<'div'> | null>(null)
  const coverRef = useRef<ComponentRef<'a'> | null>(null)
  const videoPreviewWrapperRef = cardUseBorder && !isDisplayAsList(cardDisplay) ? cardRef : coverRef

  const {
    onStartPreviewAnimation,
    onHotkeyPreviewAnimation,
    // flag
    isHovering,
    isHoveringAfterDelay,
    // el
    previewImageRef,
    previewImageEl,
  } = usePreviewRelated({
    uniqId: item.uniqId,
    sharedEmitter,
    title,
    active,
    videoDuration: duration,
    tryFetchImagePreviewData,
    imagePreviewDataBox,
    autoPreviewWhenHover,
    videoPreviewWrapperRef,
  })

  useUpdateEffect(() => {
    if (!active) return

    // update global item data for debug
    setGlobalValue(`${APP_KEY_PREFIX}_activeItem`, item)

    // 自动开始预览
    if (settings.autoPreviewWhenKeyboardSelect) {
      tryFetchImagePreviewData().then(() => {
        onStartPreviewAnimation(false)
      })
    }
  }, [active])

  const actionButtonVisible = active || isHovering

  // 稍候再看
  const { watchlaterButtonEl, onToggleWatchlater, hasWatchlaterEntry } = useWatchlaterRelated({
    item,
    cardData,
    onRemoveCurrent,
    actionButtonVisible,
    watchlaterAdded,
  })

  // 不喜欢
  const { dislikeButtonEl, hasDislikeEntry, onTriggerDislike } = useDislikeRelated({
    item,
    authed,
    actionButtonVisible,
  })

  // 浮动预览
  const {
    largePreviewActionButtonEl,
    largePreviewEl,
    shouldUseLargePreviewCurrentTime,
    getLargePreviewCurrentTime,
    largePreviewVisible,
    hideLargePreview,
  } = useLargePreviewRelated({
    shouldFetchPreviewData,
    tryFetchVideoPreviewData,
    videoPreviewDataBox,
    //
    actionButtonVisible,
    hasLargePreviewActionButton: videoCardActions.showLargePreview,
    //
    item,
    cardData,
    sharedEmitter,
    cardRef,
  })

  /**
   * 收藏状态
   */
  const [favFolderNames, setFavFolderNames] = useState<string[] | undefined>(undefined)
  const [favFolderUrls, setFavFolderUrls] = useState<string[] | undefined>(undefined)
  const updateFavFolderNames = useMemoizedFn(async () => {
    // 只在「稍后再看」提供收藏状态
    if (item.api !== 'watchlater') return
    if (!avid) return
    const result = await UserFavService.getVideoFavState(avid)
    if (result) {
      const { favFolderNames, favFolderUrls } = result
      setFavFolderNames(favFolderNames)
      setFavFolderUrls(favFolderUrls)
    }
  })

  // 打开视频卡片
  const {
    onOpenWithMode,
    handleVideoLinkClick,
    consistentOpenMenus,
    conditionalOpenMenus,
    openInPopupActionButtonEl,
    onOpenInPopup,
  } = useOpenRelated({
    href,
    item,
    cardData,
    actionButtonVisible,
    hasOpenInPopupActionButton: videoCardActions.openInPipWindow,
    getLargePreviewCurrentTime,
    hideLargePreview,
    shouldUseLargePreviewCurrentTime,
  })

  // 多选
  const { multiSelectBgEl, multiSelectEl, toggleMultiSelect } = useMultiSelectRelated({
    multiSelecting,
    multiSelected,
    uniqId: item.uniqId,
  })

  const handleCardClick: MouseEventHandler<HTMLDivElement> = useMemoizedFn((e) => {
    if (!cardUseBorder) return

    // already handled by <a>
    if ((e.target as HTMLElement).closest('a')) return

    onOpenWithMode()
  })

  /**
   * expose actions
   */

  useMittOn(emitter, 'open', () => onOpenWithMode())
  useMittOn(emitter, 'open-in-popup', onOpenInPopup)
  useMittOn(emitter, 'open-with-large-preview-visible', () => {
    if (!largePreviewVisible) return
    hideLargePreview()
    onOpenWithMode()
  })
  useMittOn(emitter, 'toggle-watch-later', () => onToggleWatchlater())
  useMittOn(emitter, 'trigger-dislike', () => onTriggerDislike())
  useMittOn(emitter, 'start-preview-animation', onStartPreviewAnimation)
  useMittOn(emitter, 'hotkey-preview-animation', onHotkeyPreviewAnimation)

  /**
   * context menu
   */

  const contextMenus = useContextMenus({
    item,
    cardData,
    tab,
    // details
    href,
    authorMid,
    authorName,
    recommendReason,
    isNormalVideo,
    onRefresh,
    watchlaterAdded,
    bvid,
    hasWatchlaterEntry,
    onToggleWatchlater,
    favFolderNames,
    avid,
    favFolderUrls,
    onMoveToFirst,
    hasDislikeEntry,
    onTriggerDislike,
    onRemoveCurrent,
    consistentOpenMenus,
    conditionalOpenMenus,
  })

  const onContextMenuOpenChange = useMemoizedFn((open: boolean) => {
    if (!open) return
    updateFavFolderNames()
  })

  /**
   * top marks
   */
  const _isChargeOnly = isChargeOnlyVideo(item, recommendReason) // 充电专属
  const _isRanking = isRanking(item)
  const _isStreaming = // 直播中
    (isLive(item) && item.live_status === ELiveStatus.Streaming) ||
    (isPcRecommend(item) && item.goto === PcRecGoto.Live)
  const _isSpaceUploadShowVol = isSpaceUpload(item) && showVol
  const topLeftMarks: ReactNode[] = [
    // 多选
    multiSelecting && multiSelectEl,

    // 我不想看
    dislikeButtonEl,

    // 动态: 充电专属
    _isChargeOnly && <ChargeOnlyTag key='ChargeOnlyTag' />,

    // 热门: 排行榜
    _isRanking && <RankingNumMark key='RankingNumMark' item={item} />,

    // 直播: 直播中
    _isStreaming && <LiveBadge key='LiveBadge' />,

    // App推荐: 来自其他 Tab 的内容
    tab === ETab.AppRecommend && !isAppRecommend(item) && !isLive(item) && (
      <ApiTypeTag key='ApiTypeTag' item={item} />
    ),

    // 投稿: 显示序号
    _isSpaceUploadShowVol && <VolMark key='VolMark' vol={item.vol} />,
  ].filter(Boolean)

  const topRightActions = [
    watchlaterButtonEl, // 稍后再看
    openInPopupActionButtonEl, // 小窗打开
    largePreviewActionButtonEl, // 浮动预览
  ].filter(Boolean)

  const watchlaterProgressBar =
    isWatchlater(item) && item.progress > 0 ? (
      <SimplePregressBar
        progress={item.progress / item.duration}
        css={css`
          z-index: ${zIndexWatchlaterProgressBar};
          height: 3px;
        `}
      />
    ) : undefined

  // 一堆 selector 增加权重
  const prefixCls = `.${APP_CLS_ROOT} .${APP_CLS_CARD}` // .${APP_CLS_GRID}
  const coverBottomNoRoundCss = css`
    ${prefixCls} & {
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
    }
  `
  const coverRoundCss: CssProp = [
    css`
      ${prefixCls} & {
        overflow: hidden;
        border-radius: ${videoCardBorderRadiusValue};
      }
    `,
    !isDisplayAsList(cardDisplay) &&
      (isHovering || active || multiSelecting || (cardUseBorder && !cardUseBorderOnlyOnHover)) &&
      coverBottomNoRoundCss,
  ]

  // 防止看不清封面边界: (封面与背景色接近)
  const dark = useIsDarkMode()
  const coverBorderCss: CssProp = (() => {
    // card has border always showing, so cover does not need
    if (cardUseBorder && !cardUseBorderOnlyOnHover) return undefined
    const visible =
      !dark && (!cardUseBorder || (cardUseBorder && cardUseBorderOnlyOnHover && !isHovering))
    return css`
      border: 1px solid ${visible ? borderColorValue : 'transparent'};
    `
  })()

  const target = useLinkTarget()
  const coverContent = (
    <a
      ref={(el) => (coverRef.current = el)}
      href={href}
      target={target}
      className={APP_CLS_CARD_COVER}
      css={[
        css`
          display: block; /* firefox need this */
          position: relative;
          overflow: hidden;
          isolation: isolate; // new stacking context
        `,
        coverRoundCss,
        coverBorderCss,
        isDisplayAsList(cardDisplay) && displayAsListCss.cover,
      ]}
      onClick={handleVideoLinkClick}
      onContextMenu={(e) => {
        // try to solve https://github.com/magicdawn/bilibili-gate/issues/92
        // can't reproduce on macOS
        e.preventDefault()
      }}
    >
      <div className='bili-video-card__image' style={{ aspectRatio: '16 / 9' }}>
        {/* __image--wrap 上有 padding-top: 56.25% = 9/16, 用于保持高度, 在 firefox 中有明显的文字位移 */}
        {/* picture: absolute, top:0, left: 0  */}
        {/* 故加上 aspect-ratio: 16/9 */}
        <div className='bili-video-card__image--wrap'>
          <Picture
            src={`${cover}@672w_378h_1c_!web-home-common-cover`}
            className='v-img bili-video-card__cover'
            style={{ borderRadius: 0 }}
            imgProps={{
              // in firefox, alt text is visible during loading
              alt: isFirefox ? '' : title,
            }}
          />
        </div>
      </div>

      <div
        className='bili-video-card__stats'
        css={[
          css`
            ${prefixCls} & {
              pointer-events: none;
              border-radius: 0;
            }
          `,
        ]}
      >
        <div className='bili-video-card__stats--left'>
          {statItems.map(({ field, value }) => (
            <StatItemDisplay key={field} field={field} value={value} />
          ))}
        </div>
        {/* 时长 */}
        {/* 番剧没有 duration 字段 */}
        <span className='bili-video-card__stats__duration relative top-0.5px'>
          {isNormalVideo && durationStr}
        </span>
      </div>

      {watchlaterProgressBar}
      {!multiSelecting && previewImageEl}
      {multiSelectBgEl}

      {/* left-marks */}
      {!!topLeftMarks.length && (
        <div
          className='left-top-marks'
          css={VideoCardActionStyle.topContainer('left')}
          style={{ columnGap: multiSelecting ? 10 : undefined }}
        >
          {topLeftMarks}
        </div>
      )}

      {/* right-actions */}
      {!!topRightActions.length && (
        <div className='right-actions' css={VideoCardActionStyle.topContainer('right')}>
          {topRightActions}
        </div>
      )}
    </a>
  )

  /* bottom: after the cover */
  const bottomContent = (
    <VideoCardBottom
      item={item}
      cardData={cardData}
      handleVideoLinkClick={multiSelecting ? toggleMultiSelect : handleVideoLinkClick}
    />
  )

  const extraContent = <>{largePreviewEl}</>

  function wrapDropdown(c: ReactNode) {
    return (
      <Dropdown
        getPopupContainer={() => {
          // safari z-index issue: context-menu 在 rec-header 下
          if (isSafari) return document.body
          return cardRef.current || document.body
        }}
        overlayStyle={{ zIndex: zIndexVideoCardContextMenu }}
        menu={{
          items: contextMenus,
          style: {
            // 需要设置宽度, 否则闪屏
            width: 'max-content',
          },
        }}
        trigger={['contextMenu']}
        onOpenChange={onContextMenuOpenChange}
      >
        {c}
      </Dropdown>
    )
  }

  function wrapCardWrapper(c: ReactNode) {
    return (
      <div
        className='bili-video-card__wrap'
        ref={(el) => (cardRef.current = el)}
        css={[
          css`
            background-color: unset;
            position: static;
            height: 100%;
          `,
          isDisplayAsList(cardDisplay) && displayAsListCss.cardWrap,
        ]}
        onClick={multiSelecting ? toggleMultiSelect : handleCardClick}
        onContextMenu={(e) => {
          if (cardUseBorder) {
            e.preventDefault()
          }
        }}
      >
        {c}
      </div>
    )
  }

  const wrappedContent: ReactNode =
    cardUseBorder && !isDisplayAsList(cardDisplay)
      ? wrapDropdown(
          wrapCardWrapper(
            <>
              {coverContent}
              {bottomContent}
            </>,
          ),
        )
      : wrapCardWrapper(
          <>
            {wrapDropdown(coverContent)}
            {bottomContent}
          </>,
        )

  return (
    <>
      {wrappedContent}
      {extraContent}
    </>
  )
})
