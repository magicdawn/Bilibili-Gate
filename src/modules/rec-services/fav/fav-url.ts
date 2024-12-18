import { getUid } from '$utility/cookie'

/**
 * I don't know what is ctype, 有时需要, 有时不需要
 */

export function formatFavFolderUrl(id: number, ctype = 21) {
  return `https://space.bilibili.com/${getUid()}/favlist?fid=${id}&ftype=create`
}

export function formatFavCollectionUrl(id: number, ctype = 21) {
  return `https://space.bilibili.com/${getUid()}/favlist?fid=${id}&ftype=collect&ctype=${ctype}`
}

export function formatFavPlaylistUrl(id: number) {
  return `https://www.bilibili.com/list/ml${id}`
}

export function formatBvidUrl(bvid: string) {
  return `https://www.bilibili.com/video/${bvid}`
}
