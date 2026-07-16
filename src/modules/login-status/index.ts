import { proxy } from 'valtio'
import { useTrackedSnapshot } from 'valtio-select'
import { fetchLoginInfo } from '$modules/bilibili/user/login-info'
import toast from '$utility/toast'
import type { AnonymousLoginInfo } from '$modules/bilibili/user/anonymous-info.api'
import type { LoginInfo } from '$modules/bilibili/user/login-info.api'

export const NEED_LOGIN_SHORT_MESSAGE = '需要登录B站后使用该功能!'
export const NEED_LOGIN_MESSAGE = '需要登录B站后使用该功能! 如已完成登录, 请刷新网页重试~'

export function toastNeedLogin() {
  return toast(NEED_LOGIN_MESSAGE)
}

export function gotoLogin() {
  const href = 'https://passport.bilibili.com/login'
  location.href = href
}

export const loginStore = proxy<{ loginInfo: LoginInfo | AnonymousLoginInfo | undefined }>({
  loginInfo: undefined,
})

export async function initLoginStore() {
  const result = await fetchLoginInfo()
  if (result.isErr()) return
  const info = result.value
  loginStore.loginInfo = info
}

export const initLoginStorePromise = initLoginStore()

function calcLoginStatus(s: typeof loginStore) {
  return s.loginInfo?.isLogin ?? false
}

export function getLoginStatus() {
  return calcLoginStatus(loginStore)
}

export function useLoginStatus() {
  return useTrackedSnapshot(loginStore, calcLoginStatus)
}

export function checkLoginStatus(): boolean {
  return getLoginStatus()
}
