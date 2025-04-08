import { appWarn } from '$common'
import { isWebApiSuccess, request } from '$request'
import { wrapWithIdbCache } from '$utility/idb'
import ms from 'ms'
import { get_w_webId } from '../risk-control/w_webid'
import type { SpaceAccInfoJson } from './space-acc-info-types'

async function __fetchSpaceAccInfo(mid: string | number) {
  const res = await request.get('/x/space/wbi/acc/info', {
    params: { mid, w_webid: (await get_w_webId()) || '' },
  })
  const json = res.data as SpaceAccInfoJson
  if (!isWebApiSuccess(json)) {
    appWarn('space acc info error for %s: %o', mid, json)
    return
  }
  const info = json.data
  return info
}

export const getSpaceAccInfo = wrapWithIdbCache({
  fn: __fetchSpaceAccInfo,
  generateKey: (mid) => mid.toString(),
  tableName: 'space-acc-info',
  ttl: ms('10d'),
  concurrency: 2, // 因在 react component 中使用, 可能会导致瞬时并发, 引发风控
})
