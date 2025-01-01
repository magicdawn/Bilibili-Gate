import { baseDebug, HOST_APP, OPERATION_FAIL_MSG } from '$common'
import type { AppRecItem, PvideoJson } from '$define'
import { getVideoPlayUrl } from '$modules/bilibili/video/play-url'
import { getVideoDetail } from '$modules/bilibili/video/video-detail'
import type { VideoDetailData } from '$modules/bilibili/video/video-detail-types'
import { gmrequest, isWebApiSuccess, request } from '$request'
import { getCsrfToken } from '$utility/cookie'
import toast from '$utility/toast'
import ms from 'ms'
import { getVideoshotJson, isVideoshotDataValid } from './videoshot'

const debug = baseDebug.extend('VideoCard:services')

/**
 * 添加/删除 "稍后再看"
 * add 支持 avid & bvid, del 只支持 avid. 故使用 avid
 */

function watchlaterFactory(action: 'add' | 'del') {
  return async function watchlaterOp(avid: string) {
    const form = new URLSearchParams({
      aid: avid,
      csrf: getCsrfToken(),
    })
    const res = await request.post('/x/v2/history/toview/' + action, form)

    // {
    //     "code": 0,
    //     "message": "0",
    //     "ttl": 1
    // }
    const json = res.data
    const success = isWebApiSuccess(json)

    if (!success) {
      toast(json?.message || '出错了')
    }

    return success
  }
}

export const watchlaterAdd = watchlaterFactory('add')
export const watchlaterDel = watchlaterFactory('del')

/**
 * 不喜欢 / 撤销不喜欢
 * https://github.com/indefined/UserScripts/blob/master/bilibiliHome/bilibiliHome.API.md
 *
 * 此类内容过多 reason_id = 12
 * 推荐过 reason_id = 13
 */
const dislikeFactory = (type: 'dislike' | 'cancel') => {
  const pathname = {
    dislike: '/x/feed/dislike',
    cancel: '/x/feed/dislike/cancel',
  }[type]

  return async function (item: AppRecItem, reasonId: number) {
    const res = await gmrequest.get(HOST_APP + pathname, {
      params: {
        goto: item.goto,
        id: item.param,

        // mid: item.mid,
        // rid: item.tid,
        // tag_id: item.tag?.tag_id,

        reason_id: reasonId,

        // other stuffs
        build: '1',
        mobi_app: 'android',
        idx: (Date.now() / 1000).toFixed(0),
      },
    })

    // { "code": 0, "message": "0", "ttl": 1 }
    const json = res.data
    const success = isWebApiSuccess(json)

    let message = json.message
    if (!success) {
      message ||= OPERATION_FAIL_MSG
      message += `(code ${json.code})`
      message += '\n请重新获取 access_key 后重试'
    }

    return { success, json, message }
  }
}

export const dislike = dislikeFactory('dislike')
export const cancelDislike = dislikeFactory('cancel')

/**
 * 可以查询视频: 关注/点赞/投币/收藏 状态
 */
export async function getRelated(bvid: string) {
  const res = await request.get('/x/web-interface/archive/relation', {
    params: { bvid },
  })
}

/**
 * preview related
 */

// #region ImagePreview
export type ImagePreviewData = {
  videoshotJson?: PvideoJson
}

export async function fetchImagePreviewData(bvid: string): Promise<ImagePreviewData> {
  const [videoshotJson] = await Promise.all([getVideoshotJson(bvid)])
  return { videoshotJson }
}

export function isImagePreviewDataValid(data?: ImagePreviewData) {
  return isVideoshotDataValid(data?.videoshotJson?.data)
}
// #endregion

// #region VideoPreview
export type VideoPreviewData = {
  ts?: number
  playUrl?: string
  dimension?: VideoDetailData['dimension']
}

export const isVideoPreviewDataValid = (data?: VideoPreviewData): boolean => {
  if (!data) return false
  const { ts, playUrl } = data
  return Boolean(playUrl && ts && Date.now() - ts <= ms('1h'))
}

export async function fetchVideoPreviewData(bvid: string, cid?: number) {
  let playUrl: string | undefined
  let dimension: VideoDetailData['dimension'] | undefined

  if (typeof cid === 'undefined') {
    const detail = await getVideoDetail(bvid)
    cid = detail.cid
    dimension = detail.dimension
  }

  playUrl = await getVideoPlayUrl(bvid, cid)
  debug('playUrl: bvid=%s cid=%s %s', bvid, cid, playUrl)

  return { playUrl, dimension, ts: Date.now() }
}
// #endregion
