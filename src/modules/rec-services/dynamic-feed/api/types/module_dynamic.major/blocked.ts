import type { DynamicFeedEnums } from '../../enums'

export interface MajorTypeBlocked {
  type: DynamicFeedEnums.MajorType.Blocked
  blocked: Blocked
}

export interface Blocked {
  blocked_type: number
  bg_img: BgImg
  icon: BgImg
  title: string
  hint_message: string
  button: Button
}

export interface BgImg {
  img_day: string
  img_dark: string
}

export interface Button {
  icon: string
  text: string
  jump_url: string
  handle_type: number
}
