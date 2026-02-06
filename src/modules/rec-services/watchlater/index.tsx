import { assert, orderBy, shuffle } from 'es-toolkit'
import pRetry from 'p-retry'
import { proxy, useSnapshot } from 'valtio'
import { proxySet } from 'valtio/utils'
import { appWarn, IN_BILIBILI_HOMEPAGE } from '$common'
import { getMultiSelectedItems } from '$components/RecGrid/rec-grid-state'
import { EApiType } from '$define/index.shared'
import { normalizeCardData } from '$modules/filter/normalize'
import { getHasLogined, getUid } from '$utility/cookie'
import { whenIdle } from '$utility/dom'
import toast from '$utility/toast'
import { BaseTabService, type IService } from '../_base'
import { batchRemoveWatchlater, fetchWatchlaterItems } from './api'
import { earlierSeparator, getRecentGate, recentSeparator } from './shared'
import { WatchlaterTabbarView } from './views'
import { WatchlaterItemsOrder } from './watchlater-enum'
import type { RecSharedEmitter } from '$components/Recommends/rec.shared'
import type { ItemsSeparator, WatchlaterItemExtend } from '$define'
import type { WatchlaterItem } from './types'

export const watchlaterState = proxy({
  updatedAt: 0,
  bvidSet: proxySet<string>(),
})

export function useWatchlaterState(bvid?: string) {
  const set = useSnapshot(watchlaterState).bvidSet
  return !!bvid && set.has(bvid)
}

function replaceWatchlaterStateBvidSet(newSet: string[]) {
  watchlaterState.updatedAt = Date.now()
  watchlaterState.bvidSet = proxySet<string>(newSet)
}
function updateWatchlaterStateBvidSet(action: 'add' | 'del', bvid: string) {
  if (!watchlaterState.updatedAt) return // not inited
  action === 'add' ? watchlaterState.bvidSet.add(bvid) : watchlaterState.bvidSet.delete(bvid)
}

async function initWatchlaterState() {
  if (!getHasLogined() || !getUid()) return
  const { items: allWatchlaterItems = [] } = await fetchWatchlaterItems()
  if (!allWatchlaterItems.length) return
  replaceWatchlaterStateBvidSet(allWatchlaterItems.map((x) => x.bvid))
}
if (IN_BILIBILI_HOMEPAGE) {
  void (async () => {
    await whenIdle()
    await pRetry(initWatchlaterState, {
      retries: 3,
      onFailedAttempt(error) {
        appWarn(`Try updateWatchlaterState ${error.attemptNumber} failed. There are ${error.retriesLeft} retries left`)
      },
    })
  })()
}

/**
 * 批量移除稍后再看
 */
export async function removeMultiSelectedWatchlaterItems(recSharedEmitter: RecSharedEmitter) {
  const selected = getMultiSelectedItems()
    .map((item) => ({ item, cardData: normalizeCardData(item) }))
    .filter((x) => x.cardData.avid)
    .map((x) => [x.cardData.avid, x.item.uniqId, x.cardData.title] as [avid: string, uniqId: string, title: string])
    .filter(Boolean)
  const avids = selected.map((x) => x[0])
  const uniqIds = selected.map((x) => x[1])
  const titles = selected.map((x) => x[2])
  if (!avids.length) {
    return toast('没有选中的视频')
  }

  const success = await batchRemoveWatchlater(avids)
  if (!success) return
  recSharedEmitter.emit('remove-cards', [uniqIds, titles])
}

export class WatchlaterRecService extends BaseTabService<WatchlaterItemExtend | ItemsSeparator> {
  static PAGE_SIZE = 10

  override sidebarView = undefined

  private innerService: NormalOrderService | ShuffleOrderService
  constructor(
    order: WatchlaterItemsOrder,
    addSeparator: boolean,
    prevShuffleBvidIndexMap?: BvidIndexMap,
    private searchText?: string,
  ) {
    super(WatchlaterRecService.PAGE_SIZE)
    this.innerService =
      order === WatchlaterItemsOrder.Shuffle && !this.searchText
        ? new ShuffleOrderService(addSeparator, prevShuffleBvidIndexMap)
        : new NormalOrderService(order, addSeparator, this.searchText)
  }

  override get hasMoreExceptQueue() {
    return this.innerService.hasMore
  }

  override fetchMore(abortSignal: AbortSignal): Promise<(WatchlaterItemExtend | ItemsSeparator)[] | undefined> {
    return this.innerService.loadMore(abortSignal)
  }

  override get tabbarView() {
    return <WatchlaterTabbarView service={this} />
  }

  get state() {
    return this.innerService.state
  }

  // for remove watchlater card
  decreaseTotal() {
    if (this.innerService.state.total === undefined) return
    this.innerService.state.total--
  }

  getServiceSnapshot() {
    const bvidIndexMap =
      this.innerService instanceof ShuffleOrderService ? this.innerService.currentBvidIndexMap : undefined
    return { bvidIndexMap }
  }
}

/**
 * shared
 */

function extendItem(item: WatchlaterItem): WatchlaterItemExtend {
  return {
    ...item,
    api: EApiType.Watchlater,
    uniqId: `${EApiType.Watchlater}:${item.bvid}`,
  }
}

function showApiRequestError(err: string) {
  toast(`获取稍后再看失败: ${err}`)
  throw new Error(`获取稍后再看失败: ${err}`, {
    cause: err,
  })
}

/**
 * shuffle pre-requirements: load ALL
 */

export type BvidIndexMap = Map<string, number>

class ShuffleOrderService implements IService {
  hasMore = true
  state = proxy({ total: undefined as number | undefined })

