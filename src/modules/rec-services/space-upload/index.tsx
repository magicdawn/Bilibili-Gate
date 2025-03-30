import type { SpaceUploadItemExtend } from '$define'
import { EApiType } from '$define/index.shared'
import { getSpaceAccInfo } from '$modules/bilibili/user/space-acc-info'
import { parseSearchInput } from '$utility/search'
import { invariant } from 'es-toolkit'
import QuickLRU from 'quick-lru'
import { BaseTabService } from '../_base'
import { getSpaceUpload, SpaceUploadOrder } from './api'
import { SpaceUploadUsageInfo } from './usage-info'

export const spaceUploadAvatarCache = new QuickLRU<string, string>({ maxSize: 100 })

export class SpaceUploadService extends BaseTabService<SpaceUploadItemExtend> {
  static PAGE_SIZE = 20
  constructor(
    public mid: string | number,
    public order: SpaceUploadOrder = SpaceUploadOrder.Latest,
    public searchText: string | undefined,
    public filterText: string | undefined,
  ) {
    super(SpaceUploadService.PAGE_SIZE)
    invariant(this.mid, 'mid should not be nil')
    this.searchText = this.searchText?.trim()
  }

  override usageInfo: ReactNode = (<SpaceUploadUsageInfo />)

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
    let { items, hasMore } = await getSpaceUpload({
      mid: this.mid,
      order: this.order,
      pagenum: this.page,
      keyword: this.searchText || '',
    })

    if (this.filterText) {
      const { includes, excludes } = parseSearchInput(this.filterText)
      items = items.filter((item) => {
        return (
          includes.every((include) => item.title.includes(include)) &&
          excludes.every((exclude) => !item.title.includes(exclude))
        )
      })
    }

    await this.fetchAvatars(items.map((item) => item.mid.toString()))
    this.hasMoreExceptQueue = hasMore
    this.page++

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
