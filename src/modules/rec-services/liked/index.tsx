import { EApiType } from '$define/index.shared'
import { antNotification } from '$modules/antd'
import { settings } from '$modules/settings'
import { isWebApiSuccess } from '$request'
import { BaseTabService } from '../_base'
import { fetchMyLikedVideos } from './api/liked'
import type { LikedItemExtend, RecItemTypeOrSeparator } from '$define'

export class LikedRecService extends BaseTabService {
  static PAGE_SIZE = 20

  constructor() {
    super(LikedRecService.PAGE_SIZE)
  }

  override tabbarView: ReactNode
  override sidebarView?: ReactNode
  override get hasMoreExceptQueue() {
    if (this.errorJson) return false
    return LikedRecService.PAGE_SIZE * this.pn < this.count
  }

  pn = 0
  count = Infinity
  errorJson: any = undefined

  showErrorNotification(payload: Partial<typeof antNotification.error>) {
    antNotification.error({ key: 'liked-err', title: '获取喜欢列表失败', ...payload })
  }

  override async fetchMore(abortSignal: AbortSignal): Promise<RecItemTypeOrSeparator[] | undefined> {
    if (!settings.accessKey) {
      const msg = '需要获取有效的 access_key !'
      this.showErrorNotification({ description: msg })
      throw new Error(msg)
    }

    const json = await fetchMyLikedVideos(this.qs.ps, this.pn + 1)
    if (!isWebApiSuccess(json)) {
      this.errorJson = json
      this.showErrorNotification({ title: '获取喜欢列表失败', description: json.message, key: 'liked-err' })
      throw new Error('Request fail with none invalid json', { cause: json })
    }

    const { count, item } = json.data
    const extendedList: LikedItemExtend[] = item.map((item) => {
      return { ...item, uniqId: item.param, api: EApiType.Liked }
    })

    this.pn++
    this.count = count

    return extendedList
  }
}
