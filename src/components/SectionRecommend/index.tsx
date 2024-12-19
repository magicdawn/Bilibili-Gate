import { APP_CLS_CARD, baseDebug } from '$common'
import { useRefStateBox } from '$common/hooks/useRefState'
import { useRefresh } from '$components/RecGrid/useRefresh'
import { useCurrentUsingTab } from '$components/RecHeader/tab'
import { useCardBorderCss } from '$components/VideoCard/card-border-css'
import { limitTwoLines, videoGrid, videoGridBiliFeed4 } from '$components/video-grid.module.scss'
import { EApiType } from '$define/index.shared'
import { refreshForHome } from '$modules/rec-services'
import type { ServiceMap } from '$modules/rec-services/service-map'
import { RecHeader } from '../RecHeader'
import { VideoCard } from '../VideoCard'

const debug = baseDebug.extend('components:SectionRecommend')

export function SectionRecommend() {
  const skeletonPlaceholders = useMemo(
    () => new Array(20).fill(0).map(() => crypto.randomUUID()),
    [],
  )

  const tab = useDeferredValue(useCurrentUsingTab())
  const existingServices = useRefStateBox<Partial<ServiceMap>>(() => ({}))
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
    existingServices,
  })
  useMount(() => refresh(true))

  const refreshing = refreshingBox.state
  const items = itemsBox.state

  const displaySkeleton = !items.length || refreshError || (refreshing && showSkeleton)

  const cardBorderCss = useCardBorderCss()

  return (
    <section data-area='推荐'>
      <RecHeader refreshing={refreshing} onRefresh={refresh} />
      <div
        className={clsx(videoGrid, limitTwoLines, videoGridBiliFeed4)}
        style={{ marginBottom: 30 }}
      >
        {displaySkeleton
          ? skeletonPlaceholders.map((id) => <VideoCard key={id} tab={tab} />)
          : items.map((item) => {
              return item.api === EApiType.Separator ? null : (
                <VideoCard
                  key={item.uniqId}
                  item={item}
                  tab={tab}
                  className={clsx(APP_CLS_CARD)}
                  baseCss={cardBorderCss}
                />
              )
            })}
      </div>
    </section>
  )
}
