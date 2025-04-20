import { usePopoverBorderColor } from '$common/emotion-css'
import { CheckboxSettingItem } from '$components/ModalSettings/setting-item'
import {
  copyBvidInfos,
  copyBvidsSingleLine,
  currentGridItems,
} from '$components/RecGrid/unsafe-window-export'
import { antNotification } from '$modules/antd'
import { settings, useSettingsSnapshot } from '$modules/settings'
import { Button, Popover } from 'antd'
import { proxy, useSnapshot } from 'valtio'
import { proxySet } from 'valtio/utils'
import { usePopupContainer } from '../_base'

export const multiSelectStore = proxy({
  multiSelecting: false,
  selectedIdSet: proxySet<string>(), // uniqId
})

export function useMultiSelectState(uniqId: string | undefined) {
  const { multiSelecting, selectedIdSet } = useSnapshot(multiSelectStore)
  return multiSelecting && !!uniqId && selectedIdSet.has(uniqId)
}

export function CopyBvidButtons() {
  const { __internalAddCopyBvidButton: enabled, multiSelect } = useSettingsSnapshot()
  const { multiSelecting } = useSnapshot(multiSelectStore)
  const popoverBorderColor = usePopoverBorderColor()
  const { ref, getPopupContainer } = usePopupContainer<HTMLButtonElement>()

  let btnMultiSelect: ReactNode = (
    <Button
      ref={ref}
      type={multiSelecting ? 'primary' : 'default'}
      onClick={() => {
        const val = !multiSelectStore.multiSelecting
        multiSelectStore.multiSelecting = val
        if (!val && settings.multiSelect.clearWhenExit) {
          multiSelectStore.selectedIdSet.clear()
        }
      }}
    >
      Multi-Select{multiSelectStore.multiSelecting ? 'ing' : ''}
    </Button>
  )
  if (multiSelecting) {
    btnMultiSelect = (
      <Popover
        getPopupContainer={getPopupContainer}
        styles={{ body: { border: `1px solid ${popoverBorderColor}` } }}
        content={
          <div className='max-w-280px flex flex-wrap items-center gap-x-15px gap-y-3px'>
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
            <div className='flex-basis-100%' />

            <Button
              className='inline-flex items-center'
              onClick={() => {
                multiSelectStore.multiSelecting = false
                if (settings.multiSelect.clearWhenExit) {
                  multiSelectStore.selectedIdSet.clear()
                }
              }}
            >
              <IconBxStopCircle className='size-18px' />
              结束
            </Button>
            <CheckboxSettingItem
              configPath='multiSelect.clearWhenExit'
              label='退出时清空'
              tooltip='退出多选时, 清空所有已选择项'
            />
          </div>
        }
      >
        {btnMultiSelect}
      </Popover>
    )
  }

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
      {btnMultiSelect}
    </>
  )
}
