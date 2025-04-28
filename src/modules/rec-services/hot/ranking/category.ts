/**
 * extract from https://s1.hdslb.com/bfs/static/jinkela/popular/popular.dde4e174100382a65855d76269b39d174d847e31.js
 */

import type { RankingItemExtend, RankingItemExtendProps } from '$define'
import { groupBy } from 'es-toolkit'
import type { Merge, SetOptional } from 'type-fest'
import type { BangumiRankingItem, CinemaRankingItem, NormalRankingItem } from './types'

// /x/web-interface/ranking/v2?rid=0&type=all
export type NormalCategory = {
  name: string
  tid: number
  slug: string
  rank_type?: string // origin | rookie | empty(all)
  type?: undefined
}

// 番剧 /pgc/web/rank/list?day=3&season_type=1
export type BangumiCategory = Merge<
  NormalCategory,
  {
    type: 'bangumi'
    season_type: number
  }
>

// 纪录片 /pgc/season/rank/web/list?day=3&season_type=3
export type CinemaCategory = Merge<
  SetOptional<NormalCategory, 'tid'>,
  {
    type: 'cinema'
    season_type: number
  }
>

export type Category = NormalCategory | BangumiCategory | CinemaCategory

export type CategoryType = Category['type']

/**
 * category predicate
 */
export function isBangumiCategory(c: Category): c is BangumiCategory {
  return c.type === 'bangumi'
}
export function isCinemaCategory(c: Category): c is CinemaCategory {
  return c.type === 'cinema'
}
export function isNormalCategory(c: Category): c is NormalCategory {
  return !isBangumiCategory(c) && !isCinemaCategory(c)
}

/**
 * item predicate
 */
export function isNormalRankingItem(item: RankingItemExtend): item is NormalRankingItem & RankingItemExtendProps {
  const c = RANKING_CATEGORIES_MAP[item.slug]
  return isNormalCategory(c)
}
export function isBangumiRankingItem(item: RankingItemExtend): item is BangumiRankingItem & RankingItemExtendProps {
  const c = RANKING_CATEGORIES_MAP[item.slug]
  return isBangumiCategory(c)
}
export function isCinemaRankingItem(item: RankingItemExtend): item is CinemaRankingItem & RankingItemExtendProps {
  const c = RANKING_CATEGORIES_MAP[item.slug]
  return isCinemaCategory(c)
}

export function getRequestUrl(c: Category) {
  if (c.type === 'bangumi') {
    // 国产动画是个另类
    if ((c.slug as CategorySlug) === 'guochan') {
      return `/pgc/season/rank/web/list?day=3&season_type=${c.season_type}`
    }
    return `/pgc/web/rank/list?day=3&season_type=${c.season_type}`
  }
  if (c.type === 'cinema') {
    return `/pgc/season/rank/web/list?day=3&season_type=${c.season_type}`
  }
  return `/x/web-interface/ranking/v2?rid=${c.tid}&type=${c.rank_type || 'all'}`
}

const arr = [
  { name: '全站', tid: 0, slug: 'all' },
  { name: '番剧', type: 'bangumi', tid: 13, slug: 'bangumi', season_type: 1 },
  { name: '国产动画', type: 'bangumi', tid: 168, slug: 'guochan', season_type: 4 },
  { name: '国创相关', tid: 168, slug: 'guochuang' },
  { name: '纪录片', type: 'cinema', slug: 'documentary', tid: 177, season_type: 3 },
  { name: '动画', tid: 1, slug: 'douga' },
  { name: '音乐', tid: 3, slug: 'music' },
  { name: '舞蹈', tid: 129, slug: 'dance' },
  { name: '游戏', tid: 4, slug: 'game' },
  { name: '知识', tid: 36, slug: 'knowledge' },
  { name: '科技', tid: 188, slug: 'tech' },
  { name: '运动', tid: 234, slug: 'sports' },
  { name: '汽车', tid: 223, slug: 'car' },
  { name: '生活', tid: 160, slug: 'life' },
  { name: '美食', tid: 211, slug: 'food' },
  { name: '动物圈', tid: 217, slug: 'animal' },
  { name: '鬼畜', tid: 119, slug: 'kichiku' },
  { name: '时尚', tid: 155, slug: 'fashion' },
  { name: '娱乐', tid: 5, slug: 'ent' },
  { name: '影视', tid: 181, slug: 'cinephile' },
  { name: '电影', type: 'cinema', slug: 'movie', tid: 23, season_type: 2 },
  { name: '电视剧', type: 'cinema', slug: 'tv', tid: 11, season_type: 5 },
  { name: '综艺', type: 'cinema', slug: 'variety', season_type: 7 },
  { name: '原创', slug: 'origin', tid: 0, rank_type: 'origin' },
  { name: '新人', slug: 'rookie', tid: 0, rank_type: 'rookie' },
] as const satisfies ReadonlyArray<Category>

export type CategorySlug = (typeof arr)[number]['slug']

export const RANKING_CATEGORIES = arr as ReadonlyArray<Category>

export const RANKING_CATEGORIES_MAP: Record<CategorySlug, Category> = RANKING_CATEGORIES.reduce(
  (map, c) => {
    map[c.slug as CategorySlug] = c
    return map
  },
  {} as Record<CategorySlug, Category>,
)

export const RANKING_CATEGORIES_GROUPDED = groupBy(RANKING_CATEGORIES, (x) => x.type || 'normal') as Record<
  NonNullable<CategoryType | 'normal'>,
  Category[]
>
