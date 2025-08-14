/**
 * 推荐内容, 无限滚动
 */

import { useEventListener, useLatest, usePrevious, useUnmountedRef } from 'ahooks'
import { Divider } from 'antd'
import Emittery from 'emittery'
import { delay, isEqual, noop } from 'es-toolkit'
import ms from 'ms'
import { useInView } from 'react-intersection-observer'
import { VirtuosoGrid } from 'react-virtuoso'
import { useSnapshot } from 'valtio'
import { APP_CLS_GRID, baseDebug } from '$common'
import { useEmitterOn } from '$common/hooks/useEmitter'
import { useRefStateBox, type RefStateBox } from '$common/hooks/useRefState'
import { clsGateVideoGridDivider } from '$common/shared.module.scss'
import { useModalDislikeVisible } from '$components/ModalDislike'
import { useModalMoveFavVisible } from '$components/ModalMoveFav'
import { useCurrentUsingTab, useSortedTabKeys } from '$components/RecHeader/tab'
import { ETab } from '$components/RecHeader/tab-enum'
import { VideoCard } from '$components/VideoCard'
import { getActiveCardBorderCss, useCardBorderCss } from '$components/VideoCard/card-border-css'
import { createSharedEmitter, type VideoCardEmitter, type VideoCardEvents } from '$components/VideoCard/index.shared'
import { EApiType } from '$define/index.shared'
import { $headerHeight } from '$header'
import { antMessage } from '$modules/antd'
import { filterRecItems } from '$modules/filter'
import { multiSelectStore } from '$modules/multi-select/store'
import { concatThenUniq, getGridRefreshCount, refreshForGrid } from '$modules/rec-services'
import { getServiceFromRegistry, type ServiceMap } from '$modules/rec-services/service-map.ts'
import { settings, useSettingsSnapshot } from '$modules/settings'
import { isSafari } from '$ua'
import type { RecItemType, RecItemTypeOrSeparator } from '$define'
import type { IVideoCardData } from '$modules/filter/normalize'
import * as classNames from '../video-grid.module.scss'
import { ErrorDetail } from './error-detail'
import { setCurrentGridSharedEmitter } from './rec-grid-state'
import { useRefresh } from './useRefresh'
import { useShortcut } from './useShortcut'
import { ENABLE_VIRTUAL_GRID, gridComponents } from './virtuoso.config'
import type { OnRefresh } from './useRefresh'
import type { CustomGridComponents, CustomGridContext } from './virtuoso.config'
import type { ForwardedRef, ReactNode } from 'react'

const debug = baseDebug.extend('components:RecGrid')

export type HeaderState = {
  refreshing: boolean
  onRefresh: OnRefresh
  extraInfo: ReactNode
}

export const initHeaderState = (): HeaderState => ({
  refreshing: false,
  onRefresh: noop,
  extraInfo: null,
})

export type RecGridRef = { refresh: OnRefresh }

export type RecGridProps = {
  className?: string
  shortcutEnabled: boolean
  infiniteScrollUseWindow: boolean
  onScrollToTop?: () => void
  scrollerRef?: RefObject<HTMLElement | null>
  onSyncHeaderState?: (options: HeaderState) => void
}

export const RecGrid = forwardRef<RecGridRef, RecGridProps>(function (props, ref) {
  const servicesRegistry = useRefStateBox<Partial<ServiceMap>>(() => ({}))

  const tab = useDeferredValue(useCurrentUsingTab())
  const prevTab = usePrevious(tab)

  const tabOrders = useSortedTabKeys()
  const direction = useMemo(() => {
    return prevTab ? (tabOrders.indexOf(tab) > tabOrders.indexOf(prevTab) ? 'right' : 'left') : undefined
  }, [tabOrders, tab]) // only SYNC with `tab`

  return (
    <RecGridInner
      key={tab}
      tab={tab}
      direction={direction}
      handlersRef={ref}
      servicesRegistry={servicesRegistry}
      {...props}
    />
  )
})

