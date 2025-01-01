import pMemoize, { type AnyAsyncFunction } from 'p-memoize'

export function reusePendingPromise<T extends AnyAsyncFunction>(fn: T) {
  return pMemoize(fn, { cache: false })
}
