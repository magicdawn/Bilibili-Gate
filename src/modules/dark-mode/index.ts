import { delay } from 'es-toolkit'
import { subscribe } from 'valtio'
import { appClsDark } from '$common/css-vars-export.module.scss'
import { settings } from '$modules/settings'
import { subscribeOnKeys, valtioFactory } from '$utility/valtio'

/**
 * using dark-mode?
 *  - bilibili default: window['__css-map__'].href
 *      - dark  https://s1.hdslb.com/bfs/seed/jinkela/short/bili-theme/dark.css
 *      - light https://s1.hdslb.com/bfs/seed/jinkela/short/bili-theme/light.css
 *  - BILIBILI-Evolved: `body.dark`
 */
type IConfigItem = {
  trigger?: string
  isTrigger?: (el: HTMLElement) => boolean
  triggerInner?: string
  detect: () => boolean
}
export const DarkModeConfig = {
  Evolved: {
    detect: () => document.body.classList.contains('dark'),
    trigger: '.custom-navbar-item[role="listitem"][data-name="darkMode"]',
    triggerInner: '.navbar-dark-mode[item="darkMode"]',
  },
  Bili: {
    detect: () => !!window['__css-map__']?.href.includes('dark'),
    isTrigger: (el) => {
      const a = el.closest('.avatar-panel-popover a.single-link-item')
      if (!a) return false
      return !!Array.from(a.querySelectorAll('.link-title span')).find((span) =>
        ['深色', '浅色'].includes(span.textContent || ''),
      )
    },
  },
} as const satisfies Record<string, IConfigItem>

const $darkMode = valtioFactory(() => {
  return (
    DarkModeConfig.Bili.detect() ||
    DarkModeConfig.Evolved.detect() ||
    document.body.classList.contains('bilibili-helper-dark-mode') ||
    document.documentElement.classList.contains('dark') // what's this, I don't remember
  )
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

setTimeout($colors.updateThrottled, 2000) // when onload complete
const onDarkModeChange = () => {
  $colors.updateThrottled()
  $darkMode.get()
    ? document.documentElement.classList.add(appClsDark)
    : document.documentElement.classList.remove(appClsDark)
}
onDarkModeChange()
subscribe($darkMode.state, onDarkModeChange)
subscribeOnKeys(settings.style.pureRecommend, ['useWhiteBackground'], () => setTimeout($colors.updateThrottled, 500))

const ob = new MutationObserver(async () => {
  await delay(0)
  $darkMode.updateThrottled()
})
ob.observe(document.body, {
  attributes: true,
  attributeFilter: ['class'],
})
ob.observe(document.documentElement, {
  attributes: true,
  attributeFilter: ['data-darkreader-scheme'],
})

document.addEventListener('click', darkModeTriggerClickHandler, { passive: true })
async function darkModeTriggerClickHandler(e: MouseEvent) {
  const t = e.target as HTMLElement
  const isClickOnTrigger = DarkModeConfig.Bili.isTrigger(t) || t.closest(DarkModeConfig.Evolved.trigger)
  if (!isClickOnTrigger) return
  await delay(0)
  $darkMode.updateThrottled()
  $colors.updateThrottled()
}

window.addEventListener('unload', () => {
  ob.disconnect()
  document.removeEventListener('click', darkModeTriggerClickHandler)
})
