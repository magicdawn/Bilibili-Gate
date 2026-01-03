/**
 * https://app.bilibili.com/x/v2/space/likearc
 */

import { gmrequest } from '$request'
import { appApiCommonParams } from '$utility/app-api'
import { getUid } from '$utility/cookie'
import type { AppSpaceLikedJson } from './liked.api'

export async function fetchMyLikedVideos(ps = 20, pn = 1) {
  const uid = getUid()
  const res = await gmrequest.get(`https://app.bilibili.com/x/v2/space/likearc?mid=${uid}`, {
    responseType: 'json',
    params: { ...appApiCommonParams, vmid: uid, ps, pn },
  })
  const json = res.data as AppSpaceLikedJson
  return json
}
