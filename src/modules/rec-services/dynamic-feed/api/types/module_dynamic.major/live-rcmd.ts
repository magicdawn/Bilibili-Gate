import type { DynamicFeedEnums } from '../../enums'

export interface MajorTypeLiveRcmd {
  type: DynamicFeedEnums.MajorType.LiveRcmd
  live_rcmd: LiveRcmd
}

export interface LiveRcmd {
  content: string // json as string
  reserve_type: number
}
