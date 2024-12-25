import { baseDebug } from '$common'
import { CHARGE_ONLY_TEXT } from '$components/VideoCard/top-marks'
import { type DynamicFeedItem, type DynamicFeedItemExtend, type LiveItemExtend } from '$define'
import { EApiType } from '$define/index.shared'
import { settings } from '$modules/settings'
import type { Nullable } from '$utility/type'
import { parseDuration } from '$utility/video'
import pmap from 'promise.map'
import { snapshot } from 'valtio'
import { BaseTabService, QueueStrategy } from '../_base'
import { LiveRecService } from '../live'
import { fetchVideoDynamicFeeds } from './api'
import {
  hasLocalDynamicFeedCache,
  localDynamicFeedCache,
  performIncrementalUpdateIfNeed,
} from './cache'
import { parseSearchInput } from './cache/search'
import { getFollowGroupContent } from './group'
import { FollowGroupMergeTimelineService } from './group/merge-timeline-service'
import {
  DF_SELECTED_KEY_ALL,
  DF_SELECTED_KEY_PREFIX_GROUP,
  DF_SELECTED_KEY_PREFIX_UP,
  dfStore,
  DynamicFeedVideoMinDuration,
  DynamicFeedVideoType,
  QUERY_DYNAMIC_MIN_ID,
  QUERY_DYNAMIC_MIN_TS,
  QUERY_DYNAMIC_OFFSET,
  QUERY_DYNAMIC_UP_MID,
  type DynamicFeedStore,
} from './store'
import { DynamicFeedUsageInfo } from './usage-info'

export type DynamicFeedServiceConfig = ReturnType<typeof getDynamicFeedServiceConfig>

export function getDynamicFeedServiceConfig(usingDfStore: DynamicFeedStore = dfStore) {
  const snap = snapshot(usingDfStore)
  return {
    /**
     * from dfStore
     */
    // UP | 分组
    upMid: snap.upMid,
    followGroupTagId: snap.selectedFollowGroup?.tagid,

    // 搜索
    searchText: snap.searchText,

    // 类型
    dynamicFeedVideoType: snap.dynamicFeedVideoType,
    hideChargeOnlyVideos: snap.hideChargeOnlyVideos,

    // 时长
    filterMinDuration: snap.filterMinDuration,
    filterMinDurationValue: snap.filterMinDurationValue,

    // flags
    selectedKey: snap.selectedKey,
    viewingAll: snap.viewingAll,
    viewingSomeUp: snap.viewingSomeUp,
    viewingSomeGroup: snap.viewingSomeGroup,

    /**
     * from settings
     */
    showLiveInDynamicFeed: settings.dynamicFeed.showLive,

    whenViewAllEnableHideSomeContents: settings.dynamicFeed.whenViewAll.enableHideSomeContents,
    whenViewAllHideIds: new Set(settings.dynamicFeed.whenViewAll.hideIds),

    advancedSearch: settings.dynamicFeed.advancedSearch,
    searchCacheEnabled:
      !!snap.upMid &&
      settings.dynamicFeed.__internal.cacheAllItemsEntry && // the main switch
      settings.dynamicFeed.__internal.cacheAllItemsUpMids.includes(snap.upMid.toString()), // the switch for this up

    forceUseMergeTime:
      !!snap.selectedFollowGroup &&
      settings.dynamicFeed.followGroup.forceUseMergeTimelineIds.includes(
        snap.selectedFollowGroup.tagid,
      ),

    /**
     * from query
     */
    startingOffset: QUERY_DYNAMIC_OFFSET,
    minId: isValidNumber(QUERY_DYNAMIC_MIN_ID) ? BigInt(QUERY_DYNAMIC_MIN_ID!) : undefined,
    minTs: isValidNumber(QUERY_DYNAMIC_MIN_TS) ? Number(QUERY_DYNAMIC_MIN_TS) : undefined,
  }
}

function isValidNumber(str: Nullable<string>) {
  return !!str && /^\d+$/.test(str)
}

