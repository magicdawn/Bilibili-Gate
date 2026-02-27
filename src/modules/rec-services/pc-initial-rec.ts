import { baseDebug } from '$common'
import { poll } from '$utility/dom'
import type { PcRecItem } from '$define'

const debug = baseDebug.extend('modules:rec-services:pc-initial-rec')

export async function getWebInitialRecommendItems(abortSignal: AbortSignal): Promise<PcRecItem[]> {
  // wait `window.__pinia`, then use `feed.data.recommend.item`
  const __pinia = await poll(() => (globalThis as any).__pinia, { interval: 100, timeout: 1_000, abortSignal })
  const items: PcRecItem[] = __pinia?.feed?.data?.recommend?.item || []
  debug('initial rec items: %o', items)
  return items
}
