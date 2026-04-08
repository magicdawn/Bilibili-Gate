import { formatForDisplay, type RegisterableHotkey } from '@tanstack/react-hotkeys'
import { useMemo, type ComponentProps } from 'react'
import { useUnoMerge } from 'unocss-merge/react'

export const kbdClassName =
  'inline-block cursor-pointer rounded bg-gate-primary-lv-3 p-1 font-size-12px text-white leading-[0.9] font-mono'

export function HotkeyDisplay({
  k,
  className,
  ...restProps
}: Omit<ComponentProps<'kbd'>, 'children'> & { k: RegisterableHotkey | (string & {}) }) {
  const content = useMemo(() => formatForDisplay(k), [k])
  return (
    <kbd {...restProps} className={useUnoMerge(kbdClassName, className)}>
      {content}
    </kbd>
  )
}

export const soloShiftKey = <HotkeyDisplay className='mx-1' k='Shift' />
