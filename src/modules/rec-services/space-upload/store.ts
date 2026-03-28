import { proxy } from 'valtio'
import { proxyMapWithGmStorage } from '$utility/valtio'
import { SpaceUploadOrder } from './api'

export enum SpaceUploadQueryKey {
  Mid = 'space-mid',
  GroupId = 'space-group-id',
  SearchText = 'space-search-text',
  FilterText = 'space-filter-text',
  InitialPage = 'space-initial-page',
  Order = 'space-order',
}

export enum SpaceUploadVideoMinDuration {
  All = 'all',
  _5m = '5min',
  _2m = '2min',
  _1m = '1min',
  _30s = '30s',
  _10s = '10s',
}

export const SpaceUploadVideoMinDurationConfig: Record<
  SpaceUploadVideoMinDuration,
  { label: string; duration: number }
> = {
  // 及以上
  [SpaceUploadVideoMinDuration.All]: { label: '全部时长', duration: 0 },
  [SpaceUploadVideoMinDuration._5m]: { label: '5分钟', duration: 5 * 60 },
  [SpaceUploadVideoMinDuration._2m]: { label: '2分钟', duration: 2 * 60 },
  [SpaceUploadVideoMinDuration._1m]: { label: '1分钟', duration: 60 },
  [SpaceUploadVideoMinDuration._30s]: { label: '30秒', duration: 30 },
  [SpaceUploadVideoMinDuration._10s]: { label: '10秒', duration: 10 },
}

const searchParams = new URLSearchParams(location.search)
export const QUERY_SPACE_UPLOAD_MID = searchParams.get(SpaceUploadQueryKey.Mid) || undefined
export const QUERY_SPACE_UPLOAD_GROUP_ID = searchParams.get(SpaceUploadQueryKey.GroupId) || undefined
export const QUERY_SPACE_UPLOAD_SEARCH_TEXT = searchParams.get(SpaceUploadQueryKey.SearchText) || undefined
export const QUERY_SPACE_UPLOAD_FILTER_TEXT = searchParams.get(SpaceUploadQueryKey.FilterText) || undefined
export const QUERY_SPACE_UPLOAD_INITIAL_PAGE = searchParams.get(SpaceUploadQueryKey.InitialPage) || undefined
export const QUERY_SPACE_UPLOAD_ORDER = (() => {
  const val = searchParams.get(SpaceUploadQueryKey.Order)
  if (!val) return undefined
  if (!Object.values(SpaceUploadOrder).includes(val as SpaceUploadOrder)) return undefined
  return val as SpaceUploadOrder
})()

const mids = (QUERY_SPACE_UPLOAD_MID || '')
  .split(/[,_-]/) // `-` / `_` 不需要 url encode, `,` 需要
  .map((x) => x.trim())
  .filter(Boolean)
  .filter((x) => /^\d+$/.test(x))
const groupId = QUERY_SPACE_UPLOAD_GROUP_ID ? Number(QUERY_SPACE_UPLOAD_GROUP_ID) : undefined
export const SHOW_SPACE_UPLOAD_ONLY = !!mids.length || groupId !== undefined

export const SpaceUploadFilterKeyPrefixUp = 'up:' as const
export const SpaceUploadFilterKeyPrefixGroup = 'group:' as const

export type SpaceUploadFilterKey =
  | `${typeof SpaceUploadFilterKeyPrefixUp}${string}`
  | `${typeof SpaceUploadFilterKeyPrefixGroup}${number}`

type SpaceUploadFilterState = {
  hideChargeOnlyVideos: boolean
  filterMinDuration: SpaceUploadVideoMinDuration
}

const defaultFilterState = {
  hideChargeOnlyVideos: true,
  filterMinDuration: SpaceUploadVideoMinDuration.All,
} as const satisfies SpaceUploadFilterState

const filterStateMap = (
  await proxyMapWithGmStorage<SpaceUploadFilterKey, SpaceUploadFilterState>('space-upload:filters')
).map

const store = proxy({
  mids,
  groupId,
  order: QUERY_SPACE_UPLOAD_ORDER,
  searchText: QUERY_SPACE_UPLOAD_SEARCH_TEXT as string | undefined,
  filterText: QUERY_SPACE_UPLOAD_FILTER_TEXT as string | undefined,
  filterStateMap,

  get isMultipleTraget() {
    return this.mids.length > 1 || this.groupId !== undefined
  },
  get allowedOrders() {
    return [SpaceUploadOrder.Latest, SpaceUploadOrder.View, !this.isMultipleTraget && SpaceUploadOrder.Fav].filter(
      Boolean,
    )
  },
  get usingOrder() {
    return this.allowedOrders.includes(this.order) ? this.order : this.allowedOrders[0]
  },

  get currentFilterKey(): SpaceUploadFilterKey {
    if (this.groupId !== undefined) return `${SpaceUploadFilterKeyPrefixGroup}${this.groupId}`
    if (this.mids.length === 1) return `${SpaceUploadFilterKeyPrefixUp}${this.mids[0]}`
    if (this.mids.length > 1) {
      const stableMids = [...this.mids].sort((a, b) => Number(a) - Number(b))
      return `${SpaceUploadFilterKeyPrefixUp}${stableMids.join(',')}`
    }
    return `${SpaceUploadFilterKeyPrefixUp}unknown`
  },
  get currentFilterState(): SpaceUploadFilterState {
    return (this.filterStateMap.get(this.currentFilterKey) ?? defaultFilterState) as SpaceUploadFilterState
  },

  get hideChargeOnlyVideos() {
    return this.currentFilterState.hideChargeOnlyVideos
  },
  get filterMinDuration() {
    return this.currentFilterState.filterMinDuration
  },
  get filterMinDurationValue() {
    const key = this.currentFilterState.filterMinDuration as SpaceUploadVideoMinDuration
    return SpaceUploadVideoMinDurationConfig[key].duration
  },

  setHideChargeOnlyVideos(val: boolean) {
    this.filterStateMap.set(this.currentFilterKey, {
      ...this.currentFilterState,
      hideChargeOnlyVideos: val,
    })
  },
  setFilterMinDuration(val: SpaceUploadVideoMinDuration) {
    this.filterStateMap.set(this.currentFilterKey, {
      ...this.currentFilterState,
      filterMinDuration: val,
    })
  },
  resetCurrentFilterState() {
    this.filterStateMap.set(this.currentFilterKey, { ...defaultFilterState })
  },
})

export { store as spaceUploadStore }
