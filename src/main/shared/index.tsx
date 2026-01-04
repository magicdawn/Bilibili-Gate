import { once } from 'es-toolkit'
import { createRoot } from 'react-dom/client'
import { AppRoot, SetupForPage } from '$components/AppRoot'
import { registerSettingsGmCommand } from '$components/RecHeader/modals'

export function setupForNoneHomepage() {
  setupAppRootForNoneHomepage()
  registerSettingsGmCommand()
}

const _setupOnce = once(() => {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  root.render(
    <AppRoot>
      <SetupForPage antd baseGlobalStyle />
    </AppRoot>,
  )
})
export function setupAppRootForNoneHomepage() {
  _setupOnce()
}

export function isInIframe() {
  try {
    return globalThis.self !== window.top
  } catch {
    // 跨域访问被阻止，默认认为在 iframe 中
    return true
  }
}
