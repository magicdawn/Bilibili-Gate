import { Picture } from '$components/_base/Picture'
import { defineCardTags } from '$components/VideoCard/card-tags'
import { defineStatItems } from '$components/VideoCard/stat-item'
import { EApiType } from '$enums'
import { parseCount, parseDuration } from '$utility/video'
import { DynamicFeedBadgeText } from '../store'
import { DynamicFeedEnums } from './enums'
import type { ReactNode } from 'react'
import type { IVideoCardData } from '$modules/filter/normalize'
import type { DynamicFeedItem } from './types'

export function dynamicFeedDetectAd(item: DynamicFeedItem): boolean {
  const { major, additional } = item.modules.module_dynamic

  // "UP主的推荐" 带货
  if (additional?.type === DynamicFeedEnums.AdditionalType.Goods) return true

  // 外卖红包: https://www.bilibili.com/opus/1160909044283605014
  // 可以使用 `setttings.filter.dfByTitle.keywords` 过滤, 但这里还是内置这个
  if (major?.type === DynamicFeedEnums.MajorType.Opus) {
    const title = major.opus.title || ''
    if (['B站密令', '大红包'].some((keyword) => title.includes(keyword))) {
      return true
    }
  }

  return false
}

export function normalizeDynamicFeedItem(item: DynamicFeedItem): IVideoCardData | undefined {
  // ad
  if (dynamicFeedDetectAd(item)) return
  // no major
  const major = item.modules.module_dynamic.major
  if (!major) return

  const author = item.modules.module_author
  const additional = item.modules.module_dynamic.additional
  const majorType = major.type

  const sharedCardData = {
    authorName: author.name,
    authorFace: author.face,
    authorMid: author.mid.toString(),
    followed: author.following,
    pubts: author.pub_ts,

    // 动态自身的 stat
    statItems: defineStatItems([
      { field: 'like', value: item.modules.module_stat.like.count },
      { field: 'dynamic-feed:comment', value: item.modules.module_stat.comment.count },
      { field: 'dynamic-feed:forward', value: item.modules.module_stat.forward.count },
    ]),

    recommendReason: author.pub_action,
  } as const satisfies Partial<IVideoCardData>

  const defineSingleCardTag = (text: ReactNode) => {
    return defineCardTags([{ key: `${EApiType.DynamicFeed}:tag`, text }])
  }

  if (majorType === DynamicFeedEnums.MajorType.Archive && major.archive) {
    const v = major.archive
    return {
      ...sharedCardData,

      // video
      avid: v.aid,
      bvid: v.bvid,
      // cid: v.
      goto: 'av',
      href: `/video/${v.bvid}/`,
      title: v.title,
      cover: v.cover,
      duration: parseDuration(v.duration_text) || 0,
      durationStr: v.duration_text,

      // 「投稿视频」显示 recommendReason, 其他显示 tag
      recommendReason: v.badge.text === DynamicFeedBadgeText.Upload ? v.badge.text : undefined,
      cardTags: defineCardTags([
        v.badge.text === DynamicFeedBadgeText.Upload
          ? undefined
          : {
              key: `${EApiType.DynamicFeed}:tag`,
              icon: v.badge.icon_url ? (
                <Picture src={`${v.badge.icon_url}@!web-dynamic`} className='size-14px' />
              ) : undefined,
              text: v.badge.text,
            },
      ]),

      // stat
      statItems: defineStatItems([
        { field: 'play', value: v.stat.play },
        { field: 'danmaku', value: v.stat.danmaku },
      ]),
      play: parseCount(v.stat.play),
      danmaku: parseCount(v.stat.danmaku),
    }
  }

  if (majorType === DynamicFeedEnums.MajorType.Opus && major.opus) {
    const { opus } = major
    const isReserve = additional?.type === DynamicFeedEnums.AdditionalType.Reserve
    const isLiveReserve = isReserve && /直播预告/.test(additional.reserve.title)
    const hasPic = !!opus.pics?.length
    const cardTagText: string | undefined = (() => {
      if (isLiveReserve) return '直播预告'
      if (isReserve) return additional.reserve.title?.split('：')[0] || '预约'
      // DynamicFeedEnums.ItemType.Draw | Article | Word 不知道有啥区别?
      if (item.type === DynamicFeedEnums.ItemType.Word) return '文字动态'
      if (item.type === DynamicFeedEnums.ItemType.Draw) return hasPic ? '图片' : '文字动态'
      if (item.type === DynamicFeedEnums.ItemType.Article) return '专栏'
    })()

    return {
      ...sharedCardData,
      goto: 'opus',
      href: opus.jump_url,
      cover: opus.pics?.[0]?.url,
      title: opus.title || opus.summary?.text || '',
      cardTags: defineSingleCardTag(cardTagText),
    }
  }

  if (majorType === DynamicFeedEnums.MajorType.Pgc && major.pgc) {
    const { pgc } = major
    return {
      ...sharedCardData,
      cover: pgc.cover,
      goto: 'bangumi',
      href: pgc.jump_url,
      title: pgc.title,
      statItems: defineStatItems([
        { field: 'play', value: pgc.stat.play },
        { field: 'danmaku', value: pgc.stat.danmaku },
      ]),
      cardTags: defineSingleCardTag(author.label), // 纪录片)
      pubts: author.pub_ts, // 0
      pubdateDisplay: author.pub_time, // pub_ts 为 0, 不可用
    }
  }

  if (majorType === DynamicFeedEnums.MajorType.UgcSeason && major.ugc_season) {
    const { ugc_season } = major
    return {
      ...sharedCardData,
      bvid: ugc_season.bvid,
      avid: ugc_season.aid.toString(),
      goto: 'av',
      duration: parseDuration(ugc_season.duration_text),
      durationStr: ugc_season.duration_text,
      cover: ugc_season.cover,
      href: `/video/${ugc_season.bvid}/`,
      title: ugc_season.title,

      statItems: defineStatItems([
        { field: 'play', value: ugc_season.stat.play },
        { field: 'danmaku', value: ugc_season.stat.danmaku },
      ]),
      play: parseCount(ugc_season.stat.play),
      danmaku: parseCount(ugc_season.stat.danmaku),

      recommendReason: author.pub_action,
      cardTags: defineSingleCardTag('合集'),

      // AuthorTypeUgcSeason 里 mid 其实是 avid .... 不知道咋整
      authorMid: undefined,
    }
  }

  // DYNAMIC_TYPE_FORWARD: 这个咋处理?
  // DYNAMIC_TYPE_LIVE_RCMD: 动态支持了直播中, 这个没必要了
}
