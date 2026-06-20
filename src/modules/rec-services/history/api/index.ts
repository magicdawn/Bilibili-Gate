import { Result } from 'better-result'
import { request, WebApiError } from '$request'
import { getCsrfToken } from '$utility/cookie'
import type { EHistoryDeviceType, EHistoryItemType } from '../enums'
import type { CursorState, HistoryCursorJson } from './history-cursor.api'
import type { HistorySearchJson } from './history-search.api'

export const HistoryApiService = {
  cursor: fetchHistoryCursor,
  search: fetchHistorySearch,
  delete: deleteHistory,
}

function fetchHistoryCursor({
  itemType,
  cursorState,
  ps = 20,
  abortSignal,
}: {
  itemType: EHistoryItemType
  cursorState: CursorState | undefined
  ps?: number
  abortSignal?: AbortSignal
}) {
  return Result.gen(async function* () {
    const resp = yield* await request.safeGet<HistoryCursorJson>('/x/web-interface/history/cursor', {
      signal: abortSignal,
      params: {
        max: cursorState?.max || 0,
        view_at: cursorState?.view_at || 0,
        business: cursorState?.business || '',
        type: itemType,
        ps,
      },
    })
    const json = yield* WebApiError.validateAxiosResponse(resp)
    const { cursor, list } = json.data || {}
    return Result.ok({ hasMore: !!list?.length, list: list ?? [], cursor })
  })

  // s.value = (W = P == null ? void 0 : P.cursor.view_at) != null ? W : 0,
  // u.value = (N = P == null ? void 0 : P.cursor.max) != null ? N : 0,
  // c.value = (w = P == null ? void 0 : P.cursor.business) != null ? w : Et.UNKNOWN
  // stop condition: (!data.list.length)
}

function fetchHistorySearch({
  itemType,
  keyword,
  deviceType,
  pn,
  abortSignal,
}: {
  itemType: EHistoryItemType
  keyword: string
  deviceType: EHistoryDeviceType
  pn: number
  abortSignal?: AbortSignal
}) {
  return Result.gen(async function* () {
    const resp = yield* await request.safeGet<HistorySearchJson>('/x/web-interface/history/search', {
      signal: abortSignal,
      params: {
        pn,
        keyword,
        business: itemType,
        device_type: deviceType,
        add_time_start: 0, // 添加时间
        add_time_end: 0,
        arc_max_duration: 0, // 视频时长
        arc_min_duration: 0,
      },
    })
    const json = yield* WebApiError.validateAxiosResponse(resp)
    let { has_more, list, page } = json.data || {}
    list ||= []
    return Result.ok({ hasMore: has_more, page, list })
  })
}

/**
 * `:business_:kid` 格式
 * 多个使用 `,` 分割, 如: `archive_kid,archive_kid`
 */
function deleteHistory(kid: string) {
  return Result.gen(async function* () {
    const form = new URLSearchParams({ kid, csrf: getCsrfToken() })
    const resp = yield* await request.safePost<{ code: number; message: string }>('/x/v2/history/delete', form)
    const json = yield* WebApiError.validateAxiosResponse(resp)
    return Result.ok(json)
  })
}
