import { assert } from 'es-toolkit'
import { snapshot } from 'valtio'
import { ETab } from '$components/RecHeader/tab-enum'
import { settings } from '$modules/settings'
import { AppRecService, getAppRecServiceConfig } from './app'
import { DynamicFeedRecService, getDynamicFeedServiceConfig } from './dynamic-feed'
import { FavRecService, getFavServiceConfig } from './fav'
import { HotRecService } from './hot'
import { LikedRecService } from './liked'
import { LiveRecService } from './live'
import { PcRecService } from './pc'
import { getSpaceUploadServiceConfig, SpaceUploadService } from './space-upload'
import { WatchlaterRecService } from './watchlater'
import { watchlaterStore } from './watchlater/store'
import type { BaseTabService } from './_base'

export const REC_TABS = [ETab.KeepFollowOnly, ETab.PcRecommend, ETab.AppRecommend] satisfies ETab[]

export type RecTab = (typeof REC_TABS)[number]

export function isRecTab(tab: ETab): tab is RecTab {
  return REC_TABS.includes(tab)
}

export const createServiceMap = {
  [ETab.AppRecommend]: () => new AppRecService(getAppRecServiceConfig()),
  [ETab.PcRecommend]: () => new PcRecService(false),
  [ETab.KeepFollowOnly]: () => new PcRecService(true),
  [ETab.DynamicFeed]: () => new DynamicFeedRecService(getDynamicFeedServiceConfig()),
  [ETab.Watchlater]: ({ existingService }) => {
    const { watchlaterAddSeparator, watchlaterItemsOrder } = settings
    const prevShuffleBvidIndexMap =
      existingService && existingService instanceof WatchlaterRecService
        ? existingService.getServiceSnapshot().bvidIndexMap
        : undefined
    return new WatchlaterRecService(
      watchlaterItemsOrder,
      watchlaterAddSeparator,
      prevShuffleBvidIndexMap,
      snapshot(watchlaterStore).searchText,
    )
  },
  [ETab.Fav]: () => new FavRecService(getFavServiceConfig()),
  [ETab.Hot]: () => new HotRecService(),
  [ETab.Live]: () => new LiveRecService(),
  [ETab.SpaceUpload]: () => new SpaceUploadService(getSpaceUploadServiceConfig()),
  [ETab.Liked]: () => new LikedRecService(),
} satisfies Record<ETab, (options: { existingService?: BaseTabService }) => BaseTabService>

export type ServiceMapKey = keyof typeof createServiceMap

export type ServiceMap = {
  [K in ServiceMapKey]: ReturnType<(typeof createServiceMap)[K]>
}

export type SerivesQueueMap = {
  [K in (typeof REC_TABS)[number]]: Array<ReturnType<(typeof createServiceMap)[K]>>
}

export type FetcherOptions = {
  tab: ETab
  service: BaseTabService
  abortSignal: AbortSignal
}

export function getServiceFromRegistry<T extends ETab>(serviceRegistry: Partial<ServiceMap>, tab: T): ServiceMap[T] {
  const service = serviceRegistry[tab]
  assert(service, `serviceRegistry[tab=${tab}] should not be nil`)
  return service
}
