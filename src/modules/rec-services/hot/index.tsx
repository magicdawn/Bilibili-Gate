import { colorPrimaryValue } from '$components/css-vars'
import { useOnRefreshContext } from '$components/RecGrid/useRefresh'
import { EHotSubTab } from '$components/RecHeader/tab-enum'
import type { RecItemTypeOrSeparator } from '$define'
import { styled } from '$libs'
import type { AntMenuItem } from '$modules/antd'
import { AntdTooltip } from '$modules/antd/custom'
import { settings, useSettingsSnapshot } from '$modules/settings'
import { proxyWithGmStorage } from '$utility/valtio'
import { css } from '@emotion/react'
import { Button, Dropdown } from 'antd'
import type { ReactNode } from 'react'
import { useSnapshot } from 'valtio'
import type { IService } from '../_base'
import { BaseTabService, usePopupContainer } from '../_base'
import { PopularGeneralRecService } from './popular-general'
import { PopularWeeklyRecService } from './popular-weekly'
import { RankingRecService, rankingStore } from './ranking'

const subtabServiceCreators = {
  [EHotSubTab.PopularGeneral]: () =>
    new PopularGeneralRecService(settings.popularGeneralUseAnonymous),
  [EHotSubTab.PopularWeekly]: () => new PopularWeeklyRecService(settings.popularWeeklyUseShuffle),
  [EHotSubTab.Ranking]: () => new RankingRecService(rankingStore.slug),
} satisfies Record<EHotSubTab, () => IService>

// 是否是: 换一换
export function isHotTabUsingShuffle(shuffleForPopularWeekly?: boolean) {
  const { subtab } = hotStore
  shuffleForPopularWeekly ??= settings.popularWeeklyUseShuffle
  const change = subtab === EHotSubTab.PopularWeekly && shuffleForPopularWeekly
  return change
}

const imgOf = (src: string) => <img src={src} alt='' className='size-18px' />
const groupedButtonCss = css`
  .ant-btn-icon {
    line-height: 0;
  }
`

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
  [EHotSubTab.Ranking]: {
    // icon: <IconPark name='Ranking' size={15} />,
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

  override get usageInfo() {
    return <HotUsageInfo>{this.service.usageInfo}</HotUsageInfo>
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

function HotUsageInfo({ children }: { children?: ReactNode }) {
  const { subtab: activeSubtab } = useSnapshot(hotStore)
  const { icon, label } = HotSubTabConfig[activeSubtab]
  const onRefresh = useOnRefreshContext()
  const { ref, getPopupContainer } = usePopupContainer<HTMLButtonElement>()
  const { __internalHotSubUseDropdown } = useSettingsSnapshot()

  const menus: AntMenuItem[] = useMemo(
    () =>
      [EHotSubTab.PopularGeneral, EHotSubTab.PopularWeekly, EHotSubTab.Ranking]
        .map((subtab, index) => {
          const config = HotSubTabConfig[subtab]
          const active = subtab === activeSubtab
          return [
            index > 0 && { type: 'divider' as const },
            {
              key: subtab,
              label: (
                <span
                  css={[
                    active &&
                      css`
                        color: ${colorPrimaryValue};
                      `,
                  ]}
                >
                  {config.label}
                </span>
              ),
              icon: config.icon,
              onClick() {
                if (subtab === hotStore.subtab) return
                hotStore.subtab = subtab
                // onRefresh?.(true) // 可以但没必要, 有 skeleton 有 Tab切换 的反馈
                onRefresh?.()
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
      rootClassName={styled.createClass`
        .ant-dropdown-menu-item-divider {
          margin: 2px 0 !important;
        }
      `}
    >
      <Button ref={ref} className='w-114px gap-0 flex items-center justify-start pl-16px'>
        {icon}
        <span className='ml-8px'>{label}</span>
      </Button>
    </Dropdown>
  )

  const tab = useMemo(() => {
    return (
      <Button.Group>
        {[EHotSubTab.PopularGeneral, EHotSubTab.PopularWeekly, EHotSubTab.Ranking].map(
          (subtab, index) => {
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
                  css={groupedButtonCss}
                  icon={icon}
                  variant={active ? 'solid' : 'outlined'}
                  color={active ? 'primary' : 'default'}
                  onClick={() => {
                    if (subtab === hotStore.subtab) return
                    hotStore.subtab = subtab
                    // onRefresh?.(true) // 可以但没必要, 有 skeleton 有 Tab切换 的反馈
                    onRefresh?.()
                  }}
                >
                  {label}
                </Button>
              </AntdTooltip>
            )
          },
        )}
      </Button.Group>
    )
  }, [activeSubtab])

  return (
    <>
      {__internalHotSubUseDropdown ? dropdownMenu : tab}
      {children}
    </>
  )
}
