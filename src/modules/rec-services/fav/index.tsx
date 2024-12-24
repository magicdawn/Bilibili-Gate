import type { FavItemExtend, ItemsSeparator } from '$define'
import { settings } from '$modules/settings'
import { snapshot } from 'valtio'
import { BaseTabService } from '../_base'
import type { FavItemsOrder } from './fav-enum'
import { FAV_PAGE_SIZE } from './service/_base'
import { FavAllService } from './service/fav-all'
import { FavCollectionService } from './service/fav-collection'
import { FavFolderService } from './service/fav-folder'
import { favStore, updateFavFolderMediaCount } from './store'
import { FavUsageInfo } from './usage-info'
import { getSavedOrder } from './usage-info/fav-items-order'

export type FavServiceConfig = ReturnType<typeof getFavServiceConfig>

export function getFavServiceConfig() {
  const snap = snapshot(favStore)
  return {
    selectedKey: snap.selectedKey,
    itemsOrder: getSavedOrder(snap.selectedKey, snap.savedOrderMap as Map<string, FavItemsOrder>),

    selectedFavFolderId: snap.selectedFavFolderId,
    selectedFavCollectionId: snap.selectedFavCollectionId,

    // from settings
    addSeparator: settings.fav.addSeparator,
    excludedFolderIds: settings.fav.excludedFolderIds,
  }
}

type FavServiceConfigExtra = ReturnType<typeof getFavServiceConfigExtra>
function getFavServiceConfigExtra(config: FavServiceConfig) {
  const ret = {
    ...config,
    get viewingAll() {
      return config.selectedKey === 'all'
    },
    get viewingSomeFolder() {
      return typeof config.selectedFavFolderId === 'number'
    },
    get viewingSomeCollection() {
      return typeof config.selectedFavCollectionId === 'number'
    },
  }
  return ret
}

export interface IFavInnerService {
  hasMore: boolean
  loadMore(abortSignal: AbortSignal): Promise<(FavItemExtend | ItemsSeparator)[] | undefined>
  usageInfo?: ReactNode
  extraUsageInfo?: ReactNode
}

export class FavRecService extends BaseTabService<FavItemExtend | ItemsSeparator> {
  static PAGE_SIZE = FAV_PAGE_SIZE

  config: FavServiceConfigExtra
  innerService: IFavInnerService
  constructor(config: FavServiceConfig) {
    super(FavRecService.PAGE_SIZE)
    this.config = getFavServiceConfigExtra(config)

    const { viewingAll, viewingSomeFolder, viewingSomeCollection } = this.config
    if (viewingAll) {
      this.innerService = new FavAllService(
        this.config.addSeparator,
        this.config.itemsOrder,
        this.config.excludedFolderIds,
      )
    } else if (viewingSomeFolder) {
      this.innerService = new FavFolderService(
        this.config.selectedFavFolderId!,
        this.config.addSeparator,
        this.config.itemsOrder,
      )
    } else if (viewingSomeCollection) {
      this.innerService = new FavCollectionService(
        this.config.selectedFavCollectionId!,
        this.config.addSeparator,
        this.config.itemsOrder,
      )
    } else {
      throw new Error('unexpected case!')
    }
  }

  override get usageInfo(): ReactNode {
    const { usageInfo, extraUsageInfo } = this.innerService
    if (usageInfo) return usageInfo
    return <FavUsageInfo extraContent={extraUsageInfo} />
  }
  override get hasMoreExceptQueue() {
    return this.innerService.hasMore
  }
  override fetchMore(abortSignal: AbortSignal) {
    return this.innerService.loadMore(abortSignal)
  }

  // for remove card
  decreaseTotal() {
    if (this.config.viewingAll) {
      // TODO: this is not working, since <FavUsageInfo> is calculating inside itself
      ;(this.innerService as FavAllService).state.totalCountInFavFolders -= 1
    }

    // viewingSomeFolder
    else if (this.config.viewingSomeFolder && this.config.selectedFavFolderId) {
      updateFavFolderMediaCount(this.config.selectedFavFolderId, (x) => x - 1)
    }

    // viewingSomeCollection
    else if (this.config.viewingSomeCollection && this.config.selectedFavCollectionId) {
      // noop, not supported yet
    }
  }
}
