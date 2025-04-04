export interface VideoPageListJson {
  code: number
  message: string
  ttl: number
  data: VideoPage[]
}

export interface VideoPage {
  cid: number
  page: number
  from: string
  part: string
  duration: number
  vid: string
  weblink: string
  dimension: Dimension
  first_frame: string
  ctime: number
}

export interface Dimension {
  width: number
  height: number
  rotate: number
}
