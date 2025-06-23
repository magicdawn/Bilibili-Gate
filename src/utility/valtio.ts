import { isEqual, pick, throttle, toMerged } from 'es-toolkit'
import { pLimit } from 'promise.map'
import { proxy, snapshot, subscribe, useSnapshot } from 'valtio'
import { proxyMap, proxySet } from 'valtio/utils'
import { reciveGmValueUpdatesFromOtherTab } from '$modules/gm'

export function valtioFactory<T>(computeValue: () => T) {
  const state = proxy({ value: computeValue() })

  function use() {
    return useSnapshot(state).value
  }

  function get() {
    return state.value
  }

  function update() {
    state.value = computeValue()
  }

  const updateThrottled = throttle(update, 100, { edges: ['leading', 'trailing'] })

  return { state, use, get, update, updateThrottled }
}

export function subscribeOnKeys<T extends object>(state: T, keys: (keyof T)[], callback: (newState: T) => void) {
  let prevVal = pick(snapshot(state) as T, keys)

  subscribe(state, () => {
    const snap = snapshot(state)
    const val = pick(snap as T, keys)
    if (!isEqual(prevVal, val)) {
      callback(snap as T)
    }
    prevVal = val
  })
}

export function proxyWithLocalStorage<T extends object>(initialVaue: T, storageKey: string) {
  const allowedKeys = Object.keys(initialVaue)
  const savedValue = pick(JSON.parse(localStorage.getItem(storageKey) || '{}') as any, allowedKeys)

  const p = proxy<T>({
    ...initialVaue,
    ...savedValue,
  })

  // start subscribe in nextTick, so value can be changed synchronously without persist
  setTimeout(() => {
    subscribe(p, () => {
      const val = snapshot(p)
      localStorage.setItem(storageKey, JSON.stringify(val))
    })
  })

  return p
}

export async function proxyWithGmStorage<T extends object>(initialVaue: T, storageKey: string) {
  async function load() {
    const allowedKeys = Object.keys(initialVaue)
    return pick(((await GM.getValue(storageKey)) || {}) as any, allowedKeys)
  }
  const p = proxy<T>({
    ...initialVaue,
    ...(await load()),
  })

  // start subscribe in nextTick, so value can be changed synchronously without persist
  setTimeout(() => {
    const limit = pLimit(1) // works like a mutex lock
    subscribe(p, () =>
      limit(async () => {
        const existing = await load()
        const newValue = toMerged(existing, snapshot(p) as object)
        GM.setValue(storageKey, newValue)
      }),
    )
  })

  return p
}

export async function proxySetWithGmStorage<T>(storageKey: string) {
  const load = async (): Promise<T[]> => (await GM.getValue(storageKey)) || []
  const p = proxySet<T>(await load())
  const replaceAllWith = (newVal: Iterable<T>) => {
    const newSet = new Set(newVal)
    for (const x of [...p, ...newSet]) {
      if (!newSet.has(x)) p.delete(x)
      else p.add(x)
    }
  }

  // start subscribe in nextTick, so value can be changed synchronously without persist
  setTimeout(setupSubscribe)
  let persist = true
  function setupSubscribe() {
    subscribe(p, () => {
      if (!persist) return
      GM.setValue(storageKey, Array.from(snapshot(p)))
    })
    reciveGmValueUpdatesFromOtherTab({
      storageKey,
      setPersist: (val) => (persist = val),
      onUpdate: replaceAllWith,
    })
  }

  // p is sealed, can't be modified
  return {
    set: p,
    replaceAllWith,
  }
}

export async function proxyMapWithGmStorage<K, V>(storageKey: string, beforeSave?: (vals: [K, V][]) => [K, V][]) {
  const load = async (): Promise<[K, V][]> => (await GM.getValue(storageKey)) || []
  const p = proxyMap<K, V>(await load())
  const replaceAllWith = (newVal: Iterable<[K, V]>) => {
    const newMap = new Map(newVal)
    for (const [k, v] of [...p, ...newMap]) {
      if (!newMap.has(k)) p.delete(k)
      else p.set(k, v)
    }
  }

  // start subscribe in nextTick, so value can be changed synchronously without persist
  setTimeout(setupSubscribe)
  let persist = true
  function setupSubscribe() {
    subscribe(p, () => {
      if (!persist) return
      let val = Array.from(snapshot(p))
      if (beforeSave) val = beforeSave(val)
      GM.setValue(storageKey, val)
    })

    // reload when other tab change storage value
    reciveGmValueUpdatesFromOtherTab<[K, V][]>({
      storageKey,
      setPersist: (val) => (persist = val),
      onUpdate: replaceAllWith,
    })
  }

  return {
    map: p,
    replaceAllWith,
  }
}
