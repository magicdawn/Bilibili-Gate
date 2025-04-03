/**
 * https://socialsisteryi.github.io/bilibili-API-collect/docs/user/space.html#查询用户投稿视频明细
 */

import { IconForFav, IconForPlayer, IconForTimestamp } from '$modules/icon'
import { request } from '$request'
import type { SpaceUploadJson } from './types/space-upload'

export enum SpaceUploadOrder {
  Latest = 'pubdate',
  View = 'click',
  Fav = 'stow',
}
export const SpaceUploadOrderConfig: Record<
  SpaceUploadOrder,
  { icon?: ReactNode; label?: ReactNode; helpInfo?: ReactNode }
> = {
  [SpaceUploadOrder.Latest]: {
    icon: <IconForTimestamp />,
    label: '最新发布',
  },
  [SpaceUploadOrder.View]: {
    icon: <IconForPlayer />,
    label: '最多播放',
  },
  [SpaceUploadOrder.Fav]: {
    icon: <IconForFav />,
    label: '最多收藏',
  },
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
  let endVol: number
  {
    const { count, pn, ps } = json.data.page
    hasMore = pn * ps < count
    endVol = count - (pn - 1) * ps
  }

  return { items, hasMore, endVol }
}
