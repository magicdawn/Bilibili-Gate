/**
 * https://github.com/robinjonsson/react-use-sticky/blob/master/src/index.ts
 */

import { throttle } from 'es-toolkit'
import { useEffect, useRef, useState } from 'react'

/**
 * Returns a ref, and a stateful value bound to the ref
 */
export function useSticky<T extends HTMLElement>() {
  const stickyRef = useRef<T>(null)
  const [sticky, setSticky] = useState(false)

  useEffect(() => {
    // Observe when ref enters or leaves sticky state
    // rAF https://stackoverflow.com/questions/41740082/scroll-events-requestanimationframe-vs-requestidlecallback-vs-passive-event-lis
    const observe = throttle(() => {
      if (!stickyRef.current) return
      // 有缩放时, top: 49.000003814697266
      const refPageOffset = Math.trunc(stickyRef.current.getBoundingClientRect().top * 10) / 10
      const stickyOffset = Number.parseInt(getComputedStyle(stickyRef.current).top)
      const stickyActive = refPageOffset <= stickyOffset
      setSticky(stickyActive)
    }, 50)
    observe()

    // Bind events
    document.addEventListener('scroll', observe)
    window.addEventListener('resize', observe)
    window.addEventListener('orientationchange', observe)
    return () => {
      document.removeEventListener('scroll', observe)
      window.removeEventListener('resize', observe)
      window.removeEventListener('orientationchange', observe)
    }
  }, [sticky])

  return [stickyRef, sticky] as const
}
