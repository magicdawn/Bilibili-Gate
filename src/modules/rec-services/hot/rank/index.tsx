import { Button, Popover } from 'antd'
import { snapshot, useSnapshot } from 'valtio'
import { REQUEST_FAIL_MSG } from '$common'
import { buttonOpenCss, usePopoverBorderColor } from '$common/emotion-css'
import { HelpInfo } from '$components/_base/HelpInfo'
import { useOnRefreshContext } from '$components/RecGrid/useRefresh'
import { EApiType } from '$define/index.shared'
import { usePopupContainer } from '$modules/rec-services/_base'
import { isWebApiSuccess, request } from '$request'
import toast from '$utility/toast'
import type { RankItemExtend } from '$define'
import { QueueStrategy, type IService } from '../../_base'
import { defaultRankTab, ERankApiType, getRankTabRequestConfig, type IRankTab } from './rank-tab'
import { rankStore, updateRankTabs } from './store'
import type { RankItem } from './types'
import type { ReactNode } from 'react'

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

  const renderRankTabList = (list: IRankTab[], label: ReactNode, helpInfoContent?: ReactNode) => {
    if (!list.length) return null
    return (
      <div className='mt-15px max-w-500px pt-5px first:(mt-0 pt-0)'>
        <p className='mb-8px flex-v-center rounded-5px bg-gate-primary py-5px pl-6px text-white'>
          {label}
          {!!helpInfoContent && <HelpInfo>{helpInfoContent}</HelpInfo>}
        </p>
        <div className='grid grid-cols-5 gap-x-12px gap-y-8px px-2px'>
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

  const { normalList, pgcList } = useMemo(() => {
    const listWithApiType = tabs.map((x) => ({ ...x, apiType: getRankTabRequestConfig(x).apiType }))
    const pgcList = listWithApiType.filter((x) => [ERankApiType.PgcSeason, ERankApiType.PgcWeb].includes(x.apiType))
    const normalList = listWithApiType.filter((x) => x.apiType === ERankApiType.Normal)
    return { normalList, pgcList }
  }, [tabs])

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
      styles={{ body: { border: `1px solid ${usePopoverBorderColor()}` } }}
    >
      <Button css={[popoverOpen && buttonOpenCss]}>{currentTab.name}</Button>
    </Popover>
  )

  return <div ref={ref}>{popover}</div>
}
