import { throttle, uniqBy } from 'es-toolkit'
import { antNotification } from '$modules/antd'
import { getIdbCache } from '$utility/idb'
import { fetchVideoDynamicFeeds } from '../api'
import type { DynamicFeedItem } from '$define'
import type { UpMidType } from '../store'

const cache = getIdbCache<DynamicFeedItem[]>('dynamic-feed-items')
const infoCache = getIdbCache<{ count: number; updatedAt: number }>('dynamic-feed-items-info') // cache.get is expensive
export { cache as localDynamicFeedCache, infoCache as localDynamicFeedInfoCache }

export async function hasLocalDynamicFeedCache(upMid: UpMidType) {
  const existing = await infoCache.get(upMid)
  return !!existing?.count
}

export function createUpdateSearchCacheNotifyFns(upMid: UpMidType, upName: string) {
  const notiKey = (mid: UpMidType) => `update-search-cache-${mid}`

  const _onProgress: OnProgress = (page: number, total: number) => {
    antNotification.info({
      icon: <IconSvgSpinnersBarsRotateFade className='size-16px' />,
      key: notiKey(upMid),
      title: `搜索缓存更新中...`,
      description: `「${upName}」更新中: Page(${page}) Total(${total})`,
      duration: false, // do not auto close
    })
  }

  // do not update UI too frequently
  const onProgress = throttle(_onProgress, 200)

  const onSuccess = () => {
    onProgress.flush()
    antNotification.success({
      key: notiKey(upMid),
      title: `缓存更新成功`,
      description: `「${upName}」的搜索缓存更新成功`,
      duration: false, // do not auto close
    })
  }

  return { notifyOnProgress: onProgress, notifyOnSuccess: onSuccess }
}

export async function updateLocalDynamicFeedCache(upMid: UpMidType, onProgress?: OnProgress) {
  if (await hasLocalDynamicFeedCache(upMid)) {
    // perform incremental update
    await performIncrementalUpdate(upMid)
  } else {
    // perform full update
    await performFullUpdate(upMid, undefined, onProgress)
  }
}

/**
 * 近期已经更新过, 不要再更新了
 */
export async function performIncrementalUpdateIfNeed(upMid: UpMidType, force = false) {
  const info = await infoCache.get(upMid)
  if (!force && info && info.count && info.updatedAt && Date.now() - info.updatedAt < 60 * 1000) {
    return
  }
  return performIncrementalUpdate(upMid)
}

async function performIncrementalUpdate(upMid: UpMidType) {
  // it's built for "incremental"
  if (!(await hasLocalDynamicFeedCache(upMid))) return

  const existing = (await cache.get(upMid)) || []
  const existingIds = new Set(existing.map((x) => x.id_str))

  let page = 1
  let offset = ''
  let hasMore = true
  let newItems: DynamicFeedItem[] = []

  while (hasMore) {
    const data = await fetchVideoDynamicFeeds({ upMid, page, offset })
    const items = data.items
    newItems = [...newItems, ...items]
    offset = data.offset
    hasMore = data.has_more
    page++

    if (hasMore && existingIds.size) {
      const allIncluded = items.every((item) => existingIds.has(item.id_str))
      if (allIncluded) {
        hasMore = false
      }
    }
  }

  const allItems = uniqBy([...newItems, ...existing], (x) => x.id_str)
  await cache.set(upMid, allItems)
  await infoCache.set(upMid, { count: allItems.length, updatedAt: Date.now() })
}

const fullUpdateInProgressCache = getIdbCache<{
  page: number
  offset: string
  items: DynamicFeedItem[]
}>('dynamic-feed-items-in-progress')

export type OnProgress = (page: number, total: number) => void

async function performFullUpdate(upMid: UpMidType, skipCache = false, onProgress?: OnProgress) {
  const inProgressCached = skipCache ? undefined : await fullUpdateInProgressCache.get(upMid)
  let page = inProgressCached?.page ?? 1
  let offset = inProgressCached?.offset ?? ''
  let allItems: DynamicFeedItem[] = inProgressCached?.items ?? []
  let hasMore = true

  while (hasMore) {
    const data = await fetchVideoDynamicFeeds({ upMid, page, offset })
    const items = data.items
    allItems = [...allItems, ...items]
    offset = data.offset
    hasMore = data.has_more
    page++

    // save cache for future continuation
    await fullUpdateInProgressCache.set(upMid, { page, offset, items: allItems })

    // report progress
    onProgress?.(page, allItems.length)
  }

  // completed
  const _allItems = uniqBy(allItems, (x) => x.id_str)
  await cache.set(upMid, _allItems)
  await infoCache.set(upMid, { count: _allItems.length, updatedAt: Date.now() })
  await fullUpdateInProgressCache.delete(upMid)
}
