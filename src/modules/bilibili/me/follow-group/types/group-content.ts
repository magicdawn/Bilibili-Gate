/* eslint-disable @typescript-eslint/no-empty-object-type */

export interface FollowGroupContentJson {
  code: number
  message: string
  ttl: number
  data: FollowGroupContent[]
}

export interface FollowGroupContent {
  mid: number
  attribute: number
  tag: null
  special: number
  contract_info: ContractInfo
  uname: string
  face: string
  sign: string
  face_nft: number
  official_verify: OfficialVerify
  vip: Vip
  name_render: NameRender
  live: Live
  nft_icon: string
  rec_reason: string
  track_id: string
  follow_time: string
}

export interface ContractInfo {
  is_contract?: boolean
}

export interface Live {
  live_status: number
  jump_url: string
}

export interface NameRender {}

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
  nickname_color: string
  avatar_subscript_url: string
}

export interface Label {
  path: string
  text: string
  label_theme: string
  text_color: string
  bg_style: number
  bg_color: string
  border_color: string
}
