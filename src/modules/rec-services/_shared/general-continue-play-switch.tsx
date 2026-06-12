import { Radio } from 'antd'
import { get } from 'es-toolkit/compat'
import { useUnoMerge } from 'unocss-merge/react'
import { explainForFlag } from '$components/ModalSettings/index.shared'
import { CheckboxSettingItem } from '$components/ModalSettings/setting-item'
import { EContinuePlayDirection } from '$enums'
import { AntdTooltip } from '$modules/antd/custom'
import { useSettingsSnapshot, type BooleanSettingsPath } from '$modules/settings'
import type { ReactNode } from 'react'

export function GeneralContinuePlaySwitch({
  enabledConfigPath,
  direction,
  onDirectionChange,
  autoPlaylistName,
  className,
  normalDirectionTooltip,
  reverseDirectionTooltip,
}: {
  enabledConfigPath: BooleanSettingsPath
  direction: EContinuePlayDirection
  onDirectionChange: (direction: EContinuePlayDirection) => void
  className?: string
  autoPlaylistName?: string
  normalDirectionTooltip?: React.ReactNode
  reverseDirectionTooltip?: React.ReactNode
}) {
  const enabled = !!get(useSettingsSnapshot(), enabledConfigPath, false)

  const _normalDirectionTooltip: ReactNode = normalDirectionTooltip ?? (
    <>
      顺序播放 (默认) <br />
      左至右, 上至下
    </>
  )
  const _reverseDirectionTooltip: ReactNode = reverseDirectionTooltip ?? '逆序播放'

  return (
    <div className={useUnoMerge('inline-flex-center gap-x-1', className)}>
      <CheckboxSettingItem
        configPath={enabledConfigPath}
        label='连续播放'
        tooltip={explainForFlag(
          `使用自动生成的${autoPlaylistName ? `「${autoPlaylistName}」` : ''}播放列表连续播放`,
          '独立视频链接',
        )}
      />
      <Radio.Group
        size='small'
        buttonStyle='solid'
        disabled={!enabled}
        value={direction}
        onChange={(e) => {
          const val = e.target.value
          onDirectionChange(val)
        }}
      >
        <AntdTooltip title={_reverseDirectionTooltip}>
          <Radio.Button
            value={EContinuePlayDirection.Reverse}
            className='[&_.ant-radio-button-label]:(h-full flex items-center)'
          >
            <IconTablerArrowNarrowLeft className='size-14px' />
          </Radio.Button>
        </AntdTooltip>
        <AntdTooltip title={_normalDirectionTooltip}>
          <Radio.Button
            value={EContinuePlayDirection.Normal}
            className='[&_.ant-radio-button-label]:(h-full flex items-center)'
          >
            <IconTablerArrowNarrowRight className='size-14px' />
          </Radio.Button>
        </AntdTooltip>
      </Radio.Group>
    </div>
  )
}
