import { formatKeyForDebuggingDisplay } from '@tanstack/react-hotkeys'
import { CustomKbd } from '$components/fragments'

export const soloShiftKey = (
  <CustomKbd className='mx-1 tracking-normal word-spacing-1'>{formatKeyForDebuggingDisplay('Shift')}</CustomKbd>
)
