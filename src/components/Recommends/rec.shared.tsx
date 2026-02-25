import { useCreation, useLockFn } from 'ahooks'
import Emittery from 'emittery'
import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { proxy, ref, snapshot, useSnapshot } from 'valtio'
import { isRecTab, type RecTab, type SerivesQueueMap, type ServiceMap } from '$modules/rec-services/service-map'
import type { ETab } from '$components/RecHeader/tab-enum'

/* #region RecSharedEmitter */
export type RecSharedEmitterEvents = {
  // for VideoCard, shared
  'mouseenter': string
  'show-large-preview': string

  // for grid
  'refresh': Parameters<RefreshFn>[0]
  'load-to-end': undefined
  'remove-cards': [uniqIds: string[], titles?: string[], silent?: boolean]
  'move-card-to': [uniqId: string, pos: 'start' | 'end']

  // for views: [tabbarView, sidebarView, ...]
  'dynamic-feed:clear': undefined
}

export type RecSharedEmitter = Emittery<RecSharedEmitterEvents>

export const defaultRecSharedEmitter = new Emittery<RecSharedEmitterEvents>()
/* #endregion */

/**
 * Self is `this` for FC
 */
export class RecSelf {
  constructor(public insideModal?: boolean) {}
  recSharedEmitter = new Emittery<RecSharedEmitterEvents>()
  serviceRegistry: Partial<ServiceMap> = {}
  serviceQueueMap: Partial<SerivesQueueMap> = {}

  // render state
  private store = proxy({
    refreshing: false,
    refreshingTab: undefined as ETab | undefined,
    tabbarView: undefined as ReactNode,
    sidebarView: undefined as ReactNode,
    serviceQueueStateMap: {} as Partial<Record<RecTab, { len: number; cursor: number }>>,
  })

  get refreshing() {
    return this.store.refreshing
  }
  get refreshingTab() {
    return this.store.refreshingTab
  }

  useStore = () => {
    /* oxlint-disable react-hooks/rules-of-hooks */
    return useSnapshot(this.store)
  }
  setStore = (payload: Partial<typeof this.store>) => {
    const wrapRefKeys: (keyof typeof this.store)[] = ['tabbarView', 'sidebarView']
    for (const key of wrapRefKeys) {
      const v = payload[key]
      if (typeof v === 'object' && v !== null) {
        payload[key] = ref(v) as any
      }
    }
    Object.assign(this.store, payload)
  }

  getTabServiceQueueState = (tab: ETab) => {
    return snapshot(this.store.serviceQueueStateMap)[tab as RecTab]
  }
  setTabServiceQueueState = (tab: RecTab, state: { len: number; cursor: number }) => {
    this.store.serviceQueueStateMap[tab] = state
  }
  private _calcTabBackForwardStatus = (
    tab: ETab,
    state: { len: number; cursor: number } | undefined,
  ): [canGoBack: boolean, canGoForward: boolean] => {
    if (!isRecTab(tab) || !state || state.len <= 1) return [false, false]
    const { len, cursor } = state
    return [cursor > 0, cursor < len - 1]
  }
  getTabBackForwardStatus = (tab: ETab) => {
    return this._calcTabBackForwardStatus(tab, this.getTabServiceQueueState(tab))
  }
  useTabBackForwardStatus = (tab: ETab) => {
    /* oxlint-disable react-hooks/rules-of-hooks */
    const state = useSnapshot(this.store.serviceQueueStateMap)[tab as RecTab]
    return useMemo(() => this._calcTabBackForwardStatus(tab, state), [tab, state])
  }
}

export const RecSelfContext = createContext(new RecSelf())

export function useInitRecSelf(...args: ConstructorParameters<typeof RecSelf>) {
  return useCreation(() => new RecSelf(...args), [])
}

export function useRecSelfContext() {
  return useContext(RecSelfContext)
}

export type RefreshType = 'refresh' | 'reuse' | 'back' | 'forward'
export type RefreshFn = (refreshType?: RefreshType) => void | Promise<void>

/**
 * return a function to trigger a refresh event
 */
export function useOnRefresh() {
  const { recSharedEmitter } = useRecSelfContext()
  return useLockFn((refreshType?: RefreshType) => recSharedEmitter.emit('refresh', refreshType))
}
