export interface NormalRankJson {
  code: number
  message: string
  ttl: number
  data: Data
}

export interface Data {
  note: string
  list: NormalRankItem[]
}

export interface NormalRankItem {
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
  cid: number
  dimension: Dimension
  short_link_v2: string
  first_frame?: string
  cover43: string
  bvid: string
  score: number
  others?: NormalRankItem[]
  enable_vt: number
  season_id?: number
  pub_location?: string
  up_from_v2?: number
  attribute?: number
  attribute_v2?: number
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
