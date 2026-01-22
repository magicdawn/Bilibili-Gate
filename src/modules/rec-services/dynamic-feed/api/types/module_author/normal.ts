import type { DynamicFeedEnums } from '../../enums'

export interface AuthorTypeNormal {
  type: DynamicFeedEnums.AuthorType.Normal
  avatar: Avatar
  decorate: Decorate
  face: string
  face_nft: boolean
  following: boolean
  jump_url: string
  label: string
  mid: number
  name: string
  official_verify: OfficialVerify
  pendant: Pendant
  pub_action: string
  pub_location_text: string
  pub_time: string
  pub_ts: number
  vip: Vip
}

export interface Avatar {
  container_size: ContainerSize
  fallback_layers: FallbackLayers
  mid: string
}

export interface ContainerSize {
  height: number
  width: number
}

export interface FallbackLayers {
  is_critical_group: boolean
  layers: Layer[]
}

export interface Layer {
  general_spec: GeneralSpec
  layer_config: LayerConfig
  resource: Resource
  visible: boolean
}

export interface GeneralSpec {
  pos_spec: PosSpec
  render_spec: RenderSpec
  size_spec: ContainerSize
}

export interface PosSpec {
  axis_x: number
  axis_y: number
  coordinate_pos: number
}

export interface RenderSpec {
  opacity: number
}

export interface LayerConfig {
  is_critical?: boolean
  tags: Tags
}

export interface Tags {
  AVATAR_LAYER?: AVATARLAYERClass
  GENERAL_CFG: GeneralCFG
  ICON_LAYER?: AVATARLAYERClass
}

export interface AVATARLAYERClass {}

export interface GeneralCFG {
  config_type: number
  general_config: GeneralConfig
}

export interface GeneralConfig {
  web_css_style: WebCSSStyle
}

export interface WebCSSStyle {
  'borderRadius': string
  'background-color'?: string
  'border'?: string
  'boxSizing'?: string
}

export interface Resource {
  res_image: ResImage
  res_type: number
}

export interface ResImage {
  image_src: ImageSrc
}

export interface ImageSrc {
  placeholder?: number
  remote?: Remote
  src_type: number
  local?: number
}

export interface Remote {
  bfs_style: string
  url: string
}

export interface Decorate {
  card_url: string
  fan: Fan
  id: number
  jump_url: string
  name: string
  type: number
}

export interface Fan {
  color: string
  color_format: ColorFormat
  is_fan: boolean
  num_prefix: string
  num_str: string
  number: number
}

export interface ColorFormat {
  colors: string[]
  end_point: string
  gradients: number[]
  start_point: string
}

export interface OfficialVerify {
  desc: string
  type: number
}

export interface Pendant {
  expire: number
  image: string
  image_enhance: string
  image_enhance_frame: string
  n_pid: number
  name: string
  pid: number
}

export interface Vip {
  avatar_subscript: number
  avatar_subscript_url: string
  due_date: number
  label: Label
  nickname_color: string
  status: number
  theme_type: number
  type: number
}

export interface Label {
  bg_color: string
  bg_style: number
  border_color: string
  img_label_uri_hans: string
  img_label_uri_hans_static: string
  img_label_uri_hant: string
  img_label_uri_hant_static: string
  label_theme: string
  path: string
  text: string
  text_color: string
  use_img_label: boolean
}
