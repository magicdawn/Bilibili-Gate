import { Button, Popconfirm } from 'antd'
import clsx from 'clsx'
import { useUnoMerge } from 'unocss-merge/react'
import { initialSettings, pickSettings, updateSettings, type LeafSettingsPath } from '$modules/settings'
import type { ComponentProps, ReactNode } from 'react'
import type { Merge } from 'type-fest'

export const sharedClassNames = {
  tabPane: 'max-h-[max(362px,calc(90vh-50px-56px-15px))] min-h-362px overflow-y-auto pr-12px',
  settingsGroup: 'mb-10px',
  settingsGroupTitle: 'flex items-center text-2em',
  settingsGroupSubTitle: 'mt-15px flex items-center text-1.3em',
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
    children?: ReactNode
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
      {/* the content */}
      <div data-role='settings-group-content' className={useUnoMerge('flex flex-col gap-y-5px', contentClassName)}>
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
