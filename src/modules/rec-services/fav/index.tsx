import { snapshot } from 'valtio'
import { settings } from '$modules/settings'
import { BaseTabService } from '../_base'
import { FAV_PAGE_SIZE } from './service/_base'
import { FavAllService } from './service/fav-all'
import { FavCollectionService } from './service/fav-collection'
import { FavFolderService } from './service/fav-folder'
import { favStore, updateFavFolderMediaCount } from './store'
import { FavSidebarView, FavTabbarView } from './views'
import { getSavedOrder } from './views/fav-items-order'
import type { ReactNode } from 'react'
import type { FavItemExtend, ItemsSeparator } from '$define'
import type { FavItemsOrder } from './fav-enum'

export type FavServiceConfig = ReturnType<typeof getFavServiceConfig>

export function getFavServiceConfig() {
  const snap = snapshot(favStore)
  return {
    selectedKey: snap.selectedKey,
    viewingAll: snap.viewingAll,
    viewingSomeFolder: snap.viewingSomeFolder,
    viewingSomeCollection: snap.viewingSomeCollection,
    itemsOrder: getSavedOrder(snap.selectedKey, snap.savedOrderMap as Map<string, FavItemsOrder>),

    selectedFavFolderId: snap.selectedFavFolderId,
    selectedFavCollectionId: snap.selectedFavCollectionId,

    // from settings
    addSeparator: settings.fav.addSeparator,
    excludedFolderIds: settings.fav.excludedFolderIds,
  }
}

export interface IFavInnerService {
  hasMore: boolean
  loadMore: (abortSignal: AbortSignal) => Promise<(FavItemExtend | ItemsSeparator)[] | undefined>
  tabbarView?: ReactNode
  extraTabbarView?: ReactNode
}

export class FavRecService extends BaseTabService<FavItemExtend | ItemsSeparator> {
  static PAGE_SIZE = FAV_PAGE_SIZE

  innerService: IFavInnerService
  constructor(public config: FavServiceConfig) {
    super(FavRecService.PAGE_SIZE)
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

  override get tabbarView(): ReactNode {
    const { tabbarView, extraTabbarView } = this.innerService
    if (tabbarView) return tabbarView
    return <FavTabbarView extraContent={extraTabbarView} />
  }

  override sidebarView = (<FavSidebarView />)

  override get hasMoreExceptQueue() {
    return this.innerService.hasMore
  }
  override fetchMore(abortSignal: AbortSignal) {
    return this.innerService.loadMore(abortSignal)
  }

  // for remove card
  decreaseTotal() {
    if (this.config.viewingAll) {
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
