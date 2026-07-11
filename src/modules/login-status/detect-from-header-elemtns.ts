import { delay } from 'es-toolkit'
import { getUid } from '$utility/cookie'
import { poll } from '$utility/dom'
import { valtioFactory } from '$utility/valtio'

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

export function observeBiliHeader() {
  const biliHeader = document.querySelector('.bili-header')
  if (biliHeader) {
    const ob = new MutationObserver(async () => {
      await delay(0)
      $loginStatus.updateThrottled()
    })
    ob.observe(biliHeader, { childList: true })
  }
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
