import { Result } from 'better-result'
import { validateLoginedMid } from '$modules/login-status'
import { request, WebApiError } from '$request'
import { proxySetWithGmStorage } from '$utility/valtio'
import type { FollowingsJson } from './types/following.api'

export const { set: followedMidSet, replaceAllWith: followedMidSetReplaceAllWith } =
  await proxySetWithGmStorage<string>('followed-mids')

export function fetchFullFollowings() {
  const ps = 50
  const singlePage = (pn: number) => {
    return Result.gen(async function* () {
      const mid = yield* validateLoginedMid()
      const params = { order: 'desc', order_type: '', vmid: mid, ps, pn }
      const resp = yield* await request.safeGet<FollowingsJson>('/x/relation/followings', { params })
      const json = yield* WebApiError.validateAxiosResponse(resp, '获取关注列表失败')
      const total = json?.data?.total || 0
      const mids = (json?.data?.list || []).map((x) => x.mid)
      return Result.ok({ total, mids })
    })
  }
  return Result.gen(async function* () {
    let { total, mids: allMids } = yield* await singlePage(1)
    if (total) {
      const maxPn = Math.ceil(total / ps)
      for (let pn = 2; pn <= maxPn; pn++) {
        const { mids } = yield* await singlePage(pn)
        // side-effect: add to store
        mids.forEach((x) => followedMidSet.add(x.toString()))
        allMids = allMids.concat(mids)
      }
    }
    return Result.ok(allMids)
  })
}
