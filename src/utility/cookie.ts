import { memoize } from 'es-toolkit'
import toast from './toast'

export const parseCookieStr = memoize((documentCookieStr: string): Record<string, string> => {
  const cookies: Record<string, string> = {}
  documentCookieStr
    .split(';')
    .map((pair) => pair.trim())
    .filter(Boolean)
    .forEach((pair) => {
      const [key, val] = pair
        .split('=')
        .map((s) => s.trim())
        .filter(Boolean)
      if (!key) return
      cookies[key] = val
    })
  return cookies
})

export function parseCookie() {
  return parseCookieStr(document.cookie)
}

export enum EBiliCookieKey {
  CsrfToken = 'bili_jct',
  Uid = 'DedeUserID',
  UidMd5 = 'DedeUserID__ckMd5',
}

export function getCsrfToken(): string {
  const csrfToken = parseCookie()[EBiliCookieKey.CsrfToken]
  if (!csrfToken) {
    toast('找不到 csrf token, 请检查是否登录')
    throw new Error('找不到 csrf token, 请检查是否登录')
  }
  return csrfToken
}

export function getUid(): string {
  return parseCookie()[EBiliCookieKey.Uid] || ''
}
