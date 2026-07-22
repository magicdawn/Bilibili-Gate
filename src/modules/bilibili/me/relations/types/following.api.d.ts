export interface FollowingsJson {
  code: number
  message: string
  ttl: number
  data: FollowingsData
}

export interface FollowingsData {
  list: FollowingItem[]
  re_version: number
  total: number
}

export interface FollowingItem {
  mid: number
  attribute: number
  mtime: number
  tag: number[] | null
  special: number
  contract_info: ContractInfo
  uname: string
  face: string
  sign: string
  face_nft: number
  handle: string
  official_verify: OfficialVerify
  vip: Vip
  name_render: ContractInfo
  nft_icon: string
  rec_reason: string
  track_id: string
  follow_time: string
}

export interface ContractInfo {}

export interface OfficialVerify {
  type: number
  desc: string
}

export interface Vip {
  vipType: number
  vipDueDate: number
  dueRemark: string
  accessStatus: number
  vipStatus: number
  vipStatusWarn: string
  themeType: number
  label: Label
  avatar_subscript: number
  nickname_color: Color
  avatar_subscript_url: string
}

export interface Label {
  path: string
  text: Text
  label_theme: LabelTheme
  text_color: TextColor
  bg_style: number
  bg_color: Color
  border_color: string
}

export enum Color {
  Empty = '',
  Fb7299 = '#FB7299',
}

export enum LabelTheme {
  AnnualVip = 'annual_vip',
  Empty = '',
  TenAnnualVip = 'ten_annual_vip',
}

export enum Text {
  Empty = '',
  十年大会员 = '十年大会员',
  年度大会员 = '年度大会员',
}

export enum TextColor {
  Empty = '',
  Ffffff = '#FFFFFF',
}
