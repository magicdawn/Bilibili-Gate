import { useUnmount } from 'ahooks'
import { attempt, attemptAsync, isEqual } from 'es-toolkit'
import { useEmitterOn } from '$common/hooks/useEmitter'
import { useRefStateBox } from '$common/hooks/useRefState'
import { TabConfig } from '$components/RecHeader/tab-config'
import { ETab } from '$components/RecHeader/tab-enum'
import { useRecContext, type RefreshFn } from '$components/Recommends/rec.shared'
import { getGridRefreshCount } from '$modules/rec-services'
import { getDynamicFeedServiceConfig, type DynamicFeedRecService } from '$modules/rec-services/dynamic-feed'
import { getFavServiceConfig, type FavRecService } from '$modules/rec-services/fav'
import { hotStore, type HotRecService } from '$modules/rec-services/hot'
import {
  createServiceMap,
  getServiceFromRegistry,
  type FetcherOptions,
  type ServiceMap,
} from '$modules/rec-services/service-map'
import { getSpaceUploadServiceConfig, type SpaceUploadService } from '$modules/rec-services/space-upload'
import type { RecItemTypeOrSeparator } from '$define'
import { setGlobalGridItems } from './unsafe-window-export'
import type { Debugger } from 'debug'

export function useRefresh({
  tab,
  servicesRegistry,
  debug,
  fetcher,
  preAction,
  postAction,
  updateViewFromService,
}: {
  tab: ETab
  servicesRegistry: Partial<ServiceMap>
  debug: Debugger
  fetcher: (opts: FetcherOptions) => Promise<RecItemTypeOrSeparator[]>
  preAction?: () => void | Promise<void>
  postAction?: () => void | Promise<void>
  updateViewFromService?: () => void
}) {
  const { recStore } = useRecContext()
  const hasMoreBox = useRefStateBox(true)
  const itemsBox = useRefStateBox<RecItemTypeOrSeparator[]>([])
  useEffect(() => setGlobalGridItems(itemsBox.state), [itemsBox.state])

  const refreshTsBox = useRefStateBox<number>(() => Date.now())
  const [refreshAbortController, setRefreshAbortController] = useState<AbortController>(() => new AbortController())
  const [showSkeleton, setShowSkeleton] = useState(false)
  const [error, setError] = useState<any>(undefined)

  const [beforeMount, setBeforeMount] = useState(true)
  useMount(() => {
    setBeforeMount(false)
    refresh(true) // Q: why `true`   A: when switch tab, set reuse to `true`
  })
  // switch away
  useUnmount(() => {
    refreshAbortController.abort()
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
        refreshAbortController.abort()
      }
      // fav: conditions changed
      else if (tab === ETab.Fav && (s = servicesRegistry[ETab.Fav]) && !isEqual(s.config, getFavServiceConfig())) {
        debugSameTabConditionsChange()
        refreshAbortController.abort()
      }
      // space-upload: conditions changed
      else if (
        tab === ETab.SpaceUpload &&
        (s = servicesRegistry[ETab.SpaceUpload]) &&
        !isEqual(s.config, getSpaceUploadServiceConfig())
      ) {
        debugSameTabConditionsChange()
        refreshAbortController.abort()
      }

      // has sub-tabs
      else if (tab === ETab.Hot && (s = servicesRegistry[ETab.Hot]) && s.subtab !== hotStore.subtab) {
        debug('refresh(): tab=%s [start], current refreshing, sametab but subtab changed, abort existing', tab)
        refreshAbortController.abort()
      }

      // prevent same tab `refresh()`
      else {
        debug('refresh() tab=%s [start], current refreshing, prevent same tab refresh()', tab)
        return
      }
    } else {
      debug('refresh(): tab=%s [start]', tab)
    }

    // refresh-state
    refreshTsBox.set(Date.now())
    recStore.refreshing = true
    // refresh-result
    setError(undefined)
    itemsBox.set([])
    hasMoreBox.set(true)

    await preAction?.()

    const _abortController = new AbortController()
    const _signal = _abortController.signal
    setRefreshAbortController(_abortController)

    function _onAny() {
      recStore.refreshing = false // refreshing
      setShowSkeleton(false)
    }
    function onError(err: any) {
      _onAny()
      hasMoreBox.set(false)
      console.error(err)
      setError(err)
    }
    function onSuccess() {
      _onAny()
      hasMoreBox.set(getServiceFromRegistry(servicesRegistry, tab).hasMore)
    }

    async function doFetch() {
      const [err, currentItems] = await attemptAsync(() =>
        fetcher({
          tab,
          abortSignal: _signal,
          servicesRegistry,
        }),
      )
      // explicit aborted
      if (_signal.aborted) return debug('refresh(): tab=%s [aborted], ignoring rest code', tab)
      if (err) return onError(err)

      itemsBox.set(currentItems ?? [])
      return true // mark success
    }

    let willRefresh: boolean
    const existingService = reuse ? servicesRegistry[tab] : undefined
    // reuse existing service
    if (existingService) {
      // cache
      existingService.restore()
      itemsBox.set(existingService.qs.bufferQueue.slice(0, getGridRefreshCount()))
      const success = !!(await doFetch())
      // swr?
      willRefresh = success && !!TabConfig[tab].swr
    }
    // create new service
    else {
      setShowSkeleton(true)
      willRefresh = true
    }

    if (willRefresh) {
      const [err, service] = attempt(() => createServiceMap[tab]({ existingService }))
      if (err) return onError(err)
      // TODO: type safe
      servicesRegistry[tab] = service! as any // attempt 使用 null
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

  return {
    itemsBox,
    error,
    refresh,
    hasMoreBox,
    refreshTsBox,
    refreshAbortController,
    showSkeleton,
    beforeMount,
  }
}
