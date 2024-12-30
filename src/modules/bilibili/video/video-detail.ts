import { request } from '$request'
import { wrapWithIdbCache } from '$utility/idb'
import ms from 'ms'
import type { VideoDetailJson } from './video-detail-types'

/**
 * @see https://socialsisteryi.github.io/bilibili-API-collect/docs/video/info.html
 */

async function __fetchVideoDetail(bvid: string) {
  const res = await request.get('/x/web-interface/view', { params: { bvid } })
  const json = res.data as VideoDetailJson
  const data = json.data
  return data
}

export const getVideoDetail = wrapWithIdbCache({
  fn: __fetchVideoDetail,
  generateKey: (bvid) => bvid,
  tableName: 'video_detail',
  ttl: ms('3M'),
})

export async function getVideoCid(bvid: string) {
  const detail = await getVideoDetail(bvid)
  return detail.cid
}
