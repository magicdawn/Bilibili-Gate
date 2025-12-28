import { BvCode } from '@mgdn/bvid'
import dayjs from 'dayjs'
import { appWarn } from '$common'
import { defineStatItems, type StatItemField, type StatItemType } from '$components/VideoCard/stat-item'
import {
  isAppRecommend,
  isDynamicFeed,
  isFav,
  isLive,
  isPcRecommend,
  isPopularGeneral,
  isPopularWeekly,
  isRank,
  isSpaceUpload,
  isWatchlater,
  type AppRecItemExtend,
  type DynamicFeedItemExtend,
  type IpadAppRecItemExtend,
  type LiveItemExtend,
  type PcRecItemExtend,
  type PopularGeneralItemExtend,
  type PopularWeeklyItemExtend,
  type RankItemExtend,
  type RecItemType,
  type SpaceUploadItemExtend,
  type WatchlaterItemExtend,
} from '$define'
import { EApiType } from '$define/index.shared'
import { PcRecGoto } from '$define/pc-recommend'
import { AntdTooltip } from '$modules/antd/custom'
import { DynamicFeedBadgeText } from '$modules/rec-services/dynamic-feed/store'
import { isFavFolderPrivate } from '$modules/rec-services/fav/fav-util'
import { IconForCollection, IconForPrivateFolder, IconForPublicFolder } from '$modules/rec-services/fav/views'
import { isPgcSeasonRankItem, isPgcWebRankItem } from '$modules/rec-services/hot/rank/rank-tab'
import { ELiveStatus } from '$modules/rec-services/live/live-enum'
import { spaceUploadAvatarCache, spaceUploadFollowedMidSet } from '$modules/rec-services/space-upload'
import { WatchlaterItemsOrder } from '$modules/rec-services/watchlater/watchlater-enum'
import { getSettingsSnapshot } from '$modules/settings'
import { toHttps } from '$utility/url'
import { formatDuration, formatTimeStamp, getVideoInvalidReason, parseCount, parseDuration } from '$utility/video'
import type { ReactNode } from 'react'
import type { Badge as DynamicFeedBadge } from '$define/pc-dynamic-feed'
import type { FavItemExtend } from '$modules/rec-services/fav/types'

export const DESC_SEPARATOR = ' · '

export interface IVideoCardData {
  // video
  avid?: string // should be a number, but use string for safety
  bvid?: string
  cid?: number
  goto: string
  href: string

  title: string
  titleRender?: ReactNode

  cover: string
  pubts?: number // unix timestamp
  pubdateDisplay?: string // for display
  pubdateDisplayForTitleAttr?: string
  duration?: number
  durationStr?: string
  recommendReason?: string

  // stat
  statItems: StatItemType[]
  // for filter
  play?: number
  like?: number
  coin?: number
  danmaku?: number
  favorite?: number
  bangumiFollow?: number

  // author
  authorName?: string
  authorFace?: string
  authorMid?: string
  followed?: boolean // 是否「已关注」

  /**
   * adpater specific
   */
  appBadge?: string
  appBadgeDesc?: string
  rankingDesc?: string
  liveExtraDesc?: string
  liveAreaName?: string
  dynBadge?: DynamicFeedBadge
}

type Getter<T> = Record<RecItemType['api'], (item: RecItemType) => T>

export function lookinto<T>(
  item: RecItemType,
  opts: {
    [EApiType.AppRecommend]: (item: AppRecItemExtend) => T
    [EApiType.PcRecommend]: (item: PcRecItemExtend) => T
    [EApiType.DynamicFeed]: (item: DynamicFeedItemExtend) => T
    [EApiType.Watchlater]: (item: WatchlaterItemExtend) => T
    [EApiType.Fav]: (item: FavItemExtend) => T
    [EApiType.PopularGeneral]: (item: PopularGeneralItemExtend) => T
    [EApiType.PopularWeekly]: (item: PopularWeeklyItemExtend) => T
    [EApiType.Rank]: (item: RankItemExtend) => T
    [EApiType.Live]: (item: LiveItemExtend) => T
    [EApiType.SpaceUpload]: (item: SpaceUploadItemExtend) => T
  },
): T {
  if (isAppRecommend(item)) return opts[EApiType.AppRecommend](item)
  if (isPcRecommend(item)) return opts[EApiType.PcRecommend](item)
  if (isDynamicFeed(item)) return opts[EApiType.DynamicFeed](item)
  if (isWatchlater(item)) return opts[EApiType.Watchlater](item)
  if (isFav(item)) return opts[EApiType.Fav](item)
  if (isPopularGeneral(item)) return opts[EApiType.PopularGeneral](item)
  if (isPopularWeekly(item)) return opts[EApiType.PopularWeekly](item)
  if (isRank(item)) return opts[EApiType.Rank](item)
  if (isLive(item)) return opts[EApiType.Live](item)
  if (isSpaceUpload(item)) return opts[EApiType.SpaceUpload](item)
  throw new Error(`unknown api type`)
}

