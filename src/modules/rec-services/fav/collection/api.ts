import { uniqBy } from 'es-toolkit'
import { request } from '$request'
import { getUid } from '$utility/cookie'
import type { FavCollectionDetailJson } from '../types/collections/collection-detail'
import type { FavCollection, ListAllCollectionJson } from '../types/collections/list-all-collections'

async function fetchFavCollections(page: number) {
  const res = await request.get('/x/v3/fav/folder/collected/list', {
    params: {
      up_mid: getUid(),
      platform: 'web',
      ps: 20,
      pn: page,
    },
  })
  const json = res.data as ListAllCollectionJson
  return json.data
}
export async function fetchAllFavCollections() {
  let page = 1
  let hasMore = true
  let items: FavCollection[] = []
  while (hasMore) {
    const data = await fetchFavCollections(page)
    items.push(...data.list)
    hasMore = data.has_more
    page++
  }

  items = items.filter((x) => {
    if (x.title === '该合集已失效' && x.upper.mid === 0) return false
    return true
  })
  items = uniqBy(items, (x) => x.id)

  return items
}

export async function fetchCollectionDetail(collectionId: string | number, page: number) {
  const res = await request.get('/x/space/fav/season/list', {
    params: {
      season_id: collectionId,
      ps: 20,
      pn: page,
    },
  })
  const json = res.data as FavCollectionDetailJson
  return json.data
}
