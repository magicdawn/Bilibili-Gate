import { css } from '@emotion/react'
import { useKeyPress, useMemoizedFn } from 'ahooks'
import { Button } from 'antd'
import clsx from 'clsx'
import { forwardRef, useImperativeHandle, useMemo, type ReactNode } from 'react'
import { useUnoMerge } from 'unocss-merge/react'
import { APP_CLS_TAB_BAR, baseDebug } from '$common'
import { useSizeExpression } from '$common/hooks/useResizeObserverExpression'
import { useSticky } from '$common/hooks/useSticky'
import { clsZRecHeader } from '$components/fragments'
import { ModalSettingsHotkey } from '$components/ModalSettings'
import { $headerHeight, $usingEvolevdHeader } from '$header'
import { AntdTooltip } from '$modules/antd/custom'
import { useIsDarkMode } from '$modules/dark-mode'
import { IconForConfig } from '$modules/icon'
import { MultiSelectButton } from '$modules/multi-select'
import { useSettingsSnapshot } from '$modules/settings'
import { isMac, isSafari } from '$ua'
import { getElementOffset, shouldDisableShortcut } from '$utility/dom'
import { AccessKeyManage } from '../AccessKeyManage'
import { showModalSettings, toggleModalSettings } from './modals'
import { RefreshButton } from './RefreshButton'
import { useCurrentUsingTab, VideoSourceTab } from './tab'
import { ETab } from './tab-enum'
import type { CssProp } from '$utility/type'

const debug = baseDebug.extend('RecHeader')

export type RecHeaderRef = {
  scrollToTop: () => void
}

export const RecHeader = forwardRef<
  RecHeaderRef,
  {
    shortcutEnabled: boolean
    leftSlot?: ReactNode
    rightSlot?: ReactNode
  }
>(function RecHeader({ leftSlot, rightSlot, shortcutEnabled }, ref) {
  const {
    pureRecommend,
    multiSelect: { showIcon: multiSelectShowIcon },
    style: {
      pureRecommend: { useStickyTabbar, stickyTabbarShadow, useWhiteBackground },
    },
  } = useSettingsSnapshot()

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
  const expandToFullWidthCss = useExpandToFullWidthCss()

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

  const wrapperClassName = useUnoMerge(
    pureRecommend &&
      useStickyTabbar && [
        'sticky  mb-10px b-b-1px b-b-transparent b-b-solid',
        clsZRecHeader,
        sticky && ['b-b-gate-bg-lv1', 'bg-gate-bg'],
      ],
    sticky && 'sticky-state-on',
  )
  const wrapperCss: CssProp = useMemo(() => {
    if (!(pureRecommend && useStickyTabbar)) return
    const topCss = css`
      top: ${headerHeight - 1}px; // 有缝隙, 故 -1 px
    `
    const arr = [topCss]
    if (stickyTabbarShadow && sticky) arr.push(boxShadowCss, expandToFullWidthCss)
    return arr
  }, [pureRecommend, useStickyTabbar, stickyTabbarShadow, sticky, headerHeight, boxShadowCss, expandToFullWidthCss])

  return (
    <div ref={stickyRef} data-role='tab-bar-wrapper' className={wrapperClassName} css={wrapperCss}>
      <div
        data-role='tab-bar'
        className={clsx(
          APP_CLS_TAB_BAR,
          'relative mb-0 h-auto flex flex-row items-center justify-between gap-x-15px px-0 py-8px',
        )}
      >
        <div data-class-name='left' className='h-full flex flex-wrap items-center gap-x-15px gap-y-8px'>
          <VideoSourceTab className='flex-none' />
          {leftSlot}
        </div>

        <div
          data-class-name='right'
          className='h-full min-w-180px flex flex-row-reverse flex-wrap items-center justify-right gap-x-8px gap-y-8px'
        >
          <RefreshButton refreshHotkeyEnabled={shortcutEnabled} />

          <AntdTooltip title='设置' arrow={false}>
            <Button onClick={showModalSettings} className='icon-only-round-button'>
              <ModalSettingsHotkey />
              <IconForConfig className='size-14px' />
            </Button>
          </AntdTooltip>

          {multiSelectShowIcon && <MultiSelectButton iconOnly addCopyActions />}

          {showAccessKeyManage && <AccessKeyManage style={{ marginLeft: 5 }} />}

          {rightSlot}
        </div>
      </div>
    </div>
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
  const { accessKey } = useSettingsSnapshot()
  const tab = useCurrentUsingTab()
  return !accessKey && [ETab.AppRecommend, ETab.Liked].includes(tab)
}
