import { useUnmount } from 'ahooks'
import { attempt, attemptAsync, isEqual } from 'es-toolkit'
import { useEmitterOn } from '$common/hooks/useEmitter'
import { TabConfig } from '$components/RecHeader/tab-config'
import { ETab } from '$components/RecHeader/tab-enum'
import { useRecContext, type RefreshFn } from '$components/Recommends/rec.shared'
import { getGridRefreshCount } from '$modules/rec-services'
import { getDynamicFeedServiceConfig, type DynamicFeedRecService } from '$modules/rec-services/dynamic-feed'
import { getFavServiceConfig, type FavRecService } from '$modules/rec-services/fav'
import { hotStore, type HotRecService } from '$modules/rec-services/hot'
import { createServiceMap, getServiceFromRegistry, type FetcherOptions } from '$modules/rec-services/service-map'
import { getSpaceUploadServiceConfig, type SpaceUploadService } from '$modules/rec-services/space-upload'
import type { RecItemTypeOrSeparator } from '$define'
import type { RecGridSelf } from '.'
import type { Debugger } from 'debug'

export function useRefresh({
  tab,
  debug,
  fetcher,
  preAction,
  postAction,
  updateViewFromService,
  self,
}: {
  tab: ETab
  debug: Debugger
  fetcher: (opts: FetcherOptions) => Promise<RecItemTypeOrSeparator[]>
  preAction?: () => void | Promise<void>
  postAction?: () => void | Promise<void>
  updateViewFromService?: () => void
  self: RecGridSelf
}) {
  const { recStore, servicesRegistry } = useRecContext()

  useMount(() => {
    // Q: why `true`   A: when switch tab, set reuse to `true`
    refresh(true)
  })
  // switch away
  useUnmount(() => {
    self.abortController.abort()
  })

  const refresh: RefreshFn = useMemoizedFn(async (reuse = false) => {
    const start = performance.now()

    // when already in refreshing
    if (recStore.refreshing) {
      /**
       * same tab but conditions changed
       */
      let s: DynamicFeedRecService | FavRecService | HotRecService | SpaceUploadService | undefined
      const debugSameTabConditionsChange = () =>
        debug('refresh(): tab=%s [start], current refreshing, sametab but conditions change, abort existing', tab)

      // dynamic-feed: conditions changed
      if (
        tab === ETab.DynamicFeed &&
        (s = servicesRegistry[ETab.DynamicFeed]) &&
        !isEqual(s.config, getDynamicFeedServiceConfig())
      ) {
        debugSameTabConditionsChange()
        self.abortController.abort()
      }
      // fav: conditions changed
      else if (tab === ETab.Fav && (s = servicesRegistry[ETab.Fav]) && !isEqual(s.config, getFavServiceConfig())) {
        debugSameTabConditionsChange()
        self.abortController.abort()
      }
      // space-upload: conditions changed
      else if (
        tab === ETab.SpaceUpload &&
        (s = servicesRegistry[ETab.SpaceUpload]) &&
        !isEqual(s.config, getSpaceUploadServiceConfig())
      ) {
        debugSameTabConditionsChange()
        self.abortController.abort()
      }

      // has sub-tabs
      else if (tab === ETab.Hot && (s = servicesRegistry[ETab.Hot]) && s.subtab !== hotStore.subtab) {
        debug('refresh(): tab=%s [start], current refreshing, sametab but subtab changed, abort existing', tab)
        self.abortController.abort()
      }

      // prevent same tab `refresh()`
      else {
        debug('refresh() tab=%s [start], current refreshing, prevent same tab refresh()', tab)
        return
      }
    } else {
      debug('refresh(): tab=%s [start]', tab)
    }

    // refresh start
    recStore.refreshing = true
    self.setStore({ refreshError: undefined, hasMore: true, items: [], refreshTs: Date.now() })
    const abortController = new AbortController()
    const { signal } = abortController
    self.abortController = abortController

    await preAction?.()

    function _onAny() {
      recStore.refreshing = false // refreshing
      self.setStore({ showSkeleton: false })
    }
    function onError(err: any) {
      _onAny()
      self.setStore({ refreshError: err })
      console.error(err)
    }
    function onSuccess() {
      _onAny()
      self.setStore({ hasMore: getServiceFromRegistry(servicesRegistry, tab).hasMore })
    }

    async function doFetch() {
      const [err, currentItems] = await attemptAsync(() =>
        fetcher({
          tab,
          abortSignal: signal,
          servicesRegistry,
        }),
      )
      // explicit aborted
      if (signal.aborted) return debug('refresh(): tab=%s [aborted], ignoring rest code', tab)
      if (err) return onError(err)

      self.setStore({ items: currentItems ?? [] })
      return true // mark success
    }

    let willRefresh: boolean
    const existingService = reuse ? servicesRegistry[tab] : undefined
    // reuse existing service
    if (existingService) {
      // cache
      existingService.restore()
      self.setStore({ items: existingService.qs.bufferQueue.slice(0, getGridRefreshCount()) })
      const success = !!(await doFetch())
      // swr?
      willRefresh = success && !!TabConfig[tab].swr
    }
    // create new service
    else {
      self.setStore({ showSkeleton: true })
      willRefresh = true
    }

    if (willRefresh) {
      const [err, service] = attempt(() => createServiceMap[tab]({ existingService }))
      if (err) return onError(err)

      servicesRegistry[tab] = service as any
      updateViewFromService?.()

      const success = await doFetch()
      if (!success) return
    }

    onSuccess()
    await postAction?.()
    const cost = performance.now() - start
    debug('refresh(): tab=%s [success] cost %s ms', tab, cost.toFixed(0))
  })

  // listen for `refresh` event
  const { recSharedEmitter } = useRecContext()
  useEmitterOn(recSharedEmitter, 'refresh', refresh)

  return { refresh }
}
