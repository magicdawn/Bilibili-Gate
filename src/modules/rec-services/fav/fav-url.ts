import { BiliDomain } from '$common'
import { getUid } from '$utility/cookie'
import { FavQueryKey } from './store'

export function formatBvidUrl(bvid: string) {
  return `https://${BiliDomain.Main}/video/${bvid}`
}

/* #region fav-folder */
export function formatFavFolderGateUrl(id: number | string) {
  return `https://${BiliDomain.Main}/?${FavQueryKey.FolderId}=${id}`
}
// I don't know what is ctype, 有时需要, 有时不需要
export function formatFavFolderSelfSpaceUrl(id: number | string, ctype = 21) {
  return `https://${BiliDomain.Space}/${getUid()}/favlist?fid=${id}&ftype=create`
}
export function formatFavFolderPlaylistUrl(id: number | string) {
  return `https://${BiliDomain.Main}/list/ml${id}`
}
/* #endregion */

/* #region fav-collection */
export function formatFavCollectionGateUrl(id: number | string) {
  return `https://${BiliDomain.Main}/?${FavQueryKey.CollectionId}=${id}`
}
export function formatFavCollectionSelfSpaceUrl(id: number | string, ctype = 21) {
  return `https://${BiliDomain.Space}/${getUid()}/favlist?fid=${id}&ftype=collect&ctype=${ctype}`
}
export function formatFavCollectionUpSpaceUrl(upMid: number, id: number | string) {
  return `https://${BiliDomain.Space}/${upMid}/lists/${id}?type=season`
}
/* #endregion */
