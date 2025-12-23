import { Radio } from 'antd'
import { useUnoMerge } from 'unocss-merge/react'
import { useSnapshot } from 'valtio'
import { EGridDisplayMode } from '$enums'
import { AntdTooltip } from '$modules/antd/custom'
import { settings } from '$modules/settings'
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

export function GridDisplayModeSwitcher({ className }: { className?: string }) {
  const { gridDisplayMode } = useSnapshot(settings.grid)

  // .ant-radio-wrapper > (.ant-radio + .ant-radio-label)
  const clsRadioWrapper = '[&_.ant-radio-wrapper]:(inline-flex items-center)'
  const clsRadioLabel = '[&_.ant-radio-label]:(inline-flex items-center) ![&_.ant-radio-label]:pl-4px'
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
