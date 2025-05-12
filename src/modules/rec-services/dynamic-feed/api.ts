import { REQUEST_FAIL_MSG } from '$common'
import { isWebApiSuccess, request } from '$request'
import toast from '$utility/toast'
import type { UpMidType } from './store'
import type { DynamicFeedJson } from '$define'

export async function fetchVideoDynamicFeeds({
  offset,
  page,
  upMid,
  abortSignal,
}: {
  offset?: string
  page: number
  upMid?: UpMidType
  abortSignal?: AbortSignal
}) {
  const params: Record<string, number | string> = {
    'timezone_offset': '-480',
    'type': 'video',
    'platform': 'web',
    'features': 'itemOpusStyle',
    'web_location': '0.0',
    'x-bili-device-req-json': JSON.stringify({ platform: 'web', device: 'pc' }),
    'x-bili-web-req-json': JSON.stringify({ spm_id: '0.0' }),
    'page': page,
  }
  if (offset) {
    params.offset = offset
  }

  const apiPath = '/x/polymer/web-dynamic/v1/feed/all'
  if (upMid) {
    params.host_mid = upMid
    // 未关注, 也可以查询, 但有风控 (code -352) ...
    // TODO: figure out how to query
    // apiPath = '/x/polymer/web-dynamic/v1/feed/space'
  }

  const res = await request.get(apiPath, {
    signal: abortSignal,
    params,
  })
  const json = res.data as DynamicFeedJson

  // fail
  if (!isWebApiSuccess(json)) {
    const msg = json.message || REQUEST_FAIL_MSG
    toast(msg)
    // prevent infinite call
    throw new Error(msg, { cause: json })
  }

  const data = json.data
  if (data?.items?.length) {
    data.items = data.items.filter((x) => x.type === 'DYNAMIC_TYPE_AV') // 处理不了别的类型
  }

  return data
}
