import { assert, attemptAsync } from 'es-toolkit'
import { HOST_APP, OPERATION_FAIL_MSG, REQUEST_FAIL_MSG } from '$common'
import { isAppRecommend, isPcRecommend, type AppRecItem, type PcRecItem, type RecItemType } from '$define'
import { antMessage } from '$modules/antd'
import { gmrequest, isWebApiSuccess, request } from '$request'
import { assertNever } from '$utility/type'
import { calcRecItemDislikedMapKey, delDisliked, dislikedMap } from '../store'
import { normalizeDislikeReason, type DislikeReason } from '../types'

type Action = 'dislike' | 'cancel'

/**
 * 不喜欢 / 撤销不喜欢
 * https://github.com/indefined/UserScripts/blob/master/bilibiliHome/bilibiliHome.API.md
 *
 * 此类内容过多 reason_id = 12
 * 推荐过 reason_id = 13
 */
function appDislikeFactory(action: Action) {
  const pathname = {
    dislike: '/x/feed/dislike',
    cancel: '/x/feed/dislike/cancel',
  }[action]
  return async function (item: AppRecItem, reasonId: number) {
    const res = await gmrequest.get(HOST_APP + pathname, {
      responseType: 'json',
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
export const appDislike = appDislikeFactory('dislike')
export const appCancelDislike = appDislikeFactory('cancel')

function pcDislikeFactory(action: Action) {
  const pathname = {
    dislike: '/x/web-interface/feedback/dislike',
    cancel: '/x/web-interface/feedback/dislike/cancel',
  }[action]
  return async function (item: PcRecItem, reasonId: number) {
    const form = new URLSearchParams({
      app_id: '100',
      platform: '5',
      from_spmid: '',
      spmid: '333.1007.0.0',
      goto: item.goto,
      id: item.id.toString() || '0',
      mid: item.owner?.mid?.toString() || '0',
      track_id: item.track_id,
      feedback_page: '1',
      reason_id: reasonId.toString(),
    })
    const res = await request.post(pathname, form)
    const json = res.data
    const success = isWebApiSuccess(json)
    const message = json?.message || REQUEST_FAIL_MSG
    return { success, message, json }
  }
}
export const pcDislike = pcDislikeFactory('dislike')
export const pcCancelDislike = pcDislikeFactory('cancel')

function handlerFactory(action: Action) {
  return async function (item: RecItemType, reason: DislikeReason): Promise<boolean> {
    const { reasonId } = normalizeDislikeReason(reason)
    let err: any
    let result: { success: boolean; message: string; json: any } | null
    if (reason.platform === 'app') {
      assert(isAppRecommend(item), 'expect app recommend')
      const fn = action === 'dislike' ? appDislike : appCancelDislike
      ;[err, result] = await attemptAsync(() => fn(item, reasonId))
    } else if (reason.platform === 'pc') {
      assert(isPcRecommend(item), 'expect pc recommend')
      const fn = action === 'dislike' ? pcDislike : pcCancelDislike
      ;[err, result] = await attemptAsync(() => fn(item, reasonId))
    } else {
      assertNever(reason)
    }

    // catch error
    if (err || !result) {
      console.error(err?.stack || err)
      const message = err?.message
      antMessage.error(message)
      return false
    }

    // request fail
    if (!result.success) {
      const message = result?.message || OPERATION_FAIL_MSG
      antMessage.error(message)
      return false
    }

    // success
    const dislikeKey = calcRecItemDislikedMapKey(item)
    assert(dislikeKey, 'dislikeKey should not be empty')
    if (action === 'dislike') {
      antMessage.success('已标记不想看')
      dislikedMap.set(dislikeKey, { ...reason })
    }
    if (action === 'cancel') {
      antMessage.success('已撤销')
      delDisliked(dislikeKey)
    }
    return true
  }
}

export const handleDislike = handlerFactory('dislike')
export const handleCancelDislike = handlerFactory('cancel')
