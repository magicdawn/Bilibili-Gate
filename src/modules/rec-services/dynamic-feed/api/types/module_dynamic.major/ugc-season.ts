import type { DynamicFeedEnums } from '../../enums'

export interface MajorTypeUgcSeason {
  type: DynamicFeedEnums.MajorType.UgcSeason
  ugc_season: UgcSeason
}

export interface UgcSeason {
  aid: number
  badge: Badge
  bvid: string
  cover: string
  desc: string
  disable_preview: number
  duration_text: string
  jump_url: string
  stat: Stat
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
