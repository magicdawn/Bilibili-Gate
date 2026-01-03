import { useMemoizedFn } from 'ahooks'
import { isEqual } from 'es-toolkit'
import { useEffect } from 'react'
import { useRefStateBox } from './useRefState'

export function useSizeExpression<T>(
  target: HTMLElement,
  fn: (entry: ResizeObserverEntry) => T,
  initialValue: T | (() => T),
) {
  const _fn = useMemoizedFn(fn)

  const box = useRefStateBox<T>(initialValue)

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === target && entry.contentRect) {
          const val = _fn(entry)
          if (!isEqual(box.val, val)) {
            // console.log('setState', val)
            box.set(val)
          }
        }
      }
    })

    observer.observe(target)

    return () => {
      observer.disconnect()
    }
  }, [target, _fn])

  return box.state
}
