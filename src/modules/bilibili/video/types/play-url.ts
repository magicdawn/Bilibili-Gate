export interface VideoPlayUrlJson {
  code: number
  message: string
  ttl: number
  data: Data
}

export interface Data {
  from: string
  result: string
  message: string
  quality: number
  format: string
  timelength: number
  accept_format: string
  accept_description: string[]
  accept_quality: number[]
  video_codecid: number
  seek_param: string
  seek_type: string
  dash?: Dash
  durl?: Durl[]
  support_formats: SupportFormat[]
  high_format: null
  volume: Volume
  last_play_time: number
  last_play_cid: number
  view_info: null
}

export interface Dash {
  duration: number
  minBufferTime: number
  min_buffer_time: number
  video: Audio[]
  audio: Audio[]
  dolby: Dolby
  flac: null
}

export interface Audio {
  id: number
  baseUrl: string
  base_url: string
  backupUrl?: string[]
  backup_url?: string[]
  bandwidth: number
  mimeType: MIMEType
  mime_type: MIMEType
  codecs: string
  width: number
  height: number
  frameRate: FrameRate
  frame_rate: FrameRate
  sar: Sar
  startWithSap: number
  start_with_sap: number
  SegmentBase: SegmentBase
  segment_base: SegmentBaseClass
  codecid: number
}

export interface SegmentBase {
  Initialization: string
  indexRange: string
}

export enum FrameRate {
  Empty = '',
  The29968 = '29.968',
}

export enum MIMEType {
  AudioMp4 = 'audio/mp4',
  VideoMp4 = 'video/mp4',
}

export enum Sar {
  Empty = '',
  The11 = '1:1',
  The640639 = '640:639',
}

export interface SegmentBaseClass {
  initialization: string
  index_range: string
}

export interface Dolby {
  type: number
  audio: null
}

export interface SupportFormat {
  quality: number
  format: string
  new_description: string
  display_desc: string
  superscript: string
  codecs: string[]
}

export interface Volume {
  measured_i: number
  measured_lra: number
  measured_tp: number
  measured_threshold: number
  target_offset: number
  target_i: number
  target_tp: number
  multi_scene_args: MultiSceneArgs
}

export interface MultiSceneArgs {
  high_dynamic_target_i: string
  normal_target_i: string
  undersized_target_i: string
}

export interface Durl {
  order: number
  length: number
  size: number
  ahead: string
  vhead: string
  url: string
  backup_url?: string[]
}
