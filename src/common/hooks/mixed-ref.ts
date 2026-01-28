import { isNil } from 'es-toolkit'
import { useMemo, useRef, type Ref, type RefObject } from 'react'

export function setRefValue<T>(ref: Ref<T> | undefined, value: T) {
  if (isNil(ref)) return
  if (typeof ref === 'function') {
    ref(value)
  } else {
    ref.current = value
  }
}

export function useDelegatedRef<T>(...innerRefs: Array<Ref<T> | undefined>): RefObject<T | null> {
  const ref = useRef<T | null>(null)
  return useMemo(() => {
    return {
      get current() {
        return ref.current
      },
      set current(val: T | null) {
        ref.current = val
        innerRefs.forEach((r) => r && setRefValue(r, val))
      },
    }
  }, [ref, ...innerRefs])
}
