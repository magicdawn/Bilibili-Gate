import { useMemoizedFn } from 'ahooks'
import { Button, Menu, Popover } from 'antd'
import clsx from 'clsx'
import { useMemo, useState, type MouseEvent, type ReactNode } from 'react'
import { snapshot, useSnapshot } from 'valtio'
import { REQUEST_FAIL_MSG } from '$common'
import { buttonOpenCss, usePopoverBorderColor } from '$common/emotion-css'
import { HelpInfo } from '$components/_base/HelpInfo'
import { useOnRefresh } from '$components/Recommends/rec.shared'
import { EApiType } from '$define/index.shared'
import { usePopupContainer } from '$modules/rec-services/_base'
import { useSettingsSnapshot } from '$modules/settings'
import { isWebApiSuccess, request } from '$request'
import toast from '$utility/toast'
import { QueueStrategy, type IService } from '../../_base'
import { defaultRankTab, ERankApiType, getRankTabRequestConfig, type IRankTab } from './rank-tab'
import { rankStore, updateRankTabs } from './store'
import type { RankItemExtend } from '$define'
import type { AntMenuItem } from '$modules/antd'
import type { RankItem } from './types'

export class RankRecService implements IService {
  loaded = false
  qs = new QueueStrategy<RankItemExtend>(20)
  tabbarView = (<RankTabbarView />)
  sidebarView = (<RankSidebarView />)

  constructor(private slug: string) {}

  get hasMore() {
    if (!this.loaded) return true
    return !!this.qs.bufferQueue.length
  }

  get rankTab() {
    return snapshot(rankStore).tabs.find((x) => x.slug === this.slug) || defaultRankTab
  }

  async loadMore(abortSignal: AbortSignal): Promise<RankItemExtend[] | undefined> {
    if (!this.hasMore) return

    if (!this.loaded) {
      await updateRankTabs()
      const { url, apiType } = getRankTabRequestConfig(this.rankTab)
      const res = await request.get(url, { signal: abortSignal })
      const json = res.data
      this.loaded = true

      if (!isWebApiSuccess(json)) {
        toast(json.message || REQUEST_FAIL_MSG)
        return
      }

      const list: RankItem[] = json?.data?.list || json?.result?.list || []
      const items: RankItemExtend[] = list.map((item, index) => {
        const rankingNo = index + 1
        return {
          ...item,
          api: EApiType.Rank,
          uniqId: `${EApiType.Rank}:${this.rankTab.slug}:rankingNo-${rankingNo}`,
          rankingNo,
          slug: this.rankTab.slug,
          rankTab: this.rankTab,
          from: apiType,
        }
      })

      this.qs.bufferQueue = items
    }

    return this.qs.sliceFromQueue()
  }
}

function useMenuItems() {
  const { tabs } = useSnapshot(rankStore)
  const { normalList, pgcList } = useMemo(() => {
    const listWithApiType = tabs.map((x) => ({ ...x, apiType: getRankTabRequestConfig(x).apiType }))
    const pgcList = listWithApiType.filter((x) => [ERankApiType.PgcSeason, ERankApiType.PgcWeb].includes(x.apiType))
    const normalList = listWithApiType.filter((x) => x.apiType === ERankApiType.Normal)
    return { normalList, pgcList }
  }, [tabs])
  return { normalList, pgcList }
}

function RankTabbarView() {
  const { enableSidebar } = useSettingsSnapshot()
  const { ref, getPopupContainer } = usePopupContainer()
  const onRefresh = useOnRefresh()
  const { slug, currentTab } = useSnapshot(rankStore)
  const { normalList, pgcList } = useMenuItems()

  const renderRankTabList = (list: IRankTab[], label: ReactNode, helpInfoContent?: ReactNode) => {
    if (!list.length) return null
    return (
      <div className='mt-15px max-w-350px first:mt-0'>
        <p className='mb-5px flex-v-center rounded-5px bg-gate-primary py-5px pl-6px text-white'>
          {label}
          {!!helpInfoContent && <HelpInfo>{helpInfoContent}</HelpInfo>}
        </p>
        <div className='grid grid-cols-4 gap-x-10px gap-y-8px px-2px'>
          {list.map((c) => {
            const active = c.slug === slug
            return (
              <Button
                key={c.slug}
                className={clsx({ 'b-gate-primary': active, 'color-gate-primary': active })}
                onClick={(e) => {
                  setPopoverOpen(false)
                  rankStore.slug = c.slug
                  onRefresh()
                }}
              >
                <span>{c.name}</span>
              </Button>
            )
          })}
        </div>
      </div>
    )
  }

  const handleDropdownButtonClick = useMemoizedFn((e: MouseEvent) => {
    const list = [...normalList, ...pgcList]
    if (!list.length) return
    const index = list.findIndex((x) => x.slug === slug)
    if (index === -1) return
    const offset = e.shiftKey ? -1 : 1
    const nextIndex = (index + offset + list.length) % list.length
    rankStore.slug = list[nextIndex].slug
    onRefresh()
  })

  const popoverContent = (
    <>
      {renderRankTabList(normalList, '视频')}
      {renderRankTabList(pgcList, 'PGC内容', '不能提供预览')}
    </>
  )
  const [popoverOpen, setPopoverOpen] = useState(false)
  const popover = (
    <Popover
      arrow={false}
      open={popoverOpen}
      onOpenChange={setPopoverOpen}
      placement='bottomLeft'
      getPopupContainer={getPopupContainer}
      content={popoverContent}
      styles={{ container: { border: `1px solid ${usePopoverBorderColor()}` } }}
    >
      <Button css={[popoverOpen && buttonOpenCss]} onClick={handleDropdownButtonClick} className='outline-none!'>
        {currentTab.name}
      </Button>
    </Popover>
  )

  if (enableSidebar) return undefined
  return <div ref={ref}>{popover}</div>
}

export function RankSidebarView() {
  const { slug } = useSnapshot(rankStore)
  const { normalList, pgcList } = useMenuItems()
  const onRefresh = useOnRefresh()

  const onSelect = useMemoizedFn((slug: string) => {
    rankStore.slug = slug
    onRefresh()
  })

  const menuItems = useMemo(() => {
    const groupNormal: AntMenuItem = {
      type: 'group',
      label: '视频',
      children: normalList.map((x) => ({
        key: x.slug,
        label: x.name,
        onClick: () => onSelect(x.slug),
      })),
    }
    const groupPgc: AntMenuItem = {
      type: 'group',
      label: 'PGC内容',
      children: pgcList.map((x) => ({
        key: x.slug,
        label: x.name,
        onClick: () => onSelect(x.slug),
      })),
    }
    return [groupNormal, groupPgc]
  }, [normalList, pgcList])

  return <Menu items={menuItems} selectedKeys={[slug]} mode='inline' inlineIndent={10} />
}