const debug = baseDebug.extend('modules:rec-services:dynamic-feed')

export class DynamicFeedRecService extends BaseTabService<DynamicFeedItemExtend | LiveItemExtend> {
  static PAGE_SIZE = 15

  override usageInfo = (<DynamicFeedUsageInfo />)
  override hasMoreExceptQueue = true
  override get hasMore() {
    if (this.qs.bufferQueue.length) return true

    if (this.liveRecService?.hasMore) return true

    if (this.viewingSomeGroup && this.whenViewSomeGroupMergeTimelineService) {
      return this.whenViewSomeGroupMergeTimelineService.hasMore
    }

    if (this.hasMoreExceptQueue) return true
    return false
  }

  offset: string = ''
  page = 0 // pages loaded

  liveRecService: LiveRecService | undefined

  constructor(public config: DynamicFeedServiceConfig) {
    super(DynamicFeedRecService.PAGE_SIZE)
    // config live
    if (this.config.showLiveInDynamicFeed) {
      const filterEmpty =
        !this.upMid &&
        typeof this.followGroupTagId === 'undefined' &&
        !this.searchText &&
        this.dynamicFeedVideoType === DynamicFeedVideoType.All &&
        this.filterMinDuration === DynamicFeedVideoMinDuration.All
      if (filterEmpty) {
        this.liveRecService = new LiveRecService(true)
      }
    }

    // start offset
    if (this.config.startingOffset) {
      this.offset = this.config.startingOffset
    }
  }

  /**
   * shortcuts for ServiceConfig(this.config)
   */
  get upMid() {
    return this.config.upMid
  }
  // NOTE: number | undefined 默认分组是 0
  get followGroupTagId() {
    return this.config.followGroupTagId
  }
  get searchText() {
    return this.config.searchText
  }
  get dynamicFeedVideoType() {
    return this.config.dynamicFeedVideoType
  }
  get hideChargeOnlyVideos() {
    return this.config.hideChargeOnlyVideos
  }
  get filterMinDuration() {
    return this.config.filterMinDuration
  }
  get filterMinDurationValue() {
    return this.config.filterMinDurationValue
  }
  get viewingSomeUp() {
    return this.config.viewingSomeUp
  }

  /**
   * 查看分组
   */
  get viewingSomeGroup() {
    return this.config.viewingSomeGroup
  }
  private whenViewSomeGroupMergeTimelineService: FollowGroupMergeTimelineService | undefined
  private whenViewSomeGroupMids = new Set<number>()
  private async loadWhenViewSomeGroupMids() {
    if (typeof this.followGroupTagId !== 'number') return // no need
    if (this.whenViewSomeGroupMids.size) return // loaded
    const mids = await getFollowGroupContent(this.followGroupTagId)
    this.whenViewSomeGroupMids = new Set(mids)
    if (
      mids.length > 0 &&
      (mids.length <= FollowGroupMergeTimelineService.ENABLE_MERGE_TIMELINE_UPMID_COUNT_THRESHOLD || // <- 太多了则从全部过滤
        this.config.forceUseMergeTime)
    ) {
      this.whenViewSomeGroupMergeTimelineService = new FollowGroupMergeTimelineService(
        mids.map((x) => x.toString()),
      )
    }
  }

  /**
   * 查看全部
   */
  get viewingAll() {
    return this.config.viewingAll
  }
  private whenViewAllHideMids = new Set<string>()
  private whenViewAllHideMidsLoaded = false
  private async loadWhenViewAllHideMids() {
    // no need
    if (!this.viewingAll) return
    if (!this.config.whenViewAllEnableHideSomeContents) return
    if (!this.config.whenViewAllHideIds.size) return
    // loaded
    if (this.whenViewAllHideMidsLoaded) return

    const mids = Array.from(this.config.whenViewAllHideIds)
      .filter((x) => x.startsWith(DF_SELECTED_KEY_PREFIX_UP))
      .map((x) => x.slice(DF_SELECTED_KEY_PREFIX_UP.length))
    const groupIds = Array.from(this.config.whenViewAllHideIds)
      .filter((x) => x.startsWith(DF_SELECTED_KEY_PREFIX_GROUP))
      .map((x) => x.slice(DF_SELECTED_KEY_PREFIX_GROUP.length))

    const set = this.whenViewAllHideMids
    mids.forEach((x) => set.add(x))

    const midsInGroup = (await pmap(groupIds, async (id) => getFollowGroupContent(id), 3)).flat()
    midsInGroup.forEach((x) => set.add(x.toString()))

    this.whenViewAllHideMidsLoaded = true
  }

