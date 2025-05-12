import { baseDebug } from '$common'
import { useRefStateBox, type RefStateBox } from '$common/hooks/useRefState'
import { useRefresh } from '$components/RecGrid/useRefresh'
import { useCurrentUsingTab } from '$components/RecHeader/tab'
import { limitTwoLines, videoGrid, videoGridBiliFeed4 } from '$components/video-grid.module.scss'
import { useCardBorderCss } from '$components/VideoCard/card-border-css'
import { EApiType } from '$define/index.shared'
import { refreshForHome } from '$modules/rec-services'
import { range } from 'es-toolkit'
import { RecHeader } from '../RecHeader'
import { VideoCard } from '../VideoCard'
import type { ETab } from '$components/RecHeader/tab-enum'
import type { ServiceMap } from '$modules/rec-services/service-map'

const debug = baseDebug.extend('components:SectionRecommend')

export function SectionRecommend() {
  const tab = useDeferredValue(useCurrentUsingTab())
  const servicesRegistry = useRefStateBox<Partial<ServiceMap>>(() => ({}))
  return <TabContent key={tab} tab={tab} servicesRegistry={servicesRegistry} />
}

const TabContent = memo(function TabContent({
  tab,
  servicesRegistry,
}: {
  tab: ETab
  servicesRegistry: RefStateBox<Partial<ServiceMap>>
}) {
  const skeletonPlaceholders = useMemo(() => range(20).map(() => crypto.randomUUID()), [])

  const {
    refreshingBox,
    itemsBox,
    refresh,
    error: refreshError,
    showSkeleton,
  } = useRefresh({
    tab,
    debug,
    fetcher: refreshForHome,
    servicesRegistry,
  })

  const refreshing = refreshingBox.state
  const items = itemsBox.state

  const displaySkeleton = !items.length || refreshError || (refreshing && showSkeleton)

  const cardBorderCss = useCardBorderCss()

  return (
    <section data-area='推荐'>
      <RecHeader refreshing={refreshing} onRefresh={refresh} />
      <div className={clsx(videoGrid, limitTwoLines, videoGridBiliFeed4)} style={{ marginBottom: 30 }}>
        {displaySkeleton
          ? skeletonPlaceholders.map((id) => <VideoCard key={id} tab={tab} />)
          : items.map((item) => {
              return item.api === EApiType.Separator ? null : (
                <VideoCard key={item.uniqId} item={item} tab={tab} baseCss={cardBorderCss} />
              )
            })}
      </div>
    </section>
  )
})
