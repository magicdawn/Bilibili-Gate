import type { DynamicFeedItem } from './types'

export enum EDynamicFeedItemType {
  Av = 'DYNAMIC_TYPE_AV',
  Draw = 'DYNAMIC_TYPE_DRAW',
  PgcUnion = 'DYNAMIC_TYPE_PGC_UNION',
  UgcSeason = 'DYNAMIC_TYPE_UGC_SEASON',
  Forward = 'DYNAMIC_TYPE_FORWARD',
  Article = 'DYNAMIC_TYPE_ARTICLE',
  LiveRcmd = 'DYNAMIC_TYPE_LIVE_RCMD',
}

export enum EDynamicFeedMajorType {
  Archive = 'MAJOR_TYPE_ARCHIVE',
  Opus = 'MAJOR_TYPE_OPUS',
  Pgc = 'MAJOR_TYPE_PGC',
  UgcSeason = 'MAJOR_TYPE_UGC_SEASON',
}

export const DynamicFeedAllowedItemTypes =
  // Object.values(EDynamicFeedItemType)
  [EDynamicFeedItemType.Av, EDynamicFeedItemType.Draw]

export function isDynamicAv(item: DynamicFeedItem) {
  return item.type === EDynamicFeedItemType.Av
}
