import GM_fetch from '@trim21/gm-fetch'
import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { Result, UnhandledException } from 'better-result'
import { omit } from 'es-toolkit'
import { APP_KEY_PREFIX, appError, HOST_API, HOST_APP, TVKeyInfo } from '$common'
import { antMessage } from '$modules/antd'
import { encWbi } from '$modules/bilibili/risk-control/wbi'
import { appSign } from '$utility/app-api'
import { settings } from './modules/settings'
import type { ReactNode } from 'react'

// #region custom request flag, used in request interceptor

// 使用 Symbol 最好, 但 axios mergeConfig 使用 Object.keys (owned + enumerable + string), 会忽略 symbol keys
// https://github.com/axios/axios/blob/v1.17.0/lib/core/mergeConfig.js#L114

/** gmrequest exclude access_key */
export const anonymousFlag = `${APP_KEY_PREFIX}_anonymous`

/** wbi sign: 增加 wts + w_rid */
export const wbiFlag = `${APP_KEY_PREFIX}_wbi_sign`

declare module 'axios' {
  export interface AxiosRequestConfig {
    [anonymousFlag]?: boolean
    [wbiFlag]?: boolean
  }
}
// #endregion

export const request = extendSafeHttpMethods(
  axios.create({
    baseURL: HOST_API,
    withCredentials: true,
  }),
)

request.interceptors.request.use(async function (config) {
  config.params ||= {}

  // wbi sign
  const needWbiSign = config[wbiFlag] ?? (config.url?.includes('/wbi/') && !(config.params.w_rid || config.params.wts))
  if (needWbiSign) {
    config.params = await encWbi(omit(config.params, ['w_rid', 'wts']))
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

  /**
   * @param response the response
   * @param requestAction 例如 `获取列表错误`
   * @param extraMessage 额外信息
   * @returns a `Result`
   */
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

// 可以跨域
export const gmrequest = extendSafeHttpMethods(
  axios.create({
    baseURL: HOST_APP,
    adapter: 'fetch',
    env: { fetch: GM_fetch },
  }),
)

gmrequest.interceptors.request.use(function (config) {
  // 有 sign 时, 保留原始 params
  if (!config.params?.sign) {
    const { appkey, appsec } = TVKeyInfo
    config.params = {
      appkey,
      access_key: settings.accessKey || '',
      ...omit(config.params, ['sign']),
    }

    // handle anonymous
    if (config[anonymousFlag]) delete config.params.access_key

    // sign
    config.params.sign = appSign(config.params, appkey, appsec)
  }

  return config
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
  ) => Promise<Result<R, AxiosError | UnhandledException>>
  safePost: <T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>,
  ) => Promise<Result<R, AxiosError | UnhandledException>>
}

function safeHttpMethod<TArgs extends any[], R>(
  fn: (...args: TArgs) => Promise<R>,
): (...args: TArgs) => Promise<Result<R, AxiosError | UnhandledException>> {
  return (...args) =>
    Result.tryPromise({
      try: () => fn(...args),
      catch(err: any) {
        if (err && err instanceof AxiosError) return err
        return new UnhandledException({ cause: err })
      },
    })
}

function extendSafeHttpMethods(_instance: AxiosInstance): ExtendedAxiosInstance {
  const instance = _instance as ExtendedAxiosInstance
  instance.safeGet = safeHttpMethod(_instance.get.bind(_instance)) as ExtendedAxiosInstance['safeGet']
  instance.safePost = safeHttpMethod(_instance.post.bind(_instance)) as ExtendedAxiosInstance['safePost']
  return instance
}

export function handleRequestError(err: AxiosError | WebApiError | UnhandledException) {
  appError(err)
  const messageContent = err instanceof WebApiError ? err.formatAsReactNode() : err.message
  antMessage.error(messageContent, 8)
}
