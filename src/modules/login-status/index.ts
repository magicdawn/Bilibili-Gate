import { getUid } from '$utility/cookie'
import toast from '$utility/toast'
import { valtioFactory } from '$utility/valtio'

export const NEED_LOGIN_MESSAGE = '你需要登录B站后使用该功能! 如已完成登录, 请刷新网页重试~'
export function toastNeedLogin() {
  return toast(NEED_LOGIN_MESSAGE)
}

export function gotoLogin() {
  const href = 'https://passport.bilibili.com/login'
  location.href = href
}

export const LOGIN_EL_SELECTOR = '.bili-header .header-login-entry'
export const LOGOUT_EL_SELECTOR = '.bili-header .logout-item'

export const $loginStatus = valtioFactory(function calcLogined() {
  if (!getUid()) return false // SESSDATA 是 httponly
  const hasLoginEl = !!document.querySelector(LOGIN_EL_SELECTOR)
  const hasLogoutEl = !!document.querySelector(LOGOUT_EL_SELECTOR)
  return hasLogoutEl && !hasLoginEl
})

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
