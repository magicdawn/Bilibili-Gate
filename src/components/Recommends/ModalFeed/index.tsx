import { useSnapshot } from 'valtio'
import { BaseModal, BaseModalClassNames, ModalClose } from '$components/_base/BaseModal'
import { CollapseBtn } from '$components/_base/CollapseBtn'
import { useModalDislikeVisible } from '$components/ModalDislike'
import { useModalMoveFavVisible } from '$components/ModalMoveFav'
import { CheckboxSettingItem } from '$components/ModalSettings/setting-item'
import { RecGrid } from '$components/RecGrid'
import { gridDisplayModeChecker } from '$components/RecGrid/display-mode'
import { clsTwoColumnModeWidth } from '$components/RecGrid/display-mode/two-column-mode'
import { useModalsState } from '$components/RecHeader/modals'
import { RefreshButton } from '$components/RecHeader/RefreshButton'
import { useDeferredTab, VideoSourceTab } from '$components/RecHeader/tab'
import { RecSidebar } from '$components/RecSidebar'
import { EGridDisplayMode, ESidebarAlign } from '$enums'
import { antMessage } from '$modules/antd'
import { useSettingsSnapshot } from '$modules/settings'
import { RecContext, useInitRecContextValue } from '../rec.shared'

interface IProps {
  show: boolean
  onHide: () => void
}

/**
 * 懒得维护了, 太复杂的旧不弄了
 * two-column-mode: 基础支持, align 不管了, sidebar 不管了
 */
export const ModalFeed = memo(function ModalFeed({ show, onHide }: IProps) {
  const {
    grid: { gridDisplayMode },
    modalFeedFullScreen,
    sidebarAlign,
  } = useSettingsSnapshot()
  const { usingTwoColumnMode } = gridDisplayModeChecker(gridDisplayMode)
  const useFullScreen = !usingTwoColumnMode && modalFeedFullScreen
  const scrollerRef = useRef<HTMLDivElement>(null)

  const modalBorderCls = useMemo(() => {
    const borderWidth = useFullScreen ? 'b-5px' : 'b-1px'
    return clsx(borderWidth, 'b-gate-primary b-solid')
  }, [useFullScreen])

  const onScrollToTop = useMemoizedFn(() => {
    if (scrollerRef.current) {
      scrollerRef.current.scrollTop = 0
    }
  })

  const { modalSettingsVisible } = useModalsState()
  const shortcutEnabled = [show, !modalSettingsVisible, !useModalDislikeVisible(), !useModalMoveFavVisible()].every(
    Boolean,
  )

  const recContext = useInitRecContextValue(true)
  const { tabbarView, sidebarView } = useSnapshot(recContext.recStore)
  const { tab, direction } = useDeferredTab()

  const renderHeader = () => {
    return (
      <div className={clsx(BaseModalClassNames.modalHeader, 'gap-x-15px pr-15px')}>
        <div className='left flex flex-shrink-1 flex-wrap items-center gap-x-15px gap-y-4px'>
          <VideoSourceTab />
          {tabbarView}
        </div>
        <div className='right flex flex-shrink-0 items-center gap-x-8px'>
          {gridDisplayMode === EGridDisplayMode.TwoColumnGrid ? null : (
            <CollapseBtn initialOpen>
              <ModalFeedConfigChecks />
            </CollapseBtn>
          )}
          <RefreshButton refreshHotkeyEnabled={shortcutEnabled} />
          <ModalClose onClick={onHide} className='ml-5px' />
        </div>
      </div>
    )
  }

  const clsModalMask = clsx(usingTwoColumnMode && 'bg-black/90%') // why? I don't remember this
  const clsBase = 'h-[calc(100vh-30px)] max-h-unset w-[calc(100vw-30px)] pr-0' // pr-0 滚动条右移
  const clsFullScreen = 'h-full w-full'
  const clsModal = clsx(
    clsBase,
    useFullScreen && clsFullScreen,
    usingTwoColumnMode && clsTwoColumnModeWidth,
    modalBorderCls,
  )

  return (
    <RecContext.Provider value={recContext}>
      <BaseModal show={show} onHide={onHide} clsModalMask={clsModalMask} clsModal={clsModal}>
        {renderHeader()}
        <div
          data-role='modal-body'
          className={clsx(
            'flex flex-1 gap-x-25px overflow-hidden',
            sidebarAlign === ESidebarAlign.Right && 'flex-row-reverse',
          )}
        >
          <RecSidebar tab={tab} sidebarView={sidebarView} className='max-h-full' />
          <div className='h-full flex-1 overflow-y-scroll pr-15px' ref={scrollerRef}>
            <RecGrid
              key={tab}
              tab={tab}
              direction={direction}
              shortcutEnabled={shortcutEnabled}
              onScrollToTop={onScrollToTop}
              infiniteScrollUseWindow={false}
              scrollerRef={scrollerRef}
            />
          </div>
        </div>
      </BaseModal>
    </RecContext.Provider>
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
