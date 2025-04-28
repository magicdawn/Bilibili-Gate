import type { SpaceUploadItem, SpaceUploadItemExtend } from '$define'
import { EApiType } from '$define/index.shared'
import { getAllFollowGroups, getFollowGroupContent } from '$modules/bilibili/me/follow-group'
import { getUserNickname } from '$modules/bilibili/user/nickname'
import { getSpaceAccInfo } from '$modules/bilibili/user/space-acc-info'
import { setPageTitle } from '$utility/dom'
import { parseSearchInput } from '$utility/search'
import { invariant, orderBy } from 'es-toolkit'
import pmap from 'promise.map'
import QuickLRU from 'quick-lru'
import type { WritableDeep } from 'type-fest'
import { snapshot } from 'valtio'
import { BaseTabService, type IService } from '../_base'
import { SpaceUploadOrder, tryGetSpaceUpload } from './api'
import { spaceUploadStore } from './store'
import { SpaceUploadUsageInfo } from './usage-info'
import { isSpaceUploadItemChargeOnly } from './util'

export const spaceUploadAvatarCache = new QuickLRU<string, string>({ maxSize: 100 })

type SpaceUploadServiceConfig = {
  mids: string[]
  groupId?: number
  order: SpaceUploadOrder
  searchText: string | undefined
  filterText: string | undefined
}

export function getSpaceUploadServiceConfig(): SpaceUploadServiceConfig {
  const snap = snapshot(spaceUploadStore) as WritableDeep<typeof spaceUploadStore>
  return {
    mids: snap.mids,
    groupId: snap.groupId,
    order: snap.usingOrder,
    searchText: snap.searchText,
    filterText: snap.filterText,
  }
}

export class SpaceUploadService extends BaseTabService<SpaceUploadItemExtend> {
  static PAGE_SIZE = 20

  // service config
  mids: string[]
  groupId: number | undefined
  order: SpaceUploadOrder
  searchText: string | undefined
  filterText: string | undefined

  constructor(config: SpaceUploadServiceConfig) {
    super(SpaceUploadService.PAGE_SIZE)
    Object.assign(this, config)
    this.mids = config.mids
    this.order = config.order
    invariant(this.mids.length || this.groupId, 'mid & groupId can not both be empty')
    this.searchText = this.searchText?.trim()
  }

  override usageInfo: ReactNode = (<SpaceUploadUsageInfo />)

  override get hasMoreExceptQueue(): boolean {
    if (!this.mergeTimelineService) return true
    return this.mergeTimelineService.hasMore
  }

  private async fetchAvatars(mids: string[]) {
    await Promise.all(
      mids.map(async (mid) => {
        const info = await getSpaceAccInfo(mid)
        if (!info) return
        spaceUploadAvatarCache.set(mid, info.face)
      }),
    )
  }

  /**
   * side effects
   */
  private pageTitleSet = false
  private async setPageTitle() {
    if (this.pageTitleSet) return

    const prefixes: string[] = []
    if (this.searchText) prefixes.push(`🔍【${this.searchText}】`)
    if (this.filterText) prefixes.push(`⏳【${this.filterText}】`)

    let author: string
    if (this.mids.length) {
      const nicknames = await pmap(this.mids, getUserNickname, 3)
      author = nicknames
        .map((x) => x?.trim())
        .filter(Boolean)
        .map((name) => `「${name}」`)
        .join('、')
    } else {
      const tags = await getAllFollowGroups()
      const name = tags.find((x) => x.tagid === this.groupId)?.name || ''
      author = name ? `「${name}」` : ''
    }

    const title = [prefixes.join(''), `${author}的投稿`]
      .map((x) => x.trim())
      .filter(Boolean)
      .join(' - ')

    setPageTitle(title)
    this.pageTitleSet = true
  }

