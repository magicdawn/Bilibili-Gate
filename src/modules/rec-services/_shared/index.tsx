import { ButtonSettingItem } from '$components/ModalSettings/setting-item'
import { IconForDefaultOrder, IconForShuffle } from '$modules/icon'
import type { BooleanSettingsPath } from '$modules/settings'
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
          <IconForShuffle className='size-18px' />
          随机顺序
        </>
      }
      unCheckedChildren={
        <>
          <IconForDefaultOrder className='position-relative top-[-1px] size-18px' />
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
