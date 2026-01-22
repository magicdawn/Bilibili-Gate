import type { DynamicFeedEnums } from '../../enums'

export interface AuthorTypePgc {
  type: DynamicFeedEnums.AuthorType.Pgc
  face: string
  face_nft: boolean
  following: boolean
  jump_url: string
  label: string
  mid: number
  name: string
  pub_action: string
  pub_time: string
  pub_ts: number
}
