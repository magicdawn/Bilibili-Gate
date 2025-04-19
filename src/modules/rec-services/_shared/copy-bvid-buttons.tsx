import { copyBvidInfos, copyBvidsSingleLine } from '$components/RecGrid/unsafe-window-export'
import { antMessage } from '$modules/antd'
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
          copyBvidsSingleLine()
          antMessage.success('已复制')
        }}
      >
        Copy Bvids SingleLine
      </Button>
      <Button
        onClick={() => {
          copyBvidInfos()
          antMessage.success('已复制')
        }}
      >
        Copy Bvid Infos
      </Button>

      <Button
        onClick={() => {
          multiSelectStore.multiSelecting = !multiSelectStore.multiSelecting
          if (multiSelectStore.multiSelecting) {
            multiSelectStore.selectedIdSet.clear()
          }
        }}
      >
        {multiSelecting ? 'Exit Multi-Select' : 'Multi-Select'}
      </Button>
    </>
  )
}
