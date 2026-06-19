import type { EHistoryBusiness } from '../enums'

export interface HistoryItem {
  title: string
  long_title: string
  cover: string
  covers: null
  uri: string
  history: ItemHistoryInfo
  videos: number
  author_name: string
  author_face: string
  author_mid: number
  view_at: number
  progress: number
  badge: string
  show_title: string
  duration: number
  current: string
  total: number
  new_desc: string
  is_finish: number
  is_fav: number
  kid: number
  tag_name: string
  live_status: number
}

export interface ItemHistoryInfo {
  oid: number
  epid: number
  bvid: string
  page: number
  cid: number
  part: string
  business: EHistoryBusiness
  dt: number
}
