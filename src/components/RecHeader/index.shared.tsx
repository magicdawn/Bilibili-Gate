import { proxy, useSnapshot } from 'valtio'

export const headerState = proxy({
  modalFeedVisible: false,
  modalSettingsVisible: false,
})

export function useHeaderState() {
  return useSnapshot(headerState)
}
