import { createDebug } from 'obug'

export const APP_NAME = 'Bilibili-Gate' // formal name
export const APP_NAMESPACE = 'bilibili-gate' // as namespace, kebab-case
export const APP_KEY_PREFIX = 'bilibili_gate' // as javascript key prefix, snake_case
export const APP_SHORT_PREFIX = 'bili-gate'

export const baseDebug = createDebug(APP_NAMESPACE)

export const HOST_API = 'https://api.bilibili.com'
export const HOST_APP = 'https://app.bilibili.com'

export const TVKeyInfo = {
  appkey: '4409e2ce8ffd12b8',
  appsec: '59b43e04ad6965f34319062b478f83dd',
}
export const ThirdPartyKeyInfo = {
  appkey: '27eb53fc9058f8c3',
  appsec: 'c2ed53a74eeefe3cf99fbd01d8c9c375',
}

/**
 * 固定的 classname, 有 app-name prefix.
 * 可用于: customize css / useShortcut query card 等
 */
export const APP_CLS_ROOT = `${APP_NAMESPACE}-root`
export const APP_CLS_GRID = `${APP_NAMESPACE}-video-grid`
export const APP_CLS_CARD = `${APP_NAMESPACE}-video-card`
export const APP_CLS_CARD_ACTIVE = `${APP_NAMESPACE}-video-card-active`
export const APP_CLS_CARD_COVER = `${APP_NAMESPACE}-video-card-cover`
export const APP_CLS_TAB_BAR = `${APP_NAMESPACE}-tab-bar`
export const APP_CLS_CARD_RECOMMEND_REASON = `${APP_NAMESPACE}-video-card__recommend-reason`

export const REQUEST_FAIL_MSG = '请求失败, 请重试 !!!'
export const OPERATION_FAIL_MSG = '操作失败, 请重试 !!!'

export const __DEV__ = import.meta.env.DEV
export const __PROD__ = import.meta.env.PROD

const TLD = 'bilibili.com'
export enum BiliDomain {
  Tld = TLD,
  Main = `www.${TLD}`,
  Space = `space.${TLD}`,
  Search = `search.${TLD}`,
}

const { hostname, pathname } = location
// host predicate
export const IN_BILIBILI = hostname === BiliDomain.Tld || hostname.endsWith(`.${BiliDomain.Tld}`)
export const IN_BILIBILI_MAIN = [BiliDomain.Tld, BiliDomain.Main].includes(hostname)
export const IN_BILIBILI_SPACE_PAGE = hostname === BiliDomain.Space
export const IN_BILIBILI_SEARCH_PAGE = hostname === BiliDomain.Search
// page predicate
export const IN_BILIBILI_HOMEPAGE = IN_BILIBILI_MAIN && (pathname === '/' || pathname === '/index.html')

/**
 * log with namespace
 * e.g console.warn('[%s] videoshot error for %s: %o', APP_NAME, bvid, json)
 */

function logFactory(logFn: typeof console.log) {
  return function appLog(...args: Parameters<typeof console.log>) {
    const [message, ...rest] = args
    const label = `%c${APP_NAME}%c` // 后面 `%c` 是 style reset
    const labelFormats = [
      'padding: 2px 4px; border-radius: 4px; color: #fff; background: #01847f; font-weight: bold;',
      '',
    ]
    if (typeof message === 'string') {
      return logFn(`${label} ${message}`, ...labelFormats, ...rest)
    } else {
      return logFn(`${label}`, ...labelFormats, message, ...rest)
    }
  }
}
export const appLog = logFactory(console.log)
export const appWarn = logFactory(console.warn)
export const appError = logFactory(console.error)
