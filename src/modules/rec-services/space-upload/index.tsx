import { assert, once, orderBy, uniq } from 'es-toolkit'
import pmap from 'promise.map'
import QuickLRU from 'quick-lru'
import { snapshot } from 'valtio'
import { proxySet } from 'valtio/utils'
import { ShowMessageError } from '$components/RecGrid/error-detail'
import { NEED_LOGIN_MESSAGE, toastNeedLogin } from '$components/RecHeader/tab-config'
import { EApiType } from '$define/index.shared'
import { getAllFollowGroups, getFollowGroupContent } from '$modules/bilibili/me/follow-group'
import { isFollowedFromRelationAttribute, queryFollowStateMemoized } from '$modules/bilibili/me/relations/follow'
import { getUserNickname } from '$modules/bilibili/user/nickname'
import { getSpaceAccInfo } from '$modules/bilibili/user/space-acc-info'
import { checkLoginStatus } from '$utility/cookie'
import { setPageTitle } from '$utility/dom'
import { parseSearchInput } from '$utility/search'
import type { SpaceUploadItem, SpaceUploadItemExtend } from '$define'
import { BaseTabService, type IService } from '../_base'
import { SpaceUploadOrder, tryGetSpaceUpload } from './api'
import { QUERY_SPACE_UPLOAD_INITIAL_PAGE, spaceUploadStore } from './store'
import { SpaceUploadUsageInfo } from './usage-info'
import { isSpaceUploadItemChargeOnly } from './util'
import type { WritableDeep } from 'type-fest'

export const spaceUploadAvatarCache = new QuickLRU<number, string>({ maxSize: 100 })

export const spaceUploadFollowedMidSet = proxySet<number>()

async function trySetFollowedMidSet(upMid: number) {
  if (spaceUploadFollowedMidSet.has(upMid)) return
  const state = await queryFollowStateMemoized(upMid)
  if (isFollowedFromRelationAttribute(state)) {
    spaceUploadFollowedMidSet.add(upMid)
  }
}

type SpaceUploadServiceConfig = {
  mids: string[]
  groupId?: number
  order: SpaceUploadOrder
  searchText: string | undefined
  filterText: string | undefined
  initialPage: number | undefined
}
export function getSpaceUploadServiceConfig(): SpaceUploadServiceConfig {
  const snap = snapshot(spaceUploadStore) as WritableDeep<typeof spaceUploadStore>
  return {
    mids: snap.mids,
    groupId: snap.groupId,
    order: snap.usingOrder,
    searchText: snap.searchText,
    filterText: snap.filterText,
    initialPage: QUERY_SPACE_UPLOAD_INITIAL_PAGE ? Number(QUERY_SPACE_UPLOAD_INITIAL_PAGE) : undefined,
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
  initialPage: number | undefined

  constructor(public config: SpaceUploadServiceConfig) {
    super(SpaceUploadService.PAGE_SIZE)
    Object.assign(this, config)
    this.mids = config.mids
    this.order = config.order
    assert(this.mids.length || this.groupId, 'mid & groupId can not both be empty')
    this.searchText = this.searchText?.trim()
    if (this.initialPage && (this.groupId || this.mids.length > 1)) {
      throw new Error('initialPage not supported when merging')
    }
  }

  override usageInfo: ReactNode = (<SpaceUploadUsageInfo />)

  override get hasMoreExceptQueue(): boolean {
    if (this.isAnonymous) return false
    if (!this.service) return true
    return this.service.hasMore
  }

  private async fetchAvatars(mids: number[]) {
    await Promise.all(
      mids.map(async (mid) => {
        const info = await getSpaceAccInfo(mid)
        if (!info) return
        spaceUploadAvatarCache.set(mid, info.face)
      }),
    )
  }

  private async fetchFollowState(mids: number[]) {
    await pmap(mids, trySetFollowedMidSet, 3)
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

  singleUpService: SingleUpService | undefined
  mergeTimelineService: MergeTimelineService | undefined
  private async setupServices(): Promise<void> {
    if (this.singleUpService || this.mergeTimelineService) return

    if (this.mids.length === 1) {
      this.singleUpService = new SingleUpService(this.mids[0], this.order, this.searchText, this.initialPage)
      return
    }

    if (this.mids.length) {
      this.mergeTimelineService = new MergeTimelineService(this.mids, this.order, this.searchText)
      return
    }

    if (this.groupId) {
      const mids = await getFollowGroupContent(this.groupId!)
      mids.forEach((x) => spaceUploadFollowedMidSet.add(x)) // mark followed
      this.mergeTimelineService = new MergeTimelineService(
        mids.map((x) => x.toString()),
        this.order,
        this.searchText,
      )
      return
    }
  }

  get service() {
    return this.singleUpService || this.mergeTimelineService
  }

  isAnonymous = false
  warnNeedLoginOnce = once(() => {
    toastNeedLogin()
  })

  override async fetchMore(abortSignal: AbortSignal): Promise<SpaceUploadItemExtend[] | undefined> {
    if (!checkLoginStatus()) {
      this.isAnonymous = true
      this.warnNeedLoginOnce()
      throw new ShowMessageError(NEED_LOGIN_MESSAGE)
    }

    this.setPageTitle()

    await this.setupServices()
    assert(this.service, 'no service available after setupServices')

    const items = (await this.service.loadMore(abortSignal)) || []
    const endVol = this.singleUpService
      ? this.singleUpService.endVol
      : this.mergeTimelineService!.count - this.qs.fetchedCount
    let list: SpaceUploadItemExtend[] = items.map((item, index) => {
      return {
        ...item,
        api: EApiType.SpaceUpload,
        uniqId: `${EApiType.SpaceUpload}-${item.bvid}`,
        vol: endVol - index,
        page: this.singleUpService ? this.singleUpService.page - 1 : undefined,
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

    /* #region side effects */
    {
      const mids = uniq(list.filter((item) => item.author.trim() !== '账号已注销'))
        .map((item) => item.mid)
        .filter(Boolean)
      await Promise.all([this.fetchAvatars(mids), this.fetchFollowState(mids)])
    }
    /* #endregion */

    return list
  }
}

class MergeTimelineService implements IService<SpaceUploadItem> {
  singleUpServices: SingleUpService[]
  constructor(
    public mids: string[],
    public order: SpaceUploadOrder,
    public searchText: string | undefined,
  ) {
    assert(
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
    public initialPage?: number | undefined,
  ) {
    this.page = this.initialPage ?? 1
  }

  bufferQueue: SpaceUploadItem[] = []
  hasMoreForApi = true
  count = 0
  endVol = 0

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

  page: number
  async loadMore(abortSignal: AbortSignal): Promise<SpaceUploadItem[] | undefined> {
    const { items, hasMore, count, endVol } = await tryGetSpaceUpload({
      mid: this.mid,
      order: this.order,
      pagenum: this.page,
      keyword: this.searchText || '',
    })

    this.hasMoreForApi = hasMore
    this.page++
    this.count = count
    this.endVol = endVol

    return items
  }
}
