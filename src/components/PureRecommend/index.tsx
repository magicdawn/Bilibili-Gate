import { css } from '@emotion/react'
import { initHeaderState, RecGrid, type HeaderState } from '$components/RecGrid'
import { RecHeader, type RecHeaderRef } from '$components/RecHeader'
import { usePlainShortcutEnabled } from '$components/RecHeader/index.shared'
import { useSettingsSnapshot } from '$modules/settings'

const narrowStyle = {
  grid: css`
    /* card=360 col-gap=16  */
    width: ${360 * 2 + 20}px;
    margin: 0 auto;
  `,
}

export function PureRecommend() {
  const { useNarrowMode } = useSettingsSnapshot() // 窄屏模式
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
        css={[useNarrowMode && narrowStyle.grid]}
        shortcutEnabled={shortcutEnabled}
        infiniteScrollUseWindow={true}
        onScrollToTop={onScrollToTop}
        onSyncHeaderState={setHeaderState}
      />
    </>
  )
}
