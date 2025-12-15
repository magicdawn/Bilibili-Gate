import { Button, Divider, Popover } from 'antd'
import { useSnapshot } from 'valtio'
import { proxySet } from 'valtio/utils'
import { usePopoverBorderColor } from '$common/emotion-css'
import { CheckboxSettingItem } from '$components/ModalSettings/setting-item'
import { getCurrentGridItems } from '$components/RecGrid/rec-grid-state'
import { AntdTooltip } from '$modules/antd/custom'
import { CopyBvidButtons } from '$modules/rec-services/_shared/copy-bvid-buttons'
import { settings } from '$modules/settings'
import { multiSelectStore } from './store'
import type { ReactNode } from 'react'

export function MultiSelectButton({
  iconOnly,
  addCopyActions = false,
}: {
  iconOnly: boolean
  addCopyActions?: boolean
}) {
  const { multiSelecting } = useSnapshot(multiSelectStore)
  const popoverBorderColor = usePopoverBorderColor()

  const exitCheck = useMemoizedFn(() => {
    const isExit = !multiSelectStore.multiSelecting
    if (!isExit) return
    // reset
    multiSelectStore.shiftMultiSelectAnchorUniqId = undefined
    if (settings.multiSelect.clearWhenExit) {
      multiSelectStore.selectedIdSet.clear()
    }
  })

  const btn: ReactNode = (
    <Button
      type={multiSelecting ? 'primary' : 'default'}
      className={clsx(iconOnly ? 'icon-only-round-button' : 'inline-flex-center')}
      onClick={() => {
        multiSelectStore.multiSelecting = !multiSelectStore.multiSelecting
        exitCheck()
      }}
    >
      <IconBiUiChecksGrid className='size-12px' />
      {!iconOnly && <>多选{multiSelectStore.multiSelecting ? '中' : ''}</>}
    </Button>
  )

  const wrapPopoverActions = (btn: ReactNode) => {
    return (
      <Popover
        styles={{ container: { border: `1px solid ${popoverBorderColor}` } }}
        content={
          <div className='max-w-288px'>
            <div className='flex flex-wrap items-center gap-x-15px gap-y-2px'>
              <Button className='inline-flex items-center' onClick={() => multiSelectStore.selectedIdSet.clear()}>
                <IconMaterialSymbolsDeleteOutlineRounded className='size-18px' />
                清空
              </Button>
              <Button
                className='inline-flex items-center'
                onClick={() => {
                  const newIdList = getCurrentGridItems().map((x) => x.uniqId)
                  multiSelectStore.selectedIdSet = proxySet(newIdList)
                }}
              >
                <IconFluentSelectAllOn16Regular className='size-18px' />
                全选
              </Button>
              <Button
                className='inline-flex items-center'
                onClick={() => {
                  const newIdList = getCurrentGridItems()
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
                  exitCheck()
                }}
              >
                <IconIonExitOutline className='size-18px' />
                退出
              </Button>
              <CheckboxSettingItem
                configPath='multiSelect.clearWhenExit'
                label='退出时清空'
                tooltip='退出多选时, 清空所有已选择项'
              />
            </div>
            {addCopyActions && (
              <>
                <Divider variant='solid' className='my-7px' />
                <div className='flex flex-wrap gap-x-10px gap-y-5px'>
                  <CopyBvidButtons />
                </div>
              </>
            )}
          </div>
        }
      >
        {btn}
      </Popover>
    )
  }

  if (multiSelecting) {
    return wrapPopoverActions(btn)
  } else {
    return iconOnly ? (
      <AntdTooltip title='多选' arrow={false}>
        {btn}
      </AntdTooltip>
    ) : (
      btn
    )
  }
}
