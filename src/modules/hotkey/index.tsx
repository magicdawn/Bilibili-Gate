import { formatForDisplay, type Hotkey } from '@tanstack/react-hotkeys'
import { useMemo, type ComponentProps } from 'react'
import { useUnoMerge } from 'unocss-merge/react'

export const kbdClassName =
  'inline-block cursor-pointer rounded bg-gate-primary-lv-3 px-6px text-white line-height-1.2em tracking-1 font-mono'

export function CustomKbd({ className, ...restProps }: ComponentProps<'kbd'>) {
  return <kbd {...restProps} className={useUnoMerge(kbdClassName, className)} />
}

export function HotkeyDisplay({ k, ...restProps }: Omit<ComponentProps<'kbd'>, 'children'> & { k: Hotkey }) {
  const content = useMemo(() => formatForDisplay(k), [k])
  return <CustomKbd {...restProps}>{content}</CustomKbd>
}

export const soloShiftKey = (
  <CustomKbd className='mx-1 tracking-normal word-spacing-1'>{formatForDisplay('Shift')}</CustomKbd>
)
