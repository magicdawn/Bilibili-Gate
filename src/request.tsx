import GM_fetch from '@trim21/gm-fetch'
import axios, { type AxiosError, type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { Result } from 'better-result'
import { omit } from 'es-toolkit'
import { appWarn, HOST_API, HOST_APP, TVKeyInfo } from '$common'
import { encWbi } from '$modules/bilibili/risk-control/wbi'
import { appSign } from '$utility/app-api'
import { settings } from './modules/settings'
import type { ReactNode } from 'react'

export const request = extendSafeHttpMethods(
  axios.create({
    baseURL: HOST_API,
    withCredentials: true,
  }),
)

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
export class WebApiError extends Error {
  constructor(
    public response: AxiosResponse,
    public requestAction?: string, // request purpose
    public extraMessage?: string,
  ) {
    super(WebApiError.getShortMessage(requestAction, response.data))
    this.name = 'WebApiError'
  }

  // 因为在 constructor 中用到, eslint complain using `this` before `super`
  static getActionText(action?: string) {
    let actionText = action || 'API 响应错误'
    if (!/错误|失败$/.test(actionText)) actionText += '错误'
    return actionText
  }
  static getShortMessage(action?: string, json?: any) {
    const actionText = this.getActionText(action)
    const msg = json?.message || json?.code
    return `${actionText}: ${msg}`
  }

  get details() {
    const method = this.response.config?.method?.toUpperCase()
    const url = this.response.config?.url
    const requestStr = `${method} ${url}`

    const json = this.response.data
    const jsonSummary = `(code: ${json?.code}, message: ${json?.message})`

    const actionText = WebApiError.getActionText(this.requestAction)
    const longMessage =
      `${actionText}: (code: ${json?.code}, message: ${json?.message}, request: ${requestStr})` +
      (this.extraMessage || '')

    return {
      message: this.message,
      requestStr,
      jsonSummary,
      extraMessage: this.extraMessage,
      longMessage,
    }
  }

  formatAsReactNode(): ReactNode {
    const { message, requestStr, jsonSummary, extraMessage } = this.details
    return (
      <p className='text-left'>
        {message} <br />
        {requestStr} <br />
        {jsonSummary}
        {extraMessage && (
          <>
            <br />
            {extraMessage}
          </>
        )}
      </p>
    )
  }

  static validateAxiosResponse<JsonType = any>(
    response: AxiosResponse<JsonType>,
    requestAction?: string,
    extraMessage?: string,
  ): Result<JsonType, WebApiError> {
    const json = response.data
    if (!isWebApiSuccess(json)) return Result.err(new WebApiError(response, requestAction, extraMessage))
    return Result.ok(json)
  }
}

/**
 * axios request 报错了, 但不是 `AxiosError | Error`
 */
export class RequestNoneAxiosError extends Error {
  constructor(e: any) {
    super(`RequestNoneAxiosError: ${e?.message || e?.toString()}`, { cause: e })
    this.name = 'RequestNoneAxiosError'
  }
}

export function toRequestNoneAxiosError(err: any) {
  if (err && err instanceof Error) return err
  return new RequestNoneAxiosError(err)
}

// 可以跨域
export const gmrequest = extendSafeHttpMethods(
  axios.create({
    baseURL: HOST_APP,
    adapter: 'fetch',
    env: {
      fetch: GM_fetch,
    },
  }),
)

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

/**
 * better-result Result
 */
const httpMethods = ['get', 'delete', 'head', 'options', 'post', 'put', 'patch'] as const

// NOTE: 因为泛型参数的存在, 不能使用 httpMethods 遍历. 不知道如何保持泛型参数...
interface ExtendedAxiosInstance extends AxiosInstance {
  safeGet: <T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    config?: AxiosRequestConfig<D>,
  ) => Promise<Result<R, AxiosError | RequestNoneAxiosError>>
  safePost: <T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>,
  ) => Promise<Result<R, AxiosError | RequestNoneAxiosError>>
}

function safeHttpMethod<TArgs extends any[], R>(
  fn: (...args: TArgs) => Promise<R>,
): (...args: TArgs) => Promise<Result<R, AxiosError | RequestNoneAxiosError>> {
  return (...args) =>
    Result.tryPromise({
      try: () => fn(...args),
      catch: toRequestNoneAxiosError,
    })
}

function extendSafeHttpMethods(_instance: AxiosInstance): ExtendedAxiosInstance {
  const instance = _instance as ExtendedAxiosInstance
  instance.safeGet = safeHttpMethod(_instance.get.bind(_instance)) as ExtendedAxiosInstance['safeGet']
  instance.safePost = safeHttpMethod(_instance.post.bind(_instance)) as ExtendedAxiosInstance['safePost']
  return instance
}
