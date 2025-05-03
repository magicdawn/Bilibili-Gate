import { baseDebug } from '$common'
import type { PcRecItem, PcRecItemExtend, PcRecommendJson } from '$define'
import { EApiType } from '$define/index.shared'
import { PcRecGoto } from '$define/pc-recommend'
import { isWebApiSuccess, request } from '$request'
import toast from '$utility/toast'
import { range, uniqBy } from 'es-toolkit'
import { BaseTabService } from './_base'

const debug = baseDebug.extend('modules:rec-services:pc')

/**
 * 使用 web api 获取推荐
 *
 * 分区首页
 * /x/web-interface/index/top/rcmd
 * /x/web-interface/wbi/index/top/rcmd
 *
 * Feed流首页(多一个 feed)
 * /x/web-interface/wbi/index/top/feed/rcmd
 * 同时会掺和
 *  - 直播 https://api.live.bilibili.com/xlive/web-interface/v1/webMain/getMoreRecList
 *  - PGC 内容
 *    - https://api.bilibili.com/pgc/web/variety/feed?cursor=0&page_size=14&web_location=333.1007
 *    - https://api.bilibili.com/pgc/web/timeline/v2?day_before=4&day_after=2&season_type=4&web_location=333.1007
 *    - https://api.bilibili.com/pgc/web/timeline/v2?day_before=4&day_after=2&season_type=1&web_location=333.1007
 */

let _id = 0
const genUniqId = () => Date.now() + _id++

export class PcRecService extends BaseTabService<PcRecItemExtend> {
  static PAGE_SIZE = 14
  override usageInfo = undefined

  constructor(public isKeepFollowOnly: boolean) {
    super(PcRecService.PAGE_SIZE)
  }

  override fetchMore(abortSignal: AbortSignal): Promise<PcRecItemExtend[] | undefined> {
    const times = this.isKeepFollowOnly ? 5 : 2
    return this.getRecommendTimes(times, abortSignal)
  }

  // for filter
  async loadMoreBatch(times: number, abortSignal: AbortSignal) {
    if (!this.hasMore) return
    if (this.qs.bufferQueue.length) return this.qs.sliceFromQueue(times)
    return this.qs.doReturnItems(await this.getRecommendTimes(times, abortSignal))
  }

  private async getRecommendTimes(times: number, abortSignal: AbortSignal) {
    let list: PcRecItem[] = (await Promise.all(range(times).map(() => this.getRecommend(abortSignal)))).flat()

    list = list.filter((item) => {
      const allowedGotoList = [PcRecGoto.AV, PcRecGoto.Live]
      if (!allowedGotoList.includes(item.goto)) {
        const knownDisabledGotoList = [PcRecGoto.Ad]
        if (!knownDisabledGotoList.includes(item.goto)) {
          debug('uknown goto: %s %o', item.goto, item)
        }
        return false
      }
      return true
    })

    list = uniqBy(list, (item) => item.id)

    // 推荐理由补全
    list.forEach((item) => {
      if (item.rcmd_reason?.reason_type === 1) {
        item.rcmd_reason.content ||= '已关注'
      }
    })

    const _list = list.map((item) => {
      return {
        ...item,
        uniqId: `${EApiType.PcRecommend}-${item.bvid || item.room_info?.room_id || crypto.randomUUID()}`,
        api: EApiType.PcRecommend,
      } as PcRecItemExtend
    })
    return _list
  }

  page = 0
  override hasMoreExceptQueue = true
  private async getRecommend(abortSignal: AbortSignal) {
    const curpage = ++this.page // this has parallel call, can not ++ after success

    // https://socialsisteryi.github.io/bilibili-API-collect/docs/video/recommend.html#获取首页视频推荐列表-web端
    const url = '/x/web-interface/wbi/index/top/feed/rcmd'
    const params = {
      web_location: 1430650,
      feed_version: 'V8',
      homepage_ver: 1,
      fresh_type: 4,
      y_num: 5,
      last_y_num: 5,
      fresh_idx_1h: curpage,
      fresh_idx: curpage,
      uniq_id: genUniqId(),
      ps: 12,
    }

    const res = await request.get(url, { signal: abortSignal, params })
    const json = res.data as PcRecommendJson

    if (!isWebApiSuccess(json)) {
      /** code: -62011, data: null, message: "暂时没有更多内容了", ttl: 1 */
      if (json.code === -62011 && json.message === '暂时没有更多内容了') {
        this.hasMoreExceptQueue = false
        return []
      }
    }

    if (!json.data?.item) {
      toast(json.message || 'API 请求没有返回结果')
    }
    const items = json.data?.item || []
    return items
  }
}
