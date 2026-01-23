import { isEqual, orderBy } from 'es-toolkit'
import pmap from 'promise.map'
import { wrapWithIdbCache } from '$utility/idb'
import { fetchDynamicFeeds } from '../api'
import type { DynamicFeedItem } from '$define'
import type { UpMidType } from '../store'

export const fetchDynamicFeedsWithCache = wrapWithIdbCache({
  fn: fetchDynamicFeeds,
  generateKey: ({ upMid, videoOnly }) => `upMid=${upMid}&videoOnly=${videoOnly}`,
  tableName: 'dynamic-feed-newest-items', // only head
  ttl: 5 * 60 * 1000, // 5 minutes
})

export class FollowGroupUpService {
  constructor(
    public upMid: UpMidType,
    public videoOnly: boolean,
    public enableHeadCache = false,
  ) {}

  bufferQueue: DynamicFeedItem[] = []
  hasMoreForApi = true
  offset: string = ''
  page = 1 // current page

  get hasMore() {
    return !!this.bufferQueue.length || this.hasMoreForApi
  }

  async loadMore() {
    const enableCache = this.page === 1 && !this.offset && this.enableHeadCache
    const fn = enableCache ? fetchDynamicFeedsWithCache : fetchDynamicFeeds
    const data = await fn({
      videoOnly: this.videoOnly,
      upMid: this.upMid,
      page: this.page,
      offset: this.offset,
    })

    this.offset = data.offset
    this.hasMoreForApi = data.has_more
    this.page++

    // special empty case with `has_more = true` present but should be treated as `has_more = false`
    if (isEqual(data, { has_more: true, items: [], offset: '', update_baseline: '', update_num: 0 })) {
      this.hasMoreForApi = false
    }

    return data.items
  }

  async fillQueue(minimalQueueSize: number, abortSignal: AbortSignal) {
    while (!abortSignal?.aborted && this.hasMoreForApi && this.bufferQueue.length < minimalQueueSize) {
      const items = await this.loadMore()
      this.bufferQueue.push(...items)
    }
  }
}

export class FollowGroupMergeTimelineService {
  // fillQueues 会对每一个 upMid 请求, 多了不适合
  static ENABLE_MERGE_TIMELINE_UPMID_COUNT_THRESHOLD = 20

  // if upMids > 10, enable head cache
  static ENABLE_HEAD_CACHE_UPMID_COUNT_THRESHOLD = 10

  upServices: FollowGroupUpService[] = []
  constructor(
    public upMids: UpMidType[],
    public videoOnly: boolean,
  ) {
    const enableHeadCache = upMids.length > FollowGroupMergeTimelineService.ENABLE_HEAD_CACHE_UPMID_COUNT_THRESHOLD
    this.upServices = upMids.map((upMid) => new FollowGroupUpService(upMid, videoOnly, enableHeadCache))
  }

  get hasMore() {
    return this.upServices.some((s) => s.hasMore)
  }

  async loadMore(abortSignal: AbortSignal): Promise<DynamicFeedItem[]> {
    if (!this.hasMore) return []

    // refill queues
    const refillQueues = async () => {
      const minimalQueueSize = 1 // we only slice the first one
      await pmap(this.upServices, (s) => s.fillQueue(minimalQueueSize, abortSignal), 5) // I don't know, maybe 3 will not trigger risk control
    }

    // pick from internal queues
    const pickedItems: DynamicFeedItem[] = []
    const expectSize = 10
    while (this.hasMore && pickedItems.length < expectSize) {
      await refillQueues()
      const restServices = this.upServices.filter((s) => s.hasMore)
      const pickedService = orderBy(
        restServices.map((service) => {
          const item = service.bufferQueue[0]
          const id = BigInt(item.id_str) // 假设 id_str 是有序的 ...
          return { service, item, id }
        }),
        ['id'],
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
