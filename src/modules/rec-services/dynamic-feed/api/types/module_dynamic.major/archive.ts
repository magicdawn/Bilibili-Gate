import type { DynamicFeedEnums } from '../../enums'

export interface MajorTypeArchive {
  type: DynamicFeedEnums.MajorType.Archive
  archive: Archive
}

export interface Archive {
  aid: string
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
  icon_url: null
  text: string
}

export interface Stat {
  danmaku: string
  play: string
}
