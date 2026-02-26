import { attemptAsync } from 'es-toolkit'
import ms from 'ms'
import QuickLRU from 'quick-lru'
import { baseDebug } from '$common'
import { antNotification } from '$modules/antd'
import { getVideoPlayUrl } from '$modules/bilibili/video/play-url'
import { getVideoPageList } from '$modules/bilibili/video/video-detail'
import { isWebApiSuccess, request } from '$request'
import { reusePendingPromise } from '$utility/async'
import { getCsrfToken } from '$utility/cookie'
import toast from '$utility/toast'
import { getVideoshotJson, isVideoshotDataValid } from './videoshot'
import type { PvideoJson } from '$define'
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
    usePreferredCdn,
    aspectRatioFromItem,
  }: {
    bvid: string
    cid: number | undefined
    useMp4: boolean
    usePreferredCdn: boolean
    aspectRatioFromItem: number | undefined
  }) => {
    const cacheKey = JSON.stringify([bvid, useMp4, usePreferredCdn])
    const cached = videoPreviewCache.get(cacheKey)
    if (cached) return cached

    let dimension: VideoPreviewData['dimension'] | undefined
    if (cid === undefined || aspectRatioFromItem === undefined) {
      const pages = await getVideoPageList(bvid)
      cid = pages[0]?.cid
      dimension = pages[0]?.dimension
      if (cid === undefined) {
        throw new TypeError(`can not get cid by bvid=${bvid}`)
      }
    }

    const [err, playUrls] = await attemptAsync(() => getVideoPlayUrl(bvid, cid, useMp4, usePreferredCdn))
    debug('playUrl: bvid=%s cid=%s %s', bvid, cid, playUrls)
    if (err) {
      antNotification.error({ title: '获取视频播放地址失败', description: (err as any).message || err })
      throw err
    }
    if (playUrls?.length) {
      videoPreviewCache.set(cacheKey, { playUrls, dimension })
    }

    return { playUrls: playUrls ?? undefined, dimension }
  },
)

// #endregion
