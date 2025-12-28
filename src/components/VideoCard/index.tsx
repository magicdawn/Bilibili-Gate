import { css } from '@emotion/react'
import { useLockFn } from 'ahooks'
import { Dropdown } from 'antd'
import { useUnoMerge } from 'unocss-merge/react'
import { APP_CLS_CARD, APP_CLS_CARD_ACTIVE, APP_CLS_CARD_COVER, APP_CLS_ROOT, APP_KEY_PREFIX, appWarn } from '$common'
import { useEmitterOn } from '$common/hooks/useEmitter'
import { isEmptyFragment } from '$common/hooks/useIsEmptyFragment'
import { useLessFrequentFn } from '$common/hooks/useLessFrequentFn'
import { useRefStateBox } from '$common/hooks/useRefState'
import { Picture } from '$components/_base/Picture'
import { useDislikedReason } from '$components/ModalDislike'
import { isDisplayAsList } from '$components/RecGrid/display-mode'
import { getBvidInfo } from '$components/RecGrid/rec-grid-state'
import { setGlobalValue } from '$components/RecGrid/unsafe-window-export'
import { ETab } from '$components/RecHeader/tab-enum'
import { defaultRecSharedEmitter, type RecSharedEmitter, type RefreshFn } from '$components/Recommends/rec.shared'
import {
  isAppRecommend,
  isFav,
  isLive,
  isPcRecommend,
  isRank,
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
import { useInFilterByAuthorList } from '$modules/filter/block-state'
import { normalizeCardData, type IVideoCardData } from '$modules/filter/normalize'
import { IconForCopy } from '$modules/icon'
import { useMultiSelectState } from '$modules/multi-select/store'
import { ELiveStatus } from '$modules/rec-services/live/live-enum'
import { useWatchlaterState } from '$modules/rec-services/watchlater'
import { settings, useSettingsSnapshot } from '$modules/settings'
import { isWebApiSuccess } from '$request'
import { isFirefox, isSafari } from '$ua'
import { videoCardBorderRadiusValue } from '../css-vars'
import { useLargePreviewRelated } from '../LargePreview/useLargePreview'
import { multiSelectedCss, useBlockedCardCss } from './card-border-css'
import { BlockedCard, DislikedCard, SkeletonCard } from './child-components/other-type-cards'
import { SimpleProgressBar } from './child-components/PreviewImage'
import { VideoCardActionButton, VideoCardActionsClassNames } from './child-components/VideoCardActions'
import { VideoCardBottom } from './child-components/VideoCardBottom'
import { showNativeContextMenuWhenAltKeyPressed, useContextMenus } from './context-menus'
import {
  clsZWatchlaterProgressBar,
  copyContent,
  defaultVideoCardEmitter,
  displayAsListCss,
  type VideoCardEmitter,
} from './index.shared'
import { fetchImagePreviewData, isImagePreviewDataValid, type ImagePreviewData } from './services'
import { StatItemDisplay } from './stat-item'
import {
  ApiTypeTag,
  DynamicFeedBadgeDisplay,
  LiveBadge,
  RankNumMark,
  shouldShowDynamicFeedBadge,
  VolMark,
} from './top-marks'
import { useDislikeRelated } from './use/useDislikeRelated'
import { useInitFavContext } from './use/useFavRelated'
import { useMultiSelectRelated } from './use/useMultiSelect'
import { getRecItemDimension, useLinkTarget, useOpenRelated } from './use/useOpenRelated'
import { usePreviewRelated } from './use/usePreviewRelated'
import { useWatchlaterRelated } from './use/useWatchlaterRelated'
import { zIndexVideoCardContextMenu } from '$common/css-vars-export.module.scss'
import type { EGridDisplayMode } from '$enums'
import type { CssProp } from '$utility/type'
import type { ComponentRef, CSSProperties, MouseEventHandler, ReactNode } from 'react'

export type VideoCardProps = {
  style?: CSSProperties
  className?: string
  loading?: boolean
  active?: boolean // 键盘 active
  item?: RecItemType
  onRemoveCurrent?: (item: RecItemType, data: IVideoCardData, silent?: boolean) => void | Promise<void>
  onMoveToFirst?: (item: RecItemType, data: IVideoCardData) => void | Promise<void>
  refresh?: RefreshFn
  emitter?: VideoCardEmitter
  recSharedEmitter?: RecSharedEmitter
  tab: ETab
  baseCss?: CssProp
  gridDisplayMode?: EGridDisplayMode
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
  refresh,
  emitter,
  recSharedEmitter,
  tab,
  baseCss,
  gridDisplayMode,
  multiSelecting,
  ...restProps
}: VideoCardProps) {
  // loading defaults to
  // `true`   => when item is not provided
  // `false`  => when item provided
  loading = loading ?? !item
  const cardData = useMemo(() => item && normalizeCardData(item), [item])

  // state
  const dislikedReason = useDislikedReason(item?.api === EApiType.AppRecommend ? item.param : undefined)
  const blacklisted = useInBlacklist(cardData?.authorMid)
  const blocked = useInFilterByAuthorList(cardData?.authorMid)
  const watchlaterAdded = useWatchlaterState(cardData?.bvid)
  const multiSelected = useMultiSelectState(item?.uniqId)

  const showingDislikeCard = !!dislikedReason
  const showingBlacklistCard = blacklisted
  const showingBlockedCard = blocked
  const isBlockedCard = showingDislikeCard || showingBlacklistCard || showingBlockedCard
  const blockedCardCss = useBlockedCardCss(isBlockedCard)

  const _className = clsx('bili-video-card', APP_CLS_CARD, { [APP_CLS_CARD_ACTIVE]: active }, 'relative', className)
  const _css = [
    baseCss,
    blockedCardCss,
    isDisplayAsList(gridDisplayMode) && displayAsListCss.card,
    multiSelecting && multiSelected && multiSelectedCss,
  ]

  return (
    <div data-bvid={cardData?.bvid} style={style} className={_className} css={_css} {...restProps}>
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
          <BlockedCard item={item} cardData={cardData} blockType='blacklist' />
        ) : showingBlockedCard ? (
          <BlockedCard item={item} cardData={cardData} blockType='filter' />
        ) : (
          <VideoCardInner
            item={item}
            cardData={cardData}
            active={active}
            emitter={emitter}
            recSharedEmitter={recSharedEmitter}
            tab={tab}
            onRemoveCurrent={onRemoveCurrent}
            onMoveToFirst={onMoveToFirst}
            refresh={refresh}
            watchlaterAdded={watchlaterAdded}
            gridDisplayMode={gridDisplayMode}
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
  onRemoveCurrent?: (item: RecItemType, data: IVideoCardData, silent?: boolean) => void | Promise<void>
  onMoveToFirst?: (item: RecItemType, data: IVideoCardData) => void | Promise<void>
  refresh?: RefreshFn
  emitter?: VideoCardEmitter
  recSharedEmitter?: RecSharedEmitter
  watchlaterAdded: boolean
  tab: ETab
  gridDisplayMode?: EGridDisplayMode
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
  refresh,
  emitter = defaultVideoCardEmitter,
  recSharedEmitter = defaultRecSharedEmitter,
  watchlaterAdded,
  gridDisplayMode,
  multiSelecting = false,
  multiSelected,
}: VideoCardInnerProps) {
  // snapshot
  const {
    accessKey,
    style: {
      videoCard: { useBorder: cardUseBorder, useBorderOnlyOnHover: cardUseBorderOnlyOnHover },
    },
    videoCard: {
      actions: videoCardActions,
      imgPreview: { autoPreviewWhenHover, disableWhenMultiSelecting },
    },
    spaceUpload: { showVol },
    __internalEnableCopyBvidInfo,
  } = useSettingsSnapshot()
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

  // snapshot computed
  const authed = !!accessKey
  const showPreviewImageEl = !(disableWhenMultiSelecting && multiSelecting)

  const isNormalVideo = goto === 'av'
  const allowed = ['av', 'bangumi', 'picture', 'live']
  if (!allowed.includes(goto)) {
    appWarn(`none (${allowed.join(',')}) goto type %s`, goto, item)
  }

  const displayingAsList = isDisplayAsList(gridDisplayMode)
  const aspectRatioFromItem = useMemo(() => getRecItemDimension({ item })?.aspectRatio, [item])

  const imagePreviewDataBox = useRefStateBox<ImagePreviewData | undefined>(undefined)
  const shouldFetchPreviewData = useMemo(() => {
    if (!bvid) return false // no bvid
    if (!bvid.startsWith('BV')) return false // bvid invalid
    if (goto !== 'av') return false // scrrenshot only for video
    if (!showPreviewImageEl) return false // disabled when `multi-selecting` | future-more-case
    return true
  }, [bvid, goto, showPreviewImageEl])
  const tryFetchImagePreviewData = useLockFn(async () => {
    if (!shouldFetchPreviewData) return
    if (isImagePreviewDataValid(imagePreviewDataBox.val)) return // already fetched
    const data = await fetchImagePreviewData(bvid!)
    imagePreviewDataBox.set(data)
    if (!isWebApiSuccess(data.videoshotJson)) {
      warnNoPreview(data.videoshotJson!)
    }
  })

  // 3,false: 每三次触发一次
  const warnNoPreview = useLessFrequentFn(
    (json: PvideoJson) => {
      antNotification.warning({
        title: `${json.message} (code: ${json.code})`,
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
  const videoPreviewWrapperRef = cardUseBorder && !displayingAsList ? cardRef : coverRef

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
    recSharedEmitter,
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
    if (settings.videoCard.imgPreview.autoPreviewWhenKeyboardSelect) {
      tryFetchImagePreviewData().then(() => {
        onStartPreviewAnimation(false)
      })
    }
  }, [active])

  const actionButtonVisible = active || isHovering

  // 稍候再看
  const { watchlaterButtonEl, context: watchlaterContext } = useWatchlaterRelated({
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
    actionButtonVisible,
    hasLargePreviewActionButton: videoCardActions.showLargePreview,
    // required
    bvid: bvid!,
    cid,
    uniqId: item.uniqId,
    recSharedEmitter,
    // optional
    aspectRatioFromItem,
    cover,
    cardRef,
    videoCardAsTriggerRef: videoPreviewWrapperRef, // use cardRef | coverRef
  })

  /**
   * 收藏状态
   */
  const favContext = useInitFavContext(item, avid)

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

    // click from a antd.Dropdown context menu, displayingAsList时可重现
    if ((e.target as HTMLElement).closest('.ant-dropdown-menu')) return

    // already handled by <a>
    if ((e.target as HTMLElement).closest('a')) return

    onOpenWithMode()
  })

  /**
   * expose actions
   */

  useEmitterOn(emitter, 'open', () => onOpenWithMode())
  useEmitterOn(emitter, 'open-in-popup', onOpenInPopup)
  useEmitterOn(emitter, 'open-with-large-preview-visible', () => {
    if (!largePreviewVisible) return
    hideLargePreview()
    onOpenWithMode()
  })
  useEmitterOn(emitter, 'toggle-watch-later', () => void watchlaterContext.onToggleWatchlater())
  useEmitterOn(emitter, 'trigger-dislike', () => void onTriggerDislike())
  useEmitterOn(emitter, 'start-preview-animation', onStartPreviewAnimation)
  useEmitterOn(emitter, 'hotkey-preview-animation', onHotkeyPreviewAnimation)

  /**
   * context menu
   */
  const contextMenus = useContextMenus({
    item,
    cardData,
    tab,
    isNormalVideo,
    refresh,
    watchlaterContext,
    favContext,
    onMoveToFirst,
    hasDislikeEntry,
    onTriggerDislike,
    onRemoveCurrent,
    consistentOpenMenus,
    conditionalOpenMenus,
    multiSelecting,
  })
  const onContextMenuOpenChange = useMemoizedFn((open: boolean) => {
    if (!open) return
    favContext.updateFavFolderNames()
  })

  /**
   * top marks
   */
  const hasDynmaicFeedBadge = shouldShowDynamicFeedBadge(item)
  const _isRank = isRank(item)
  const _isStreaming = // 直播中
    (isLive(item) && item.live_status === ELiveStatus.Streaming) ||
    (isPcRecommend(item) && item.goto === PcRecGoto.Live)
  const hasApiTypeTag = tab === ETab.AppRecommend && !isAppRecommend(item) && !isLive(item)
  const hasVolMark = (isSpaceUpload(item) && showVol) || (isFav(item) && !!item.vol && !hasApiTypeTag)

  const copyBvidInfoButtonEl = __internalEnableCopyBvidInfo && (
    <VideoCardActionButton
      visible={actionButtonVisible}
      inlinePosition='right'
      icon={<IconForCopy className='size-14px' />}
      tooltip={'复制 BVID 信息'}
      onClick={(e) => {
        e.stopPropagation()
        e.preventDefault()
        copyContent(getBvidInfo(cardData))
      }}
    />
  )

  const topLeftMarksEl = (
    <>
      {/* 多选 */}
      {multiSelecting && multiSelectEl}

      {/* 我不想看 */}
      {dislikeButtonEl}

      {/* 动态: 充电专属 | 其他  */}
      {hasDynmaicFeedBadge && <DynamicFeedBadgeDisplay item={item} />}

      {/* 热门: 排行榜 */}
      {_isRank && <RankNumMark item={item} />}

      {/* 直播: 直播中 */}
      {_isStreaming && <LiveBadge />}

      {/* App推荐: 来自其他 Tab 的内容 */}
      {hasApiTypeTag && <ApiTypeTag item={item} />}

      {/* 显示序号, Tab: 投稿 | 收藏 */}
      {hasVolMark && !!item.vol && <VolMark vol={item.vol} volTooltip={isFav(item) ? item.volTooltip : undefined} />}
    </>
  )

  const topRightActionsEl = (
    <>
      {/* 稍后再看 */}
      {watchlaterButtonEl}

      {/* 复制 bvid */}
      {copyBvidInfoButtonEl}

      {/* 小窗打开 */}
      {openInPopupActionButtonEl}

      {/* 浮动预览 */}
      {largePreviewActionButtonEl}
    </>
  )

  const hasTopLeftMarks = !isEmptyFragment(topLeftMarksEl)
  const hasTopRightActions = !isEmptyFragment(topRightActionsEl)
  const clsTopLeftMarksContainer = useUnoMerge(
    'left-top-marks',
    VideoCardActionsClassNames.topContainer('left'),
    multiSelecting ? 'gap-x-10px' : undefined,
  )

  const watchlaterProgressBar =
    isWatchlater(item) && item.progress > 0 ? (
      <SimpleProgressBar
        progress={item.progress / item.duration}
        className={clsx('h-3px', clsZWatchlaterProgressBar)}
      />
    ) : undefined

  // 一堆 selector 增加权重
  const prefixCls = `.${APP_CLS_ROOT} .${APP_CLS_CARD}` // .${APP_CLS_GRID}

  // 封面圆角
  const coverRoundCss: CssProp = useMemo(() => {
    return [
      css`
        ${prefixCls} & {
          overflow: hidden;
          border-radius: ${videoCardBorderRadiusValue};
          transition: border-radius 0.2s ease-in-out;
        }
      `,
      !displayingAsList &&
        (isHovering || active || multiSelecting || (cardUseBorder && !cardUseBorderOnlyOnHover)) &&
        css`
          ${prefixCls} & {
            border-bottom-left-radius: 0;
            border-bottom-right-radius: 0;
          }
        `,
    ]
  }, [displayingAsList, isHovering, active, multiSelecting, cardUseBorder, cardUseBorderOnlyOnHover])

  // 防止看不清封面边界: (封面与背景色接近)
  const shouldMakeCoverClear = useMemo(() => {
    // case: no-need, card has border always showing, so cover does not need
    if (cardUseBorder && !cardUseBorderOnlyOnHover) return false
    if (multiSelecting) return false
    return !cardUseBorder || (cardUseBorder && cardUseBorderOnlyOnHover && !isHovering)
  }, [cardUseBorder, cardUseBorderOnlyOnHover, isHovering, multiSelecting])

  const target = useLinkTarget()
  const coverContent = (
    <a
      ref={(el) => (coverRef.current = el)}
      href={href}
      target={target}
      className={clsx(APP_CLS_CARD_COVER, shouldMakeCoverClear && 'ring-1px ring-gate-border')}
      css={[
        css`
          display: block; /* firefox need this */
          position: relative;
          overflow: hidden;
          isolation: isolate; // new stacking context
        `,
        coverRoundCss,
        displayingAsList && displayAsListCss.cover,
      ]}
      onClick={handleVideoLinkClick}
      onContextMenu={(e) => {
        const handled = showNativeContextMenuWhenAltKeyPressed(e)
        if (handled) return

        // try to solve https://github.com/magicdawn/Bilibili-Gate/issues/92
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
            className='bili-video-card__cover v-img'
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
        <div className='bili-video-card__stats--left gap-x-4px xl:gap-x-8px'>
          {statItems.map(({ field, value }) => (
            <StatItemDisplay key={field} field={field} value={value} />
          ))}
        </div>
        {/* 时长 */}
        {/* 番剧没有 duration 字段 */}
        <span className='bili-video-card__stats__duration relative top-0.5px'>{isNormalVideo && durationStr}</span>
      </div>

      {watchlaterProgressBar}
      {showPreviewImageEl && previewImageEl}
      {multiSelectBgEl}

      {/* left-marks */}
      {hasTopLeftMarks && <div className={clsTopLeftMarksContainer}>{topLeftMarksEl}</div>}

      {/* right-actions */}
      {hasTopRightActions && (
        <div className={clsx('right-actions', VideoCardActionsClassNames.topContainer('right'))}>
          {topRightActionsEl}
        </div>
      )}
    </a>
  )

  /* bottom: after the cover */
  const bottomContent = (
    <VideoCardBottom
      item={item}
      cardData={cardData}
      gridDisplayMode={gridDisplayMode}
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
        styles={{
          root: { zIndex: Number(zIndexVideoCardContextMenu) },
        }}
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
          displayingAsList && displayAsListCss.cardWrap,
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
    cardUseBorder && !displayingAsList
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
