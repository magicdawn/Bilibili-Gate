import { hasMarginLeft, hasSize } from '$utility/css'
import type { ComponentType, ReactNode } from 'react'
import IconParkOutlineTips from '~icons/icon-park-outline/tips'
import { AntdTooltip } from './antd-custom'

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
  const [_hasSize, _hasMarginLeft] = useMemo(
    () => [hasSize(className), hasMarginLeft(className)],
    [className],
  )

  const _className = clsx(
    'cursor-pointer',
    !_hasSize && 'size-16px',
    !_hasMarginLeft && 'ml-4px',
    className,
  )

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
