import { Result } from 'better-result'
import ms from 'ms'
import pMemoize from 'p-memoize'
import QuickLRU from 'quick-lru'
import { baseDebug } from '$common'
import { antNotification } from '$modules/antd'
import { getVideoPlayUrl } from '$modules/bilibili/video/play-url'
import { getVideoPageList } from '$modules/bilibili/video/video-detail'
import { isWebApiSuccess, request } from '$request'
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

// #region VideoPreview
export type VideoPreviewData = {
  playUrls?: string[]
  dimension?: VideoPage['dimension']
}

export const isVideoPreviewDataValid = (data?: VideoPreviewData): boolean => {
  return !!data?.playUrls?.length
}

async function __fetchVideoPreviewData({
  videoTitle,
  bvid,
  cid,
  useMp4,
  usePreferredCdn,
  aspectRatioFromItem,
}: {
  videoTitle?: string | undefined
  bvid: string
  cid: number | undefined
  useMp4: boolean
  usePreferredCdn: boolean
  aspectRatioFromItem: number | undefined
}): Promise<VideoPreviewData> {
  let dimension: VideoPreviewData['dimension'] | undefined
  if (cid === undefined || aspectRatioFromItem === undefined) {
    const pages = await getVideoPageList(bvid)
    cid = pages[0]?.cid
    dimension = pages[0]?.dimension
    if (cid === undefined) {
      throw new TypeError(`can not get cid by bvid=${bvid}`)
    }
  }

  const playUrlResult = await Result.tryPromise(() => getVideoPlayUrl(bvid, cid, useMp4, usePreferredCdn))
  debug('playUrl: bvid=%s cid=%s %o', bvid, cid, playUrlResult)
  if (playUrlResult.isErr()) {
    const err = playUrlResult.error.cause as any
    antNotification.error({ title: '获取视频播放地址失败', description: err.message || err })
    throw err
  }

  const playUrls = playUrlResult.value
  if (!playUrls.length) {
    antNotification.info({
      title: '视频播放地址: 空',
      description: <>视频: {videoTitle || bvid}</>,
    })
  }

  return { playUrls, dimension }
}

export const fetchVideoPreviewData = pMemoize(__fetchVideoPreviewData, {
  cache: new QuickLRU<string, VideoPreviewData>({ maxSize: 1_0000, maxAge: ms('1h') }),
  cacheKey([{ bvid, useMp4, usePreferredCdn }]) {
    return new URLSearchParams({
      bvid: bvid.toString(),
      useMp4: useMp4.toString(),
      usePreferredCdn: usePreferredCdn.toString(),
    }).toString()
  },
  shouldCache: isVideoPreviewDataValid,
})
// #endregion
