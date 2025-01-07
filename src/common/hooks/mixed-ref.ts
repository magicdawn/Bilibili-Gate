import type { ForwardedRef } from 'react'

export function setForwardedRef<T>(forwardedRef: ForwardedRef<T>, value: T) {
  if (!forwardedRef) return
  if (typeof forwardedRef === 'function') {
    forwardedRef(value)
  } else {
    forwardedRef.current = value
  }
}

export function useMixedRef<T>(forwardedRef: ForwardedRef<T>) {
  const ref = useRef<T | null>(null)
  return useMemo(() => {
    return {
      get current() {
        return ref.current
      },
      set current(val: T | null) {
        ref.current = val
        setForwardedRef(forwardedRef, val)
      },
    }
  }, [ref])
}
