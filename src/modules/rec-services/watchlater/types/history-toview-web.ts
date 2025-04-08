export interface WatchlaterJson {
  code: number
  message: string
  ttl: number
  data: Data
}

export interface Data {
  count: number
  list: WatchlaterItem[]
}

export interface WatchlaterItem {
  aid: number
  videos: number
  tid: number
  tname: string
  copyright: number
  pic: string
  title: string
  pubdate: number
  ctime: number
  desc: string
  state: number
  duration: number
  mission_id?: number
  rights: { [key: string]: number }
  owner: Owner
  stat: { [key: string]: number }
  dynamic: string
  dimension: Dimension
  season_id?: number
  short_link_v2: string
  first_frame?: string
  pub_location?: string
  cover43: string
  tidv2: number
  tnamev2: string
  pid_v2: number
  pid_name_v2: string
  pages: Page[]
  cid: number
  progress: number
  add_at: number
  bvid: string
  uri: string
  viewed: boolean
  seq: number
  enable_vt: number
  view_text_1: string
  is_pgc: boolean
  pgc_label: PgcLabel
  is_pugv: boolean
  up_from_v2?: number
  redirect_url?: string
  bangumi?: Bangumi
}

export interface Bangumi {
  ep_id: number
  title: string
  long_title: string
  episode_status: number
  follow: number
  cover: string
  season: Season
}

export interface Season {
  season_id: number
  title: string
  season_status: number
  is_finish: number
  total_count: number
  newest_ep_id: number
  newest_ep_index: string
  season_type: number
}

export interface Dimension {
  width: number
  height: number
  rotate: number
}

export interface Owner {
  mid: number
  name: string
  face: string
}

export interface Page {
  cid: number
  page: number
  from: From
  part: string
  duration: number
  vid: string
  weblink: string
  dimension: Dimension
  first_frame?: string
  ctime: number
}

export enum From {
  Vupload = 'vupload',
}

export enum PgcLabel {
  Empty = '',
  纪录片 = '纪录片',
}
