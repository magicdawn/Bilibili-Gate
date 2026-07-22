import { Panic, Result } from 'better-result'
import ms from 'ms'
import { baseDebug } from '$common'
import { getLoginStatus } from '$modules/login-status'
import { request, WebApiError } from '$request'
import { getUid } from '$utility/cookie'
import { proxySetWithGmStorage, proxyWithGmStorage } from '$utility/valtio'
import type { FollowingsJson } from './types/following.api'

export const { set: followedMidSet, replaceAllWith: followedMidSetReplaceAllWith } =
  await proxySetWithGmStorage<string>('followed-mids')

export const followedMidSetInfoStore = await proxyWithGmStorage({ updatedAt: 0 }, 'followed-mids-info')

const debug = baseDebug.extend('modules:bilibili:relations:following-state')

export function fetchFollowing(pageSize: number, pageNum: number) {
  return Result.gen(async function* () {
    if (!getLoginStatus()) return Result.err(new Panic({ message: '未登录' }))
    const mid = getUid()
    if (!mid) return Result.err(new Panic({ message: '未登录' }))
    const resp = yield* await request.safeGet<FollowingsJson>('/x/relation/followings', {
      params: {
        order: 'desc',
        order_type: '',
        vmid: mid,
        ps: pageSize,
        pn: pageNum,
      },
    })
    const json = yield* WebApiError.validateAxiosResponse(resp, '获取关注列表失败')
    return Result.ok(json)
  })
}

export async function refreshAllFollowings() {
  if (!getLoginStatus()) return
  const mid = getUid()
  if (!mid) return

  const cacheValid =
    !!followedMidSet.size &&
    !!followedMidSetInfoStore.updatedAt &&
    Date.now() - followedMidSetInfoStore.updatedAt <= ms('3days')
  if (cacheValid) return

  const pageSize = 50
  let pageNum = 1
  const allMids: string[] = []
  let mids: string[]
  do {
    const result = await fetchFollowing(pageSize, pageNum)
    if (result.isErr()) return
    mids = (result.value?.data?.list || []).map((x) => x.mid.toString())
    allMids.push(...mids)
    mids.forEach((x) => followedMidSet.add(x))
    pageNum++
  } while (mids.length === pageSize)

  // replace
  debug('replace followedMids with %o', allMids)
  followedMidSetReplaceAllWith(allMids)
  followedMidSetInfoStore.updatedAt = Date.now()
}
