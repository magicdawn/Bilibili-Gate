import { Result } from 'better-result'
import { request, wbiFlag, WebApiError } from '$request'
import { getCsrfToken } from '$utility/cookie'
import type { WatchlaterItem, WatchlaterJson } from './types'

export const WatchlaterApiService = {
  fetchItems: fetchWatchlaterItems,
  batchRemove: batchRemoveWatchlater,
}

/**
 * 一次性获取所有「稍后再看」/x/v2/history/toview/web
 * next_key 分页 /x/v2/history/toview/v2/list
 *
 * @history 2024-11-14 间歇性, 有 count, 但内容为空, {count: 123, items: []}
 * @history 2025-04-09 B站新版页面由 toview/v2/list 切回 toview/web, toview/web 也支持分页了
 */
function fetchWatchlaterItems({
  asc = false,
  searchText = '',
  abortSignal,
  extraParams,
}: {
  asc?: boolean
  searchText?: string
  abortSignal?: AbortSignal
  extraParams?: Record<string, string | number>
} = {}) {
  return Result.gen(async function* () {
    const res = yield* await request.safeGet<WatchlaterJson>('/x/v2/history/toview/web', {
      [wbiFlag]: true,
      signal: abortSignal,
      params: {
        asc,
        key: searchText,
        viewed: 0, // 全部进度
        web_location: 333.881,
        ...extraParams,
      },
    })
    const json = yield* WebApiError.validateAxiosResponse(res, '获取稍后再看失败')
    return Result.ok({
      total: json.data?.count || 0,
      items: filterOutApiReturnedRecent(json.data?.list || []),
    })
  })
}

function filterOutApiReturnedRecent(items: WatchlaterItem[]) {
  // title:以下为更早添加的视频, aid:0, bvid:"", add_at:0
  // 新添加一个, 然后第一次请求 v2 API 会返回这个
  return items.filter(
    (item) => !(item.title === '以下为更早添加的视频' && item.aid === 0 && item.bvid === '' && item.add_at === 0),
  )
}

/**
 * 批量移除稍后再看 API call
 */
function batchRemoveWatchlater(avids: string[]) {
  return Result.gen(async function* () {
    const form = new FormData()
    form.append('resources', avids.join(','))
    form.append('csrf', getCsrfToken())
    const res = yield* await request.safePost('/x/v2/history/toview/v2/dels', form, { [wbiFlag]: true, params: {} })
    const json = yield* WebApiError.validateAxiosResponse(res, '移除稍后再看失败')
    return Result.ok(json)
  })
}
