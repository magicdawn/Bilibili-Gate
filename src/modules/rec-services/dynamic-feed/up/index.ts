/**
 * 动态
 */

import { request } from '$request'
import type { DynamicPortalJSON } from './portal-types'

/**
 * 最近有更新的 UP
 */
export async function getRecentUpdateUpList() {
  const res = await request.get('/x/polymer/web-dynamic/v1/portal')
  const json = res.data as DynamicPortalJSON
  const list = json?.data?.up_list || []
  return list
}
