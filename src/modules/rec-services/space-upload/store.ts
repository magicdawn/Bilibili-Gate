import { proxy } from 'valtio'
import { SpaceUploadOrder } from './api'

export enum SpaceUploadQueryKey {
  Mid = 'space-mid',
  SearchText = 'space-search-text',
}

const searchParams = new URLSearchParams(location.search)
export const QUERY_SPACE_UPLOAD_MID = searchParams.get(SpaceUploadQueryKey.Mid) || undefined
export const QUERY_SPACE_UPLOAD_SEARCH_TEXT =
  searchParams.get(SpaceUploadQueryKey.SearchText) || undefined

export const SHOW_SPACE_UPLOAD_ONLY = !!QUERY_SPACE_UPLOAD_MID

const store = proxy({
  order: SpaceUploadOrder.Latest,
  searchText: QUERY_SPACE_UPLOAD_SEARCH_TEXT as string | undefined,
  filterText: undefined as string | undefined,
})

export { store as spaceUploadStore }
