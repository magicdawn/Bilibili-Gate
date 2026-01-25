export const kbdClassName = 'inline-block cursor-pointer rounded bg-gate-primary-lv-2 px-1 text-white font-mono'

export const antSpinIndicator = (
  <IconSvgSpinnersBarsRotateFade className='text-gate-primary [.ant-spin_.ant-spin-dot&]:size-25px' />
)

export const clsAntdButton =
  'flex items-center gap-x-1 [&>span]:line-height-[1] [&.ant-btn:not(:disabled):focus-visible]:outline-0'

// z-index
export function parseZ(className: `z-${string}`) {
  if (!/^z-\d+$/.test(className)) return undefined
  return Number.parseInt(className.slice(2))
}

export const clsZRecHeader = 'z-1001' // Evolved custom-header z-index:10001; .bili-header__bar z-index:1002;
export const clsZGateFloatEntry = 'z-10004'
export const clsZBaseModal = 'z-10005'
export const clsZAntdPopupBase = 'z-11000'
export const clsZVideoCardLargePreview = 'z-11200'
export const clsZVideoCardContextMenu = 'z-11300'
export const clsZToast = 'z-90000'
