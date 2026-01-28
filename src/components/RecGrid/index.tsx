import { useCreation, useEventListener, useLatest, useMemoizedFn, useMount, useUnmountedRef } from 'ahooks'
import { Divider } from 'antd'
import clsx, { type ClassValue } from 'clsx'
import Emittery from 'emittery'
import { delay } from 'es-toolkit'
import ms from 'ms'
import {
  memo,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type Ref,
  type RefObject,
} from 'react'
import { useInView } from 'react-intersection-observer'
import { proxy, ref, useSnapshot } from 'valtio'
import { APP_CLS_GRID, baseDebug } from '$common'
import { useEmitterOn } from '$common/hooks/useEmitter'
import { ETab } from '$components/RecHeader/tab-enum'
import { useRecSelfContext, type RefreshFn } from '$components/Recommends/rec.shared'
import { clsGateVideoGridDivider } from '$components/shared.module.scss'
import { VideoCard } from '$components/VideoCard'
import { getActiveCardBorderCss, useCardBorderCss } from '$components/VideoCard/card-border-css'
import { EApiType } from '$define/index.shared'
import { EGridDisplayMode } from '$enums'
import { $headerHeight } from '$header'
import { antMessage, antNotification } from '$modules/antd'
import { filterRecItems } from '$modules/filter'
import { multiSelectStore } from '$modules/multi-select/store'
import { concatRecItems, getGridRefreshCount, refreshForGrid } from '$modules/rec-services'
import { querySupportsLoadToEnd } from '$modules/rec-services/_shared/copy-bvid-buttons'
import { getServiceFromRegistry } from '$modules/rec-services/service-map.ts'
import { settings } from '$modules/settings'
import { isSafari } from '$ua'
import { ErrorDetail } from './error-detail'
import { useSetupGridState } from './rec-grid-state'
import { setGlobalGridItems } from './unsafe-window-export'
import { useRefresh } from './useRefresh'
import { useShortcut } from './useShortcut'
import * as gridClassNames from './video-grid.module.scss'
import type { ArgsProps } from 'antd/es/notification'
import type { VideoCardEmitter, VideoCardEvents } from '$components/VideoCard/index.shared'
import type { RecItemType, RecItemTypeOrSeparator } from '$define'
import type { IVideoCardData } from '$modules/filter/normalize'

const debug = baseDebug.extend('components:RecGrid')

export type RecGridRef = { refresh: RefreshFn }

export type RecGridProps = {
  containerClassName?: string
  className?: string
  shortcutEnabled: boolean
  infiniteScrollUseWindow: boolean
  onScrollToTop?: () => void
  scrollerRef?: RefObject<HTMLElement | null>
  tab: ETab
  direction?: 'left' | 'right' // how to get to current tab, moved left or right
  ref?: Ref<RecGridRef>
}

const clsGridColSpanFull = 'grid-col-span-full'

// like `this` in Class Component, but it's for Function Component
export class RecGridSelf {
  // render state
  // should be private, but I'm too lazy to add getters and refactor
  store = proxy({
    refreshTs: -1,
    showSkeleton: false,
    hasMore: true,
    refreshError: undefined as any,
    items: [] as RecItemTypeOrSeparator[],
  })

  useStore = () => {
    // oxlint-disable-next-line react-hooks/rules-of-hooks
    return useSnapshot(this.store)
  }

  setStore = (payload: Partial<RecGridSelf['store']>) => {
    const wrapRefKeys: (keyof RecGridSelf['store'])[] = ['items', 'refreshError']
    for (const key of wrapRefKeys) {
      if (typeof payload[key] === 'object') {
        payload[key] = ref(payload[key])
      }
    }
    Object.assign(this.store, payload)
  }

  loadedPage = 0
  abortController = new AbortController()

  private loadMoreLocker: Record<number, boolean> = {}
  isLocked = (lockKey: number) => !!this.loadMoreLocker[lockKey]
  lock = (lockKey: number) => void (this.loadMoreLocker = { [lockKey]: true })
  unlock = (lockKey: number) => void (this.loadMoreLocker[lockKey] = false)
  get loadMoreRunning() {
    return this.isLocked(this.store.refreshTs)
  }
}

