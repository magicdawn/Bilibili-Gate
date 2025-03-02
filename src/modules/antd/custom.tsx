import { Tooltip } from 'antd'
import type { ComponentProps } from 'react'

export function AntdTooltip(props: ComponentProps<typeof Tooltip>) {
  return (
    <Tooltip
      {...props}
      styles={{
        ...props.styles,
        root: {
          width: 'max-content',
          maxWidth: '50vw',
          ...props.styles?.root,
        },
      }}
    >
      {props.children}
    </Tooltip>
  )
}
