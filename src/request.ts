import axios from 'axios'
import gmAdapter from 'axios-userscript-adapter'
import { omit } from 'es-toolkit'
import { appWarn, HOST_API, OPERATION_FAIL_MSG, TVKeyInfo } from '$common'
import { encWbi } from '$modules/bilibili/risk-control/wbi'
import { appSign } from '$utility/app-api'
import { settings } from './modules/settings'

export const request = axios.create({
  baseURL: HOST_API,
  withCredentials: true,
})

request.interceptors.request.use(async function (config) {
  config.params ||= {}

  // wbi sign when needed
  if (config.url?.includes('/wbi/') && !(config.params.w_rid || config.params.wts)) {
    config.params = await encWbi(config.params)
  }

  return config
})

/**
 * check json has {code: 0, message: "0"}
 * - message = OK, 稍后再看
 */
export function isWebApiSuccess(json: any) {
  return json?.code === 0 && ['0', 'success', 'ok'].includes(json?.message?.toLowerCase())
}

// 请求成功了, 但返回的内容表示操作失败
export class OperationFailError extends Error {
  constructor(
    public json: any,
    msg?: string,
  ) {
    msg ||= `${OPERATION_FAIL_MSG} (code: ${json?.code}, message: ${json?.message})`
    super(msg)
    this.name = 'OperationFailError'
  }
}

/**
 * request 报错了, 但不是 `[AxiosError, Error]`
 */
export class AxiosRequestError extends Error {
  constructor(e: any) {
    super(`Axios Request Error: ${e?.message || e?.toString()}`, { cause: e })
    this.name = 'AxiosRequestError'
  }
}

export function toAxiosRequestError(err: any) {
  if (err && err instanceof Error) return err
  return new AxiosRequestError(err)
}

// 可以跨域
export const gmrequest = axios.create({
  // @ts-ignore
  adapter: gmAdapter,
})

gmrequest.interceptors.request.use(function (config) {
  if (!config.params?.sign) {
    const { appkey, appsec } = TVKeyInfo
    config.params = {
      appkey,
      access_key: settings.accessKey || '',
      ...omit(config.params, ['sign']),
    }
    config.params.sign = appSign(config.params, appkey, appsec)
  }

  return config
})

gmrequest.interceptors.response.use((res) => {
  // content-type: "application/json; charset=utf-8"
  // responseData 是 ArrayBuffer
  if (res.config.responseType === 'json' && res.data && res.data instanceof ArrayBuffer) {
    appWarn('response data is ArrayBuffer')
    const decoder = new TextDecoder()
    const u8arr = new Uint8Array(res.data)
    const text = decoder.decode(u8arr)
    res.data = text
    try {
      res.data = JSON.parse(text)
    } catch {
      // noop
    }
  }
  return res
})
