import { useMemoizedFn } from 'ahooks'
import { InputNumber, Radio, Space, type CheckboxOptionType, type RadioChangeEvent } from 'antd'
import { useMemo } from 'react'
import { useUnoMerge } from 'unocss-merge/react'
import { useSnapshot } from 'valtio'
import { CustomKbd } from '$components/fragments'
import { EGridDisplayMode } from '$enums'
import { AntdTooltip } from '$modules/antd/custom'
import { settings } from '$modules/settings'
import { isMac } from '$ua'
import { TwoColumnModeAlignSwitcher } from './two-column-mode'

export function gridDisplayModeChecker(x: EGridDisplayMode) {
  return {
    usingListMode: x === EGridDisplayMode.List,
    usingTwoColumnMode: x === EGridDisplayMode.TwoColumnGrid,
    usingCenterEmptyMode: x === EGridDisplayMode.CenterEmptyGrid,
  }
}

export function useGridDisplayModeChecker() {
  const { gridDisplayMode } = useSnapshot(settings.grid)
  return gridDisplayModeChecker(gridDisplayMode)
}

export function isDisplayAsList(displayMode: EGridDisplayMode | undefined) {
  return displayMode === EGridDisplayMode.List
}

export function useIsDisplayAsList() {
  return useSnapshot(settings.grid).gridDisplayMode === EGridDisplayMode.List
}

// .ant-radio-wrapper > (.ant-radio + .ant-radio-label)
const clsRadioWrapper = '[&_.ant-radio-wrapper]:(mx-0 inline-flex items-center)'
const clsRadioLabel = '[&_.ant-radio-label]:(inline-flex items-center) ![&_.ant-radio-label]:pl-4px'

export function GridDisplayModeSwitcher({ className }: { className?: string }) {
  const { gridDisplayMode } = useSnapshot(settings.grid)
  const _className = useUnoMerge('flex items-center gap-x-15px', clsRadioWrapper, clsRadioLabel, className)
  return (
    <Radio.Group
      size='large'
      className={_className}
      value={gridDisplayMode}
      onChange={(e) => {
        settings.grid.gridDisplayMode = e.target.value
      }}
      options={[
        {
          value: EGridDisplayMode.NormalGrid,
          label: (
            <AntdTooltip title='这个是默认的网格模式'>
              <span className='inline-flex-center'>
                <IconTablerLayoutGrid className='mx-4px size-16px cursor-pointer' />
                网格
              </span>
            </AntdTooltip>
          ),
        },
        {
          value: EGridDisplayMode.List,
          label: (
            <>
              <IconTablerListDetails className='mx-4px size-16px cursor-pointer' />
              列表
            </>
          ),
        },
        {
          value: EGridDisplayMode.TwoColumnGrid,
          label: (
            <>
              双列模式
              <TwoColumnModeAlignSwitcher className='ml-5px' />
            </>
          ),
        },
        {
          value: EGridDisplayMode.CenterEmptyGrid,
          label: (
            <>
              <AntdTooltip title='网格中间不显示卡片'>中空模式</AntdTooltip>
            </>
          ),
        },
      ]}
    />
  )
}

export function GridTemplateColumnsConfig({ className }: { className?: string }) {
  const { useCustomGrid, enableForceColumn, cardMinWidth, forceColumnCount } = useSnapshot(settings.grid)

  /**
   * 复用 `settings.grid.enableForceColumn: boolean` 后续如果有更多可能的值, 再改成 enum
   */
  type AllowedValue = 'auto-fill' | 'force-column'
  const value: AllowedValue = enableForceColumn ? 'force-column' : 'auto-fill'
  const onChange = useMemoizedFn((e: RadioChangeEvent) => {
    const val = e.target.value as AllowedValue
    if (val === 'force-column') {
      settings.grid.enableForceColumn = true
    } else if (val === 'auto-fill') {
      settings.grid.enableForceColumn = false
    }
  })

  const options: CheckboxOptionType<AllowedValue>[] = useMemo(() => {
    return [
      {
        value: 'auto-fill',
        label: (
          <div className='flex items-center gap-x-1'>
            <AntdTooltip
              title={
                <>
                  自适应: 指按照「卡片最小宽度」自适应 <br />
                  如果期望显示更多的列, 可以调小「卡片最小宽度」; <br />
                  如果期望显示更少的列, 可以调大「卡片最小宽度」; <br />
                  Tip: 先点击输入框, 再移动鼠标到透视按钮, 然后使用键盘{' '}
                  <CustomKbd>{isMac ? 'Option' : 'Alt'}</CustomKbd> + <CustomKbd>上下键</CustomKbd>调整
                </>
              }
            >
              <span className='cursor-pointer'>自适应: 卡片最小宽度</span>
            </AntdTooltip>
            <Space.Compact>
              <InputNumber
                disabled={!(useCustomGrid && value === 'auto-fill')}
                value={cardMinWidth}
                onChange={(val) => {
                  if (val) settings.grid.cardMinWidth = val
                }}
                min={150}
                max={450}
                step={10}
                size='small'
                className='w-75px'
              />
              <Space.Addon>px</Space.Addon>
            </Space.Compact>
          </div>
        ),
      },
      {
        value: 'force-column',
        label: (
          <div className='flex items-center gap-x-1'>
            手动设置列数
            <InputNumber
              disabled={!(useCustomGrid && value === 'force-column')}
              value={forceColumnCount}
              onChange={(val) => {
                if (val) {
                  settings.grid.forceColumnCount = val
                }
              }}
              min={0}
              max={10}
              step={1}
              size='small'
              className='w-50px'
            />
          </div>
        ),
      },
    ]
  }, [value, useCustomGrid, enableForceColumn, cardMinWidth, forceColumnCount])

  const _className = useUnoMerge('flex items-center gap-x-15px', clsRadioWrapper, clsRadioLabel, className)

  return (
    <Radio.Group className={_className} disabled={!useCustomGrid} options={options} value={value} onChange={onChange} />
  )
}
