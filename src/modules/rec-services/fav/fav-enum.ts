import { orderBy, shuffle } from 'es-toolkit'
import type { FavItemExtend } from './types'

export enum FavItemsOrder {
  Initial = 'initial', // 初始顺序
  Shuffle = 'shuffle',
  PubTimeDesc = 'pub-time-desc',
  PubTimeAsc = 'pub-time-asc',
  PlayCountDesc = 'play-count-desc', // asc has no real use case
  CollectCountDesc = 'collect-count-desc',

  // fav-folder only
  FavTimeDesc = 'fav-time-desc',
  FavTimeAsc = 'fav-time-asc',
}

export function handleItemsOrder(items: FavItemExtend[], itemsOrder: FavItemsOrder) {
  if (itemsOrder === FavItemsOrder.Initial) {
    return items
  }
  if (itemsOrder === FavItemsOrder.Shuffle) {
    return shuffle(items)
  }

  // pub time
  if (itemsOrder === FavItemsOrder.PubTimeDesc || itemsOrder === FavItemsOrder.PubTimeAsc) {
    const order = itemsOrder === FavItemsOrder.PubTimeDesc ? 'desc' : 'asc'
    return orderBy(items, [(x) => x.pubtime], [order])
  }

  // fav time: fav-folder only!
  if (
    (itemsOrder === FavItemsOrder.FavTimeDesc || itemsOrder === FavItemsOrder.FavTimeAsc) &&
    items.every((x) => x.from === 'fav-folder')
  ) {
    const order = itemsOrder === FavItemsOrder.FavTimeDesc ? 'desc' : 'asc'
    return orderBy(items, [(x) => x.fav_time], [order])
  }

  // count
  if (itemsOrder === FavItemsOrder.PlayCountDesc) {
    return orderBy(items, [(x) => x.cnt_info.play], ['desc'])
  }
  if (itemsOrder === FavItemsOrder.CollectCountDesc) {
    return orderBy(items, [(x) => x.cnt_info.collect], ['desc'])
  }

  return items
}
