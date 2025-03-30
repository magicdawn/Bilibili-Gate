export enum SpaceUploadQueryKey {
  Mid = 'space-mid',
}

export const QUERY_SPACE_UPLOAD_MID =
  new URLSearchParams(location.search).get(SpaceUploadQueryKey.Mid) || undefined

export const SHOW_SPACE_UPLOAD_ONLY = !!QUERY_SPACE_UPLOAD_MID
