/* eslint-disable require-await */

import { isNil, pick } from 'es-toolkit'
import ms from 'ms'
import { pLimit } from 'promise.map'
import { proxy } from 'valtio'
import { subscribeKey } from 'valtio/utils'
import { baseDebug, IN_BILIBILI_HOMEPAGE, IN_BILIBILI_VIDEO_PLAY_PAGE } from '$common'
import { reusePendingPromise } from '$utility/async'
import { setPageTitle } from '$utility/dom'
import { proxyMapWithGmStorage, subscribeOnKeys } from '$utility/valtio'
import { fetchAllFavCollections } from './collection/api'
import { FavItemsOrder } from './fav-enum'
import { getSavedOrder } from './usage-info/fav-items-order'
import { fetchAllFavFolders } from './user-fav-service'
import type { FavCollectionDetailInfo } from './types/collections/collection-detail'
import type { FavCollection } from './types/collections/list-all-collections'
import type { FavFolder } from './types/folders/list-all-folders'
import type { ReadonlyKeysOf } from 'type-fest'

const debug = baseDebug.extend('modules:rec-services:fav:store')

export type FavSelectedKeyPrefix = 'fav-folder' | 'fav-collection' | 'all'
export type FavStore = typeof favStore

export enum FavQueryKey {
  CollectionIdFull = 'fav-collection-id',
  CollectionId = 'fav-cid',
  FolderIdFull = 'fav-folder-id',
  FolderId = 'fav-fid',
}

const parseId = (text: string | undefined | null) => {
  if (!text) return
  const num = Number(text)
  if (Number.isNaN(num)) return
  return num
}

const searchParams = new URLSearchParams(location.search)

export const QUERY_FAV_COLLECTION_ID = parseId(
  searchParams.get(FavQueryKey.CollectionIdFull) ?? searchParams.get(FavQueryKey.CollectionId),
)
export const QUERY_FAV_FOLDER_ID = parseId(
  searchParams.get(FavQueryKey.FolderIdFull) ?? searchParams.get(FavQueryKey.FolderId),
)

export const SHOW_FAV_TAB_ONLY =
  IN_BILIBILI_HOMEPAGE && (typeof QUERY_FAV_FOLDER_ID === 'number' || typeof QUERY_FAV_COLLECTION_ID === 'number')

export const favStore = proxy({
  folders: [] as FavFolder[],
  foldersUpdateAt: 0,
  selectedFavFolderId: QUERY_FAV_FOLDER_ID,
  get selectedFavFolder(): FavFolder | undefined {
    if (typeof this.selectedFavFolderId !== 'number') return
    return this.folders.find((x) => x.id === this.selectedFavFolderId)
  },

  collections: [] as FavCollection[],
  collectionsUpdateAt: 0,
  selectedFavCollectionId: QUERY_FAV_COLLECTION_ID,
  selectedFavCollectionDetailInfo: undefined as FavCollectionDetailInfo | undefined,
  get selectedFavCollection(): FavCollection | undefined {
    if (typeof this.selectedFavCollectionId !== 'number') return
    return this.collections.find((x) => x.id === this.selectedFavCollectionId)
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

export function updateFavFolderMediaCount(targetFavFolderId: number, count: number | ((old: number) => number)) {
  const folder = favStore.folders.find((x) => x.id === targetFavFolderId)
  if (!folder) return // no target

  const newCount = typeof count === 'function' ? count(folder.media_count) : count
  if (newCount === folder.media_count) return // un-changed

  folder.media_count = newCount
  debug('update folder(id=%s title=%s) media_count to %s', folder.id, folder.title, newCount)
}

export function updateFavList(force = false) {
  return Promise.all([updateFavFolderList(force), updateFavCollectionList(force)])
}

const _updateFavFolderList = reusePendingPromise(async () => {
  const folders = await fetchAllFavFolders()
  favStore.folders = folders
  favStore.foldersUpdateAt = Date.now()
})
export async function updateFavFolderList(force = false) {
  if (!force) {
    const { folders, foldersUpdateAt } = favStore
    const cacheValid = folders.length && foldersUpdateAt && Date.now() - foldersUpdateAt < ms('5min')
    if (cacheValid) return
  }
  return _updateFavFolderList()
}

const _updateFavCollectionList = reusePendingPromise(async () => {
  const collections = await fetchAllFavCollections()
  favStore.collections = collections
  favStore.collectionsUpdateAt = Date.now()
})
export async function updateFavCollectionList(force = false) {
  if (!force) {
    const { collections, collectionsUpdateAt } = favStore
    const cacheValid = collections.length && collectionsUpdateAt && Date.now() - collectionsUpdateAt < ms('5min')
    if (cacheValid) return
  }
  return _updateFavCollectionList()
}

/**
 * side effects
 */
if (SHOW_FAV_TAB_ONLY) {
  subscribeKey(favStore, 'selectedLabel', () => {
    if (!favStore.selectedLabel) return
    setPageTitle(favStore.selectedLabel)
  })
}

setupFavStore()
async function setupFavStore() {
  if (!(IN_BILIBILI_HOMEPAGE || IN_BILIBILI_VIDEO_PLAY_PAGE)) return
  if (SHOW_FAV_TAB_ONLY) return

  const storageKey = 'fav-store'
  type WriteableKey = Exclude<keyof FavStore, ReadonlyKeysOf<FavStore>>
  const persistStoreKeys: WriteableKey[] = ['selectedFavFolderId', 'selectedFavCollectionId', 'folders']

  // load
  debugger
  const val = (await GM.getValue(storageKey)) as FavStore | undefined
  if (val) {
    for (const key of persistStoreKeys) {
      if (!isNil(val[key])) {
        // @ts-ignore
        favStore[key] = val[key]
      }
    }
  }

  // persist
  const runInSequence = pLimit(1)
  subscribeOnKeys(favStore, persistStoreKeys, (snap) => {
    if (SHOW_FAV_TAB_ONLY) return
    const val = pick(snap, persistStoreKeys)
    runInSequence(async () => {
      await GM.setValue(storageKey, val)
    })
  })
}
