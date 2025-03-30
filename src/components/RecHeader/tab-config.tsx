import { C } from '$common/emotion-css'
import {
  IconForDynamicFeed,
  IconForFav,
  IconForFollowedOnly,
  IconForHot,
  IconForLive,
  IconForPc,
  IconForPhone,
  IconForWatchlater,
} from '$modules/icon'
import { favStore } from '$modules/rec-services/fav/store'
import { isHotTabUsingShuffle } from '$modules/rec-services/hot'
import toast from '$utility/toast'
import type { CssProp } from '$utility/type'
import { css } from '@emotion/react'
import { size } from 'polished'
import { cloneElement, type ReactElement } from 'react'
import { ETab } from './tab-enum'

export type TabConfigItem = {
  icon: ReactElement
  label: string
  desc: string
  swr?: boolean // stale while revalidate
  anonymousUsage?: boolean // 游客可访问?
}

export const TabConfig: Record<ETab, TabConfigItem> = {
  [ETab.AppRecommend]: {
    icon: <IconForPhone {...size(18)} />,
    label: '推荐',
    desc: '使用 Bilibili App 端推荐 API',
    anonymousUsage: true,
  },
  [ETab.PcRecommend]: {
    icon: <IconForPc {...size(18)} />,
    label: '推荐',
    desc: '使用新版首页顶部推荐 API',
    anonymousUsage: true,
  },
  [ETab.KeepFollowOnly]: {
    icon: <IconForFollowedOnly {...size(18)} />,
    label: '已关注',
    desc: '从PC端推荐中筛选出「已关注」,可能比较慢; 关注的UP更新在动态~',
  },
  [ETab.DynamicFeed]: {
    icon: <IconForDynamicFeed {...size(16)} />,
    label: '动态',
    desc: '视频投稿动态',
    swr: true,
  },
  [ETab.Watchlater]: {
    icon: (
      <IconForWatchlater
        {...size(17)}
        css={css`
          /* circle 使用的是 fill, 在 tab 中显示太细了 */
          .circle {
            stroke: currentColor;
          }
        `}
      />
    ),
    label: '稍后再看',
    desc: '你添加的稍后再看; 默认随机乱序, 可在设置中关闭乱序',
    swr: true,
  },
  [ETab.Fav]: {
    icon: <IconForFav {...size(16)} css={C.mt(-1)} />,
    label: '收藏',
    desc: '你添加的收藏; 默认随机乱序, 可在设置中关闭乱序',
    get swr() {
      return !favStore.usingShuffle
    },
  },
  [ETab.Hot]: {
    icon: <IconForHot {...size(16)} />,
    label: '热门',
    desc: '各个领域中新奇好玩的优质内容都在这里~',
    anonymousUsage: true,
    get swr() {
      return !isHotTabUsingShuffle()
    },
  },
  [ETab.Live]: {
    icon: <IconForLive {...size(16)} />,
    // icon: <MaterialSymbolsBarChart {...size(16)} />,
    label: '直播',
    desc: '直播~',
    swr: true,
  },
  [ETab.SpaceUpload]: {
    icon: <IconLineMdUploadingLoop {...size(16)} />,
    label: '投稿',
    desc: 'UP 视频投稿',
  },
}

export function TabIcon({
  tabKey,
  moreCss,
  size: _size,
  ml,
  mr,
  mt,
  mb,
  active,
}: {
  tabKey: ETab
  moreCss?: CssProp
  size?: number
  ml?: number
  mr?: number
  mt?: number
  mb?: number
  active?: boolean
}) {
  const { icon } = TabConfig[tabKey]
  const newCssProp = [
    icon.props.css as CssProp,
    moreCss,
    ml && C.ml(ml),
    mr && C.mr(mr),
    mt && C.mt(mt),
    mb && C.mb(mb),
  ]
    .flat()
    .filter(Boolean)
  const cloned = cloneElement(icon, {
    css: newCssProp,
    width: _size ? size(_size).width : icon.props.width,
    height: _size ? size(_size).height : icon.props.height,
    active: tabKey === ETab.Live ? active : undefined, // 否则 warn: svg recived boolean props
  })
  return cloned
}

export function toastNeedLogin() {
  return toast('你需要登录B站后使用该功能! 如已完成登录, 请刷新网页重试~')
}

function gotoLogin() {
  const href = 'https://passport.bilibili.com/login'
  location.href = href
}
