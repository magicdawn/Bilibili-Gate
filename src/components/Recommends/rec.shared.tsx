import { useCreation, useLockFn } from 'ahooks'
import Emittery from 'emittery'
import { createContext, useContext, type ReactNode } from 'react'
import { proxy, ref, useSnapshot } from 'valtio'
import type { ETab } from '$components/RecHeader/tab-enum'
import type { ServiceMap } from '$modules/rec-services/service-map'

/* #region RecSharedEmitter */
export type RecSharedEmitterEvents = {
  // for VideoCard, shared
  'mouseenter': string
  'show-large-preview': string

  // for grid
  'refresh': Parameters<RefreshFn>[0]
  'load-to-end': undefined
  'remove-cards': [uniqIds: string[], titles?: string[], silent?: boolean]
  'move-card-to': [uniqId: string, pos: 'first' | 'last']

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
  servicesRegistry: Partial<ServiceMap> = {}

  // render state
  private store = proxy({
    refreshing: false,
    refreshingTab: undefined as ETab | undefined,
    tabbarView: undefined as ReactNode,
    sidebarView: undefined as ReactNode,
  })

  get refreshing() {
    return this.store.refreshing
  }
  get refreshingTab() {
    return this.store.refreshingTab
  }

  useStore = () => {
    // oxlint-disable-next-line react-hooks/rules-of-hooks
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
}

export const RecSelfContext = createContext(new RecSelf())

export function useInitRecSelf(...args: ConstructorParameters<typeof RecSelf>) {
  return useCreation(() => new RecSelf(...args), [])
}

export function useRecSelfContext() {
  return useContext(RecSelfContext)
}

export type RefreshFn = (reuse?: boolean) => void | Promise<void>

/**
 * return a function to trigger a refresh event
 */
export function useOnRefresh() {
  const { recSharedEmitter } = useRecSelfContext()
  return useLockFn((reuse?: boolean) => recSharedEmitter.emit('refresh', reuse))
}
