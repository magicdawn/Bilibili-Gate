/**
 * 推荐内容, 无限滚动
 */

import { useEventListener, useLatest, usePrevious, useUnmountedRef } from 'ahooks'
import { Divider } from 'antd'
import Emittery from 'emittery'
import { delay, isEqual } from 'es-toolkit'
import ms from 'ms'
import { useInView } from 'react-intersection-observer'
import { VirtuosoGrid } from 'react-virtuoso'
import { useSnapshot } from 'valtio'
import { APP_CLS_GRID, baseDebug } from '$common'
import { useEmitterOn } from '$common/hooks/useEmitter'
import { useRefStateBox, type RefStateBox } from '$common/hooks/useRefState'
import { clsGateVideoGridDivider } from '$common/shared.module.scss'
import { useCurrentUsingTab, useSortedTabKeys } from '$components/RecHeader/tab'
import { ETab } from '$components/RecHeader/tab-enum'
import { useRecommendContext, type RefreshFn } from '$components/Recommends/rec.shared'
import { VideoCard } from '$components/VideoCard'
import { getActiveCardBorderCss, useCardBorderCss } from '$components/VideoCard/card-border-css'
import { EApiType } from '$define/index.shared'
import { $headerHeight } from '$header'
import { antMessage } from '$modules/antd'
import { filterRecItems } from '$modules/filter'
import { multiSelectStore } from '$modules/multi-select/store'
import { concatThenUniq, getGridRefreshCount, refreshForGrid } from '$modules/rec-services'
import { getServiceFromRegistry, type ServiceMap } from '$modules/rec-services/service-map.ts'
import { settings } from '$modules/settings'
import { isSafari } from '$ua'
import type { VideoCardEmitter, VideoCardEvents } from '$components/VideoCard/index.shared'
import type { RecItemType, RecItemTypeOrSeparator } from '$define'
import type { IVideoCardData } from '$modules/filter/normalize'
import * as scssClassNames from '../video-grid.module.scss'
import { EGridDisplayMode } from './display-mode'
import { ErrorDetail } from './error-detail'
import { useRefresh } from './useRefresh'
import { useShortcut } from './useShortcut'
import { ENABLE_VIRTUAL_GRID, gridComponents } from './virtuoso.config'
import type { CustomGridComponents, CustomGridContext } from './virtuoso.config'
import type { ForwardedRef, ReactNode } from 'react'

const debug = baseDebug.extend('components:RecGrid')

/**
 * Grid 需要修改并向外传播的状态
 */
export type GridExternalState = {
  /** view for which tab */
  viewTab: ETab | undefined
  tabbarView: ReactNode
  sidebarView: ReactNode
}

export const initGridExternalState = (): GridExternalState => ({
  viewTab: undefined,
  tabbarView: undefined,
  sidebarView: undefined,
})

export type RecGridRef = { refresh: RefreshFn }

export type RecGridProps = {
  containerClassName?: string
  className?: string
  shortcutEnabled: boolean
  infiniteScrollUseWindow: boolean
  onScrollToTop?: () => void
  scrollerRef?: RefObject<HTMLElement | null>
  onSyncExternalState?: (state: GridExternalState) => void
}

