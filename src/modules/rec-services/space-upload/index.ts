import type { SpaceUploadItemExtend } from '$define'
import { EApiType } from '$define/index.shared'
import { getSpaceAccInfo } from '$modules/bilibili/user/space-acc-info'
import { invariant } from 'es-toolkit'
import QuickLRU from 'quick-lru'
import { BaseTabService } from '../_base'
import { getSpaceUpload, SpaceUploadOrder } from './api'

export const spaceUploadAvatarCache = new QuickLRU<string, string>({ maxSize: 100 })

export class SpaceUploadService extends BaseTabService<SpaceUploadItemExtend> {
  static PAGE_SIZE = 20
  constructor(
    public mid: string | number,
    public order: SpaceUploadOrder = SpaceUploadOrder.Latest,
  ) {
    super(SpaceUploadService.PAGE_SIZE)
    invariant(this.mid, 'mid should not be nil')
  }

  override usageInfo: ReactNode = undefined

  override hasMoreExceptQueue: boolean = true

  private async fetchAvatars(mids: string[]) {
    await Promise.all(
      mids.map(async (mid) => {
        const info = await getSpaceAccInfo(mid)
        if (!info) return
        spaceUploadAvatarCache.set(mid, info.face)
      }),
    )
  }

  page = 1
  override async fetchMore(abortSignal: AbortSignal): Promise<SpaceUploadItemExtend[] | undefined> {
    const { items, hasMore } = await getSpaceUpload({
      mid: this.mid,
      order: this.order,
      pagenum: this.page,
    })

    const mids = items.map((item) => item.mid.toString())
    await this.fetchAvatars(mids)

    this.page++
    this.hasMoreExceptQueue = hasMore
    const list: SpaceUploadItemExtend[] = items.map((item) => {
      return {
        ...item,
        api: EApiType.SpaceUpload,
        uniqId: `${EApiType.SpaceUpload}-${item.bvid}`,
      }
    })
    return list
  }
}
