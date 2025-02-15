import { C } from '$common/emotion-css'
import {
  initialSettings,
  pickSettings,
  updateSettings,
  type LeafSettingsPath,
} from '$modules/settings'
import type { CssProp } from '$utility/type'
import { css } from '@emotion/react'
import { Button, Popconfirm, Space } from 'antd'
import { size } from 'polished'
import type { ComponentProps, ReactNode } from 'react'
import type { Merge } from 'type-fest'
import IconParkOutlineReturn from '~icons/icon-park-outline/return'

const S = {
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

export function SettingsGroup({
  children,
  title,
  titleCss,
  ...rest
}: Merge<
  ComponentProps<'div'>,
  {
    children?: React.ReactNode
    title: ReactNode
    titleCss?: CssProp
  }
>) {
  return (
    <div css={S.settingsGroup} data-as='settings-group' {...rest}>
      <div css={[S.settingsGroupTitle, titleCss]} data-as='settings-group-title'>
        {title}
      </div>
      <div css={S.settingsGroupContent} data-as='settings-group-content'>
        <Space size={5} direction='vertical' className='flex'>
          {/* the content */}
          {children}
        </Space>
      </div>
    </div>
  )
}

export function resetPartialSettings(paths: LeafSettingsPath[]) {
  const { pickedSettings } = pickSettings(initialSettings, paths)
  updateSettings(pickedSettings)
}

export function ResetPartialSettingsButton({
  paths,
  className,
}: {
  paths: LeafSettingsPath[]
  className?: string
}) {
  return (
    <Popconfirm title={'确定重置下面的设置项?'} onConfirm={() => resetPartialSettings(paths)}>
      <Button
        className={className}
        css={css`
          column-gap: 4px;
        `}
      >
        <IconParkOutlineReturn {...size(12)} css={C.mt(-1)} />
        <span>重置</span>
      </Button>
    </Popconfirm>
  )
}
