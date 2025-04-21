import { Tooltip } from 'antd'
import type { ComponentProps, ReactNode } from 'react'

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

export function wrapTooltip(
  children: ReactNode,
  tooltip: ReactNode,
  moreProps?: Partial<ComponentProps<typeof AntdTooltip>>,
) {
  if (!tooltip) return children
  return (
    <AntdTooltip title={tooltip} {...moreProps}>
      {children}
    </AntdTooltip>
  )
}
