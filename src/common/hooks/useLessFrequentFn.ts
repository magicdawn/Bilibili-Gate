import type { AnyFunction } from '$utility/type'

/**
 * harder: 越来越难触发
 */

export function createLessFrequentFn<T extends AnyFunction>(fn: T, initialTargetTimes: number, harder = true) {
  let times = 0
  let targetTimes = initialTargetTimes
  return (...args: Parameters<T>): ReturnType<T> | undefined => {
    times++
    if (times === targetTimes) {
      times = 0
      if (harder) targetTimes++
      return fn(...args)
    }
  }
}

export function useLessFrequentFn<T extends AnyFunction>(fn: T, initialTargetTimes: number, harder = true) {
  const _fn = useMemoizedFn(fn)
  return useMemo(() => {
    return createLessFrequentFn(_fn, initialTargetTimes, harder)
  }, [_fn, initialTargetTimes, harder])
}
