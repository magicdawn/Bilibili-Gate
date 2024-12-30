import { HOST_APP, OPERATION_FAIL_MSG, appLog, appWarn } from '$common'
import type { AppRecItem, PvideoJson } from '$define'
import { getVideoPlayUrl } from '$modules/bilibili/video/play-url'
import { getVideoCid } from '$modules/bilibili/video/video-detail'
import { settings } from '$modules/settings'
import { gmrequest, isWebApiSuccess, request } from '$request'
import { getCsrfToken } from '$utility/cookie'
import { preloadImg } from '$utility/image'
import toast from '$utility/toast'
import { delay } from 'es-toolkit'
import QuickLRU from 'quick-lru'

// api.bilibili.com/pvideo?aid=${target.dataset.id}&_=${Date.now()
// 视频预览
export async function videoshot(bvid: string) {
  // 2023-09-08 pvideo 出现 404, 切换为 videoshot
  // const res = await request.get('/pvideo', { params: { aid } })
  const res = await request.get('/x/player/videoshot', {
    params: { bvid, index: '1' },
  })
  const json = res.data as PvideoJson

  if (!isWebApiSuccess(json)) {
    appWarn('videoshot error for %s: %o', bvid, json)
  }
  if (!isVideoshotDataValid(json.data)) {
    appWarn('videoshot data invalid bvid=%s: %o', bvid, json.data)
  }

  return json
}

export function isVideoshotDataValid(videoshotData?: PvideoJson['data']) {
  return !!(videoshotData?.image?.length && videoshotData?.index?.length)
}

/**
 * cacheable: no result | valid result
 * 但不能是 half-valid: ({ image: [1,2,3], index: [空] })
 */
export function isVideoshotJsonCacheable(json: PvideoJson) {
  const success = isWebApiSuccess(json)
  if (!success) {
    return true
  } else {
    return isVideoshotDataValid(json.data)
  }
}

const cache = new QuickLRU<string, VideoData>({ maxSize: 1_0000 })

export type VideoData = {
  videoshotJson?: PvideoJson
  playUrl?: string
}

export async function fetchVideoData(bvid: string, cid?: number): Promise<VideoData> {
  // cache:lookup
  if (cache.has(bvid)) {
    const cached = cache.get(bvid)
    if (cached) return cached
  }

  let retryTimes = 0
  let videoshotJson: PvideoJson
  do {
    retryTimes++
    videoshotJson = await videoshot(bvid)
    if (isVideoshotJsonCacheable(videoshotJson)) {
      break
    } else {
      await delay(500) // this API is silly
    }
  } while (retryTimes < 3)

  let playUrl: string | undefined
  if (settings.videoCard.useLargePreview) {
    cid ??= await getVideoCid(bvid)
    playUrl = await getVideoPlayUrl(bvid, cid)
    appLog('playUrl: bvid=%s cid=%s %s', bvid, cid, playUrl)
  }

  // cache:save
  const cacheable = isVideoshotJsonCacheable(videoshotJson)
  if (cacheable) {
    cache.set(bvid, { videoshotJson, playUrl })
  }

  const videoshotData = videoshotJson.data
  if (settings.autoPreviewWhenHover) {
    // preload first img & without wait rest
    const imgs = videoshotData?.image || []
    await preloadImg(imgs[0])
    ;(async () => {
      for (const src of imgs.slice(1)) {
        await preloadImg(src)
      }
    })()
  }

  return { videoshotJson, playUrl }
}

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
