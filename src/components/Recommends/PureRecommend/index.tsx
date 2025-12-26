import { css } from '@emotion/react'
import { RecGrid } from '$components/RecGrid'
import { useGridDisplayModeChecker } from '$components/RecGrid/display-mode'
import { clsForTwoColumnModeAlign, clsTwoColumnModeWidth } from '$components/RecGrid/display-mode/two-column-mode'
import { RecHeader, type RecHeaderRef } from '$components/RecHeader'
import { usePlainShortcutEnabled } from '$components/RecHeader/index.shared'
import { useDeferredTab } from '$components/RecHeader/tab'
import { RecSidebar } from '$components/RecSidebar'
import { ESidebarAlign } from '$enums'
import { $headerHeight } from '$header'
import { useSettingsSnapshot } from '$modules/settings'
import { RecSelfContext, useInitRecSelf } from '../rec.shared'

// two-column mode align 是否影响 sidebar
const TWO_COLUMN_MODE_ALIGN_APPLY_TO_SIDEBAR = false

export function PureRecommend() {
  const {
    grid: { twoColumnModeAlign },
    sidebarAlign,
  } = useSettingsSnapshot()
  const { usingTwoColumnMode } = useGridDisplayModeChecker()
  const shortcutEnabled = usePlainShortcutEnabled()

  const recContext = useInitRecSelf()
  const { tabbarView, sidebarView } = recContext.useStore()
  const { tab, direction } = useDeferredTab()

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
      sidebarAlign === ESidebarAlign.Right && 'flex-row-reverse',
      usingTwoColumnMode && clsForTwoColumnModeAlign(twoColumnModeAlign, 'flex'),
    )
    clsRecGridContainer = usingTwoColumnMode ? clsTwoColumnModeWidth : 'flex-1'
  } else {
    clsFlexContainer = clsx('flex gap-x-25px', sidebarAlign === ESidebarAlign.Right && 'flex-row-reverse')
    clsRecGridContainer = 'flex-1'
    clsRecGrid = clsx(
      usingTwoColumnMode && [clsTwoColumnModeWidth, clsForTwoColumnModeAlign(twoColumnModeAlign, 'margin')],
    )
  }

  return (
    <RecSelfContext.Provider value={recContext}>
      <RecHeader ref={recHeaderRef} leftSlot={tabbarView} shortcutEnabled={shortcutEnabled} />
      <div className={clsFlexContainer}>
        <RecSidebar css={sidebarCss} tab={tab} sidebarView={sidebarView} />
        <RecGrid
          key={tab}
          tab={tab}
          direction={direction}
          containerClassName={clsRecGridContainer}
          className={clsRecGrid}
          shortcutEnabled={shortcutEnabled}
          infiniteScrollUseWindow
          onScrollToTop={onScrollToTop}
        />
      </div>
    </RecSelfContext.Provider>
  )
}
