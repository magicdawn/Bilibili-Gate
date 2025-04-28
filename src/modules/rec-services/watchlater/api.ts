import { appWarn } from '$common'
import { encWbi } from '$modules/bilibili/risk-control'
import { isWebApiSuccess, request } from '$request'
import type { WatchlaterItem, WatchlaterJson } from './types'

/**
 * 一次性获取所有「稍后再看」/x/v2/history/toview/web
 * next_key 分页 /x/v2/history/toview/v2/list
 * @history 2024-11-14 间歇性, 有 count, 但内容为空, {count: 123, items: []}
 * @history 2025-04-09 B站新版页面由 toview/v2/list 切回 toview/web, toview/web 也支持分页了
 */

export async function fetchWatchlaterItems({
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
  const res = await request.get('/x/v2/history/toview/web', {
    signal: abortSignal,
    params: await encWbi({
      asc,
      key: searchText,
      viewed: 0, // 全部进度
      web_location: 333.881,
      ...extraParams,
    }),
  })

  const json = res.data as WatchlaterJson
  if (!isWebApiSuccess(json)) {
    appWarn('getAllWatchlaterItems error %s, fulljson %o', json.message, json)
    return { err: json.message }
  }

  return {
    total: json.data.count,
    items: filterOutApiReturnedRecent(json.data.list || []),
  }
}

function filterOutApiReturnedRecent(items: WatchlaterItem[]) {
  // title:以下为更早添加的视频, aid:0, bvid:"", add_at:0
  // 新添加一个, 然后第一次请求 v2 API 会返回这个
  return items.filter(
    (item) => !(item.title === '以下为更早添加的视频' && item.aid === 0 && item.bvid === '' && item.add_at === 0),
  )
}
