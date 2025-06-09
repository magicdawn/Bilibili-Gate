import { cloneDeep, shuffle } from 'es-toolkit'
import pmap from 'promise.map'
import { proxy, snapshot } from 'valtio'
import { EApiType } from '$define/index.shared'
import { FavItemsOrder } from '../fav-enum'
import { favStore, updateFavList } from '../store'
import { ViewingAllExcludeFolderConfig } from '../usage-info'
import { FavItemsOrderSwitcher } from '../usage-info/fav-items-order'
import type { IFavInnerService } from '../index'
import type { FavItemExtend } from '../types'
import { FAV_PAGE_SIZE } from './_base'
import { FavCollectionService } from './fav-collection'
import { FavFolderBasicService, FavFolderService } from './fav-folder'

export class FavAllService implements IFavInnerService {
  constructor(
    public addSeparator: boolean,
    public itemsOrder: FavItemsOrder,
    public excludedFolderIds: string[],
  ) {
    // validate
    if (![FavItemsOrder.Initial, FavItemsOrder.Shuffle].includes(this.itemsOrder)) {
      throw new Error('invalid items order')
    }
  }

  get useShuffle() {
    return this.itemsOrder === FavItemsOrder.Shuffle
  }

  shuffleBufferQueue: FavItemExtend[] = []

  get hasMoreInService() {
    if (!this.serviceCreated) return true
    return this.allServices.some((s) => s.hasMore)
  }
  get hasMore() {
    if (this.useShuffle) {
      return !!this.shuffleBufferQueue.length || this.hasMoreInService
    } else {
      return this.hasMoreInService
    }
  }

  get extraUsageInfo() {
    return (
      <>
        <FavItemsOrderSwitcher />
        <ViewingAllExcludeFolderConfig allFavFolderServices={this.allFolderServices} state={this.state} />
      </>
    )
  }

  async loadMore(abortSignal: AbortSignal) {
    if (!this.serviceCreated) await this.createServices()
    if (!this.hasMore) return

    /**
     * in sequence order
     */
    if (!this.useShuffle) {
      const service = this.allServices.find((s) => s.hasMore)
      return service?.loadMore(abortSignal)
    }

    /**
     * in shuffle order
     */
    if (this.shuffleBufferQueue.length < FAV_PAGE_SIZE) {
      // 1.fill queue
      const count = 6
      const batch = 2
      while (this.hasMoreInService && this.shuffleBufferQueue.length < FAV_PAGE_SIZE * 3) {
        const restServices = this.allServices.filter((s) => s.hasMore)
        const pickedServices = shuffle(restServices).slice(0, count)
        const fetched = (await pmap(pickedServices, async (s) => (await s.loadMore(abortSignal)) || [], batch))
          .flat()
          .filter((x) => x.api !== EApiType.Separator)
        this.shuffleBufferQueue = shuffle([...this.shuffleBufferQueue, ...shuffle(fetched)])
      }
    }

    // next: take from queue
    const sliced = this.shuffleBufferQueue.slice(0, FAV_PAGE_SIZE)
    this.shuffleBufferQueue = this.shuffleBufferQueue.slice(FAV_PAGE_SIZE)
    return sliced
  }

  // fav-folder
  allFolderServices: FavFolderBasicService[] = [] // before exclude
  state = proxy({
    totalCountInFavFolders: 0,
  })

  private serviceCreated = false
  allServices: IFavInnerService[] = []
  private async createServices() {
    await updateFavList()
    const { folders, collections } = cloneDeep(snapshot(favStore))

    // fav-folders
    this.allFolderServices = folders.map((f) => new FavFolderBasicService(f))
    this.state.totalCountInFavFolders = folders
      .filter((f) => !this.excludedFolderIds.includes(f.id.toString()))
      .reduce((count, f) => count + f.media_count, 0)

    // create services
    {
      const _folders = folders.filter((f) => !this.excludedFolderIds.includes(f.id.toString()))
      let itemsOrder = this.itemsOrder
      if (itemsOrder === FavItemsOrder.Initial) itemsOrder = FavItemsOrder.FavTimeDesc // 收藏夹没有 `默认`
      this.allServices.push(..._folders.map((f) => new FavFolderService(f.id, this.addSeparator, itemsOrder)))
    }
    {
      this.allServices.push(
        ...collections.map((c) => new FavCollectionService(c.id, this.addSeparator, this.itemsOrder)),
      )
    }

    this.serviceCreated = true
  }
}
