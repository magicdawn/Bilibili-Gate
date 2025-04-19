import {
  copyBvidInfos,
  copyBvidsSingleLine,
  currentGridItems,
} from '$components/RecGrid/unsafe-window-export'
import { antNotification } from '$modules/antd'
import { useSettingsSnapshot } from '$modules/settings'
import { Button, Popover } from 'antd'
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

  let btnMultiSelect: ReactNode = (
    <Button
      type={multiSelecting ? 'primary' : 'default'}
      onClick={() => {
        multiSelectStore.multiSelecting = !multiSelectStore.multiSelecting
      }}
    >
      Multi-Select{multiSelectStore.multiSelecting ? 'ing' : ''}
    </Button>
  )
  if (multiSelecting) {
    btnMultiSelect = (
      <Popover
        content={
          <div className='flex items-center gap-x-10px'>
            <Button
              className='inline-flex items-center'
              onClick={() => multiSelectStore.selectedIdSet.clear()}
            >
              <IconMaterialSymbolsDeleteOutlineRounded className='size-16px' />
              清空
            </Button>
            <Button
              className='inline-flex items-center'
              onClick={() => {
                const newIdList = currentGridItems.map((x) => x.uniqId)
                multiSelectStore.selectedIdSet = proxySet(newIdList)
              }}
            >
              <IconFluentSelectAllOn16Regular className='size-18px' />
              全选
            </Button>
            <Button
              className='inline-flex items-center'
              onClick={() => {
                const newIdList = currentGridItems
                  .filter((x) => !multiSelectStore.selectedIdSet.has(x.uniqId))
                  .map((x) => x.uniqId)
                multiSelectStore.selectedIdSet = proxySet(newIdList)
              }}
            >
              <IconIcOutlineSwapHoriz className='size-18px' />
              反选
            </Button>
            <Button
              className='inline-flex items-center'
              onClick={() => {
                multiSelectStore.multiSelecting = false
                multiSelectStore.selectedIdSet.clear()
              }}
            >
              <IconBxStopCircle className='size-18px' />
              结束多选并清空
            </Button>
          </div>
        }
      >
        {btnMultiSelect}
      </Popover>
    )
  }

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
      {btnMultiSelect}
    </>
  )
}
