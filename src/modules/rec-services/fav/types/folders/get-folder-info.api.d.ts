export interface FavFolderInfoJson {
  code: number
  message: string
  ttl: number
  data: FavFolderInfo
}

export interface FavFolderInfo {
  id: number
  fid: number
  mid: number
  attr: number
  title: string
  cover: string
  upper: Upper
  cover_type: number
  cnt_info: CntInfo
  type: number
  intro: string
  ctime: number
  mtime: number
  state: number
  fav_state: number
  like_state: number
  media_count: number
  is_top: boolean
}

export interface CntInfo {
  collect: number
  play: number
  thumb_up: number
  share: number
}

export interface Upper {
  mid: number
  name: string
  face: string
  followed: boolean
  vip_type: number
  vip_statue: number
}
