/**
 * 动态
 */

import { request } from '$request'
import type { DynamicPortalJSON, DynamicPortalUp } from './portal-types'

/**
 * 最近有更新的 UP
 *
 * 2026-03: `up_list_more` 参数会影响 up_list 结构
 */
export async function getRecentUpdateUpList() {
  const res = await request.get('/x/polymer/web-dynamic/v1/portal', {
    params: { up_list_more: 0 },
  })
  const json = res.data as DynamicPortalJSON
  const rawUpList = (json?.data?.up_list || []) as
    | DynamicPortalUp[]
    | { has_more: boolean; items: DynamicPortalUp[]; offset: string }
  const arr = Array.isArray(rawUpList) ? rawUpList : rawUpList.items
  return arr
}
