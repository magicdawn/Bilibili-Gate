import { TVKeyInfo } from '$common'
import { isWebApiSuccess, request } from '$request'
import { appSign } from '$utility/app-api'
import { getCsrfToken } from '$utility/cookie'
import toast from '$utility/toast'
import type { AuthCodeJson } from './types/auth-code'
import type { PollJson } from './types/poll'

const newSignedForm = (params: Record<string, any>) => {
  const sign = appSign(params, TVKeyInfo.appkey, TVKeyInfo.appsec)
  return new URLSearchParams({
    ...params,
    sign,
  })
}

export async function getQrCodeInfo() {
  const res = await request.post(
    'https://passport.bilibili.com/x/passport-tv-login/qrcode/auth_code',
    newSignedForm({
      appkey: TVKeyInfo.appkey,
      local_id: '0',
      ts: '0',
    }),
    // sign: 'e134154ed6add881d28fbdf68653cd9c',
  )

  const json = res.data as AuthCodeJson

  if (!isWebApiSuccess(json)) {
    toast(json?.message || '获取 auth_code 失败')
    return
  }

  return json.data
}

export type PollResult = {
  success: boolean
  accessKey?: string
  accessKeyExpireAt?: number
  message: string
  action?: 'refresh' | 'wait' | 'break'
}

export async function poll(auth_code: string): Promise<PollResult> {
  const res = await request.post(
    'https://passport.bilibili.com/x/passport-tv-login/qrcode/poll',
    newSignedForm({
      appkey: TVKeyInfo.appkey,
      auth_code,
      local_id: '0',
      ts: '0',
    }),
  )

  const json = res.data as PollJson
  const msgMap: Record<string, string> = {
    '0': '成功',
    '-3': 'API校验密匙错误',
    '-400': '请求错误',
    '-404': '啥都木有',
    '86038': '二维码已失效',
    '86039': '二维码尚未确认',
    '86090': '二维码已扫码未确认',
  }

  if (!isWebApiSuccess(json)) {
    const code = json.code.toString()
    const message = json.message || msgMap[code] || '未知错误'

    // 二维码已失效
    if (code === '86038') {
      return { success: false, message, action: 'refresh' }
    }
    // 无操作, 等待扫码
    if (code === '86039' || code === '86090') {
      return { success: false, message, action: 'wait' }
    }

    // errors
    return { success: false, message, action: undefined }
  }

  const accessKey = json.data.access_token
  const accessKeyExpireAt = Date.now() + json.data.expires_in * 1000
  return {
    success: true,
    message: '获取成功',
    accessKey,
    accessKeyExpireAt,
  }
}

export async function qrcodeConfirm(auth_code: string) {
  const res = await request.post(
    'https://passport.bilibili.com/x/passport-tv-login/h5/qrcode/confirm',
    new URLSearchParams({
      auth_code,
      scanning_type: '1',
      csrf: getCsrfToken(),
    }),
  )
  const json = res.data
  if (!isWebApiSuccess(json)) {
    const msg = json.message || '未知错误'
    return toast(msg)
  }
}
