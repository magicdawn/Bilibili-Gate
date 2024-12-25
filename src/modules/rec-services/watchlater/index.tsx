import { type ItemsSeparator, type WatchlaterItemExtend } from '$define'
import { EApiType } from '$define/index.shared'
import { getHasLogined, getUid } from '$utility/cookie'
import { whenIdle } from '$utility/dom'
import toast from '$utility/toast'
import dayjs from 'dayjs'
import { invariant, orderBy, shuffle } from 'es-toolkit'
import { proxy, useSnapshot } from 'valtio'
import { proxySet } from 'valtio/utils'
import { BaseTabService, type IService } from '../_base'
import { getAllWatchlaterItemsV2, getWatchlaterItemFrom } from './api'
import { type WatchlaterItem } from './types'
import { WatchlaterUsageInfo } from './usage-info'
import { WatchlaterItemsOrder } from './watchlater-enum'

export const watchlaterState = proxy({
  updatedAt: 0,
  bvidSet: proxySet<string>(),
})

export function useWatchlaterState(bvid?: string) {
  const set = useSnapshot(watchlaterState).bvidSet
  return !!bvid && set.has(bvid)
}

if (getHasLogined() && getUid()) {
  void (async () => {
    await whenIdle()

    const { items: allWatchlaterItems } = await getAllWatchlaterItemsV2()
    if (!allWatchlaterItems.length) return

    watchlaterState.updatedAt = Date.now()
    watchlaterState.bvidSet = proxySet<string>(allWatchlaterItems.map((x) => x.bvid))
  })()
}

export class WatchlaterRecService extends BaseTabService<WatchlaterItemExtend | ItemsSeparator> {
  static PAGE_SIZE = 10

  private innerService: NormalOrderService | ShuffleOrderService
  constructor(
    order: WatchlaterItemsOrder,
    addSeparator: boolean,
    prevShuffleBvidIndexMap?: BvidIndexMap,
  ) {
    super(WatchlaterRecService.PAGE_SIZE)
    this.innerService =
      order === WatchlaterItemsOrder.Shuffle
        ? new ShuffleOrderService(addSeparator, prevShuffleBvidIndexMap)
        : new NormalOrderService(order, addSeparator)
  }

  override get hasMoreExceptQueue() {
    return this.innerService.hasMore
  }

  override fetchMore(
    abortSignal: AbortSignal,
  ): Promise<(WatchlaterItemExtend | ItemsSeparator)[] | undefined> {
    return this.innerService.loadMore(abortSignal)
  }

  override get usageInfo() {
    return <WatchlaterUsageInfo service={this} />
  }

  get state() {
    return this.innerService.state
  }

  // for remove watchlater card
  decreaseTotal() {
    if (typeof this.innerService.state.total === 'undefined') return
    this.innerService.state.total--
  }

  getServiceSnapshot() {
    const bvidIndexMap =
      this.innerService instanceof ShuffleOrderService
        ? this.innerService.currentBvidIndexMap
        : undefined
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
    uniqId: `watchlater-${item.bvid}`,
  }
}

// recent + earlier
const getRecentGate = () => dayjs().subtract(2, 'days').unix()

const recentSeparator: ItemsSeparator = {
  api: EApiType.Separator as const,
  uniqId: 'watchlater-recent',
  content: '近期',
}
const earlierSeparator: ItemsSeparator = {
  api: EApiType.Separator as const,
  uniqId: 'watchlater-earlier',
  content: '更早',
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

  loaded = false
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
    if (this.loaded) return
    const items = await this.fetch(abortSignal)
    this.loaded = true
    return items
  }

  currentBvidIndexMap?: BvidIndexMap
  private async fetch(abortSignal: AbortSignal) {
    const { items: rawItems, err } = await getAllWatchlaterItemsV2(false, abortSignal)
    if (typeof err !== 'undefined') {
      showApiRequestError(err)
    }

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
      itemsWithSeparator
        .filter((x) => x.api !== EApiType.Separator)
        .map((x, index) => [x.bvid, index]),
    )
    return itemsWithSeparator
  }
}

class NormalOrderService implements IService {
  // configs
  constructor(
    private order: WatchlaterItemsOrder,
    private addSeparator: boolean,
  ) {
    invariant(order !== WatchlaterItemsOrder.Shuffle, 'shuffle not supported in NormalOrderService')
  }

  firstPageLoaded = false
  state = proxy<{ total?: number }>({
    total: undefined,
  })

  hasMore: boolean = true
  nextKey: string = ''

  async loadMore() {
    if (!this.hasMore) return

    const result = await getWatchlaterItemFrom(
      this.nextKey,
      this.order === WatchlaterItemsOrder.AddTimeAsc,
    )
    // error
    if (typeof result.err !== 'undefined') {
      this.hasMore = false
      showApiRequestError(result.err)
      return
    }

    this.firstPageLoaded = true
    this.state.total = result.total
    this.hasMore = result.hasMore
    this.nextKey = result.nextKey

    const items: WatchlaterItemExtend[] = result.items.map(extendItem)
    return this.insertSeparator(items)
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
        const idx = newItems.findIndex(
          (item) => item.api === EApiType.Watchlater && item.add_at >= recentGate,
        )
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
        const idx = newItems.findIndex(
          (item) => item.api === EApiType.Watchlater && item.add_at < recentGate,
        )
        newItems = [...newItems.slice(0, idx), earlierSeparator, ...newItems.slice(idx)]
        this.earlierSeparatorInserted = true
      }
    }

    return newItems
  }
}
