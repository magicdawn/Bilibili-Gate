import pMemoize, { type AnyAsyncFunction } from 'p-memoize'

export function reusePendingPromise<FunctionToMemoize extends AnyAsyncFunction, CacheKeyType>(
  fn: FunctionToMemoize,
  generateKey?: (
    ...args: Parameters<NoInfer<FunctionToMemoize>>
  ) => CacheKeyType extends PromiseLike<unknown> ? never : CacheKeyType,
) {
  generateKey ??= (...args) => JSON.stringify(args) as CacheKeyType extends PromiseLike<unknown> ? never : CacheKeyType
  return pMemoize(fn, {
    cache: false,
    cacheKey(args) {
      return generateKey(...args)
    },
  })
}
