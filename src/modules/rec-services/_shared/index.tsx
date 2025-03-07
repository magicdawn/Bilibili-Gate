import { ButtonSettingItem } from '$components/ModalSettings/setting-item'
import { copyBvidInfos, copyBvidsSingleLine } from '$components/RecGrid/unsafe-window-export'
import { antMessage } from '$modules/antd'
import { IconForDefaultOrder, IconForShuffle } from '$modules/icon'
import { useSettingsSnapshot, type BooleanSettingsPath } from '$modules/settings'
import { Button } from 'antd'
import type { ComponentProps, CSSProperties } from 'react'

export function ShuffleSettingsItemFor({
  configPath,
  ...rest
}: { configPath: BooleanSettingsPath } & Omit<
  ComponentProps<typeof ButtonSettingItem>,
  'configPath' | 'checkedChildren' | 'unCheckedChildren'
>) {
  return (
    <ButtonSettingItem
      {...rest}
      configPath={configPath}
      checkedChildren={
        <>
          <IconForShuffle {...size(18)} />
          随机顺序
        </>
      }
      unCheckedChildren={
        <>
          <IconForDefaultOrder {...size(18)} className='position-relative top-[-1px]' />
          默认顺序
        </>
      }
    />
  )
}

export const dropdownMenuStyle: CSSProperties = {
  overscrollBehavior: 'contain',
  maxHeight: '60vh',
  overflowY: 'scroll',
  scrollbarWidth: 'thin',
  paddingRight: '12px',
}

export function InternalAddCopyBvidButtons() {
  const addCopyBvidButton = useSettingsSnapshot().__internalAddCopyBvidButton
  return (
    <>
      {addCopyBvidButton && (
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
        </>
      )}
    </>
  )
}
