/**
 * https://api.bilibili.com/x/web-interface/nav
 */

import { Result } from 'better-result'
import { request, WebApiError } from '$request'
import type { LoginInfoJson } from './login-info.api'

export function fetchLoginInfo() {
  return Result.gen(async function* () {
    const resp = yield* await request.safeGet<LoginInfoJson>('/x/web-interface/nav', { withCredentials: true })
    const json = yield* WebApiError.validateAxiosResponse(resp)
    return Result.ok(json.data)
  })
}
