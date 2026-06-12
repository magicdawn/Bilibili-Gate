import { isEqual, pick } from 'es-toolkit'
import { proxy, snapshot } from 'valtio'
import { EContinuePlayDirection } from '$enums'
import { getSettingsSnapshot, type Settings } from '$modules/settings'
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
  await proxyMapWithGmStorage<SpaceUploadFilterKey, SpaceUploadFilterState>('space-upload:filters', {
    beforeLoad(vals) {
      // 历史数据: 存的是 string 如 `1min`
      vals.forEach(([_, state]) => {
        if (state.filterMinDuration && typeof state.filterMinDuration !== 'number') state.filterMinDuration = undefined
        if (state.filterMaxDuration && typeof state.filterMaxDuration !== 'number') state.filterMaxDuration = undefined
      })
      return vals
    },
    // 不存储 `默认值`
    beforeSave(vals) {
      return vals.filter(([, state]) => !isEqual(state, defaultFilterState))
    },
  })
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
  get usingOrder(): SpaceUploadOrder {
    const fallback = this.allowedOrders[0]
    if (!this.order) return fallback
    if (!this.allowedOrders.includes(this.order)) return fallback
    return this.order
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

  get isDisplayingSingleUpAllItems() {
    return this.mids.length === 1 && this.groupId === undefined && !this.filterText && !this.searchText
  },
})

export { store as spaceUploadStore }

export function buildSpaceUploadVideoCardUrl(
  mid: string | number | undefined,
  bvid: string,
  aid?: string | number,
  config?: Pick<Settings['spaceUpload'], 'continuePlay' | 'continuePlayDirection'> & {
    itemsOrder: SpaceUploadOrder
    isDisplayingSingleUpAllItems: boolean
  },
) {
  const { itemsOrder, continuePlay, continuePlayDirection, isDisplayingSingleUpAllItems } =
    config ??
    (() => {
      const { usingOrder: itemsOrder, isDisplayingSingleUpAllItems } = snapshot(store)
      return {
        ...getSettingsSnapshot().spaceUpload,
        itemsOrder,
        isDisplayingSingleUpAllItems,
      }
    })()

  if (!continuePlay || !isDisplayingSingleUpAllItems) return `https://www.bilibili.com/video/${bvid}/`

  // https://www.bilibili.com/list/:mid/?sort_field=pubtime&tid=0&oid=:avid&bvid=:bvid
  const params = new URLSearchParams({
    // 这里 URL 使用的 field 与 API field 不一致, 需要映射
    sort_field: {
      [SpaceUploadOrder.Latest]: 'pubtime',
      [SpaceUploadOrder.View]: 'play',
      [SpaceUploadOrder.Fav]: 'fav',
    }[itemsOrder],
    tid: '0',
    bvid,
  })

  if (aid) params.set('oid', String(aid))

  if (continuePlayDirection === EContinuePlayDirection.Reverse) {
    params.set('desc', '0')
  } else {
    // params.set('desc', '1') // default
  }

  return `https://www.bilibili.com/list/${mid}/?${params.toString()}`
}
