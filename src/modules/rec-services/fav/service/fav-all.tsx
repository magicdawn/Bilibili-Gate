import { EApiType } from '$define/index.shared'
import { cloneDeep, shuffle } from 'es-toolkit'
import pmap from 'promise.map'
import { proxy, snapshot } from 'valtio'
import { type IFavInnerService } from '../index'
import { favStore } from '../store'
import type { FavItemExtend } from '../types'
import { ViewingAllExcludeFolderConfig } from '../usage-info'
import { FavItemsOrder, FavItemsOrderSwitcher } from '../usage-info/fav-items-order'
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
    if (![FavItemsOrder.Default, FavItemsOrder.Shuffle].includes(this.itemsOrder)) {
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
        <ViewingAllExcludeFolderConfig
          allFavFolderServices={this.allFolderServices}
          state={this.state}
        />
      </>
    )
  }

  async loadMore(abortSignal?: AbortSignal) {
    if (!this.serviceCreated) await this.createServices()
    if (!this.hasMore) return

    /**
     * in sequence order
     */
    if (!this.useShuffle) {
      const service = this.allServices.find((s) => s.hasMore)
      return service?.loadMore()
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
        const fetched = (await pmap(pickedServices, async (s) => (await s.loadMore()) || [], batch))
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
    await favStore.updateList()
    const { favFolders, favCollections } = cloneDeep(snapshot(favStore))

    // fav-folders
    this.allFolderServices = favFolders.map((f) => new FavFolderBasicService(f))
    this.state.totalCountInFavFolders = favFolders
      .filter((f) => !this.excludedFolderIds.includes(f.id.toString()))
      .reduce((count, f) => count + f.media_count, 0)

    // create services
    {
      const folders = favFolders.filter((f) => !this.excludedFolderIds.includes(f.id.toString()))
      let itemsOrder = this.itemsOrder
      if (itemsOrder === FavItemsOrder.Default) itemsOrder = FavItemsOrder.FavTimeDesc // 收藏夹没有 `默认`
      this.allServices.push(
        ...folders.map((f) => new FavFolderService(f, this.addSeparator, itemsOrder)),
      )
    }
    {
      this.allServices.push(
        ...favCollections.map(
          (f) => new FavCollectionService(f.id, this.addSeparator, this.itemsOrder),
        ),
      )
    }

    this.serviceCreated = true
  }
}
