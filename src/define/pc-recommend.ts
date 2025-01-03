export interface PcRecommendJson {
  code: number
  message: string
  ttl: number
  data: Data
}

export interface Data {
  item: PcRecItem[]
  business_card: null
  floor_info: null
  user_feature: null
  preload_expose_pct: number
  preload_floor_expose_pct: number
  mid: number
}

export interface PcRecItem {
  id: number
  bvid: string
  cid: number
  goto: PcRecGoto
  uri: string
  pic: string
  pic_4_3: string
  title: string
  duration: number
  pubdate: number
  owner: Owner | null
  stat: Stat | null
  av_feature: null
  is_followed: number
  rcmd_reason: RcmdReason | null
  show_info: number
  track_id: string
  pos: number
  room_info: RoomInfo | null
  ogv_info: null
  business_info: BusinessInfo | null
  is_stock: number
  enable_vt: number
  vt_display: string
  dislike_switch: number
  dislike_switch_pc: number
}

export interface BusinessInfo {
  id: number
  contract_id: string
  res_id: number
  asg_id: number
  pos_num: number
  name: string
  pic: string
  litpic: string
  url: string
  style: number
  is_ad: boolean
  archive: Archive
  agency: string
  label: string
  intro: string
  creative_type: number
  request_id: string
  creative_id: number
  src_id: number
  area: number
  is_ad_loc: boolean
  ad_cb: string
  title: string
  server_type: number
  cm_mark: number
  stime: number
  mid: string
  activity_type: number
  epid: number
  sub_title: string
  ad_desc: string
  adver_name: string
  null_frame: boolean
  pic_main_color: string
  card_type: number
  business_mark: BusinessMark
  inline: Inline
  operater: string
  jump_target: number
  show_urls: null
  click_urls: null
  feedback_panel: FeedbackPanel
  sales_type: number
  rcmd_reason_style: RcmdReasonStyle
  pc_button: PCButton
  desc: string
  wx_program_info: null
}

export interface Archive {
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
  attribute: number
  duration: number
  mission_id?: number
  rights: { [key: string]: number }
  owner: Owner
  stat: { [key: string]: number }
  dynamic: string
  cid: number
  dimension: Dimension
  short_link_v2: string
  first_frame: string
  pub_location: string
  cover43: string
  tidv2: number
  tnamev2: string
  bvid: string
  enable_vt: number
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

export interface BusinessMark {
  bg_border_color: string
  bg_color: string
  bg_color_night: string
  border_color: string
  border_color_night: string
  img_height: number
  img_url: string
  img_width: number
  text: string
  text_color: string
  text_color_night: string
  type: number
}

export interface FeedbackPanel {
  close_rec_tips: string
  feedback_panel_detail: FeedbackPanelDetail[]
  open_rec_tips: string
  panel_type_text: string
  toast: string
}

export interface FeedbackPanelDetail {
  icon_url: string
  jump_type: number
  jump_url: string
  module_id: number
  secondary_panel?: SecondaryPanel[]
  sub_text: string
  text: string
}

export interface SecondaryPanel {
  reason_id: number
  text: string
}

export interface Inline {
  inline_use_same: number
  inline_type: number
  inline_url: string
  inline_barrage_switch: number
}

export interface PCButton {
  button_text: string
}

export interface RcmdReasonStyle {
  bg_color: string
  bg_color_night: string
  bg_style: number
  border_color: string
  border_color_night: string
  icon_height: number
  icon_night_url: string
  icon_url: string
  icon_width: number
  text: string
  text_color: string
  text_color_night: string
}

export enum PcRecGoto {
  AV = 'av',
  Ad = 'ad',
  Live = 'live',
}

export interface RcmdReason {
  content?: string
  reason_type: number
}

export interface RoomInfo {
  room_id: number
  uid: number
  live_status: number
  show: Show
  area: Area
  watched_show: WatchedShow
}

export interface Area {
  area_id: number
  area_name: string
  parent_area_id: number
  parent_area_name: string
  old_area_id: number
  old_area_name: string
  old_area_tag: string
  area_pk_status: number
  is_video_room: boolean
}

export interface Show {
  short_id: number
  title: string
  cover: string
  keyframe: string
  popularity_count: number
  tag_list: null
  live_start_time: number
  live_id: number
  hidden_online: boolean
}

export interface WatchedShow {
  switch: boolean
  num: number
  text_small: string
  text_large: string
  icon: string
  icon_location: string
  icon_web: string
}

export interface Stat {
  view: number
  like: number
  danmaku: number
  vt: number
}
