import pMemoize, { type AnyAsyncFunction } from 'p-memoize'

export function reusePendingPromise<T extends AnyAsyncFunction, CacheKeyType>(
  fn: T,
  generateKey?: (...args: Parameters<NoInfer<T>>) => CacheKeyType,
) {
  generateKey ??= (...args) => JSON.stringify(args) as CacheKeyType
  return pMemoize(fn, {
    cache: false,
    cacheKey(args) {
      return generateKey(...args)
    },
  })
}
