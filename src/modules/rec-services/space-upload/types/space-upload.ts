export interface SpaceUploadJson {
  code: number
  message: string
  ttl: number
  data: Data
}

export interface Data {
  list: List
  page: Page
  episodic_button: EpisodicButton
  is_risk: boolean
  gaia_res_type: number
  gaia_data: null
}

export interface EpisodicButton {
  text: string
  uri: string
}

export interface List {
  slist: any[]
  tlist: { [key: string]: Tlist }
  vlist: SpaceUploadItem[]
}

export interface Tlist {
  tid: number
  count: number
  name: string
}

export interface SpaceUploadItem {
  comment: number
  typeid: number
  play: number
  pic: string
  subtitle: string
  description: string
  copyright: string
  title: string
  review: number
  author: string
  mid: number
  created: number
  length: string
  video_review: number
  aid: number
  bvid: string
  hide_click: boolean
  is_pay: number
  is_union_video: number
  is_steins_gate: number
  is_live_playback: number
  is_lesson_video: number
  is_lesson_finished: number
  lesson_update_info: string
  jump_url: string
  meta: null
  is_avoided: number
  season_id: number
  attribute: number
  is_charging_arc: boolean
  elec_arc_type: number
  vt: number
  enable_vt: number
  vt_display: string
  playback_position: number
  is_self_view: boolean
}

export interface Page {
  pn: number
  ps: number
  count: number
}
