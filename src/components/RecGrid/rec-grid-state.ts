/**
 * RecGrid inner state
 */

import dayjs from 'dayjs'
import { fastOrderBy } from 'fast-sort-lens'
import { copyContent, defaultSharedEmitter, type SharedEmitter } from '$components/VideoCard/index.shared'
import { normalizeCardData, type IVideoCardData } from '$modules/filter/normalize'
import { multiSelectStore } from '$modules/multi-select/store'
import type { RecItemType } from '$define'

export let currentGridItems: RecItemType[] = []
export let currentGridSharedEmitter: SharedEmitter = defaultSharedEmitter
export function setCurrentGridItems(items: RecItemType[]) {
  currentGridItems = items
}
export function setCurrentGridSharedEmitter(sharedEmitter: SharedEmitter) {
  currentGridSharedEmitter = sharedEmitter
}

export function getMultiSelectedItems() {
  const { multiSelecting, selectedIdSet } = multiSelectStore
  return multiSelecting ? currentGridItems.filter((item) => selectedIdSet.has(item.uniqId)) : []
}
export function getMultiSelectedCardDatas() {
  return getMultiSelectedItems().map(normalizeCardData)
}

/**
 * generic means: when multi-selecting, use multi-selected items; or use ALL
 */
export function getGenericCardDatas(): IVideoCardData[] {
  const { multiSelecting } = multiSelectStore
  const items = multiSelecting ? getMultiSelectedItems() : currentGridItems
  const cardDatas = items.map(normalizeCardData)
  return cardDatas
}

export function copyBvidsSingleLine() {
  const bvids = getGenericCardDatas().map((cardData) => cardData.bvid)
  const content = bvids.join(' ')
  copyContent(content)
}

export function getBvidInfo(cardData: IVideoCardData) {
  let { bvid, authorName, pubts, title } = cardData
  const date = dayjs.unix(pubts ?? 0).format('YYYY-MM-DD')
  title = title.replaceAll(/\n+/g, ' ')
  return `${bvid} ;; [${authorName}] ${date} ${title}`
}
export function copyBvidInfos() {
  const lines = getGenericCardDatas().map(getBvidInfo)
  const content = lines.join('\n')
  copyContent(content)
}

export function copyVideoLinks() {
  const lines = getMultiSelectedCardDatas()
    .map((cardData) => {
      let href = cardData.href
      if (!href) return undefined
      if (href.startsWith('/')) href = new URL(href, location.href).href
      return href
    })
    .filter(Boolean)
  const content = lines.join('\n')
  copyContent(content)
}

// 按住 Shift 键扩选
export function handleMultiSelectWithShiftKey(anchorUniqId: string, toUniqId: string) {
  const { multiSelecting, selectedIdSet } = multiSelectStore
  if (!multiSelecting) return
  if (!anchorUniqId || !toUniqId || anchorUniqId === toUniqId) return

  const list = currentGridItems
  const anchorIndex = list.findIndex((item) => item.uniqId === anchorUniqId)
  const toIndex = list.findIndex((item) => item.uniqId === toUniqId)
  const isIndexValid = (index: number) => index >= 0 && index <= list.length - 1
  if (!isIndexValid(anchorIndex) || !isIndexValid(toIndex)) return

  const range = [anchorIndex, toIndex]
  const [start, end] = fastOrderBy(range, [(x) => x], ['asc'])
  const selected = selectedIdSet.has(anchorUniqId)
  for (let i = start; i <= end; i++) {
    selected ? selectedIdSet.add(currentGridItems[i].uniqId) : selectedIdSet.delete(currentGridItems[i].uniqId)
  }
}
