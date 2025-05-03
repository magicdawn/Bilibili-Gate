import { proxy } from 'valtio'
import { useSnapshot } from 'valtio/react'
import { proxySet } from 'valtio/utils'

export const multiSelectStore = proxy({
  multiSelecting: false,
  selectedIdSet: proxySet<string>(), // uniqId
})

export function useMultiSelecting() {
  const { multiSelecting } = useSnapshot(multiSelectStore)
  return multiSelecting
}

export function useMultiSelectState(uniqId: string | undefined) {
  const { multiSelecting, selectedIdSet } = useSnapshot(multiSelectStore)
  return multiSelecting && !!uniqId && selectedIdSet.has(uniqId)
}
