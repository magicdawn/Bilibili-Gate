import dayjs from 'dayjs'
import pmap from 'promise.map'
import { snapshot } from 'valtio'
import { baseDebug } from '$common'
import { EApiType } from '$define/index.shared'
import { getFollowGroupContent } from '$modules/bilibili/me/follow-group'
import { settings } from '$modules/settings'
import { parseAdvancedFilter } from '$utility/local-filter'
import { parseDuration } from '$utility/video'
import { BaseTabService, QueueStrategy } from '../_base'
import { LiveRecService } from '../live'
import { ELiveStatus } from '../live/live-enum'
import { fetchVideoDynamicFeeds } from './api'
import { DynamicFeedEnums } from './api/enums'
import { hasLocalDynamicFeedCache, localDynamicFeedCache, performIncrementalUpdateIfNeed } from './cache'
import { FollowGroupMergeTimelineService } from './group/merge-timeline-service'
import {
  DF_SELECTED_KEY_ALL,
  DF_SELECTED_KEY_PREFIX_GROUP,
  DF_SELECTED_KEY_PREFIX_UP,
  dfStore,
  DynamicFeedBadgeText,
  DynamicFeedVideoMinDuration,
  DynamicFeedVideoType,
  QUERY_DYNAMIC_MIN_ID,
  QUERY_DYNAMIC_MIN_TS,
  QUERY_DYNAMIC_OFFSET,
  QUERY_DYNAMIC_UP_MID,
  type DynamicFeedStore,
} from './store'
import { DynamicFeedSidebarView, DynamicFeedTabbarView } from './views'
import type { ReactNode } from 'react'
import type { DynamicFeedItem, DynamicFeedItemExtend, ItemsSeparator, LiveItemExtend } from '$define'
import type { Nullable } from '$utility/type'

export type DynamicFeedServiceConfig = ReturnType<typeof getDynamicFeedServiceConfig>

