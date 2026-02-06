import dayjs from 'dayjs'
import { HelpInfo } from '$components/_base/HelpInfo'
import { EApiType } from '$define/index.shared'
import type { ItemsSeparator } from '$define'

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