export function normalizeCardData(item: RecItemType) {
  const ret = lookinto<IVideoCardData>(item, {
    [EApiType.AppRecommend]: apiAppAdapter,
    [EApiType.PcRecommend]: apiPcAdapter,
    [EApiType.DynamicFeed]: apiDynamicAdapter,
    [EApiType.Watchlater]: apiWatchlaterAdapter,
    [EApiType.Fav]: apiFavAdapter,
    [EApiType.PopularGeneral]: apiPopularGeneralAdapter,
    [EApiType.PopularWeekly]: apiPopularWeeklyAdapter,
    [EApiType.Rank]: apiRankAdapter,
    [EApiType.Live]: apiLiveAdapter,
    [EApiType.SpaceUpload]: apiSpaceUploadAdapter,
  })

  // handle mixed content
  if (ret.authorFace) ret.authorFace = toHttps(ret.authorFace)
  ret.cover = toHttps(ret.cover)

  return ret
}

function apiAppAdapter(item: AppRecItemExtend): IVideoCardData {
  return apiIpadAppAdapter(item)
}

function apiIpadAppAdapter(item: IpadAppRecItemExtend): IVideoCardData {
  const extractCountFor = (target: StatItemField) => {
    const { cover_left_text_1, cover_left_text_2, cover_left_text_3 } = item
    const arr = [cover_left_text_1, cover_left_text_2, cover_left_text_3].filter(Boolean)
    if (target === 'play') {
      const text = arr.find((text) => /观看|播放$/.test(text))
      if (!text) return
      const rest = text.replace(/观看|播放$/, '')
      return parseCount(rest)
    }

    if (target === 'danmaku') {
      const text = arr.find((text) => text.endsWith('弹幕'))
      if (!text) return
      const rest = text.replace(/弹幕$/, '')
      return parseCount(rest)
    }

    if (target === 'bangumi:follow') {
      const text = arr.find((text) => /追[剧番]$/.test(text))
      if (!text) return
      const rest = text.replace(/追[剧番]$/, '')
      return parseCount(rest)
    }
  }

  const avid = item.param
  const bvid = item.bvid || BvCode.av2bv(Number(item.param))
  const cid = item.player_args?.cid

  const href = (() => {
    // valid uri
    if (item.uri.startsWith('http://') || item.uri.startsWith('https://')) {
      return item.uri
    }

    // more see https://github.com/magicdawn/Bilibili-Gate/issues/23#issuecomment-1533079590

    if (item.goto === 'av') {
      return `/video/${bvid}/`
    }

    if (item.goto === 'bangumi') {
      appWarn(`bangumi uri should not starts with 'bilibili://': %s`, item.uri)
      return item.uri
    }

    // goto = picture, 可能是专栏 or 动态
    // 动态的 url 是 https://t.bilibili.com, 使用 uri
    // 专栏的 url 是 bilibili://article/<id>
    if (item.goto === 'picture') {
      const id = /^bilibili:\/\/article\/(\d+)$/.exec(item.uri)?.[1]
      if (id) return `/read/cv${id}`
      return item.uri
    }

    return item.uri
  })()

  // stat
  const play = extractCountFor('play')
  const like = undefined
  const coin = undefined
  const danmaku = extractCountFor('danmaku')
  const favorite = undefined
  const bangumiFollow = extractCountFor('bangumi:follow')
  const statItems: StatItemType[] = [
    { field: 'play', value: play },
    typeof danmaku === 'number'
      ? { field: 'danmaku', value: danmaku }
      : { field: 'bangumi:follow', value: bangumiFollow },
  ]

  const desc = item.desc || ''
  const [descAuthorName = undefined, descDate = undefined] = desc.split(DESC_SEPARATOR)

  return {
    // video
    avid,
    bvid,
    cid,
    goto: item.goto,
    href,
    title: item.title,
    cover: item.cover,
    pubts: undefined,
    pubdateDisplay: descDate,
    duration: item.player_args?.duration || 0,
    durationStr: formatDuration(item.player_args?.duration),
    recommendReason: item.bottom_rcmd_reason || item.top_rcmd_reason,

    // stat
    play,
    like,
    coin,
    danmaku,
    favorite,
    bangumiFollow,
    statItems,

    // author
    authorName: item.args.up_name || descAuthorName,
    authorFace: item.avatar.cover,
    authorMid: String(item.args.up_id || ''),

    appBadge: item.cover_badge,
    appBadgeDesc: item.desc,
  }
}