  // shuffle related
  keepOrder: boolean
  prevBvidIndexMap?: BvidIndexMap
  constructor(
    private addSeparator: boolean,
    prevBvidIndexMap?: BvidIndexMap,
  ) {
    if (prevBvidIndexMap?.size) {
      this.keepOrder = true
      this.prevBvidIndexMap = prevBvidIndexMap
    } else {
      this.keepOrder = false
    }
  }

  async loadMore(abortSignal: AbortSignal) {
    if (!this.hasMore) return
    const items = await this.fetch(abortSignal)
    this.hasMore = false
    return items
  }

  currentBvidIndexMap?: BvidIndexMap
  private async fetch(abortSignal: AbortSignal) {
    const { items: rawItems = [], err } = await fetchWatchlaterItems({
      asc: false,
      searchText: undefined,
      abortSignal,
    })
    if (err !== undefined) {
      showApiRequestError(err)
    }

    // side effects
    replaceWatchlaterStateBvidSet(rawItems.map((x) => x.bvid).filter(Boolean))

    const items: WatchlaterItemExtend[] = rawItems.map(extendItem)

    // recent + earlier
    const recentGate = getRecentGate()
    const firstNotRecentIndex = items.findIndex((item) => item.add_at < recentGate)
    let itemsWithSeparator: Array<WatchlaterItemExtend | ItemsSeparator> = items
    if (firstNotRecentIndex !== -1) {
      const recent = items.slice(0, firstNotRecentIndex)
      let earlier = items.slice(firstNotRecentIndex)

      // earlier: shuffle or restore
      if (this.keepOrder && this.prevBvidIndexMap?.size) {
        earlier = orderBy(
          earlier,
          [
            (item) => {
              // if not found, -1, front-most
              return this.prevBvidIndexMap?.get(item.bvid) ?? -1
            },
          ],
          ['asc'],
        )
      } else {
        earlier = shuffle(earlier)
      }

      // combine
      itemsWithSeparator = [
        !!recent.length && this.addSeparator && recentSeparator,
        ...recent,

        !!earlier.length && this.addSeparator && earlierSeparator,
        ...earlier,
      ].filter(Boolean)
    }

    this.state.total = rawItems.length
    this.currentBvidIndexMap = new Map(
      itemsWithSeparator.filter((x) => x.api !== EApiType.Separator).map((x, index) => [x.bvid, index]),
    )
    return itemsWithSeparator
  }
}

class NormalOrderService implements IService {
  // configs
  constructor(
    private order: WatchlaterItemsOrder,
    private addSeparator: boolean,
    private searchText?: string,
  ) {
    if (!this.searchText) {
      assert(order !== WatchlaterItemsOrder.Shuffle, 'shuffle not supported in NormalOrderService')
    }
  }

  firstPageLoaded = false
  state = proxy<{ total?: number }>({ total: undefined })

  hasMore: boolean = true
  page = 1

  async loadMore() {
    if (!this.hasMore) return

    const result = await fetchWatchlaterItems({
      asc: this.order === WatchlaterItemsOrder.AddTimeAsc,
      searchText: this.searchText,
      extraParams: {
        need_split: 'true',
        ps: 20,
        pn: this.page,
      },
    })
    // error
    if (result.err !== undefined) {
      this.hasMore = false
      showApiRequestError(result.err)
      return
    }

    const { items, total } = result
    const maxPage = Math.ceil(total / 20)

    this.firstPageLoaded = true
    this.state.total = result.total
    this.hasMore = this.page < maxPage
    this.page++

    // side effects: update watchlaterState.bvidSet
    items.forEach((item) => {
      if (item.bvid) {
        updateWatchlaterStateBvidSet('add', item.bvid)
      }
    })

    const extendedItems: WatchlaterItemExtend[] = items.map(extendItem)
    return this.insertSeparator(extendedItems)
  }

  private recentSeparatorInserted = false
  private earlierSeparatorInserted = false
  insertSeparator(items: WatchlaterItemExtend[]): (WatchlaterItemExtend | ItemsSeparator)[] {
    if (!this.addSeparator) return items

    let newItems: (WatchlaterItemExtend | ItemsSeparator)[] = [...items]

    const recentGate = getRecentGate()
    const needEarlierSeparator = items.some((item) => item.add_at < recentGate)
    const needRecentSeparator = items.some((item) => item.add_at >= recentGate)

    // ASC
    if (this.order === WatchlaterItemsOrder.AddTimeAsc) {
      if (!this.earlierSeparatorInserted && needEarlierSeparator) {
        newItems = [earlierSeparator, ...newItems]
        this.earlierSeparatorInserted = true
      }
      if (!this.recentSeparatorInserted && needRecentSeparator) {
        const idx = newItems.findIndex((item) => item.api === EApiType.Watchlater && item.add_at >= recentGate)
        newItems = [...newItems.slice(0, idx), recentSeparator, ...newItems.slice(idx)]
        this.recentSeparatorInserted = true
      }
    }
    // desc
    else {
      if (!this.recentSeparatorInserted && needRecentSeparator) {
        newItems = [recentSeparator, ...items]
        this.recentSeparatorInserted = true
      }
      if (!this.earlierSeparatorInserted && needEarlierSeparator) {
        const idx = newItems.findIndex((item) => item.api === EApiType.Watchlater && item.add_at < recentGate)
        newItems = [...newItems.slice(0, idx), earlierSeparator, ...newItems.slice(idx)]
        this.earlierSeparatorInserted = true
      }
    }

    return newItems
  }
}
