export interface LoginInfoJson {
  code: number
  message: string
  ttl: number
  data: LoginInfo
}

export interface LoginInfo {
  isLogin: boolean
  email_verified: number
  face: string
  face_nft: number
  face_nft_type: number
  level_info: LevelInfo
  mid: number
  mobile_verified: number
  money: number
  moral: number
  official: Official
  officialVerify: OfficialVerify
  pendant: Pendant
  scores: number
  uname: string
  vipDueDate: number
  vipStatus: number
  vipType: number
  vip_pay_type: number
  vip_theme_type: number
  vip_label: Label
  vip_avatar_subscript: number
  vip_nickname_color: string
  vip: Vip
  wallet: Wallet
  has_shop: boolean
  shop_url: string
  answer_status: number
  is_senior_member: number
  wbi_img: WbiImg
  is_jury: boolean
  name_render: null
  legal_region: string
  ip_region: string
}

export interface LevelInfo {
  current_level: number
  current_min: number
  current_exp: number
  next_exp: string
}

export interface Official {
  role: number
  title: string
  desc: string
  type: number
}

export interface OfficialVerify {
  type: number
  desc: string
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
  ott_info: OttInfo
  super_vip: SuperVip
}

export interface AvatarIcon {
  icon_type: number
  icon_resource: IconResource
}

export interface IconResource {}

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
  label_id: number
  label_goto: LabelGoto
  img_label_uri_i18n: string
  img_label_uri_i18n_static: string
  label_type: number
}

export interface LabelGoto {
  mobile: string
  pc_web: string
}

export interface OttInfo {
  vip_type: number
  pay_type: number
  pay_channel_id: string
  status: number
  overdue_time: number
}

export interface SuperVip {
  is_super_vip: boolean
}

export interface Wallet {
  mid: number
  bcoin_balance: number
  coupon_balance: number
  coupon_due_time: number
}

export interface WbiImg {
  img_url: string
  sub_url: string
}
