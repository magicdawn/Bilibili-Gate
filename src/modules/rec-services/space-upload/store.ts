import { proxy } from 'valtio'
import { SpaceUploadOrder } from './api'

export enum SpaceUploadQueryKey {
  Mid = 'space-mid',
}

export const QUERY_SPACE_UPLOAD_MID =
  new URLSearchParams(location.search).get(SpaceUploadQueryKey.Mid) || undefined

export const SHOW_SPACE_UPLOAD_ONLY = !!QUERY_SPACE_UPLOAD_MID

const store = proxy({
  order: SpaceUploadOrder.Latest,
  searchText: undefined as string | undefined,
  filterText: undefined as string | undefined,
})

export { store as spaceUploadStore }
