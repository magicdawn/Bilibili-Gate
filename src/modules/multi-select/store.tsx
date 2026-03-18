import { proxy } from 'valtio'
import { useSnapshot } from 'valtio/react'
import { proxySet } from 'valtio/utils'
import { settings } from '$modules/settings'

export const multiSelectStore = proxy({
  multiSelecting: false,
  selectedIdSet: proxySet<string>(), // uniqId
  shiftMultiSelectAnchorUniqId: undefined as string | undefined,
})

export function exitMultiSelecting(clearSelectionOnExit = true) {
  if (!multiSelectStore.multiSelecting) return
  multiSelectStore.multiSelecting = false
  multiSelectStore.shiftMultiSelectAnchorUniqId = undefined
  if (clearSelectionOnExit && settings.multiSelect.clearWhenExit) {
    multiSelectStore.selectedIdSet.clear()
  }
}

export function toggleMultiSelecting(clearSelectionOnExit = true) {
  if (multiSelectStore.multiSelecting) {
    exitMultiSelecting(clearSelectionOnExit)
  } else {
    multiSelectStore.multiSelecting = true
  }
}

export function useMultiSelecting() {
  const { multiSelecting } = useSnapshot(multiSelectStore)
  return multiSelecting
}

export function useMultiSelectState(uniqId: string | undefined) {
  const { multiSelecting, selectedIdSet } = useSnapshot(multiSelectStore)
  return multiSelecting && !!uniqId && selectedIdSet.has(uniqId)
}
