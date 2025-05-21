/**
 * extract from https://s1.hdslb.com/bfs/static/jinkela/popular/popular.b128b0b3cb90b22d5e3fb2b560dfb4b675102274.js
 */

import { uniqBy } from 'es-toolkit'
import { appError } from '$common'
import { getGroupFromKvRecord, getKvData } from '$modules/bilibili/kv'
import type { RankItemExtend, RankItemExtendProps } from '$define'
import { STATIC_RANK_TABS } from './rank-tab-static'
import type { NormalRankItem, PgcSeasonRankItem, PgcWebRankItem } from './types'

export const defaultRankTab: IRankTab = {
  name: '全站',
  tid: 0,
  slug: 'all',
}

export type IRankTab = {
  tid: number
  name: string
  slug: string
  season_type?: number
  type?: string
}

export async function getRankTabsConfig() {
  try {
    return (await parseRankTabsConfig()) || STATIC_RANK_TABS
  } catch (e) {
    appError('parseRankTabsConfig failed', e)
    return STATIC_RANK_TABS
  }
}

async function parseRankTabsConfig() {
  const _raw = await getKvData({ appKey: '333.1339', nscode: 10 })
  const record = getGroupFromKvRecord(_raw, 'channel_list')

  const popular_page_sort = JSON.parse(record.popular_page_sort || '') as string[]
  if (!popular_page_sort.length) return

  const list: IRankTab[] = []
  const push = (obj: any) => {
    list.push({
      tid: (obj.tid || 0) as number,
      name: obj.name as string,
      slug: obj.route as string,
      season_type: (obj.seasonType || 0) as number,
      type: obj.route as string,
    })
  }

  for (const slug of popular_page_sort) {
    if (!record[slug]) continue
    const obj = JSON.parse(record[slug])
    push(obj)
  }

  return uniqBy(list, (x) => x.slug)
}

export enum ERankApiType {
  Normal = 'normal',
  PgcSeason = 'pgc/season',
  PgcWeb = 'pgc/web',
}

export function getRankTabRequestConfig(rankTab: IRankTab): { apiType: ERankApiType; url: string } {
  /*
   original obfuscated code:
   !["anime", "guochuang", "documentary", "movie", "tv", "variety"].includes(null == o ? void 0 : o.type)) {
        e.next = 26;
        break
      }
      return l = o.season_type,
      s = "".concat(N, "/pgc/web/rank/list?day=").concat(3, "&season_type=").concat(l),
      (u = -1 !== [2, 3, 4, 5, 7].indexOf(l)) && (s = "".concat(N, "/pgc/season/rank/web/list?day=").concat(3, "&season_type=").concat(l)),
      d = u ? "pgc.gateway.season" : "pgc.gateway.web",
      e.next = 14,
      J(s, {}, {
        headers: (null == n ? void 0 : n.headers) || {},
        surl: (null == n || null === (i = n.surl) || void 0 === i ? void 0 : i[d]) || ""
      });
   */

  if (!['anime', 'guochuang', 'documentary', 'movie', 'tv', 'variety'].includes(rankTab.type || '')) {
    return { apiType: ERankApiType.Normal, url: `/x/web-interface/ranking/v2?rid=${rankTab.tid}&type=all` }
  }

  const { season_type } = rankTab
  const query = `?day=3&season_type=${season_type}`

  let url = `/pgc/web/rank/list${query}`
  let apiType = ERankApiType.PgcWeb
  if (season_type && [2, 3, 4, 5, 7].includes(season_type)) {
    url = `/pgc/season/rank/web/list${query}`
    apiType = ERankApiType.PgcSeason
  }

  return { apiType, url }
}

/**
 * item predicate
 */
export function isNormalRankItem(item: RankItemExtend): item is NormalRankItem & RankItemExtendProps {
  return item.from === ERankApiType.Normal
}
export function isPgcSeasonRankItem(item: RankItemExtend): item is PgcSeasonRankItem & RankItemExtendProps {
  return item.from === ERankApiType.PgcSeason
}
export function isPgcWebRankItem(item: RankItemExtend): item is PgcWebRankItem & RankItemExtendProps {
  return item.from === ERankApiType.PgcWeb
}
