import { css } from '@emotion/react'
import { useLockFn, useMemoizedFn, useUpdateEffect } from 'ahooks'
import { Dropdown } from 'antd'
import clsx from 'clsx'
import {
  memo,
  useMemo,
  useRef,
  type ComponentProps,
  type ComponentRef,
  type CSSProperties,
  type MouseEventHandler,
  type ReactNode,
} from 'react'
import { useUnoMerge } from 'unocss-merge/react'
import { useSnapshot } from 'valtio'
import { APP_CLS_CARD, APP_CLS_CARD_ACTIVE, APP_CLS_CARD_COVER, APP_CLS_ROOT, APP_KEY_PREFIX, appWarn } from '$common'
import { useEmitterOn } from '$common/hooks/useEmitter'
import { isEmptyFragment } from '$common/hooks/useIsEmptyFragment'
import { useLessFrequentFn } from '$common/hooks/useLessFrequentFn'
import { useRefStateBox } from '$common/hooks/useRefState'
import { Picture } from '$components/_base/Picture'
import { clsZVideoCardContextMenu } from '$components/fragments'
import { calcRecItemDislikedMapKey, useDislikedReason } from '$components/ModalDislike/store'
import { isDisplayAsList } from '$components/RecGrid/display-mode'
import { getBvidInfo } from '$components/RecGrid/rec-grid-state'
import { setGlobalValue } from '$components/RecGrid/unsafe-window-export'
import { defaultRecSharedEmitter, type RecSharedEmitter } from '$components/Recommends/rec.shared'
import { clsGateVideoCardContextMenuRoot } from '$components/shared.module.scss'
import {
  checkIsAppRecommend,
  checkIsFav,
  checkIsHistory,
  checkIsLive,
  checkIsPcRecommend,
  checkIsRank,
  checkIsSpaceUpload,
  checkIsWatchlater,
  type PvideoJson,
  type RecItemType,
} from '$define'
import { PcRecGoto } from '$define/pc-recommend'
import { ELiveStatus, ETab, type EGridDisplayMode } from '$enums'
import { antNotification } from '$modules/antd'
import { useInBlacklist } from '$modules/bilibili/me/relations/blacklist'
import { useInFilterByAuthorList } from '$modules/filter/block-state'
import { checkIsNormalVideo, KNOWN_GOTO, normalizeCardData, type IVideoCardData } from '$modules/filter/normalize'
import { IconForCopy } from '$modules/icon'
import { useMultiSelectState } from '$modules/multi-select/store'
import { buildSpaceUploadVideoCardUrl, spaceUploadStore } from '$modules/rec-services/space-upload/store'
import { useWatchlaterState } from '$modules/rec-services/watchlater'
import { buildWatchlaterVideoCardUrl } from '$modules/rec-services/watchlater/helper'
import { settings, useSettingsSnapshot } from '$modules/settings'
import { isWebApiSuccess } from '$request'
import { videoCardBorderRadiusValue } from '../css-vars'
import { useLargePreviewRelated } from '../LargePreview/useLargePreview'
import { multiSelectedCss, useBlockedCardCss } from './card-border-css'
import { ApiTypeTag, GeneralCardTag, isCardTagValid, LiveTag, RankNumTag, VolTag } from './card-tags'
import { BlockedCard, DislikedCard, SkeletonCard } from './child-components/other-type-cards'
import { SimpleProgressBar } from './child-components/PreviewImage'
import { VideoCardActionButton, VideoCardActionsClassNames } from './child-components/VideoCardActions'
import { VideoCardBottom } from './child-components/VideoCardBottom'
import { showNativeContextMenuWhenAltKeyPressed, useContextMenus } from './context-menus'
import {
  clsZWatchedProgressBar,
  copyContent,
  defaultVideoCardEmitter,
  displayAsListCss,
  type VideoCardEmitter,
} from './index.shared'
import { fetchImagePreviewData, isImagePreviewDataValid, type ImagePreviewData } from './services'
import { StatItemDisplay } from './stat-item'
import { useDislikeRelated } from './use/useDislikeRelated'
import { useFavActionButton, useInitFavContext } from './use/useFavRelated'
import { useInitFollowedStatusContext } from './use/useFollowRelated'
import { useRemoveHistoryRelated } from './use/useHistoryRelated'
import { useMultiSelectRelated } from './use/useMultiSelect'
import { getRecItemDimension, useLinkTarget, useOpenRelated } from './use/useOpenRelated'
import { usePreviewRelated } from './use/usePreviewRelated'
import { useWatchlaterRelated } from './use/useWatchlaterRelated'
import type { CssProp } from '$utility/type'

