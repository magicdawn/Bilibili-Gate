import { antMessage } from '$modules/antd'
import { delay } from 'es-toolkit'
import type { ReactNode } from 'react'

export async function toastAndReload(msg = '即将刷新网页!') {
  antMessage.info(msg)
  await delay(500)
  location.reload()
}

export function explainForFlag(checked: ReactNode, unchecked: ReactNode) {
  return (
    <>
      ✅: {checked} <br />
      ❎: {unchecked} <br />
    </>
  )
}
