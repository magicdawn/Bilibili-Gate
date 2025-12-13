import { Radio } from 'antd'
import { settings, useSettingsSnapshot } from '$modules/settings'
import { EGridDisplayMode } from '.'

/**
 * 双列模式
 */

export enum TwoColumnModeAlign {
  Center = 'center',
  Left = 'left',
  Right = 'right',
}

// Q: why w-740px
// A: card=360 col-gap=16
export const clsTwoColumn = 'my-0 w-740px'

export const clsTwoColumnForAlign = (pos: TwoColumnModeAlign) => {
  switch (pos) {
    case TwoColumnModeAlign.Left:
      return 'ml-0 mr-auto'
    case TwoColumnModeAlign.Right:
      return 'ml-auto mr-0'
    default:
      return 'mx-auto'
  }
}

export function TwoColumnModeAlignSwitcher({ className }: { className?: string }) {
  const {
    grid: { gridDisplayMode, twoColumnModeAlign },
  } = useSettingsSnapshot()
  return (
    <Radio.Group
      className={className}
      disabled={gridDisplayMode !== EGridDisplayMode.TwoColumnGrid}
      buttonStyle='solid'
      size='small'
      value={twoColumnModeAlign}
      onChange={(e) => {
        settings.grid.twoColumnModeAlign = e.target.value
      }}
    >
      <Radio.Button value={TwoColumnModeAlign.Left} className='inline-flex-center'>
        <IconMaterialSymbolsAlignHorizontalLeft className='size-16px' />
      </Radio.Button>
      <Radio.Button value={TwoColumnModeAlign.Center} className='inline-flex-center'>
        <IconMaterialSymbolsAlignHorizontalCenter className='size-16px' />
      </Radio.Button>
      <Radio.Button value={TwoColumnModeAlign.Right} className='inline-flex-center'>
        <IconMaterialSymbolsAlignHorizontalRight className='size-16px' />
      </Radio.Button>
    </Radio.Group>
  )
}
