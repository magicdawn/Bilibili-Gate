import { delay } from 'es-toolkit'
import { getUid } from '$utility/cookie'
import { poll } from '$utility/dom'
import toast from '$utility/toast'
import { valtioFactory } from '$utility/valtio'

export const NEED_LOGIN_SHORT_MESSAGE = '需要登录B站后使用该功能!'
export const NEED_LOGIN_MESSAGE = '需要登录B站后使用该功能! 如已完成登录, 请刷新网页重试~'

export function toastNeedLogin() {
  return toast(NEED_LOGIN_MESSAGE)
}

export function gotoLogin() {
  const href = 'https://passport.bilibili.com/login'
  location.href = href
}

export const LOGIN_EL_SELECTOR = '.bili-header .header-login-entry'
export const LOGOUT_EL_SELECTOR = '.bili-header .logout-item'
export const AVATAR_EL_SELECTOR = '.bili-header .header-avatar-wrap--container a[href*="space.bilibili.com/"]'

export const $loginStatus = valtioFactory(function calcLogined() {
  if (!getUid()) return false // SESSDATA 是 httponly
  const hasLoginEl = !!document.querySelector(LOGIN_EL_SELECTOR)
  const hasLogoutEl = !!document.querySelector(LOGOUT_EL_SELECTOR)
  const hasAvatarEl = !!document.querySelector(AVATAR_EL_SELECTOR)
  return !hasLoginEl && (hasLogoutEl || hasAvatarEl) // logout 需要 hover avatar 才会出现
})

const biliHeader = document.querySelector('.bili-header')
if (biliHeader) {
  const ob = new MutationObserver(async () => {
    await delay(0)
    $loginStatus.updateThrottled()
  })
  ob.observe(biliHeader, { childList: true })
}

export function useLoginStatus() {
  return $loginStatus.use()
}

export function getLoginStatus() {
  return $loginStatus.get()
}

export function checkLoginStatus(): boolean {
  $loginStatus.update()
  return getLoginStatus()
}

export async function waitHeaderLoginReady() {
  const pollSelector = [LOGIN_EL_SELECTOR, AVATAR_EL_SELECTOR].join(',')
  await poll(() => document.querySelector(pollSelector), { timeout: 5_000 })
}
