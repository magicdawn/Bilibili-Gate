import { APP_CLS_TAB_BAR, baseDebug } from '$common'
import { zIndexRecHeader } from '$common/css-vars-export.module.scss'
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
import { CardDisplay, settings, useSettingsSnapshot } from '$modules/settings'
import { isMac } from '$ua'
import { getElementOffset, shouldDisableShortcut } from '$utility/dom'
import { css } from '@emotion/react'
import { Button } from 'antd'
import { size } from 'polished'
import { useSnapshot } from 'valtio'
import { AccessKeyManage } from '../AccessKeyManage'
import { RefreshButton } from './RefreshButton'
import { headerState } from './index.shared'
import { showModalFeed, showModalSettings, toggleModalSettings } from './modals'
import { VideoSourceTab, useCurrentDisplayingTabKeys } from './tab'
import { ETab } from './tab-enum'

const debug = baseDebug.extend('RecHeader')

export type RecHeaderRef = {
  scrollToTop: () => void
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

  // style sub
  const { cardDisplay, useStickyTabbar } = style.pureRecommend

  useKeyPress(
    ['shift.comma'],
    (e) => {
      if (shouldDisableShortcut()) return
      toggleModalSettings()
    },
    { exactMatch: true, useCapture: true },
  )

  const [stickyRef, sticky] = useSticky<HTMLDivElement>()

  const scrollToTop = useMemoizedFn(() => {
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
  useImperativeHandle(ref, () => ({ scrollToTop }))

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

  const toggleCardDisplay = useMemoizedFn(() => {
    const list = [CardDisplay.Grid, CardDisplay.List]
    const index = list.indexOf(settings.style.pureRecommend.cardDisplay)
    const nextIndex = (index + 1) % list.length
    settings.style.pureRecommend.cardDisplay = list[nextIndex]
  })

  return (
    <>
      <OnRefreshContext.Provider value={onRefresh}>
        <div
          ref={stickyRef}
          className={clsx('area-header-wrapper', { sticky })}
          css={
            pureRecommend &&
            useStickyTabbar && [
              css`
                position: sticky;
                top: ${headerHeight - 1}px; // 有缝隙, 故 -1 px
                z-index: ${zIndexRecHeader};
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
              className='flex-shrink-1 h-100% flex items-center flex-wrap gap-y-8px gap-x-15px'
            >
              <VideoSourceTab onRefresh={onRefresh} />
              {leftSlot}
            </div>

            <div
              data-class-name='right'
              className='h-100% flex-shrink-0 flex items-center gap-x-8px'
            >
              {rightSlot}

              {cardDisplay === CardDisplay.Grid ? (
                <IconTablerLayoutGrid
                  className='cursor-pointer size-20px'
                  onClick={toggleCardDisplay}
                />
              ) : (
                <IconTablerListDetails
                  className='cursor-pointer size-20px'
                  onClick={toggleCardDisplay}
                />
              )}

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
                  <span className='relative top-1px'>查看更多</span>
                  <IconParkOutlineRight />
                </Button>
              )}
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
