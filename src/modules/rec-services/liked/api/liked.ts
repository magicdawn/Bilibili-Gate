import { Panic, Result } from 'better-result'
import { settings } from '$modules/settings'
import { gmrequest, WebApiError } from '$request'
import { appApiCommonParams, NeedValidAccessKeyError } from '$utility/app-api'
import { getUid } from '$utility/cookie'
import type { AppSpaceLikedJson } from './liked.api'

/**
 * https://app.bilibili.com/x/v2/space/likearc
 */
export function fetchMyLikedVideos(ps = 20, pn = 1) {
  return Result.gen(async function* () {
    if (!settings.accessKey) return Result.err(new NeedValidAccessKeyError())
    const uid = getUid()
    if (!uid) return Result.err(new Panic({ message: '未登录: 找不到 uid' }))
    const resp = yield* await gmrequest.safeGet<AppSpaceLikedJson>(`/x/v2/space/likearc`, {
      responseType: 'json',
      params: { ...appApiCommonParams, vmid: uid, mid: uid, ps, pn },
    })
    const json = yield* WebApiError.validateAxiosResponse(resp, '获取喜欢列表失败')
    return Result.ok(json.data)
  })
}