const RecGridInner = memo(function ({
  shortcutEnabled,
  className,
  tab,
  handlersRef,
  servicesRegistry,
  infiniteScrollUseWindow,
  onScrollToTop,
  scrollerRef,
  onSyncHeaderState,
}: RecGridProps & {
  tab: ETab
  direction?: 'left' | 'right' // how to get to current tab, moved left or right
  handlersRef?: ForwardedRef<RecGridRef>
  servicesRegistry: RefStateBox<Partial<ServiceMap>>
}) {
  const unmountedRef = useUnmountedRef()
  const { cardDisplay } = useSnapshot(settings.style.pureRecommend)
  const { multiSelecting } = useSnapshot(multiSelectStore)

  // 已加载完成的 load call count, 类似 page
  const loadCompleteCountBox = useRefStateBox(0)

  const [extraInfo, setExtraInfo] = useState<ReactNode>(undefined)
  const updateExtraInfo = useMemoizedFn(() => {
    setExtraInfo(servicesRegistry.val[tab]?.usageInfo)
  })

  const preAction = useMemoizedFn(() => {
    clearActiveIndex()
    updateExtraInfo()
    onScrollToTop?.()
  })
  const postAction = useMemoizedFn(() => {
    clearActiveIndex()
    updateExtraInfo()
    loadCompleteCountBox.set(1)
    setTimeout(checkShouldLoadMore)
  })

  const {
    itemsBox,
    error: refreshError,
    refresh,
    hasMoreBox,
    refreshingBox,
    refreshTsBox,
    refreshAbortController,
    showSkeleton,
    beforeMount,
  } = useRefresh({
    tab,
    servicesRegistry,
    debug,
    fetcher: refreshForGrid,
    // actions
    preAction,
    postAction,
    updateExtraInfo,
  })

  useImperativeHandle(handlersRef, () => ({ refresh }), [refresh])

  const refreshing = refreshingBox.state
  const hasMore = hasMoreBox.state

  // sync to parent component
  useEffect(() => {
    if (unmountedRef.current) return
    onSyncHeaderState?.({
      refreshing,
      onRefresh: refresh,
      extraInfo,
    })
  }, [refreshing, refresh, extraInfo, onSyncHeaderState])

  const goOutAt = useRef<number | undefined>()
  useEventListener(
    'visibilitychange',
    (e) => {
      const visible = document.visibilityState === 'visible'
      if (!visible) {
        goOutAt.current = Date.now()
        return
      }

      if (refreshingBox.val) return
      if (loadMoreLocker.current[refreshTsBox.val]) return

      // 场景
      // 当前 Tab: 稍后再看, 点视频进去, 在视频页移除了, 关闭视频页, 回到首页
      if (tab === ETab.Watchlater && goOutAt.current && Date.now() - goOutAt.current > ms('1h')) {
        refresh(true)
      }
    },
    { target: document },
  )

  const checkShouldLoadMore = useMemoizedFn(async () => {
    // always async, `footerInViewRef` depends on `__footerInView` state
    await delay(isSafari ? 100 : 0)

    debug('checkShouldLoadMore(): footerInView = %s', footerInViewRef.current)
    if (footerInViewRef.current) {
      loadMore()
    }
  })

  // 在 refresh & loadMore 都有可能更改的 state, 需要 useRefState
  const loadMoreLocker = useRef<Record<number, boolean>>({})
  type LockKey = number
  const lock = useCallback((lockKey: LockKey) => (loadMoreLocker.current = { [lockKey]: true }), [])
  const unlock = useCallback((lockKey: LockKey) => (loadMoreLocker.current[lockKey] = false), [])
  const isLocked = useMemoizedFn((lockKey: LockKey) => !!loadMoreLocker.current[lockKey])

  const loadMore = useMemoizedFn(async () => {
    if (unmountedRef.current) return
    if (!hasMoreBox.val) return
    if (refreshAbortController.signal.aborted) return
    if (refreshingBox.val) return

    const getState = () => ({ refreshTs: refreshTsBox.val })
    const startingState = getState()
    const lockKey = startingState.refreshTs
    if (isLocked(lockKey)) return
    lock(lockKey)

    let newItems = itemsBox.val
    let newHasMore = true
    let err: any
    try {
      const service = getServiceFromRegistry(servicesRegistry, tab)
      let more = (await service.loadMore(refreshAbortController.signal)) || []
      more = filterRecItems(more, tab)
      newItems = concatThenUniq(newItems, more)
      newHasMore = service.hasMore
    } catch (e) {
      err = e
    }
    if (err) {
      unlock(lockKey)
      // todo: how to handle this ?
      throw err
    }

    // loadMore 发出请求了, 但稍候重新刷新了, setItems 以及后续操作应该 abort
    {
      const currentState = getState()
      if (!isEqual(startingState, currentState)) {
        debug('loadMore: skip update for mismatch refresh state, %o != %o', startingState, currentState)
        unlock(lockKey)
        return
      }
    }

    debug('loadMore: seq(%s) len %s -> %s', loadCompleteCountBox.val + 1, itemsBox.val.length, newItems.length)
    hasMoreBox.set(newHasMore)
    itemsBox.set(newItems)
    loadCompleteCountBox.set((c) => c + 1)
    unlock(lockKey)

    // check
    checkShouldLoadMore()
  })

  // 渲染使用的 items
  const usingItems = itemsBox.state

  // .video-grid
  const containerRef = useRef<HTMLDivElement | null>(null)

  const getScrollerRect = useMemoizedFn(() => {
    // use window
    if (infiniteScrollUseWindow) {
      const yStart = $headerHeight.get() + 50 // 50 RecHeader height
      return new DOMRect(0, yStart, window.innerWidth, window.innerHeight - yStart)
    }
    // use in a scroller
    else {
      return scrollerRef?.current?.getBoundingClientRect()
    }
  })

  // 不喜欢弹窗
  const modalDislikeVisible = useModalDislikeVisible()
  const modalMoveFavVisible = useModalMoveFavVisible()

  const usingVideoItems = useMemo(() => {
    return usingItems.filter((x) => x.api !== EApiType.Separator)
  }, [usingItems])

  // emitters
  const emitterCache = useMemo(() => new Map<string, VideoCardEmitter>(), [refreshTsBox.state])
  const videoCardEmitters = useMemo(() => {
    return usingVideoItems.map(({ uniqId }) => {
      const cacheKey = uniqId
      return (
        emitterCache.get(cacheKey) ||
        (() => {
          const instance = new Emittery<VideoCardEvents>()
          emitterCache.set(cacheKey, instance)
          return instance
        })()
      )
    })
  }, [usingVideoItems])

  const sharedEmitter = useMemo(() => createSharedEmitter(), [])
  useEffect(() => setCurrentGridSharedEmitter(sharedEmitter), [sharedEmitter])

  const [activeLargePreviewUniqId, setActiveLargePreviewUniqId] = useState<string | undefined>(undefined)
  useEmitterOn(sharedEmitter, 'show-large-preview', setActiveLargePreviewUniqId)
  const activeLargePreviewItemIndex = useMemo(() => {
    if (!activeLargePreviewUniqId) return
    return usingVideoItems.findIndex((item) => item.uniqId === activeLargePreviewUniqId)
  }, [usingItems, activeLargePreviewUniqId])

  // 快捷键
  const { activeIndex, clearActiveIndex } = useShortcut({
    enabled: shortcutEnabled,
    refresh,
    maxIndex: usingVideoItems.length - 1,
    containerRef,
    getScrollerRect,
    videoCardEmitters,
    activeLargePreviewItemIndex,
    changeScrollY: infiniteScrollUseWindow
      ? function ({ offset, absolute }) {
          const scroller = document.documentElement
          if (typeof offset === 'number') {
            scroller.scrollTop += offset
            return
          }
          if (typeof absolute === 'number') {
            scroller.scrollTop = absolute
            return
          }
        }
      : undefined,
  })

  /**
   * card state change
   */

  const setItems = itemsBox.set

  const handleRemoveCards = useMemoizedFn((uniqIds: string[], titles?: string[], silent?: boolean) => {
    setItems((items) => {
      const newItems = items.slice()
      const removedTitles: string[] = []

      for (const [i, uniqId] of uniqIds.entries()) {
        const index = newItems.findIndex((x) => x.uniqId === uniqId)
        if (index === -1) continue

        newItems.splice(index, 1)
        const title = titles?.[i]
        if (title) removedTitles.push(title)

        if (tab === ETab.Watchlater) {
          servicesRegistry.val[tab]?.decreaseTotal()
        }
        if (tab === ETab.Fav) {
          servicesRegistry.val[tab]?.decreaseTotal()
        }
      }

      if (!silent && removedTitles.length) {
        if (removedTitles.length <= 3) {
          removedTitles.forEach((t) => antMessage.success(`已移除: ${removedTitles.join(', ')}`))
        } else {
          antMessage.success(`已移除: ${removedTitles.length}个视频`)
        }
      }

      return newItems
    })
  })
  const handleMoveCardToFirst = useMemoizedFn((item: RecItemType, data: IVideoCardData) => {
    setItems((items) => {
      const currentItem = items.find((x) => x.uniqId === item.uniqId)
      if (!currentItem) return items
      const index = items.indexOf(currentItem)

      const newItems = items.slice()
      // rm
      newItems.splice(index, 1)
      // insert
      const newIndex = newItems.findIndex((x) => x.api !== EApiType.Separator)
      newItems.splice(newIndex, 0, currentItem)

      return newItems
    })
  })
  useEmitterOn(sharedEmitter, 'remove-cards', ([uniqIds, titles, silent]) => handleRemoveCards(uniqIds, titles, silent))

  /**
   * footer for infinite scroll
   */
  const { ref: footerRef, inView: __footerInView } = useInView({
    root: infiniteScrollUseWindow ? null : scrollerRef?.current || null,
    rootMargin: `0px 0px ${window.innerHeight}px 0px`,
    onChange(inView) {
      if (inView) {
        debug('footerInView change to visible', inView)
        setTimeout(checkShouldLoadMore)
      }
    },
  })
  const footerInViewRef = useLatest(__footerInView)
  const footer = (
    <div ref={footerRef} className='grid-col-span-full flex items-center justify-center py-30px text-size-120%'>
      {!refreshing && (
        <>
          {hasMore ? (
            <>
              <IconParkOutlineLoading className='mr-10px size-40px animate-spin color-gate-primary' />
              加载中~
            </>
          ) : (
            <>没有更多了~</>
          )}
        </>
      )}
    </div>
  )

  const { useNarrowMode, style } = useSettingsSnapshot()
  const gridClassName = clsx(
    APP_CLS_GRID, // for customize css
    classNames.videoGrid,
    style.pureRecommend.useCustomGrid ? classNames.videoGridCustom : classNames.videoGridBiliFeed4,
    useNarrowMode && classNames.narrowMode, // 居中
    className,
  )

  const cardBorderCss = useCardBorderCss()

  const virtuosoGridContext: CustomGridContext = useMemo(() => {
    return {
      footerContent: footer,
      containerRef,
      gridClassName,
      // renderItem,
    }
  }, [footer, containerRef, gridClassName])

  // 总是 render grid, getColumnCount 依赖 grid columns
  const render = ({ gridChildren, gridSiblings }: { gridChildren?: ReactNode; gridSiblings?: ReactNode } = {}) => {
    return (
      <div ref={containerRef} className={clsx('min-h-100vh', classNames.videoGridContainer)} data-tab={tab}>
        <div className={gridClassName} data-tab={tab}>
          {gridChildren}
        </div>
        {gridSiblings}
      </div>
    )
  }

  // before mount
  if (beforeMount) {
    return render()
  }

  // Shit happens!
  if (refreshError) {
    console.error('RecGrid.refresh error:', refreshError.stack || refreshError)
    return render({ gridSiblings: <ErrorDetail tab={tab} err={refreshError} /> })
  }

  // skeleton loading
  if (refreshing && showSkeleton) {
    const cardCount = getGridRefreshCount()
    return render({
      gridChildren: Array.from({ length: cardCount })
        .fill(0)
        .map((_, index) => {
          return <VideoCard key={index} loading={true} tab={tab} />
        }),
    })
  }

  const renderItem = (item: RecItemTypeOrSeparator) => {
    if (item.api === EApiType.Separator) {
      return (
        <Divider key={item.uniqId} className={clsx('grid-col-span-full', clsGateVideoGridDivider)} orientation='left'>
          {item.content}
        </Divider>
      )
    } else {
      const index = usingVideoItems.findIndex((x) => x.uniqId === item.uniqId)
      const active = index === activeIndex

      return (
        <VideoCard
          key={item.uniqId}
          baseCss={[cardBorderCss, getActiveCardBorderCss(active)]}
          tab={tab}
          item={item}
          active={active}
          onRemoveCurrent={(item, data, silent) => handleRemoveCards([item.uniqId], [data.title], silent)}
          onMoveToFirst={handleMoveCardToFirst}
          onRefresh={refresh}
          emitter={videoCardEmitters[index]}
          sharedEmitter={sharedEmitter}
          cardDisplay={cardDisplay}
          multiSelecting={multiSelecting}
        />
      )
    }
  }

  // virtual grid
  if (ENABLE_VIRTUAL_GRID) {
    return (
      <div className={clsx(classNames.videoGridContainer, classNames.virtualGridEnabled)}>
        <VirtuosoGrid
          useWindowScroll
          data={usingItems}
          overscan={{ main: 20, reverse: 20 }}
          listClassName={gridClassName}
          computeItemKey={(index, item) => item.uniqId}
          components={gridComponents as CustomGridComponents} // 因为我改了 context required
          context={virtuosoGridContext}
          itemContent={(index, item) => renderItem(item)}
          endReached={() => checkShouldLoadMore()}
        />
        {!gridComponents.Footer && footer}
      </div>
    )
  }

  // plain dom
  return render({
    gridChildren: usingItems.map((item) => renderItem(item)),
    gridSiblings: footer,
  })
})
