import { useUnmount } from 'ahooks'
import { attempt, attemptAsync, isEqual } from 'es-toolkit'
import { useEmitterOn } from '$common/hooks/useEmitter'
import { TabConfig } from '$components/RecHeader/tab-config'
import { EHotSubTab, ETab } from '$components/RecHeader/tab-enum'
import { useRecSelfContext, type RefreshFn } from '$components/Recommends/rec.shared'
import { getGridRefreshCount } from '$modules/rec-services'
import { getDynamicFeedServiceConfig, type DynamicFeedRecService } from '$modules/rec-services/dynamic-feed'
import { getFavServiceConfig, type FavRecService } from '$modules/rec-services/fav'
import { hotStore, type HotRecService } from '$modules/rec-services/hot'
import { RankRecService } from '$modules/rec-services/hot/rank'
import { rankStore } from '$modules/rec-services/hot/rank/store'
import {
  createServiceMap,
  getServiceFromRegistry,
  type FetcherOptions,
  type ServiceMap,
} from '$modules/rec-services/service-map'
import { getSpaceUploadServiceConfig, type SpaceUploadService } from '$modules/rec-services/space-upload'
import type { Debugger } from 'obug'
import type { RecItemTypeOrSeparator } from '$define'
import type { RecGridSelf } from '.'

/**
 * refresh for same tab, but conditions changed
 */
function checkIsSameTabButConditionsChanged(tab: ETab, servicesRegistry: Partial<ServiceMap>) {
  let s: DynamicFeedRecService | FavRecService | HotRecService | SpaceUploadService | undefined
  switch (tab) {
    case ETab.DynamicFeed:
      s = servicesRegistry[ETab.DynamicFeed]
      return !isEqual(s?.config, getDynamicFeedServiceConfig())

    case ETab.Fav:
      s = servicesRegistry[ETab.Fav]
      return !isEqual(s?.config, getFavServiceConfig())

    case ETab.Hot:
      s = servicesRegistry[ETab.Hot]
      if (s?.subtab !== hotStore.subtab) return true // subtab changed
      if (
        // rank slug changed
        s.subtab === EHotSubTab.Rank &&
        s.service instanceof RankRecService &&
        s.service.rankTab.slug !== rankStore.slug
      ) {
        return true
      }
      return false

    case ETab.SpaceUpload:
      s = servicesRegistry[ETab.SpaceUpload]
      return !isEqual(s?.config, getSpaceUploadServiceConfig())

    default:
      return false
  }
}

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
  const recSelf = useRecSelfContext()
  const { servicesRegistry } = recSelf

  useMount(() => {
    // Q: why `true`   A: when switch tab, set reuse to `true`
    refresh(true)
  })
  // switch away
  useUnmount(() => {
    self.abortController.abort()
  })

  const refresh: RefreshFn = useMemoizedFn(async (reuse: boolean = false) => {
    const isSameTabRefreshing = recSelf.refreshing && recSelf.refreshingTab === tab
    if (isSameTabRefreshing) {
      if (checkIsSameTabButConditionsChanged(tab, servicesRegistry)) {
        debug('refresh(): tab=%s [start], current refreshing, sametab but conditions change, abort existing', tab)
        self.abortController.abort()
      } else {
        // prevent same tab `refresh()`
        debug('refresh() tab=%s [start], current refreshing, prevent same tab refresh()', tab)
        return
      }
    } else {
      debug('refresh(): tab=%s [start]', tab)
    }

    // refresh start
    const start = performance.now()
    recSelf.setStore({ refreshing: true, refreshingTab: tab })
    self.setStore({ refreshError: undefined, hasMore: true, items: [], refreshTs: Date.now() })
    const abortController = new AbortController()
    const { signal } = abortController
    self.abortController = abortController

    await preAction?.()

    function _onAny() {
      recSelf.setStore({ refreshing: false, refreshingTab: undefined })
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
  const { recSharedEmitter } = useRecSelfContext()
  useEmitterOn(recSharedEmitter, 'refresh', refresh)

  return { refresh }
}
