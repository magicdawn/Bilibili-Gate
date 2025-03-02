import { hasMarginLeft, hasSize } from '$utility/css'
import type { ComponentType, ReactNode } from 'react'
import IconParkOutlineTips from '~icons/icon-park-outline/tips'
import { AntdTooltip } from '../../modules/antd/custom'

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
  const _className = useMemo(() => {
    return clsx(
      'cursor-pointer',
      !hasSize(className) && 'size-16px',
      !hasMarginLeft(className) && 'ml-4px',
      className,
    )
  }, [className])

  IconComponent ??= DefaultIconComponent
  const icon = <IconComponent {...restSvgProps} className={_className} />

  return (
    !!children && (
      <AntdTooltip {...tooltipProps} title={children}>
        {icon}
      </AntdTooltip>
    )
  )
}
