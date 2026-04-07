import { assert } from 'es-toolkit'
import { err, ok, type Result } from 'neverthrow'
import { HOST_APP, OPERATION_FAIL_MSG } from '$common'
import { isAppRecommend, isPcRecommend, type AppRecItem, type PcRecItem, type RecItemType } from '$define'
import { antMessage } from '$modules/antd'
import { gmrequest, isWebApiSuccess, request, WebApiError, type AxiosRequestError } from '$request'
import { assertNever } from '$utility/type'
import { calcRecItemDislikedMapKey, delDisliked, dislikedMap } from '../store'
import { normalizeDislikeReason, type DislikeReason } from '../types'
import type { AxiosError } from 'axios'

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
  return async function (
    item: AppRecItem,
    reasonId: number,
  ): Promise<Result<string, AxiosError | AxiosRequestError | WebApiError>> {
    const result = await gmrequest.safeGet(HOST_APP + pathname, {
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
    if (result.isErr()) return err(result.error)

    const resp = result.value
    const json = resp.data
    let message = json?.message
    const success = isWebApiSuccess(json)
    if (!success) {
      message ||= OPERATION_FAIL_MSG
      message += `(code: ${json?.code})`
      message += '\n请重新获取 access_key 后重试'
      return err(new WebApiError(json, message))
    }

    return ok(message)
  }
}
export const appDislike = appDislikeFactory('dislike')
export const appCancelDislike = appDislikeFactory('cancel')

function pcDislikeFactory(action: Action) {
  const pathname = {
    dislike: '/x/web-interface/feedback/dislike',
    cancel: '/x/web-interface/feedback/dislike/cancel',
  }[action]
  return async function (
    item: PcRecItem,
    reasonId: number,
  ): Promise<Result<string, AxiosError | AxiosRequestError | WebApiError>> {
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
    const result = await request.safePost(pathname, form)
    if (result.isErr()) return err(result.error)

    const json = result.value.data
    const success = isWebApiSuccess(json)
    if (!success) return err(new WebApiError(json))

    return ok(json?.message)
  }
}
export const pcDislike = pcDislikeFactory('dislike')
export const pcCancelDislike = pcDislikeFactory('cancel')

function handlerFactory(action: Action) {
  return async function (item: RecItemType, reason: DislikeReason): Promise<boolean> {
    const { reasonId } = normalizeDislikeReason(reason)
    let result: Awaited<ReturnType<typeof appDislike>>
    if (reason.platform === 'app') {
      assert(isAppRecommend(item), 'expect app recommend')
      const fn = action === 'dislike' ? appDislike : appCancelDislike
      result = await fn(item, reasonId)
    } else if (reason.platform === 'pc') {
      assert(isPcRecommend(item), 'expect pc recommend')
      const fn = action === 'dislike' ? pcDislike : pcCancelDislike
      result = await fn(item, reasonId)
    } else {
      assertNever(reason)
    }

    if (result.isErr()) {
      const err = result.error
      console.error(err?.stack || err)
      const message = err?.message
      antMessage.error(message, 8)
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
