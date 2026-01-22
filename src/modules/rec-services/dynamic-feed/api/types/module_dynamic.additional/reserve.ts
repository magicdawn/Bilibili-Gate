import type { DynamicFeedEnums } from '../../enums'

export interface AdditionalTypeReserve {
  type: DynamicFeedEnums.AdditionalType.Reserve
  reserve: Reserve
}

export interface Reserve {
  button: Button
  desc1: Desc1
  desc2: Desc2
  desc3: Desc3
  jump_url: string
  reserve_total: number
  rid: number
  state: number
  stype: number
  title: string
  up_mid: number
}

export interface Button {
  check: Check
  status: number
  type: number
  uncheck: Uncheck
}

export interface Check {
  icon_url: string
  text: string
}

export interface Uncheck {
  icon_url: string
  text: string
  toast: string
}

export interface Desc1 {
  style: number
  text: string
}

export interface Desc2 {
  style: number
  text: string
  visible: boolean
}

export interface Desc3 {
  jump_url: string
  style: number
  text: string
}
