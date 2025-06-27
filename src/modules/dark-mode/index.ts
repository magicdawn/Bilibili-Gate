import { delay } from 'es-toolkit'
import { subscribe } from 'valtio'
import { appClsDark } from '$common/css-vars-export.module.scss'
import { poll } from '$utility/dom'
import { valtioFactory } from '$utility/valtio'

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
  getDetectEl: () => HTMLElement | null
  detect: (el: HTMLElement) => boolean
}
export const DarkModeConfig = {
  Evolved: {
    getDetectEl: () => document.body,
    detect: (el) => el.classList.contains('dark'),
    trigger: '.custom-navbar-item[role="listitem"][data-name="darkMode"]',
    triggerInner: '.navbar-dark-mode[item="darkMode"]',
  },
  Bili: {
    getDetectEl: () => document.querySelector<HTMLLinkElement>('#__css-map__'),
    detect: (el) => (el as HTMLLinkElement).href.includes('dark'),
    isTrigger: (el) => {
      const a = el.closest('.avatar-panel-popover a.single-link-item')
      if (!a) return false
      return !!Array.from(a.querySelectorAll('.link-title span')).find((span) =>
        ['深色', '浅色'].includes(span.textContent || ''),
      )
    },
  },
} as const satisfies Record<string, IConfigItem>

const detect = (item: IConfigItem): boolean => {
  const el = item.getDetectEl()
  if (!el) return false
  return item.detect(el)
}

const $darkMode = valtioFactory(() => {
  return (
    detect(DarkModeConfig.Bili) ||
    detect(DarkModeConfig.Evolved) ||
    document.body.classList.contains('bilibili-helper-dark-mode') ||
    document.documentElement.classList.contains('dark') // what's this, I don't remember
  )
})
export function useIsDarkMode() {
  return $darkMode.use()
}

const onDarkModeChange = () => {
  $darkMode.get()
    ? document.documentElement.classList.add(appClsDark)
    : document.documentElement.classList.remove(appClsDark)
}
onDarkModeChange()
subscribe($darkMode.state, onDarkModeChange)

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

deferBiliDefaultDetect()
async function deferBiliDefaultDetect() {
  // Q: why this
  // A: production build 运行的比官方脚本更快~
  const link = await poll(DarkModeConfig.Bili.getDetectEl)
  if (!link) return
  ob.observe(link, { attributes: true })
}

document.addEventListener('click', darkModeTriggerClickHandler, { passive: true })
async function darkModeTriggerClickHandler(e: MouseEvent) {
  const t = e.target as HTMLElement
  const isClickOnTrigger = DarkModeConfig.Bili.isTrigger(t) || t.closest(DarkModeConfig.Evolved.trigger)
  if (!isClickOnTrigger) return
  await delay(0)
  $darkMode.updateThrottled()
}

window.addEventListener('unload', () => {
  ob.disconnect()
  document.removeEventListener('click', darkModeTriggerClickHandler)
})
