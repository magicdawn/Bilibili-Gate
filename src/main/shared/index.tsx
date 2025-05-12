import { AppRoot } from '$components/AppRoot'
import { registerSettingsGmCommand } from '$components/RecHeader/modals'
import { once } from 'es-toolkit'

export function setupForNoneHomepage() {
  setupAppRootForNoneHomepage()
  registerSettingsGmCommand()
}

const _setupOnce = once(() => {
  const container = document.createElement('div')
  document.body.append(container)
  const root = createRoot(container)
  root.render(<AppRoot injectGlobalStyle antdSetup />)
})
export function setupAppRootForNoneHomepage() {
  _setupOnce()
}

export function isInIframe() {
  try {
    return window.self !== window.top
  } catch {
    // 跨域访问被阻止，默认认为在 iframe 中
    return true
  }
}
