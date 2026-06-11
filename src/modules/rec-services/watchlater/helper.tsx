import dayjs from 'dayjs'
import { HelpInfo } from '$components/_base/HelpInfo'
import { EApiType } from '$enums'
import { getSettingsSnapshot, type Settings } from '$modules/settings'
import { WatchlaterItemsOrder } from './watchlater-enum'
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