export const RecGrid = memo(function RecGrid({
  className: propClassName,
  containerClassName: propContainerClassName,
  shortcutEnabled,
  tab,
  infiniteScrollUseWindow,
  onScrollToTop,
  scrollerRef,
  ref,
}: RecGridProps) {
  // rec-shared
  const recSelf = useRecSelfContext()
  const { servicesRegistry, recSharedEmitter } = recSelf
  const { refreshing } = recSelf.useStore()
  // rec-grid
  const self = useCreation(() => new RecGridSelf(), [])
  const { useCustomGrid, gridDisplayMode, enableForceColumn, forceColumnCount, cardMinWidth } = useSnapshot(
    settings.grid,
  )
  const { multiSelecting } = useSnapshot(multiSelectStore)
  const unmountedRef = useUnmountedRef()
  useSetupGridState()

  const updateViewFromService = useMemoizedFn(() => {
    if (unmountedRef.current) return
    recSelf.setStore({
      tabbarView: servicesRegistry[tab]?.tabbarView,
      sidebarView: servicesRegistry[tab]?.sidebarView,
    })
  })
  useMount(updateViewFromService)

  const preAction = useMemoizedFn(() => {
    clearActiveIndex()
    updateViewFromService()
    onScrollToTop?.()
  })
  const postAction = useMemoizedFn(() => {
    clearActiveIndex()
    updateViewFromService()
    self.loadedPage = 1
    checkShouldLoadMore()
  })
  const { refresh } = useRefresh({
    tab,
    debug,
    fetcher: refreshForGrid,
    preAction,
    postAction,
    updateViewFromService,
    self,
  })

  useImperativeHandle(ref, () => ({ refresh }), [refresh])

  const { items, hasMore, refreshError, refreshTs, showSkeleton } = self.useStore()
  useEffect(() => setGlobalGridItems(items), [items])

  const goOutAt = useRef<number | undefined>(undefined)
  useEventListener(
    'visibilitychange',
    (_e) => {
      const visible = document.visibilityState === 'visible'
      if (!visible) {
        goOutAt.current = Date.now()
        return
      }

      if (recSelf.refreshing) return
      if (self.loadMoreRunning) return

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

  const loadMorePrecheck = useMemoizedFn(() => {
    if (
      unmountedRef.current ||
      // rec-shared
      recSelf.refreshing ||
      // rec-grid
      self.abortController.signal.aborted ||
      self.loadMoreRunning ||
      self.store.refreshTs < 0 || // refresh not started yet
      self.store.refreshError ||
      !self.store.hasMore
    ) {
      return false
    }
    return true
  })
  const loadMore = useMemoizedFn(async () => {
    if (!loadMorePrecheck()) return

    const startingRefreshTs = self.store.refreshTs
    self.lock(startingRefreshTs)

    let newItems = self.store.items
    let newHasMore = true
    let err: any
    try {
      const service = getServiceFromRegistry(servicesRegistry, tab)
      let more = (await service.loadMore(self.abortController.signal)) || []
      more = filterRecItems(more, tab)
      newItems = concatRecItems(newItems, more)
      newHasMore = service.hasMore
    } catch (e) {
      err = e
    }
    if (err) {
      self.unlock(startingRefreshTs)
      antNotification.error({
        title: '加载失败',
        description: err.message || err.stack,
      })
      throw err
    }

    // loadMore 发出请求了, 但稍候重新刷新了, setItems 以及后续操作应该 abort
    {
      const currentRefreshTs = self.store.refreshTs
      if (startingRefreshTs !== currentRefreshTs) {
        debug('loadMore: skip update for mismatch refreshTs, %o != %o', startingRefreshTs, currentRefreshTs)
        self.unlock(startingRefreshTs)
        return
      }
    }

    self.loadedPage++
    debug('loadMore: loadedPage(%s) len(%s -> %s)', self.loadedPage, self.store.items.length, newItems.length)
    self.setStore({ hasMore: newHasMore, items: newItems })
    self.unlock(startingRefreshTs)

    // check
    checkShouldLoadMore()
  })

  const loadToEnd = useMemoizedFn(async () => {
    /* #region precheck */
    const notifyKey = 'RecGrid:loadToEnd'
    const notifyErrorArgs: Partial<ArgsProps> = { key: notifyKey + ':error', title: '加载全部', duration: 15 }
    const notifySuccessArgs: Partial<ArgsProps> = { title: '加载全部' }
    const error = (description: ReactNode) => {
      antNotification.error({ ...notifyErrorArgs, description })
      throw new Error('loadToEnd error', { cause: description })
    }

    if (!querySupportsLoadToEnd()) return error('当前 Tab 不支持加载全部')
    if (self.store.refreshError) return error('预检查失败: 先前错误')
    // consider `!hasMore` as a success case
    if (!self.store.hasMore) {
      return antNotification.success({ ...notifySuccessArgs, description: '没有更多了' })
    }
    /* #endregion */

    while (!loadMorePrecheck()) await delay(500) // wait refresh + loadMore  complete
    while (loadMorePrecheck()) await loadMore()
    antNotification.success({ ...notifySuccessArgs, description: '已完成' })
  })
  useEmitterOn(recSharedEmitter, 'load-to-end', loadToEnd)

  // fullList = videoList + separators
  const fullList = items
  const videoList = useMemo(() => fullList.filter((x) => x.api !== EApiType.Separator), [fullList])

  // the grid: `.video-grid`
  const gridRef = useRef<HTMLDivElement | null>(null)

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
  const videoCardEmitterCache = useMemo(() => new Map<string, VideoCardEmitter>(), [refreshTs])
  const videoCardEmitters = useMemo(() => {
    return videoList.map(({ uniqId }) => {
      const cacheKey = uniqId
      return (
        videoCardEmitterCache.get(cacheKey) ||
        (() => {
          const instance = new Emittery<VideoCardEvents>()
          videoCardEmitterCache.set(cacheKey, instance)
          return instance
        })()
      )
    })
  }, [videoList])

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
    gridRef,
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
  const modifyItems = (fn: (items: RecItemTypeOrSeparator[]) => RecItemTypeOrSeparator[]) => {
    self.setStore({ items: fn(self.store.items) })
  }
  const handleRemoveCards = useMemoizedFn((uniqIds: string[], titles?: string[], silent?: boolean) => {
    modifyItems((items) => {
      const newItems = items.slice()
      const removedTitles: string[] = []

      for (const [i, uniqId] of uniqIds.entries()) {
        const index = newItems.findIndex((x) => x.uniqId === uniqId)
        if (index === -1) continue

        newItems.splice(index, 1)
        const title = titles?.[i]
        if (title) removedTitles.push(title)

        if (tab === ETab.Watchlater) {
          servicesRegistry[tab]?.decreaseTotal()
        }
        if (tab === ETab.Fav) {
          servicesRegistry[tab]?.decreaseTotal()
        }
      }

      if (!silent && removedTitles.length) {
        if (removedTitles.length <= 3) {
          removedTitles.forEach((_t) => antMessage.success(`已移除: ${removedTitles.join(', ')}`))
        } else {
          antMessage.success(`已移除: ${removedTitles.length}个视频`)
        }
      }

      return newItems
    })
  })
  const handleMoveCardToFirst = useMemoizedFn((item: RecItemType, _data: IVideoCardData) => {
    modifyItems((items) => {
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
        checkShouldLoadMore()
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

  // it's a `@container` query root
  const containerClassName = clsx('min-h-100vh @container-inline-size', propContainerClassName)

  type StyleConfig = { className?: string; style?: CSSProperties }
  const gridStyleConfig: StyleConfig = useMemo(() => {
    const {
      videoGrid,
      videoGridBiliFeed4,
      videoGridCustom,
      videoGridAddonCenterEmpty,
      gridTemplateColumnsUsingVarCol,
      gridTemplateColumnsUsingCardMinWidth,
      narrowMode,
    } = gridClassNames

    // 分支
    // - videoGridBiliFeed4
    // - videoGridCustom
    //   - forceColumn
    //   - cardMinWidth
    //
    // displayMode
    //  - TwoColumn
    //  - List
    //  - CenterEmpty: Normal + addonCenterEmpty
    //  - Normal

    const clsGridTemplateColumns =
      useCustomGrid && !(enableForceColumn && forceColumnCount) && gridDisplayMode !== EGridDisplayMode.TwoColumnGrid
        ? gridTemplateColumnsUsingCardMinWidth
        : gridTemplateColumnsUsingVarCol

    const baseClass: ClassValue = [
      APP_CLS_GRID, // for customize css
      videoGrid,
      clsGridTemplateColumns,
      useCustomGrid ? videoGridCustom : videoGridBiliFeed4,
    ]

    const renderClassName = (...more: ClassValue[]) => clsx(baseClass, ...more, propClassName)

    // 双列
    if (gridDisplayMode === EGridDisplayMode.TwoColumnGrid) {
      return { className: renderClassName(narrowMode) }
    }

    // 中空
    if (gridDisplayMode === EGridDisplayMode.CenterEmptyGrid) {
      baseClass.push(videoGridAddonCenterEmpty)
    }

    // bili-feed4
    if (!useCustomGrid) {
      return { className: renderClassName() }
    }

    // Bilibili-Gate custom
    if (enableForceColumn && forceColumnCount) {
      return { className: renderClassName(), style: { '--col': forceColumnCount.toString() } }
    } else {
      return { className: renderClassName(), style: { '--card-min-width': `${cardMinWidth}px` } }
    }
  }, [gridClassNames, useCustomGrid, gridDisplayMode, enableForceColumn, forceColumnCount, cardMinWidth, propClassName])

  const cardBorderCss = useCardBorderCss()

  // 总是 render grid, getColumnCount 依赖 grid columns
  const render = ({ gridChildren, gridSiblings }: { gridChildren?: ReactNode; gridSiblings?: ReactNode } = {}) => {
    return (
      <div data-tab={tab} className={containerClassName}>
        <div data-tab={tab} ref={gridRef} {...gridStyleConfig}>
          {gridChildren}
        </div>
        {gridSiblings}
      </div>
    )
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
