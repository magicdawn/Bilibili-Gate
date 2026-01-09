/**
 * RecGrid inner state
 */

import { useMount } from 'ahooks'
import dayjs from 'dayjs'
import { fastOrderBy } from 'fast-sort-lens'
import { copyContent } from '$components/VideoCard/index.shared'
import { normalizeCardData, type IVideoCardData } from '$modules/filter/normalize'
import { multiSelectStore } from '$modules/multi-select/store'
import type { RecItemType } from '$define'

/**
 * RecGrid 层叠
 * 可能得结构: [PureRecommend.RecGrid, ModalFeed.RecGrid]
 */
type RecGridState = { items: RecItemType[] }
const recGridStateStack: RecGridState[] = []

export function getCurrentGridItems() {
  return recGridStateStack.at(-1)?.items ?? []
}

export function setCurrentGridItems(items: RecItemType[]) {
  const state = recGridStateStack.at(-1)
  if (!state) return
  state.items = items
}

export function useSetupGridState() {
  useMount(() => {
    recGridStateStack.push({ items: [] })
    return () => {
      recGridStateStack.pop()
    }
  })
}

export function getMultiSelectedItems() {
  const { multiSelecting, selectedIdSet } = multiSelectStore
  return multiSelecting ? getCurrentGridItems().filter((item) => selectedIdSet.has(item.uniqId)) : []
}
export function getMultiSelectedCardDatas() {
  return getMultiSelectedItems().map(normalizeCardData)
}

/**
 * generic means: when multi-selecting, use multi-selected items; or use ALL
 */
export function getGenericCardDatas(): IVideoCardData[] {
  const { multiSelecting } = multiSelectStore
  let items = multiSelecting ? getMultiSelectedItems() : getCurrentGridItems()
  if (multiSelecting && !items.length) items = getCurrentGridItems() // multi-selecting but no selected, fallback to ALL
  const cardDatas = items.map(normalizeCardData)
  return cardDatas.toReversed() // gui first -> last
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
      if (!href) return
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

  const list = getCurrentGridItems()
  const anchorIndex = list.findIndex((item) => item.uniqId === anchorUniqId)
  const toIndex = list.findIndex((item) => item.uniqId === toUniqId)
  const isIndexValid = (index: number) => index >= 0 && index <= list.length - 1
  if (!isIndexValid(anchorIndex) || !isIndexValid(toIndex)) return

  const range = [anchorIndex, toIndex]
  const [start, end] = fastOrderBy(range, [(x) => x], ['asc'])
  const selected = selectedIdSet.has(anchorUniqId)
  for (let i = start; i <= end; i++) {
    const uniqId = getCurrentGridItems()[i].uniqId
    selected ? selectedIdSet.add(uniqId) : selectedIdSet.delete(uniqId)
  }
}
