/**
 * https://ant.design/components/app-cn
 */

import { $headerHeight } from '$header'
import type { MenuProps } from 'antd'
import { App, message, notification } from 'antd'
import type {
  ConfigOptions as MessageConfigOptions,
  MessageInstance,
} from 'antd/es/message/interface'
import type { NotificationInstance } from 'antd/es/notification/interface'
import { isNil, omit } from 'es-toolkit'

const messageConfig: MessageConfigOptions = {
  // duration: default 3, 单位秒
  maxCount: 5,
  top: $headerHeight.get() - 4,
}
message.config(messageConfig)

export function UseApp() {
  const h = $headerHeight.use()
  return (
    <App component={'div'} message={{ ...messageConfig, top: h - 4 }}>
      <UseAppInner />
    </App>
  )
}

// 如果使用 message, notification 经常会自动从 antd import
export let antStatic: ReturnType<typeof App.useApp>
export let antMessage: MessageInstance = message
export let antNotification: NotificationInstance = notification

function UseAppInner() {
  antStatic = App.useApp()
  antMessage = antStatic.message
  antNotification = antStatic.notification
  return null
}

/**
 * menu related. (context menus / dropdown menus)
 */

export type AntMenuItem = NonNullable<NonNullable<MenuProps['items']>[number]>

export function defineAntMenus(
  arr: Array<(AntMenuItem & { test?: boolean | (() => boolean) }) | undefined | null | false>,
): AntMenuItem[] {
  return arr
    .filter((x) => !isNil(x) && x !== false) // inferred type predicate
    .map((x) => {
      const testResult =
        typeof x.test === 'undefined' ? true : typeof x.test === 'function' ? x.test() : x.test
      return {
        ...x,
        testResult,
      }
    })
    .filter((x) => x.testResult)
    .map((x) => omit(x, ['test', 'testResult']) as AntMenuItem)
}
