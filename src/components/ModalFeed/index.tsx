import { BaseModal, BaseModalClassNames, ModalClose } from '$components/_base/BaseModal'
import { CollapseBtn } from '$components/_base/CollapseBtn'
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

  const modalBorderCls = useMemo(() => {
    const borderWidth = useFullScreen ? 'b-5px' : 'b-1px'
    return clsx(borderWidth, 'b-gate-primary b-solid')
  }, [useFullScreen])

  const onScrollToTop = useMemoizedFn(() => {
    if (scrollerRef.current) {
      scrollerRef.current.scrollTop = 0
    }
  })

  const { modalSettingsVisible } = useHeaderState()
  const shortcutEnabled = [show, !modalSettingsVisible, !useModalDislikeVisible(), !useModalMoveFavVisible()].every(
    Boolean,
  )

  const [headerState, setHeaderState] = useState<HeaderState>(initHeaderState)
  const renderHeader = () => {
    const { refreshing, onRefresh, extraInfo } = headerState
    return (
      <OnRefreshContext.Provider value={onRefresh}>
        <div className={clsx(BaseModalClassNames.modalHeader, 'gap-x-15px pr-15px')}>
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

  const clsModalMask = clsx({ 'bg-black/90%': useNarrowMode })

  // pr-0 滚动条右移
  const clsBase = 'h-[calc(100vh-30px)] max-h-unset w-[calc(100vw-30px)] pr-0'
  const clsNarrow = 'h-[calc(100vh-10px)] w-[calc(325*2+40px)]'
  const clsFullScreen = 'h-full w-full'
  const clsModal = clsx(clsBase, { [clsNarrow]: useNarrowMode, [clsFullScreen]: useFullScreen }, modalBorderCls)

  return (
    <BaseModal show={show} onHide={onHide} clsModalMask={clsModalMask} clsModal={clsModal}>
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
