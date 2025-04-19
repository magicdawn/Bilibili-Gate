import { copyBvidInfos, copyBvidsSingleLine } from '$components/RecGrid/unsafe-window-export'
import { antNotification } from '$modules/antd'
import { useSettingsSnapshot } from '$modules/settings'
import { Button } from 'antd'
import { proxy, useSnapshot } from 'valtio'
import { proxySet } from 'valtio/utils'

export const multiSelectStore = proxy({
  multiSelecting: false,
  selectedIdSet: proxySet<string>(), // uniqId
})

export function useMultiSelectState(uniqId: string | undefined) {
  const { multiSelecting, selectedIdSet } = useSnapshot(multiSelectStore)
  return multiSelecting && !!uniqId && selectedIdSet.has(uniqId)
}

export function CopyBvidButtons() {
  const { __internalAddCopyBvidButton: enabled } = useSettingsSnapshot()
  const { multiSelecting } = useSnapshot(multiSelectStore)
  if (!enabled) return null
  return (
    <>
      <Button
        onClick={() => {
          const content = copyBvidsSingleLine()
          antNotification.success({ message: '已复制', description: content })
        }}
      >
        Copy Bvids SingleLine
      </Button>
      <Button
        onClick={() => {
          const content = copyBvidInfos()
          antNotification.success({ message: '已复制', description: content })
        }}
      >
        Copy Bvid Infos
      </Button>

      <Button
        type={multiSelecting ? 'primary' : 'default'}
        onClick={() => {
          multiSelectStore.multiSelecting = !multiSelectStore.multiSelecting
          if (multiSelectStore.multiSelecting) {
            multiSelectStore.selectedIdSet.clear()
          }
        }}
      >
        Multi-Select{multiSelectStore.multiSelecting ? 'ing' : ''}
      </Button>
    </>
  )
}
