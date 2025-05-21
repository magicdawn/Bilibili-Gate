import { useUnmount } from 'ahooks'
import { attempt, isEqual } from 'es-toolkit'
import { createContext } from 'react'
import { useRefStateBox, type RefStateBox } from '$common/hooks/useRefState'
import { TabConfig } from '$components/RecHeader/tab-config'
import { ETab } from '$components/RecHeader/tab-enum'
import { DisposableStackPolyfill } from '$modules/polyfills/explicit-resource-management'
import { getGridRefreshCount } from '$modules/rec-services'
import { getDynamicFeedServiceConfig, type DynamicFeedRecService } from '$modules/rec-services/dynamic-feed'
import { getFavServiceConfig, type FavRecService } from '$modules/rec-services/fav'
import { hotStore, type HotRecService } from '$modules/rec-services/hot'
import type { RecItemTypeOrSeparator } from '$define'
import {
  createServiceMap,
  getServiceFromRegistry,
  type FetcherOptions,
  type ServiceMap,
} from '../../modules/rec-services/service-map'
import { setGlobalGridItems } from './unsafe-window-export'
import type { Debugger } from 'debug'

export type OnRefresh = (reuse?: boolean) => void | Promise<void>

export const OnRefreshContext = createContext<OnRefresh | undefined>(undefined)
export function useOnRefreshContext() {
  return useContext(OnRefreshContext)
}

export function useRefresh({
  tab,
  servicesRegistry,
  debug,
  fetcher,
  preAction,
  postAction,
  updateExtraInfo,
}: {
  tab: ETab
  servicesRegistry: RefStateBox<Partial<ServiceMap>>
  debug: Debugger
  fetcher: (opts: FetcherOptions) => Promise<RecItemTypeOrSeparator[]>
  preAction?: () => void | Promise<void>
  postAction?: () => void | Promise<void>
  updateExtraInfo?: () => void
}) {
  const hasMoreBox = useRefStateBox(true)
  const itemsBox = useRefStateBox<RecItemTypeOrSeparator[]>([])
  useEffect(() => setGlobalGridItems(itemsBox.state), [itemsBox.state])

  const refreshingBox = useRefStateBox(false)
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

  const refresh: OnRefresh = useMemoizedFn(async (reuse = false) => {
    const start = performance.now()
    const stack = new DisposableStackPolyfill()

    // when already in refreshing
    if (refreshingBox.val) {
      /**
       * same tab but conditions changed
       */
      let s: DynamicFeedRecService | FavRecService | HotRecService | undefined

      const debugSameTabConditionsChange = () =>
        debug('refresh(): tab=%s [start], current refreshing, sametab but conditions change, abort existing', tab)

      // dynamic-feed: conditions changed
      if (
        tab === ETab.DynamicFeed &&
        (s = servicesRegistry.val[ETab.DynamicFeed]) &&
        !isEqual(s.config, getDynamicFeedServiceConfig())
      ) {
        debugSameTabConditionsChange()
        refreshAbortController.abort()
      }
      // fav: conditions changed
      else if (tab === ETab.Fav && (s = servicesRegistry.val[ETab.Fav]) && !isEqual(s.config, getFavServiceConfig())) {
        debugSameTabConditionsChange()
        refreshAbortController.abort()
      }

      // has sub-tabs
      else if (tab === ETab.Hot && (s = servicesRegistry.val[ETab.Hot]) && s.subtab !== hotStore.subtab) {
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
    refreshingBox.set(true)
    // refresh-result
    setError(undefined)
    itemsBox.set([])
    hasMoreBox.set(true)
    // defer actions
    stack.defer(() => {
      // refreshing
      refreshingBox.set(false)
      // hasMore
      hasMoreBox.set(getServiceFromRegistry(servicesRegistry, tab).hasMore)
    })

    await preAction?.()

    const _abortController = new AbortController()
    const _signal = _abortController.signal
    setRefreshAbortController(_abortController)

    const onError = (err: any) => {
      refreshingBox.set(false)
      hasMoreBox.set(false)
      console.error(err)
      setError(err)
    }
    const doFetch = async () => {
      let currentItems: RecItemTypeOrSeparator[] = []
      let err: any
      const fetcherOptions: FetcherOptions = {
        tab,
        abortSignal: _signal,
        servicesRegistry,
      }
      try {
        currentItems = await fetcher(fetcherOptions)
      } catch (e) {
        err = e
      }

      // explicit aborted
      if (_signal.aborted) {
        debug('refresh(): tab=%s [aborted], ignoring rest code', tab)
        return
      }

      if (err) return onError(err)
      itemsBox.set(currentItems)
      return true // mark success
    }

    let willRefresh: boolean
    const existingService = reuse ? servicesRegistry.val[tab] : undefined
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
      stack.defer(() => {
        setShowSkeleton(false)
      })
      willRefresh = true
    }

    if (willRefresh) {
      const [err, service] = attempt(() => createServiceMap[tab]({ existingService }))
      if (err) return onError(err)

      servicesRegistry.set({ ...servicesRegistry.val, [tab]: service })
      updateExtraInfo?.()

      const success = await doFetch()
      if (!success) return
    }

    stack.dispose() // Q: why not `using stack = new DisposableStackPolyfill()`  A: skip dispose when aborted
    await postAction?.()

    const cost = performance.now() - start
    debug('refresh(): tab=%s [success] cost %s ms', tab, cost.toFixed(0))
  })

  return {
    itemsBox,
    error,
    refresh,
    hasMoreBox,
    refreshingBox,
    refreshTsBox,
    refreshAbortController,
    showSkeleton,
    beforeMount,
  }
}
