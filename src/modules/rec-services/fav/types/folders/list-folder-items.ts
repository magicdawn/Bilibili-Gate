// Generated by https://quicktype.io

export interface ResourceListJSON {
  code: number
  message: string
  ttl: number
  data: FavFolderDetail
}

export interface FavFolderDetail {
  info: FavFolderDetailInfo
  medias: FavFolderDetailMedia[]
  has_more: boolean
  ttl: number
}

export interface FavFolderDetailInfo {
  id: number
  fid: number
  mid: number
  attr: number
  title: string
  cover: string
  upper: InfoUpper
  cover_type: number
  cnt_info: InfoCntInfo
  type: number
  intro: string
  ctime: number
  mtime: number
  state: number
  fav_state: number
  like_state: number
  media_count: number
}

export interface InfoCntInfo {
  collect: number
  play: number
  thumb_up: number
  share: number
}

export interface InfoUpper {
  mid: number
  name: string
  face: string
  followed: boolean
  vip_type: number
  vip_statue: number
}

export interface FavFolderDetailMedia {
  id: number
  type: number
  title: string
  cover: string
  intro: string
  page: number
  duration: number
  upper: MediaUpper
  attr: number
  cnt_info: MediaCntInfo
  link: string
  ctime: number
  pubtime: number
  fav_time: number
  bv_id: string
  bvid: string
  season: null
  ogv: null
  ugc: Ugc
}

export interface MediaCntInfo {
  collect: number
  play: number
  danmaku: number
  vt: number
  play_switch: number
  reply: number
}

export interface Ugc {
  first_cid: number
}

export interface MediaUpper {
  mid: number
  name: string
  face: string
}
