import { baseDebug } from '$common'
import { reusePendingPromise } from '$utility/async'
import { proxyMapWithGmStorage } from '$utility/valtio'
import ms from 'ms'
import { proxy } from 'valtio'
import { fetchAllFavCollections } from './collection/api'
import { FavItemsOrder } from './fav-enum'
import type { FavCollectionDetailInfo } from './types/collections/collection-detail'
import type { FavCollection } from './types/collections/list-all-collections'
import type { FavFolder } from './types/folders/list-all-folders'
import { getSavedOrder } from './usage-info/fav-items-order'
import { fetchFavFolder } from './user-fav-service'

const debug = baseDebug.extend('modules:rec-services:fav:store')

export type FavSelectedKeyPrefix = 'fav-folder' | 'fav-collection' | 'all'
export type FavStore = typeof favStore

export enum FavSearchParamsKey {
  CollectionIdFull = 'fav-collection-id',
  CollectionId = 'fav-cid',
  FolderIdFull = 'fav-folder-id',
  FolderId = 'fav-fid',
}

const parseId = (text: string | undefined | null) => {
  if (!text) return
  const num = Number(text)
  if (isNaN(num)) return
  return num
}

const searchParams = new URLSearchParams(location.search)

export const QUERY_FAV_COLLECTION_ID = parseId(
  searchParams.get(FavSearchParamsKey.CollectionIdFull) ??
    searchParams.get(FavSearchParamsKey.CollectionId),
)
export const QUERY_FAV_FOLDER_ID = parseId(
  searchParams.get(FavSearchParamsKey.FolderIdFull) ??
    searchParams.get(FavSearchParamsKey.FolderId),
)

export const SHOW_FAV_TAB_ONLY =
  typeof QUERY_FAV_FOLDER_ID === 'number' || typeof QUERY_FAV_COLLECTION_ID === 'number'

export const favStore = proxy({
  // methods
  updateList,

  favFolders: [] as FavFolder[],
  favFoldersUpdateAt: 0,
  selectedFavFolderId: QUERY_FAV_FOLDER_ID,
  get selectedFavFolder(): FavFolder | undefined {
    if (typeof this.selectedFavFolderId !== 'number') return
    return this.favFolders.find((x) => x.id === this.selectedFavFolderId)
  },

  favCollections: [] as FavCollection[],
  favCollectionsUpdateAt: 0,
  selectedFavCollectionId: QUERY_FAV_COLLECTION_ID,
  selectedFavCollectionDetailInfo: undefined as FavCollectionDetailInfo | undefined,
  get selectedFavCollection(): FavCollection | undefined {
    if (typeof this.selectedFavCollectionId !== 'number') return
    return this.favCollections.find((x) => x.id === this.selectedFavCollectionId)
  },

  get selectedKey(): 'all' | `${Exclude<FavSelectedKeyPrefix, 'all'>}:${number}` {
    let prefix: FavSelectedKeyPrefix
    let id: number | undefined
    if (typeof this.selectedFavFolderId !== 'undefined') {
      prefix = 'fav-folder'
      id = this.selectedFavFolderId
    } else if (typeof this.selectedFavCollectionId !== 'undefined') {
      prefix = 'fav-collection'
      id = this.selectedFavCollectionId
    } else {
      return 'all'
    }
    return `${prefix}:${id}`
  },

  get selectedLabel() {
    if (this.selectedFavFolder) {
      return `${this.selectedFavFolder.title} (${this.selectedFavFolder.media_count})`
    }

    if (typeof this.selectedFavCollectionId === 'number') {
      if (this.selectedFavCollection) {
        return `${this.selectedFavCollection.title} (${this.selectedFavCollection.media_count})`
      }

      const info = this.selectedFavCollectionDetailInfo
      if (info?.id === this.selectedFavCollectionId) {
        return `${info.title} (${info.media_count})`
      }

      return
    }

    return '全部'
  },

  // 保存的顺序
  savedOrderMap: (await proxyMapWithGmStorage<string, FavItemsOrder>('fav-saved-order')).map,

  get usingShuffle() {
    const curret = getSavedOrder(this.selectedKey, this.savedOrderMap)
    return curret === FavItemsOrder.Shuffle
  },
})

export function updateFavFolderMediaCount(
  targetFavFolderId: number,
  count: number | ((old: number) => number),
) {
  const folder = favStore.favFolders.find((x) => x.id === targetFavFolderId)
  if (!folder) return

  const newCount = typeof count === 'function' ? count(folder.media_count) : count
  if (newCount !== folder.media_count) {
    folder.media_count = newCount
    debug('update folder(id=%s title=%s) media_count to %s', folder.id, folder.title, newCount)
  }
}

export async function updateList(force = false) {
  return Promise.all([updateFolderList(force), updateCollectionList(force)])
}

const _updateFolderList = reusePendingPromise(async () => {
  const folders = await fetchFavFolder()
  favStore.favFolders = folders
  favStore.favFoldersUpdateAt = Date.now()
})
async function updateFolderList(force = false) {
  if (force) return
  const { favFolders, favFoldersUpdateAt } = favStore
  if (favFolders.length && favFoldersUpdateAt && Date.now() - favFoldersUpdateAt < ms('5min')) {
    return
  }
  return _updateFolderList()
}

const _updateCollectionList = reusePendingPromise(async () => {
  const collections = await fetchAllFavCollections()
  favStore.favCollections = collections
  favStore.favCollectionsUpdateAt = Date.now()
})
async function updateCollectionList(force = false) {
  if (force) return
  const { favCollections, favCollectionsUpdateAt } = favStore
  if (
    favCollections.length &&
    favCollectionsUpdateAt &&
    Date.now() - favCollectionsUpdateAt < ms('5min')
  ) {
    return
  }
  return _updateCollectionList()
}
