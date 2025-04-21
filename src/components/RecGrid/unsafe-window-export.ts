/**
 * export/bind (functions & variables) to unsafeWindow
 */

import { APP_KEY_PREFIX } from '$common'
import { normalizeCardData, type IVideoCardData } from '$components/VideoCard/process/normalize'
import type { RecItemType, RecItemTypeOrSeparator } from '$define'
import { EApiType } from '$define/index.shared'
import { antNotification } from '$modules/antd'
import { multiSelectStore } from '$modules/multi-select/store'
import dayjs from 'dayjs'
import { tryit } from 'radash'

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

export const setGlobalValue = (key: string, val: any) => void tryit(() => (win[key] = val))()

export const gridItemsKey = `${APP_KEY_PREFIX}_gridItems`
export let currentGridItems: RecItemType[] = []
export function setGlobalGridItems(itemsWithSep: RecItemTypeOrSeparator[]) {
  const items = itemsWithSep.filter((x) => x.api !== EApiType.Separator)
  currentGridItems = items
  setGlobalValue(gridItemsKey, currentGridItems)
}

function getGridCardData() {
  const { multiSelecting, selectedIdSet } = multiSelectStore
  return currentGridItems
    .filter((item) => {
      if (!multiSelecting) return true
      return selectedIdSet.has(item.uniqId)
    })
    .map((item) => normalizeCardData(item))
}

export function copyBvidsSingleLine() {
  const bvids = getGridCardData().map((cardData) => cardData.bvid)
  const content = bvids.join(' ')
  GM.setClipboard(content)
  antNotification.success({ message: '已复制', description: content })
}

export function copyBvidInfos() {
  const lines = getGridCardData().map(getBvidInfo)
  const content = lines.join('\n')
  GM.setClipboard(content)
  antNotification.success({ message: '已复制', description: content })
}

export function copyVideoLinks() {
  const lines = getGridCardData()
    .map((cardData) => {
      let href = cardData.href
      if (!href) return
      if (href.startsWith('/')) href = new URL(href, location.href).href
      return href
    })
    .filter(Boolean)
  const content = lines.join('\n')
  GM.setClipboard(content)
  antNotification.success({ message: '已复制', description: content })
}

export function getBvidInfo(cardData: IVideoCardData) {
  let { bvid, authorName, pubts, title } = cardData
  const date = dayjs.unix(pubts ?? 0).format('YYYY-MM-DD')
  title = title.replace(/\n+/g, ' ')
  return `${bvid} ;; [${authorName}] ${date} ${title}`
}

// bind(export) function to unsafeWindow
const BIND_TO_UNSAFE_WINDOW_FNS = { getGridCardData, copyBvidsSingleLine, copyBvidInfos }
setTimeout(() => {
  Object.entries(BIND_TO_UNSAFE_WINDOW_FNS).forEach(([fnName, fn]) => {
    setGlobalValue(`${APP_KEY_PREFIX}_${fnName}`, fn)
  })
})
