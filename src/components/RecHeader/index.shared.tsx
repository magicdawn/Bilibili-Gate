import { proxy, useSnapshot } from 'valtio'

export const headerState = proxy({
  modalSettingsVisible: false,
})

export function useHeaderState() {
  return useSnapshot(headerState)
}
