import { settings } from '$modules/settings'
import toast from '$utility/toast'
import { getAccessKeyByQrCode } from './tv-qrcode'

export async function getAccessKey() {
  const { accessKey, accessKeyExpireAt } = (await getAccessKeyByQrCode()) || {}
  if (!accessKey || !accessKeyExpireAt) return

  settings.accessKey = accessKey
  settings.accessKeyExpireAt = accessKeyExpireAt

  toast('获取成功')
}

export function deleteAccessKey() {
  settings.accessKey = ''
  settings.accessKeyExpireAt = 0
  toast('已删除 access_key')
}