function apiPcAdapter(item: PcRecItemExtend): IVideoCardData {
  const _isVideo = item.goto === PcRecGoto.AV
  const _isLive = item.goto === PcRecGoto.Live

  return {
    // video
    avid: _isLive ? undefined : String(item.id),
    bvid: _isLive ? undefined : item.bvid,
    cid: _isLive ? undefined : item.cid,
    goto: item.goto,
    href: item.goto === 'av' ? `/video/${item.bvid}/` : item.uri,
    title: item.title,
    cover: item.pic,
    pubts: item.pubdate,
    duration: item.duration,
    durationStr: formatDuration(item.duration),
    recommendReason: _isLive ? item.room_info?.area.area_name : item.rcmd_reason?.content,

    // stat
    play: item.stat?.view,
    like: item.stat?.like,
    coin: undefined,
    danmaku: item.stat?.danmaku,
    favorite: undefined,
    statItems: _isLive
      ? defineStatItems([{ field: 'live:viewed-by', value: item.room_info?.watched_show.num }])
      : defineStatItems([
          { field: 'play', value: item.stat?.view },
          { field: 'danmaku', value: item.stat?.danmaku },
        ]),

    // author
    authorName: item.owner?.name,
    authorFace: item.owner?.face,
    authorMid: String(item.owner?.mid),
  }
}

export type { DynamicFeedBadge }
function apiDynamicAdapter(item: DynamicFeedItemExtend): IVideoCardData {
  const v = item.modules.module_dynamic.major.archive
  const author = item.modules.module_author

  return {
    // video
    avid: v.aid,
    bvid: v.bvid,
    // cid: v.
    goto: 'av',
    href: `/video/${v.bvid}/`,
    title: v.title,
    cover: v.cover,
    pubts: author.pub_ts,
    duration: parseDuration(v.duration_text) || 0,
    durationStr: v.duration_text,

    // 普通视频显示 recommendReason, 其他显示 badge
    recommendReason: v.badge.text === DynamicFeedBadgeText.Upload ? v.badge.text : undefined,
    dynBadge: v.badge,

    // stat
    statItems: defineStatItems([
      { field: 'play', value: v.stat.play },
      { field: 'danmaku', value: v.stat.danmaku },
    ]),
    play: parseCount(v.stat.play),
    danmaku: parseCount(v.stat.danmaku),

    // author
    authorName: author.name,
    authorFace: author.face,
    authorMid: author.mid.toString(),
  }
}

function apiWatchlaterAdapter(item: WatchlaterItemExtend): IVideoCardData {
  const invalidReason = getVideoInvalidReason(item.state)
  const viewed = item.progress > 0
  const title = `${viewed ? '【已观看】· ' : ''}${item.title}`
  const titleRender: ReactNode = invalidReason ? (
    <AntdTooltip title={<>视频已失效, 原因: {invalidReason}</>} align={{ offset: [0, -5] }} placement='topLeft'>
      <del>
        {viewed ? '【已观看】· ' : ''}
        {item.title}`
      </del>
    </AntdTooltip>
  ) : undefined

  const { watchlaterUseNormalVideoUrl, watchlaterItemsOrder } = getSettingsSnapshot()

  const href = (() => {
    if (watchlaterUseNormalVideoUrl) return `https://www.bilibili.com/video/${item.bvid}/`
    let autoListUrl = `https://www.bilibili.com/list/watchlater?bvid=${item.bvid}&oid=${item.aid}`
    if (watchlaterItemsOrder === WatchlaterItemsOrder.AddTimeAsc) autoListUrl += '&desc=0'
    return autoListUrl
  })()

  return {
    // video
    avid: String(item.aid),
    bvid: item.bvid,
    cid: item.cid,
    goto: 'av',
    href,
    title,
    titleRender,
    cover: item.pic,
    pubts: item.pubdate,
    pubdateDisplayForTitleAttr: `${formatTimeStamp(item.pubdate, true)} 发布, ${formatTimeStamp(
      item.add_at,
      true,
    )} 添加稍后再看`,
    duration: item.duration,
    durationStr: formatDuration(item.duration),
    recommendReason: `${formatTimeStamp(item.add_at)} · 稍后再看`,

    // stat
    statItems: defineStatItems([
      { field: 'play', value: item.stat.view },
      { field: 'like', value: item.stat.like },
      // { field: 'coin', value: item.stat.coin },
      { field: 'favorite', value: item.stat.favorite },
    ]),
    play: item.stat.view,
    like: item.stat.like,
    danmaku: item.stat.danmaku,

    // author
    authorName: item.owner.name,
    authorFace: item.owner.face,
    authorMid: String(item.owner.mid),
  }
}

