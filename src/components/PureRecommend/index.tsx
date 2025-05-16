import { css } from '@emotion/react'
import { initHeaderState, RecGrid, type HeaderState } from '$components/RecGrid'
import { RecHeader, type RecHeaderRef } from '$components/RecHeader'
import { useHeaderState } from '$components/RecHeader/index.shared'
import { useSettingsSnapshot } from '$modules/settings'

const narrowStyle = {
  grid: css`
    /* card=360 col-gap=16  */
    width: ${360 * 2 + 20}px;
    margin: 0 auto;
  `,
}

export function PureRecommend() {
  // 窄屏模式
  const { useNarrowMode } = useSettingsSnapshot()
  // 是否已经打开 "查看更多" 即 ModalFeed
  const { modalFeedVisible, modalSettingsVisible } = useHeaderState()

  const recHeaderRef = useRef<RecHeaderRef>(null)
  const onScrollToTop = useMemoizedFn(() => {
    recHeaderRef.current?.scrollToTop()
  })
  const [headerState, setHeaderState] = useState<HeaderState>(initHeaderState)

  return (
    <>
      <RecHeader
        ref={recHeaderRef}
        refreshing={headerState.refreshing}
        onRefresh={headerState.onRefresh}
        leftSlot={headerState.extraInfo}
      />
      <RecGrid
        css={[useNarrowMode && narrowStyle.grid]}
        shortcutEnabled={!(modalFeedVisible || modalSettingsVisible)}
        infiniteScrollUseWindow={true}
        onScrollToTop={onScrollToTop}
        onSyncHeaderState={setHeaderState}
      />
    </>
  )
}
