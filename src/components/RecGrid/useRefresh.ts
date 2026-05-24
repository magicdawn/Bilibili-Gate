import { useMemoizedFn, useMount, useUnmount } from 'ahooks'
import { Result } from 'better-result'
import { assert, isEqual } from 'es-toolkit'
import { RingBuffer } from 'ring-buffer-ts'
import { useEmitterOn } from '$common/hooks/useEmitter'
import { TabConfig } from '$components/RecHeader/tab-config'
import { useRecSelfContext, type RefreshFn, type RefreshType } from '$components/Recommends/rec.shared'
import { EHotSubTab, ETab } from '$enums'
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

export const MAX_REC_SERVICE_HISTORY_COUNT = 5

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
  preAction?: (signal: AbortSignal) => void | Promise<void>
  postAction?: (signal: AbortSignal) => void | Promise<void>
  updateViewFromService?: () => void
  self: RecGridSelf
}) {
  const recSelf = useRecSelfContext()
  const { serviceRegistry } = recSelf

  useMount(() => {
    // reuse service when switch tab
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

    // #region abort-controller
    //  - 往 self / recSelf 上写 state 前需确保 `!signal.aborted`
    //  - async code 后需要判断 `signal.aborted` early return
    self.abortController.abort()
    self.abortController = new AbortController()
    const { signal } = self.abortController
    // #endregion

    recSelf.setStore({ refreshing: true, refreshingTab: tab })
    self.setStore({ refreshError: undefined, hasMore: true, items: [], refreshKey: Date.now() })
    await preAction?.(signal)
    if (signal.aborted) return

    function _onAny() {
      if (signal.aborted) return
      recSelf.setStore({ refreshing: false, refreshingTab: undefined })
      self.setStore({ showSkeleton: false })
    }
    function onError(err: any) {
      if (signal.aborted) return
      _onAny()
      self.setStore({ refreshError: err })
      console.error(err)
    }
    function onSuccess() {
      if (signal.aborted) return
      _onAny()
      self.setStore({ hasMore: getServiceFromRegistry(serviceRegistry, tab).hasMore })
    }

    async function doFetch(service: BaseTabService, firstFetch?: boolean) {
      const result = await Result.tryPromise(() => fetcher({ tab, service, abortSignal: signal, firstFetch }))
      // aborted
      if (signal.aborted) {
        return false
      }
      // err
      if (result.isErr()) {
        onError(result.error.cause) // 拆包 UnhandledException
        return false
      }
      // success
      else {
        self.setStore({ items: result.value })
        return true
      }
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

    // cached
    if (existingService) {
      await existingService.restore()
      const cachedItems = filterRecItems(existingService.qs.bufferQueue, tab).slice(0, getGridRefreshCount())
      if (signal.aborted) return
      self.setStore({ items: cachedItems })
      const success = await doFetch(existingService)
      if (signal.aborted) return
      // swr?
      willRecreateService ??= success && !!TabConfig[tab].swr
    }
    // create new service
    else {
      if (signal.aborted) return
      self.setStore({ showSkeleton: true })
      willRecreateService = true
    }

    if (willRecreateService) {
      const result = Result.try(() => createServiceMap[tab]({ existingService }))
      if (result.isErr()) return onError(result.error.cause)

      // save services
      const service = result.value
      const firstFetch = serviceRegistry[tab] ? undefined : true // no previous service
      if (signal.aborted) return
      serviceRegistry[tab] = service as any
      updateViewFromService?.()
      if (isRecTab(tab)) {
        recSelf.serviceQueueMap[tab] ||= new RingBuffer(MAX_REC_SERVICE_HISTORY_COUNT)
        const queue = recSelf.serviceQueueMap[tab]
        queue.add(service as any)
        const len = queue.getBufferLength()
        recSelf.setTabServiceQueueState(tab, { len, cursor: len - 1 })
      }

      const success = await doFetch(service, firstFetch)
      if (signal.aborted || !success) return
    }

    if (signal.aborted) return
    onSuccess()
    await postAction?.(signal)
    const cost = performance.now() - start
    debug('refresh(): tab=%s [success] cost %s ms', tab, cost.toFixed(0))
  })

  // listen for `refresh` event
  const { recSharedEmitter } = useRecSelfContext()
  useEmitterOn(recSharedEmitter, 'refresh', ({ data: refreshType }) => refresh(refreshType))

  return { refresh }
}
