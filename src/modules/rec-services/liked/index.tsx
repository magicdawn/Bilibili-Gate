import { av2bv } from '@mgdn/bvid'
import { Result } from 'better-result'
import { proxy, useSnapshot } from 'valtio'
import { EApiType } from '$enums'
import { getVideoDetail } from '$modules/bilibili/video/video-detail'
import { handleRequestError } from '$request'
import { BaseTabService } from '../_base'
import { fetchMyLikedVideos } from './api/liked'
import { LikedTabbarView } from './tabbar-view'
import type { ReactNode } from 'react'
import type { LikedItemExtend, RecItemTypeOrSeparator } from '$define'

export class LikedRecService extends BaseTabService {
  static PAGE_SIZE = 20

  constructor() {
    super(LikedRecService.PAGE_SIZE)
  }

  override tabbarView = <LikedTabbarView service={this} />
  override sidebarView?: ReactNode
  override get hasMoreExceptQueue() {
    if (this.errorJson) return false
    return LikedRecService.PAGE_SIZE * this.pn < this.store.count
  }

  pn = 0
  errorJson: any = undefined

  private store = proxy({ count: Infinity })
  useStore = () => {
    // oxlint-disable-next-line rules-of-hooks
    return useSnapshot(this.store)
  }

  override async fetchMore(abortSignal: AbortSignal): Promise<RecItemTypeOrSeparator[] | undefined> {
    const result = await fetchMyLikedVideos(this.qs.ps, this.pn + 1)
    result.tapError(handleRequestError)
    let { count, item: list } = result.unwrap()

    // `.state = false`: 表示已失效, 请求详情也是报错...
    list = list.filter((x) => x.state !== false)
    const detailResults = await Promise.all(
      list.map((x) => (x.state ? Result.tryPromise(() => getVideoDetail(av2bv(x.param))) : undefined)),
    )
    const extendedList: LikedItemExtend[] = list.map((item, index) => {
      return {
        ...item,
        api: EApiType.Liked,
        uniqId: `${EApiType.Liked}:${item.param}`,
        videoDetail: detailResults[index]?.unwrapOr(undefined),
      }
    })

    this.pn++
    this.store.count = count
    return extendedList
  }
}
