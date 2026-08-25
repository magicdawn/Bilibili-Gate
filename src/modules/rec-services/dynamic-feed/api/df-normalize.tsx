import { Picture } from '$components/_base/Picture'
import { defineCardBadges } from '$components/VideoCard/card-badges'
import { defineStatItems } from '$components/VideoCard/stat-item'
import { EApiType } from '$enums'
import { AntdTooltip } from '$modules/antd/custom'
import { IconForForward } from '$modules/icon'
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

  const major = item.modules.module_dynamic.major
  const author = item.modules.module_author
  const additional = item.modules.module_dynamic.additional

  const sharedCardData = {
    authorName: author.name,
    authorFace: author.face,
    authorMid: author.mid.toString(),
    followed: Boolean(author.following),
    pubts: author.pub_ts,

    // 动态自身的 stat
    statItems: defineStatItems([
      { field: 'like', value: item.modules.module_stat?.like.count },
      { field: 'dynamic-feed:comment', value: item.modules.module_stat?.comment.count },
      { field: 'dynamic-feed:forward', value: item.modules.module_stat?.forward.count },
    ]),

    recommendReason: author.pub_action,
  } as const satisfies Partial<IVideoCardData>

  const defineSingleDfCardBadge = (text: ReactNode, icon?: ReactNode) => {
    return defineCardBadges([{ key: `${EApiType.DynamicFeed}:tag`, text, icon }])
  }

  if (major?.type === DynamicFeedEnums.MajorType.Archive && major.archive) {
    const v = major.archive
    const videoTitle = v.title || v.desc
    const itemTitle = item.modules.module_dynamic.desc?.text
    const titleRender = itemTitle ? (
      <AntdTooltip title={<>动态: {itemTitle}</>}>
        <span>{videoTitle}</span>
      </AntdTooltip>
    ) : (
      videoTitle
    )
    const title = [!!itemTitle && `动态: ${itemTitle}`, !!videoTitle && `视频标题: ${videoTitle}`]
      .filter(Boolean)
      .join('\n\n')

    return {
      ...sharedCardData,

      // video
      avid: v.aid,
      bvid: v.bvid,
      // cid: v.
      goto: 'av',
      href: `/video/${v.bvid}/`,
      title,
      titleRender,
      cover: v.cover,
      duration: parseDuration(v.duration_text) || 0,
      durationDisplay: v.duration_text,

      // 「投稿视频」显示 recommendReason, 其他显示 tag
      recommendReason: v.badge.text === DynamicFeedBadgeText.Upload ? v.badge.text : undefined,
      cardBadges:
        v.badge.text === DynamicFeedBadgeText.Upload
          ? undefined
          : defineSingleDfCardBadge(
              v.badge.text,
              v.badge.icon_url ? <Picture src={`${v.badge.icon_url}@!web-dynamic`} className='size-14px' /> : undefined,
            ),

      // stat
      statItems: defineStatItems([
        { field: 'play', value: v.stat.play },
        { field: 'danmaku', value: v.stat.danmaku },
      ]),
      play: parseCount(v.stat.play),
      danmaku: parseCount(v.stat.danmaku),
    }
  }

  if (major?.type === DynamicFeedEnums.MajorType.Opus && major.opus) {
    const { opus } = major
    const isReserve = additional?.type === DynamicFeedEnums.AdditionalType.Reserve
    const isLiveReserve = isReserve && /直播预告/.test(additional.reserve.title)
    const hasPic = !!opus.pics?.length
    const cardTagText: string | undefined = (() => {
      if (isLiveReserve) return '直播预告'
      if (isReserve) return additional.reserve.title?.split('：', 1)[0] || '预约'
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
      cardBadges: defineSingleDfCardBadge(cardTagText),
    }
  }

  if (major?.type === DynamicFeedEnums.MajorType.Pgc && major.pgc) {
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
      cardBadges: defineSingleDfCardBadge(author.label), // e.g `纪录片`
      pubts: author.pub_ts, // 0
      pubdateDisplay: author.pub_time, // pub_ts 为 0, 不可用
    }
  }

  if (major?.type === DynamicFeedEnums.MajorType.UgcSeason && major.ugc_season) {
    const { ugc_season } = major
    return {
      ...sharedCardData,
      bvid: ugc_season.bvid,
      avid: ugc_season.aid.toString(),
      goto: 'av',
      duration: parseDuration(ugc_season.duration_text),
      durationDisplay: ugc_season.duration_text,
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
      cardBadges: defineSingleDfCardBadge('合集'),

      // AuthorTypeUgcSeason 里 mid 其实是 avid .... 不知道咋整
      authorMid: undefined,
    }
  }

  if (item.type === DynamicFeedEnums.ItemType.Forward && item.orig) {
    const originalItem = item.orig
    const originalItemNormalized = normalizeDynamicFeedItem(originalItem)
    if (!originalItemNormalized) return

    // Q: 这是在干什么
    // A: 对于转发视频
    //    标题: (转发内容 + 原视频视频标题)
    //    hover title: (尽量详细, 转发内容 + 原动态投稿文字 + 原动态视频标题)
    const { major } = originalItem.modules.module_dynamic
    const originalVideoTitle = major?.type === DynamicFeedEnums.MajorType.Archive ? major?.archive?.title : undefined
    const forwardText = item.modules.module_dynamic.desc?.text
    const title = [
      !!forwardText && `转发: ${forwardText}`,
      !!originalItemNormalized.title && `原动态: ${originalItemNormalized.title.replace(/^动态: /, '')}`,
    ]
      .filter(Boolean)
      .join('\n\n')
    const titleRender = (
      <>
        {forwardText && (
          <>
            <IconForForward className='relative top--1px mr-1 size-1em rounded-full bg-gate-primary vertical-middle color-white' />
            {forwardText}
            <br />
          </>
        )}
        {originalVideoTitle || originalItemNormalized.title}
      </>
    )

    return {
      ...originalItemNormalized,
      ...sharedCardData,
      cardBadges: defineSingleDfCardBadge('转发', <IconForForward className='relative top--1px size-14px' />),
      titleRender,
      title, // for title attribute
      href: `https://t.bilibili.com/${item.id_str}`,
    }
  }

  // DYNAMIC_TYPE_LIVE_RCMD: 动态支持了直播中, 这个没必要了
}
