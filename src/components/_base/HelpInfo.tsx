import { useUnoMerge } from 'unocss-merge/react'
import { AntdTooltip } from '$modules/antd/custom'
import type { ComponentType, ReactNode } from 'react'

const DefaultIconComponent = IconParkOutlineTips

export const TOOLTIP_BLACK_BG_COLOR = 'rgb(0 0 0 / 0.85)'

export function HelpInfo({
  children,
  tooltipProps,
  IconComponent,
  className,
  useBlackBg,
  ...restSvgProps
}: {
  children?: ReactNode // tooltip content
  tooltipProps?: Partial<ComponentProps<typeof AntdTooltip>>
  IconComponent?: ComponentType<ComponentProps<'svg'>>
  useBlackBg?: boolean // 默认使用 colorPrimary, 链接可能看不清
} & ComponentProps<'svg'>) {
  IconComponent ??= DefaultIconComponent
  const icon = <IconComponent {...restSvgProps} className={useUnoMerge('ml-4px size-16px cursor-pointer', className)} />
  return (
    !!children && (
      <AntdTooltip color={useBlackBg ? TOOLTIP_BLACK_BG_COLOR : undefined} {...tooltipProps} title={children}>
        {icon}
      </AntdTooltip>
    )
  )
}
