import { hash } from 'spark-md5'

/**
 * 为请求参数进行 APP 签名
 * https://socialsisteryi.github.io/bilibili-API-collect/docs/misc/sign/APP.html#typescript-javascript
 */
export function appSign(params: Record<string, any>, appkey: string, appsec: string) {
  params.appkey = appkey
  const searchParams = new URLSearchParams(params)
  searchParams.sort()
  return hash(searchParams.toString() + appsec)
}

export const appApiCommonParams = {
  platform: 'ios',
  mobi_app: 'ipad',
  device: 'pad',
  build: '37300100',
  c_locale: 'zh-Hans_CN',
  s_locale: 'zh-Hans_CN',
} as const

export class NeedValidAccessKeyError extends Error {
  constructor(msg?: string, cause?: unknown) {
    msg ||= '需要有效的 access_key'
    super(msg, { cause })
    this.name = 'NeedValidAccessKeyError'
  }
}
