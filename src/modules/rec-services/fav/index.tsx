import type { FavItemExtend, ItemsSeparator } from '$define'
import { settings } from '$modules/settings'
import { snapshot } from 'valtio'
import { type IService, QueueStrategy } from '../_base'
import { FAV_PAGE_SIZE } from './service/_base'
import { FavAllService } from './service/fav-all'
import { FavCollectionService } from './service/fav-collection'
import { FavFolderService } from './service/fav-folder'
import { favStore, updateFavFolderMediaCount } from './store'
import { FavUsageInfo } from './usage-info'
import { FavItemsOrder } from './usage-info/fav-items-order'

export type FavServiceConfig = ReturnType<typeof getFavServiceConfig>

export function getFavServiceConfig() {
  const snap = snapshot(favStore)
  return {
    selectedKey: snap.selectedKey,
    selectedFavFolder: snap.selectedFavFolder,
    selectedFavCollection: snap.selectedFavCollection,
    itemsOrder: snap.savedOrderMap.get(snap.selectedKey) || FavItemsOrder.Default,

    // from settings
    useShuffle: settings.fav.useShuffle,
    addSeparator: settings.fav.addSeparator,
    excludedFolderIds: settings.fav.excludedFolderIds,
  }
}

export interface IFavInnerService {
  hasMore: boolean
  loadMore(abortSignal?: AbortSignal): Promise<(FavItemExtend | ItemsSeparator)[] | undefined>
  usageInfo?: ReactNode
  extraUsageInfo?: ReactNode
}

export class FavRecService implements IService {
  static PAGE_SIZE = FAV_PAGE_SIZE

  innerService: IFavInnerService
  constructor(public config: FavServiceConfig) {
    if (this.viewingAll) {
      this.innerService = new FavAllService(this.config)
    } else if (this.viewingSomeFolder) {
      this.innerService = new FavFolderService(
        this.config.selectedFavFolder!,
        this.config.useShuffle,
        this.config.addSeparator,
      )
    } else if (this.viewingSomeCollection) {
      this.innerService = new FavCollectionService(
        this.config.selectedFavCollection!,
        this.config.addSeparator,
        this.config.itemsOrder,
      )
    } else {
      throw new Error('unexpected case!')
    }
  }
  get viewingAll() {
    return this.config.selectedKey === 'all'
  }
  get viewingSomeFolder() {
    return !!this.config.selectedFavFolder
  }
  get viewingSomeCollection() {
    return !!this.config.selectedFavCollection
  }

  // for shuffle restore
  qs = new QueueStrategy<FavItemExtend | ItemsSeparator>(FavRecService.PAGE_SIZE)
  get hasMore() {
    return !!this.qs.bufferQueue.length || this.innerService.hasMore
  }
  async loadMore(abortSignal?: AbortSignal) {
    if (!this.hasMore) return
    if (this.qs.bufferQueue.length) return this.qs.sliceFromQueue()
    return this.qs.doReturnItems(await this.innerService.loadMore(abortSignal))
  }

  get usageInfo(): ReactNode {
    const { usageInfo, extraUsageInfo } = this.innerService
    if (usageInfo) return usageInfo
    return <FavUsageInfo extraContent={extraUsageInfo} />
  }

  // for remove card
  decreaseTotal() {
    if (this.viewingAll) {
      // TODO: this is not working, since <FavUsageInfo> is calculating inside itself
      ;(this.innerService as FavAllService).total -= 1
    }

    // viewingSomeFolder
    else if (this.viewingSomeFolder && this.config.selectedFavFolder) {
      updateFavFolderMediaCount(this.config.selectedFavFolder.id, (x) => x - 1)
    }

    // viewingSomeCollection
    else if (this.viewingSomeCollection && this.config.selectedFavCollection) {
      // noop, not supported yet
    }
  }
}
