import { av2bv } from '@mgdn/bvid'
import { attemptAsync } from 'es-toolkit'
import { proxy, useSnapshot } from 'valtio'
import { EApiType } from '$define/index.shared'
import { antNotification } from '$modules/antd'
import { getVideoDetail } from '$modules/bilibili/video/video-detail'
import { settings } from '$modules/settings'
import { isWebApiSuccess } from '$request'
import { NeedValidAccessKeyError } from '$utility/app-api'
import { BaseTabService } from '../_base'
import { fetchMyLikedVideos } from './api/liked'
import { LikedTabbarView } from './tabbar-view'
import type { LikedItemExtend, RecItemTypeOrSeparator } from '$define'

export class LikedRecService extends BaseTabService {
  static PAGE_SIZE = 20

  constructor() {
    super(LikedRecService.PAGE_SIZE)
  }

  override tabbarView = (<LikedTabbarView service={this} />)
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

  showErrorNotification(payload: Partial<typeof antNotification.error>) {
    antNotification.error({ key: 'LikedRecService:error', title: '获取喜欢列表失败', ...payload })
  }

  override async fetchMore(abortSignal: AbortSignal): Promise<RecItemTypeOrSeparator[] | undefined> {
    if (!settings.accessKey) throw new NeedValidAccessKeyError()

    antNotification.destroy('LikedRecService:error')
    const json = await fetchMyLikedVideos(this.qs.ps, this.pn + 1)
    if (!isWebApiSuccess(json)) {
      this.errorJson = json
      this.showErrorNotification({ title: '获取喜欢列表失败', description: json.message })
      throw new Error('Request fail with none invalid json', { cause: json })
    }

    const { count, item: list } = json.data
    const [_, detailList] = await attemptAsync(() =>
      // `x.state = false`: 表示已失效, 请求详情也是报错...
      Promise.all(list.map((x) => (x.state ? getVideoDetail(av2bv(x.param)) : undefined))),
    )
    const extendedList: LikedItemExtend[] = list.map((item, index) => {
      return { ...item, uniqId: item.param, api: EApiType.Liked, videoDetail: detailList?.[index] }
    })

    this.pn++
    this.store.count = count
    return extendedList
  }
}
