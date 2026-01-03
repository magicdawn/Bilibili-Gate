/**
 * 推荐内容, 无限滚动
 */

import { useCreation, useEventListener, useLatest, useMemoizedFn, useMount, useUnmountedRef } from 'ahooks'
import { Divider } from 'antd'
import clsx from 'clsx'
import Emittery from 'emittery'
import { delay } from 'es-toolkit'
import ms from 'ms'
import {
  forwardRef,
  memo,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ForwardedRef,
  type ReactNode,
  type RefObject,
} from 'react'
import { useInView } from 'react-intersection-observer'
import { VirtuosoGrid } from 'react-virtuoso'
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
import { getServiceFromRegistry } from '$modules/rec-services/service-map.ts'
import { settings } from '$modules/settings'
import { isSafari } from '$ua'
import { ErrorDetail } from './error-detail'
import { useSetupGridState } from './rec-grid-state'
import { setGlobalGridItems } from './unsafe-window-export'
import { useRefresh } from './useRefresh'
import { useShortcut } from './useShortcut'
import * as scssClassNames from './video-grid.module.scss'
import {
  ENABLE_VIRTUAL_GRID,
  gridComponents,
  type CustomGridComponents,
  type CustomGridContext,
} from './virtuoso.config'
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

export const RecGrid = memo(
  forwardRef<RecGridRef, RecGridProps>(function (
    {
      className: propClassName,
      containerClassName: propContainerClassName,
      shortcutEnabled,
      tab,
      infiniteScrollUseWindow,
      onScrollToTop,
      scrollerRef,
    }: RecGridProps,
    ref: ForwardedRef<RecGridRef>,
  ) {
    const self = useCreation(() => new RecGridSelf(), [])
    const { useCustomGrid, gridDisplayMode, enableForceColumn, forceColumnCount } = useSnapshot(settings.grid)
    const { multiSelecting } = useSnapshot(multiSelectStore)
    const recSelf = useRecSelfContext()
    const { servicesRegistry } = recSelf
    const { refreshing } = recSelf.useStore()
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

    const goOutAt = useRef<number | undefined>()
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

    const loadMore = useMemoizedFn(async () => {
      if (
        unmountedRef.current ||
        recSelf.refreshing ||
        self.loadMoreRunning ||
        self.store.refreshError ||
        self.abortController.signal.aborted ||
        self.store.refreshTs < 0 || // refresh not started yet
        !self.store.hasMore
      ) {
        return
      }

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

    // fullList = videoList + separators
    const fullList = items
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
    const emitterCache = useMemo(() => new Map<string, VideoCardEmitter>(), [refreshTs])
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

    const { recSharedEmitter } = useRecSelfContext()
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

    const containerClassName = useMemo(
      () => clsx('min-h-100vh', scssClassNames.videoGridContainer, propContainerClassName),
      [propContainerClassName],
    )

    const gridClassName = useMemo(() => {
      return clsx(
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
    }, [gridDisplayMode, useCustomGrid, propClassName])
    const gridStyle = useMemo(() => {
      if (
        gridDisplayMode !== EGridDisplayMode.TwoColumnGrid &&
        useCustomGrid &&
        enableForceColumn &&
        forceColumnCount
      ) {
        return { '--col': forceColumnCount.toString() } as CSSProperties
      }
    }, [gridDisplayMode, useCustomGrid, enableForceColumn, forceColumnCount])

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
        <div data-tab={tab} ref={containerRef} className={containerClassName}>
          <div data-tab={tab} className={gridClassName} style={gridStyle}>
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
  }),
)
