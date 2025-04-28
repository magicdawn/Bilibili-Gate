import { get_w_webId } from '$modules/bilibili/risk-control/w_webid'
import { encWbi } from '$modules/bilibili/risk-control/wbi'
import { request } from '$request'
import { getUid } from '$utility/cookie'
import { uniq } from 'es-toolkit'
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

export async function getFollowGroupContent(tagid: number | string) {
  const ps = 20

  const singleRequest = async (page: number) => {
    const res = await request.get('/x/relation/tag', {
      params: {
        mid: getUid(),
        tagid,
        pn: page,
        ps,
      },
    })
    const json = res.data as FollowGroupContentJson
    return json.data || []
  }

  let pn = 1
  let items: FollowGroupContent[] = []
  let currentPageItems: FollowGroupContent[] = []
  do {
    currentPageItems = await singleRequest(pn++)
    items = items.concat(currentPageItems)
  } while (currentPageItems.length > 0)

  const mids = uniq(items.map((x) => x.mid))
  return mids
}
