import { BiliDomain } from '$common'
import { getUid } from '$utility/cookie'
import { FavQueryKey } from './store'

/**
 * I don't know what is ctype, 有时需要, 有时不需要
 */
export function formatFavFolderUrl(id: number | string, ctype = 21) {
  return `https://${BiliDomain.Space}/${getUid()}/favlist?fid=${id}&ftype=create`
}
export function formatFavCollectionSelfSpaceUrl(id: number | string, ctype = 21) {
  return `https://${BiliDomain.Space}/${getUid()}/favlist?fid=${id}&ftype=collect&ctype=${ctype}`
}

export function formatFavCollectionUpSpaceUrl(upMid: number, id: number | string) {
  return `https://${BiliDomain.Space}/${upMid}/lists/${id}?type=season`
}

export function formatFavCollectionGateUrl(id: number | string) {
  return `https://${BiliDomain.Main}/?${FavQueryKey.CollectionId}=${id}`
}

export function formatFavPlaylistUrl(id: number | string) {
  return `https://${BiliDomain.Main}/list/ml${id}`
}

export function formatBvidUrl(bvid: string) {
  return `https://${BiliDomain.Main}/video/${bvid}`
}