  mergeTimelineService: MergeTimeService | undefined
  setupMergeTimelineService() {}
  override async fetchMore(abortSignal: AbortSignal): Promise<SpaceUploadItemExtend[] | undefined> {
    if (!this.mergeTimelineService) {
      if (this.mids.length) {
        this.mergeTimelineService = new MergeTimeService(this.mids, this.order, this.searchText)
      } else if (this.groupId) {
        const mids = await getFollowGroupContent(this.groupId!)
        this.mergeTimelineService = new MergeTimeService(
          mids.map((x) => x.toString()),
          this.order,
          this.searchText,
        )
      }
    }
    invariant(this.mergeTimelineService, 'mergeTimelineService should not be undefined')
    if (!this.mergeTimelineService.hasMore) return

    this.setPageTitle()

    const items = (await this.mergeTimelineService.loadMore(abortSignal)) || []
    const fetchedCount = this.qs.fetchedCount
    const endVol = this.mergeTimelineService.count - fetchedCount
    let list: SpaceUploadItemExtend[] = items.map((item, index) => {
      return {
        ...item,
        api: EApiType.SpaceUpload,
        uniqId: `${EApiType.SpaceUpload}-${item.bvid}`,
        vol: this.mergeTimelineService!.count ? endVol - index : 0,
      }
    })

    // 直接去除"充电专属", 但保留它们的序号
    list = list.filter((item) => !isSpaceUploadItemChargeOnly(item))

    if (this.filterText) {
      const { includes, excludes } = parseSearchInput(this.filterText)
      list = list.filter((item) => {
        return (
          includes.every((include) => item.title.includes(include)) &&
          excludes.every((exclude) => !item.title.includes(exclude))
        )
      })
    }

    await this.fetchAvatars(list.map((item) => item.mid.toString()))
    return list
  }
}

class MergeTimeService implements IService<SpaceUploadItem> {
  singleUpServices: SingleUpService[]
  constructor(
    public mids: string[],
    public order: SpaceUploadOrder,
    public searchText: string | undefined,
  ) {
    invariant(
      this.mids.length === 1 || (this.mids.length > 1 && this.order !== SpaceUploadOrder.Fav),
      'SpaceUploadItem.Fav not supported when merging',
    )
    this.singleUpServices = mids.map((mid) => new SingleUpService(mid, this.order, this.searchText))
  }

  get hasMore(): boolean {
    return this.singleUpServices.some((service) => service.hasMore)
  }

  get count() {
    return this.singleUpServices.reduce((total, service) => total + service.count, 0)
  }

  private async refillQueues(abortSignal: AbortSignal) {
    // 太容易风控了, 直接访问基本不可用, 需要 load-balance 代理
    await pmap(this.singleUpServices, (s) => s.refillQueue(1, abortSignal), 5)
  }

  async loadMore(abortSignal: AbortSignal): Promise<SpaceUploadItem[] | undefined> {
    if (!this.hasMore) return

    if (this.mids.length === 1) {
      return this.singleUpServices[0].loadMore(abortSignal)
    }

    // pick from internal queues
    const pickedItems: SpaceUploadItem[] = []
    const expectSize = 10

    while (this.hasMore && pickedItems.length < expectSize) {
      await this.refillQueues(abortSignal)
      const restServices = this.singleUpServices.filter((s) => s.bufferQueue.length > 0)
      const pickedService = orderBy(
        restServices.map((service) => {
          const item = service.bufferQueue[0]
          const valueForSort = {
            [SpaceUploadOrder.Latest]: item.created,
            [SpaceUploadOrder.View]: item.play,
            [SpaceUploadOrder.Fav]: item.play, // no fav data
          }[this.order]
          return { service, item, valueForSort }
        }),
        ['valueForSort'],
        ['desc'],
      ).map((x) => x.service)[0]
      if (!pickedService) break

      const head = pickedService.bufferQueue[0]
      pickedService.bufferQueue = pickedService.bufferQueue.slice(1)
      pickedItems.push(head)
    }

    return pickedItems
  }
}

class SingleUpService {
  constructor(
    public mid: string,
    public order: SpaceUploadOrder,
    public searchText: string | undefined,
  ) {}

  bufferQueue: SpaceUploadItem[] = []
  hasMoreForApi = true
  count = 0
  get hasMore() {
    return !!this.bufferQueue.length || this.hasMoreForApi
  }

  public async refillQueue(minimalQueueSize: number, abortSignal: AbortSignal) {
    if (!this.hasMore) return
    while (!abortSignal?.aborted && this.hasMoreForApi && this.bufferQueue.length < minimalQueueSize) {
      const items = (await this.loadMore(abortSignal)) || []
      this.bufferQueue.push(...items)
    }
  }

  page = 1
  async loadMore(abortSignal: AbortSignal): Promise<SpaceUploadItem[] | undefined> {
    const { items, hasMore, count } = await tryGetSpaceUpload({
      mid: this.mid,
      order: this.order,
      pagenum: this.page,
      keyword: this.searchText || '',
    })

    this.hasMoreForApi = hasMore
    this.page++
    this.count = count
    return items
  }
}
