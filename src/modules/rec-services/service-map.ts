import { assert } from 'es-toolkit'
import { snapshot } from 'valtio'
import { ETab } from '$components/RecHeader/tab-enum'
import { settings } from '$modules/settings'
import type { RefStateBox } from '$common/hooks/useRefState'
import { AppRecService, getAppRecServiceConfig } from './app'
import { DynamicFeedRecService, getDynamicFeedServiceConfig } from './dynamic-feed'
import { FavRecService, getFavServiceConfig } from './fav'
import { HotRecService } from './hot'
import { LiveRecService } from './live'
import { PcRecService } from './pc'
import { getSpaceUploadServiceConfig, SpaceUploadService } from './space-upload'
import { WatchlaterRecService } from './watchlater'
import { watchlaterStore } from './watchlater/store'
import type { BaseTabService } from './_base'

export const REC_TABS = [ETab.KeepFollowOnly, ETab.PcRecommend, ETab.AppRecommend] satisfies ETab[]

export function isRecTab(tab: ETab): tab is ETab.AppRecommend | ETab.PcRecommend | ETab.KeepFollowOnly {
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
} satisfies Record<ETab, (options: { existingService?: BaseTabService }) => BaseTabService>

export type ServiceMapKey = keyof typeof createServiceMap

export type ServiceMap = {
  [K in ServiceMapKey]: ReturnType<(typeof createServiceMap)[K]>
}

export type ServicesRegistry = RefStateBox<Partial<ServiceMap>>

export type FetcherOptions = {
  tab: ETab
  abortSignal: AbortSignal
  servicesRegistry: ServicesRegistry
}

export function getServiceFromRegistry<T extends ETab>(
  servicesRegistry: RefStateBox<Partial<ServiceMap>>,
  tab: T,
): ServiceMap[T] {
  const service = servicesRegistry.val[tab]
  assert(service, `servicesRegistry.val[tab=${tab}] should not be nil`)
  return service
}
