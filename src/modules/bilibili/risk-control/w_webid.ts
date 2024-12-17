/**
 * 获取 w_webid
 * https://github.com/SocialSisterYi/bilibili-API-collect/discussions/1104
 *
 * 根据实际使用, 是不区分目标 mid, 使用自己的 mid 获取 w_webid 即可, 所以按照日期缓存即可
 */

import { dailyCache } from '$modules/gm/daily-cache'
import { formatSpaceUrl } from '$modules/rec-services/dynamic-feed/shared'
import { request } from '$request'
import { createUpdateDataFunction } from '$utility/async'
import { getUid } from '$utility/cookie'

const cache = dailyCache<string>('w_webid')

export const get_w_webId = createUpdateDataFunction({
  fn: fetch_w_webId,
  getCached() {
    return cache.get()
  },
})

async function fetch_w_webId(): Promise<string | undefined> {
  const mid = getUid()
  if (!mid) return

  const spacePageUrl = formatSpaceUrl(mid)
  const res = await request.get(spacePageUrl, {
    responseType: 'text',
    withCredentials: true,
  })
  const html = res.data
  const parser = new DOMParser()
  const parsed = parser.parseFromString(html, 'text/html')

  const jsonText = decodeURIComponent(
    parsed.getElementById('__RENDER_DATA__')?.innerText.trim() || '',
  )
  if (!jsonText) return

  const id = (JSON.parse(jsonText) as any)?.access_id
  if (id) await cache.set(id)

  return id
}
