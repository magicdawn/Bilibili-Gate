import { assert, shuffle } from 'es-toolkit'
import ms from 'ms'
import { snapshot } from 'valtio'
import { REQUEST_FAIL_MSG } from '$common'
import { CustomTargetLink } from '$components/VideoCard/use/useOpenRelated'
import { EApiType } from '$define/index.shared'
import { IconForOpenExternalLink, IconForPlayer } from '$modules/icon'
import { isWebApiSuccess, request } from '$request'
import { getIdbCache, wrapWithIdbCache } from '$utility/idb'
import toast from '$utility/toast'
import { FavItemsOrder, handleItemsOrder } from '../fav-enum'
import { formatFavFolderUrl, formatFavPlaylistUrl } from '../fav-url'
import { favStore, updateFavFolderMediaCount, updateFavList } from '../store'
import { FavItemsOrderSwitcher } from '../views/fav-items-order'
import { clsFavSeparator, FAV_PAGE_SIZE } from './_base'
import type { SetNonNullable } from 'type-fest'
import type { ItemsSeparator } from '$define'
import type { IFavInnerService } from '../index'
import type { FavItemExtend } from '../types'
import type { FavFolder } from '../types/folders/list-all-folders'
import type { FavFolderDetailInfo, ResourceListJSON } from '../types/folders/list-folder-items'

export function FavFolderSeparator({ service }: { service: FavFolderBasicService }) {
  return (
    <>
      <CustomTargetLink href={formatFavFolderUrl(service.entry.id, service.entry.attr)} className={clsFavSeparator}>
        <IconForOpenExternalLink className='size-16px' />
        {service.entry.title}
      </CustomTargetLink>
      <CustomTargetLink href={formatFavPlaylistUrl(service.entry.id)} className={clsFavSeparator}>
        <IconForPlayer className='size-16px' />
        播放全部
      </CustomTargetLink>
    </>
  )
}

const FAV_FOLDER_API_SUPPOETED_ORDER = [
  FavItemsOrder.FavTimeDesc,
  FavItemsOrder.PlayCountDesc,
  FavItemsOrder.PubTimeDesc,
] as const

type FavFolderApiSuppoetedOrder = (typeof FAV_FOLDER_API_SUPPOETED_ORDER)[number]

function isFavFolderApiSuppoetedOrder(order: FavItemsOrder): order is FavFolderApiSuppoetedOrder {
  return FAV_FOLDER_API_SUPPOETED_ORDER.includes(order)
}

// 收藏夹全部内容缓存
const favFolderAllItemsCache = getIdbCache('fav-folder-all-items')
export async function clearFavFolderAllItemsCache(folderId: number) {
  await favFolderAllItemsCache.delete(folderId)
}

export class FavFolderService implements IFavInnerService {
  needLoadAll: boolean
  constructor(
    public folderId: number,
    public addSeparator: boolean,
    public itemsOrder: FavItemsOrder,
  ) {
    if (this.itemsOrder === FavItemsOrder.Initial) {
      throw new Error('this should not happen!')
    }
    if (isFavFolderApiSuppoetedOrder(this.itemsOrder)) {
      this.needLoadAll = false
    } else {
      this.needLoadAll = true
    }
  }

  get hasMore() {
    if (this.addSeparator && !this.separatorAdded) return true
    if (this.needLoadAll) {
      if (!this.allItemsLoaded) return true
      return !!this.bufferQueue.length
    } else {
      if (!this.innerService) return true
      return this.innerService.hasMore
    }
  }

  private separatorAdded = false
  private get separator(): ItemsSeparator {
    this.assertInnerService()
    return {
      api: EApiType.Separator,
      uniqId: `fav-folder-separator-${this.folderId}`,
      content: <FavFolderSeparator service={this.innerService} />,
    }
  }

  entry: FavFolder | undefined
  innerService: FavFolderBasicService | undefined
  // https://www.totaltypescript.com/tips/use-assertion-functions-inside-classes
  assertInnerService(): asserts this is SetNonNullable<FavFolderService, 'innerService' | 'entry'> {
    assert(this.innerService, 'this.innerService should not be undefined')
    assert(this.entry, 'this.entry should not be undefined')
  }

  async createService() {
    if (this.innerService) return

    await updateFavList()
    const entry = snapshot(favStore.folders).find((f) => f.id === this.folderId)
    assert(entry, `favStore.favFolders should have this entry[fid=${this.folderId}]`)
    this.entry = entry

    if (isFavFolderApiSuppoetedOrder(this.itemsOrder)) {
      this.innerService = new FavFolderBasicService(entry, this.itemsOrder)
    } else {
      this.innerService = new FavFolderBasicService(entry)
    }
  }

