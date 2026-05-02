import { isEqual, pick } from 'es-toolkit'
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
  filterMinDuration: number | undefined
  filterMaxDuration: number | undefined
}

const defaultFilterState = {
  hideChargeOnlyVideos: true,
  filterMinDuration: undefined,
  filterMaxDuration: undefined,
} as const satisfies SpaceUploadFilterState

const filterStateMap = (
  await proxyMapWithGmStorage<SpaceUploadFilterKey, SpaceUploadFilterState>('space-upload:filters', (vals) =>
    vals.filter(([, state]) => !isEqual(state, defaultFilterState)),
  )
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
    const state = (this.filterStateMap.get(this.currentFilterKey) ?? {}) as Partial<SpaceUploadFilterState>
    return { ...defaultFilterState, ...state }
  },

  resetCurrentFilterState() {
    this.filterStateMap.set(this.currentFilterKey, { ...defaultFilterState })
  },

  updateCurrentFilterState(payload: Partial<SpaceUploadFilterState>) {
    this.filterStateMap.set(this.currentFilterKey, { ...this.currentFilterState, ...payload })
  },

  _setDurationValue(target: 'min' | 'max', value: number | undefined) {
    const payload: Pick<SpaceUploadFilterState, 'filterMinDuration' | 'filterMaxDuration'> = {
      ...pick(this.currentFilterState, ['filterMinDuration', 'filterMaxDuration']),
      ...(target === 'min' && { filterMinDuration: value }),
      ...(target === 'max' && { filterMaxDuration: value }),
    }
    // zero to undefined
    payload.filterMinDuration ||= undefined
    payload.filterMaxDuration ||= undefined
    // boundary check
    if (
      payload.filterMaxDuration &&
      payload.filterMinDuration &&
      payload.filterMinDuration >= payload.filterMaxDuration // invalid case
    ) {
      if (target === 'min') payload.filterMaxDuration = undefined
      if (target === 'max') payload.filterMinDuration = undefined
    }
    this.updateCurrentFilterState(payload)
  },
  setFilterMinDuration(val: number | undefined) {
    return this._setDurationValue('min', val)
  },
  setFilterMaxDuration(val: number | undefined) {
    return this._setDurationValue('max', val)
  },
})

export { store as spaceUploadStore }
