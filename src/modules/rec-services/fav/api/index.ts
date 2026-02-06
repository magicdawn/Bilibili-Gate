/**
 * 收藏
 * resource = ${avId}:${type}
 * type 一般为 2, 即获取收藏夹里的视频返回的 Media.type 意义不明
 * https://socialsisteryi.github.io/bilibili-API-collect/docs/video/action.html#%E6%94%B6%E8%97%8F%E8%A7%86%E9%A2%91-%E5%8F%8C%E7%AB%AF
 */

import { difference } from 'es-toolkit'
import { OPERATION_FAIL_MSG } from '$common'
import { isWebApiSuccess, request, WebApiError } from '$request'
import { getCsrfToken, getHasLogined, getUid } from '$utility/cookie'
import toast from '$utility/toast'
import { formatFavFolderUrl } from '../fav-url'
import { isFavFolderDefault, isFavFolderPrivate } from '../fav-util'
import { favStore, updateFavFolderList } from '../store'
import type { FavFolderInfoJson } from '../types/folders/get-folder-info.api'
import type { FavFolderListAllJson } from '../types/folders/list-all-folders'

/* #region base */
// media_ids: 收藏夹 id, 逗号分割
async function favDeal({
  avid,
  add_media_ids = '',
  del_media_ids = '',
}: {
  avid: string | number
  add_media_ids?: string
  del_media_ids?: string
}) {
  const form = new URLSearchParams({
    rid: avid.toString(),
    type: '2',
    add_media_ids,
    del_media_ids,
    platform: 'web',
    eab_x: '2',
    ramval: '0',
    ga: '1',
    gaia_source: 'web_normal',
    csrf: getCsrfToken(),
  })

  const res = await request.post('/x/v3/fav/resource/deal', form)
  const json = res.data
  const success = isWebApiSuccess(json)
  if (!success) {
    toast(json?.message || 'fav deal api fail')
  }
  return success
}
/* #endregion */

export const UserFavApi = {
  getVideoFavState,
  addFav,
  removeFavs,
  moveFavs, // 移动 1-to-1
  modifyFav,
}

/* #region 批量操作 */
// 删除
export async function removeFavs(folderId: number | string, resources: string | string[]) {
  const form = new URLSearchParams({
    resources: [resources].flat().join(','),
    media_id: folderId.toString(),
    platform: 'web',
    csrf: getCsrfToken(),
  })
  const res = await request.post('/x/v3/fav/resource/batch-del', form)
  const json = res.data
  const success = isWebApiSuccess(json)
  if (!success) {
    toast(json.message || OPERATION_FAIL_MSG)
  }
  return success
}

// 移动
export async function moveFavs(resources: string | string[], src: string | number, target: string | number) {
  const form = new URLSearchParams({
    resources: [resources].flat().join(','),
    src_media_id: src.toString(),
    tar_media_id: target.toString(),
    mid: getUid(),
    platform: 'web',
    csrf: getCsrfToken(),
  })
  const res = await request.post('/x/v3/fav/resource/move', form)
  const json = res.data
  const success = isWebApiSuccess(json)
  if (!success) {
    toast(json?.message || 'fav deal api fail')
  }
  return success
}
/* #endregion */

/**
 * 获取视频所在收藏夹
 * @see https://github.com/the1812/Bilibili-Evolved/blob/master/registry/lib/components/video/quick-favorite/QuickFavorite.vue
 */
export async function getVideoFavState(avid: number | string) {
  if (!getHasLogined()) return
  const res = await request.get('/x/v3/fav/folder/created/list-all', {
    params: {
      up_mid: getUid(),
      type: 2,
      rid: avid,
    },
  })
  const json = res.data as FavFolderListAllJson
  const favFolders = json.data.list.filter((folder) => folder.fav_state > 0)

  const favFolderNames = favFolders.map((f) => f.title)
  const favFolderUrls = favFolders.map((f) => formatFavFolderUrl(f.id))
  const favFolderIds = favFolders.map((f) => f.id)

  return { favFolders, favFolderNames, favFolderUrls, favFolderIds }
}

export let defaultFavFolderId: number | undefined
export let defaultFavFolderTitle: string | undefined
export async function addFav(avid: string | number, folderId?: number) {
  if (!folderId && (!defaultFavFolderId || !defaultFavFolderTitle)) {
    await updateFavFolderList()
    const { folders } = favStore
    const defaultFolder = folders.find((f) => isFavFolderDefault(f.attr)) ?? folders[0]
    if (!defaultFolder) return toast('没有找到默认收藏夹!')
    defaultFavFolderId = defaultFolder.id
    defaultFavFolderTitle = defaultFolder.title
  }

  folderId ||= defaultFavFolderId
  if (!folderId) {
    return toast('没有找到默认收藏夹!')
  }

  return await favDeal({ avid, add_media_ids: folderId.toString() })
}

export async function fetchAllFavFolders() {
  const res = await request.get('/x/v3/fav/folder/created/list-all', {
    params: { up_mid: getUid() },
  })
  const json = res.data as FavFolderListAllJson
  const folders = json.data.list
  return folders
}

async function modifyFav(
  avid: string | number,
  sourceFolderIds: number[] | undefined,
  targetFolderId: number | undefined,
): Promise<boolean> {
  const source = (sourceFolderIds ?? []).filter((x) => x !== undefined)
  const target = [targetFolderId].filter((x) => x !== undefined)
  const delArr = difference(source, target)
  const addArr = difference(target, source)
  const success = await favDeal({
    avid,
    del_media_ids: delArr.length ? delArr.join(',') : undefined,
    add_media_ids: addArr.length ? addArr.join(',') : undefined,
  })
  return success
}

export async function getFavFolderInfo(folderId: number) {
  const res = await request.get('/x/v3/fav/folder/info', {
    params: { media_id: folderId, web_location: '0.0' },
  })
  const json = res.data as FavFolderInfoJson
  if (!isWebApiSuccess(json)) throw new WebApiError(json)
  return json.data
}

export async function editFavFolder(folderId: number, newTitle: string) {
  const info = await getFavFolderInfo(folderId)
  if (!info) return
  const form = new URLSearchParams({
    media_id: folderId.toString(),
    title: newTitle,
    intro: info.intro,
    cover: info.cover,
    privacy: isFavFolderPrivate(info.attr) ? '1' : '0', // 0：公开  1：私有
    csrf: getCsrfToken(),
  })
  const res = await request.post('/x/v3/fav/folder/edit', form)
  const json = res.data
  const success = isWebApiSuccess(json)

  if (!success) {
    const msg = json.message || '编辑收藏夹失败'
    toast(msg)
  }

  return success
}
