import { IN_BILIBILI_HOMEPAGE } from '$common'
import { refreshAllFollowings } from '$modules/bilibili/me/relations/following-state'
import { debug } from '$modules/settings/index.shared'
import { whenIdle } from '$utility/dom'
import { blacklistMidsReplaceAllWith, getUserBlacklist } from '../../modules/bilibili/me/relations/blacklist'

export async function initMyRelations() {
  if (!IN_BILIBILI_HOMEPAGE) return // 仅首页需要
  await whenIdle()
  // 串行: 避免 request limit
  // {code: -412,message: "request was banned",ttl: 1}
  await initMyBlacklist()
  await initMyFollowings()
}

async function initMyBlacklist() {
  const ids = await getUserBlacklist()
  debug('user blocklist fetched: %o', ids)
  if (ids) {
    blacklistMidsReplaceAllWith(ids.map((x) => x.toString()))
  }
}

function initMyFollowings() {
  return refreshAllFollowings()
}