function apiFavAdapter(item: FavItemExtend): IVideoCardData {
  const belongsToTitle = item.from === 'fav-folder' ? item.folder.title : item.collection.title

  const iconInTitleStyle = {
    display: 'inline-block',
    verticalAlign: 'middle',
    marginRight: 4,
    marginTop: -2,
  }

  const fillWithColorPrimary = '[&_path]:fill-gate-primary'

  const iconInTitle =
    item.from === 'fav-folder' ? (
      isFavFolderPrivate(item.folder.attr) ? (
        <IconForPrivateFolder className={clsx('size-15px', fillWithColorPrimary)} style={iconInTitleStyle} />
      ) : (
        <IconForPublicFolder className={clsx('size-15px', fillWithColorPrimary)} style={iconInTitleStyle} />
      )
    ) : (
      <IconForCollection className={clsx('size-15px', fillWithColorPrimary)} style={iconInTitleStyle} />
    )

  return {
    // video
    avid: String(item.id),
    bvid: item.bvid,
    // cid: item.
    goto: 'av',
    href: `/video/${item.bvid}/`,
    title: `【${belongsToTitle}】· ${item.title}`,
    titleRender: (
      <>
        【{iconInTitle}
        {belongsToTitle}】· {item.title}
      </>
    ),
    cover: item.cover,
    pubts: item.pubtime,
    duration: item.duration,
    durationStr: formatDuration(item.duration),
    recommendReason: item.from === 'fav-folder' ? `${formatTimeStamp(item.fav_time)} · 收藏` : undefined,

    // stat
    play: item.cnt_info.play,
    danmaku: item.cnt_info.danmaku,
    favorite: item.cnt_info.collect,
    statItems: defineStatItems([
      { field: 'play', value: item.cnt_info.play },
      { field: 'danmaku', value: item.cnt_info.danmaku },
      { field: 'favorite', value: item.cnt_info.collect },
    ]),

    // author
    authorName: item.upper.name,
    authorFace: item.upper.face,
    authorMid: String(item.upper.mid),
  }
}

function apiPopularGeneralAdapter(item: PopularGeneralItemExtend): IVideoCardData {
  return {
    // video
    avid: String(item.aid),
    bvid: item.bvid,
    cid: item.cid,
    goto: 'av',
    href: `/video/${item.bvid}/`,
    title: item.title,
    cover: item.pic,
    pubts: item.pubdate,
    duration: item.duration,
    durationStr: formatDuration(item.duration),
    recommendReason: item.rcmd_reason?.content,

    // stat
    play: item.stat.view,
    like: item.stat.like,
    coin: undefined,
    danmaku: item.stat.danmaku,
    favorite: undefined,
    statItems: defineStatItems([
      { field: 'play', value: item.stat.view },
      { field: 'like', value: item.stat.like },
      // { field: 'danmaku', value: item.stat.danmaku },
    ]),

    // author
    authorName: item.owner.name,
    authorFace: item.owner.face,
    authorMid: String(item.owner.mid),
  }
}

function apiPopularWeeklyAdapter(item: PopularWeeklyItemExtend): IVideoCardData {
  return {
    // video
    avid: String(item.aid),
    bvid: item.bvid,
    cid: item.cid,
    goto: 'av',
    href: `/video/${item.bvid}/`,
    title: item.title,
    cover: item.pic,
    pubts: item.pubdate,
    duration: item.duration,
    durationStr: formatDuration(item.duration),
    recommendReason: item.rcmd_reason,

    // stat
    play: item.stat.view,
    like: item.stat.like,
    danmaku: item.stat.danmaku,
    statItems: defineStatItems([
      { field: 'play', value: item.stat.view },
      { field: 'like', value: item.stat.like },
      // { field: 'danmaku', value: item.stat.danmaku },
    ]),

    // author
    authorName: item.owner.name,
    authorFace: item.owner.face,
    authorMid: String(item.owner.mid),
  }
}

