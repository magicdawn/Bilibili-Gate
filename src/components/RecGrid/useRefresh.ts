import { useMemoizedFn, useMount, useUnmount } from 'ahooks'
import { assert, attempt, attemptAsync, isEqual } from 'es-toolkit'
import { RingBuffer } from 'ring-buffer-ts'
import { useEmitterOn } from '$common/hooks/useEmitter'
import { TabConfig } from '$components/RecHeader/tab-config'
import { EHotSubTab, ETab } from '$components/RecHeader/tab-enum'
import { useRecSelfContext, type RefreshFn, type RefreshType } from '$components/Recommends/rec.shared'
import { filterRecItems } from '$modules/filter'
import { getGridRefreshCount } from '$modules/rec-services'
import { getDynamicFeedServiceConfig, type DynamicFeedRecService } from '$modules/rec-services/dynamic-feed'
import { getFavServiceConfig, type FavRecService } from '$modules/rec-services/fav'
import { hotStore, type HotRecService } from '$modules/rec-services/hot'
import { RankRecService } from '$modules/rec-services/hot/rank'
import { rankStore } from '$modules/rec-services/hot/rank/store'
import {
  createServiceMap,
  getServiceFromRegistry,
  isRecTab,
  type FetcherOptions,
  type ServiceMap,
} from '$modules/rec-services/service-map'
import { getSpaceUploadServiceConfig, type SpaceUploadService } from '$modules/rec-services/space-upload'
import { assertNever } from '$utility/type'
import type { Debugger } from 'obug'
import type { RecItemTypeOrSeparator } from '$define'
import type { BaseTabService } from '$modules/rec-services/_base'
import type { RecGridSelf } from '.'

/**
 * refresh for same tab, but conditions changed
 */
function checkIsSameTabButConditionsChanged(tab: ETab, serviceRegistry: Partial<ServiceMap>) {
  let s: DynamicFeedRecService | FavRecService | HotRecService | SpaceUploadService | undefined
  switch (tab) {
    case ETab.DynamicFeed:
      s = serviceRegistry[ETab.DynamicFeed]
      return !isEqual(s?.config, getDynamicFeedServiceConfig())

    case ETab.Fav:
      s = serviceRegistry[ETab.Fav]
      return !isEqual(s?.config, getFavServiceConfig())

    case ETab.Hot:
      s = serviceRegistry[ETab.Hot]
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
      s = serviceRegistry[ETab.SpaceUpload]
      return !isEqual(s?.config, getSpaceUploadServiceConfig())

    default:
      return false
  }
}

const MAX_REC_SERVICE_HISTORY_COUNT = 5

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
  const { serviceRegistry } = recSelf

  useMount(() => {
    // Q: why `true`   A: when switch tab, set reuse to `true`
    refresh('reuse')
  })
  // switch away
  useUnmount(() => {
    self.abortController.abort()
  })

  const refresh: RefreshFn = useMemoizedFn(async (refreshType: RefreshType = 'refresh') => {
    const isSameTabRefreshing = recSelf.refreshing && recSelf.refreshingTab === tab
    if (isSameTabRefreshing) {
      if (checkIsSameTabButConditionsChanged(tab, serviceRegistry)) {
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
      self.setStore({ hasMore: getServiceFromRegistry(serviceRegistry, tab).hasMore })
    }

    async function doFetch(service: BaseTabService, firstFetch?: boolean) {
      const [err, currentItems] = await attemptAsync(() => fetcher({ tab, service, abortSignal: signal, firstFetch }))
      // explicit aborted
      if (signal.aborted) return debug('refresh(): tab=%s [aborted], ignoring rest code', tab)
      if (err) return onError(err)

      self.setStore({ items: currentItems ?? [] })
      return true // mark success
    }

    let existingService: (typeof serviceRegistry)[ETab]
    let willRecreateService: boolean
    switch (refreshType) {
      case 'refresh':
        break
      case 'reuse':
        existingService = serviceRegistry[tab] // reuse existing service
        break
      case 'back':
      case 'forward': {
        assert(isRecTab(tab), `only rec tab can perform back/forward`)
        const [canGoBack, canGoForward] = recSelf.getTabBackForwardStatus(tab)
        if (refreshType === 'back' && !canGoBack) throw new Error('cannot go back')
        if (refreshType === 'forward' && !canGoForward) throw new Error('cannot go forward')

        const state = recSelf.getTabServiceQueueState(tab)
        assert(state, `state should not be nil`)
        const { len, cursor } = state
        const inc = refreshType === 'back' ? -1 : 1
        const newCursor = cursor + inc
        if (newCursor < 0 || newCursor > len - 1) throw new Error('cannot go back/forward')

        const service = recSelf.serviceQueueMap[tab]?.get(newCursor)
        assert(service, `service should not be nil`)
        existingService = service
        recSelf.setTabServiceQueueState(tab, { cursor: newCursor, len })
        serviceRegistry[tab] = service as any

        willRecreateService = false
        break
      }
      default:
        assertNever(refreshType)
        break
    }

    if (existingService) {
      // cache
      existingService.restore()
      const cachedItems = filterRecItems(existingService.qs.bufferQueue, tab).slice(0, getGridRefreshCount())
      self.setStore({ items: cachedItems })
      const success = !!(await doFetch(existingService))
      // swr?
      willRecreateService ??= success && !!TabConfig[tab].swr
    }
    // create new service
    else {
      self.setStore({ showSkeleton: true })
      willRecreateService = true
    }

    if (willRecreateService) {
      const [err, service] = attempt(() => createServiceMap[tab]({ existingService }))
      if (err) return onError(err)

      // save services
      const firstFetch = serviceRegistry[tab] ? undefined : true // no previous service
      serviceRegistry[tab] = service as any
      updateViewFromService?.()
      if (isRecTab(tab)) {
        recSelf.serviceQueueMap[tab] ||= new RingBuffer(MAX_REC_SERVICE_HISTORY_COUNT)
        const queue = recSelf.serviceQueueMap[tab]
        queue.add(service as any)
        const len = queue.getBufferLength()
        recSelf.setTabServiceQueueState(tab, { len, cursor: len - 1 })
      }

      const success = await doFetch(service!, firstFetch)
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
