/**
 * BILIBILI-Evolved header related
 */

import { useSettingsSnapshot } from '$modules/settings'
import { minmax } from '$utility/num'
import { valtioFactory } from '$utility/valtio'

const defaultHeader = () => document.querySelector('.bili-header__bar')

function isUsingCustomHeader() {
  const el = defaultHeader()
  return Boolean(el && globalThis.getComputedStyle(el).display === 'none')
}
export const $usingEvolevdHeader = valtioFactory(isUsingCustomHeader)

function calcHeaderHeight() {
  if (!isUsingCustomHeader()) return 64

  const fixed = document.body.classList.contains('fixed-navbar')
  if (!fixed) return 0

  const heightDef = document.documentElement.style.getPropertyValue('--navbar-height')
  if (!heightDef) return 50

  const height = Number(heightDef.replace('px', ''))
  if (Number.isNaN(height)) return 50
  return height
}
// prefix with $ 避免与普通变量冲突
export const $headerHeight = valtioFactory(calcHeaderHeight)

function calcHeaderWidth(): number | undefined {
  const paddingDef = document.documentElement.style.getPropertyValue('--navbar-bounds-padding')
  if (!paddingDef) return

  const percent = minmax(Number(paddingDef.replace('%', '')), 2, 10)
  const width = 100 - percent * 2
  return width
}
export const $headerWidth = valtioFactory(calcHeaderWidth)

/**
 * 处理 styleUseCustomGrid, 并且 bilibili-evolved padding 留的很小, back-to-top 与内容重叠的情况
 */
export function useBackToTopRight(): number | undefined {
  const width = $headerWidth.use()
  const {
    pureRecommend,
    grid: { useCustomGrid },
  } = useSettingsSnapshot()

  if (!pureRecommend || !useCustomGrid) return
  if (!width) return

  const rest = ((1 - width / 100) / 2) * window.innerWidth + /* padding */ 10
  const backToTopWidth = 40

  if (rest > backToTopWidth + /** default back-top-right */ 24 + /** visual padding */ 5) {
    return
  }

  if (rest < backToTopWidth) {
    return 0
  }

  const right = Math.floor((rest - backToTopWidth) / 2)
  return right
}

export const $evolvedThemeColor = valtioFactory(function calcEvolvedThemeColor() {
  return globalThis.getComputedStyle(document.documentElement).getPropertyValue('--theme-color')
})

function action() {
  $usingEvolevdHeader.updateThrottled()
  $headerHeight.updateThrottled()
  $headerWidth.updateThrottled()
  $evolvedThemeColor.updateThrottled()
}

const ob = new MutationObserver(() => action())
ob.observe(document.documentElement, {
  attributes: true,
  attributeFilter: ['style'],
})
ob.observe(document.body, {
  attributes: true,
  attributeFilter: ['class'],
})
window.addEventListener('unload', () => {
  ob.disconnect()
})

document.body.addEventListener(
  'click',
  (e) => {
    const el = e.target as HTMLElement
    // ensure click ok button
    const isClickOnButton = (el: HTMLElement | null) => !!el?.matches('.be-button.ok')
    if (!isClickOnButton(el) && !isClickOnButton(el.parentElement)) return

    // ensure click from be-popup
    if (!el.closest('.be-popup.picker.open')) return

    setTimeout($evolvedThemeColor.updateThrottled, 1000)
  },
  { capture: true, passive: true },
)
