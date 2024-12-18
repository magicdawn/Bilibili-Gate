import { isSafari } from '$ua'
import pLimit from 'p-limit'

export function openNewTab(url: string, active = true) {
  if (isSafari) {
    // https://github.com/quoid/userscripts?tab=readme-ov-file#api
    GM.openInTab(url, !active)
  } else {
    GM.openInTab(url, {
      active,
      insert: true,
      setParent: true,
    })
  }
}

export function reciveGmValueUpdatesFromOtherTab<T>({
  storageKey,
  onUpdate,
  setPersist,
}: {
  storageKey: string
  onUpdate: (newValue: T) => void
  setPersist: (val: boolean) => void
}) {
  // check if script manager support this API
  // safari Userscripts has only `GM.` API, this API is only available on `GM_`
  if (typeof GM_addValueChangeListener === 'undefined') return

  const limit = pLimit(1) // mutex
  GM_addValueChangeListener<T>(storageKey, (name, oldValue, newValue, remote) => {
    if (!remote) return
    if (!newValue) return
    limit(async () => {
      setPersist(false)
      try {
        onUpdate(newValue)
      } finally {
        // https://github.com/pmndrs/valtio/blob/v2.1.2/src/vanilla.ts#L294
        // subscribe() is using microtask to call it's callback
        // so we also use a microtask to set `persist = true` is safe
        await Promise.resolve().then(() => {
          setPersist(true)
        })
      }
    })
  })
}
