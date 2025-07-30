import { css } from '@emotion/react'
import { Button } from 'antd'
import { useUnoMerge } from 'unocss-merge/react'
import { APP_CLS_TAB_BAR, baseDebug } from '$common'
import { useSizeExpression } from '$common/hooks/useResizeObserverExpression'
import { useSticky } from '$common/hooks/useSticky'
import { ModalSettingsHotkey } from '$components/ModalSettings'
import { OnRefreshContext } from '$components/RecGrid/useRefresh'
import { ECardDisplay } from '$components/VideoCard/index.shared'
import { $headerHeight, $usingEvolevdHeader } from '$header'
import { AntdTooltip } from '$modules/antd/custom'
import { useIsDarkMode } from '$modules/dark-mode'
import { IconForConfig } from '$modules/icon'
import { MultiSelectButton } from '$modules/multi-select'
import { settings, useSettingsSnapshot } from '$modules/settings'
import { isMac, isSafari } from '$ua'
import { getElementOffset, shouldDisableShortcut } from '$utility/dom'
import type { OnRefresh } from '$components/RecGrid/useRefresh'
import type { CssProp } from '$utility/type'
import { AccessKeyManage } from '../AccessKeyManage'
import { showModalFeed, showModalSettings, toggleModalSettings } from './modals'
import { RefreshButton } from './RefreshButton'
import { useCurrentUsingTab, VideoSourceTab } from './tab'
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
    shortcutEnabled: boolean
    leftSlot?: ReactNode
    rightSlot?: ReactNode
  }
>(function RecHeader({ onRefresh, refreshing, leftSlot, rightSlot, shortcutEnabled }, ref) {
  const {
    accessKey,
    pureRecommend,
    showModalFeedEntry,
    style,
    multiSelect: { showIcon: multiSelectShowIcon },
    __internalShowGridListSwitcher,
  } = useSettingsSnapshot()
  const { cardDisplay, useStickyTabbar, stickyTabbarShadow } = style.pureRecommend // style sub

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
  const boxShadowCss = (() => {
    let val: string
    if (usingEvolevdHeader) {
      val = dark ? 'rgba(0, 0, 0, 26%) 0px 2px 10px 1px' : 'rgba(0, 0, 0, 13%) 0 1px 10px 1px;'
    } else {
      val = `0 2px 4px ${dark ? 'rgb(255 255 255 / 5%)' : 'rgb(0 0 0 / 8%)'}`
    }
    return css`
      box-shadow: ${val};
    `
  })()

  const expandToFullWidthCss = useExpandToFullWidthCss()

  const toggleCardDisplay = useMemoizedFn(() => {
    const list = [ECardDisplay.Grid, ECardDisplay.List]
    const index = list.indexOf(settings.style.pureRecommend.cardDisplay)
    const nextIndex = (index + 1) % list.length
    settings.style.pureRecommend.cardDisplay = list[nextIndex]
  })

  const _className = useUnoMerge(
    pureRecommend && useStickyTabbar && 'sticky z-gate-rec-header mb-10px b-b-1px b-b-transparent b-b-solid',
    pureRecommend && useStickyTabbar && sticky && String.raw`b-b-gate-bg-lv1 bg-[var(--bg1\_float)]`,
    sticky && 'sticky-state-on',
  )
  const _css: CssProp = useMemo(() => {
    if (!(pureRecommend && useStickyTabbar)) return
    const topCss = css`
      top: ${headerHeight - 1}px; // 有缝隙, 故 -1 px
    `
    const styles = [topCss]
    if (stickyTabbarShadow && sticky) styles.push(boxShadowCss, expandToFullWidthCss)
    return styles
  }, [pureRecommend, useStickyTabbar, stickyTabbarShadow, sticky, headerHeight, boxShadowCss, expandToFullWidthCss])

  return (
    <OnRefreshContext.Provider value={onRefresh}>
      <div ref={stickyRef} data-role='tab-bar-wrapper' className={_className} css={_css}>
        <div
          data-role='tab-bar'
          className={`${APP_CLS_TAB_BAR} relative mb-0 h-auto flex flex-row items-center justify-between gap-x-15px px-0 py-8px`}
        >
          <div data-class-name='left' className='h-full flex flex-shrink-1 flex-wrap items-center gap-x-15px gap-y-8px'>
            <VideoSourceTab onRefresh={onRefresh} />
            {leftSlot}
          </div>

          <div data-class-name='right' className='h-full flex flex-shrink-0 items-center gap-x-8px'>
            {rightSlot}

            {!accessKey && showAccessKeyManage && <AccessKeyManage style={{ marginLeft: 5 }} />}

            {__internalShowGridListSwitcher && (
              <AntdTooltip title='切换卡片显示模式' arrow={false}>
                <Button className='icon-only-round-button' onClick={toggleCardDisplay}>
                  {cardDisplay === ECardDisplay.Grid ? (
                    <IconTablerLayoutGrid className='size-14px cursor-pointer' />
                  ) : (
                    <IconTablerListDetails className='size-14px cursor-pointer' />
                  )}
                </Button>
              </AntdTooltip>
            )}

            {multiSelectShowIcon && <MultiSelectButton iconOnly addCopyActions />}

            <AntdTooltip title='设置' arrow={false}>
              <Button onClick={showModalSettings} className='icon-only-round-button'>
                <ModalSettingsHotkey />
                <IconForConfig className='size-14px' />
              </Button>
            </AntdTooltip>

            <RefreshButton refreshing={refreshing} onRefresh={onRefresh} refreshHotkeyEnabled={shortcutEnabled} />

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
      // https://github.com/magicdawn/Bilibili-Gate/issues/120
      const scrollbarWidth = isMac || isSafari ? '0px' : '20px'
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
  const tab = useCurrentUsingTab()
  return tab === ETab.AppRecommend
}
