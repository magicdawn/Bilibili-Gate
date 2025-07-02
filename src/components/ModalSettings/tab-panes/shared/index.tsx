import { Button, Popconfirm } from 'antd'
import { useUnoMerge } from 'unocss-merge/react'
import { initialSettings, pickSettings, updateSettings, type LeafSettingsPath } from '$modules/settings'
import type { ComponentProps, ReactNode } from 'react'
import type { Merge } from 'type-fest'

export const sharedClassNames = {
  tabPane: 'overflow-y-auto min-h-362px max-h-[max(362px,calc(90vh-50px-56px-15px))]',
  settingsGroup: 'mb-10px',
  settingsGroupTitle: 'text-2em flex items-center',
  settingsGroupSubTitle: 'text-1.3em flex items-center mt-15px',
} as const

export function SettingsGroup({
  children,
  title,
  titleClassName,
  contentClassName,
  ...rest
}: Merge<
  ComponentProps<'div'>,
  {
    children?: React.ReactNode
    title: ReactNode
    titleClassName?: string
    contentClassName?: string
  }
>) {
  return (
    <div className={sharedClassNames.settingsGroup} data-role='settings-group' {...rest}>
      <div
        data-role='settings-group-title'
        className={useUnoMerge(sharedClassNames.settingsGroupTitle, titleClassName)}
      >
        {title}
      </div>
      <div
        data-role='settings-group-content'
        className={useUnoMerge('flex flex-col gap-y-5px text-[default] [&_button:first-child]:ml-0', contentClassName)}
      >
        {/* the content */}
        {children}
      </div>
    </div>
  )
}

export function resetPartialSettings(paths: LeafSettingsPath[]) {
  const { pickedSettings } = pickSettings(initialSettings, paths)
  updateSettings(pickedSettings)
}

export function ResetPartialSettingsButton({ paths, className }: { paths: LeafSettingsPath[]; className?: string }) {
  return (
    <Popconfirm title={'确定重置下面的设置项?'} onConfirm={() => resetPartialSettings(paths)}>
      <Button className={clsx('gap-x-4px', className)}>
        <IconParkOutlineReturn className='mt--1px size-12px' />
        <span>重置</span>
      </Button>
    </Popconfirm>
  )
}
