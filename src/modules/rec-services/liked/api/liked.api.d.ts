export interface AppSpaceLikedJson {
  code: number
  message: string
  ttl: number
  data: Data
}

export interface Data {
  count: number
  item: LikedItem[]
}

export interface LikedItem {
  title: string
  translated_title: string
  translate_status: string
  subtitle: string
  tname: string
  cover: string
  cover_icon: string
  uri: string
  param: string
  goto: Goto
  length: string
  duration: number
  is_popular: boolean
  is_steins: boolean
  is_ugcpay: boolean
  is_cooperation: boolean
  is_pgc: boolean
  is_live_playback: boolean
  is_pugv: boolean
  is_fold: boolean
  is_oneself: boolean
  view_self_type: number
  play: number
  danmaku: number
  ctime: number
  ugc_pay: number
  author: string
  state: boolean
  videos: number
  view_content: string
  icon_type: number
  publish_time_text: string
  cover_left_icon: string
  cover_left_text: string
  sub_title_icon: string
}

export enum Goto {
  AV = 'av',
}
