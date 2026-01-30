import { useUnoMerge } from 'unocss-merge/react'
import type { ComponentProps } from 'react'

export const kbdClassName =
  'inline-block cursor-pointer rounded bg-gate-primary-lv-3 px-6px text-white line-height-tight font-mono'

export function CustomKbd({ className, ...restProps }: ComponentProps<'kbd'>) {
  return <kbd {...restProps} className={useUnoMerge(kbdClassName, className)}></kbd>
}

export const antSpinIndicator = (
  <IconSvgSpinnersBarsRotateFade className='text-gate-primary [.ant-spin_.ant-spin-dot&]:size-25px' />
)

export const clsAntdButton = 'flex items-center gap-x-1 [&.ant-btn:not(:disabled):focus-visible]:outline-0'

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
