import { useCreation } from 'ahooks'
import { range } from 'es-toolkit'
import { baseDebug } from '$common'
import { RecGridSelf } from '$components/RecGrid'
import { useRefresh } from '$components/RecGrid/useRefresh'
import { limitTwoLines, videoGrid, videoGridBiliFeed4 } from '$components/RecGrid/video-grid.module.scss'
import { RecHeader } from '$components/RecHeader'
import { usePlainShortcutEnabled } from '$components/RecHeader/index.shared'
import { useDeferredTab } from '$components/RecHeader/tab'
import { VideoCard } from '$components/VideoCard'
import { useCardBorderCss } from '$components/VideoCard/card-border-css'
import { EApiType } from '$define/index.shared'
import { refreshForHome } from '$modules/rec-services'
import type { ETab } from '$components/RecHeader/tab-enum'
import { RecSelfContext, useInitRecSelf, useRecSelfContext } from '../rec.shared'

const debug = baseDebug.extend('components:SectionRecommend')

export function SectionRecommend() {
  const recSelf = useInitRecSelf()
  const { tab } = useDeferredTab()
  return (
    <RecSelfContext.Provider value={recSelf}>
      <TabContent key={tab} tab={tab} />
    </RecSelfContext.Provider>
  )
}

const TabContent = memo(function TabContent({ tab }: { tab: ETab }) {
  const skeletonPlaceholders = useMemo(() => range(20).map(() => crypto.randomUUID()), [])
  const self = useCreation(() => new RecGridSelf(), []) // 将就
  useRefresh({
    tab,
    debug,
    fetcher: refreshForHome,
    self,
  })
  const { items, refreshError, showSkeleton } = self.useStore()
  const { refreshing } = useRecSelfContext().useStore()
  const displaySkeleton = !items.length || refreshError || (refreshing && showSkeleton)
  const cardBorderCss = useCardBorderCss()
  const shortcutEnabled = usePlainShortcutEnabled()

  return (
    <section data-area='推荐'>
      <RecHeader shortcutEnabled={shortcutEnabled} />
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
