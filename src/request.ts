import axios from 'axios'
import gmAdapter from 'axios-userscript-adapter'
import { HOST_API, TVKeyInfo } from '$common'
import { encWbi } from '$modules/bilibili/risk-control/wbi'
import { appSign } from '$utility/app-sign'
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
  return json?.code === 0 && (json?.message === '0' || json?.message === 'success' || json?.message === 'OK')
}

// 可以跨域
export const gmrequest = axios.create({
  // @ts-ignore
  adapter: gmAdapter,
})

const appkey = TVKeyInfo.appkey
const appsec = TVKeyInfo.appsec

gmrequest.interceptors.request.use(function (config) {
  config.params = {
    appkey,
    access_key: settings.accessKey || '',
    ...config.params,
  }

  config.params.sign = appSign(config.params, appkey, appsec)

  return config
})

gmrequest.interceptors.response.use((res) => {
  // content-type: "application/json; charset=utf-8"
  // responseData 是 ArrayBuffer
  if (res.config.responseType === 'json' && res.data && res.data instanceof ArrayBuffer) {
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
