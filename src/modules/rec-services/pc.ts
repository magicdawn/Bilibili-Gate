import type { PcRecItem, PcRecItemExtend, PcRecommendJson } from '$define'
import { EApiType } from '$define/index.shared'
import { isWebApiSuccess, request } from '$request'
import toast from '$utility/toast'
import { uniqBy } from 'es-toolkit'
import { BaseTabService } from './_base'

/**
 * 使用 web api 获取推荐
 */

let _id = 0
const uniqId = () => Date.now() + _id++

export class PcRecService extends BaseTabService<PcRecItemExtend> {
  static PAGE_SIZE = 14
  override usageInfo = undefined

  constructor(public isKeepFollowOnly: boolean) {
    super(PcRecService.PAGE_SIZE)
    this.isKeepFollowOnly = isKeepFollowOnly
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
    let list: PcRecItem[] = []

    const parallel = async () => {
      list = (
        await Promise.all(new Array(times).fill(0).map(() => this.getRecommend(abortSignal)))
      ).flat()
    }
    const sequence = async () => {
      for (let x = 1; x <= times; x++) {
        list = list.concat(await this.getRecommend(abortSignal))
      }
    }

    await (true ? parallel : sequence)()

    list = list.filter((item) => {
      const goto = item.goto as string

      // ad
      if (goto === 'ad') return false
      if (goto.includes('ad')) return false

      // can't handle for now
      if (goto === 'live') return false

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
        uniqId: item.id + '-' + crypto.randomUUID(),
        api: EApiType.PcRecommend,
      } as PcRecItemExtend
    })
    return _list
  }

  page = 0
  override hasMoreExceptQueue = true
  private async getRecommend(abortSignal: AbortSignal) {
    const curpage = ++this.page // this has parallel call, can not ++ after success

    let url: string
    let params: Record<string, string | number>

    // 分区首页
    // /x/web-interface/index/top/rcmd
    // /x/web-interface/wbi/index/top/rcmd
    /** fresh_type: 3,
        version: 1,
        ps: PcRecService.PAGE_SIZE, // >14 errors
        fresh_idx: curpage,
        fresh_idx_1h: curpage,
        homepage_ver: 1,
     */
    url = '/x/web-interface/wbi/index/top/rcmd'
    params = {
      fresh_type: 3,
      version: 1,
      ps: PcRecService.PAGE_SIZE, // >14 errors
      fresh_idx: curpage,
      fresh_idx_1h: curpage,
      homepage_ver: 1,
    }

    // feed 推荐流首页
    // /x/web-interface/wbi/index/top/feed/rcmd
    // url = '/x/web-interface/wbi/index/top/feed/rcmd'
    // params = {
    //   web_location: 1430650,
    //   fresh_type: 4,
    //   feed_version: 'V_WATCHLATER_PIP_WINDOW',
    //   fresh_idx_1h: curpage,
    //   fresh_idx: curpage,
    //   homepage_ver: 1,
    //   ps: PcRecService.PAGE_SIZE,
    //   uniq_id: uniqId(),
    //   brush: 1,
    //   fetch_row: 4,
    //   y_num: 4,
    //   last_y_num: 5,
    //   // screen: '2048-667',
    //   // seo_info: '',
    //   // last_showlist:
    //   //   'av_1251147478,av_1801357236,av_1002155115,av_1751950975,ad_n_5614,av_1402131443,av_n_1901089350,av_n_1851727201,av_n_1751712626,av_n_1251359542',
    // }

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
