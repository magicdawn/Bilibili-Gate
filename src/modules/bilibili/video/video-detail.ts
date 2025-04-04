import { request } from '$request'
import { wrapWithIdbCache } from '$utility/idb'
import ms from 'ms'
import type { VideoPageListJson } from './types/page-list'
import type { VideoDetailJson } from './types/video-detail'

/**
 * 获取视频详细信息(web端)
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
  generateKey: (bvid: string) => bvid,
  tableName: 'video_detail',
  ttl: ms('3M'),
  concurrency: 3,
})

/**
 * 查询视频分P列表 (avid/bvid 转 cid)
 * 作用:
 *  - 查询 cid, 用于 playurl API 参数
 *  - 查询 dimension, 用于 LargePreview, PipWindow 等
 *  - 查询 ctime, 用于获取 IpadAppRecommendItem, 已关注时的发布时间
 */
async function __fetchVideoPageList(bvid: string) {
  const res = await request.get('/x/player/pagelist', { params: { bvid } })
  const json = res.data as VideoPageListJson
  return json?.data || []
}
export const getVideoPageList = wrapWithIdbCache({
  fn: __fetchVideoPageList,
  generateKey: (bvid: string) => bvid,
  tableName: 'video_page_list',
  ttl: ms('3M'),
  concurrency: 3,
})
