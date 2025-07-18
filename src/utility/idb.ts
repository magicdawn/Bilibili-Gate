/**
 * indexedDB related
 */

import { isNil, throttle } from 'es-toolkit'
import localforage from 'localforage'
import pMemoize, { type AnyAsyncFunction } from 'p-memoize'
import { limitFunction } from 'promise.map'
import { APP_NAMESPACE } from '$common'
import { whenIdle } from './dom'
import type { AsyncReturnType } from 'type-fest'

export type IdbCache<T> = ReturnType<typeof getIdbCache<T>>

export function getIdbCache<T>(tableName: string) {
  const db = localforage.createInstance({
    driver: localforage.INDEXEDDB,
    name: APP_NAMESPACE,
    storeName: tableName,
  })
  return {
    db,
    get(key: string | number) {
      return db.getItem<T>(key.toString())
    },
    set(key: string | number, entry: T) {
      return db.setItem(key.toString(), entry)
    },
    delete(key: string | number) {
      return db.removeItem(key.toString())
    },
  }
}

export function wrapWithIdbCache<T extends AnyAsyncFunction>({
  fn,
  generateKey,
  tableName,
  ttl,
  concurrency, // concurrency for `fn`
  autoCleanUp = true,
}: {
  fn: T
  generateKey: (...args: Parameters<T>) => string
  tableName: string | IdbCache<unknown>
  ttl: number
  concurrency?: number
  autoCleanUp?: boolean
}) {
  type A = Parameters<T>
  type ValueType = AsyncReturnType<T>
  type CacheEntry = { ts: number; val: ValueType }

  const cache = typeof tableName === 'string' ? getIdbCache<CacheEntry>(tableName) : (tableName as IdbCache<CacheEntry>)

  const cleanUp = throttle(() => {
    cache.db.iterate((cached: CacheEntry, key) => {
      if (!shouldReuseCached(cached)) {
        cache.db.removeItem(key)
      }
    })
  }, 1000)

  if (autoCleanUp) {
    whenIdle().then(cleanUp)
  }

  function shouldReuseCached(cached: CacheEntry | null | undefined): boolean {
    return Boolean(cached && cached.val && cached.ts && Date.now() - cached.ts <= ttl)
  }

  async function queryCache(...args: A) {
    const key = generateKey(...args)
    const cached = await cache.get(key)
    if (cached && shouldReuseCached(cached)) {
      return cached.val
    }
  }

  const fnLimited = concurrency && concurrency > 0 ? (limitFunction(fn, concurrency) as T) : fn

  const fnMemoized = pMemoize<T, string>(fnLimited, {
    cacheKey(args) {
      return generateKey(...args)
    },
    cache: {
      async has(key) {
        const cached = await cache.get(key)
        return shouldReuseCached(cached)
      },
      async get(key) {
        const cached = await cache.get(key)
        if (cached && shouldReuseCached(cached)) return cached.val
      },
      async set(key, val) {
        if (isNil(val)) return
        await cache.set(key, { val, ts: Date.now() })
      },
      async delete(key) {
        await cache.delete(key)
      },
    },
  })

  Object.defineProperties(fnMemoized, {
    cache: { value: cache },
    cleanUp: { value: cleanUp },
    generateKey: { value: generateKey },
    shouldReuseCached: { value: shouldReuseCached },
    queryCache: { value: queryCache },
  })

  return fnMemoized as typeof fnMemoized & {
    cache: typeof cache
    cleanUp: typeof cleanUp
    generateKey: typeof generateKey
    shouldReuseCached: typeof shouldReuseCached
    queryCache: typeof queryCache
  }
}
