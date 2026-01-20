import { baseDebug, REQUEST_FAIL_MSG } from '$common'
import { isWebApiSuccess, request } from '$request'
import toast from '$utility/toast'
import { normalizeDynamicFeedItem } from './df-normalize'
import type { DynamicFeedJson } from '$define'
import type { UpMidType } from '../store'

const dfTypes = new Set<string>()
const majorTypes = new Set<string>()
const arr: any[] = []
function collectData(data: DynamicFeedJson['data']) {
  data.items.forEach((x) => {
    const majorType = x.modules.module_dynamic.major?.type
    if (!dfTypes.has(x.type) || (majorType && !majorTypes.has(majorType))) {
      dfTypes.add(x.type)
      majorType && majorTypes.add(majorType)
      arr.push(x)
      console.log('df-collected-data', { dfTypes, majorTypes, arr })
    }
  })
}

const debug = baseDebug.extend('modules:rec-services:dynamic-feed:api')

export async function fetchVideoDynamicFeeds({
  videoOnly,
  offset,
  page,
  upMid,
  abortSignal,
}: {
  videoOnly: boolean
  offset?: string
  page: number
  upMid?: UpMidType
  abortSignal?: AbortSignal
}) {
  const params: Record<string, number | string> = {
    'timezone_offset': '-480',
    'type': videoOnly ? 'video' : 'all',
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
    // collectData(data) // FIXME: remove this
    data.items = data.items.filter((x) => {
      const valid = !!normalizeDynamicFeedItem(x)
      if (!valid) {
        debug('dynamic-feed filter out: type=%s major.type=%s item=%o', x.type, x.modules.module_dynamic.major?.type, x)
      }
      return valid
    })
  }

  return data
}
