import { uniq } from 'es-toolkit'
import ms from 'ms'
import { get_w_webId } from '$modules/bilibili/risk-control/w_webid'
import { encWbi } from '$modules/bilibili/risk-control/wbi'
import { request } from '$request'
import { reusePendingPromise } from '$utility/async'
import { getUid } from '$utility/cookie'
import { getIdbCache } from '$utility/idb'
import type { FollowGroupContent, FollowGroupContentJson } from './types/group-content'
import type { FollowGroupsJson } from './types/groups'

/**
 * 其中返回的没有 "悄悄关注", 而且悄悄关注使用 API /x/relation/whispers
 */
export async function getAllFollowGroups({ removeEmpty = true }: { removeEmpty?: boolean } = {}) {
  const params = await encWbi({
    web_location: '0.0',
    w_webid: (await get_w_webId()) || '',
  })
  const res = await request.get('/x/relation/tags', { params })
  const json = res.data as FollowGroupsJson
  const groups = json.data || []
  if (removeEmpty) {
    return groups.filter((x) => !!x.count)
  }
  return groups
}

export async function getFollowGroupMids(tagid: number | string) {
  const ps = 20

  const singleRequest = async (page: number) => {
    const res = await request.get('/x/relation/tag', {
      params: { mid: getUid(), tagid, pn: page, ps },
    })
    const json = res.data as FollowGroupContentJson
    return json.data || []
  }

  let pn = 1
  let items: FollowGroupContent[] = []
  // Rule 有 bug, 在 while 里用了, 但它识别不到

  let currentPageItems: FollowGroupContent[] = []
  do {
    currentPageItems = await singleRequest(pn)
    items = items.concat(currentPageItems)
    pn++
  } while (currentPageItems.length === ps) // = ps, may have more

  const mids = uniq(items.map((x) => x.mid))
  return mids
}

const followGroupCache = getIdbCache<{ ts: number; val: number[] }>('follow-groups')
const MIN_GROUP_COUNT = 40 // 多于 40 才缓存
const CACHE_DURATION = ms('5min') // 缓存 5 分钟
export const getFollowGroupMidsWithCache = reusePendingPromise(async function (
  tagid: number | string,
  expectedCount: number | undefined,
) {
  const cacheKey =
    tagid !== undefined && expectedCount !== undefined && expectedCount > MIN_GROUP_COUNT
      ? `${tagid}-${expectedCount}`
      : undefined
  const cached = cacheKey ? await followGroupCache.get(cacheKey) : undefined
  if (cached && cached.val && cached.ts && Date.now() - cached.ts <= CACHE_DURATION) return cached.val
  const val = await getFollowGroupMids(tagid)
  if (cacheKey) await followGroupCache.set(cacheKey, { ts: Date.now(), val })
  return val
})
