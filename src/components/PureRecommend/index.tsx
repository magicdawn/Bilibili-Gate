import { initGridExternalState, RecGrid, type GridExternalState } from '$components/RecGrid'
import { useGridDisplayModeChecker } from '$components/RecGrid/display-mode'
import { clsTwoColumn, clsTwoColumnForAlign } from '$components/RecGrid/display-mode/two-column-mode'
import { OnRefreshContext } from '$components/RecGrid/useRefresh'
import { RecHeader, type RecHeaderRef } from '$components/RecHeader'
import { usePlainShortcutEnabled } from '$components/RecHeader/index.shared'
import { useSettingsSnapshot } from '$modules/settings'

export function PureRecommend() {
  const { usingTwoColumnMode } = useGridDisplayModeChecker()
  const {
    grid: { twoColumnModeAlign },
  } = useSettingsSnapshot()
  const shortcutEnabled = usePlainShortcutEnabled()
  const [gridExternalState, setGridExternalState] = useState<GridExternalState>(initGridExternalState)

  const recHeaderRef = useRef<RecHeaderRef>(null)
  const onScrollToTop = useMemoizedFn(() => {
    recHeaderRef.current?.scrollToTop()
  })

  return (
    <OnRefreshContext.Provider value={gridExternalState.onRefresh}>
      <RecHeader
        ref={recHeaderRef}
        refreshing={gridExternalState.refreshing}
        onRefresh={gridExternalState.onRefresh}
        leftSlot={gridExternalState.tabbarView}
        shortcutEnabled={shortcutEnabled}
      />
      <RecGrid
        className={clsx(usingTwoColumnMode && [clsTwoColumn, clsTwoColumnForAlign(twoColumnModeAlign)])}
        shortcutEnabled={shortcutEnabled}
        infiniteScrollUseWindow={true}
        onScrollToTop={onScrollToTop}
        onSyncExternalState={setGridExternalState}
      />
    </OnRefreshContext.Provider>
  )
}
