import type { DynamicFeedEnums } from '../../enums'

export interface MajorTypePgc {
  type: DynamicFeedEnums.MajorType.Pgc
  pgc: Pgc
}

export interface Pgc {
  badge: Badge
  cover: string
  epid: number
  jump_url: string
  season_id: number
  stat: Stat
  sub_type: number
  title: string
  type: number
}

export interface Badge {
  bg_color: string
  color: string
  text: string
}

export interface Stat {
  danmaku: string
  play: string
}
