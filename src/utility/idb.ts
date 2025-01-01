/**
 * indexedDB related
 */

import { APP_NAMESPACE } from '$common'
import { throttle } from 'es-toolkit'
import localforage from 'localforage'
import pLimit from 'p-limit'
import { whenIdle } from './dom'
import type { AnyFunction } from './type'

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

export function wrapWithIdbCache<T extends AnyFunction>({
  fn,
  generateKey,
  tableName,
  ttl,
  concurrency, // concurrency for `fn`
  autoCleanUp = true,
}: {
  fn: T
  generateKey: (...args: Parameters<T>) => string
  tableName: string
  ttl: number
  concurrency?: number
  autoCleanUp?: boolean
}) {
  type A = Parameters<T>
  type R = Awaited<ReturnType<T>>
  type CacheEntry = { ts: number; val: R }

  const cache = getIdbCache<CacheEntry>(tableName)
  const limit = concurrency && concurrency > 0 ? pLimit(concurrency) : undefined

  const cleanUp = throttle(async () => {
    cache.db.iterate((cached: CacheEntry, key) => {
      if (!cache || !shouldReuseCached(cached)) {
        cache.db.removeItem(key)
      }
    })
  }, 1000)

  if (autoCleanUp) {
    whenIdle().then(cleanUp)
  }

  function shouldReuseCached(cached: CacheEntry) {
    return cached.val && cached.ts && Date.now() - cached.ts <= ttl
  }

  async function wrapped(...args: A): Promise<R> {
    const key = generateKey(...args)
    const cached = await cache.get(key)
    if (cached && shouldReuseCached(cached)) return cached.val
    const result = await (limit ? limit(() => fn(...args)) : fn(...args))
    await cache.set(key, { ts: Date.now(), val: result })
    return result
  }
  Object.defineProperties(wrapped, {
    cache: { value: cache },
    cleanUp: { value: cleanUp },
    generateKey: { value: generateKey },
    shouldReuseCached: { value: shouldReuseCached },
  })

  return wrapped as {
    (...args: A): Promise<R>
    cache: typeof cache
    cleanUp: typeof cleanUp
    generateKey: typeof generateKey
    shouldReuseCached: typeof shouldReuseCached
  }
}