export function getDynamicFeedServiceConfig(usingDfStore: DynamicFeedStore = dfStore) {
  const snap = snapshot(usingDfStore)
  return {
    /**
     * from dfStore
     */
    // UP | 分组
    upMid: snap.upMid,
    groupId: snap.selectedGroupId,

    // 过滤
    filterText: snap.filterText,

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
    addSeparators: snap.addSeparators,

    /**
     * from settings
     */
    showLiveInDynamicFeed: settings.dynamicFeed.showLive,
    videoOnly: settings.dynamicFeed.videoOnly,

    whenViewAllEnableHideSomeContents: settings.dynamicFeed.whenViewAll.enableHideSomeContents,
    whenViewAllHideIds: new Set(settings.dynamicFeed.whenViewAll.hideIds),

    advancedFilter: settings.dynamicFeed.advancedFilter,
    filterCacheEnabled:
      !!snap.upMid &&
      settings.dynamicFeed.__internal.cacheAllItemsEntry && // the main switch
      settings.dynamicFeed.__internal.cacheAllItemsUpMids.includes(snap.upMid.toString()), // the switch for this up

    forceUseMergeTime:
      !!snap.selectedGroup &&
      settings.dynamicFeed.followGroup.forceUseMergeTimelineIds.includes(snap.selectedGroup.tagid),

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

type AllowedItemType = DynamicFeedItemExtend | LiveItemExtend | ItemsSeparator

export class DynamicFeedRecService extends BaseTabService<AllowedItemType> {
  static PAGE_SIZE = 15

  override tabbarView = (<DynamicFeedTabbarView />)
  override sidebarView = (<DynamicFeedSidebarView />)
  override hasMoreExceptQueue = true
  override get hasMore() {
    if (this.qs.bufferQueue.length) return true

    if (this.liveRecService?.hasMore) return true

    if (this.viewingSomeGroup && this.groupMergeTimelineService) {
      return this.groupMergeTimelineService.hasMore
    }

    if (this.hasMoreExceptQueue) return true
    return false
  }

  async shouldReduceMinCount() {
    if (this.viewingAll) {
      // return true
    }

    // 选择了分组 & 分组很少更新 & (not using merge-timeline)
    if (this.viewingSomeGroup) {
      await this.loadGroupMids()
      return !this.groupMergeTimelineService
    }

    // 过滤结果可能较少
    if (
      this.filterText ||
      this.dynamicFeedVideoType === DynamicFeedVideoType.DynamicOnly ||
      this.filterMinDuration !== DynamicFeedVideoMinDuration.All
    ) {
      return true
    }

    return false
  }

  constructor(public config: DynamicFeedServiceConfig) {
    super(DynamicFeedRecService.PAGE_SIZE)
    // config live
    if (this.config.showLiveInDynamicFeed) {
      const filterEmpty =
        !this.upMid &&
        this.groupId === undefined &&
        !this.filterText &&
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

  /* #region shortcuts for ServiceConfig(this.config) */
  get upMid() {
    return this.config.upMid
  }
  // NOTE: number | undefined 默认分组是 0
  get groupId() {
    return this.config.groupId
  }
  get filterText() {
    return this.config.filterText
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
  /* #endregion */

  /* #region 查看分组 */
  get viewingSomeGroup() {
    return this.config.viewingSomeGroup
  }
  private shouldEnableMergeTimeline(midCount: number) {
    return (
      this.config.forceUseMergeTime ||
      (midCount > 0 && midCount <= FollowGroupMergeTimelineService.ENABLE_MERGE_TIMELINE_UPMID_COUNT_THRESHOLD) // <- 太多了则从全部过滤
    )
  }
  private groupMergeTimelineService: FollowGroupMergeTimelineService | undefined
  private groupMids = new Set<number>()
  private groupMidsLoaded = false
  private async loadGroupMids() {
    if (this.groupId === undefined) return // no need
    if (this.groupMidsLoaded) return // loaded
    try {
      const mids = await getFollowGroupContent(this.groupId)
      this.groupMids = new Set(mids)
      if (this.shouldEnableMergeTimeline(mids.length)) {
        this.groupMergeTimelineService = new FollowGroupMergeTimelineService(
          mids.map((x) => x.toString()),
          this.config.videoOnly,
        )
      }
    } finally {
      this.groupMidsLoaded = true
    }
  }
  /* #endregion */

  /* #region 查看全部 */
  get viewingAll() {
    return this.config.viewingAll
  }
  private viewingAllHideMids = new Set<string>()
  private viewingAllHideMidsLoaded = false
  private async loadViewingAllHideMids() {
    // no need
    if (!this.viewingAll) return
    if (!this.config.whenViewAllEnableHideSomeContents) return
    if (!this.config.whenViewAllHideIds.size) return
    // loaded
    if (this.viewingAllHideMidsLoaded) return

    const mids = Array.from(this.config.whenViewAllHideIds)
      .filter((x) => x.startsWith(DF_SELECTED_KEY_PREFIX_UP))
      .map((x) => x.slice(DF_SELECTED_KEY_PREFIX_UP.length))
    const groupIds = Array.from(this.config.whenViewAllHideIds)
      .filter((x) => x.startsWith(DF_SELECTED_KEY_PREFIX_GROUP))
      .map((x) => x.slice(DF_SELECTED_KEY_PREFIX_GROUP.length))

    const set = this.viewingAllHideMids
    mids.forEach((x) => set.add(x))

    const midsInGroup = (await pmap(groupIds, (id) => getFollowGroupContent(id), 3)).flat()
    midsInGroup.forEach((x) => set.add(x.toString()))
    this.viewingAllHideMidsLoaded = true
  }
  /* #endregion */

  override async fetchMore(abortSignal: AbortSignal) {
    const items = await this._fetchMore(abortSignal)
    return this.handleAddSeparators(items)
  }

  private liveRecService: LiveRecService | undefined
  private _queueForFilterCache: QueueStrategy<DynamicFeedItem> | undefined

  offset: string = ''
  page = 0 // pages loaded

  async _fetchMore(abortSignal: AbortSignal) {
    // live
    if (this.liveRecService?.hasMore) {
      const items = (await this.liveRecService.loadMore(abortSignal)) || []
      return items.filter((x) => x.api !== EApiType.Separator)
    }

    let rawItems: DynamicFeedItem[]

    // viewingSomeGroup: ensure current follow-group's mids loaded
    if (this.viewingSomeGroup) {
      await this.loadGroupMids()
    }
    // viewingAll: ensure hide contents from these mids loaded
    if (this.viewingAll) {
      await this.loadViewingAllHideMids()
      debug('viewingAll: hide-mids = %o', this.viewingAllHideMids)
    }

    // use filter cache
    const useFilterCache = !!(
      this.upMid &&
      this.filterText &&
      this.config.filterCacheEnabled &&
      (await hasLocalDynamicFeedCache(this.upMid))
    )
    const useAdvancedFilter = useFilterCache && this.config.advancedFilter
    const useAdvancedFilterParsed = useAdvancedFilter
      ? parseAdvancedFilter((this.filterText || '').toLowerCase())
      : undefined
    if (useFilterCache) {
      // fill queue with pre-filtered cached-items
      if (!this._queueForFilterCache) {
        await performIncrementalUpdateIfNeed(this.upMid)
        this._queueForFilterCache = new QueueStrategy<DynamicFeedItem>(20)
        this._queueForFilterCache.bufferQueue = ((await localDynamicFeedCache.get(this.upMid)) || []).filter((x) => {
          const major = x.modules.module_dynamic.major
          if (major?.type !== DynamicFeedEnums.MajorType.Archive) return false
          const title = major.archive.title
          return filterByFilterText({
            filterText: this.filterText!,
            title,
            useAdvancedFilter,
            useAdvancedFilterParsed,
          })
        })
      }
      // slice
      rawItems = this._queueForFilterCache.sliceFromQueue(this.page + 1) || []
      this.page++
      this.hasMoreExceptQueue = !!this._queueForFilterCache.bufferQueue.length
      // offset not needed
    }

    // a group with manual merge-timeline service
    else if (this.viewingSomeGroup && this.groupMergeTimelineService) {
      rawItems = await this.groupMergeTimelineService.loadMore(abortSignal)
    }

    // normal
    else {
      // 未登录会直接 throw err
      const data = await fetchVideoDynamicFeeds({
        videoOnly: this.config.videoOnly,
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
        if (this.groupMergeTimelineService) return true // skip group-filter when loaded via groupMergeTimelineService
        if (!this.groupMids.size) return true
        const mid = x?.modules?.module_author?.mid
        if (!mid) return true
        return this.groupMids.has(mid)
      })

      // by 动态视频|投稿视频
      .filter((x) => {
        // all
        if (this.dynamicFeedVideoType === DynamicFeedVideoType.All) return true
        // type only
        const major = x.modules.module_dynamic.major
        if (major?.type !== DynamicFeedEnums.MajorType.Archive) return false
        const currentLabel = major.archive.badge.text
        if (this.dynamicFeedVideoType === DynamicFeedVideoType.DynamicOnly) {
          return currentLabel === DynamicFeedBadgeText.Dynamic
        }
        if (this.dynamicFeedVideoType === DynamicFeedVideoType.UploadOnly) {
          return currentLabel === DynamicFeedBadgeText.Upload || currentLabel === DynamicFeedBadgeText.ChargeOnly
        }
        return false
      })

      // by 充电专属
      .filter((x) => {
        if (!this.hideChargeOnlyVideos) return true
        const major = x.modules.module_dynamic.major
        if (major?.type !== DynamicFeedEnums.MajorType.Archive) return false
        const chargeOnly = major.archive.badge.text === DynamicFeedBadgeText.ChargeOnly
        return !chargeOnly
      })

      // by 最短时长
      .filter((x) => {
        if (this.filterMinDuration === DynamicFeedVideoMinDuration.All) return true
        const major = x.modules.module_dynamic.major
        if (major?.type !== DynamicFeedEnums.MajorType.Archive) return false
        const v = major.archive
        if (!v) return false
        const duration = parseDuration(v.duration_text)
        return duration >= this.filterMinDurationValue
      })

      // by 关键字过滤
      .filter((x) => {
        if (!this.filterText) return true
        const major = x.modules.module_dynamic.major
        if (major?.type !== DynamicFeedEnums.MajorType.Archive) return false
        const title = major.archive.title || ''
        return filterByFilterText({
          filterText: this.filterText,
          title,
          useAdvancedFilter,
          useAdvancedFilterParsed,
        })
      })

      // 在「全部」动态中隐藏 UP 的动态
      .filter((x) => {
        if (this.config.selectedKey !== DF_SELECTED_KEY_ALL) return true
        const set = this.viewingAllHideMids
        if (!set.size) return true
        const mid = x?.modules?.module_author?.mid
        if (!mid) return true
        return !set.has(mid.toString())
      })

      .map((item) => {
        return {
          ...item,
          api: EApiType.DynamicFeed,
          uniqId: `${EApiType.DynamicFeed}-${item.id_str || crypto.randomUUID()}`,
          groupId: this.viewingSomeGroup ? this.groupId : undefined,
        }
      })

    /**
     * filter functions
     */
    function filterByFilterText({
      title,
      filterText,
      useAdvancedFilter,
      useAdvancedFilterParsed,
    }: {
      title: string
      filterText: string
      useAdvancedFilter: boolean
      useAdvancedFilterParsed?: ReturnType<typeof parseAdvancedFilter>
    }) {
      title = title.toLowerCase()
      filterText = filterText.toLowerCase()

      // 简单过滤
      const simpleFilter = () => title.includes(filterText)

      // 高级过滤
      const advancedFilter = () => {
        return (
          (useAdvancedFilterParsed?.includes ?? []).every((x) => title.includes(x)) &&
          (useAdvancedFilterParsed?.excludes ?? []).every((x) => !title.includes(x))
        )
      }

      return useAdvancedFilter ? advancedFilter() : simpleFilter()
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
    if (this.viewingSomeGroup && dfStore.groups.length) {
      const group = dfStore.groups.find((x) => x.tagid === this.groupId)
      if (group) group.count = this.groupMids.size
    }

    return items
  }

  private separatorsConfig: SeparatorsConfig = (() => {
    return {
      today: {
        added: false,
        content: '今日',
        getInsertIndex: getTodaySeparatorInsertIndex,
      },
      earlier: {
        added: false,
        content: '更早',
        getInsertIndex: insertIndexFinderViaPubTsRange(-Infinity, dayjs().startOf('day').unix()),
      },
    }
  })()
  handleAddSeparators(items: AllowedItemType[]) {
    if (!this.config.addSeparators) return items
    const ret = items

    // today
    {
      const config = this.separatorsConfig.today
      const { getInsertIndex, content, added } = config
      if (!added) {
        const idx = getInsertIndex(items)
        if (idx !== -1) {
          ret.splice(idx, 0, {
            api: EApiType.Separator,
            uniqId: `dynamic-feed-separator-today`,
            content,
          })
          config.added = true
        }
      }
    }

    // earlier
    {
      const config = this.separatorsConfig.earlier
      const { getInsertIndex, content, added } = config
      if (!added) {
        const idx = getInsertIndex(items)
        if (idx !== -1) {
          ret.splice(idx, 0, {
            api: EApiType.Separator,
            uniqId: 'dynamic-feed-separator-earlier',
            content,
          })
          config.added = true
        }
      }
    }

    return ret
  }
}

type SeparatorsConfig = Record<
  'today' | 'earlier',
  { added: boolean; content: ReactNode; getInsertIndex: (items: AllowedItemType[]) => number }
>

function insertIndexFinderViaPubTsRange(lower: number, upper: number) {
  return (items: AllowedItemType[]) => {
    return items.findIndex((x) => {
      if (x.api !== EApiType.DynamicFeed) return false
      const pubTs = x.modules.module_author.pub_ts
      return pubTs >= lower && pubTs < upper
    })
  }
}

function getTodaySeparatorInsertIndex(items: AllowedItemType[]) {
  const index = items.findIndex((x) => x.api === EApiType.Live && x.live_status === ELiveStatus.Streaming)
  if (index !== -1) return index
  const todayInsertIndexFinder = insertIndexFinderViaPubTsRange(
    dayjs().startOf('day').unix(),
    dayjs().endOf('day').unix(),
  )
  return todayInsertIndexFinder(items)
}
