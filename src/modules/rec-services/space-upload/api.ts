/**
 * https://socialsisteryi.github.io/bilibili-API-collect/docs/user/space.html#查询用户投稿视频明细
 */

import { request } from '$request'
import type { SpaceUploadJson } from './types/space-upload'

export enum SpaceUploadOrder {
  Latest = 'pubdate',
  View = 'click',
  Fav = 'stow',
}

export async function getSpaceUpload({
  mid,
  order = SpaceUploadOrder.Latest,
  keyword = '',
  pagenum = 1,
}: {
  mid: string | number
  order?: SpaceUploadOrder
  keyword?: string
  pagenum?: number
}) {
  const res = await request.get('/x/space/wbi/arc/search', {
    params: {
      mid,
      order,
      keyword,
      ps: 42, // web default
      pn: pagenum,
    },
  })

  const json = res.data as SpaceUploadJson
  const items = json.data.list.vlist || []
  let hasMore: boolean
  {
    const { count, pn, ps } = json.data.page
    hasMore = pn * ps < count
  }

  return { items, hasMore }
}