export type VideoCardProps = {
  style?: CSSProperties
  className?: string
  loading?: boolean
  active?: boolean // 键盘 active
  item?: RecItemType
  onRemoveCurrent?: (item: RecItemType, data: IVideoCardData, silent?: boolean) => void | Promise<void>
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
  const dislikeKey = useMemo(() => (item ? calcRecItemDislikedMapKey(item) : undefined), [item])
  const dislikedReason = useDislikedReason(dislikeKey)
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
          <DislikedCard item={item} cardData={cardData} emitter={emitter} dislikedReason={dislikedReason!} />
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
      imgPreview: { enabled: imgPreviewEnabled, autoPreviewWhenHover, disableWhenMultiSelecting },
    },
    spaceUpload: spaceUploadSettings,
    watchlater: watchlaterSettings,
    __internalEnableCopyBvidInfo,
  } = useSettingsSnapshot()
  const {
    // video
    avid,
    bvid,
    cid,
    goto,
    href: _hrefFromNormalize,
    title,
    cover,
    duration,
    durationDisplay,
    recommendReason,
    watchedProgress,

    // stat
    statItems,

    // author
    authorName,
    authorMid,
  } = cardData

  const authed = !!accessKey
  const isNormalVideo = checkIsNormalVideo(goto)
  if (!KNOWN_GOTO.includes(goto)) {
    appWarn(`none (${KNOWN_GOTO.join(',')}) goto type %s`, goto, item)
  }

  // dynamic href
  const { usingOrder: spaceUploadItemsOrder, isDisplayingSingleUpAllItems: spaceUploadIsDisplayingSingleUpAllItems } =
    useSnapshot(spaceUploadStore)
  const href = useMemo(() => {
    if (checkIsWatchlater(item) && item.bvid) {
      return buildWatchlaterVideoCardUrl(item.bvid, item.aid, watchlaterSettings)
    }
    if (checkIsSpaceUpload(item) && authorMid && item.bvid) {
      return buildSpaceUploadVideoCardUrl(authorMid, item.bvid, item.aid, {
        continuePlay: spaceUploadSettings.continuePlay,
        continuePlayDirection: spaceUploadSettings.continuePlayDirection,
        itemsOrder: spaceUploadItemsOrder,
        isDisplayingSingleUpAllItems: spaceUploadIsDisplayingSingleUpAllItems,
      })
    }
    return _hrefFromNormalize
  }, [
    item,
    authorMid,
    _hrefFromNormalize,
    watchlaterSettings.itemsOrder,
    watchlaterSettings.continuePlay,
    watchlaterSettings.continuePlayDirection,
    spaceUploadSettings.continuePlay,
    spaceUploadSettings.continuePlayDirection,
    spaceUploadItemsOrder,
    spaceUploadIsDisplayingSingleUpAllItems,
  ])

  const displayingAsList = isDisplayAsList(gridDisplayMode)
  const aspectRatioFromItem = useMemo(() => getRecItemDimension({ item })?.aspectRatio, [item])

  // shared by video-preview & image-preview
  const shouldFetchPreviewData = useMemo(() => {
    if (!bvid) return false // no bvid
    if (!bvid.startsWith('BV')) return false // bvid invalid
    if (goto !== 'av') return false // only for video
    return true
  }, [bvid, goto])

  const showPreviewImageEl = (() => {
    if (!imgPreviewEnabled) return false
    if (disableWhenMultiSelecting && multiSelecting) return false
    return true
  })()

  const imagePreviewDataBox = useRefStateBox<ImagePreviewData | undefined>(undefined)
  const tryFetchImagePreviewData = useLockFn(async () => {
    if (!bvid) return
    if (!shouldFetchPreviewData) return
    if (!showPreviewImageEl) return
    if (isImagePreviewDataValid(imagePreviewDataBox.val)) return // already fetched
    const data = await fetchImagePreviewData(bvid)
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
  const cardRef = useRef<ComponentRef<'div'>>(null)
  const coverRef = useRef<ComponentRef<'a'>>(null)
  const videoPreviewWrapperRef = cardUseBorder && !displayingAsList ? cardRef : coverRef

  const {
    onStartPreviewAnimation,
    onHotkeyPreviewAnimation,
    // flag
    isHovering,
    // el
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
    setGlobalValue(`${APP_KEY_PREFIX}_activeCardData`, cardData)

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
    cardTarget: cardRef,
    // optional
    aspectRatioFromItem,
    cover,
    videoCardAsTriggerRef: videoPreviewWrapperRef, // use cardRef | coverRef
    videoTitle: title,
  })

  /**
   * 收藏状态
   */
  const favContext = useInitFavContext(item, avid, emitter)

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
  useEmitterOn(emitter, 'toggle-watch-later', () => void watchlaterContext.handleToggleWatchlater())
  useEmitterOn(emitter, 'trigger-dislike', () => void onTriggerDislike())
  useEmitterOn(emitter, 'start-preview-animation', onStartPreviewAnimation)
  useEmitterOn(emitter, 'hotkey-preview-animation', onHotkeyPreviewAnimation)

  const followedStatusContext = useInitFollowedStatusContext(tab, item, cardData, emitter)
  const { followed } = followedStatusContext

  /**
   * context menu
   */
  const contextMenus = useContextMenus({
    item,
    cardData,
    tab,
    isNormalVideo,
    watchlaterContext,
    favContext,
    followed,
    hasDislikeEntry,
    onTriggerDislike,
    onRemoveCurrent,
    consistentOpenMenus,
    conditionalOpenMenus,
    multiSelecting,
  })
  const onContextMenuOpenChange = useMemoizedFn((open: boolean) => {
    if (!open) return
    emitter.emit('context-menu-open')
  })

  /**
   * top marks
   */
  const _hasGeneralCardTags = !!cardData.cardTags?.some(isCardTagValid)
  const _isRank = checkIsRank(item)
  const _isStreaming = // 直播中
    ((checkIsLive(item) || checkIsHistory(item)) && item.live_status === ELiveStatus.Streaming) ||
    (checkIsPcRecommend(item) && item.goto === PcRecGoto.Live)
  const hasApiTypeTag = tab === ETab.AppRecommend && !checkIsAppRecommend(item) && !checkIsLive(item)
  const hasVolMark =
    (checkIsSpaceUpload(item) && spaceUploadSettings.showVol) || (checkIsFav(item) && !!item.vol && !hasApiTypeTag)

  const copyBvidInfoButtonEl = __internalEnableCopyBvidInfo && bvid && (
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

      {/* 热门: 排行榜 */}
      {_isRank && <RankNumTag item={item} />}

      {/* 直播: 直播中 */}
      {_isStreaming && <LiveTag />}

      {/* App推荐: 来自其他 Tab 的内容 */}
      {hasApiTypeTag && <ApiTypeTag item={item} />}

      {/* 显示序号, Tab: 投稿 | 收藏 */}
      {hasVolMark && !!item.vol && (
        <VolTag vol={item.vol} volTooltip={checkIsFav(item) ? item.volTooltip : undefined} />
      )}

      {/* General card-tag */}
      {/* 动态: 充电专属; 投稿: 充电专属;  */}
      {_hasGeneralCardTags && cardData.cardTags?.map((tag) => <GeneralCardTag key={tag.key} tag={tag} />)}
    </>
  )

  const { removeHistoryActionButton } = useRemoveHistoryRelated({
    item,
    cardData,
    actionButtonVisible,
    onRemoveCurrent,
  })

  const { favStateActionButton } = useFavActionButton({
    item,
    cardData,
    ctx: favContext,
    actionButtonVisible,
  })

  const topRightActionsEl = (
    <>
      {/* 历史: 移除历史记录 */}
      {removeHistoryActionButton}

      {/* 收藏: 取消收藏 */}
      {/* !TODO: */}

      {/* 稍后再看 */}
      {watchlaterButtonEl}

      {/* 稍后再看: 收藏 */}
      {favStateActionButton}

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
    multiSelecting && 'gap-x-10px',
  )

  const watchedProgressBar = !!watchedProgress && (
    <SimpleProgressBar progress={watchedProgress} className={clsx('h-3px', clsZWatchedProgressBar)} />
  )

  // 一堆 selector 增加权重
  const clsVideoCardPrefix = `.${APP_CLS_ROOT} .${APP_CLS_CARD}`

  // 封面圆角
  const coverRoundCss: CssProp = useMemo(() => {
    return [
      css`
        ${clsVideoCardPrefix} & {
          overflow: hidden;
          border-radius: ${videoCardBorderRadiusValue};
          transition: border-radius 0.2s ease;
        }
      `,
      !displayingAsList && [
        // 常驻: 下边界不显示圆角
        (active || multiSelecting || (cardUseBorder && !cardUseBorderOnlyOnHover)) &&
          css`
            ${clsVideoCardPrefix} & {
              border-bottom-left-radius: 0;
              border-bottom-right-radius: 0;
            }
          `,

        // hover variant: 不显示圆角
        cardUseBorder &&
          css`
            ${clsVideoCardPrefix}:hover & {
              border-bottom-left-radius: 0;
              border-bottom-right-radius: 0;
            }
          `,
      ],
    ]
  }, [displayingAsList, active, multiSelecting, cardUseBorder, cardUseBorderOnlyOnHover])

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
      ref={coverRef}
      href={href}
      target={target}
      // display: block; /* firefox need this */
      className={clsx(
        APP_CLS_CARD_COVER,
        'relative isolate block aspect-16/9 w-100% overflow-hidden',
        shouldMakeCoverClear && 'ring-1px ring-gate-border',
      )}
      css={[coverRoundCss, displayingAsList && displayAsListCss.cover]}
      onClick={handleVideoLinkClick}
      onContextMenu={(e) => {
        const handled = showNativeContextMenuWhenAltKeyPressed(e)
        if (handled) return
        // try to solve https://github.com/magicdawn/Bilibili-Gate/issues/92
        // can't reproduce on macOS
        e.preventDefault()
      }}
    >
      {/* main-content: image or text */}
      {/* bilibili.com 默认卡片结构 .bili-video-card__image > .bili-video-card__image--wrap > .bili-video-card__cover */}
      {/* 一堆自认没啥用的结构, 这里不用了! 留下为了查找兼容性问题 */}
      {/* .bili-video-card__cover 包含 `absolute inset-0 size-full z-1 overflow-hidden object-cover` 等属性 */}
      {cover ? (
        <Picture
          src={`${cover}@672w_378h_1c_!web-home-common-cover`}
          className='bili-video-card__cover size-full'
          imgProps={{ alt: title }}
          style={{ borderRadius: 0 }}
        />
      ) : (
        <div className='size-full flex-center px-4 py-2'>
          <div className='line-clamp-3 text-center text-1.2em color-gate-text line-height-snug hover:color-gate-primary'>
            {title}
          </div>
        </div>
      )}

      <div
        className='bili-video-card__stats'
        css={css`
          ${clsVideoCardPrefix} & {
            pointer-events: none;
            border-radius: 0;
          }
        `}
      >
        {/* 左下角: 统计 */}
        <div className='bili-video-card__stats--left gap-x-4px xl:gap-x-8px'>
          {statItems.map(({ field, value }) => (
            <StatItemDisplay key={field} field={field} value={value} />
          ))}
        </div>
        {/* 右下角: 时长 */}
        {durationDisplay && (
          <span className='bili-video-card__stats__duration relative top-0.5px'>{durationDisplay}</span>
        )}
      </div>

      {watchedProgressBar}
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

  /* bottom: cover-bottom or cover-right(list mode) */
  const bottomContent = (
    <VideoCardBottom
      item={item}
      cardData={cardData}
      gridDisplayMode={gridDisplayMode}
      followed={followed}
      handleVideoLinkClick={multiSelecting ? toggleMultiSelect : handleVideoLinkClick}
    />
  )

  const extraContent = <>{largePreviewEl}</>

  function wrapDropdown(c: ReactNode) {
    return (
      <Dropdown
        trigger={['contextMenu']}
        onOpenChange={onContextMenuOpenChange}
        getPopupContainer={() => {
          return cardRef.current?.closest<HTMLElement>(`.${APP_CLS_CARD}`) ?? document.body
        }}
        rootClassName={clsx(clsZVideoCardContextMenu, clsGateVideoCardContextMenuRoot)}
        menu={{
          items: contextMenus,
          className: 'w-max', // 需要设置宽度, 否则闪屏
        }}
      >
        {c}
      </Dropdown>
    )
  }

  function wrapCardWrapper(c: ReactNode) {
    return (
      <div
        className='bili-video-card__wrap'
        ref={cardRef}
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
