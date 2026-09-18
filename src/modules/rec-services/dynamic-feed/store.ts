import { delay } from 'es-toolkit'
import ms from 'ms'
import { proxy } from 'valtio'
import { IN_BILIBILI_HOMEPAGE } from '$common'
import { getAllFollowGroups } from '$modules/bilibili/me/follow-group'
import { settings } from '$modules/settings'
import { getUid } from '$utility/cookie'
import { setPageTitle, whenIdle } from '$utility/dom'
import { proxyMapWithGmStorage, proxySetWithGmStorage, subscribeOnKeys } from '$utility/valtio'
import { getRecentUpdateUpList } from './up'
import type { FollowGroup } from '$modules/bilibili/me/follow-group/types/groups'
import type { DynamicPortalUp } from './up/portal-types'

/**
 * view dynamic of <mid> via query
 */

export enum DynamicFeedQueryKey {
  Mid = 'dyn-mid',
  GroupId = 'dyn-group-id',

  FilterTextFull = 'dyn-filter-text',
  FilterTextShort = 'dyn-filter',

  Offset = 'dyn-offset',
  MinId = 'dyn-min-id',
  MinTs = 'dyn-min-ts',
}

const searchParams = new URLSearchParams(location.search)
export const QUERY_DYNAMIC_UP_MID = searchParams.get(DynamicFeedQueryKey.Mid)?.trim()
export const QUERY_DYNAMIC_GROUP_ID = searchParams.get(DynamicFeedQueryKey.GroupId)?.trim()
  ? Number(searchParams.get(DynamicFeedQueryKey.GroupId)!.trim())
  : undefined
export const QUERY_DYNAMIC_OFFSET = searchParams.get(DynamicFeedQueryKey.Offset) || undefined // where to start, exclusive
export const QUERY_DYNAMIC_FILTER_TEXT = QUERY_DYNAMIC_UP_MID // only support using with `dyn-mid`
  ? searchParams.get(DynamicFeedQueryKey.FilterTextFull) ||
    searchParams.get(DynamicFeedQueryKey.FilterTextShort) ||
    undefined
  : undefined
export const QUERY_DYNAMIC_MIN_ID = QUERY_DYNAMIC_UP_MID // only support using with `dyn-mid`, dyn.id_str >= dyn-min-id, stands for `update since`
  ? searchParams.get(DynamicFeedQueryKey.MinId)
  : undefined
export const QUERY_DYNAMIC_MIN_TS = QUERY_DYNAMIC_MIN_ID // only support using with `dyn-min-id`, dyn.publish-time >= dyn-min-ts, stands for `update since`
  ? searchParams.get(DynamicFeedQueryKey.MinTs)
  : undefined

export const SHOW_DYNAMIC_FEED_ONLY =
  IN_BILIBILI_HOMEPAGE && (!!QUERY_DYNAMIC_UP_MID || QUERY_DYNAMIC_GROUP_ID !== undefined)

let upMidInitial: UpMidType | undefined
let upNameInitial: string | undefined
let groupIdInitial: number | undefined
if (SHOW_DYNAMIC_FEED_ONLY) {
  if (QUERY_DYNAMIC_UP_MID) {
    upMidInitial = QUERY_DYNAMIC_UP_MID
    upNameInitial = searchParams.get('dyn-name') ?? upMidInitial?.toString() ?? undefined
  } else if (QUERY_DYNAMIC_GROUP_ID !== undefined) {
    groupIdInitial = QUERY_DYNAMIC_GROUP_ID
  }
}

export type UpMidType = string

export enum DynamicFeedVideoType {
  All = 'all',
  UploadOnly = 'upload-only',
  DynamicOnly = 'dynamic-only',
}

export const DynamicFeedBadgeText = {
  Upload: '投稿视频',
  Dynamic: '动态视频',
  // ChargeOnly: TEXT_CHARGE_ONLY,
  // 其他: 抢先看
} as const

export const DynamicFeedVideoTypeLabel: Record<DynamicFeedVideoType, string> = {
  [DynamicFeedVideoType.All]: '全部',
  [DynamicFeedVideoType.UploadOnly]: '仅投稿视频',
  [DynamicFeedVideoType.DynamicOnly]: '仅动态视频',
}

export enum DynamicFeedVideoMinDuration {
  All = 'all',
  _5m = '5min',
  _2m = '2min',
  _1m = '1min',
  _30s = '30s',
  _10s = '10s',
}

export const DynamicFeedVideoMinDurationConfig: Record<
  DynamicFeedVideoMinDuration,
  { label: string; duration: number }
> = {
  // 及以上
  [DynamicFeedVideoMinDuration.All]: { label: '全部时长', duration: 0 },
  [DynamicFeedVideoMinDuration._5m]: { label: '5分钟', duration: 5 * 60 },
  [DynamicFeedVideoMinDuration._2m]: { label: '2分钟', duration: 2 * 60 },
  [DynamicFeedVideoMinDuration._1m]: { label: '1分钟', duration: 60 },
  [DynamicFeedVideoMinDuration._30s]: { label: '30秒', duration: 30 },
  [DynamicFeedVideoMinDuration._10s]: { label: '10秒', duration: 10 },
}