function apiRankAdapter(item: RankItemExtend): IVideoCardData {
  if (isPgcWebRankItem(item) || isPgcSeasonRankItem(item)) {
    const cover = item.new_ep.cover
    const rankingDesc = item.new_ep.index_show

    return {
      // video
      avid: '',
      bvid: '',
      goto: 'bangumi',
      href: item.url,
      title: item.title,
      cover,
      pubts: undefined,
      pubdateDisplay: undefined,
      duration: 0,
      durationStr: '',

      // stat
      play: item.stat.view,
      like: item.stat.follow,
      danmaku: item.stat.danmaku,
      statItems: defineStatItems([
        { field: 'play', value: item.stat.view },
        { field: 'bangumi:follow', value: item.stat.follow },
        // { field: 'danmaku', value: item.stat.danmaku },
      ]),

      rankingDesc,
    }
  }

  let recommendReason: string | undefined = (item.dynamic || item.desc)?.trim()
  if (recommendReason === '-') recommendReason = undefined
  if (recommendReason && item.title.includes(recommendReason)) recommendReason = undefined

  // normal
  return {
    // video
    avid: String(item.aid),
    bvid: item.bvid,
    cid: item.cid,
    goto: 'av',
    href: `/video/${item.bvid}/`,
    title: item.title,
    cover: item.pic,
    pubts: item.pubdate,
    duration: item.duration,
    durationStr: formatDuration(item.duration),
    recommendReason,

    // stat
    play: item.stat.view,
    like: item.stat.like,
    danmaku: item.stat.danmaku,
    statItems: defineStatItems([
      { field: 'play', value: item.stat.view },
      { field: 'like', value: item.stat.like },
      // { field: 'danmaku', value: item.stat.danmaku },
    ]),

    // author
    authorName: item.owner.name,
    authorFace: item.owner.face,
    authorMid: String(item.owner.mid),
  }
}

function apiLiveAdapter(item: LiveItemExtend): IVideoCardData {
  const area = `${item.area_name_v2}`
  const liveExtraDesc =
    item.live_status === ELiveStatus.Streaming
      ? '' // 「 不需要 space padding
      : `${DESC_SEPARATOR}${formatLiveTime(item.record_live_time)} 直播过`

  function formatLiveTime(ts: number) {
    const today = dayjs().format('YYYYMMDD')
    const yesterday = dayjs().subtract(1, 'day').format('YYYYMMDD')

    const d = dayjs.unix(ts)
    if (d.format('YYYYMMDD') === today) {
      return d.format('HH:mm')
    }
    if (d.format('YYYYMMDD') === yesterday) {
      return `昨天 ${d.format('HH:mm')}`
    }
    return d.format('MM-DD HH:mm')
  }

  return {
    // video
    goto: 'live',
    href: `https://live.bilibili.com/${item.roomid}`,
    title: item.title,
    cover: item.room_cover,
    recommendReason: area,
    liveExtraDesc,
    // stat
    statItems: defineStatItems([{ field: 'live:viewed-by', value: item.text_small }]),
    // author
    authorName: item.uname,
    authorFace: item.face,
    authorMid: String(item.uid),
  }
}

function apiSpaceUploadAdapter(item: SpaceUploadItemExtend): IVideoCardData {
  const duration = parseDuration(item.length)
  const durationStr = formatDuration(duration) // 太蠢啦, 这个 API length 有时候会返回 '90:10', 表示 90分钟10秒, 不能直接用

  let recommendReason: string | undefined = item.description?.trim()
  if (recommendReason === '-') recommendReason = undefined
  if (recommendReason && item.title.includes(recommendReason)) recommendReason = undefined

  return {
    // video
    avid: item.aid.toString(),
    bvid: item.bvid,
    cid: undefined,
    goto: 'av',
    href: `/video/${item.bvid}/`,
    title: item.title,
    cover: item.pic,
    pubts: item.created,
    duration,
    durationStr,
    recommendReason,

    // stat
    play: item.play,
    like: undefined,
    coin: undefined,
    danmaku: item.video_review,
    favorite: undefined,
    statItems: defineStatItems([
      { field: 'play', value: item.play },
      { field: 'danmaku', value: item.video_review },
    ]),

    // author
    authorName: item.author,
    authorFace: spaceUploadAvatarCache.get(item.mid),
    authorMid: item.mid.toString(),
    followed: spaceUploadFollowedMidSet.has(item.mid),
  }
}
