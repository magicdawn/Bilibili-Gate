import { RecGrid, type RenderHeaderOptions } from '$components/RecGrid'
import { RecHeader, type RecHeaderRef } from '$components/RecHeader'
import { useHeaderState } from '$components/RecHeader/index.shared'
import { useSettingsSnapshot } from '$modules/settings'
import { css } from '@emotion/react'

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
    recHeaderRef.current?.scroll()
  })

  const renderHeader = useMemoizedFn(
    ({ refreshing, onRefresh, extraInfo }: RenderHeaderOptions) => {
      return (
        <RecHeader
          ref={recHeaderRef}
          refreshing={refreshing}
          onRefresh={onRefresh}
          leftSlot={extraInfo}
        />
      )
    },
  )

  return (
    <RecGrid
      renderHeader={renderHeader}
      css={[useNarrowMode && narrowStyle.grid]}
      shortcutEnabled={!(modalFeedVisible || modalSettingsVisible)}
      infiniteScrollUseWindow={true}
      onScrollToTop={onScrollToTop}
    />
  )
}
