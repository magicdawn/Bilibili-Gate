/**
 * 模拟 TV 端获取 access_key
 * https://socialsisteryi.github.io/bilibili-API-collect/docs/login/login_action/QR.html#tv%E7%AB%AF%E6%89%AB%E7%A0%81%E7%99%BB%E5%BD%95
 */

import { delay } from 'es-toolkit'
import toast from '$utility/toast'
import { getQrCodeInfo, poll, type PollResult } from './api'
import { hideQrCodeModal, qrcodeStore, showQrCodeModal, updateStore, whenQrCodeModalHide } from './TvQrCodeAuth'

async function refreshQrCode() {
  const qrinfo = await getQrCodeInfo()
  if (!qrinfo) return

  // show
  showQrCodeModal({ qrcodeUrl: qrinfo.url, auth_code: qrinfo.auth_code })
  return true
}

// @ts-ignore
// window.getAccessKeyByQrCode = getAccessKeyByQrCode

export async function getAccessKeyByQrCode() {
  const next = await refreshQrCode()
  if (!next) return

  // start poll
  let res: PollResult | undefined
  let pollfor = qrcodeStore.auth_code

  // break check
  // wrap shouldBreak before & after any long-running operation
  // just check, no side effects
  function shouldBreak() {
    if (!qrcodeStore.show) return true
    if (!qrcodeStore.auth_code) return true
    if (pollfor !== qrcodeStore.auth_code) return true
  }
  function shouldContinue() {
    return !shouldBreak()
  }

  while (shouldContinue()) {
    // delay
    const p1 = delay(1500) // wait enough time
    const p2 = whenQrCodeModalHide() // if user click close, quick break
    await Promise.race([p1, p2])
    p2.off()
    if (shouldBreak()) return

    // poll
    res = await poll(qrcodeStore.auth_code)
    const { success, accessKey, accessKeyExpireAt, message, action } = res
    if (shouldBreak()) return

    /**
     * handle result
     */
    // in any case, show message
    updateStore({ message })

    if (success) {
      await delay(1000)
      hideQrCodeModal()
      return { accessKey, accessKeyExpireAt }
    }

    // refresh
    if (action === 'refresh') {
      await delay(2000) // let user see '已过期消息'
      if (shouldBreak()) return
      await refreshQrCode()
      pollfor = qrcodeStore.auth_code
      updateStore({ message: '已刷新二维码' })
      continue
    }

    if (action === 'wait') {
      continue
    }

    // other errors
    updateStore({ message })
    toast(message)
    return
  }
}
