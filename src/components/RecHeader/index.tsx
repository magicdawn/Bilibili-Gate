import { APP_CLS_TAB_BAR, baseDebug } from '$common'
import { iconOnlyRoundButtonCss } from '$common/emotion-css'
import { useSizeExpression } from '$common/hooks/useResizeObserverExpression'
import { useSticky } from '$common/hooks/useSticky'
import { ModalSettingsHotkey } from '$components/ModalSettings'
import type { OnRefresh } from '$components/RecGrid/useRefresh'
import { OnRefreshContext } from '$components/RecGrid/useRefresh'
import { bgValue } from '$components/css-vars'
import { $headerHeight, $usingEvolevdHeader } from '$header'
import { useIsDarkMode } from '$modules/dark-mode'
import { IconForConfig } from '$modules/icon'
import { useSettingsSnapshot } from '$modules/settings'
import { isMac } from '$ua'
import { getElementOffset, shouldDisableShortcut } from '$utility/dom'
import { css } from '@emotion/react'
import { Button, Space } from 'antd'
import { size } from 'polished'
import { useSnapshot } from 'valtio'
import { AccessKeyManage } from '../AccessKeyManage'
import { RefreshButton } from './RefreshButton'
import { headerState } from './index.shared'
import { showModalFeed, showModalSettings } from './modals'
import { VideoSourceTab, useCurrentDisplayingTabKeys } from './tab'
import { ETab } from './tab-enum'

const debug = baseDebug.extend('RecHeader')

const S = {
  leftright: css`
    height: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
  `,
}

export type RecHeaderRef = {
  scroll: () => void
}

export const RecHeader = forwardRef<
  RecHeaderRef,
  {
    refreshing: boolean
    onRefresh: OnRefresh
    leftSlot?: ReactNode
    rightSlot?: ReactNode
  }
