import { css } from '@emotion/react'
import { Button, Popconfirm } from 'antd'
import { useUnoMerge } from 'unocss-merge/react'
import { initialSettings, pickSettings, updateSettings, type LeafSettingsPath } from '$modules/settings'
import type { CssProp } from '$utility/type'
import type { ComponentProps, ReactNode } from 'react'
import type { Merge } from 'type-fest'

const S = {
  tabPane: css`
    overflow-y: auto;
    min-height: 362px;
    max-height: max(362px, calc(90vh - ${50 + 56 + 15}px));
  `,

  settingsGroup: css`
    margin-bottom: 10px;
  `,

  settingsGroupTitle: css`
    font-size: 2em;
    display: flex;
    align-items: center;
  `,

  settingsGroupSubTitle: css`
    font-size: 1.3em;
    display: flex;
    align-items: center;
    margin-top: 15px;
  `,

  settingsGroupContent: css`
    color: default;
    button:first-child {
      margin-left: 0;
    }
  `,
}
export { S as sharedCss }

export function SettingsGroup({
  children,
  title,
  titleCss,
  titleClassName,
  contentCss,
  contentClassName,
  ...rest
}: Merge<
  ComponentProps<'div'>,
  {
    children?: React.ReactNode
    title: ReactNode
    titleCss?: CssProp
    titleClassName?: string
    contentCss?: CssProp
    contentClassName?: string
  }
>) {
  return (
    <div css={S.settingsGroup} data-role='settings-group' {...rest}>
      <div data-role='settings-group-title' className={titleClassName} css={[S.settingsGroupTitle, titleCss]}>
        {title}
      </div>
      <div
        css={[S.settingsGroupContent, contentCss]}
        data-role='settings-group-content'
        className={useUnoMerge('flex flex-col gap-y-5px', contentClassName)}
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
      <Button
        className={className}
        css={css`
          column-gap: 4px;
        `}
      >
        <IconParkOutlineReturn className='mt--1px size-12px' />
        <span>重置</span>
      </Button>
    </Popconfirm>
  )
}
