/**
 * https://socialsisteryi.github.io/bilibili-API-collect/docs/misc/sign/wbi.html#javascript
 */

import { HOST_API } from '$common'
import { dailyCache } from '$modules/gm/daily-cache'
import { reusePendingPromise } from '$utility/async'
import axios from 'axios'
import ms from 'ms'
import { hash } from 'spark-md5'

/**
 * 为请求参数进行 wbi 签名
 * @param _params request params
 * @returns full params
 */
export async function encWbi(_params: Record<string, any>) {
  const { img_key, sub_key } = await getWbiKeys()
  const mixin_key = getMixinKey(img_key + sub_key)

  const wts = Math.round(Date.now() / 1000)

  const params: Record<string, string | number> = { ..._params, wts }
  const chr_filter = /[!'()*]/g
  const query = Object.keys(params)
    .sort() // 按照 key 重排参数
    .map((key) => {
      return `${encodeURIComponent(key)}=${encodeURIComponent(
        // 过滤 value 中的 "!'()*" 字符
        params[key].toString().replace(chr_filter, ''),
      )}`
    })
    .join('&')
  const wbi_sign = hash(query + mixin_key) // 计算 w_rid

  // full params: original + wts + w_rid
  return {
    ...params,
    wts,
    w_rid: wbi_sign,
  }
}

type Keys = { img_key: string; sub_key: string }
const keysCache = dailyCache<{ val: Keys; ts: number }>('wbi-keys')

// 获取最新的 img_key 和 sub_key
async function getWbiKeys(): Promise<Keys> {
  const cached = await keysCache.get()
  const shouldReuse = cached?.val && cached?.ts && Date.now() - cached.ts <= ms('6h')
  if (shouldReuse) return cached.val
  return __fetchWbiKeys()
}

const __fetchWbiKeys = reusePendingPromise(async () => {
  // 直接用 axios, 防止与 $request 循环依赖
  const res = await axios.get('/x/web-interface/nav', { baseURL: HOST_API })
  const json = res.data
  const img_url = json.data.wbi_img.img_url as string
  const sub_url = json.data.wbi_img.sub_url as string
  const keys = {
    img_key: img_url.slice(img_url.lastIndexOf('/') + 1, img_url.lastIndexOf('.')),
    sub_key: sub_url.slice(sub_url.lastIndexOf('/') + 1, sub_url.lastIndexOf('.')),
  }
  // save cache
  await keysCache.set({ val: keys, ts: Date.now() })
  return keys
})

// 对 imgKey 和 subKey 进行字符顺序打乱编码
const mixinKeyEncTab = [
  46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35, 27, 43, 5, 49, 33, 9, 42, 19, 29, 28,
  14, 39, 12, 38, 41, 13, 37, 48, 7, 16, 24, 55, 40, 61, 26, 17, 0, 1, 60, 51, 30, 4, 22, 25, 54,
  21, 56, 59, 6, 63, 57, 62, 11, 36, 20, 34, 44, 52,
]
function getMixinKey(orig: string) {
  return mixinKeyEncTab
    .map((n) => orig[n])
    .join('')
    .slice(0, 32)
}
