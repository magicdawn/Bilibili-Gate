import debugFactory from 'debug'

export const APP_NAME = 'Bilibili-Gate' // formal name
export const APP_NAMESPACE = 'bilibili-gate' // as namespace, kebab-case
export const APP_KEY_PREFIX = 'bilibili_gate' // as javascript key prefix, snake_case
export const APP_SHORT_PREFIX = 'bili-gate'
export const baseDebug = debugFactory(APP_NAMESPACE)

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

export const REQUEST_FAIL_MSG = '请求失败, 请重试 !!!'
export const OPERATION_FAIL_MSG = '操作失败, 请重试 !!!'

export const __DEV__ = import.meta.env.DEV
export const __PROD__ = import.meta.env.PROD

export enum BiliDomain {
  Tld = '.bilibili.com',
  Main = 'www.bilibili.com',
  Space = 'space.bilibili.com',
  Search = 'search.bilibili.com',
}

const { hostname, pathname } = location
export const IN_BILIBILI = hostname.endsWith(BiliDomain.Tld)
export const IN_BILIBILI_HOMEPAGE = IN_BILIBILI && (pathname === '/' || pathname === '/index.html')
// https://www.bilibili.com/video/BVxxx
// https://www.bilibili.com/list/watchlater?bvid=BVxxx
export const IN_BILIBILI_VIDEO_PLAY_PAGE =
  IN_BILIBILI && ['/video/', '/list/watchlater', '/bangumi/play/'].some((prefix) => pathname.startsWith(prefix))
export const IN_BILIBILI_SPACE_PAGE = hostname === BiliDomain.Space
export const IN_BILIBILI_SEARCH_PAGE = hostname === BiliDomain.Search

/**
 * log with namespace
 * e.g console.warn('[%s] videoshot error for %s: %o', APP_NAME, bvid, json)
 */
function logFactory(logFn: typeof console.log) {
  return function appLog(...args: Parameters<typeof console.log>) {
    const [message, ...rest] = args
    if (typeof message === 'string') {
      return logFn(`[${APP_NAME}]: ${message}`, ...rest)
    } else {
      return logFn(`[${APP_NAME}]:`, message, ...rest)
    }
  }
}
export const appLog = logFactory(console.log)
export const appWarn = logFactory(console.warn)
export const appError = logFactory(console.error)
