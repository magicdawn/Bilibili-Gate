/**
 * https://app.bilibili.com/x/v2/space/likearc
 */

import { gmrequest } from '$request'
import { appApiCommonParams } from '$utility/app-api'
import { getUid } from '$utility/cookie'

export function fetchMyLikedVideos() {
  const uid = getUid()

  return gmrequest.get(`https://app.bilibili.com/x/v2/space/likearc?mid=${uid}`, {
    responseType: 'json',
    params: {
      ...appApiCommonParams,
      vmid: uid,
      ps: 20,
      pn: 1,
    },
  })
}
