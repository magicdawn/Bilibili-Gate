import { APP_CLS_ROOT, IN_BILIBILI_HOMEPAGE } from '$common'
import { AppRoot } from '$components/AppRoot'
import { ModalFeed } from '$components/ModalFeed'
import { ModalSettings } from '$components/ModalSettings'
import { settings } from '$modules/settings'
import { once } from 'es-toolkit'
import { headerState, useHeaderState } from './index.shared'

export function toggleModalFeed() {
  if (headerState.modalFeedVisible) {
    hideModalFeed()
  } else {
    showModalFeed()
  }
}
export function showModalFeed() {
  renderOnce()
  headerState.modalFeedVisible = true
}
export function hideModalFeed() {
  headerState.modalFeedVisible = false
}

/**
 * NOTE: side-effects
 * showModalFeed on load
 */
if (IN_BILIBILI_HOMEPAGE && settings.showModalFeedOnLoad) {
  setTimeout(showModalFeed)
}

export function toggleModalSettings() {
  if (headerState.modalSettingsVisible) {
    hideModalSettings()
  } else {
    showModalSettings()
  }
}
export function showModalSettings() {
  renderOnce()
  headerState.modalSettingsVisible = true
}
export function hideModalSettings() {
  headerState.modalSettingsVisible = false
}

export function registerSettingsGmCommand() {
  GM.registerMenuCommand?.('⚙️ 设置', showModalSettings)
}

const renderOnce = once(function render() {
  const container = document.createElement('div')
  container.classList.add('modals-container', APP_CLS_ROOT)
  document.body.append(container)
  const r = createRoot(container)
  r.render(
    <AppRoot>
      <ModalsContainer />
    </AppRoot>,
  )
})

function ModalsContainer() {
  const { modalFeedVisible, modalSettingsVisible } = useHeaderState()
  return (
    <>
      <ModalFeed show={modalFeedVisible} onHide={hideModalFeed} />
      <ModalSettings show={modalSettingsVisible} onHide={hideModalSettings} />
    </>
  )
}
