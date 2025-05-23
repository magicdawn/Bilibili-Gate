/**
 * https://socialsisteryi.github.io/bilibili-API-collect/docs/user/space.html#查询用户投稿视频明细
 */

import pRetry from 'p-retry'
import { OPERATION_FAIL_MSG } from '$common'
import { IconForFav, IconForPlayer, IconForTimestamp } from '$modules/icon'
import { isWebApiSuccess, request } from '$request'
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

// web default: 42
export const SPACE_UPLOAD_API_PAGE_SIZE = 40

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
      ps: SPACE_UPLOAD_API_PAGE_SIZE,
      pn: pagenum,
    },
  })

  const json = res.data as SpaceUploadJson
  if (!isWebApiSuccess(json)) {
    // eslint-disable-next-line no-constant-binary-expression
    throw new Error(`request json error: ${json.message}` || OPERATION_FAIL_MSG)
  }

  const items = json.data.list.vlist || []
  const count = json.data.page.count
  let hasMore: boolean
  let endVol: number
  {
    const { count, pn, ps } = json.data.page
    hasMore = pn * ps < count
    endVol = count - (pn - 1) * ps
  }

  return { items, hasMore, count, endVol }
}

export async function tryGetSpaceUpload(...args: Parameters<typeof getSpaceUpload>) {
  return await pRetry(() => getSpaceUpload(...args), {
    retries: 5,
    factor: 1.5,
    onFailedAttempt: (err) => console.error(err),
  })
}
