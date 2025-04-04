import { difference } from 'es-toolkit'

export enum ETab {
  AppRecommend = 'app-recommend',
  PcRecommend = 'pc-recommend',
  KeepFollowOnly = 'keep-follow-only',
  DynamicFeed = 'dynamic-feed',
  Watchlater = 'watchlater',
  Fav = 'fav',
  Hot = 'hot',
  Live = 'live',
  SpaceUpload = 'space-upload',
}

export enum EHotSubTab {
  PopularGeneral = 'popular-general',
  PopularWeekly = 'popular-weekly',
  Ranking = 'ranking',
}

export const ALL_TAB_KEYS = Object.values(ETab)

export const NONE_CONFIGURABLE_TAB_KEYS = [ETab.SpaceUpload]

export const CONFIGURABLE_TAB_KEYS = difference(ALL_TAB_KEYS, NONE_CONFIGURABLE_TAB_KEYS)
