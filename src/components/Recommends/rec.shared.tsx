import { useCreation, useLockFn } from 'ahooks'
import Emittery from 'emittery'
import { proxy, useSnapshot } from 'valtio'
import type { ServiceMap } from '$modules/rec-services/service-map'

/* #region RecSharedEmitter */
export type RecSharedEmitterEvents = {
  // for VideoCard, shared
  'mouseenter': string
  'show-large-preview': string

  // for grid
  'refresh': Parameters<RefreshFn>[0]
  'remove-cards': [uniqIds: string[], titles?: string[], silent?: boolean]

  // for views: [tabbarView, sidebarView, ...]
  'dynamic-feed:clear': undefined
}

export type RecSharedEmitter = Emittery<RecSharedEmitterEvents>

export const defaultRecSharedEmitter = new Emittery<RecSharedEmitterEvents>()
/* #endregion */

export class RecContextValue {
  constructor(public insideModal?: boolean) {}

  recSharedEmitter = new Emittery<RecSharedEmitterEvents>()
  servicesRegistry: Partial<ServiceMap> = {}

  // state needed in render
  recStore = proxy({
    refreshing: false,
    tabbarView: undefined as ReactNode,
    sidebarView: undefined as ReactNode,
  })
}

export const RecContext = createContext(new RecContextValue())

export function useInitRecContextValue(...args: ConstructorParameters<typeof RecContextValue>) {
  return useCreation(() => new RecContextValue(...args), [])
}

export function useRecContext() {
  return useContext(RecContext)
}

export function useRecStoreSnapshot() {
  return useSnapshot(useRecContext().recStore)
}

export type RefreshFn = (reuse?: boolean) => void | Promise<void>

/**
 * return a function to trigger a refresh event
 */
export function useOnRefresh() {
  const { recSharedEmitter } = useRecContext()
  return useLockFn((reuse?: boolean) => recSharedEmitter.emit('refresh', reuse))
}
