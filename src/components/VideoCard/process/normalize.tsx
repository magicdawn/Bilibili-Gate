import { BvCode } from '@mgdn/bvid'
import dayjs from 'dayjs'
import { appWarn } from '$common'
import { colorPrimaryValue } from '$components/css-vars'
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
  type AndroidAppRecItemExtend,
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
import { styled } from '$libs'
import { AntdTooltip } from '$modules/antd/custom'
import { isFavFolderPrivate } from '$modules/rec-services/fav/fav-util'
import { IconForCollection, IconForPrivateFolder, IconForPublicFolder } from '$modules/rec-services/fav/usage-info'
import { isPgcSeasonRankItem, isPgcWebRankItem } from '$modules/rec-services/hot/rank/rank-tab'
import { ELiveStatus } from '$modules/rec-services/live/live-enum'
import { spaceUploadAvatarCache } from '$modules/rec-services/space-upload'
import { toHttps } from '$utility/url'
import {
  formatDuration,
  formatRecentTimeStamp,
  formatTimeStamp,
  getVideoInvalidReason,
  parseCount,
  parseDuration,
} from '$utility/video'
import type { FavItemExtend } from '$modules/rec-services/fav/types'
import { AppRecStatItemFieldMap, defineStatItems, getField } from '../stat-item'
import type { StatItemField, StatItemType } from '../stat-item'
import type { ReactNode } from 'react'

export const DESC_SEPARATOR = ' · '

export interface IVideoCardData {
  // video
  avid?: string
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

  /**
   * adpater specific
   */
  appBadge?: string
  appBadgeDesc?: string
  rankingDesc?: string

  //
  liveExtraDesc?: string
  liveAreaName?: string
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
  return item.device === 'android' ? apiAndroidAppAdapter(item) : apiIpadAppAdapter(item)
}

function apiAndroidAppAdapter(item: AndroidAppRecItemExtend): IVideoCardData {
  const extractCountFor = (target: StatItemField) => {
    const { cover_left_icon_1, cover_left_text_1, cover_left_icon_2, cover_left_text_2 } = item
    if (cover_left_icon_1 && AppRecStatItemFieldMap[cover_left_icon_1] === target) {
      return parseCount(cover_left_text_1)
    }
    if (cover_left_icon_2 && AppRecStatItemFieldMap[cover_left_icon_2] === target) {
      return parseCount(cover_left_text_2)
    }
  }

  const avid = item.param
  const bvid = BvCode.av2bv(Number(item.param))
  const cid = item.player_args?.cid

  const href = (() => {
    // valid uri
    if (item.uri.startsWith('http://') || item.uri.startsWith('https://')) {
      return item.uri
    }

    // more see https://github.com/magicdawn/bilibili-gate/issues/23#issuecomment-1533079590

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
    pubdateDisplay: undefined,
    duration: item.player_args?.duration || 0,
    durationStr: formatDuration(item.player_args?.duration),
    recommendReason: item.rcmd_reason,

    // stat
    play: extractCountFor('play'),
    danmaku: extractCountFor('danmaku'),
    bangumiFollow: extractCountFor('bangumi:follow'),
    like: undefined,
    coin: undefined,
    favorite: undefined,

    // e.g 2023-09-17
    // cover_left_1_content_description: "156点赞"
    // cover_left_icon_1: 20
    // cover_left_text_1: "156"
    statItems: [
      item.cover_left_text_1 && {
        field: getField(item.cover_left_icon_1),
        value: item.cover_left_text_1,
      },
      item.cover_left_text_2 && {
        field: getField(item.cover_left_icon_2),
        value: item.cover_left_text_2,
      },
    ].filter(Boolean),

    // author
    authorName: item.args.up_name,
    authorFace: undefined,
    authorMid: String(item.args.up_id!),

    appBadge: item.badge,
    appBadgeDesc: item.desc_button?.text || item.desc || '',
  }
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

    // more see https://github.com/magicdawn/bilibili-gate/issues/23#issuecomment-1533079590

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
    recommendReason: item.bottom_rcmd_reason || item.top_rcmd_reason, // TODO: top_rcmd_reason

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
    pubdateDisplay: formatTimeStamp(item.pubdate),
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

function apiDynamicAdapter(item: DynamicFeedItemExtend): IVideoCardData {
  const v = item.modules.module_dynamic.major.archive
  const author = item.modules.module_author

  const gateTs = dayjs().subtract(2, 'days').unix()
  const pubdateDisplay = (() => {
    const ts = author.pub_ts
    if (ts > gateTs) {
      return author.pub_time
    } else {
      return formatTimeStamp(ts)
    }
  })()

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
    pubdateDisplay,
    duration: parseDuration(v.duration_text) || 0,
    durationStr: v.duration_text,
    recommendReason: v.badge.text,

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

  return {
    // video
    avid: String(item.aid),
    bvid: item.bvid,
    cid: item.cid,
    goto: 'av',
    href: `https://www.bilibili.com/list/watchlater?bvid=${item.bvid}&oid=${item.aid}`,
    title,
    titleRender,
    cover: item.pic,
    pubts: item.pubdate,
    pubdateDisplay: formatTimeStamp(item.pubdate),
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

const fillWithColorPrimary = styled.createClass`
  & path {
    fill: ${colorPrimaryValue};
  }
`

function apiFavAdapter(item: FavItemExtend): IVideoCardData {
  const belongsToTitle = item.from === 'fav-folder' ? item.folder.title : item.collection.title

  const iconInTitleStyle = {
    display: 'inline-block',
    verticalAlign: 'middle',
    marginRight: 4,
    marginTop: -2,
  }
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
    pubdateDisplay: formatTimeStamp(item.pubtime),
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
    pubdateDisplay: formatTimeStamp(item.pubdate),
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
    pubdateDisplay: formatTimeStamp(item.pubdate),
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
    pubdateDisplay: formatTimeStamp(item.pubdate),
    duration: item.duration,
    durationStr: formatDuration(item.duration),
    recommendReason: undefined, // TODO: write something here

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
    pubdateDisplay: formatRecentTimeStamp(item.created, false),
    duration,
    durationStr,
    recommendReason: item.description || undefined,

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
    authorFace: spaceUploadAvatarCache.get(item.mid.toString()),
    authorMid: item.mid.toString(),
  }
}
