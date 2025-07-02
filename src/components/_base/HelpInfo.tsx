import { useUnoMerge } from 'unocss-merge/react'
import { AntdTooltip } from '$modules/antd/custom'
import type { ComponentType, ReactNode } from 'react'

const DefaultIconComponent = IconParkOutlineTips

export function HelpInfo({
  children,
  tooltipProps,
  IconComponent,
  className,
  ...restSvgProps
}: {
  children?: ReactNode // tooltip content
  tooltipProps?: Partial<ComponentProps<typeof AntdTooltip>>
  IconComponent?: ComponentType<ComponentProps<'svg'>>
} & ComponentProps<'svg'>) {
  IconComponent ??= DefaultIconComponent
  const _className = useUnoMerge('cursor-pointer size-16px ml-4px', className)
  const icon = <IconComponent {...restSvgProps} className={_className} />

  return (
    !!children && (
      <AntdTooltip {...tooltipProps} title={children}>
        {icon}
      </AntdTooltip>
    )
  )
}
