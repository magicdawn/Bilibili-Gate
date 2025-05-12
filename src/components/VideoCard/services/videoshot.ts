import { appWarn } from '$common'
import { settings } from '$modules/settings'
import { isWebApiSuccess, request } from '$request'
import { reusePendingPromise } from '$utility/async'
import { preloadImg } from '$utility/image'
import { delay } from 'es-toolkit'
import QuickLRU from 'quick-lru'
import type { PvideoJson } from '$define'

export function isVideoshotDataValid(videoshotData?: PvideoJson['data']): boolean {
  return Boolean(videoshotData?.image?.length && videoshotData?.index?.length)
}

/**
 * cacheable: no result | valid result
 * 但不能是 half-valid: ({ image: [1,2,3], index: [空] })
 */
function isVideoshotJsonCacheable(json: PvideoJson) {
  const success = isWebApiSuccess(json)
  if (!success) {
    return true
  } else {
    return isVideoshotDataValid(json.data)
  }
}

// api.bilibili.com/pvideo?aid=${target.dataset.id}&_=${Date.now()
// 视频预览
async function __fetchVideoshotJson(bvid: string) {
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

const videoshotCache = new QuickLRU<string, PvideoJson>({ maxSize: 1_0000 })

export const getVideoshotJson = reusePendingPromise(async (bvid: string): Promise<PvideoJson> => {
  // cache:lookup
  if (videoshotCache.has(bvid)) {
    const cached = videoshotCache.get(bvid)
    if (cached) return cached
  }

  const MAX_RETRY = 5
  const DELAY = 200
  let retryTimes = 0
  let videoshotJson: PvideoJson
  do {
    retryTimes++
    videoshotJson = await __fetchVideoshotJson(bvid)
    if (isVideoshotJsonCacheable(videoshotJson)) {
      break
    } else {
      await delay(DELAY) // this API is silly
    }
  } while (retryTimes < MAX_RETRY)

  // cache:save
  if (isVideoshotJsonCacheable(videoshotJson)) {
    videoshotCache.set(bvid, videoshotJson)
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

  return videoshotJson
})
