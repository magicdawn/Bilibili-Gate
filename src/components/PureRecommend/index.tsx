import { css } from '@emotion/react'
import { initGridExternalState, RecGrid, type GridExternalState } from '$components/RecGrid'
import { useGridDisplayModeChecker } from '$components/RecGrid/display-mode'
import { clsForTwoColumnModeAlign, clsTwoColumnModeWidth } from '$components/RecGrid/display-mode/two-column-mode'
import { GridSidebar } from '$components/RecGrid/sidebar'
import { OnRefreshContext } from '$components/RecGrid/useRefresh'
import { RecHeader, type RecHeaderRef } from '$components/RecHeader'
import { usePlainShortcutEnabled } from '$components/RecHeader/index.shared'
import { $headerHeight } from '$header'
import { useSettingsSnapshot } from '$modules/settings'

// two-column mode align 是否影响 sidebar
const TWO_COLUMN_MODE_ALIGN_APPLY_TO_SIDEBAR = false

export function PureRecommend() {
  const {
    grid: { twoColumnModeAlign },
  } = useSettingsSnapshot()
  const { usingTwoColumnMode } = useGridDisplayModeChecker()
  const shortcutEnabled = usePlainShortcutEnabled()

  const [gridExternalState, setGridExternalState] = useState<GridExternalState>(initGridExternalState)

  const recHeaderRef = useRef<RecHeaderRef>(null)
  const onScrollToTop = useMemoizedFn(() => recHeaderRef.current?.scrollToTop())

  const headerHeight = $headerHeight.use()
  const sidebarCss = useMemo(() => {
    return css`
      position: sticky;
      top: ${headerHeight + 55}px;
      /* 55: tabbar height, 20: bottom space */
      max-height: calc(100vh - ${headerHeight + 55 + 20}px);
    `
  }, [headerHeight])

  let clsFlexContainer: string | undefined
  let clsRecGridContainer: string | undefined
  let clsRecGrid: string | undefined
  if (TWO_COLUMN_MODE_ALIGN_APPLY_TO_SIDEBAR) {
    clsFlexContainer = clsx(
      'flex gap-x-25px',
      usingTwoColumnMode && clsForTwoColumnModeAlign(twoColumnModeAlign, 'flex'),
    )
    clsRecGridContainer = usingTwoColumnMode ? clsTwoColumnModeWidth : 'flex-1'
  } else {
    clsFlexContainer = clsx('flex gap-x-25px')
    clsRecGridContainer = 'flex-1'
    clsRecGrid = clsx(
      usingTwoColumnMode && [clsTwoColumnModeWidth, clsForTwoColumnModeAlign(twoColumnModeAlign, 'margin')],
    )
  }

  return (
    <OnRefreshContext.Provider value={gridExternalState.onRefresh}>
      <RecHeader
        ref={recHeaderRef}
        refreshing={gridExternalState.refreshing}
        onRefresh={gridExternalState.onRefresh}
        leftSlot={gridExternalState.tabbarView}
        shortcutEnabled={shortcutEnabled}
      />
      <div className={clsFlexContainer}>
        <GridSidebar sidebarView={gridExternalState.sidebarView} viewTab={gridExternalState.viewTab} css={sidebarCss} />
        <RecGrid
          containerClassName={clsRecGridContainer}
          className={clsRecGrid}
          shortcutEnabled={shortcutEnabled}
          infiniteScrollUseWindow
          onScrollToTop={onScrollToTop}
          onSyncExternalState={setGridExternalState}
        />
      </div>
    </OnRefreshContext.Provider>
  )
}
