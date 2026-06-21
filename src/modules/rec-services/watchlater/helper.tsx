import dayjs from 'dayjs'
import { HelpInfo } from '$components/_base/HelpInfo'
import {
  getMultiSelectedNormalVideoItems,
  warnNoMultiSelectedNormalVideoItems,
} from '$components/RecGrid/rec-grid-state'
import { EApiType } from '$enums'
import { getSettingsSnapshot, type Settings } from '$modules/settings'
import { handleRequestError } from '$request'
import { WatchlaterApiService } from './api'
import { WatchlaterItemsOrder } from './watchlater-enum'
import type { RecSharedEmitter } from '$components/Recommends/rec.shared'
import type { ItemsSeparator } from '$define'

export function buildWatchlaterVideoCardUrl(
  bvid: string,
  aid?: string | number,
  config?: Pick<Settings['watchlater'], 'itemsOrder' | 'continuePlay' | 'continuePlayDirection'>,
) {
  const { itemsOrder, continuePlay, continuePlayDirection } = config || getSettingsSnapshot().watchlater

  if (!continuePlay) return `https://www.bilibili.com/video/${bvid}/`
  const params = new URLSearchParams({ bvid })
  if (aid) params.set('oid', String(aid))

  // 观察到 desc=1 会被移除;
  // viewing desc
  if (itemsOrder === WatchlaterItemsOrder.AddTimeDesc) {
    params.set('desc', continuePlayDirection === 'normal' ? '1' : '0')
  }
  // viewing asc
  else if (itemsOrder === WatchlaterItemsOrder.AddTimeAsc) {
    params.set('desc', continuePlayDirection === 'normal' ? '0' : '1')
  }

  return `https://www.bilibili.com/list/watchlater?${params.toString()}`
}

// define "recent"
export const getRecentGate = () => dayjs().subtract(2, 'days').unix()
export const recentGateDescription = '最近 48 小时内'

// recent + earlier
export const recentSeparator: ItemsSeparator = {
  api: EApiType.Separator as const,
  uniqId: `${EApiType.Watchlater}:separator:recent`,
  content: (
    <>
      近期
      <HelpInfo>{recentGateDescription}</HelpInfo>
    </>
  ),
}

export const earlierSeparator: ItemsSeparator = {
  api: EApiType.Separator as const,
  uniqId: `${EApiType.Watchlater}:separator:earlier`,
  content: '更早',
}

/**
 * 批量移除稍后再看
 */
export async function removeMultiSelectedWatchlaterItems(recSharedEmitter: RecSharedEmitter) {
  const selected = getMultiSelectedNormalVideoItems()
  if (!selected?.length) return warnNoMultiSelectedNormalVideoItems()

  const avids = selected.map((x) => x.cardData.avid).filter(Boolean)
  const uniqIds = selected.map((x) => x.item.uniqId)
  const titles = selected.map((x) => x.cardData.title)
  if (!avids.length) return warnNoMultiSelectedNormalVideoItems()

  const result = await WatchlaterApiService.batchRemove(avids)
  return result.tapBoth({
    err: handleRequestError,
    ok() {
      recSharedEmitter.emit('remove-cards', [uniqIds, titles])
    },
  })
}
