export interface SpaceAccInfoJson {
  code: number
  message: string
  ttl: number
  data: SpaceAccInfo
}

export interface SpaceAccInfo {
  mid: number
  name: string
  sex: string
  face: string
  face_nft: number
  face_nft_type: number
  sign: string
  rank: number
  level: number
  jointime: number
  moral: number
  silence: number
  coins: number
  fans_badge: boolean
  fans_medal: FansMedal
  official: Official
  vip: Vip
  pendant: Pendant
  nameplate: Nameplate
  user_honour_info: UserHonourInfo
  is_followed: boolean
  top_photo: string
  theme: SysNotice
  sys_notice: SysNotice
  live_room: null
  birthday: string
  school: School
  profession: Profession
  tags: null
  series: Series
  is_senior_member: number
  mcn_info: null
  gaia_res_type: number
  gaia_data: null
  is_risk: boolean
  elec: Elec
  contract: Contract
  certificate_show: boolean
  name_render: null
}

export interface Contract {
  is_display: boolean
  is_follow_display: boolean
}

export interface Elec {
  show_info: ShowInfo
}

export interface ShowInfo {
  show: boolean
  state: number
  title: string
  icon: string
  jump_url: string
}

export interface FansMedal {
  show: boolean
  wear: boolean
  medal: null
}

export interface Nameplate {
  nid: number
  name: string
  image: string
  image_small: string
  level: string
  condition: string
}

export interface Official {
  role: number
  title: string
  desc: string
  type: number
}

export interface Pendant {
  pid: number
  name: string
  image: string
  expire: number
  image_enhance: string
  image_enhance_frame: string
  n_pid: number
}

export interface Profession {
  name: string
  department: string
  title: string
  is_show: number
}

export interface School {
  name: string
}

export interface Series {
  user_upgrade_status: number
  show_upgrade_window: boolean
}

export interface SysNotice {}

export interface UserHonourInfo {
  mid: number
  colour: null
  tags: any[]
  is_latest_100honour: number
}

export interface Vip {
  type: number
  status: number
  due_date: number
  vip_pay_type: number
  theme_type: number
  label: Label
  avatar_subscript: number
  nickname_color: string
  role: number
  avatar_subscript_url: string
  tv_vip_status: number
  tv_vip_pay_type: number
  tv_due_date: number
  avatar_icon: AvatarIcon
}

export interface AvatarIcon {
  icon_type: number
  icon_resource: SysNotice
}

export interface Label {
  path: string
  text: string
  label_theme: string
  text_color: string
  bg_style: number
  bg_color: string
  border_color: string
  use_img_label: boolean
  img_label_uri_hans: string
  img_label_uri_hant: string
  img_label_uri_hans_static: string
  img_label_uri_hant_static: string
}
