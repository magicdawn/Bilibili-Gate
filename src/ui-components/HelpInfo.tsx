import { IconPark } from '$modules/icon/icon-park'
import { AntdTooltip } from '$ui-components/antd-custom'
import type { ReactNode } from 'react'
import type { SetOptional } from 'type-fest'

export function HelpInfo({
  children,
  iconProps,
  tooltipProps,
}: {
  children?: ReactNode
  tooltipProps?: Partial<ComponentProps<typeof AntdTooltip>>
  iconProps?: SetOptional<ComponentProps<typeof IconPark>, 'name'>
}) {
  return (
    <>
      {children && (
        <AntdTooltip {...tooltipProps} title={children}>
          <IconPark
            name={'Tips'}
            size={16}
            {...iconProps}
            style={{
              cursor: 'pointer',
              marginLeft: '4px',
              ...iconProps?.style,
            }}
          />
        </AntdTooltip>
      )}
    </>
  )
}
