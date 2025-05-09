import { REQUEST_FAIL_MSG } from '$common'
import { buttonOpenCss, usePopoverBorderColor } from '$common/emotion-css'
import { useOnRefreshContext } from '$components/RecGrid/useRefresh'
import { HelpInfo } from '$components/_base/HelpInfo'
import type { RankItemExtend } from '$define'
import { EApiType } from '$define/index.shared'
import { usePopupContainer } from '$modules/rec-services/_base'
import { isWebApiSuccess, request } from '$request'
import toast from '$utility/toast'
import { Button, Popover } from 'antd'
import { groupBy } from 'es-toolkit'
import type { ReactNode } from 'react'
import { snapshot, useSnapshot } from 'valtio'
import { QueueStrategy, type IService } from '../../_base'
import { defaultRankTab, ERankApiType, getRankTabRequestConfig, type IRankTab } from './rank-tab'
import { rankStore, updateRankTabs } from './store'
import type { RankItem } from './types'

export class RankRecService implements IService {
  loaded = false
  qs = new QueueStrategy<RankItemExtend>(20)
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
          uniqId: `${EApiType.Rank}-${this.rankTab.slug}-rankingNo:${rankingNo}`,
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

  get usageInfo() {
    return <RankUsageInfo />
  }
}

function RankUsageInfo() {
  const { ref, getPopupContainer } = usePopupContainer()
  const onRefresh = useOnRefreshContext()
  const { slug, currentTab, tabs } = useSnapshot(rankStore)
  const grouped = useMemo(() => groupBy(tabs, (t) => getRankTabRequestConfig(t).apiType), [tabs])

  const renderRankTabList = (label: ReactNode, list: IRankTab[]) => {
    list ||= []
    return (
      <div className='max-w-500px mt-15px pt-5px first:(mt-0 pt-0)'>
        <p className='flex-v-center mb-8px text-white bg-gate-primary py-5px pl-6px rounded-5px'>{label}</p>
        <div className='grid grid-cols-5 gap-y-8px  gap-x-12px px-2px'>
          {list.map((c) => {
            const active = c.slug === slug
            return (
              <Button
                key={c.slug}
                className={clsx({ 'b-gate-primary': active, 'color-gate-primary': active })}
                onClick={(e) => {
                  setPopoverOpen(false)
                  rankStore.slug = c.slug
                  onRefresh?.()
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

  const normalList = (grouped[ERankApiType.Normal] || []).filter((x) => !x.isExtra)
  const normalExtraList = (grouped[ERankApiType.Normal] || []).filter((x) => x.isExtra)
  const pgcList = [...(grouped[ERankApiType.PgcSeason] || []), ...(grouped[ERankApiType.PgcWeb] || [])]

  const popoverContent = (
    <>
      {renderRankTabList('视频', normalList)}
      {renderRankTabList(
        <>
          PGC内容 <HelpInfo>不能提供预览</HelpInfo>
        </>,
        pgcList,
      )}
      {renderRankTabList(
        <>
          更多 <HelpInfo>默认排行榜页没有列出的分区</HelpInfo>
        </>,
        normalExtraList,
      )}
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
      styles={{ body: { border: `1px solid ${usePopoverBorderColor()}` } }}
    >
      <Button css={[popoverOpen && buttonOpenCss]}>{currentTab.name}</Button>
    </Popover>
  )

  return <div ref={ref}>{popover}</div>
}