  async loadMore(abortSignal: AbortSignal) {
    if (!this.innerService) await this.createService()
    if (!this.hasMore) return

    if (this.addSeparator && !this.separatorAdded) {
      this.separatorAdded = true
      return [this.separator]
    }

    // load all
    if (this.needLoadAll) {
      if (!this.allItemsLoaded) await this.loadAllItems(abortSignal)

      // shuffle every time
      if (this.itemsOrder === FavItemsOrder.Shuffle) {
        this.bufferQueue = shuffle(this.bufferQueue)
      }

      const sliced = this.bufferQueue.slice(0, FAV_PAGE_SIZE)
      this.bufferQueue = this.bufferQueue.slice(FAV_PAGE_SIZE)
      return sliced
    }

    // normal
    else {
      const ret = await this.innerService?.loadMore(abortSignal)
      this.runSideEffects()
      return ret
    }
  }

  private allItemsLoaded = false
  private bufferQueue: FavItemExtend[] = []
  private async loadAllItems(abortSignal: AbortSignal) {
    const allItems = await this.fetchAllItems(abortSignal)
    this.bufferQueue = handleItemsOrder(allItems, this.itemsOrder)
    this.allItemsLoaded = true
    this.runSideEffects()
  }
  private _fetchAllItems = async (abortSignal: AbortSignal) => {
    this.assertInnerService()
    const allItems: FavItemExtend[] = []
    while (this.innerService.hasMore && !abortSignal.aborted) {
      const items = (await this.innerService.loadMore(abortSignal)) || []
      allItems.push(...items)
    }
    return allItems
  }
  // __fetchAllItems may results multiple requests, so cache it
  private _fetchAllItemsWithCache = wrapWithIdbCache({
    fn: this._fetchAllItems,
    tableName: favFolderAllItemsCache,
    generateKey: () => `${this.folderId}`,
    ttl: ms('5min'),
  })
  private fetchAllItems = (abortSignal: AbortSignal) => {
    this.assertInnerService()
    const shouldUseCache = this.entry.media_count > FavFolderBasicService.PAGE_SIZE * 3 // this is affordable
    return shouldUseCache ? this._fetchAllItemsWithCache(abortSignal) : this._fetchAllItems(abortSignal)
  }

  private runSideEffects() {
    this.assertInnerService()
    if (typeof this.innerService.info?.media_count === 'number') {
      updateFavFolderMediaCount(this.folderId, this.innerService.info.media_count)
    }
  }

  get extraTabbarView() {
    return <FavItemsOrderSwitcher />
  }
}

export class FavFolderBasicService {
  static PAGE_SIZE = 20

  constructor(
    public entry: FavFolder,
    public itemsOrder: FavFolderApiSuppoetedOrder = FavItemsOrder.FavTimeDesc,
  ) {
    this.hasMore = entry.media_count > 0
  }

  hasMore: boolean
  info: FavFolderDetailInfo | undefined
  page = 0 // pages loaded

  async loadMore(abortSignal: AbortSignal): Promise<FavItemExtend[] | undefined> {
    if (!this.hasMore) return

    // mtime(最近收藏)  view(最多播放) pubtime(最新投稿)
    const order = {
      [FavItemsOrder.FavTimeDesc]: 'mtime',
      [FavItemsOrder.PlayCountDesc]: 'view',
      [FavItemsOrder.PubTimeDesc]: 'pubtime',
    }[this.itemsOrder]

    const res = await request.get('/x/v3/fav/resource/list', {
      params: {
        media_id: this.entry.id,
        pn: this.page + 1, // start from 1
        ps: FavFolderBasicService.PAGE_SIZE,
        keyword: '',
        order, // mtime(最近收藏)  view(最多播放) pubtime(最新投稿)
        type: '0', // unkown
        tid: '0', // 分区
        platform: 'web',
      },
    })

    const json = res.data as ResourceListJSON
    if (!isWebApiSuccess(json)) {
      toast(json.message || REQUEST_FAIL_MSG)
      return
    }

    this.page++
    this.hasMore = json.data.has_more
    this.info = json.data.info

    // 新建空收藏夹, medias = null
    let items = json.data.medias || []
    items = items.filter((item) => {
      if (item.title === '已失效视频') return false
      return true
    })

    return items.map((item) => {
      return {
        ...item,
        from: 'fav-folder',
        folder: this.info!,
        api: EApiType.Fav,
        uniqId: `${EApiType.Fav}-folder:${this.info?.id || this.entry.id}-${item.bvid}`,
      }
    })
  }
}
