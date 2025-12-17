import { useCreation, useLockFn } from 'ahooks'
import Emittery from 'emittery'
import { proxy, useSnapshot } from 'valtio'

/* #region RecSharedEmitter */
export type RecSharedEmitterEvents = {
  // for VideoCard, shared
  'mouseenter': string
  'show-large-preview': string

  // for grid
  'refresh': Parameters<RefreshFn>[0]
  'remove-cards': [uniqIds: string[], titles?: string[], silent?: boolean]

  // for views: [tabbarView, sidebarView, ...]
  'dynamic-feed:clear': () => void
}

export type RecSharedEmitter = Emittery<RecSharedEmitterEvents>

export const defaultRecSharedEmitter = new Emittery<RecSharedEmitterEvents>()
/* #endregion */

type RecommendContextValue = ReturnType<typeof createRecommendContextDefaultValue>
function createRecommendContextDefaultValue() {
  return {
    insideModal: undefined as boolean | undefined,
    recSharedEmitter: new Emittery<RecSharedEmitterEvents>(),
    recStore: proxy({ refreshing: false }),
  }
}

export const RecommendContext = createContext<RecommendContextValue>(createRecommendContextDefaultValue())

export function useInitRecommendContext(fn?: () => Partial<RecommendContextValue>) {
  return useCreation(
    () => ({
      ...createRecommendContextDefaultValue(),
      ...fn?.(),
    }),
    [],
  )
}

export function useRecommendContext() {
  return useContext(RecommendContext)
}

export function useRecStoreSnapshot() {
  return useSnapshot(useRecommendContext().recStore)
}

export type RefreshFn = (reuse?: boolean) => void | Promise<void>

/**
 * return a function to trigger a refresh event
 */
export function useOnRefresh() {
  const { recSharedEmitter } = useRecommendContext()
  return useLockFn((reuse?: boolean) => recSharedEmitter.emit('refresh', reuse))
}
