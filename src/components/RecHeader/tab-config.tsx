import {
  IconForDynamicFeed,
  IconForFav,
  IconForFollowedOnly,
  IconForHot,
  IconForLive,
  IconForPc,
  IconForPhone,
  IconForSpaceUpload,
  IconForWatchlater,
} from '$modules/icon'
import { favStore } from '$modules/rec-services/fav/store'
import { isHotTabUsingShuffle } from '$modules/rec-services/hot'
import { advancedSearchHelpInfo } from '$utility/search'
import toast from '$utility/toast'
import { css } from '@emotion/react'
import { cloneElement, type ReactElement, type ReactNode } from 'react'
import { useUnoMerge } from 'unocss-merge/react'
import { ETab } from './tab-enum'

export type TabConfigItem = {
  icon: ReactElement
  label: string
  desc: string
  extraHelpInfo?: ReactNode
  swr?: boolean // stale while revalidate
  anonymousUsage?: boolean // 游客可访问?
}

export const TabConfig: Record<ETab, TabConfigItem> = {
  [ETab.AppRecommend]: {
    icon: <IconForPhone className='size-18px' />,
    label: '推荐',
    desc: '使用 Bilibili App 端推荐 API',
    anonymousUsage: true,
  },
  [ETab.PcRecommend]: {
    icon: <IconForPc className='size-18px' />,
    label: '推荐',
    desc: '使用新版首页顶部推荐 API',
    anonymousUsage: true,
  },
  [ETab.KeepFollowOnly]: {
    icon: <IconForFollowedOnly className='size-18px' />,
    label: '已关注',
    desc: '从PC端推荐中筛选出「已关注」,可能比较慢; 关注的UP更新在动态~',
  },
  [ETab.DynamicFeed]: {
    icon: <IconForDynamicFeed className='size-16px' />,
    label: '动态',
    desc: '视频投稿动态',
    swr: true,
  },
  [ETab.Watchlater]: {
    icon: (
      <IconForWatchlater
        className='size-17px'
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
    icon: <IconForFav className='size-16px mt--1px' />,
    label: '收藏',
    desc: '你添加的收藏; 默认随机乱序, 可在设置中关闭乱序',
    get swr() {
      return !favStore.usingShuffle
    },
  },
  [ETab.Hot]: {
    icon: <IconForHot className='size-16px' />,
    label: '热门',
    desc: '各个领域中新奇好玩的优质内容都在这里~',
    anonymousUsage: true,
    get swr() {
      return !isHotTabUsingShuffle()
    },
  },
  [ETab.Live]: {
    icon: <IconForLive className='size-16px' />,
    label: '直播',
    desc: '直播~',
    swr: true,
  },
  [ETab.SpaceUpload]: {
    icon: <IconForSpaceUpload className='size-16px' />,
    label: '投稿',
    desc: 'UP 视频投稿',
    extraHelpInfo: (
      <div className='ml-20px'>
        搜索词: 搜索相关作品 <br />
        本地过滤词: 本地过滤搜索结果; 本地过滤词支持高级规则:
        <div className='ml-20px'>{advancedSearchHelpInfo}</div>
      </div>
    ),
  },
}

type TabIconProps = {
  tabKey: ETab
  active?: boolean
  className?: string
}

export function TabIcon({ tabKey, active, className }: TabIconProps) {
  const { icon } = TabConfig[tabKey]
  const newClassName = useUnoMerge(icon.props.className, className)
  const cloned = cloneElement(icon, {
    css: icon.props.css,
    active: tabKey === ETab.Live ? active : undefined, // 否则 warn: svg recived boolean props
    className: newClassName,
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
