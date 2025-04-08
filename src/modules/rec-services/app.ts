import { HOST_APP } from '$common'
import { getFollowedStatus } from '$components/VideoCard/process/filter'
import type { IVideoCardData } from '$components/VideoCard/process/normalize'
import { isAppRecommend, type AppRecItem, type AppRecItemExtend, type RecItemType } from '$define'
import type { ipad } from '$define/app-recommend.ipad'
import { EApiType, EAppApiDevice } from '$define/index.shared'
import { getVideoDetail } from '$modules/bilibili/video/video-detail'
import { getSettingsSnapshot } from '$modules/settings'
import { gmrequest } from '$request'
import { getHasLogined } from '$utility/cookie'
import dayjs from 'dayjs'
import { randomInt, range, shuffle, uniqBy } from 'es-toolkit'
import { times } from 'es-toolkit/compat'
import ms from 'ms'
import { BaseTabService, type IService } from './_base'
import { DynamicFeedRecService, getDynamicFeedServiceConfig } from './dynamic-feed'
import { createDfStore } from './dynamic-feed/store'
import { FavRecService, getFavServiceConfig, type FavServiceConfig } from './fav'
import { FavItemsOrder } from './fav/fav-enum'
import { WatchlaterRecService } from './watchlater'
import { WatchlaterItemsOrder } from './watchlater/watchlater-enum'

type AppRecServiceConfig = ReturnType<typeof getAppRecServiceConfig>

export function getAppRecServiceConfig() {
  const snap = getSettingsSnapshot().appRecommend

  let deviceParamForApi: EAppApiDevice = snap.deviceParamForApi
  if (!Object.values(EAppApiDevice).includes(deviceParamForApi)) {
    deviceParamForApi = EAppApiDevice.ipad
  }

  return {
    deviceParamForApi,
    addOtherTabContents: snap.addOtherTabContents,
  }
}

export class AppRecService extends BaseTabService<RecItemType> {
  static readonly PAGE_SIZE = 20

  override usageInfo = undefined

  innerService: AppRecInnerService
  allServices: IService[] = []
  otherTabServices: IService[] = []
  constructor(public config: AppRecServiceConfig) {
    super(AppRecService.PAGE_SIZE)
    this.innerService = new AppRecInnerService(this.config.deviceParamForApi)
    this.allServices = [this.innerService]
    this.initOtherTabServices()
  }

  initOtherTabServices() {
    if (!getHasLogined()) return
    if (!this.config.addOtherTabContents) return

    let dynamicFeedService: IService
    let favService: IService
    let watchlaterService: IService
    {
      const store = createDfStore()
      store.upMid = undefined
      store.selectedGroupId = undefined
      const config = getDynamicFeedServiceConfig(store)
      Object.assign(config, {
        showLiveInDynamicFeed: true,
        whenViewAllEnableHideSomeContents: false,
        searchCacheEnabled: false,
      } satisfies Partial<typeof config>)
      dynamicFeedService = new DynamicFeedRecService(config)
    }
    {
      const config = Object.assign(getFavServiceConfig(), {
        selectedKey: 'all',
        itemsOrder: FavItemsOrder.Shuffle,
        selectedFavFolderId: undefined,
        selectedFavCollectionId: undefined,
        addSeparator: false,
      } satisfies Partial<FavServiceConfig>)
      favService = new FavRecService(config)
    }
    {
      watchlaterService = new WatchlaterRecService(WatchlaterItemsOrder.AddTimeDesc, false)
    }
    this.otherTabServices = [dynamicFeedService, favService, watchlaterService]

    const allServices: IService[] = []
    const rate = 7 / 3
    allServices.push(...this.otherTabServices)
    times(Math.round(rate * this.otherTabServices.length), () =>
      allServices.push(this.innerService),
    )
    this.allServices = shuffle(allServices)
  }

  override get hasMore() {
    return (
      !!this.qs.bufferQueue.length ||
      this.innerService.hasMore ||
      this.otherTabServices.some((s) => s.hasMore)
    )
  }

  override hasMoreExceptQueue = true

  // this is not used, since below `override loadMore`
  override fetchMore(abortSignal: AbortSignal): Promise<RecItemType[] | undefined> {
    throw new Error('Method not implemented.')
  }

  override async loadMore(abortSignal: AbortSignal) {
    if (!this.hasMore) return

    // fill if needed
    while (this.hasMore && this.qs.bufferQueue.length < AppRecService.PAGE_SIZE * 3) {
      const restServices = this.allServices.filter((s) => s.hasMore)
      if (!restServices.length) break
      const pickedServices = shuffle(restServices).slice(0, 3)
      const more = (
        await Promise.all(pickedServices.map(async (s) => (await s.loadMore(abortSignal)) || []))
      )
        .flat()
        .filter((x) => x.api !== EApiType.Separator)
      this.qs.bufferQueue.push(...more)
      this.qs.bufferQueue = shuffle(this.qs.bufferQueue)
    }

    // slice
    return this.qs.sliceFromQueue()
  }

