import type { SpaceUploadItemExtend } from '$define'
import { EApiType } from '$define/index.shared'
import { getUserNickname } from '$modules/bilibili/user/nickname'
import { getSpaceAccInfo } from '$modules/bilibili/user/space-acc-info'
import { setPageTitle } from '$utility/dom'
import { parseSearchInput } from '$utility/search'
import { invariant } from 'es-toolkit'
import QuickLRU from 'quick-lru'
import { BaseTabService } from '../_base'
import { getSpaceUpload, SpaceUploadOrder } from './api'
import { SpaceUploadUsageInfo } from './usage-info'
import { isSpaceUploadItemChargeOnly } from './util'

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

  private pageTitleSet = false
  private async setPageTitle() {
    if (this.pageTitleSet) return
    const nickname = await getUserNickname(this.mid.toString())
    if (!nickname) return
    setPageTitle(`「${nickname}」的投稿`)
    this.pageTitleSet = true
  }

  page = 1
  override async fetchMore(abortSignal: AbortSignal): Promise<SpaceUploadItemExtend[] | undefined> {
    await this.setPageTitle()

    const { items, hasMore, endVol } = await getSpaceUpload({
      mid: this.mid,
      order: this.order,
      pagenum: this.page,
      keyword: this.searchText || '',
    })

    this.hasMoreExceptQueue = hasMore
    this.page++

    let list: SpaceUploadItemExtend[] = items.map((item, index) => {
      return {
        ...item,
        api: EApiType.SpaceUpload,
        uniqId: `${EApiType.SpaceUpload}-${item.bvid}`,
        vol: endVol - index,
      }
    })

    // 直接去除"充电专属", 但保留它们的序号
    list = list.filter((item) => !isSpaceUploadItemChargeOnly(item))

    if (this.filterText) {
      const { includes, excludes } = parseSearchInput(this.filterText)
      list = list.filter((item) => {
        return (
          includes.every((include) => item.title.includes(include)) &&
          excludes.every((exclude) => !item.title.includes(exclude))
        )
      })
    }

    await this.fetchAvatars(list.map((item) => item.mid.toString()))
    return list
  }
}
