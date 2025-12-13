import { initHeaderState, RecGrid, type HeaderState } from '$components/RecGrid'
import { useGridDisplayModeChecker } from '$components/RecGrid/display-mode'
import { clsTwoColumn, clsTwoColumnForAlign } from '$components/RecGrid/display-mode/two-column-mode'
import { RecHeader, type RecHeaderRef } from '$components/RecHeader'
import { usePlainShortcutEnabled } from '$components/RecHeader/index.shared'
import { useSettingsSnapshot } from '$modules/settings'

export function PureRecommend() {
  const { usingTwoColumnMode } = useGridDisplayModeChecker()
  const {
    grid: { twoColumnModeAlign },
  } = useSettingsSnapshot()
  const shortcutEnabled = usePlainShortcutEnabled()
  const [headerState, setHeaderState] = useState<HeaderState>(initHeaderState)

  const recHeaderRef = useRef<RecHeaderRef>(null)
  const onScrollToTop = useMemoizedFn(() => {
    recHeaderRef.current?.scrollToTop()
  })

  return (
    <>
      <RecHeader
        ref={recHeaderRef}
        refreshing={headerState.refreshing}
        onRefresh={headerState.onRefresh}
        leftSlot={headerState.extraInfo}
        shortcutEnabled={shortcutEnabled}
      />
      <RecGrid
        className={clsx(usingTwoColumnMode && [clsTwoColumn, clsTwoColumnForAlign(twoColumnModeAlign)])}
        shortcutEnabled={shortcutEnabled}
        infiniteScrollUseWindow={true}
        onScrollToTop={onScrollToTop}
        onSyncHeaderState={setHeaderState}
      />
    </>
  )
}