>(function RecHeader({ onRefresh, refreshing, leftSlot, rightSlot }, ref) {
  const { accessKey, pureRecommend, showModalFeedEntry, style } = useSettingsSnapshot()
  const { modalFeedVisible, modalSettingsVisible } = useSnapshot(headerState)

  useKeyPress(
    ['shift.comma'],
    (e) => {
      if (shouldDisableShortcut()) return
      headerState.modalSettingsVisible = !headerState.modalSettingsVisible
    },
    { exactMatch: true },
  )

  const [stickyRef, sticky] = useSticky<HTMLDivElement>()

  const scroll = useMemoizedFn(() => {
    if (!pureRecommend) return

    const container = stickyRef.current?.parentElement
    if (!container) return

    const rect = container.getBoundingClientRect()
    const headerHeight = $headerHeight.get()
    if (rect.top < headerHeight) {
      const yOffset = getElementOffset(container).top
      debug('[refresh:scroll] rect.top = %s, headerHeight = %s', rect.top, headerHeight)
      document.documentElement.scrollTop = yOffset - headerHeight + 2
    }
  })
  useImperativeHandle(ref, () => ({ scroll }))

  const headerHeight = $headerHeight.use()

  const showAccessKeyManage = useShouldShowAccessKeyManage()

  const usingEvolevdHeader = $usingEvolevdHeader.use()
  const dark = useIsDarkMode()
  const boxShadow = (() => {
    if (usingEvolevdHeader) {
      return dark ? 'rgba(0, 0, 0, 26%) 0px 2px 10px 1px' : 'rgba(0, 0, 0, 13%) 0 1px 10px 1px;'
    } else {
      return `0 2px 4px ${dark ? 'rgb(255 255 255 / 5%)' : 'rgb(0 0 0 / 8%)'}`
    }
  })()

  const expandToFullWidthCss = useExpandToFullWidthCss()

  return (
    <>
      <OnRefreshContext.Provider value={onRefresh}>
        <div
          ref={stickyRef}
          className={clsx('area-header-wrapper', { sticky })}
          css={
            pureRecommend &&
            style.pureRecommend.useStickyTabbar && [
              css`
                position: sticky;
                top: ${headerHeight - 1}px; // 有缝隙, 故 -1 px
                z-index: 1000;
                margin-bottom: 10px;
                transition:
                  background-color 0.3s ease-in-out,
                  box-shadow 0.3s ease-in-out,
                  margin-bottom 0.3s ease-in-out;
              `,
              sticky && [
                css`
                  border-bottom: 1px solid
                    oklch(from ${bgValue} calc(l + ${dark ? 0.15 : -0.15}) c h / 50%);
                  background-color: var(--bg1_float);
                  box-shadow: ${boxShadow};
                `,
                expandToFullWidthCss,
              ],
            ]
          }
        >
          <div
            className={APP_CLS_TAB_BAR}
            data-raw-class='area-header'
            css={css`
              position: relative;
              display: flex;
              flex-direction: row;
              justify-content: space-between;

              align-items: center;
              margin-bottom: 0;
              height: auto;
              column-gap: 20px; // gap between left & right
              padding-inline: 0;
              padding-block: 8px;
            `}
          >
            <div
              data-class-name='left'
              css={[
                S.leftright,
                css`
                  /* as item */
                  flex-shrink: 1;

                  /* as container */
                  flex-wrap: wrap;
                  row-gap: 8px;
                  column-gap: 15px;
                `,
              ]}
            >
              <VideoSourceTab onRefresh={onRefresh} />
              {leftSlot}
            </div>

            <div
              data-class-name='right'
              css={[
                S.leftright,
                css`
                  flex-shrink: 0;
                `,
              ]}
            >
              <Space size={'small'}>
                {rightSlot}

                {!accessKey && showAccessKeyManage && <AccessKeyManage style={{ marginLeft: 5 }} />}

                <Button onClick={showModalSettings} css={iconOnlyRoundButtonCss}>
                  <ModalSettingsHotkey />
                  <IconForConfig {...size(14)} />
                </Button>

                <RefreshButton
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  refreshHotkeyEnabled={!(modalSettingsVisible || modalFeedVisible)}
                />

                {showModalFeedEntry && (
                  <Button onClick={showModalFeed} className='gap-0'>
                    <span>查看更多</span>
                    <svg
                      css={css`
                        width: 12px;
                        height: 12px;
                        margin-left: 2px;
                      `}
                    >
                      <use href='#widget-arrow'></use>
                    </svg>
                  </Button>
                )}
              </Space>
            </div>
          </div>
        </div>
      </OnRefreshContext.Provider>
    </>
  )
})

/**
 * 使用如 margin-inline: -10px; padding-inline: 10px; 来扩展到全屏宽度
 */
function useExpandToFullWidthCss() {
  const { xScrolling, bodyWidth } = useSizeExpression<{ xScrolling: boolean; bodyWidth?: number }>(
    document.body,
    (entry) => {
      const width = entry.contentRect.width
      const xScrolling = !!(width && Math.round(width) > Math.round(window.innerWidth))
      if (!xScrolling) {
        return { xScrolling }
      } else {
        return { xScrolling, bodyWidth: width }
      }
    },
    () => ({ xScrolling: false }),
  )

  return useMemo(() => {
    if (!xScrolling) {
      // https://github.com/magicdawn/bilibili-gate/issues/120
      const scrollbarWidth = isMac ? '0px' : '20px'
      return css`
        margin-inline: calc((100% - 100vw + ${scrollbarWidth}) / 2);
        padding-inline: calc((100vw - ${scrollbarWidth} - 100%) / 2);
      `
    } else {
      const w = Math.floor(bodyWidth!)
      return css`
        margin-inline: calc((100% - ${w}px) / 2);
        padding-inline: calc((${w}px - 100%) / 2);
      `
    }
  }, [xScrolling, bodyWidth])
}

function useShouldShowAccessKeyManage() {
  const tabKeys = useCurrentDisplayingTabKeys()
  return tabKeys.includes(ETab.AppRecommend)
}
