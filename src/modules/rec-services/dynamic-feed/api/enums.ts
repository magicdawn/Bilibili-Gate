import type { DynamicFeedItem } from './types'

export namespace DynamicFeedEnums {
  // for `.type`
  export enum ItemType {
    Av = 'DYNAMIC_TYPE_AV',
    Draw = 'DYNAMIC_TYPE_DRAW',
    PgcUnion = 'DYNAMIC_TYPE_PGC_UNION',
    UgcSeason = 'DYNAMIC_TYPE_UGC_SEASON',
    Forward = 'DYNAMIC_TYPE_FORWARD',
    Article = 'DYNAMIC_TYPE_ARTICLE',
    LiveRcmd = 'DYNAMIC_TYPE_LIVE_RCMD',
  }

  // for `.modules.module_author.type`
  export enum AuthorType {
    Normal = 'AUTHOR_TYPE_NORMAL',
    Pgc = 'AUTHOR_TYPE_PGC',
    UgcSeason = 'AUTHOR_TYPE_UGC_SEASON',
  }

  // for `.modules.module_dynamic.major.type`
  export enum MajorType {
    Archive = 'MAJOR_TYPE_ARCHIVE',
    Opus = 'MAJOR_TYPE_OPUS',
    Pgc = 'MAJOR_TYPE_PGC',
    UgcSeason = 'MAJOR_TYPE_UGC_SEASON',
    LiveRcmd = 'MAJOR_TYPE_LIVE_RCMD',
  }

  // for `.modules.module_dynamic.additional.type`
  export enum AdditionalType {
    Goods = 'ADDITIONAL_TYPE_GOODS',
    Reserve = 'ADDITIONAL_TYPE_RESERVE',
  }
}

export const DynamicFeedAllowedItemTypes =
  // Object.values(EDynamicFeedItemType)
  [DynamicFeedEnums.ItemType.Av, DynamicFeedEnums.ItemType.Draw]

export function isDynamicAv(item: DynamicFeedItem) {
  return item.type === DynamicFeedEnums.ItemType.Av
}
