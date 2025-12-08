import { Tooltip } from 'antd'
import type { AnyFunction } from '$utility/type'
import type { ComponentProps, ReactNode } from 'react'

export type ObjectOnlyStyles<T> = T extends AnyFunction ? never : T

export function AntdTooltip(
  props: ComponentProps<typeof Tooltip> & { styles?: ObjectOnlyStyles<ComponentProps<typeof Tooltip>['styles']> },
) {
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
