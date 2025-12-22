import { once } from 'es-toolkit'
import { proxy, useSnapshot } from 'valtio'
import { APP_CLS_ROOT, IN_BILIBILI_HOMEPAGE } from '$common'
import { AppRoot } from '$components/AppRoot'
import { ModalSettings } from '$components/ModalSettings'
import { ModalFeed } from '$components/Recommends/ModalFeed'
import { settings } from '$modules/settings'

export const modalsState = proxy({
  modalFeedVisible: false,
  modalSettingsVisible: false,
})

export function useModalsState() {
  return useSnapshot(modalsState)
}

export function toggleModalFeed() {
  if (modalsState.modalFeedVisible) {
    hideModalFeed()
  } else {
    showModalFeed()
  }
}
export function showModalFeed() {
  renderOnce()
  modalsState.modalFeedVisible = true
}
export function hideModalFeed() {
  modalsState.modalFeedVisible = false
}

/**
 * NOTE: side-effects
 * showModalFeed on load
 */
if (IN_BILIBILI_HOMEPAGE && settings.showModalFeedOnLoad) {
  setTimeout(showModalFeed)
}

export function toggleModalSettings() {
  if (modalsState.modalSettingsVisible) {
    hideModalSettings()
  } else {
    showModalSettings()
  }
}
export function showModalSettings() {
  renderOnce()
  modalsState.modalSettingsVisible = true
}
export function hideModalSettings() {
  modalsState.modalSettingsVisible = false
}

export function registerSettingsGmCommand() {
  GM.registerMenuCommand?.('⚙️ 设置', showModalSettings)
}

const renderOnce = once(function render() {
  const container = document.createElement('div')
  container.classList.add('modals-container', APP_CLS_ROOT)
  document.body.appendChild(container)
  const r = createRoot(container)
  r.render(
    <AppRoot>
      <ModalsContainer />
    </AppRoot>,
  )
})

function ModalsContainer() {
  const { modalFeedVisible, modalSettingsVisible } = useModalsState()
  return (
    <>
      <ModalFeed show={modalFeedVisible} onHide={hideModalFeed} />
      <ModalSettings show={modalSettingsVisible} onHide={hideModalSettings} />
    </>
  )
}
