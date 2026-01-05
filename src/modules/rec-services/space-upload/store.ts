import { proxy } from 'valtio'
import { SpaceUploadOrder } from './api'

export enum SpaceUploadQueryKey {
  Mid = 'space-mid',
  GroupId = 'space-group-id',
  SearchText = 'space-search-text',
  FilterText = 'space-filter-text',
  InitialPage = 'space-initial-page',
}

const searchParams = new URLSearchParams(location.search)
export const QUERY_SPACE_UPLOAD_MID = searchParams.get(SpaceUploadQueryKey.Mid) || undefined
export const QUERY_SPACE_UPLOAD_GROUP_ID = searchParams.get(SpaceUploadQueryKey.GroupId) || undefined
export const QUERY_SPACE_UPLOAD_SEARCH_TEXT = searchParams.get(SpaceUploadQueryKey.SearchText) || undefined
export const QUERY_SPACE_UPLOAD_FILTER_TEXT = searchParams.get(SpaceUploadQueryKey.FilterText) || undefined
export const QUERY_SPACE_UPLOAD_INITIAL_PAGE = searchParams.get(SpaceUploadQueryKey.InitialPage) || undefined

const mids = (QUERY_SPACE_UPLOAD_MID || '')
  .split(/[,_-]/) // `-` / `_` 不需要 url encode, `,` 需要
  .map((x) => x.trim())
  .filter(Boolean)
  .filter((x) => /^\d+$/.test(x))
const groupId = QUERY_SPACE_UPLOAD_GROUP_ID ? Number(QUERY_SPACE_UPLOAD_GROUP_ID) : undefined
export const SHOW_SPACE_UPLOAD_ONLY = !!mids.length || groupId !== undefined

const store = proxy({
  mids,
  groupId,
  order: SpaceUploadOrder.Latest,
  searchText: QUERY_SPACE_UPLOAD_SEARCH_TEXT as string | undefined,
  filterText: QUERY_SPACE_UPLOAD_FILTER_TEXT as string | undefined,

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
})

export { store as spaceUploadStore }
