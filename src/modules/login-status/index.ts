import { proxy, useSnapshot } from 'valtio'
import { fetchLoginInfo } from '$modules/bilibili/user/login-info'
import toast from '$utility/toast'
import type { LoginInfoData } from '$modules/bilibili/user/login-info.api'

export const NEED_LOGIN_SHORT_MESSAGE = '需要登录B站后使用该功能!'
export const NEED_LOGIN_MESSAGE = '需要登录B站后使用该功能! 如已完成登录, 请刷新网页重试~'

export function toastNeedLogin() {
  return toast(NEED_LOGIN_MESSAGE)
}

export function gotoLogin() {
  const href = 'https://passport.bilibili.com/login'
  location.href = href
}

export const loginStore = proxy<{ loginInfo: LoginInfoData | undefined }>({ loginInfo: undefined })

export async function initLoginStore() {
  const result = await fetchLoginInfo()
  if (result.isErr()) return
  const info = result.value
  loginStore.loginInfo = info
}

export const initLoginStorePromise = initLoginStore()

export function useLoginStatus() {
  return useSnapshot(loginStore).loginInfo?.isLogin ?? false
}

export function getLoginStatus() {
  return loginStore.loginInfo?.isLogin ?? false
}

export function checkLoginStatus(): boolean {
  return getLoginStatus()
}
