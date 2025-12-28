/**
 * export/bind (functions & variables) to unsafeWindow
 */

import { attempt } from 'es-toolkit'
import { APP_KEY_PREFIX } from '$common'
import { EApiType } from '$define/index.shared'
import { copyBvidInfos, copyBvidsSingleLine, getGenericCardDatas, setCurrentGridItems } from './rec-grid-state'
import type { RecItemTypeOrSeparator } from '$define'

// 实验:
// window === globalThis 总是成立
//
// inject-into="page"
// window 为一个 proxy, 每个 "inject-into=page" 的 userscript 隔离
// unsafeWindow 为页面的 window
//
// inject-into="content"
// 即是 content-script
// window 依旧是一个 proxy, 目的是隔离
// unsafeWindow 为 content-script 的 window, 无法通过 unsafeWindow 暴露变量/函数给 Top context
//   - firefox 提供 `cloneInto()` / `exportFunction()`, 在 violentmonkey 中可以使用这俩函数
//   - chromium 系列只能使用 `window.postMessage` / `window.addEventListener` 通信, 但是脚本管理器没有做这个
const win = (typeof unsafeWindow !== 'undefined' ? unsafeWindow : globalThis) as any
export const setGlobalValue = (key: string, val: any) => void attempt(() => (win[key] = val))

export const gridItemsKey = `${APP_KEY_PREFIX}_gridItems`
export function setGlobalGridItems(itemsWithSep: RecItemTypeOrSeparator[]) {
  const items = itemsWithSep.filter((x) => x.api !== EApiType.Separator)
  setCurrentGridItems(items)
  setGlobalValue(gridItemsKey, items)
}

// bind(export) function to unsafeWindow
const BIND_TO_UNSAFE_WINDOW_FNS = { getGenericCardDatas, copyBvidsSingleLine, copyBvidInfos }
setTimeout(() => {
  Object.entries(BIND_TO_UNSAFE_WINDOW_FNS).forEach(([fnName, fn]) => {
    setGlobalValue(`${APP_KEY_PREFIX}_${fnName}`, fn)
  })
})
