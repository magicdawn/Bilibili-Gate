import { SwitchSettingItem } from '$components/ModalSettings/setting-item'
import { useOnRefreshContext } from '$components/RecGrid/useRefresh'
import { CustomTargetLink } from '$components/VideoCard/use/useOpenRelated'
import { EApiType } from '$define/index.shared'
import { request } from '$request'
import dayjs from 'dayjs'
import { delay, shuffle } from 'es-toolkit'
import pmap from 'promise.map'
import { QueueStrategy } from '../_base'
import type { IService } from '../_base'
import type { ItemsSeparator, PopularWeeklyItemExtend } from '$define'
import type { PopularWeeklyJson } from '$define/popular-weekly'
import type { PopularWeeklyListItem, PopularWeeklyListJson } from '$define/popular-weekly.list'

let episodes: PopularWeeklyListItem[] = []
let cacheKey = ''

// 每周五晚 18:00 更新
function genCacheKey() {
  const now = dayjs()
  return [now.format('YYYYMMDD'), now.hour() < 18 ? 'lt-18' : 'gte-18'].join('_')
}

async function getEpisodeList() {
  const useCache = episodes.length && cacheKey && cacheKey === genCacheKey()
  if (useCache) return episodes

  const res = await request.get('/x/web-interface/popular/series/list')
  const json = res.data as PopularWeeklyListJson
  const list = json.data.list

  episodes = list
  cacheKey = genCacheKey()
  return episodes
}

export function isWeekendForPopularWeekly() {
  const d = dayjs()
  return d.day() === 6 || d.day() === 0 || (d.day() === 5 && d.hour() >= 18)
}

export class PopularWeeklyRecService implements IService {
  static PAGE_SIZE = 20

  episodesLoaded = false
  episodes: PopularWeeklyListItem[] = []
  constructor(private useShuffle: boolean) {}

  // full-list = returnedItems + bufferQueue + more
  qs = new QueueStrategy<PopularWeeklyItemExtend | ItemsSeparator>(PopularWeeklyRecService.PAGE_SIZE)

  get hasMore() {
    if (!this.episodesLoaded) return true // not loaded yet
    return !!this.qs.bufferQueue.length || !!this.episodes.length
  }

  async loadMore() {
    // load ep list
    if (!this.episodesLoaded) {
      this.episodes = await getEpisodeList()
      this.episodesLoaded = true
      if (this.useShuffle) this.episodes = shuffle(this.episodes)
    }

    if (!this.hasMore) return

    /**
     * no shuffle
     */

    if (!this.useShuffle) {
      // from queue
      if (this.qs.bufferQueue.length) return this.qs.sliceFromQueue()

      // fill queue
      const ep = this.episodes[0]
      const epNum = ep.number
      const items = await fetchWeeklyItems(epNum)
      this.qs.bufferQueue.push(
        {
          api: EApiType.Separator,
          uniqId: `popular-weekly-separator-${epNum}`,
          content: (
            <CustomTargetLink href={`https://www.bilibili.com/v/popular/weekly?num=${epNum}`}>
              {ep.name}
            </CustomTargetLink>
          ),
        },
        ...items,
      )
      this.episodes = this.episodes.slice(1) // consume 1

      return this.qs.sliceFromQueue()
    }

    /**
     * shuffle
     */

    // make queue enough
    const prefetchPage = 5
    while (this.qs.bufferQueue.length < PopularWeeklyRecService.PAGE_SIZE * prefetchPage && this.episodes.length) {
      this.episodes = shuffle(this.episodes)
      const episodes = this.episodes.slice(0, prefetchPage) // slice
      this.episodes = this.episodes.slice(prefetchPage) // rest

      // 小心风控, code: -352, 需要去热门页面点验证码
      const fetched = await pmap(
        episodes.map((x) => x.number),
        (episodeNum) => fetchWeeklyItems(episodeNum),
        2,
      )

      this.qs.bufferQueue = shuffle([...this.qs.bufferQueue, ...fetched.flat()])
    }

    return this.qs.sliceFromQueue()
  }

  get usageInfo() {
    return <PopularWeeklyUsageInfo />
  }
}

/**
 * 每期必看, 应该不会变吧~
 */

const cache: Record<number, PopularWeeklyItemExtend[]> = {}

async function fetchWeeklyItems(episodeNum: number) {
  if (!cache[episodeNum]?.length) {
    const res = await request.get('/x/web-interface/popular/series/one', {
      params: { number: episodeNum },
    })
    const json = res.data as PopularWeeklyJson
    const items = (json.data.list || []).map((item) => {
      const extended: PopularWeeklyItemExtend = {
        ...item,
        api: EApiType.PopularWeekly,
        uniqId: `${EApiType.PopularWeekly}-${item.bvid}`,
      }
      return extended
    })

    cache[episodeNum] = items
  }
  const items = cache[episodeNum]
  return items
}

function PopularWeeklyUsageInfo() {
  const onRefresh = useOnRefreshContext()
  return (
    <>
      <SwitchSettingItem
        configPath={'popularWeeklyUseShuffle'}
        checkedChildren='随机顺序: 开'
        unCheckedChildren='随机顺序: 关'
        extraAction={async () => {
          await delay(100)
          onRefresh?.()
        }}
      />
    </>
  )
}
