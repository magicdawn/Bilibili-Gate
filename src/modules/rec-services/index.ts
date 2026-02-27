import { uniqBy } from 'es-toolkit'
import { baseDebug } from '$common'
import { getColumnCount } from '$components/RecGrid/useShortcut'
import { ETab } from '$components/RecHeader/tab-enum'
import { EApiType } from '$define/index.shared'
import { filterRecItems } from '$modules/filter'
import { normalizeCardData } from '$modules/filter/normalize'
import { settings } from '$modules/settings'
import { AppRecService } from './app'
import { PcRecService } from './pc'
import { isRecTab, type FetcherOptions } from './service-map'
import type { RecItemTypeOrSeparator } from '$define'
import type { DynamicFeedRecService } from './dynamic-feed'

const debug = baseDebug.extend('service')

export const recItemUniqer = (item: RecItemTypeOrSeparator): string => {
  if (item.api === EApiType.Separator) return item.uniqId
  const { bvid } = normalizeCardData(item)
  if (bvid) return bvid // maybe empty string: rank-pgc-season
  return item.uniqId
}

export function concatRecItems(existing: RecItemTypeOrSeparator[], newItems: RecItemTypeOrSeparator[]) {
  return uniqBy([...existing, ...newItems], recItemUniqer)
}

const willUsePcApi = (tab: ETab): tab is ETab.PcRecommend | ETab.KeepFollowOnly =>
  tab === ETab.PcRecommend || tab === ETab.KeepFollowOnly

async function fetchMinCount(count: number, fetcherOptions: FetcherOptions, filterMultiplier = 5) {
  const { tab, service, abortSignal, firstFetch } = fetcherOptions

  let items: RecItemTypeOrSeparator[] = []
  let hasMore = true

  const addMore = async (restCount: number) => {
    let cur: RecItemTypeOrSeparator[] = []

    // dynamic-feed     动态
    // watchlater       稍候再看
    // fav              收藏
    // hot              热门 (popular-general  综合热门, popular-weekly  每周必看, ranking  排行榜)
    // live             直播
    if (!isRecTab(tab)) {
      cur = (await service.loadMore(abortSignal)) ?? []
      hasMore = service.hasMore
      cur = filterRecItems(cur, tab) // filter
      items = concatRecItems(items, cur) // concat
      return
    }

    /**
     * REC_TABS
     */
    let times: number
    if (tab === ETab.KeepFollowOnly) {
      // 已关注
      times = 8
      debug('getMinCount: addMore(restCount = %s) times=%s', restCount, times)
    } else {
      // 常规
      const pagesize = willUsePcApi(tab) ? PcRecService.PAGE_SIZE : AppRecService.PAGE_SIZE
      const hasFilter = (() => {
        const { enabled, byAuthor, byTitle, minDuration, minPlayCount, minDanmakuCount } = settings.filter
        return (
          enabled ||
          byAuthor.enabled ||
          byTitle.enabled ||
          minDuration.enabled ||
          minPlayCount.enabled ||
          minDanmakuCount.enabled
        )
      })()

      const multipler = hasFilter
        ? filterMultiplier // 过滤, 需要大基数
        : 1.2 // 可能有重复, so not 1.0
      times = Math.ceil((restCount * multipler) / pagesize)
      debug(
        'getMinCount: addMore(restCount = %s) multipler=%s pagesize=%s times=%s',
        restCount,
        multipler,
        pagesize,
        times,
      )
    }

    if (willUsePcApi(tab)) {
      const s = service as PcRecService
      if (firstFetch) await s.preloadPcInitialRecItems(abortSignal)
      await s.preloadTimesFromApiIfNeeded(abortSignal, times)
    } else {
      const s = service as AppRecService
      if (!s.config.addOtherTabContents) {
        await s.preloadTimesFromApiIfNeeded(abortSignal, times)
      }
    }

    cur = (await service.loadMore(abortSignal)) || []
    cur = filterRecItems(cur, tab) // filter
    items = concatRecItems(items, cur) // concat
    hasMore = service.hasMore
  }

  await addMore(count)
  while (true) {
    // aborted
    if (abortSignal?.aborted) {
      debug('getMinCount: break for abortSignal')
      break
    }
    // no more
    if (!hasMore) {
      debug('getMinCount: break for tab=%s hasMore=false', tab)
      break
    }

    // enough
    const len = items.filter((x) => x.api !== EApiType.Separator).length
    if (len >= count) break

    await addMore(count - items.length)
  }

  return items
}

export async function refreshForHome(fetcherOptions: FetcherOptions) {
  let items = await fetchMinCount(getColumnCount(undefined, false) * 2, fetcherOptions, 5) // 7 * 2-row
  if (fetcherOptions.tab === ETab.Watchlater) {
    items = items.slice(0, 20)
  }
  return items
}

export const getGridRefreshCount = () => getColumnCount() * 4

export async function refreshForGrid(fetcherOptions: FetcherOptions) {
  let minCount = getGridRefreshCount() // 7 * 3-row, 1 screen

  // 当结果很少的, 不用等一屏
  if (fetcherOptions.tab === ETab.DynamicFeed) {
    const _service = fetcherOptions.service as DynamicFeedRecService
    if (await _service.shouldReduceMinCount()) {
      minCount = 1
    }
  }

  return fetchMinCount(minCount, fetcherOptions, 5)
}
