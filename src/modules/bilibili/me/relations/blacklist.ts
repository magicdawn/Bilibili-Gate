/**
 * user blacklist services
 */

import { Result } from 'better-result'
import { useSnapshot } from 'valtio'
import { validateLoginedMid } from '$modules/login-status'
import { request, WebApiError } from '$request'
import { proxySetWithGmStorage } from '$utility/valtio'
import { modifyRelations } from './common'
import type { UpMidType } from '$modules/rec-services/dynamic-feed/store'
import type { ListBlackJson } from './types/list-black.api'

export const blacklistAdd = blacklistActionFactory('follow')
export const blacklistRemove = blacklistActionFactory('remove')

export const UserBlacklistService = {
  add: blacklistAdd,
  remove: blacklistRemove,
}

export const { set: blacklistMidSet, replaceAllWith: blacklistMidSetReplaceAllWith } =
  await proxySetWithGmStorage<UpMidType>('blacklist-mids')

export function useInBlacklist(upMid?: string) {
  const set = useSnapshot(blacklistMidSet)
  return !!upMid && set.has(upMid)
}

function blacklistActionFactory(action: 'follow' | 'remove') {
  const act = action === 'follow' ? 5 : 6

  return async function blacklistAction(upMid: string) {
    const success = await modifyRelations(upMid, act)

    if (success) {
      const set = blacklistMidSet
      if (action === 'follow') {
        set.add(upMid)
      } else if (action === 'remove') {
        set.delete(upMid)
      }
    }

    return success
  }
}

export function fetchFullBlacklist() {
  const ps = 20
  const singlePage = (pn: number) => {
    return Result.gen(async function* () {
      yield* validateLoginedMid()
      const resp = yield* await request.safeGet<ListBlackJson>('/x/relation/blacks', { params: { ps, pn } })
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
        allMids = allMids.concat(mids)
      }
    }
    return Result.ok(allMids)
  })
}
