import { Radio } from 'antd'
import { useUnoMerge } from 'unocss-merge/react'
import { ESidebarAlign } from '$enums'
import { AntdTooltip } from '$modules/antd/custom'
import { settings, useSettingsSnapshot } from '$modules/settings'

// .ant-radio-wrapper > (.ant-radio + .ant-radio-label)
const clsRadioWrapper = '[&_.ant-radio-wrapper]:(mx-0 inline-flex items-center)'
const clsRadioLabel = '[&_.ant-radio-label]:(inline-flex items-center) ![&_.ant-radio-label]:pl-4px'

export function SidebarSwitcher({ className }: { className?: string }) {
  const { enableSidebar, sidebarAlign } = useSettingsSnapshot()
  const _className = useUnoMerge('flex items-center gap-x-15px', clsRadioWrapper, clsRadioLabel, className)
  return (
    <Radio.Group
      size='large'
      className={_className}
      value={enableSidebar}
      onChange={(e) => {
        settings.enableSidebar = e.target.value
      }}
      options={[
        {
          value: true,
          label: (
            <span className='inline-flex-center gap-x-1'>
              <AntdTooltip title='使用侧边栏(如动态 分组/UP 选择)'>
                <span>开启</span>
              </AntdTooltip>
              <Radio.Group
                disabled={!enableSidebar}
                buttonStyle='solid'
                size='small'
                value={sidebarAlign}
                onChange={(e) => void (settings.sidebarAlign = e.target.value)}
              >
                <Radio.Button value={ESidebarAlign.Left} className='inline-flex-center'>
                  <IconMaterialSymbolsAlignHorizontalLeft className='size-16px' />
                </Radio.Button>
                <Radio.Button value={ESidebarAlign.Right} className='inline-flex-center'>
                  <IconMaterialSymbolsAlignHorizontalRight className='size-16px' />
                </Radio.Button>
              </Radio.Group>
            </span>
          ),
        },
        {
          value: false,
          label: (
            <AntdTooltip title='使用下拉面板'>
              <span className='inline-flex-center'>禁用</span>
            </AntdTooltip>
          ),
        },
      ]}
    />
  )
}
