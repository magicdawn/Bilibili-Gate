import { css } from '@emotion/react'
import { useSnapshot } from 'valtio'
import { RecGrid } from '$components/RecGrid'
import { useGridDisplayModeChecker } from '$components/RecGrid/display-mode'
import { clsForTwoColumnModeAlign, clsTwoColumnModeWidth } from '$components/RecGrid/display-mode/two-column-mode'
import { GridSidebar } from '$components/RecGrid/sidebar'
import { RecHeader, type RecHeaderRef } from '$components/RecHeader'
import { usePlainShortcutEnabled } from '$components/RecHeader/index.shared'
import { $headerHeight } from '$header'
import { useSettingsSnapshot } from '$modules/settings'
import { RecContext, useInitRecContextValue, useTabRelated } from '../rec.shared'

// two-column mode align 是否影响 sidebar
const TWO_COLUMN_MODE_ALIGN_APPLY_TO_SIDEBAR = false

export function PureRecommend() {
  const {
    grid: { twoColumnModeAlign },
  } = useSettingsSnapshot()
  const { usingTwoColumnMode } = useGridDisplayModeChecker()
  const shortcutEnabled = usePlainShortcutEnabled()

  const recContext = useInitRecContextValue()
  const { tabbarView, sidebarView } = useSnapshot(recContext.recStore)
  const { tab, direction } = useTabRelated()

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
    <RecContext.Provider value={recContext}>
      <RecHeader ref={recHeaderRef} leftSlot={tabbarView} shortcutEnabled={shortcutEnabled} />
      <div className={clsFlexContainer}>
        <GridSidebar css={sidebarCss} tab={tab} sidebarView={sidebarView} />
        <RecGrid
          containerClassName={clsRecGridContainer}
          className={clsRecGrid}
          shortcutEnabled={shortcutEnabled}
          infiniteScrollUseWindow
          onScrollToTop={onScrollToTop}
          tab={tab}
          direction={direction}
        />
      </div>
    </RecContext.Provider>
  )
}