  // for filter
  async loadMoreBatch(abortSignal: AbortSignal, times: number) {
    if (!this.hasMore) return
    if (this.qs.bufferQueue.length) return this.qs.sliceFromQueue(times)
    return this.qs.doReturnItems(await this.innerService.getRecommendTimes(abortSignal, times))
  }
}

class AppRecInnerService implements IService {
  // 无法指定, 16 根据返回得到
  static PAGE_SIZE = 16

  constructor(public deviceParamForApi: EAppApiDevice) {}

  hasMore = true

  private async getRecommend(device: EAppApiDevice) {
    let platformParams: Record<string, string | number> = {}
    if (device === EAppApiDevice.android) {
      platformParams = { mobi_app: 'android' }
    }
    if (device === EAppApiDevice.ipad) {
      // has avatar, date, etc. see BewlyBewly's usage
      platformParams = { mobi_app: 'iphone', device: 'pad' }
    }

    // /x/feed/index
    const res = await gmrequest.get(HOST_APP + '/x/v2/feed/index', {
      timeout: 20_000,
      responseType: 'json',
      params: {
        build: '1',
        ...platformParams,
        // idx: 返回的 items.idx 为传入 idx+1, idx+2, ...
        idx: Math.floor(Date.now() / 1000) + randomInt(1000),
      },
    })
    const json = res.data as ipad.AppRecommendJson

    // request fail
    if (!json.data) {
      throw new Error('Request fail with none invalid json', {
        cause: {
          type: 'invalid-json',
          statusCode: res.status,
          json,
        },
      })
    }

    const items = json?.data?.items || []
    return items
  }

  loadMore(abortSignal: AbortSignal, times = 2) {
    return this.getRecommendTimes(abortSignal, times)
  }

  // 一次不够, 多来几次
  async getRecommendTimes(abortSignal: AbortSignal, times: number) {
    let list: AppRecItem[] = (
      await Promise.all(range(times).map(() => this.getRecommend(this.deviceParamForApi)))
    ).flat()

    // rm ad & unsupported card_type
    list = list.filter((item) => {
      // ad
      if (item.card_goto?.includes('ad')) return false
      if (item.goto?.includes('ad')) return false
      if ((item as any).ad_info) return false

      // unsupported: bannner
      if ((item.card_goto as string | undefined) === 'banner') return false

      // 充电专属
      // 特征: 没有 player_args
      if (item.goto === 'av' && typeof item.player_args === 'undefined') return false

      return true
    })

    // unique in method level
    list = uniqBy(list, (item) => item.param)

    // add uuid
    // add api
    const extendedList = list.map((item) => {
      return {
        ...item,
        api: EApiType.AppRecommend,
        uniqId: `${EApiType.AppRecommend}-${item.param}`,
        device: this.deviceParamForApi, // android | ipad
      } as AppRecItemExtend
    })

    return extendedList
  }
}

/**
 * 已关注作为重要的推荐理由, 值得使用详情 API 补充时间
 */
export async function fetchAppRecommendFollowedPubDate(
  item: RecItemType,
  cardData: IVideoCardData,
) {
  const { bvid, goto, recommendReason } = cardData
  const isNormalVideo = goto === 'av'
  const shouldFetch =
    isAppRecommend(item) &&
    item.device === EAppApiDevice.ipad &&
    isNormalVideo &&
    !!bvid &&
    getFollowedStatus(recommendReason)
  if (!shouldFetch) return

  const detail = await getVideoDetail(bvid)
  const ts = detail?.pubdate
  if (!ts) return
  return customFormat(ts)
}

function customFormat(ts: number) {
  if (!ts) return undefined
  const t = dayjs.unix(ts)

  const FORMAT_YEAR = 'YYYY'
  const FORMAT_DATE = 'YYYY-MM-DD'
  const isToday = t.format(FORMAT_DATE) === dayjs().format(FORMAT_DATE)
  const isTodayRecent = isToday && Date.now() - ts * 1000 <= ms('12h')
  const isYesterday = t.format(FORMAT_DATE) === dayjs().subtract(1, 'day').format(FORMAT_DATE)
  const isCurrentYear = t.format(FORMAT_YEAR) === dayjs().format(FORMAT_YEAR)

  if (isTodayRecent) {
    const minutes = dayjs().diff(t, 'minutes')
    const hours = dayjs().diff(t, 'hours')
    if (minutes < 60) {
      return `${minutes}分钟前`
    } else {
      return `${hours}小时前`
    }
  }

  if (isToday) return t.format('今天 HH:mm')
  if (isYesterday) return t.format('昨天 HH:mm')

  if (isCurrentYear) {
    return t.format('M月D日')
  } else {
    return t.format('YYYY年M月D日')
  }
}
