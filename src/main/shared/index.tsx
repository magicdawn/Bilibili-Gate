import { AppRoot } from '$components/AppRoot'
import { registerSettingsGmCommand } from '$components/RecHeader/modals'

export function setupForNoneHomepage() {
  setupAppRootForNoneHomepage()
  registerSettingsGmCommand()
}

export function setupAppRootForNoneHomepage() {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  root.render(<AppRoot injectGlobalStyle antdSetup />)
}

export function isInIframe() {
  try {
    return window.self !== window.top
  } catch (e) {
    // 跨域访问被阻止，默认认为在 iframe 中
    return true
  }
}