const clsGridColSpanFull = 'grid-col-span-full'

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
  className: propClassName,
  containerClassName: propContainerClassName,
  shortcutEnabled,
  tab,
  handlersRef,
  servicesRegistry,
  infiniteScrollUseWindow,
  onScrollToTop,
  scrollerRef,
  onSyncExternalState,
}: RecGridProps & {
  tab: ETab
  direction?: 'left' | 'right' // how to get to current tab, moved left or right
  handlersRef?: ForwardedRef<RecGridRef>
  servicesRegistry: RefStateBox<Partial<ServiceMap>>
}) {
  const unmountedRef = useUnmountedRef()
  const { useCustomGrid, gridDisplayMode } = useSnapshot(settings.grid)
  const { multiSelecting } = useSnapshot(multiSelectStore)
  const { recStore } = useRecommendContext()
  const { refreshing } = useSnapshot(recStore)

  // 已加载完成的 load call count, 类似 page
  const loadCompleteCountBox = useRefStateBox(0)

  const [tabbarView, setTabbarView] = useState<ReactNode>(() => servicesRegistry.val[tab]?.tabbarView)
  const [sidebarView, setSidebarView] = useState<ReactNode>(() => servicesRegistry.val[tab]?.sidebarView)
  const updateViewFromService = useMemoizedFn(() => {
    setTabbarView(servicesRegistry.val[tab]?.tabbarView)
    setSidebarView(servicesRegistry.val[tab]?.sidebarView)
  })

  const preAction = useMemoizedFn(() => {
    clearActiveIndex()
    updateViewFromService()
    onScrollToTop?.()
  })
  const postAction = useMemoizedFn(() => {
    clearActiveIndex()
    updateViewFromService()
    loadCompleteCountBox.set(1)
    setTimeout(checkShouldLoadMore)
  })

  const {
    itemsBox,
    error: refreshError,
    refresh,
    hasMoreBox,
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
    updateViewFromService,
  })

  useImperativeHandle(handlersRef, () => ({ refresh }), [refresh])
  const hasMore = hasMoreBox.state

  // sync to context
  // TODO: move to recStore
  useEffect(() => {
    if (unmountedRef.current) return
    onSyncExternalState?.({ tabbarView, sidebarView, viewTab: tab })
  }, [onSyncExternalState, refresh, tabbarView, sidebarView])

  const goOutAt = useRef<number | undefined>()
  useEventListener(
    'visibilitychange',
    (e) => {
      const visible = document.visibilityState === 'visible'
      if (!visible) {
        goOutAt.current = Date.now()
        return
      }

      if (recStore.refreshing) return
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
  type LockKey = number
  const loadMoreLocker = useRef<Record<LockKey, boolean>>({})
  const lock = useCallback((lockKey: LockKey) => (loadMoreLocker.current = { [lockKey]: true }), [])
  const unlock = useCallback((lockKey: LockKey) => (loadMoreLocker.current[lockKey] = false), [])
  const isLocked = useMemoizedFn((lockKey: LockKey) => !!loadMoreLocker.current[lockKey])

  const loadMore = useMemoizedFn(async () => {
    if (unmountedRef.current) return
    if (!hasMoreBox.val) return
    if (refreshAbortController.signal.aborted) return
    if (recStore.refreshing) return

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

  // fullList = videoList + separators
  const fullList = itemsBox.state
  const videoList = useMemo(() => fullList.filter((x) => x.api !== EApiType.Separator), [fullList])

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

  // emitters
  const emitterCache = useMemo(() => new Map<string, VideoCardEmitter>(), [refreshTsBox.state])
  const videoCardEmitters = useMemo(() => {
    return videoList.map(({ uniqId }) => {
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
  }, [videoList])

  const { recSharedEmitter } = useRecommendContext()
  const [activeLargePreviewUniqId, setActiveLargePreviewUniqId] = useState<string | undefined>(undefined)
  useEmitterOn(recSharedEmitter, 'show-large-preview', setActiveLargePreviewUniqId)
  const activeLargePreviewItemIndex = useMemo(() => {
    if (!activeLargePreviewUniqId) return
    return videoList.findIndex((item) => item.uniqId === activeLargePreviewUniqId)
  }, [fullList, activeLargePreviewUniqId])

  // 快捷键
  const { activeIndex, clearActiveIndex } = useShortcut({
    enabled: shortcutEnabled,
    refresh,
    maxIndex: videoList.length - 1,
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
  useEmitterOn(recSharedEmitter, 'remove-cards', ([uniqIds, titles, silent]) =>
    handleRemoveCards(uniqIds, titles, silent),
  )

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
    <div
      ref={footerRef}
      className={clsx(clsGridColSpanFull, 'flex items-center justify-center py-30px text-size-120%')}
    >
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

  const containerClassName = clsx('min-h-100vh', scssClassNames.videoGridContainer, propContainerClassName)

  const gridClassName = clsx(
    // base
    APP_CLS_GRID, // for customize css
    scssClassNames.videoGrid,
    // variants
    useCustomGrid ? scssClassNames.videoGridCustom : scssClassNames.videoGridBiliFeed4,
    gridDisplayMode === EGridDisplayMode.TwoColumnGrid
      ? scssClassNames.narrowMode // 双列
      : gridDisplayMode === EGridDisplayMode.CenterEmptyGrid
        ? scssClassNames.videoGridCenterEmpty // 中空
        : undefined,
    // from props
    propClassName,
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
      <div ref={containerRef} className={containerClassName} data-tab={tab}>
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
        <Divider
          key={item.uniqId}
          className={clsx(clsGridColSpanFull, clsGateVideoGridDivider)}
          orientation='horizontal'
          titlePlacement='left'
        >
          {item.content}
        </Divider>
      )
    } else {
      const index = videoList.findIndex((x) => x.uniqId === item.uniqId)
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
          refresh={refresh}
          emitter={videoCardEmitters[index]}
          recSharedEmitter={recSharedEmitter}
          gridDisplayMode={gridDisplayMode}
          multiSelecting={multiSelecting}
        />
      )
    }
  }

  // virtual grid
  if (ENABLE_VIRTUAL_GRID) {
    return (
      <div className={clsx(scssClassNames.videoGridContainer, scssClassNames.virtualGridEnabled)}>
        <VirtuosoGrid
          useWindowScroll
          data={fullList}
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
    gridChildren: (
      <>
        {fullList.map(renderItem)}
        {footer}
      </>
    ),
  })
})
