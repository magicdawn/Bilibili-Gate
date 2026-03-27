export interface DraftViewJson {
  code: number
  message: string
  ttl: number
  data: Data
}

export interface Data {
  id: number
  title: string
  content: string
  summary: string
  banner_url: string
  reason: string
  template_id: number
  state: number
  reprint: number
  image_urls: null
  origin_image_urls: null
  tags: any[]
  category: Category
  author: Author
  stats: null
  publish_time: number
  ctime: number
  mtime: number
  view_url: string
  edit_url: string
  is_preview: number
  dynamic_intro: string
  list: null
  media_id: number
  spoiler: number
  edit_times: number
  pre_view_url: string
  original: number
  top_video_info: null
  type: number
  video_url: string
  dyn_id_str: string
  topic_info: null
  opus: Opus
  is_new_editor: number
  private_pub: number
  only_fans: number
  editable: number
  comment_selected: number
  up_closed_reply: number
  timer_pub_time: number
  only_fans_level: number
  only_fans_dnd: number
}

export interface Author {
  mid: number
  name: string
  face: string
  pendant: Pendant
  official_verify: OfficialVerify
  nameplate: Nameplate
  vip: Vip
  fans: number
  level: number
}

export interface Nameplate {
  nid: number
  name: string
  image: string
  image_small: string
  level: string
  condition: string
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
}

export interface Vip {
  type: number
  status: number
  due_date: number
  vip_pay_type: number
  theme_type: number
  label: null
  avatar_subscript: number
  nickname_color: string
}

export interface Category {
  id: number
  parent_id: number
  name: string
}

export interface Opus {
  opus_id: number
  opus_source: number
  title: string
  content: Content
  pub_info: PubInfo
}

export interface Content {
  paragraphs: Paragraph[]
}

export interface Paragraph {
  para_type: number
  code?: Code
}

export interface Code {
  lang: string
  content: string
}

export interface PubInfo {
  uid: number
  editor_version: string
}
