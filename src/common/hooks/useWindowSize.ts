import { useSyncExternalStore } from 'react'
import { valtioFactory } from '$utility/valtio'

type Size = [width: number, height: number]
let size: Size = [window.innerWidth, window.innerHeight]

export function useWindowSize() {
  return useSyncExternalStore(
    () => {
      const handler = () => {
        size = [window.innerWidth, window.innerHeight]
      }
      window.addEventListener('resize', handler)
      window.addEventListener('orientationchange', handler)
      return () => {
        window.removeEventListener('resize', handler)
        window.removeEventListener('orientationchange', handler)
      }
    },
    () => size,
  )
}

export const $windowSize = valtioFactory(() => ({
  width: window.innerWidth,
  height: window.innerHeight,
}))

document.addEventListener('resize', $windowSize.updateThrottled)
document.addEventListener('orientationchange', $windowSize.updateThrottled)
