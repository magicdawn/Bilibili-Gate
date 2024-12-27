import { appClsDarkSelector } from '$common/css-vars-export.module.scss'
import { CheckboxSettingItem } from '$components/ModalSettings/setting-item'
import type { HeaderState } from '$components/RecGrid'
import { initHeaderState, RecGrid } from '$components/RecGrid'
import { OnRefreshContext } from '$components/RecGrid/useRefresh'
import { RefreshButton } from '$components/RecHeader/RefreshButton'
import { VideoSourceTab } from '$components/RecHeader/tab'
import { BaseModal, BaseModalStyle, ModalClose } from '$components/_base/BaseModal'
import { CollapseBtn } from '$components/_base/CollapseBtn'
import { colorPrimaryValue } from '$components/css-vars'
import { useSettingsSnapshot } from '$modules/settings'
import { antMessage } from '$utility/antd'
import { css } from '@emotion/react'

const S = {
  modalMask: (narrowMode: boolean) => [
    narrowMode &&
      css`
        background-color: rgba(0, 0, 0, 0.9);
      `,
  ],

  modal: (narrowMode: boolean, fullScreenMode: boolean) => [
    css`
      width: calc(100vw - 30px);
      height: calc(100vh - 30px);
      max-height: unset;
      padding-right: 0; // 滚动条右移
    `,
    narrowMode &&
      css`
        /* $card-width: 283px; */
        width: ${325 * 2 + 40}px;
        height: calc(100vh - 10px);

        border: none;
        :global(${appClsDarkSelector}) & {
          border: none;
        }
      `,
    fullScreenMode &&
      css`
        width: 100vw;
        height: 100vh;
      `,
  ],

  // 滚动条右移
  modalHeader: css`
    padding-right: 15px;
  `,
  modalBody: css`
    padding-right: 15px;
  `,

  btnRefresh: css`
    ${appClsDarkSelector} & {
      color: #eee !important;
      background-color: #333 !important;
      border-color: transparent !important;
      height: auto;
      padding: 8px 12px;
      line-height: 16px;
      font-size: 13px;
    }
  `,
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
      border: ${borderWidth}px solid ${colorPrimaryValue};
    `
  }, [useFullScreen])

  const onScrollToTop = useMemoizedFn(() => {
    if (scrollerRef.current) {
      scrollerRef.current.scrollTop = 0
    }
  })

  const [headerState, setHeaderState] = useState<HeaderState>(initHeaderState)
  const renderHeader = () => {
    const { refreshing, onRefresh, extraInfo } = headerState
    return (
      <OnRefreshContext.Provider value={onRefresh}>
        <div
          css={[
            BaseModalStyle.modalHeader,
            S.modalHeader,
            css`
              display: flex;
              align-items: center;
              justify-content: space-between;
              column-gap: 20px;
            `,
          ]}
        >
          <div
            className='left'
            css={css`
              flex-shrink: 1;
              display: flex;
              align-items: center;
              flex-wrap: wrap;
              row-gap: 4px;
              column-gap: 15px;
            `}
          >
            <VideoSourceTab onRefresh={onRefresh} />
            {extraInfo}
          </div>
          <div
            className='right'
            css={css`
              display: flex;
              align-items: center;
              flex-shrink: 0;
            `}
          >
            {useNarrowMode ? null : useFullScreen ? (
              <ModalFeedConfigChecks />
            ) : (
              <CollapseBtn initialOpen>
                <ModalFeedConfigChecks />
              </CollapseBtn>
            )}

            <RefreshButton
              css={css`
                ${S.btnRefresh}
                margin-left: 8px;
              `}
              refreshing={refreshing}
              onRefresh={onRefresh}
              refreshHotkeyEnabled={show}
            />

            <ModalClose onClick={onHide} />
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
      <div css={[BaseModalStyle.modalBody, S.modalBody]} ref={scrollerRef}>
        <RecGrid
          shortcutEnabled={show}
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
  const inModalFeedStyle = css`
    margin-left: 5px;
  `
  return (
    <>
      <CheckboxSettingItem
        configPath={'showModalFeedOnLoad'}
        label='自动查看更多'
        tooltip='打开首页时默认打开推荐弹窗'
        css={inModalFeedStyle}
        extraAction={(val) => {
          if (val) {
            antMessage.success('已开启自动查看更多: 下次打开首页时将直接展示推荐弹窗')
          }
        }}
      />

      <CheckboxSettingItem
        configPath='modalFeedFullScreen'
        label='全屏'
        tooltip='世界清净了~'
        css={inModalFeedStyle}
      />
    </>
  )
}
