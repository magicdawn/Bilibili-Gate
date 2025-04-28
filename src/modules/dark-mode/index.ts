import { appClsDark } from '$common/css-vars-export.module.scss'
import { settings } from '$modules/settings'
import { shouldDisableShortcut } from '$utility/dom'
import { subscribeOnKeys, valtioFactory } from '$utility/valtio'
import { delay } from 'es-toolkit'
import { subscribe } from 'valtio'

/**
 * BILIBILI-Evolved dark mode:
 * detect: body.dark
 */

const $darkMode = valtioFactory(() => {
  return (
    document.body.classList.contains('dark') ||
    document.body.classList.contains('bilibili-helper-dark-mode') ||
    document.documentElement.classList.contains('dark')
  )

  // bilibili default dark style
  // <link id="__css-map__" rel="stylesheet" href="//s1.hdslb.com/bfs/seed/jinkela/short/bili-theme/dark.css">
  // !!document.querySelector('link[rel="stylesheet"][id="__css-map__"]')
  // parseCookie().theme_style === 'dark'
})

export function useIsDarkMode() {
  return $darkMode.use()
}

/**
 * color & bg-color 相关
 */

export const $colors = valtioFactory(() => {
  const bg = window.getComputedStyle(document.body).backgroundColor
  const c = window.getComputedStyle(document.body).color
  return { bg, c }
})

export function useColors() {
  return $colors.use()
}

// update
setTimeout($colors.updateThrottled, 2000) // when onload complete
// when dark mode change
const onDarkModeChange = () => {
  $colors.updateThrottled()
  $darkMode.get()
    ? document.documentElement.classList.add(appClsDark)
    : document.documentElement.classList.remove(appClsDark)
}
onDarkModeChange()
subscribe($darkMode.state, onDarkModeChange)
// when settings.styleUseWhiteBackground change
subscribeOnKeys(settings.style.pureRecommend, ['useWhiteBackground'], () => setTimeout($colors.updateThrottled, 500))

const ob = new MutationObserver(() => {
  setTimeout(() => {
    $darkMode.updateThrottled()
    setTimeout($colors.updateThrottled)
  })
})
ob.observe(document.body, {
  attributes: true,
  attributeFilter: ['class'],
})
ob.observe(document.documentElement, {
  attributes: true,
  attributeFilter: ['data-darkreader-scheme'],
})

document.addEventListener('click', evolvedDarkModeClickHandler, { passive: true })
async function evolvedDarkModeClickHandler(e: MouseEvent) {
  const t = e.target as HTMLElement

  if (!t.closest(EVOLVED_DARK_MODE_SELECTOR)) return
  await delay(0)
  $darkMode.updateThrottled()
  $colors.updateThrottled()
}

window.addEventListener('unload', () => {
  ob.disconnect()
  document.removeEventListener('click', evolvedDarkModeClickHandler)
})

const EVOLVED_DARK_MODE_SELECTOR = '.custom-navbar-item[role="listitem"][data-name="darkMode"]'
const EVOLVED_DARK_MODE_INNER_SELECTOR = '.navbar-dark-mode[item="darkMode"]'

function toggleEvolvedDarkMode() {
  document.querySelector<HTMLElement>(EVOLVED_DARK_MODE_INNER_SELECTOR)?.click()
}

export function useHotkeyForToggleEvolvedDarkMode() {
  return useKeyPress(
    ['shift.d', 'shift.h'], // shift + d 被什么 prevent 了
    () => {
      if (shouldDisableShortcut()) return
      toggleEvolvedDarkMode()
    },
    { exactMatch: true },
  )
}
