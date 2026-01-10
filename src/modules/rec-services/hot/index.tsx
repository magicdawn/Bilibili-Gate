import { Button, Dropdown, Space } from 'antd'
import clsx from 'clsx'
import { useMemo, type ReactNode } from 'react'
import { useSnapshot } from 'valtio'
import { EHotSubTab } from '$components/RecHeader/tab-enum'
import { useOnRefresh } from '$components/Recommends/rec.shared'
import { AntdTooltip } from '$modules/antd/custom'
import { settings, useSettingsSnapshot } from '$modules/settings'
import { proxyWithGmStorage } from '$utility/valtio'
import { BaseTabService, usePopupContainer, type IService } from '../_base'
import { PopularGeneralRecService } from './popular-general'
import { PopularWeeklyRecService } from './popular-weekly'
import { RankRecService } from './rank'
import { rankStore } from './rank/store'
import type { RecItemTypeOrSeparator } from '$define'
import type { AntMenuItem } from '$modules/antd'

const subtabServiceCreators = {
  [EHotSubTab.PopularGeneral]: () => new PopularGeneralRecService(settings.popularGeneralUseAnonymous),
  [EHotSubTab.PopularWeekly]: () => new PopularWeeklyRecService(settings.popularWeeklyUseShuffle),
  [EHotSubTab.Rank]: () => new RankRecService(rankStore.slug),
} satisfies Record<EHotSubTab, () => IService>

// 是否是: 换一换
export function isHotTabUsingShuffle(shuffleForPopularWeekly?: boolean) {
  const { subtab } = hotStore
  shuffleForPopularWeekly ??= settings.popularWeeklyUseShuffle
  const change = subtab === EHotSubTab.PopularWeekly && shuffleForPopularWeekly
  return change
}

const imgOf = (src: string) => <img src={src} alt='' className='size-18px' />

const HotSubTabConfig = {
  [EHotSubTab.PopularGeneral]: {
    // icon: <IconPark name='Fire' size={15} />,
    icon: imgOf('https://s1.hdslb.com/bfs/static/jinkela/popular/assets/icon_popular.png'),
    label: '综合热门',
    desc: '各个领域中新奇好玩的优质内容都在这里~',
    swr: true,
    anonymousUsage: true,
  },
  [EHotSubTab.PopularWeekly]: {
    // icon: <IconPark name='TrendTwo' size={15} />,
    icon: imgOf('https://s1.hdslb.com/bfs/static/jinkela/popular/assets/icon_weekly.png'),
    label: '每周必看',
    desc: '每周五晚 18:00 更新',
    anonymousUsage: true,
  },
  [EHotSubTab.Rank]: {
    // icon: <IconPark name='Rank' size={15} />,
    icon: imgOf('https://s1.hdslb.com/bfs/static/jinkela/popular/assets/icon_rank.png'),
    label: '排行榜',
    desc: '排行榜根据稿件内容质量，近期的数据综合展示，动态更新',
    anonymousUsage: true,
    swr: true,
  },
}

export class HotRecService extends BaseTabService<RecItemTypeOrSeparator> {
  subtab: EHotSubTab
  service: IService
  constructor() {
    super(20)
    this.subtab = hotStore.subtab
    this.service = subtabServiceCreators[hotStore.subtab]()
  }

  override get tabbarView() {
    return <HotTabbarView>{this.service.tabbarView}</HotTabbarView>
  }

  override get sidebarView() {
    return this.service.sidebarView
  }

  override get hasMoreExceptQueue() {
    return this.service.hasMore
  }
  override fetchMore(abortSignal: AbortSignal) {
    return this.service.loadMore(abortSignal)
  }
}

export const hotStore = await proxyWithGmStorage({ subtab: EHotSubTab.PopularGeneral }, 'hot-store')

// if not valid, use default
if (!Object.values(EHotSubTab).includes(hotStore.subtab)) {
  hotStore.subtab = EHotSubTab.PopularGeneral
}

function HotTabbarView({ children }: { children?: ReactNode }) {
  const { subtab: activeSubtab } = useSnapshot(hotStore)
  const { icon, label } = HotSubTabConfig[activeSubtab]
  const onRefresh = useOnRefresh()
  const { ref, getPopupContainer } = usePopupContainer<HTMLButtonElement>()
  const { __internalHotSubUseDropdown } = useSettingsSnapshot()

  const menus: AntMenuItem[] = useMemo(
    () =>
      [EHotSubTab.PopularGeneral, EHotSubTab.PopularWeekly, EHotSubTab.Rank]
        .map((subtab, index) => {
          const config = HotSubTabConfig[subtab]
          const active = subtab === activeSubtab
          return [
            index > 0 && { type: 'divider' as const },
            {
              key: subtab,
              label: <span className={clsx({ 'color-gate-primary': active })}>{config.label}</span>,
              icon: config.icon,
              onClick() {
                if (subtab === hotStore.subtab) return
                hotStore.subtab = subtab
                // refresh?.(true) // 可以但没必要, 有 skeleton 有 Tab切换 的反馈
                onRefresh()
              },
            } satisfies AntMenuItem,
          ].filter(Boolean)
        })
        .flat(),
    [activeSubtab],
  )

  const dropdownMenu = (
    <Dropdown
      menu={{ items: menus }}
      getPopupContainer={getPopupContainer}
      rootClassName='![&_\[role=separator\]]:(mx-0 my-2px)'
    >
      <Button ref={ref} className='w-114px flex items-center justify-start gap-0 pl-16px'>
        {icon}
        <span className='ml-8px'>{label}</span>
      </Button>
    </Dropdown>
  )

  const tab = useMemo(() => {
    return (
      <Space.Compact>
        {[EHotSubTab.PopularGeneral, EHotSubTab.PopularWeekly, EHotSubTab.Rank].map((subtab, index) => {
          const { icon, label, desc } = HotSubTabConfig[subtab]
          const active = subtab === activeSubtab
          return (
            <AntdTooltip
              title={
                <>
                  {label}: {desc}
                </>
              }
              key={subtab}
            >
              <Button
                className='[&_.ant-btn-icon]:line-height-0'
                icon={icon}
                variant={active ? 'solid' : 'outlined'}
                color={active ? 'primary' : 'default'}
                onClick={() => {
                  if (subtab === hotStore.subtab) return
                  hotStore.subtab = subtab
                  // refresh?.(true) // 可以但没必要, 有 skeleton 有 Tab切换 的反馈
                  onRefresh()
                }}
              >
                {label}
              </Button>
            </AntdTooltip>
          )
        })}
      </Space.Compact>
    )
  }, [activeSubtab])

  return (
    <>
      {__internalHotSubUseDropdown ? dropdownMenu : tab}
      {children}
    </>
  )
}
