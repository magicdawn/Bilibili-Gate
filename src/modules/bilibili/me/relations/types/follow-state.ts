import type { RelationAttributeEntity } from './shared'

export interface FollowStateJson {
  code: number
  message: string
  ttl: number
  data: RelationAttributeEntity
}