  private _queueForSearchCache: QueueStrategy<DynamicFeedItem> | undefined

  override async fetchMore(abortSignal: AbortSignal) {
    // live
    if (this.liveRecService?.hasMore) {
      const items = (await this.liveRecService.loadMore(abortSignal)) || []
      return items.filter((x) => x.api !== EApiType.Separator)
    }

    let rawItems: DynamicFeedItem[]

    // viewingSomeGroup: ensure current follow-group's mids loaded
    if (this.viewingSomeGroup) {
      await this.loadWhenViewSomeGroupMids()
    }
    // viewingAll: ensure hide contents from these mids loaded
    if (this.viewingAll) {
      await this.loadWhenViewAllHideMids()
      debug('viewingAll: hide-mids = %o', this.whenViewAllHideMids)
    }

    // use search cache
    const useSearchCache = !!(
      this.upMid &&
      this.searchText &&
      this.config.searchCacheEnabled &&
      (await hasLocalDynamicFeedCache(this.upMid))
    )
    const useAdvancedSearch = useSearchCache && this.config.advancedSearch
    const useAdvancedSearchParsed = useAdvancedSearch
      ? parseSearchInput((this.searchText || '').toLowerCase())
      : undefined

    if (useSearchCache) {
      // fill queue with pre-filtered cached-items
      if (!this._queueForSearchCache) {
        await performIncrementalUpdateIfNeed(this.upMid)
        this._queueForSearchCache = new QueueStrategy<DynamicFeedItem>(20)
        this._queueForSearchCache.bufferQueue = (
          (await localDynamicFeedCache.get(this.upMid)) || []
        ).filter((x) => {
          const title = x?.modules?.module_dynamic?.major?.archive?.title || ''
          return filterBySearchText({
            searchText: this.searchText!,
            title,
            useAdvancedSearch,
            useAdvancedSearchParsed,
          })
        })
      }
      // slice
      rawItems = this._queueForSearchCache.sliceFromQueue(this.page + 1) || []
      this.page++
      this.hasMoreExceptQueue = !!this._queueForSearchCache.bufferQueue.length
      // offset not needed
    }

    // a group with manual merge-timeline service
    else if (this.viewingSomeGroup && this.whenViewSomeGroupMergeTimelineService) {
      rawItems = await this.whenViewSomeGroupMergeTimelineService.loadMore(abortSignal)
    }

    // normal
    else {
      // 未登录会直接 throw err
      const data = await fetchVideoDynamicFeeds({
        abortSignal,
        page: this.page + 1, // ++this.page, starts from 1, 实测 page 没啥用, 分页基于 offset
        offset: this.offset,
        upMid: this.upMid,
      })
      this.page++
      this.hasMoreExceptQueue = data.has_more
      this.offset = data.offset
      rawItems = data.items

      /**
       * stop load more if there are `update since` conditions
       */
      if (this.config.minId) {
        const minId = this.config.minId
        const idx = rawItems.findIndex((x) => BigInt(x.id_str) <= minId)
        if (idx !== -1) {
          this.hasMoreExceptQueue = false
          rawItems = rawItems.slice(0, idx + 1) // include minId
        }
      }
      if (this.config.minTs) {
        const minTs = this.config.minTs
        const idx = rawItems.findIndex((x) => x.modules.module_author.pub_ts <= minTs)
        if (idx !== -1) {
          this.hasMoreExceptQueue = false
          rawItems = rawItems.slice(0, idx + 1) // include minTs
        }
      }
    }

    const items: DynamicFeedItemExtend[] = rawItems

      // by 关注分组
      .filter((x) => {
        if (!this.viewingSomeGroup) return true
        if (!this.whenViewSomeGroupMids.size) return true
        const mid = x?.modules?.module_author?.mid
        if (!mid) return true
        return this.whenViewSomeGroupMids.has(mid)
      })

      // by 动态视频|投稿视频
      .filter((x) => {
        // all
        if (this.dynamicFeedVideoType === DynamicFeedVideoType.All) return true
        // type only
        const currentLabel = x.modules.module_dynamic.major.archive.badge.text as string
        if (this.dynamicFeedVideoType === DynamicFeedVideoType.DynamicOnly) {
          return currentLabel === '动态视频'
        }
        if (this.dynamicFeedVideoType === DynamicFeedVideoType.UploadOnly) {
          return currentLabel === '投稿视频' || currentLabel === CHARGE_ONLY_TEXT
        }
        return false
      })

      // by 充电专属
      .filter((x) => {
        if (!this.hideChargeOnlyVideos) return true
        const chargeOnly =
          (x.modules?.module_dynamic?.major?.archive?.badge?.text as string) === CHARGE_ONLY_TEXT
        return !chargeOnly
      })

      // by 最短时长
      .filter((x) => {
        if (this.filterMinDuration === DynamicFeedVideoMinDuration.All) return true
        const v = x.modules.module_dynamic.major.archive
        const duration = parseDuration(v.duration_text)
        return duration >= this.filterMinDurationValue
      })

      // by 关键字搜索
      .filter((x) => {
        if (!this.searchText) return true
        const title = x?.modules?.module_dynamic?.major?.archive?.title || ''
        return filterBySearchText({
          searchText: this.searchText,
          title,
          useAdvancedSearch,
          useAdvancedSearchParsed,
        })
      })

      // 在「全部」动态中隐藏 UP 的动态
      .filter((x) => {
        if (this.config.selectedKey !== DF_SELECTED_KEY_ALL) return true
        const set = this.whenViewAllHideMids
        if (!set.size) return true
        const mid = x?.modules?.module_author?.mid
        if (!mid) return true
        return !set.has(mid.toString())
      })

      .map((item) => {
        return {
          ...item,
          api: EApiType.DynamicFeed,
          uniqId: item.id_str || crypto.randomUUID(),
        }
      })

    /**
     * filter functions
     */
    function filterBySearchText({
      title,
      searchText,
      useAdvancedSearch,
      useAdvancedSearchParsed,
    }: {
      title: string
      searchText: string
      useAdvancedSearch: boolean
      useAdvancedSearchParsed?: ReturnType<typeof parseSearchInput>
    }) {
      title = title.toLowerCase()
      searchText = searchText.toLowerCase()

      // 简单搜索
      const simpleSearch = () => title.includes(searchText)

      // 高级搜索
      const advancedSearch = () => {
        return (
          (useAdvancedSearchParsed?.includes ?? []).every((x) => title.includes(x)) &&
          (useAdvancedSearchParsed?.excludes ?? []).every((x) => !title.includes(x))
        )
      }

      return useAdvancedSearch ? advancedSearch() : simpleSearch()
    }

    /**
     * side effects
     */

    // fill up-name when filter up via query
    const { upMid, upName } = dfStore
    if (
      //
      QUERY_DYNAMIC_UP_MID &&
      upMid &&
      upName &&
      upName === upMid.toString() &&
      items[0]
    ) {
      const authorName = items[0].modules.module_author.name
      const authorFace = items[0].modules.module_author.face
      dfStore.upName = authorName
      dfStore.upFace = authorFace
    }

    // update group count if needed
    if (this.viewingSomeGroup && dfStore.followGroups.length) {
      const group = dfStore.followGroups.find((x) => x.tagid === this.followGroupTagId)
      if (group) group.count = this.whenViewSomeGroupMids.size
    }

    return items
  }
}
