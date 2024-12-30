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