export const DF_SELECTED_KEY_ALL = 'all' as const
export const DF_SELECTED_KEY_PREFIX_UP = 'up:' as const
export const DF_SELECTED_KEY_PREFIX_GROUP = 'group:' as const

export type DynamicFeedStoreSelectedKey =
  | typeof DF_SELECTED_KEY_ALL
  | `${typeof DF_SELECTED_KEY_PREFIX_UP}${UpMidType}`
  | `${typeof DF_SELECTED_KEY_PREFIX_GROUP}${number}`

const hideChargeOnlyVideosForKeysSet = (
  await proxySetWithGmStorage<string>('dynamic-feed:hide-charge-only-videos-for-keys')
).set

const addSeparatorsMap = (await proxyMapWithGmStorage<string, boolean>('dynamic-feed:add-separators')).map

/**
 * df expand to `dynamic-feed`
 */
export type DynamicFeedStore = ReturnType<typeof createDfStore>
export const dfStore = createDfStore()
export function createDfStore() {
  return proxy({
    upMid: upMidInitial as UpMidType | undefined,
    upName: upNameInitial as string | undefined,
    upFace: undefined as string | undefined,
    upList: [] as DynamicPortalUp[],
    upListUpdatedAt: 0,

    groups: [] as FollowGroup[],
    groupsUpdatedAt: 0,
    selectedGroupId: groupIdInitial as number | undefined,
    get selectedGroup(): FollowGroup | undefined {
      if (typeof this.selectedGroupId !== 'number') return
      return this.groups.find((x) => x.tagid === this.selectedGroupId)
    },

    dynamicFeedVideoType: DynamicFeedVideoType.All,
    filterText: (QUERY_DYNAMIC_FILTER_TEXT ?? undefined) as string | undefined,

    // 选择状态
    get viewingAll(): boolean {
      return this.selectedKey === DF_SELECTED_KEY_ALL
    },
    get viewingSomeUp(): boolean {
      return !!this.upMid
    },
    get viewingSomeGroup(): boolean {
      return typeof this.selectedGroupId === 'number'
    },

    // 筛选 UP & 分组 select 控件的 key
    get selectedKey(): DynamicFeedStoreSelectedKey {
      if (this.upMid) return `${DF_SELECTED_KEY_PREFIX_UP}${this.upMid}`
      if (this.selectedGroupId !== undefined) return `${DF_SELECTED_KEY_PREFIX_GROUP}${this.selectedGroupId}`
      return DF_SELECTED_KEY_ALL
    },

    hideChargeOnlyVideosForKeysSet,
    get hideChargeOnlyVideos() {
      return this.hideChargeOnlyVideosForKeysSet.has(this.selectedKey)
    },

    addSeparatorsMap,
    get addSeparators() {
      // 按 selectedKey 区分是否有必要?
      return this.addSeparatorsMap.get('global') ?? false
    },

    filterMinDuration: DynamicFeedVideoMinDuration.All,
    get filterMinDurationValue() {
      return DynamicFeedVideoMinDurationConfig[this.filterMinDuration].duration
    },

    /**
     * methods
     */
    updateUpList,
    updateGroups,
  })
}

export type FollowGroupInfo = Record<number, {}>
export const dfInfoStore = proxy<{ followGroupInfo: FollowGroupInfo }>({
  followGroupInfo: {},
})

async function updateUpList(force = false) {
  const cacheHit =
    !force && dfStore.upList.length && dfStore.upListUpdatedAt && dfStore.upListUpdatedAt - Date.now() < ms('5min')
  if (cacheHit) return

  const list = await getRecentUpdateUpList()
  dfStore.upList = list
  dfStore.upListUpdatedAt = Date.now()
}

async function updateGroups(force = false) {
  {
    const { followGroup, whenViewAll } = settings.dynamicFeed
    const enabled =
      followGroup.enabled || !!whenViewAll.hideIds.filter((x) => x.startsWith(DF_SELECTED_KEY_PREFIX_GROUP)).length
    if (!enabled) return
  }

  const cacheHit =
    !force && dfStore.groups.length && dfStore.groupsUpdatedAt && dfStore.groupsUpdatedAt - Date.now() < ms('1h')
  if (cacheHit) return

  dfStore.groups = await getAllFollowGroups({ removeEmpty: true })
  dfStore.groupsUpdatedAt = Date.now()
}

export function updateFilterData() {
  // not logined
  if (!getUid()) return
  return Promise.all([updateUpList(), updateGroups()])
}

// #region !Side Effects

void (async () => {
  if (!IN_BILIBILI_HOMEPAGE) return
  await delay(5_000)
  if (!dfStore.upList.length || !dfStore.groups.length) {
    await whenIdle()
    updateFilterData()
  }
})()

if (QUERY_DYNAMIC_UP_MID) {
  subscribeOnKeys(
    dfStore,
    ['upName', 'filterText', 'selectedGroup', 'viewingSomeUp', 'viewingAll'],
    ({ upName, filterText, selectedGroup, viewingSomeUp, viewingAll }) => {
      let title = viewingAll ? '动态' : viewingSomeUp ? `「${upName}」的动态` : `「${selectedGroup?.name}」分组动态`
      if (filterText) {
        title = `🔍【${filterText}】 - ${title}`
      }
      setPageTitle(title)
    },
  )
}

// #endregion
