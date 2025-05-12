import { baseDebug, HOST_APP, OPERATION_FAIL_MSG } from '$common'
import { getVideoPlayUrl } from '$modules/bilibili/video/play-url'
import { getVideoPageList } from '$modules/bilibili/video/video-detail'
import { gmrequest, isWebApiSuccess, request } from '$request'
import { reusePendingPromise } from '$utility/async'
import { getCsrfToken } from '$utility/cookie'
import toast from '$utility/toast'
import ms from 'ms'
import QuickLRU from 'quick-lru'
import { getVideoshotJson, isVideoshotDataValid } from './videoshot'
import type { AppRecItem, PvideoJson } from '$define'
import type { VideoPage } from '$modules/bilibili/video/types/page-list'

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
    const res = await request.post(`/x/v2/history/toview/${action}`, form)

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
  const videoshotJson = await getVideoshotJson(bvid)
  return { videoshotJson }
}

export function isImagePreviewDataValid(data?: ImagePreviewData) {
  return isVideoshotDataValid(data?.videoshotJson?.data)
}
// #endregion

// #region! VideoPreview
export type VideoPreviewData = {
  playUrls?: string[]
  dimension?: VideoPage['dimension']
}

export const isVideoPreviewDataValid = (data?: VideoPreviewData): boolean => {
  return !!data?.playUrls?.length
}

const videoPreviewCache = new QuickLRU<string, VideoPreviewData>({
  maxSize: 1_0000,
  maxAge: ms('1h'),
})

export const fetchVideoPreviewData = reusePendingPromise(
  async ({
    bvid,
    cid,
    useMp4,
    preferNormalCdn,
    aspectRatioFromItem,
  }: {
    bvid: string
    cid: number | undefined
    useMp4: boolean
    preferNormalCdn: boolean
    aspectRatioFromItem: number | undefined
  }) => {
    const cacheKey = JSON.stringify([bvid, useMp4, preferNormalCdn])
    const cached = videoPreviewCache.get(cacheKey)
    if (cached) return cached

    let playUrls: string[] = []
    let dimension: VideoPreviewData['dimension'] | undefined
    if (typeof cid === 'undefined' || typeof aspectRatioFromItem === 'undefined') {
      const pages = await getVideoPageList(bvid)
      cid = pages[0]?.cid
      dimension = pages[0]?.dimension
      if (typeof cid === 'undefined') {
        throw new TypeError(`can not get cid by bvid=${bvid}`)
      }
    }

    playUrls = await getVideoPlayUrl(bvid, cid, useMp4, preferNormalCdn)
    debug('playUrl: bvid=%s cid=%s %s', bvid, cid, playUrls)
    if (playUrls) {
      videoPreviewCache.set(cacheKey, { playUrls, dimension })
    }

    return { playUrls, dimension }
  },
)

// #endregion
