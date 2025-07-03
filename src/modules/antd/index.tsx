/**
 * https://ant.design/components/app-cn
 */

import { App, message, Modal, notification } from 'antd'
import { omit } from 'es-toolkit'
import { $headerHeight } from '$header'
import type { MenuProps } from 'antd'
import type { ConfigOptions as MessageConfigOptions, MessageInstance } from 'antd/es/message/interface'
import type { HookAPI as ModalHookAPI } from 'antd/es/modal/useModal'
import type { NotificationInstance } from 'antd/es/notification/interface'

const messageConfig: MessageConfigOptions = {
  // duration: default 3, 单位秒
  maxCount: 5,
  top: $headerHeight.get() - 4,
}
message.config(messageConfig)

export function AntdStaticFunctionsSetup() {
  const h = $headerHeight.use()
  return (
    <App message={{ ...messageConfig, top: h - 4 }}>
      <SetupInner />
    </App>
  )
}

// 如果使用 message, notification 经常会自动从 antd import
export let antStatic: ReturnType<typeof App.useApp>
export let antMessage: MessageInstance = message
export let antNotification: NotificationInstance = notification
export let antModal: ModalHookAPI = Modal as any
function SetupInner() {
  antStatic = App.useApp()
  antMessage = antStatic.message
  antNotification = antStatic.notification
  antModal = antStatic.modal
  return null
}

/**
 * menu related (context menus / dropdown menus)
 */

export type AntMenuItem = NonNullable<NonNullable<MenuProps['items']>[number]>

type ItemInput = (AntMenuItem & { test?: boolean | (() => boolean) }) | false | undefined | null

export function defineAntMenus(arr: ItemInput[]): AntMenuItem[] {
  return arr
    .filter(Boolean)
    .filter((x) => {
      if (typeof x.test === 'undefined') return true
      if (typeof x.test === 'boolean') return x.test
      return x.test()
    })
    .map((x) => omit(x, ['test']) as AntMenuItem)
}
