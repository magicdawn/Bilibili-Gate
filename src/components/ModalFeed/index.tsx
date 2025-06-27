import { css } from '@emotion/react'
import { BaseModal, BaseModalClassNames, ModalClose } from '$components/_base/BaseModal'
import { CollapseBtn } from '$components/_base/CollapseBtn'
import { primaryColorValue } from '$components/css-vars'
import { useModalDislikeVisible } from '$components/ModalDislike'
import { useModalMoveFavVisible } from '$components/ModalMoveFav'
import { CheckboxSettingItem } from '$components/ModalSettings/setting-item'
import { initHeaderState, RecGrid } from '$components/RecGrid'
import { OnRefreshContext } from '$components/RecGrid/useRefresh'
import { useHeaderState } from '$components/RecHeader/index.shared'
import { RefreshButton } from '$components/RecHeader/RefreshButton'
import { VideoSourceTab } from '$components/RecHeader/tab'
import { antMessage } from '$modules/antd'
import { useSettingsSnapshot } from '$modules/settings'
import type { HeaderState } from '$components/RecGrid'

const S = {
  modalMask: (narrowMode: boolean) =>
    narrowMode &&
    css`
      background-color: rgba(0, 0, 0, 0.9);
    `,

  modal: (narrowMode: boolean, fullScreenMode: boolean) => [
    css`
      width: calc(100vw - 30px);
      height: calc(100vh - 30px);
      max-height: unset;
      padding-right: 0; // 滚动条右移
    `,
    narrowMode &&
      css`
        width: ${325 * 2 + 40}px;
        height: calc(100vh - 10px);
      `,
    fullScreenMode &&
      css`
        width: 100vw;
        height: 100vh;
      `,
  ],
}

interface IProps {
  show: boolean
  onHide: () => void
}

export const ModalFeed = memo(function ModalFeed({ show, onHide }: IProps) {
  const scrollerRef = useRef<HTMLDivElement>(null)

  const {
    // 双列模式
    useNarrowMode,
    // 全屏模式
    modalFeedFullScreen,
  } = useSettingsSnapshot()

  const useFullScreen = !useNarrowMode && modalFeedFullScreen
  const modalBorderCss = useMemo(() => {
    const borderWidth = useFullScreen ? 5 : 1
    return css`
      border: ${borderWidth}px solid ${primaryColorValue};
    `
  }, [useFullScreen])

  const onScrollToTop = useMemoizedFn(() => {
    if (scrollerRef.current) {
      scrollerRef.current.scrollTop = 0
    }
  })

  const { modalSettingsVisible } = useHeaderState()
  const shortcutEnabled = [show, !modalSettingsVisible, !useModalDislikeVisible(), !useModalMoveFavVisible()].every(
    (x) => x,
  )

  const [headerState, setHeaderState] = useState<HeaderState>(initHeaderState)
  const renderHeader = () => {
    const { refreshing, onRefresh, extraInfo } = headerState
    return (
      <OnRefreshContext.Provider value={onRefresh}>
        <div className={clsx(BaseModalClassNames.modalHeader, 'pr-15px gap-x-15px')}>
          <div className='left flex flex-shrink-1 flex-wrap items-center gap-x-15px gap-y-4px'>
            <VideoSourceTab onRefresh={onRefresh} />
            {extraInfo}
          </div>
          <div className='right flex flex-shrink-0 items-center gap-x-8px'>
            {useNarrowMode ? null : (
              <CollapseBtn initialOpen>
                <ModalFeedConfigChecks />
              </CollapseBtn>
            )}
            <RefreshButton refreshing={refreshing} onRefresh={onRefresh} refreshHotkeyEnabled={shortcutEnabled} />
            <ModalClose onClick={onHide} className='ml-5px' />
          </div>
        </div>
      </OnRefreshContext.Provider>
    )
  }

  return (
    <BaseModal
      {...{ show, onHide }}
      cssModalMask={S.modalMask(useNarrowMode)}
      cssModal={[S.modal(useNarrowMode, useFullScreen), modalBorderCss]}
    >
      {renderHeader()}
      <div className={clsx(BaseModalClassNames.modalBody, 'pr-15px')} ref={scrollerRef}>
        <RecGrid
          shortcutEnabled={shortcutEnabled}
          onScrollToTop={onScrollToTop}
          infiniteScrollUseWindow={false}
          scrollerRef={scrollerRef}
          onSyncHeaderState={setHeaderState}
        />
      </div>
    </BaseModal>
  )
})

function ModalFeedConfigChecks() {
  return (
    <>
      <CheckboxSettingItem
        configPath={'showModalFeedOnLoad'}
        label='自动查看更多'
        tooltip='打开首页时默认打开推荐弹窗'
        extraAction={(val) => {
          if (val) {
            antMessage.success('已开启自动查看更多: 下次打开首页时将直接展示推荐弹窗')
          }
        }}
      />
      <CheckboxSettingItem configPath='modalFeedFullScreen' label='全屏' tooltip='世界清净了~' />
    </>
  )
}
