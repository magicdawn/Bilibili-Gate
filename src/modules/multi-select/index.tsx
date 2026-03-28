import { Button, Divider, Popover } from 'antd'
import clsx from 'clsx'
import { useSnapshot } from 'valtio'
import { proxySet } from 'valtio/utils'
import { usePopoverBorderColor } from '$common/emotion-css'
import { CheckboxSettingItem } from '$components/ModalSettings/setting-item'
import { getCurrentGridItems } from '$components/RecGrid/rec-grid-state'
import { AntdTooltip } from '$modules/antd/custom'
import { HotkeyDisplay, soloShiftKey } from '$modules/hotkey'
import { IconForDelete, IconForInfo } from '$modules/icon'
import { CopyBvidButtons } from '$modules/rec-services/_shared/copy-bvid-buttons'
import { exitMultiSelecting, multiSelectStore, toggleMultiSelecting } from './store'
import type { ReactNode } from 'react'

const toggleMultiSelectingTip = (
  <>
    使用 <HotkeyDisplay k='Shift+M' /> 切换多选状态
  </>
)
const shiftSelectTip = (
  <span className='break-all'>
    使用{soloShiftKey}键扩选: 切换选中状态后, 按住{soloShiftKey}键再选择区间终点,整个区间会与起点选中状态同步.
  </span>
)
const wrapIconForTip = (tip: ReactNode) => (
  <div className='flex items-start gap-x-6px'>
    <IconForInfo className='mt-1 size-14px' />
    <div className='flex-1'>{tip}</div>
  </div>
)

export function MultiSelectButton({
  iconOnly,
  addCopyActions = false,
}: {
  iconOnly: boolean
  addCopyActions?: boolean
}) {
  const { multiSelecting } = useSnapshot(multiSelectStore)
  const popoverBorderColor = usePopoverBorderColor()

  const btn: ReactNode = (
    <Button
      type={multiSelecting ? 'primary' : 'default'}
      className={clsx(iconOnly ? 'icon-only-round-button' : 'inline-flex-center')}
      onClick={() => toggleMultiSelecting()}
    >
      <IconBiUiChecksGrid className='size-12px' />
      {!iconOnly && <>多选{multiSelectStore.multiSelecting ? '中' : ''}</>}
    </Button>
  )

  const wrapActionsPopover = (btn: ReactNode) => {
    return (
      <Popover
        styles={{ container: { border: `1px solid ${popoverBorderColor}` } }}
        content={
          <div className='max-w-288px'>
            {wrapIconForTip(toggleMultiSelectingTip)}
            {wrapIconForTip(shiftSelectTip)}
            <Divider variant='solid' className='my-7px' />

            <div className='flex flex-wrap items-center gap-x-15px gap-y-2px'>
              <Button className='inline-flex items-center' onClick={() => multiSelectStore.selectedIdSet.clear()}>
                <IconForDelete className='size-18px' />
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

              <Button className='inline-flex items-center' onClick={() => exitMultiSelecting()}>
                <IconIonExitOutline className='size-18px' />
                退出
              </Button>
              <CheckboxSettingItem
                configPath='multiSelect.clearWhenExit'
                label='退出时清空'
                tooltip={
                  <>
                    退出多选时, 清空所有已选择项 <br />
                    仅点击「退出」按钮时生效 <br />
                    使用快捷键 <HotkeyDisplay k='Shift+M' /> 时总是保持选择状态
                  </>
                }
              />
            </div>

            {addCopyActions && (
              <>
                <Divider variant='solid' className='my-7px' />
                <div className='flex flex-wrap gap-x-10px gap-y-5px'>
                  <CopyBvidButtons showCopyBvidInfo />
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
    return wrapActionsPopover(btn)
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
